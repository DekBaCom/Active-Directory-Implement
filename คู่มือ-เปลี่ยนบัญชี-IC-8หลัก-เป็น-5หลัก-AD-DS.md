# คู่มือ Implement: เปลี่ยนบัญชีผู้ใช้ IC System จาก 8 หลัก → 5 หลัก บน AD DS

> เอกสารนี้เป็น Runbook สำหรับทีม Infrastructure / Directory Services ในการเปลี่ยน **ชื่อบัญชีผู้ใช้ (account identifier)** ในรูปแบบ 8 หลัก ให้เป็น 5 หลัก บน Active Directory Domain Services โดยไม่กระทบสิทธิ์ กลุ่ม และข้อมูลเดิม

---

## 0. สรุปแนวคิดสำคัญ (อ่านก่อนเริ่ม)

ก่อนลงมือ ต้องเข้าใจ 3 เรื่องนี้ให้ชัด เพราะเป็นตัวกำหนดขอบเขตความเสี่ยงทั้งหมด:

**1) การ Rename ไม่เปลี่ยน `objectSID`**
เมื่อเปลี่ยน `sAMAccountName` / `UPN` / `CN` ของบัญชี ค่า `objectSID` และ `objectGUID` จะ **คงเดิม** ผลคือ:
- สิทธิ์ NTFS / File Share (ACL อ้างอิงจาก SID) → **ไม่หาย**
- สมาชิกภาพกลุ่ม (Group Membership) → **ไม่หาย** (AD อัปเดต reference ให้อัตโนมัติ)
- Mailbox / Exchange object → ยังผูกกับบัญชีเดิม
- Local user profile บนเครื่อง client (ผูกกับ SID ใน `ProfileList`) → **ไม่หาย**

**2) "เปลี่ยนชื่อบัญชี" ≠ "เปลี่ยนอีเมล"**
การเปลี่ยน `sAMAccountName` จาก 8 หลักเป็น 5 หลัก **ไม่ได้** เปลี่ยนอีเมลของผู้ใช้โดยอัตโนมัติ อีเมลจะเปลี่ยนก็ต่อเมื่อคุณ **ตั้งใจ** ไปแก้ `mail` / `proxyAddresses` หรือ UPN-based address เอง → ต้องตัดสินใจแต่แรกว่าจะแตะแค่ Login name หรือจะรวมอีเมลด้วย

**3) ตัวที่ "พัง" คือแอปที่เก็บ username เป็น string**
ระบบที่อ้างอิงผู้ใช้ด้วย SID จะไม่กระทบ แต่ระบบที่เก็บ `sAMAccountName`/UPN เป็นข้อความในฐานข้อมูลของตัวเอง (เช่น **IC System** เอง, ระบบ HR, VPN, แอป LOB) จะต้องได้รับการอัปเดตให้ตรงกัน → นี่คือหัวใจของงานฝั่ง Integration

---

## 1. Scope & Decision Matrix

ตัดสินใจให้ครบก่อน แล้วบันทึกเป็น baseline:

| Attribute | เปลี่ยนหรือไม่? | ผลกระทบถ้าเปลี่ยน |
|---|---|---|
| `sAMAccountName` (DOMAIN\ชื่อ) | **ใช่ (หลัก)** | Login แบบ legacy, แอปที่ bind ด้วย SAM |
| `userPrincipalName` (UPN) | ควรเปลี่ยนตาม | Login แบบ UPN, M365/Entra sign-in, Cert (SAN=UPN) |
| `CN` / `Name` (RDN) | เลือกได้ | DN เปลี่ยน, สคริปต์/รายงานที่ hardcode DN |
| `mail` / `proxyAddresses` | **แนะนำ: ไม่แตะ** | ถ้าเปลี่ยน = เปลี่ยนอีเมล → งานบานปลาย |
| `homeDirectory` / `profilePath` | เฉพาะที่ใช้ `%username%` | ต้องย้าย/เปลี่ยนชื่อโฟลเดอร์ตาม |
| `displayName` / ชื่อจริง | ปกติไม่แตะ | เป็นชื่อแสดงผล ไม่เกี่ยวกับ login |

> **คำแนะนำ:** ถ้าเป้าหมายคือ "แค่เปลี่ยน login account เป็น 5 หลัก" ให้เปลี่ยนเฉพาะ `sAMAccountName` + `UPN` (+ `CN` เพื่อความสอดคล้อง) และ **ไม่แตะอีเมล** จะลดความเสี่ยงลงมหาศาล

---

## 2. Phase 1 — Discovery & Inventory

**เป้าหมาย:** รู้ว่ามีบัญชีกี่ตัว, อยู่ OU ไหน, ผูกกับอะไรบ้าง

### 2.1 Export บัญชีปัจจุบัน
```powershell
$SearchBase = "OU=Users,DC=contoso,DC=local"   # ปรับตามจริง

Get-ADUser -Filter * -SearchBase $SearchBase -Properties `
    SamAccountName,UserPrincipalName,mail,DisplayName,DistinguishedName,`
    Enabled,homeDirectory,profilePath,proxyAddresses,whenChanged |
  Where-Object { $_.SamAccountName -match '^\d{8}$' } |   # เฉพาะ 8 หลัก
  Select-Object SamAccountName,UserPrincipalName,mail,DisplayName,`
    DistinguishedName,Enabled,homeDirectory,profilePath |
  Export-Csv .\01_current_users.csv -NoTypeInformation -Encoding UTF8
```

### 2.2 ตรวจ Dependency ที่ผูกกับบัญชี
สิ่งที่ต้องเช็คก่อนเปลี่ยน:
- **SPN** ที่ผูกกับ user account (`setspn -L <sam>`) — ถ้ามี ต้องระวัง Kerberos
- **Home folder / Roaming profile** ที่ path ใช้ชื่อบัญชี
- **Certificate** ที่ออกให้ (SAN = UPN) — ถ้าเปลี่ยน UPN cert เดิมจะใช้ logon ไม่ได้ (กระทบ Smart card / 802.1X)
- **บัญชีที่ถูกใช้เป็น Service account** — เปลี่ยนชื่อแล้วต้องอัปเดต service/scheduled task

---

## 3. Phase 2 — จัดทำ Mapping Table

**เป้าหมาย:** ตาราง old→new ที่ผ่านการตรวจสอบว่าไม่ชนกัน

### 3.1 โครงสร้างไฟล์ `mapping.csv`
```
OldSam,NewSam,DisplayName
81234567,10023,สมชาย ใจดี
80099881,10024,สมหญิง มั่นคง
```

### 3.2 ตรวจสอบ Conflict (สำคัญมาก — ห้ามข้าม)
```powershell
$map = Import-Csv .\mapping.csv -Encoding UTF8
$Domain = "contoso.local"

# (a) 5 หลักซ้ำกันเองในไฟล์ mapping
$dupInFile = $map | Group-Object NewSam | Where-Object Count -gt 1
if ($dupInFile) { Write-Warning "พบ NewSam ซ้ำในไฟล์:"; $dupInFile.Name }

# (b) 5 หลักไปชนกับบัญชีที่มีอยู่แล้วใน AD
foreach ($m in $map) {
    if (Get-ADUser -Filter "SamAccountName -eq '$($m.NewSam)'" -ErrorAction SilentlyContinue) {
        Write-Warning "NewSam '$($m.NewSam)' มีอยู่แล้วใน AD"
    }
    # (c) ความยาว/รูปแบบ 5 หลัก
    if ($m.NewSam -notmatch '^\d{5}$') { Write-Warning "รูปแบบผิด: $($m.NewSam)" }
}
```

**ข้อควรระวังเรื่อง uniqueness**
- `sAMAccountName` ต้อง unique ภายใน **domain** (จำกัด 20 ตัวอักษร — 5 หลักไม่มีปัญหา)
- `UPN` ต้อง unique ภายใน **forest**
- ถ้าเลข 5 หลักไปชน bindโครงสร้างเดิมใครสักคน ต้องมีนโยบายจัดการ (เช่น สำรอง prefix)

---

## 4. Phase 3 — Dependency & Integration Analysis (ฝั่ง IC System และระบบรอบข้าง)

นี่คือส่วนที่ตัดสินความสำเร็จ/ล้มเหลวของโปรเจกต์ ต้องรู้ว่าแต่ละระบบ **ผูกกับ AD ด้วยอะไร**

### 4.1 IC System เชื่อมกับ AD แบบไหน?
| วิธี Bind ของ IC System | ต้องทำอะไร |
|---|---|
| Map ผู้ใช้ด้วย **objectSID / objectGUID** | ไม่ต้องแก้ (SID คงเดิม) — ดีที่สุด |
| Lookup ด้วย **sAMAccountName / UPN** | ต้องอัปเดตตาราง user ของ IC System ให้ตรงชื่อใหม่ |
| เก็บ username เป็น **string ในฐานข้อมูลของตัวเอง** | ต้องรัน migration script ฝั่ง IC System โดยใช้ mapping ชุดเดียวกัน |
| SSO/SAML/OIDC โดยใช้ **UPN หรือ email เป็น NameID** | ถ้า NameID = UPN และเปลี่ยน UPN → ต้อง re-map; ถ้า = email และไม่แตะ email → ปลอดภัย |

> ก่อนวันเปลี่ยน ต้องยืนยันกับเจ้าของระบบ IC ว่าใช้ field ไหนเป็น key และมี migration plan ฝั่งแอปที่รันด้วย mapping.csv **ชุดเดียวกัน** ในเวลาใกล้เคียงกัน

### 4.2 ระบบรอบข้างอื่น ๆ (ทำ checklist กับเจ้าของระบบแต่ละตัว)
- **Exchange / M365 mailbox** — ถ้าไม่แตะ `mail`/`proxyAddresses` อีเมลไม่เปลี่ยน; แต่ถ้าเปลี่ยน UPN ผู้ใช้ต้อง sign-in M365 ด้วย UPN ใหม่
- **Entra ID / Hybrid (Entra Connect)** — sync anchor ปกติเป็น `objectGUID` (ไม่เปลี่ยน) จึงยัง match cloud object เดิม แต่การเปลี่ยน UPN จะ sync ขึ้น cloud → กระทบ cloud sign-in, Conditional Access, MFA registration
- **VPN / 802.1X / RADIUS (NPS)** — มักใช้ sAMAccountName/UPN → ต้องแจ้งผู้ใช้ล็อกอินใหม่
- **File servers / Home folder** — ACL ปลอดภัย (SID) แต่ path ที่มี `%username%` ต้องย้ายโฟลเดอร์ + อัปเดต `homeDirectory`
- **Certificate / PKI** — cert ที่ SAN=UPN ต้อง re-enroll หลังเปลี่ยน UPN
- **แอป LOB / HR / ERP อื่น ๆ** — ทำ inventory ว่าใครล็อกอินด้วยชื่อ AD

---

## 5. Phase 4 — Communication & Change Management

- ประกาศ **new login name (5 หลัก)** ให้ผู้ใช้แต่ละคน (ทาง email/HR ก่อนวันเปลี่ยน)
- แจ้ง Service Desk ให้เตรียม script "ล็อกอินไม่ได้" = ให้ใช้ชื่อใหม่
- ระบุ **Maintenance Window** ให้ผู้ใช้ logoff ทั้งหมด (บัญชีที่ active อยู่ระหว่างเปลี่ยนอาจต้อง logoff/logon ใหม่เพื่อ refresh Kerberos ticket & cached credentials)
- เตรียมเอกสาร "หลังเปลี่ยนต้องทำอะไร": logoff/logon, ล็อกอิน VPN ใหม่, ล็อกอิน M365 ใหม่ (ถ้าเปลี่ยน UPN)

---

## 6. Phase 5 — Pilot (บังคับทำ)

เลือก **5–10 บัญชีตัวแทน** ที่ครอบคลุมทุกลักษณะการใช้งาน (มี home folder, ใช้ VPN, ใช้ M365, ใช้ IC System, มี cert)
1. รันสคริปต์เปลี่ยนบน pilot
2. ทดสอบ: login domain, login M365, เข้า file share เดิม, เข้า IC System, VPN, อีเมลรับส่งปกติ
3. บันทึกปัญหา → ปรับ runbook → ค่อยขยายเป็น bulk

---

## 7. Phase 6 — Execution (Bulk Rename)

### 7.1 ลำดับการทำงานต่อ 1 บัญชี
1. เปลี่ยน `sAMAccountName`
2. เปลี่ยน `userPrincipalName`
3. (ถ้าต้องการ) เปลี่ยน `CN` ด้วย `Rename-ADObject`
4. (ถ้ามี home folder) ย้ายโฟลเดอร์ + อัปเดต attribute
5. Log ผลทุกขั้น

### 7.2 สคริปต์หลัก (มี -WhatIf / logging / try-catch)
```powershell
$map    = Import-Csv .\mapping.csv -Encoding UTF8
$Domain = "contoso.local"
$WhatIf = $true    # << ตั้ง $false เมื่อพร้อมรันจริง
$log    = New-Object System.Collections.Generic.List[object]

foreach ($m in $map) {
    $entry = [ordered]@{ OldSam=$m.OldSam; NewSam=$m.NewSam; Status=""; Time=(Get-Date) }
    try {
        $u = Get-ADUser -Filter "SamAccountName -eq '$($m.OldSam)'" -Properties UserPrincipalName
        if (-not $u) { throw "ไม่พบบัญชีเดิม" }

        $newUPN = "$($m.NewSam)@$Domain"

        Set-ADUser -Identity $u `
                   -SamAccountName $m.NewSam `
                   -UserPrincipalName $newUPN `
                   -WhatIf:$WhatIf -ErrorAction Stop

        # เปลี่ยน CN ให้สอดคล้อง (จะทำให้ DN เปลี่ยน)
        Rename-ADObject -Identity $u.DistinguishedName `
                        -NewName $m.NewSam `
                        -WhatIf:$WhatIf -ErrorAction Stop

        $entry.Status = "OK"
    }
    catch {
        $entry.Status = "ERROR: $($_.Exception.Message)"
    }
    $log.Add([pscustomobject]$entry)
}

$log | Export-Csv .\06_rename_log.csv -NoTypeInformation -Encoding UTF8
$log | Group-Object Status | Select Name,Count
```

> รันด้วย `$WhatIf = $true` ก่อนเสมอ ตรวจ log ให้ 100% แล้วค่อยตั้ง `$false`
> ควรรันจากเครื่องใกล้ DC (หรือ target ที่ PDC emulator) แล้ว `repadmin /syncall /AdeP` เพื่อเร่ง replication

### 7.3 (ถ้ามี) ย้าย Home folder
```powershell
foreach ($m in $map) {
    $old = "\\fs01\home\$($m.OldSam)"
    $new = "\\fs01\home\$($m.NewSam)"
    if (Test-Path $old) {
        Rename-Item -Path $old -NewName $m.NewSam
        Set-ADUser -Identity $m.NewSam -HomeDirectory $new -HomeDrive "H:"
    }
}
```
> ACL ภายในโฟลเดอร์ปลอดภัยเพราะอ้าง SID; แค่เปลี่ยนชื่อโฟลเดอร์ + attribute

---

## 8. Phase 7 — Validation หลังเปลี่ยน

Checklist ต่อบัญชี (อย่างน้อย sample + pilot ทั้งหมด):
- [ ] `Get-ADUser <NewSam>` เจอ และ `objectSID` เดิม (เทียบกับ inventory)
- [ ] Login domain ด้วย `DOMAIN\<5หลัก>` และ UPN ใหม่ได้
- [ ] เข้า File share / Home folder เดิมได้ (สิทธิ์ยังอยู่)
- [ ] สมาชิกกลุ่มครบเหมือนเดิม (`Get-ADPrincipalGroupMembership`)
- [ ] อีเมลรับ-ส่งปกติ (ถ้าไม่แตะ mail ต้องไม่เปลี่ยน)
- [ ] เข้า **IC System** ได้ด้วยบัญชีใหม่ (ยืนยันกับฝั่งแอปว่า migrate แล้ว)
- [ ] VPN / M365 sign-in (ถ้าเปลี่ยน UPN) ผ่าน
- [ ] Cert/Smart card (ถ้ามี) re-enroll แล้ว

```powershell
# ตัวอย่าง verify SID ไม่เปลี่ยน
$before = Import-Csv .\01_current_users.csv
foreach ($m in $map) {
    $u = Get-ADUser $m.NewSam -Properties objectSID
    "$($m.NewSam) SID=$($u.SID.Value)"
}
```

---

## 9. Phase 8 — Rollback Plan

**เงื่อนไข trigger rollback:** IC System login ล้มเหลวเป็นวงกว้าง / ผู้ใช้เข้าไม่ได้เกินเกณฑ์ที่รับได้

เพราะ SID ไม่เปลี่ยน การ rollback ทำได้ด้วยการเปลี่ยนชื่อกลับ (ใช้ mapping.csv สลับ column):
```powershell
$map = Import-Csv .\mapping.csv -Encoding UTF8
$Domain = "contoso.local"
foreach ($m in $map) {
    $u = Get-ADUser -Filter "SamAccountName -eq '$($m.NewSam)'"
    if ($u) {
        Set-ADUser $u -SamAccountName $m.OldSam -UserPrincipalName "$($m.OldSam)@$Domain"
        Rename-ADObject -Identity $u.DistinguishedName -NewName $m.OldSam
    }
}
```
> ต้องประสาน rollback ฝั่ง IC System พร้อมกัน มิฉะนั้น 2 ฝั่งจะไม่ตรงกัน
> เก็บ AD backup / System State ของ DC และ export ก่อนเปลี่ยน (`01_current_users.csv`) ไว้เสมอ

---

## 10. Runbook Checklist (สรุปวันดำเนินการ)

**ก่อนวัน D:**
- [ ] Scope & decision matrix อนุมัติแล้ว (แตะ SAM+UPN, ไม่แตะ email?)
- [ ] `mapping.csv` ตรวจ conflict ผ่าน 100%
- [ ] ยืนยัน binding method ของ IC System + migration plan ฝั่งแอป
- [ ] แจ้งผู้ใช้ + Service Desk + จอง Maintenance Window
- [ ] AD backup / System State + export inventory
- [ ] Pilot ผ่านครบทุกเคส

**วัน D (ใน Maintenance Window):**
- [ ] ยืนยันผู้ใช้ logoff
- [ ] รัน rename `$WhatIf=$true` → ตรวจ log → `$false` → รันจริง
- [ ] Force replication + ย้าย home folder (ถ้ามี)
- [ ] ทริกเกอร์/ยืนยัน migration ฝั่ง IC System
- [ ] (Hybrid) รัน Entra Connect sync + ตรวจ cloud
- [ ] Validation checklist

**หลังวัน D:**
- [ ] Monitor Service Desk 24–72 ชม.
- [ ] Re-enroll cert (ถ้ากระทบ)
- [ ] ปิดงาน + เก็บ log/mapping เป็นเอกสารอ้างอิง

---

### หมายเหตุ / สมมติฐานของเอกสารนี้
เอกสารนี้เขียนบนสมมติฐานว่า: เป็น on-prem AD DS, เปลี่ยนเฉพาะ login identifier (SAM/UPN) โดยไม่ตั้งใจเปลี่ยนอีเมล, และ "IC System" คือแอปพลิเคชันที่อ้างอิงบัญชี AD ผ่านชื่อผู้ใช้ ถ้าสภาพแวดล้อมจริงต่างจากนี้ (เช่น เป็น Hybrid เต็มรูปแบบ, มี Exchange on-prem, IC System bind ด้วยวิธีเฉพาะ, หรือมี Smart card logon จำนวนมาก) โปรดแจ้งเพื่อปรับ runbook ให้ตรงกับหน้างาน
