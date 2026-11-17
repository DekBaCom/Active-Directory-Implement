# Active Directory Implementation Guide

A comprehensive GitHub Pages website covering Active Directory from concept to production deployment. Now updated for **Windows Server 2025** and **Microsoft Entra ID**.

## Topics Covered

- **Ch 01 — What is Active Directory** — History, components, core concepts (timeline through WS 2025)
- **Ch 02 — AD Service Types** — AD DS, Entra ID, AD CS, AD FS, AD LDS, AD RMS **+ Entra Domain Services deep-dive** (what/why, AD DS vs Entra DS comparison, cloud-only & hybrid implementation)
- **Ch 03 — Windows Server Editions** — 2025 comparison, functional levels, FL upgrade guide
- **Ch 04 — Implementation Solution** — Step-by-step deployment with PowerShell scripts
- **Ch 05 — Architecture Design** — Small / medium / enterprise / hybrid reference architectures
- **Ch 06 — Cost Estimator** — Interactive calculator with TXT and CSV export (2025 MSRP)
- **Ch 07 — Best Practices** — Security hardening, operations, backup, monitoring
- **Ch 08 — AD Attacks & Defense** — Kerberoasting, Golden Ticket, DCSync, Pass-the-Hash, AS-REP Roasting with event IDs and hardening snippets
- **Ch 09 — PowerShell Recipe Library** — 16+ tagged, searchable scripts with Copy + Download .ps1
- **Ch 10 — Directory Alternatives** — AD DS vs Entra ID vs Entra DS vs Samba AD vs FreeIPA vs JumpCloud + decision tree
- **Ch 11 — Excel Template Library** — 5 downloadable .xls templates (Implementation / Upgrade / Assessment / Security / Best Practices)
- **Ch 12 — FAQ** — Common questions, port reference, AGDLP, LDAP channel binding, Windows LAPS, dMSA, 2016/2019 → 2025 migration

## Features

- Dark / light theme toggle (persisted via `localStorage`, honors `prefers-color-scheme`)
- Scroll progress bar
- Ctrl+K (⌘+K) command palette with 30+ indexed topics
- Press **?** anywhere to see keyboard shortcuts
- Printable layout (`@media print` stylesheet)
- Interactive cost calculator with TXT & CSV export
- PowerShell recipe library — filter by tag, copy or download `.ps1`
- Excel templates — generate `.xls` workbooks client-side (no server needed)
- Security checklist with click-to-tick state persisted in localStorage
- Hover any section heading for a copy-link anchor
- Fully responsive (mobile/tablet/desktop)
- No build step — pure static HTML/CSS/JS, zero external runtime dependencies

## Live Site

Deploy via GitHub Pages: `Settings → Pages → Branch: main → / (root)`

## Structure

```
/
├── index.html        # Main single-page application
├── css/style.css     # Styles (dark + light themes, print stylesheet)
├── js/main.js        # Theme, search, cost calculator, scroll UX
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
