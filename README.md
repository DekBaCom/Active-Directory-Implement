# Active Directory Implementation Guide

A comprehensive GitHub Pages website covering Active Directory from concept to production deployment. **21 chapters**, 28 PowerShell recipes, 10 Excel templates — all updated for **Windows Server 2025** and **Microsoft Entra ID**.

## Topics Covered

### Learn — concepts & editions
- **Ch 01 — What is Active Directory** — History, components, core concepts (timeline through WS 2025)
- **Ch 02 — AD Service Types** — AD DS, Entra ID, AD CS, AD FS, AD LDS, AD RMS **+ Entra Domain Services deep-dive** (what/why, AD DS vs Entra DS comparison, cloud-only & hybrid implementation)
- **Ch 03 — Windows Server Editions** — 2025 comparison, functional levels, FL upgrade guide, 2008 R2 → 2025 upgrade path

### Build — design & deployment
- **Ch 04 — Implementation Solution** — Step-by-step deployment with PowerShell scripts
- **Ch 05 — Architecture Design** — Small / medium / enterprise / hybrid reference architectures (plus Entra DS Cloud-Only and Hybrid diagrams)
- **Ch 13 — FSMO Roles Deep-Dive** — Five roles, placement, transfer vs seize, PDC-emulator time hierarchy
- **Ch 14 — Sites, Subnets & Replication** — Topology design, site links, intra vs inter-site, DFSR SYSVOL, `repadmin` cookbook
- **Ch 15 — DNS for Active Directory** — AD-integrated zones, SRV records, scavenging, split-brain, conditional forwarders
- **Ch 16 — OU Design, Delegation & Service Accounts** — Tier 0/1/2 model, AGDLP, delegation wizard, gMSA end-to-end
- **Ch 17 — Hybrid Identity (Entra Connect)** — Connect vs Cloud Sync, PHS/PTA/Federation, Seamless SSO, device join
- **Ch 06 — Cost Estimator** — Interactive calculator with TXT and CSV export (2025 MSRP)

### Operate — run & defend
- **Ch 18 — Group Policy Deep-Dive** — LSDOU, inheritance, filtering, loopback, Central Store, Preferences, troubleshooting
- **Ch 07 — Best Practices** — Security hardening, operations, backup, monitoring, 40+ checklist items
- **Ch 19 — Backup, Restore & Disaster Recovery** — System State, Recycle Bin, authoritative restore, 10-step forest recovery runbook
- **Ch 20 — Monitoring & Troubleshooting** — `dcdiag` / `repadmin` cookbooks, 20+ critical Event IDs, health cadence
- **Ch 08 — AD Attacks & Defense** — Kerberoasting, Golden Ticket, DCSync, Pass-the-Hash, AS-REP Roasting with event IDs and hardening snippets
- **Ch 09 — PowerShell Recipe Library** — 28 tagged, searchable scripts with Copy + Download `.ps1`
- **Ch 21 — Migration & Upgrade** — In-place vs swing, pre-flight, FFL/DFL raise, ADMT cross-forest, Entra Connect → Cloud Sync

### Resources
- **Ch 10 — Directory Alternatives** — AD DS vs Entra ID vs Entra DS vs Samba AD vs FreeIPA vs JumpCloud + decision tree
- **Ch 11 — Excel Template Library** — 10 downloadable `.xls` templates: Implementation, Upgrade, Assessment, Security, Best Practices, FSMO & Replication Topology, DNS Inventory, GPO Inventory, Backup & Forest Recovery Runbook, Event ID Alert Catalogue
- **Ch 12 — FAQ** — Common questions, port reference, AGDLP, LDAP channel binding, Windows LAPS, dMSA, 2016/2019 → 2025 migration

## Features

- Dark / light theme toggle (persisted via `localStorage`, honors `prefers-color-scheme`)
- Scroll progress bar
- Ctrl+K (⌘+K) command palette with 40+ indexed topics
- Press **?** anywhere to see keyboard shortcuts
- Printable layout (`@media print` stylesheet)
- Interactive cost calculator with TXT & CSV export
- PowerShell recipe library — 13 tag filters (Users, Groups, GPO, FSMO, Replication, DNS, Delegation, Hybrid, Backup & DR, Migration, Security, Health), copy or download `.ps1`, bulk-download all
- Excel templates — generate `.xls` workbooks client-side (no server needed)
- Security checklist with click-to-tick state persisted in localStorage
- Hover any section heading for a copy-link anchor
- Fully responsive (mobile/tablet/desktop)
- PWA-ready — service worker, web manifest, offline shell
- SEO-ready — Open Graph, Twitter Card, sitemap.xml, robots.txt
- No build step — pure static HTML/CSS/JS, zero external runtime dependencies

## Live Site

Deploy via GitHub Pages: `Settings → Pages → Branch: main → / (root)`

## Structure

```
/
├── index.html                # Main single-page application (21 chapters)
├── css/style.css             # Styles (dark + light themes, print stylesheet)
├── js/main.js                # Theme, search, recipes, templates, cost calculator
├── assets/                   # SVG diagrams (Entra DS designs) + favicon + OG image
├── manifest.webmanifest      # PWA manifest
├── sw.js                     # Service worker (offline shell)
├── sitemap.xml               # Chapter anchors for crawlers
├── robots.txt
└── README.md
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `⌘+K` | Open search / command palette |
| `?` | Show keyboard shortcuts modal |
| `T` | Toggle light / dark theme |
| `G` then `T` | Scroll to top |
| `G` then `P` | Jump to PowerShell recipes |
| `G` then `S` | Jump to Security chapter |
| `G` then `D` | Jump to Download Templates |
| `G` then `F` | Jump to FAQ |
| `↑` / `↓` / `Enter` | Navigate search results |
| `Esc` | Close any open modal |

## Credits

Contributed by Mr. Abdulloh Etaeluengoh — [LinkedIn](https://www.linkedin.com/in/abdulloh-etaeluengoh) · abdulloh.eg@gmail.com
