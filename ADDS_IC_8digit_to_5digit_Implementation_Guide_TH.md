# คู่มือ Implement การเปลี่ยนบัญชีผู้ใช้ IC System จาก 8 หลักเป็น 5 หลักบน AD DS

> สำหรับผู้เริ่มต้นดูแลระบบ Active Directory Domain Services (AD DS)  
> เวอร์ชันเอกสาร: 1.0  
> ตรวจสอบลิงก์อ้างอิงล่าสุด: 19 กรกฎาคม 2026

---

## 1. วัตถุประสงค์

เอกสารนี้อธิบายวิธีเปลี่ยนรหัสผู้ใช้ที่ IC System ใช้ จากรหัสเดิม 8 หลักเป็นรหัสใหม่ 5 หลัก เช่น

```text
รหัสเดิม: 12345678
รหัสใหม่: 01234
Domain:   COMPANY
```

แนวทางนี้เป็นแนวทางทั่วไปสำหรับระบบ IC ที่เชื่อมต่อกับ AD DS ผ่าน LDAP, Windows Authentication หรือ SSO รายละเอียดชื่อเมนูของ IC อาจแตกต่างตามผู้ผลิตและเวอร์ชันของระบบ

## 2. คำตอบแบบสรุป

โดยทั่วไป **ไม่ต้องติดตั้ง AD DS ใหม่ ไม่ต้องแก้ Schema และไม่ต้องสร้าง Domain ใหม่**

สิ่งที่ต้องทำคือ:

1. ตรวจสอบก่อนว่า IC ใช้ Attribute ใดเป็น Username
2. สร้างตาราง Mapping ระหว่างรหัสเดิม 8 หลักกับรหัสใหม่ 5 หลัก
3. ทดลองเปลี่ยนผู้ใช้เพียง 1 คนก่อน
4. ถ้า IC ใช้ `sAMAccountName` ให้เปลี่ยน `sAMAccountName` บนบัญชีเดิม
5. เปลี่ยน `userPrincipalName` หรือ UPN เฉพาะกรณีที่ IC ใช้ UPN หรือ SSO จริง
6. ทดสอบ AD Login, IC Login และระบบอื่นที่เกี่ยวข้อง
7. เมื่อ Pilot ผ่าน จึงค่อยเปลี่ยนผู้ใช้กลุ่มถัดไป

> [!IMPORTANT]
> **ห้ามลบบัญชี AD เดิมแล้วสร้างใหม่เพื่อให้ได้ Username ใหม่** เพราะบัญชีใหม่จะได้รับ SID ใหม่ สิทธิ์ที่ผูกกับ SID เดิมอาจไม่ติดตามมา ดูข้อมูลเรื่อง SID ได้ที่ [Microsoft Learn: Security identifiers](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers)

---

## 3. คำศัพท์ที่ต้องรู้

| คำศัพท์ | ความหมาย | ตัวอย่าง |
|---|---|---|
| `sAMAccountName` | ชื่อบัญชีแบบเดิมที่มักใช้กับรูปแบบ `DOMAIN\username` | `COMPANY\01234` |
| `userPrincipalName` หรือ UPN | ชื่อ Login แบบ Internet-style | `01234@company.com` |
| `CN` / Object Name | ชื่อ Object ที่แสดงในโครงสร้าง AD | `Somchai Jaidee` หรือ `12345678` |
| `SID` | รหัสประจำ Security Principal ที่ Windows ใช้กับสิทธิ์ | `S-1-5-21-...` |
| `ObjectGUID` | รหัสประจำ Object ใน AD | GUID ของบัญชีผู้ใช้ |
| LDAP Filter | เงื่อนไขที่ IC ใช้ค้นหาผู้ใช้ใน AD | `(sAMAccountName={0})` |
| NameID / Claim | ค่าที่ SAML SSO ส่งให้ Application เพื่อระบุผู้ใช้ | UPN, Email หรือ Attribute อื่น |

Microsoft อธิบายว่า `userPrincipalName`, `sAMAccountName`, `objectGUID` และ `objectSid` เป็น Attribute คนละตัวกัน ดู [Microsoft Learn: User Naming Attributes](https://learn.microsoft.com/en-us/windows/win32/ad/naming-properties)

รูปแบบ Login ที่พบบ่อย:

```text
COMPANY\01234       -> มักอาศัย sAMAccountName
01234@company.com   -> มักอาศัย userPrincipalName หรือ UPN
```

อ้างอิง: [Microsoft Learn: User Name Formats](https://learn.microsoft.com/en-us/windows/win32/secauthn/user-name-formats)

---

## 4. ตัดสินใจก่อนว่า AD DS ต้องแก้อะไร

ตรวจสอบหน้าตั้งค่า Authentication, LDAP, SSO หรือ User Mapping ของ IC

| สิ่งที่พบใน IC | สิ่งที่ควรทำ |
|---|---|
| IC มี User Database ของตัวเองและไม่ใช้ AD/LDAP | แก้ใน IC เท่านั้น โดยทั่วไปไม่ต้องแก้ AD |
| LDAP Filter มี `sAMAccountName` | เปลี่ยน `sAMAccountName` จาก 8 หลักเป็น 5 หลัก |
| LDAP Filter มี `userPrincipalName` | พิจารณาเปลี่ยน UPN หลังตรวจผลกระทบ Cloud/SSO |
| IC ใช้ SAML และ NameID มาจาก UPN | ปรับ UPN หรือปรับ Claim Mapping ตามแบบที่ออกแบบไว้ |
| IC ใช้ `employeeID` หรือ Attribute อื่น | แก้ Attribute นั้นหรือทำ Mapping ไม่จำเป็นต้องเปลี่ยนชื่อ AD Login |
| ไม่ทราบว่าใช้ค่าใด | ห้ามเปลี่ยนแบบจำนวนมาก ให้ตรวจ Configuration หรือสอบถามผู้ดูแล IC ก่อน |

ตัวอย่าง LDAP Filter ที่ใช้ `sAMAccountName`:

```text
(&(objectCategory=person)(objectClass=user)(sAMAccountName={0}))
```

ตัวอย่าง LDAP Filter ที่ใช้ UPN:

```text
(&(objectCategory=person)(objectClass=user)(userPrincipalName={0}))
```

กรณี SAML/SSO ให้ตรวจชื่อค่าในเมนู เช่น:

```text
Name identifier
NameID
Unique User Identifier
Attributes & Claims
Login claim
```

Microsoft Entra ID รองรับการกำหนด Source Attribute หรือ Transformation สำหรับ SAML NameID ดู [Microsoft Learn: Customize SAML token claims](https://learn.microsoft.com/en-us/entra/identity-platform/saml-claims-customization)

---

## 5. สิ่งที่ต้องเตรียมก่อนเริ่ม

### 5.1 Checklist

- [ ] มีผู้ดูแล IC หรือ Vendor ที่สามารถตรวจ Configuration ของ IC ได้
- [ ] มีสิทธิ์แก้ไขบัญชีผู้ใช้ใน AD
- [ ] มีเครื่องที่ติดตั้ง Active Directory Users and Computers หรือ RSAT
- [ ] มี Backup ของ Domain Controller ที่ใช้งานได้
- [ ] มีไฟล์ Mapping รหัสเดิมและรหัสใหม่
- [ ] ตรวจแล้วว่ารหัสใหม่ไม่ซ้ำ
- [ ] เลือก Pilot User ที่ไม่ใช่บัญชีสำคัญ 1 คน
- [ ] กำหนดแผน Rollback
- [ ] แจ้งผู้ใช้และผู้ดูแลระบบที่เกี่ยวข้อง
- [ ] ตรวจสอบว่าองค์กร Sync กับ Microsoft Entra ID/Microsoft 365 หรือไม่

Active Directory Users and Computers ใช้งานได้บน Windows Server หรือเครื่อง Client ที่ติดตั้งส่วนประกอบ AD DS/AD LDS ของ RSAT และบัญชีผู้ดำเนินการต้องมีสิทธิ์เหมาะสม ดู [Microsoft Learn: Manage user accounts with ADUC](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage-user-accounts-in-windows-server) และ [Microsoft Learn: Install RSAT](https://learn.microsoft.com/en-us/windows-server/administration/install-remote-server-administration-tools)

### 5.2 ห้ามใช้บัญชีเหล่านี้เป็น Pilot

- Domain Admin
- Enterprise Admin
- Administrator
- Service Account
- บัญชีที่ IC ใช้ Bind LDAP
- บัญชีที่ใช้ Run Windows Service
- บัญชีที่ใช้ Run Scheduled Task
- บัญชีฉุกเฉินหรือ Break-glass Account

### 5.3 ตัวอย่างไฟล์ Mapping

| Old account | New account | New UPN | หมายเหตุ |
|---|---|---|---|
| `12345678` | `01234` | เว้นว่าง | เปลี่ยนเฉพาะ sAMAccountName |
| `87654321` | `54321` | `54321@company.com` | เปลี่ยนทั้ง sAMAccountName และ UPN |

> [!WARNING]
> รหัสเช่น `01234` ต้องเก็บเป็น **ข้อความ (Text/String)** ห้ามเก็บเป็นตัวเลข มิฉะนั้นเลขศูนย์ด้านหน้าอาจหายและกลายเป็น `1234`

---

## 6. สำรองข้อมูลก่อนเปลี่ยน

### 6.1 Backup ระดับ Domain Controller

องค์กรควรมี Backup ของ Domain Controller ตามนโยบายอยู่แล้ว Microsoft มีขั้นตอนสำรอง System State ด้วย Windows Server Backup หรือ `wbadmin` ที่ [Microsoft Learn: Back up the System State data](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-backing-up-system-state)

ตัวอย่างคำสั่งจาก Microsoft สำหรับ System State Backup:

```bat
wbadmin start systemstatebackup -backuptarget:E:
```

ต้องเปลี่ยน `E:` ให้เป็นปลายทาง Backup ที่เหมาะสมกับระบบจริง และควรดำเนินการโดยผู้ดูแล Backup/AD

### 6.2 Export ค่าบัญชี Pilot ก่อนเปลี่ยน

เปิด **Windows PowerShell แบบ Run as administrator** แล้วใช้ตัวอย่างต่อไปนี้:

```powershell
Import-Module ActiveDirectory

$OldSam = '12345678'
$BackupFolder = 'C:\AD-Migration\Backup'

New-Item -Path $BackupFolder -ItemType Directory -Force | Out-Null

$User = Get-ADUser -Identity $OldSam `
    -Properties UserPrincipalName, SID, ObjectGUID, MemberOf,
                HomeDirectory, HomeDrive, ProfilePath, ScriptPath,
                DisplayName, Mail, EmployeeID

$User |
    Select-Object DistinguishedName,
                  SamAccountName,
                  UserPrincipalName,
                  SID,
                  ObjectGUID,
                  DisplayName,
                  Mail,
                  EmployeeID,
                  HomeDirectory,
                  HomeDrive,
                  ProfilePath,
                  ScriptPath |
    Export-Csv -Path "$BackupFolder\$OldSam-before.csv" `
               -NoTypeInformation `
               -Encoding UTF8

$User.MemberOf |
    Set-Content -Path "$BackupFolder\$OldSam-groups-before.txt" `
                -Encoding UTF8
```

ตรวจว่ามีไฟล์ต่อไปนี้จริงก่อนทำขั้นตอนถัดไป:

```text
C:\AD-Migration\Backup\12345678-before.csv
C:\AD-Migration\Backup\12345678-groups-before.txt
```

---

## 7. วิธีเปลี่ยนผู้ใช้ 1 คนด้วยหน้าจอ ADUC

วิธีนี้เหมาะสำหรับ Pilot และคนที่ยังไม่คุ้นกับ PowerShell

### 7.1 เปิด Active Directory Users and Computers

บน Windows Server:

```text
Server Manager
  -> Tools
  -> Active Directory Users and Computers
```

หรือกด `Windows + R` แล้วพิมพ์:

```text
dsa.msc
```

### 7.2 ค้นหาบัญชีเดิม

1. ค้นหา User `12345678`
2. คลิกขวาที่บัญชี
3. เลือก **Properties**
4. เปิดแท็บ **Account**

จะพบช่องสำคัญประมาณนี้:

```text
User logon name
User logon name (pre-Windows 2000)
```

### 7.3 กรณี IC ใช้ sAMAccountName

ค่าเดิม:

```text
User logon name:                     12345678@company.com
User logon name (pre-Windows 2000):  COMPANY\12345678
```

เปลี่ยนเฉพาะช่องล่างเป็น:

```text
User logon name (pre-Windows 2000):  COMPANY\01234
```

ให้ช่องบนคงเดิม:

```text
User logon name: 12345678@company.com
```

จากนั้นกด:

```text
Apply
OK
```

ผลที่คาดหวัง:

```text
Windows/LDAP Login แบบใหม่: COMPANY\01234
UPN เดิมยังคงเป็น:          12345678@company.com
Password เดิมยังคงเดิม
```

### 7.4 กรณี IC ใช้ UPN

เปลี่ยนทั้งสองช่องเป็น:

```text
User logon name:                     01234@company.com
User logon name (pre-Windows 2000):  COMPANY\01234
```

> [!CAUTION]
> ถ้า AD Sync กับ Microsoft Entra ID หรือ Microsoft 365 การเปลี่ยน UPN อาจกระทบชื่อ Cloud Sign-in, SSO และ Application ที่ใช้ UPN ระบุผู้ใช้ Microsoft แนะนำให้ทำ Pilot และมี Rollback Plan ดู [Microsoft Learn: Plan and troubleshoot UPN changes](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/howto-troubleshoot-upn-changes)

### 7.5 สิ่งที่ไม่ต้องเปลี่ยนโดยไม่มีเหตุผล

- Password
- Group Membership
- Display Name
- Email Address
- First Name / Last Name
- OU
- SID
- ObjectGUID
- CN หรือ Object Name ที่แสดงใน ADUC

การเปลี่ยน `sAMAccountName` ใช้คนละคำสั่งกับการ Rename ชื่อ Object Microsoft ระบุว่า `Rename-ADObject` เปลี่ยนชื่อ Object ส่วน SAM account name ให้แก้ด้วย `Set-ADUser` ดู [Microsoft Learn: Rename-ADObject](https://learn.microsoft.com/en-us/powershell/module/activedirectory/rename-adobject?view=windowsserver2025-ps)

---

## 8. วิธีเปลี่ยนผู้ใช้ 1 คนด้วย PowerShell

### 8.1 กำหนดข้อมูล

```powershell
Import-Module ActiveDirectory

$OldSam = '12345678'
$NewSam = '01234'
$ChangeUPN = $false
$NewUPN = '01234@company.com'
```

ใช้ Single Quote รอบรหัสเพื่อรักษาเลขศูนย์ด้านหน้า:

```powershell
$NewSam = '01234'
```

### 8.2 ตรวจสอบรูปแบบและค้นหาบัญชีเดิม

```powershell
if ($OldSam -notmatch '^\d{8}$') {
    throw "OldSam ต้องเป็นตัวเลข 8 หลัก: $OldSam"
}

if ($NewSam -notmatch '^\d{5}$') {
    throw "NewSam ต้องเป็นตัวเลข 5 หลัก: $NewSam"
}

$User = Get-ADUser -Identity $OldSam `
    -Properties UserPrincipalName, SID, ObjectGUID

$User |
    Select-Object SamAccountName, UserPrincipalName, SID, ObjectGUID
```

### 8.3 ตรวจว่ารหัสใหม่ไม่ซ้ำ

```powershell
$SamOwner = Get-ADUser -Filter "SamAccountName -eq '$NewSam'" `
    -Properties ObjectGUID

if ($SamOwner -and ([string]$SamOwner.ObjectGUID -ne [string]$User.ObjectGUID)) {
    throw "รหัสใหม่ $NewSam ถูกใช้โดยบัญชีอื่นแล้ว"
}
```

กรณีจะเปลี่ยน UPN ให้ตรวจ UPN ซ้ำด้วย:

```powershell
if ($ChangeUPN) {
    $UpnOwner = Get-ADUser -Filter "UserPrincipalName -eq '$NewUPN'" `
        -Properties ObjectGUID

    if ($UpnOwner -and ([string]$UpnOwner.ObjectGUID -ne [string]$User.ObjectGUID)) {
        throw "UPN ใหม่ $NewUPN ถูกใช้โดยบัญชีอื่นแล้ว"
    }
}
```

### 8.4 ทดลองด้วย WhatIf ก่อน

```powershell
$SetParams = @{
    Identity       = $User.DistinguishedName
    SamAccountName = $NewSam
}

if ($ChangeUPN) {
    $SetParams.UserPrincipalName = $NewUPN
}

Set-ADUser @SetParams -WhatIf
```

`-WhatIf` แสดงสิ่งที่คำสั่งจะทำ แต่ยังไม่แก้ข้อมูลจริง

### 8.5 แก้จริง

เมื่อตรวจผล `WhatIf` แล้วว่าถูกต้อง ให้รัน:

```powershell
Set-ADUser @SetParams
```

เอกสารคำสั่ง: [Microsoft Learn: Set-ADUser](https://learn.microsoft.com/en-us/powershell/module/activedirectory/set-aduser?view=windowsserver2025-ps)

### 8.6 ตรวจสอบหลังเปลี่ยน

ใช้ ObjectGUID เดิมค้นหาบัญชี เพื่อยืนยันว่าเป็น Object เดิม:

```powershell
$After = Get-ADUser -Identity $User.ObjectGUID `
    -Properties UserPrincipalName, SID, ObjectGUID

$After |
    Select-Object SamAccountName, UserPrincipalName, SID, ObjectGUID
```

ผลที่ต้องตรวจ:

```text
SamAccountName    = 01234
UserPrincipalName = ค่าเดิม หรือ UPN ใหม่ตามแผน
SID               = ตรงกับก่อนเปลี่ยน
ObjectGUID        = ตรงกับก่อนเปลี่ยน
```

---

## 9. สิ่งที่ต้องปรับใน IC System

การเปลี่ยน AD เพียงอย่างเดียวอาจยังไม่พอ ให้ตรวจรายการต่อไปนี้ใน IC

### 9.1 ช่องกรอก Username

ถ้า IC บังคับ 8 หลัก เช่น:

```regex
^\d{8}$
```

สำหรับระบบใหม่ 5 หลัก ให้เปลี่ยนเป็น:

```regex
^\d{5}$
```

ช่วง Migration ที่ต้องรองรับทั้งรหัสเก่าและใหม่ชั่วคราว อาจใช้:

```regex
^(?:\d{5}|\d{8})$
```

การแก้ Validation ต้องสอดคล้องกับแผน Security และต้องทดสอบก่อน Production

### 9.2 LDAP Search Attribute

ถ้า IC ใช้:

```text
(sAMAccountName={0})
```

หลังเปลี่ยน `sAMAccountName` ผู้ใช้ควร Login ด้วยรหัสใหม่ 5 หลัก

ถ้า IC ใช้:

```text
(userPrincipalName={0})
```

ผู้ใช้อาจต้อง Login ด้วย UPN เต็ม เช่น:

```text
01234@company.com
```

### 9.3 Internal User Table

ตรวจว่า IC มีตาราง User ภายในหรือไม่ และใช้ Username เป็นอะไร:

- Primary Key
- Foreign Key
- User Mapping
- Role Assignment
- Approval History
- Audit Log
- Workflow Owner

> [!WARNING]
> ห้ามแก้ฐานข้อมูล IC โดยตรง ถ้าไม่มีเอกสารหรือการรับรองจาก Vendor เพราะอาจทำให้ความสัมพันธ์ของข้อมูล สิทธิ์ หรือ Audit History เสียหาย ให้ใช้เมนู Migration, User Sync, LDAP Sync หรือ API ที่ผู้ผลิตรองรับ

### 9.4 SSO / SAML

ตรวจว่า NameID หรือ Claim ที่ส่งไป IC ใช้ค่าใด:

- `user.userprincipalname`
- Email
- Employee ID
- Extension Attribute
- Transformation

ถ้าต้องการให้ IC รับรหัส 5 หลักโดยไม่เปลี่ยน UPN อาจเลือกส่ง Attribute อื่นเป็น NameID ได้ แต่ต้องรองรับโดย IC และต้องออกแบบเรื่องความไม่ซ้ำ ความคงที่ และ Lifecycle ของค่าให้ชัดเจน

---

## 10. ขั้นตอนทดสอบ Pilot

### 10.1 ทดสอบ AD

- [ ] ค้นหาบัญชีด้วย `Get-ADUser` แล้วพบ User เดิม
- [ ] `sAMAccountName` เป็นรหัสใหม่ 5 หลัก
- [ ] SID ตรงกับก่อนเปลี่ยน
- [ ] ObjectGUID ตรงกับก่อนเปลี่ยน
- [ ] Group Membership ยังอยู่ครบ
- [ ] Password เดิมยังใช้งานได้

### 10.2 ทดสอบ Windows Login

กรณีเปลี่ยน `sAMAccountName`:

```text
COMPANY\01234
```

กรณีเปลี่ยน UPN ด้วย:

```text
01234@company.com
```

ควร Sign out แล้ว Sign in ใหม่ ไม่ควรทดสอบเฉพาะ Session ที่เปิดค้างไว้

### 10.3 ทดสอบ IC

- [ ] Login ด้วย `01234`
- [ ] สิทธิ์และ Role เดิมยังอยู่
- [ ] เห็นประวัติหรือรายการงานเดิม
- [ ] Approval Workflow ยังระบุผู้ใช้ถูกคน
- [ ] Logout/Login ซ้ำได้
- [ ] ไม่มี User ใหม่ซ้ำกับ User เดิม
- [ ] Audit Log บันทึกผู้ใช้ถูกต้อง

### 10.4 ทดสอบระบบอื่น

- [ ] Shared Folder
- [ ] Home Drive
- [ ] Printer
- [ ] VPN
- [ ] Remote Desktop
- [ ] Intranet
- [ ] ERP หรือ Application ภายใน
- [ ] Microsoft 365 กรณีเปลี่ยน UPN
- [ ] Scheduled Task
- [ ] Windows Service
- [ ] Script ที่อ้าง Username เดิมโดยตรง

### 10.5 ตรวจค่า Profile และ Path

ตรวจแท็บ Profile ใน ADUC หรือใช้ PowerShell ดูค่า:

```powershell
Get-ADUser -Identity '01234' `
    -Properties HomeDirectory, HomeDrive, ProfilePath, ScriptPath |
    Select-Object SamAccountName,
                  HomeDirectory,
                  HomeDrive,
                  ProfilePath,
                  ScriptPath
```

ตัวอย่างค่าที่อาจยังอ้างรหัสเดิม:

```text
Home folder:  \\fileserver\home\12345678
Profile path: \\fileserver\profiles\12345678
Logon script: 12345678.cmd
```

Path เหล่านี้ไม่จำเป็นต้องเปลี่ยนทันทีถ้ายังทำงานได้ แต่ต้องบันทึกไว้และทดสอบ ห้าม Rename โฟลเดอร์ Profile เช่น `C:\Users\12345678` ด้วยมือโดยไม่มีแผน Migration Profile ที่ถูกต้อง

### 10.6 ตรวจ AD Replication กรณีมีหลาย Domain Controller

```bat
repadmin /replsummary
```

ถ้าพบ Replication Error ควรแก้ก่อน Rollout จำนวนมาก ดู [Microsoft Learn: Troubleshooting Active Directory replication problems](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/troubleshoot/troubleshooting-active-directory-replication-problems)

---

## 11. ข้อควรระวังสำหรับ Laptop นอกบริษัท

Windows สามารถใช้ Cached Domain Logon เมื่อไม่สามารถติดต่อ Domain Controller ได้ รายละเอียดอยู่ที่ [Microsoft Learn: Cached domain logon information](https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/cached-domain-logon-information)

ดังนั้นควรเปลี่ยนบัญชีตอนที่ Laptop:

- อยู่ในสำนักงานและติดต่อ Domain Controller ได้ หรือ
- เชื่อม VPN ที่ติดต่อ Domain Controller ได้ก่อน Sign-in หรือ
- มี Local Administrator/ช่องทาง Recovery ที่ทดสอบแล้ว

หลังเปลี่ยน ควรให้ผู้ใช้ Sign in ด้วยชื่อใหม่ขณะที่เครื่องติดต่อ Domain Controller ได้อย่างน้อยหนึ่งครั้ง เพื่อให้การยืนยันตัวตนและข้อมูล Cache สอดคล้องกับชื่อใหม่

---

## 12. Rollback สำหรับผู้ใช้ 1 คน

### 12.1 เปลี่ยนเฉพาะ sAMAccountName กลับ

```powershell
$CurrentUser = Get-ADUser -Identity '01234'

Set-ADUser -Identity $CurrentUser.DistinguishedName `
    -SamAccountName '12345678'
```

### 12.2 เปลี่ยนทั้ง sAMAccountName และ UPN กลับ

ใช้ UPN เดิมจากไฟล์ Backup:

```powershell
$CurrentUser = Get-ADUser -Identity '01234'

Set-ADUser -Identity $CurrentUser.DistinguishedName `
    -SamAccountName '12345678' `
    -UserPrincipalName '12345678@company.com'
```

หลัง Rollback:

1. ตรวจ SID และ ObjectGUID
2. Sync User/LDAP ใน IC ใหม่
3. ทดสอบ Login ด้วยรหัสเดิม
4. ตรวจสิทธิ์และประวัติใน IC
5. บันทึกสาเหตุที่ Rollback

---

## 13. Rollout ผู้ใช้หลายคนด้วย CSV และ PowerShell

> [!IMPORTANT]
> ให้ทำส่วนนี้หลัง Pilot ผ่านแล้วเท่านั้น Script ด้านล่างเริ่มในโหมด Dry Run และจะไม่แก้จริงจนกว่าจะใส่ `-Apply`

### 13.1 สร้างไฟล์ CSV

ชื่อไฟล์ตัวอย่าง:

```text
C:\AD-Migration\ad-account-map.csv
```

เนื้อหา:

```csv
"OldSamAccountName","NewSamAccountName","NewUPN"
"12345678","01234",""
"87654321","54321","54321@company.com"
"11223344","00125",""
```

ความหมาย:

- `OldSamAccountName` ต้องเป็น 8 หลัก
- `NewSamAccountName` ต้องเป็น 5 หลัก
- `NewUPN` เว้นว่าง หมายถึงไม่เปลี่ยน UPN
- ใช้ Double Quote เพื่อช่วยรักษารหัสเป็นข้อความ
- ถ้าแก้ด้วย Excel ให้ตั้งคอลัมน์เป็น Text ก่อน และตรวจเลขศูนย์ด้านหน้าทุกครั้งก่อน Save

### 13.2 Script สำหรับ Dry Run และ Apply

บันทึกเป็น:

```text
C:\AD-Migration\Migrate-AdUserNames.ps1
```

```powershell
[CmdletBinding()]
param(
    [Parameter()]
    [string]$CsvPath = 'C:\AD-Migration\ad-account-map.csv',

    [Parameter()]
    [string]$OutputFolder = 'C:\AD-Migration\Output',

    [Parameter()]
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'
Import-Module ActiveDirectory -ErrorAction Stop

$Timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$RunFolder = Join-Path $OutputFolder $Timestamp
New-Item -Path $RunFolder -ItemType Directory -Force | Out-Null

if (-not (Test-Path -LiteralPath $CsvPath)) {
    throw "ไม่พบไฟล์ CSV: $CsvPath"
}

$Rows = Import-Csv -LiteralPath $CsvPath

if (-not $Rows) {
    throw 'ไฟล์ CSV ไม่มีข้อมูล'
}

$RequiredColumns = @(
    'OldSamAccountName',
    'NewSamAccountName',
    'NewUPN'
)

$ActualColumns = $Rows[0].PSObject.Properties.Name
foreach ($Column in $RequiredColumns) {
    if ($Column -notin $ActualColumns) {
        throw "CSV ไม่มีคอลัมน์ที่จำเป็น: $Column"
    }
}

$DuplicateOld = $Rows |
    Group-Object OldSamAccountName |
    Where-Object Count -gt 1

if ($DuplicateOld) {
    throw "CSV มี OldSamAccountName ซ้ำ: $($DuplicateOld.Name -join ', ')"
}

$DuplicateNew = $Rows |
    Group-Object NewSamAccountName |
    Where-Object Count -gt 1

if ($DuplicateNew) {
    throw "CSV มี NewSamAccountName ซ้ำ: $($DuplicateNew.Name -join ', ')"
}

$DuplicateNewUPN = $Rows |
    Where-Object {
        -not [string]::IsNullOrWhiteSpace([string]$_.NewUPN)
    } |
    Group-Object NewUPN |
    Where-Object Count -gt 1

if ($DuplicateNewUPN) {
    throw "CSV มี NewUPN ซ้ำ: $($DuplicateNewUPN.Name -join ', ')"
}

$BeforeFile = Join-Path $RunFolder 'before.csv'
$ResultFile = Join-Path $RunFolder 'result.csv'

$Results = foreach ($Row in $Rows) {
    $OldSam = [string]$Row.OldSamAccountName
    $NewSam = [string]$Row.NewSamAccountName
    $NewUPN = [string]$Row.NewUPN

    $Status = 'NotStarted'
    $Message = ''

    try {
        if ($OldSam -notmatch '^\d{8}$') {
            throw "OldSamAccountName ต้องเป็นตัวเลข 8 หลัก: $OldSam"
        }

        if ($NewSam -notmatch '^\d{5}$') {
            throw "NewSamAccountName ต้องเป็นตัวเลข 5 หลัก: $NewSam"
        }

        $User = Get-ADUser -Identity $OldSam `
            -Properties UserPrincipalName, SID, ObjectGUID,
                        DisplayName, Mail, EmployeeID,
                        HomeDirectory, HomeDrive, ProfilePath,
                        ScriptPath, MemberOf

        [pscustomobject]@{
            DistinguishedName = $User.DistinguishedName
            SamAccountName    = $User.SamAccountName
            UserPrincipalName = $User.UserPrincipalName
            SID               = [string]$User.SID
            ObjectGUID        = [string]$User.ObjectGUID
            DisplayName       = $User.DisplayName
            Mail              = $User.Mail
            EmployeeID        = $User.EmployeeID
            HomeDirectory     = $User.HomeDirectory
            HomeDrive         = $User.HomeDrive
            ProfilePath       = $User.ProfilePath
            ScriptPath        = $User.ScriptPath
            MemberOf          = $User.MemberOf -join ';'
        } | Export-Csv -Path $BeforeFile `
                       -Append `
                       -NoTypeInformation `
                       -Encoding UTF8

        $SamOwner = Get-ADUser -Filter "SamAccountName -eq '$NewSam'" `
            -Properties ObjectGUID

        if ($SamOwner -and ([string]$SamOwner.ObjectGUID -ne [string]$User.ObjectGUID)) {
            throw "NewSamAccountName ถูกใช้แล้ว: $NewSam"
        }

        if (-not [string]::IsNullOrWhiteSpace($NewUPN)) {
            $UpnOwner = Get-ADUser -Filter "UserPrincipalName -eq '$NewUPN'" `
                -Properties ObjectGUID

            if ($UpnOwner -and ([string]$UpnOwner.ObjectGUID -ne [string]$User.ObjectGUID)) {
                throw "NewUPN ถูกใช้แล้ว: $NewUPN"
            }
        }

        $SetParams = @{
            Identity       = $User.DistinguishedName
            SamAccountName = $NewSam
            ErrorAction    = 'Stop'
        }

        if (-not [string]::IsNullOrWhiteSpace($NewUPN)) {
            $SetParams.UserPrincipalName = $NewUPN
        }

        if ($Apply) {
            Set-ADUser @SetParams

            $After = Get-ADUser -Identity $User.ObjectGUID `
                -Properties UserPrincipalName, SID, ObjectGUID

            if ($After.SamAccountName -ne $NewSam) {
                throw 'ตรวจสอบหลังเปลี่ยนไม่ผ่าน: sAMAccountName ไม่ตรง'
            }

            if ([string]$After.SID -ne [string]$User.SID) {
                throw 'ตรวจสอบหลังเปลี่ยนไม่ผ่าน: SID เปลี่ยน'
            }

            if ([string]$After.ObjectGUID -ne [string]$User.ObjectGUID) {
                throw 'ตรวจสอบหลังเปลี่ยนไม่ผ่าน: ObjectGUID เปลี่ยน'
            }

            $Status = 'Changed'
            $Message = 'เปลี่ยนข้อมูลสำเร็จ'
        }
        else {
            Set-ADUser @SetParams -WhatIf
            $Status = 'DryRunPassed'
            $Message = 'ตรวจสอบผ่าน แต่ยังไม่ได้แก้จริง'
        }
    }
    catch {
        $Status = 'Failed'
        $Message = $_.Exception.Message
    }

    [pscustomobject]@{
        OldSamAccountName = $OldSam
        NewSamAccountName = $NewSam
        NewUPN            = $NewUPN
        Status            = $Status
        Message           = $Message
    }
}

$Results |
    Export-Csv -Path $ResultFile `
               -NoTypeInformation `
               -Encoding UTF8

$Results | Format-Table -AutoSize

Write-Host "Result: $ResultFile"
Write-Host "Backup: $BeforeFile"

if (-not $Apply) {
    Write-Warning 'นี่คือ Dry Run ยังไม่มีการแก้ AD ให้ตรวจ result.csv ก่อน แล้วจึงรันใหม่ด้วย -Apply'
}
```

### 13.3 รัน Dry Run

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

C:\AD-Migration\Migrate-AdUserNames.ps1
```

เปิดไฟล์ `result.csv` แล้วตรวจว่าทุกแถวเป็น:

```text
DryRunPassed
```

ถ้ามี `Failed` ต้องแก้สาเหตุก่อน ห้ามข้าม Error

### 13.4 รันแก้จริง

```powershell
C:\AD-Migration\Migrate-AdUserNames.ps1 -Apply
```

ตรวจ `result.csv` ว่าทุกแถวที่ต้องการเปลี่ยนเป็น:

```text
Changed
```

### 13.5 หลังรันแบบกลุ่ม

- [ ] ตรวจ AD Replication
- [ ] Sync IC/LDAP
- [ ] ทดสอบบัญชีตัวอย่างจากแต่ละหน่วยงาน
- [ ] ตรวจ Error Log ของ IC
- [ ] ตรวจ Helpdesk Ticket
- [ ] เก็บ CSV, Backup และ Result เป็นหลักฐาน
- [ ] ยังไม่ลบ Mapping เดิมจนกว่าจะพ้นระยะเฝ้าระวัง

---

## 14. แผน Rollout ที่แนะนำ

### Phase 0: Discovery

1. ระบุว่า IC ใช้ `sAMAccountName`, UPN, Employee ID หรือ SAML Claim
2. ระบุระบบอื่นที่ใช้ Username เดียวกัน
3. สร้าง Mapping และตรวจความซ้ำ
4. เตรียม Backup และ Rollback

### Phase 1: Pilot

1. เลือกผู้ใช้ทั่วไป 1 คน
2. Export ค่าก่อนเปลี่ยน
3. เปลี่ยนบัญชีเดิม
4. ทดสอบ AD, IC และระบบอื่น
5. เฝ้าดู Error และ Ticket

### Phase 2: Small Batch

1. เลือก 5-10 คนจากหลายหน่วยงาน
2. ใช้ Script ใน Dry Run
3. ตรวจผล
4. Apply
5. ทดสอบและประเมินผล

### Phase 3: Production Rollout

1. แบ่งเป็น Batch ที่ Rollback ได้
2. หลีกเลี่ยงการเปลี่ยนทั้งหมดพร้อมกัน
3. มีผู้ดูแล AD, IC, Network, Helpdesk และเจ้าของระบบพร้อม
4. เก็บ Log ทุก Batch

### Phase 4: Post-migration

1. ตรวจว่ารหัสเดิมไม่มีการใช้งานโดยไม่จำเป็น
2. ปรับเอกสาร Onboarding/Offboarding
3. ปรับระบบสร้างบัญชีอัตโนมัติ
4. ปรับ Validation และ Integration
5. เก็บ Mapping ตามนโยบาย Audit และ Data Protection

---

## 15. Change Record Template

```markdown
# AD/IC Account Migration Change Record

## Change information
- Change ID:
- วันที่/เวลา:
- ผู้ดำเนินการ:
- ผู้อนุมัติ:
- IC System owner:
- AD owner:

## Scope
- จำนวนผู้ใช้:
- Old format: 8 digits
- New format: 5 digits
- Attribute changed: sAMAccountName / UPN / Other

## Pre-check
- [ ] Backup verified
- [ ] Mapping verified
- [ ] Duplicate check passed
- [ ] Pilot passed
- [ ] Rollback tested

## Result
- Success:
- Failed:
- Rolled back:
- Incident/Ticket:

## Evidence
- Before CSV:
- Result CSV:
- IC log:
- AD replication check:
```

---

## 16. Troubleshooting แบบง่าย

| อาการ | สาเหตุที่เป็นไปได้ | สิ่งที่ตรวจ |
|---|---|---|
| Login IC ด้วยรหัสใหม่ไม่ได้ | IC ยัง Cache รหัสเดิม | Sync LDAP/User และตรวจ Log |
| Windows Login ใหม่ไม่ได้ | เครื่องไม่ถึง Domain Controller | ต่อ LAN/VPN และลองใหม่ |
| IC สร้าง User ใหม่ซ้ำ | IC Mapping ด้วย Username String | ตรวจ Internal User ID และ Vendor Migration |
| สิทธิ์ IC หาย | Role ผูกกับ Username เดิม | Restore Mapping/Role จาก Backup |
| Shared Folder เข้าไม่ได้ | Script/Path ใช้ Username เดิมโดยตรง | ตรวจ Logon Script, Home Path และ ACL |
| Microsoft 365 Login เปลี่ยน | เปลี่ยน UPN และมี Entra Sync | ตรวจ UPN Sync และแจ้งชื่อ Login ใหม่ |
| บาง Site ใช้ชื่อเก่า | AD Replication ยังไม่ครบ | ตรวจ `repadmin /replsummary` |
| รหัส `01234` กลายเป็น `1234` | CSV/Excel ตีความเป็นตัวเลข | ตั้งคอลัมน์เป็น Text และสร้าง CSV ใหม่ |

---

## 17. เกณฑ์ Go / No-Go

### Go

ดำเนินการ Batch ถัดไปเมื่อ:

- Pilot Login AD และ IC ผ่าน
- SID และ ObjectGUID คงเดิม
- Role และประวัติใน IC ยังอยู่
- AD Replication ปกติ
- ไม่มีระบบสำคัญล้มเหลว
- Rollback ทำงานได้

### No-Go

หยุด Rollout เมื่อ:

- ยังไม่รู้ว่า IC ใช้ Attribute ใด
- พบ Username ใหม่ซ้ำ
- IC สร้างผู้ใช้ซ้ำ
- Role หรือ Audit History หาย
- AD Replication มี Error
- UPN เปลี่ยนแล้ว Cloud/SSO มีปัญหา
- ไม่มี Backup หรือ Rollback ที่ตรวจสอบแล้ว

---

## 18. สรุป Implementation ที่แนะนำ

สำหรับกรณีทั่วไปที่ IC ใช้ LDAP Filter แบบนี้:

```text
(sAMAccountName={0})
```

ให้ดำเนินการดังนี้:

```text
1. ทำ Mapping รหัสเดิม 8 หลัก -> รหัสใหม่ 5 หลัก
2. สำรองข้อมูลและเลือก Pilot User 1 คน
3. เปลี่ยนเฉพาะ sAMAccountName บนบัญชีเดิม
4. ไม่ลบบัญชีและไม่สร้างบัญชีใหม่
5. ไม่เปลี่ยน Password, Group, SID หรือ ObjectGUID
6. Sync IC/LDAP
7. ทดสอบ COMPANY\รหัสใหม่ และ IC ด้วยรหัสใหม่
8. ทดสอบระบบอื่นและ AD Replication
9. เมื่อผ่านจึงค่อย Rollout เป็น Batch
```

เปลี่ยน UPN เฉพาะเมื่อยืนยันแล้วว่า IC หรือกระบวนการ SSO ใช้ UPN จริง และได้ตรวจผลกระทบกับ Microsoft Entra ID, Microsoft 365 และ Application อื่นครบแล้ว

---

## 19. เอกสารอ้างอิง

แหล่งอ้างอิงทั้งหมดด้านล่างเป็นเอกสาร Microsoft Learn:

1. [Manage User Accounts with Active Directory Users and Computers in Windows Server](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage-user-accounts-in-windows-server)
2. [Install and manage Remote Server Administration Tools in Windows](https://learn.microsoft.com/en-us/windows-server/administration/install-remote-server-administration-tools)
3. [User Naming Attributes](https://learn.microsoft.com/en-us/windows/win32/ad/naming-properties)
4. [SAM-Account-Name attribute](https://learn.microsoft.com/en-us/windows/win32/adschema/a-samaccountname)
5. [User-Principal-Name attribute](https://learn.microsoft.com/en-us/windows/win32/adschema/a-userPrincipalName)
6. [User Name Formats](https://learn.microsoft.com/en-us/windows/win32/secauthn/user-name-formats)
7. [Set-ADUser](https://learn.microsoft.com/en-us/powershell/module/activedirectory/set-aduser?view=windowsserver2025-ps)
8. [Rename-ADObject](https://learn.microsoft.com/en-us/powershell/module/activedirectory/rename-adobject?view=windowsserver2025-ps)
9. [ActiveDirectory PowerShell Module](https://learn.microsoft.com/en-us/powershell/module/activedirectory/?view=windowsserver2025-ps)
10. [Security Identifiers](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-identifiers)
11. [Active Directory Forest Recovery - Back up the System State data](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-backing-up-system-state)
12. [Cached domain logon information](https://learn.microsoft.com/en-us/troubleshoot/windows-server/user-profiles-and-logon/cached-domain-logon-information)
13. [Plan and troubleshoot UserPrincipalName changes in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/howto-troubleshoot-upn-changes)
14. [Microsoft Entra UserPrincipalName population](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/plan-connect-userprincipalname)
15. [Customize SAML token claims](https://learn.microsoft.com/en-us/entra/identity-platform/saml-claims-customization)
16. [Troubleshooting Active Directory Replication Problems](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/troubleshoot/troubleshooting-active-directory-replication-problems)

---

## 20. หมายเหตุสำคัญ

เอกสารนี้เป็นแนวทางทั่วไป เนื่องจากยังไม่ทราบผู้ผลิต รุ่น และรูปแบบ Authentication ที่แท้จริงของ IC System จึงต้องยืนยัน Configuration ของ IC ก่อนนำไปใช้จริง โดยเฉพาะกรณีที่ IC เก็บ Username เป็น Primary Key, ใช้ SAML NameID, มี User Provisioning หรือมีการ Sync กับระบบ Cloud
