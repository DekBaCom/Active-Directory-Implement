# Active Directory Implementation Guide

A comprehensive GitHub Pages website covering Active Directory from concept to production deployment. Now updated for **Windows Server 2025** and **Microsoft Entra ID**.

## Topics Covered

- **What is Active Directory** — History, components, core concepts (timeline through 2024 / WS 2025)
- **AD Service Types** — AD DS, Microsoft Entra ID, AD CS, AD FS, AD LDS, AD RMS
- **Windows Server Editions** — Essentials, Standard, Datacenter (2025 comparison + hotpatching, SMB over QUIC)
- **Implementation Solution** — Step-by-step deployment with PowerShell scripts
- **Architecture Design** — Small, medium, enterprise, and hybrid reference architectures
- **Cost Estimator** — Interactive calculator with TXT and CSV export (2025 MSRP)
- **Best Practices** — Security hardening, operations, backup, monitoring
- **FAQ** — Common questions, port reference, AGDLP, LDAP channel binding, Windows LAPS, dMSA, 2016/2019 → 2025 migration

## Features

- Dark / light theme toggle (persisted via `localStorage`, honors `prefers-color-scheme`)
- Scroll progress bar
- Ctrl+K (⌘+K) command palette for jumping to any section
- Printable layout (`@media print` stylesheet)
- Interactive cost calculator with TXT & CSV export
- Security checklist with click-to-tick persistence
- Fully responsive (mobile/tablet/desktop)
- No build step — pure static HTML/CSS/JS

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
| `↑` / `↓` | Navigate search results |
| `Enter` | Jump to section |
| `Esc` | Close search |

## Credits

Contributed by Mr. Abdulloh Etaeluengoh — [LinkedIn](https://www.linkedin.com/in/abdulloh-etaeluengoh) · abdulloh.eg@gmail.com
