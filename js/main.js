'use strict';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');
const scrollProgress = document.getElementById('scrollProgress');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 400);
  updateScrollProgress();
  updateActiveNavLink();
});

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Dropdown group toggles (mobile tap, desktop hover handled in CSS)
document.querySelectorAll('.nav-group-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const group = btn.closest('.nav-group');
    if (!group) return;
    e.preventDefault();
    const willOpen = !group.classList.contains('open');
    document.querySelectorAll('.nav-group.open').forEach(g => g !== group && g.classList.remove('open'));
    group.classList.toggle('open', willOpen);
    btn.setAttribute('aria-expanded', String(willOpen));
  });
});

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-group')) {
    document.querySelectorAll('.nav-group.open').forEach(g => {
      g.classList.remove('open');
      const b = g.querySelector('.nav-group-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
});

// Clicking a nav link (including inside dropdown) closes mobile menu
document.querySelectorAll('.nav-link, .nav-drop-link').forEach(link => {
  if (link.classList.contains('nav-group-btn')) return;
  link.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('open');
    if (navToggle) { navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); }
    document.querySelectorAll('.nav-group.open').forEach(g => g.classList.remove('open'));
  });
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  let activeGroupBtn = null;
  document.querySelectorAll('.nav-drop-link').forEach(link => {
    const isActive = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('active', isActive);
    if (isActive) activeGroupBtn = link.closest('.nav-group') && link.closest('.nav-group').querySelector('.nav-group-btn');
  });
  document.querySelectorAll('.nav-group-btn').forEach(btn => btn.classList.remove('active'));
  if (activeGroupBtn) activeGroupBtn.classList.add('active');
  // Also handle any plain .nav-link anchors not inside a dropdown
  document.querySelectorAll('.nav-link:not(.nav-group-btn)').forEach(link => {
    if (link.getAttribute('href')) link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// ===== SCROLL PROGRESS BAR =====
function updateScrollProgress() {
  if (!scrollProgress) return;
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  scrollProgress.style.width = `${Math.min(scrolled, 100)}%`;
}

// ===== BACK TO TOP =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== DYNAMIC COPYRIGHT YEAR =====
(function setCopyrightYear() {
  const el = document.getElementById('copyrightYear');
  if (el) el.textContent = new Date().getFullYear();
})();

// ===== THEME TOGGLE =====
const THEME_KEY = 'ad-guide-theme';
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  document.body.classList.toggle('theme-light', theme === 'light');
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'light' ? '&#9728;' : '&#9790;';
    themeToggle.setAttribute('title', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = saved || (prefersLight ? 'light' : 'dark');
  applyTheme(theme);
})();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.body.classList.contains('theme-light') ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

// ===== HERO PARTICLES =====
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = `${Math.random() * 100}%`;
    p.style.animationDuration = `${8 + Math.random() * 16}s`;
    p.style.animationDelay = `${Math.random() * 8}s`;
    p.style.width = p.style.height = `${1 + Math.random() * 3}px`;
    p.style.opacity = `${0.2 + Math.random() * 0.4}`;
    container.appendChild(p);
  }
})();

// ===== ANIMATED COUNTERS =====
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || (target > 100 ? 'M+' : (target > 10 ? '%' : '+'));
      animateCounter(el, target, suffix);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => observer.observe(el));

// ===== TABS =====
function initTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector || '.tabs-container, .arch-tabs');
  containers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(`tab-${tabId}`);
        if (target) target.classList.add('active');
      });
    });
  });
}
initTabs();

// ===== FAQ =====
function toggleFAQ(el) {
  const answer = el.nextElementSibling;
  const icon = el.querySelector('.faq-icon');
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-icon').forEach(i => i.textContent = '+');
  if (!isOpen) {
    answer.classList.add('open');
    icon.textContent = '−';
  }
}

// ===== CHECKLIST =====
function toggleCheck(id) {
  const item = document.getElementById(id);
  const check = item.querySelector('.cl-check');
  const isChecked = item.classList.toggle('checked');
  check.textContent = isChecked ? '☑' : '☐';
}

// ===== COPY CODE =====
function copyCode(btn) {
  const code = btn.closest('.code-block').querySelector('pre').innerText;
  const done = () => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(code).then(done).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }
  function fallbackCopy() {
    const ta = document.createElement('textarea');
    ta.value = code;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
}

// ===== COST CALCULATOR =====
const PRICES = {
  // Windows Server 2025 MSRP (Nov 2024, +10% from WS 2022)
  serverEdition: { essentials: 581, standard: 1176, datacenter: 6771 },
  cal: { device: 42, user: 42, none: 0 },
  azure: { none: 0, free: 0, p1: 6, p2: 9 },
  hardware: 3000,
  proServices: 6000,
  adcs: 5000,
  mdi: 5.5,
};

const CHART_COLORS = [
  '#0078d4', '#50e6ff', '#57d9a3', '#b4a7f5', '#ffa94d', '#ff6b6b', '#ffd700'
];

function updateCalc() {
  const numUsers = parseInt(document.getElementById('numUsers').value, 10);
  const numDCs = parseInt(document.getElementById('numDCs').value, 10);
  const numSites = parseInt(document.getElementById('numSites').value, 10);
  const edition = document.getElementById('serverEdition').value;
  const deployModel = document.getElementById('deployModel').value;
  const azureLicense = document.getElementById('azureLicense').value;
  const calType = document.getElementById('calType').value;
  const includeHardware = document.getElementById('includeHardware').checked;
  const includeProServices = document.getElementById('includeProServices').checked;
  const includeADCS = document.getElementById('includeADCS').checked;
  const includeMDI = document.getElementById('includeMDI').checked;

  document.getElementById('numUsersVal').textContent = numUsers.toLocaleString();
  document.getElementById('numDCsVal').textContent = numDCs;
  document.getElementById('numSitesVal').textContent = numSites;

  const licenseCost = deployModel === 'cloud' ? 0 : numDCs * PRICES.serverEdition[edition];
  const calCost = calType === 'none' ? 0 : numUsers * PRICES.cal[calType];
  const hardwareCost = includeHardware && deployModel !== 'cloud' ? numDCs * PRICES.hardware : 0;
  const proServicesCost = includeProServices ? PRICES.proServices : 0;
  const adcsCost = includeADCS ? PRICES.adcs : 0;

  const azureAnnual = azureLicense === 'none' || azureLicense === 'free' ? 0 : numUsers * PRICES.azure[azureLicense] * 12;
  const mdiAnnual = includeMDI ? numUsers * PRICES.mdi * 12 : 0;

  let cloudAnnual = 0;
  if (deployModel === 'cloud') {
    cloudAnnual = numUsers <= 1000 ? 440 : numUsers <= 10000 ? 2200 : 6600;
  }

  const total = licenseCost + calCost + hardwareCost + proServicesCost + adcsCost;
  const annual = azureAnnual + mdiAnnual + cloudAnnual;

  document.getElementById('costLicenses').textContent = `$${licenseCost.toLocaleString()}`;
  document.getElementById('costCALs').textContent = `$${calCost.toLocaleString()}`;
  document.getElementById('costHardware').textContent = `$${hardwareCost.toLocaleString()}`;
  document.getElementById('costAzure').textContent = azureAnnual > 0 ? `$${azureAnnual.toLocaleString()}/yr` : '$0';
  document.getElementById('costProServices').textContent = proServicesCost > 0 ? `$${proServicesCost.toLocaleString()}` : '$0';
  document.getElementById('costADCS').textContent = adcsCost > 0 ? `$${adcsCost.toLocaleString()}` : '$0';
  document.getElementById('costMDI').textContent = mdiAnnual > 0 ? `$${mdiAnnual.toLocaleString()}/yr` : '$0';
  document.getElementById('costTotal').textContent = `$${total.toLocaleString()}`;
  document.getElementById('costAnnual').textContent = annual > 0 ? `$${annual.toLocaleString()}/yr` : '$0';

  const items = [
    { label: 'Server Licenses', value: licenseCost },
    { label: 'CALs', value: calCost },
    { label: 'Hardware', value: hardwareCost },
    { label: 'Pro Services', value: proServicesCost },
    { label: 'AD CS', value: adcsCost },
  ].filter(i => i.value > 0);

  const maxVal = Math.max(...items.map(i => i.value), 1);
  const chartBars = document.getElementById('chartBars');
  chartBars.innerHTML = items.map((item, idx) => `
    <div class="chart-bar-item">
      <div class="chart-bar-label">${item.label}</div>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width:${(item.value / maxVal * 100).toFixed(1)}%; background:${CHART_COLORS[idx % CHART_COLORS.length]}"></div>
      </div>
      <div class="chart-bar-pct">${((item.value / (total || 1)) * 100).toFixed(0)}%</div>
    </div>
  `).join('');
}

updateCalc();

// ===== DOWNLOAD ESTIMATE =====
function downloadEstimate(format) {
  format = format || 'txt';
  const numUsers = document.getElementById('numUsersVal').textContent;
  const numDCs = document.getElementById('numDCsVal').textContent;
  const numSites = document.getElementById('numSitesVal').textContent;
  const edition = document.getElementById('serverEdition').selectedOptions[0].text;
  const deployModel = document.getElementById('deployModel').selectedOptions[0].text;
  const total = document.getElementById('costTotal').textContent;
  const annual = document.getElementById('costAnnual').textContent;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const rows = [
    ['Item', 'Value'],
    ['Generated', today],
    ['Users', numUsers],
    ['Domain Controllers', numDCs],
    ['Sites', numSites],
    ['Server Edition', edition],
    ['Deployment Model', deployModel],
    ['Server Licenses', document.getElementById('costLicenses').textContent],
    ['CALs', document.getElementById('costCALs').textContent],
    ['Hardware', document.getElementById('costHardware').textContent],
    ['Azure AD / Entra ID', document.getElementById('costAzure').textContent],
    ['Professional Services', document.getElementById('costProServices').textContent],
    ['AD CS Setup', document.getElementById('costADCS').textContent],
    ['Defender for Identity', document.getElementById('costMDI').textContent],
    ['TOTAL UPFRONT', total],
    ['ANNUAL RECURRING', annual],
  ];

  let content, mime, ext;
  if (format === 'csv') {
    content = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    mime = 'text/csv';
    ext = 'csv';
  } else {
    content = 'ACTIVE DIRECTORY COST ESTIMATE\n==============================\n';
    content += rows.map(r => `${r[0].padEnd(24)}${r[1]}`).join('\n');
    content += '\n\nNOTE: Estimates based on MSRP (Nov 2024). Actual costs vary\nby region, volume licensing, and negotiated discounts.\nSoftware Assurance adds ~25-29% annually.\n';
    mime = 'text/plain';
    ext = 'txt';
  }

  const blob = new Blob([content], { type: mime });
  saveBlob(blob, `AD-Cost-Estimate.${ext}`);
  if (typeof toast === 'function') toast(`Downloaded AD-Cost-Estimate.${ext}`);
}

// ===== SEARCH / COMMAND PALETTE (Ctrl+K) =====
const searchModal = document.getElementById('searchModal');
const searchBackdrop = document.getElementById('searchBackdrop');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const SEARCH_INDEX = [
  // Sections
  { title: 'What is Active Directory', hash: '#what-is-ad', keywords: 'ad introduction overview forest domain ou dc gc fsmo gpo schema identity kerberos ldap authentication' },
  { title: 'AD Service Types', hash: '#ad-types', keywords: 'ad ds entra id azure aadds adcs adfs adlds adrms pki certificate federation lightweight rights' },
  { title: 'Windows Server Editions', hash: '#windows-editions', keywords: 'windows server 2025 2022 essentials standard datacenter licensing cal edition comparison functional level' },
  { title: 'Functional Level Upgrade Guide', hash: '#windows-editions', keywords: 'functional level upgrade dfl ffl raise set-addomainmode set-adforestmode schema rollback domain mode forest mode' },
  { title: 'Implementation Guide', hash: '#implementation', keywords: 'install deploy powershell promote domain controller forest install-addsforest planning ou assessment' },
  { title: 'Architecture Design', hash: '#architecture', keywords: 'architecture small medium enterprise hybrid cloud design single multi forest empty root fsmo placement' },
  { title: 'Cost Calculator', hash: '#calculator', keywords: 'cost price calculator estimate budget license hardware msrp software assurance' },
  { title: 'Best Practices', hash: '#best-practices', keywords: 'best practices security hardening tier paw laps backup recovery monitoring ntlm kerberos' },
  { title: 'FAQ & Resources', hash: '#faq', keywords: 'faq ports kerberoasting ldap channel binding dmsa migration agdlp' },
  // Specific topics
  { title: 'FSMO Roles Reference', hash: '#architecture', keywords: 'fsmo schema master rid pdc emulator infrastructure domain naming' },
  { title: 'AGDLP Naming Convention', hash: '#faq', keywords: 'agdlp account global domain local permission group nesting rbac' },
  { title: 'Firewall Ports for AD', hash: '#faq', keywords: 'ports firewall kerberos 88 ldap 389 636 rpc 135 smb 445 global catalog 3268 3269 dns' },
  { title: 'LDAP Channel Binding', hash: '#faq', keywords: 'ldap channel binding signing event 3039 3040 3041 ldaps starttls simple bind' },
  { title: 'Windows LAPS', hash: '#faq', keywords: 'laps local admin password solution built-in intune gpo rotation' },
  { title: 'dMSA Service Accounts', hash: '#faq', keywords: 'dmsa delegated managed service account kerberoasting gmsa service account' },
  { title: 'Hybrid Identity', hash: '#ad-types', keywords: 'hybrid identity entra connect azure ad connect sync password hash sync pass-through federation' },
  { title: 'Security Checklist', hash: '#best-practices', keywords: 'checklist security recycle bin fine grained password credential guard wdigest smb signing' },
  // New chapters
  { title: 'AD Attacks & Defense', hash: '#security', keywords: 'security attack defense kerberoasting golden ticket silver dcsync pass the hash pth asrep mitre t1558 t1003' },
  { title: 'Kerberoasting Attack', hash: '#attack-kerberoasting', keywords: 'kerberoasting spn tgs rc4 service account hashcat 13100 mitre t1558.003' },
  { title: 'Golden Ticket Attack', hash: '#attack-golden-ticket', keywords: 'golden ticket krbtgt forged tgt domain admin persistence mitre t1558.001' },
  { title: 'DCSync Attack', hash: '#attack-dcsync', keywords: 'dcsync replication get changes drsr password dump krbtgt mitre t1003.006' },
  { title: 'Pass-the-Hash', hash: '#attack-pth', keywords: 'pass the hash ptt mimikatz lsass ntlm lateral movement mitre t1550' },
  { title: 'AS-REP Roasting', hash: '#attack-asrep', keywords: 'as-rep roasting preauth kerberos hashcat 18200 mitre t1558.004' },
  { title: 'PowerShell Recipe Library', hash: '#powershell', keywords: 'powershell recipes scripts ps1 download bulk users gpo backup fsmo replication health laps' },
  { title: 'Directory Alternatives', hash: '#alternatives', keywords: 'alternatives samba ad freeipa jumpcloud entra domain services comparison decision tree open source' },
  { title: 'Template Downloads', hash: '#templates', keywords: 'templates download excel xlsx checklist assessment questionnaire implementation upgrade security best practices' },
  { title: 'Entra Domain Services Deep-Dive', hash: '#entra-ds', keywords: 'entra domain services aadds managed cloud ldap kerberos ntlm azure lift shift what is comparison implementation cloud-only hybrid' },
  { title: 'Entra DS vs AD DS comparison', hash: '#entra-ds', keywords: 'entra ds vs ad ds comparison managed on-prem schema ldap write domain admin trust' },
  { title: 'Entra DS cloud-only implementation', hash: '#entra-ds', keywords: 'entra ds cloud only implementation provision azure vnet dns password sync az cli ad ds' },
  { title: 'Entra DS hybrid implementation', hash: '#entra-ds', keywords: 'entra ds hybrid entra connect password hash sync phs forest trust vpn expressroute' },
];

function openSearch() {
  if (!searchModal) return;
  searchModal.classList.add('open');
  searchModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => searchInput && searchInput.focus(), 10);
  renderResults('');
}
function closeSearch() {
  if (!searchModal) return;
  searchModal.classList.remove('open');
  searchModal.setAttribute('aria-hidden', 'true');
  if (searchInput) searchInput.value = '';
}

function renderResults(query) {
  if (!searchResults) return;
  const q = query.trim().toLowerCase();
  let items = SEARCH_INDEX;
  if (q) {
    items = SEARCH_INDEX
      .map(item => {
        const haystack = (item.title + ' ' + item.keywords).toLowerCase();
        const hit = haystack.includes(q);
        const titleHit = item.title.toLowerCase().includes(q);
        return { ...item, score: titleHit ? 2 : (hit ? 1 : 0) };
      })
      .filter(i => i.score > 0)
      .sort((a, b) => b.score - a.score);
  }
  if (items.length === 0) {
    searchResults.innerHTML = '<div class="search-empty">No results. Try FSMO, LDAP, GPO, cost, or Kerberos.</div>';
    return;
  }
  searchResults.innerHTML = items.slice(0, 10).map((item, idx) => `
    <a class="search-result ${idx === 0 ? 'active' : ''}" href="${item.hash}" data-idx="${idx}">
      <div class="search-result-title">${escapeHtml(item.title)}</div>
      <div class="search-result-section">${escapeHtml(item.hash)}</div>
    </a>
  `).join('');
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

if (searchBtn) searchBtn.addEventListener('click', openSearch);
if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
if (searchInput) searchInput.addEventListener('input', (e) => renderResults(e.target.value));
if (searchResults) {
  searchResults.addEventListener('click', (e) => {
    const link = e.target.closest('.search-result');
    if (link) {
      setTimeout(closeSearch, 50);
    }
  });
}

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (searchModal && searchModal.classList.contains('open')) closeSearch();
    else openSearch();
    return;
  }
  if (!searchModal || !searchModal.classList.contains('open')) return;
  if (e.key === 'Escape') { closeSearch(); return; }

  const results = searchResults.querySelectorAll('.search-result');
  if (!results.length) return;
  const activeIdx = Array.from(results).findIndex(r => r.classList.contains('active'));
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const next = (activeIdx + 1) % results.length;
    results.forEach(r => r.classList.remove('active'));
    results[next].classList.add('active');
    results[next].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const prev = (activeIdx - 1 + results.length) % results.length;
    results.forEach(r => r.classList.remove('active'));
    results[prev].classList.add('active');
    results[prev].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const active = results[Math.max(activeIdx, 0)];
    if (active) {
      window.location.hash = active.getAttribute('href');
      closeSearch();
    }
  }
});

// ===== TOAST =====
let toastEl;
function toast(msg, ms = 2200) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('show'), ms);
}

// ===== POWERSHELL RECIPE LIBRARY =====
const RECIPES = [
  {
    id: 'bulk-users',
    title: 'Bulk Create Users from CSV',
    desc: 'Import users from a CSV with FirstName, LastName, Username, Password columns.',
    tags: ['users'],
    code: `# Columns: FirstName,LastName,Username,Password
Import-Csv "C:\\users.csv" | ForEach-Object {
  New-ADUser \`
    -Name "$($_.FirstName) $($_.LastName)" \`
    -GivenName $_.FirstName -Surname $_.LastName \`
    -SamAccountName $_.Username \`
    -UserPrincipalName "$($_.Username)@contoso.com" \`
    -Path "OU=Users,OU=Corp,DC=contoso,DC=com" \`
    -AccountPassword (ConvertTo-SecureString $_.Password -AsPlainText -Force) \`
    -Enabled $true -ChangePasswordAtLogon $true
}`
  },
  {
    id: 'disable-stale',
    title: 'Disable Stale User Accounts (90 days)',
    desc: 'Find and disable user accounts that have not logged on in 90 days.',
    tags: ['users', 'security'],
    code: `$cutoff = (Get-Date).AddDays(-90)
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly |
  Where-Object {$_.Enabled -eq $true} |
  ForEach-Object {
    Disable-ADAccount -Identity $_.SamAccountName
    Set-ADUser -Identity $_.SamAccountName -Description "Disabled - inactive since $cutoff"
    Write-Host "Disabled: $($_.SamAccountName)"
  }`
  },
  {
    id: 'reset-password',
    title: 'Reset Password & Force Change at Logon',
    desc: 'Reset a user password and require change at next logon.',
    tags: ['users'],
    code: `$user = Read-Host "SamAccountName"
$newPw = Read-Host "New password" -AsSecureString
Set-ADAccountPassword -Identity $user -NewPassword $newPw -Reset
Set-ADUser -Identity $user -ChangePasswordAtLogon $true
Unlock-ADAccount -Identity $user`
  },
  {
    id: 'nested-groups',
    title: 'Audit Nested Group Membership',
    desc: 'Recursively list all members of a security group, including nested groups.',
    tags: ['groups', 'security'],
    code: `function Get-NestedMembers {
  param([string]$GroupName)
  Get-ADGroupMember -Identity $GroupName -Recursive |
    Where-Object {$_.objectClass -eq 'user'} |
    Select-Object SamAccountName, DistinguishedName
}
Get-NestedMembers "Domain Admins" | Format-Table -AutoSize`
  },
  {
    id: 'gpo-backup',
    title: 'Backup All GPOs',
    desc: 'Export every GPO in the domain to a timestamped folder.',
    tags: ['gpo'],
    code: `$backupPath = "C:\\GPOBackups\\$(Get-Date -Format 'yyyyMMdd-HHmm')"
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
Backup-GPO -All -Path $backupPath
Write-Host "Backed up $(Get-ChildItem $backupPath -Directory | Measure-Object | Select -Expand Count) GPOs to $backupPath"`
  },
  {
    id: 'gpo-report',
    title: 'Generate HTML Report for All GPOs',
    desc: 'Export every GPO as an HTML report for documentation or audit.',
    tags: ['gpo'],
    code: `$reportPath = "C:\\GPOReports"
New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
Get-GPO -All | ForEach-Object {
  $safeName = $_.DisplayName -replace '[\\\\/:*?"<>|]','_'
  Get-GPOReport -Guid $_.Id -ReportType Html -Path "$reportPath\\$safeName.html"
}`
  },
  {
    id: 'fsmo-query',
    title: 'Query FSMO Role Holders',
    desc: 'Show which DC owns each of the 5 FSMO roles.',
    tags: ['fsmo', 'health'],
    code: `Get-ADForest | Select-Object SchemaMaster, DomainNamingMaster
Get-ADDomain  | Select-Object PDCEmulator, RIDMaster, InfrastructureMaster
# One-liner alternative:
netdom query fsmo`
  },
  {
    id: 'fsmo-transfer',
    title: 'Transfer FSMO Roles to New DC',
    desc: 'Gracefully transfer all 5 FSMO roles to a target DC.',
    tags: ['fsmo'],
    code: `$target = "DC02"
Move-ADDirectoryServerOperationMasterRole -Identity $target \`
  -OperationMasterRole SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster -Confirm:$false
Get-ADForest | Select-Object SchemaMaster, DomainNamingMaster
Get-ADDomain  | Select-Object PDCEmulator, RIDMaster, InfrastructureMaster`
  },
  {
    id: 'fsmo-seize',
    title: 'Seize FSMO Roles (emergency)',
    desc: 'Force FSMO transfer when the previous holder is permanently gone. Use only when graceful transfer is impossible.',
    tags: ['fsmo'],
    code: `# WARNING: Only use when the original role holder is permanently unavailable.
$target = "DC02"
Move-ADDirectoryServerOperationMasterRole -Identity $target \`
  -OperationMasterRole SchemaMaster, DomainNamingMaster, PDCEmulator, RIDMaster, InfrastructureMaster \`
  -Force -Confirm:$false`
  },
  {
    id: 'repl-health',
    title: 'Replication Health Summary',
    desc: 'Run core replication checks and show failing links.',
    tags: ['replication', 'health'],
    code: `repadmin /replsummary
repadmin /showrepl * /csv | ConvertFrom-Csv |
  Where-Object {$_.'Number of Failures' -gt 0} |
  Select-Object 'Source DSA','Destination DSA','Naming Context','Number of Failures','Last Failure Status'`
  },
  {
    id: 'dcdiag-all',
    title: 'Run DCDIAG Across All DCs',
    desc: 'Run comprehensive DCDIAG tests on every DC and capture a log.',
    tags: ['replication', 'health'],
    code: `$log = "C:\\DCDiag-$(Get-Date -Format 'yyyyMMdd').log"
Get-ADDomainController -Filter * | ForEach-Object {
  Add-Content $log "===== $($_.Name) ====="
  dcdiag /s:$($_.HostName) /v /c /e 2>&1 | Add-Content $log
}
Write-Host "Report saved: $log"`
  },
  {
    id: 'enable-recyclebin',
    title: 'Enable AD Recycle Bin',
    desc: 'ONE-WAY: Enable the AD Recycle Bin forest-wide. Requires forest FL 2008 R2+.',
    tags: ['security'],
    code: `# This action is IRREVERSIBLE.
Enable-ADOptionalFeature \`
  -Identity "Recycle Bin Feature" \`
  -Scope ForestOrConfigurationSet \`
  -Target (Get-ADForest).Name \`
  -Confirm:$false
Get-ADOptionalFeature -Filter 'name -like "Recycle Bin*"'`
  },
  {
    id: 'rotate-krbtgt',
    title: 'Rotate krbtgt Password (safely)',
    desc: 'Reset krbtgt to invalidate Golden Tickets. Repeat twice with a gap for safety.',
    tags: ['security'],
    code: `# Phase 1: Reset once. Wait 10h+ for replication + ticket expiry. Then run again.
# Microsoft script: Reset-KrbTgt-Password-For-RWDCs.ps1
# Simple manual version (TEST FIRST, DO NOT RUN IN PROD without reading Microsoft docs):
$krbtgt = Get-ADUser krbtgt -Properties PasswordLastSet
Write-Host "Current krbtgt password age: $(((Get-Date) - $krbtgt.PasswordLastSet).Days) days"
# Reset with a long random password
Set-ADAccountPassword -Identity krbtgt -Reset \`
  -NewPassword (ConvertTo-SecureString (([char[]](48..122) | Get-Random -Count 32) -join '') -AsPlainText -Force)`
  },
  {
    id: 'sysvol-check',
    title: 'Check SYSVOL Replication',
    desc: 'Verify SYSVOL is replicating via DFSR and no backlog exists.',
    tags: ['replication', 'health'],
    code: `# DFSR SYSVOL check
Get-DfsrState -ComputerName (Get-ADDomainController -Filter *).Name | Format-Table ComputerName, UpdateState, InConflict -AutoSize
# Backlog check (run from each DC pair)
# dfsrdiag Backlog /RGName:"Domain System Volume" /RFName:SYSVOL Share /SMem:DC01 /RMem:DC02`
  },
  {
    id: 'enable-laps',
    title: 'Enable Windows LAPS (Intune / GPO)',
    desc: 'Enable the built-in Windows LAPS feature via PowerShell (AD-backed).',
    tags: ['security'],
    code: `# Extend the AD schema for Windows LAPS (one-time, Schema Admin)
Update-LapsADSchema

# Grant computers permission to update their own LAPS password
$ou = "OU=Computers,DC=contoso,DC=com"
Set-LapsADComputerSelfPermission -Identity $ou

# Grant a group permission to read the password
Set-LapsADReadPasswordPermission -Identity $ou -AllowedPrincipals "LAPS-Readers"`
  },
  {
    id: 'find-weak-spn',
    title: 'Hunt Kerberoastable Accounts',
    desc: 'Find user accounts with SPNs that are vulnerable to Kerberoasting.',
    tags: ['security'],
    code: `Get-ADUser -Filter {ServicePrincipalName -like "*" -and Enabled -eq $true} \`
  -Properties ServicePrincipalName, PasswordLastSet, 'msDS-SupportedEncryptionTypes' |
  Select-Object SamAccountName,
    @{n='SPNs';e={$_.ServicePrincipalName -join ';'}},
    @{n='PwdAgeDays';e={((Get-Date) - $_.PasswordLastSet).Days}},
    @{n='AESOnly';e={($_.'msDS-SupportedEncryptionTypes' -band 0x18) -eq 0x18}}`
  },
];

function renderRecipes() {
  const list = document.getElementById('recipeList');
  if (!list) return;
  list.innerHTML = RECIPES.map(r => `
    <article class="recipe-card" data-tags="${r.tags.join(' ')}" data-search="${(r.title + ' ' + r.desc + ' ' + r.tags.join(' ')).toLowerCase()}" id="recipe-${r.id}">
      <div class="recipe-head">
        <div class="recipe-title-row">
          <h4>${escapeHtml(r.title)}</h4>
          <div class="recipe-desc">${escapeHtml(r.desc)}</div>
          <div class="recipe-tag-list">${r.tags.map(t => `<span class="recipe-tag-chip">${escapeHtml(t)}</span>`).join('')}</div>
        </div>
        <div class="recipe-actions">
          <button class="recipe-btn" onclick="copyRecipe('${r.id}', this)">Copy</button>
          <button class="recipe-btn" onclick="downloadRecipe('${r.id}')">&#11015; .ps1</button>
        </div>
      </div>
      <pre><code>${escapeHtml(r.code)}</code></pre>
    </article>
  `).join('') + '<div class="recipe-empty" id="recipeEmpty" style="display:none;">No recipes match that filter.</div>';
}
renderRecipes();

function copyRecipe(id, btn) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;
  const done = () => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 1600);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(r.code).then(done).catch(() => done());
  } else {
    const ta = document.createElement('textarea');
    ta.value = r.code;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
}

function recipeFileContent(r) {
  const header = `<#
.SYNOPSIS
  ${r.title}

.DESCRIPTION
  ${r.desc}

.NOTES
  Tags:   ${r.tags.join(', ')}
  Source: AD Implementation Guide (https://dekbacom.github.io/Active-Directory-Implement/)
  Downloaded: ${new Date().toISOString().slice(0,10)}
#>

`;
  return header + r.code + '\n';
}

function downloadRecipe(id) {
  try {
    const r = RECIPES.find(x => x.id === id);
    if (!r) { toast('Recipe not found'); return; }
    const blob = new Blob([recipeFileContent(r)], { type: 'text/plain;charset=utf-8' });
    saveBlob(blob, `${r.id}.ps1`);
    toast(`Downloaded ${r.id}.ps1`);
  } catch (err) {
    console.error('Recipe download failed:', err);
    toast('Download failed - see console');
  }
}

function downloadVisibleRecipes() {
  try {
    const visibleIds = Array.from(document.querySelectorAll('.recipe-card:not(.hidden)'))
      .map(el => el.id.replace('recipe-', ''));
    if (!visibleIds.length) { toast('No recipes visible'); return; }
    visibleIds.forEach((id, i) => setTimeout(() => downloadRecipe(id), i * 450));
    toast(`Downloading ${visibleIds.length} recipes...`);
  } catch (err) {
    console.error(err);
    toast('Download failed - see console');
  }
}

function downloadRecipesBundle() {
  try {
    const parts = RECIPES.map(r => `# =====================================================================
# FILE: ${r.id}.ps1  |  ${r.title}
# TAGS: ${r.tags.join(', ')}
# =====================================================================
${recipeFileContent(r)}`);
    const content = `<#
  AD Implementation Guide - PowerShell Recipe Bundle
  ${RECIPES.length} recipes concatenated. Split with # ===== dividers.
  Generated: ${new Date().toISOString().slice(0,10)}
#>

${parts.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveBlob(blob, `ad-powershell-bundle-${new Date().toISOString().slice(0,10)}.ps1`);
    toast('Downloaded recipe bundle');
  } catch (err) {
    console.error(err);
    toast('Download failed - see console');
  }
}

function filterRecipes() {
  const activeTag = document.querySelector('.recipe-tag.active');
  const tag = activeTag ? activeTag.dataset.tag : 'all';
  const q = (document.getElementById('recipeSearch').value || '').trim().toLowerCase();
  let visible = 0;
  document.querySelectorAll('.recipe-card').forEach(card => {
    const tags = (card.dataset.tags || '').split(' ');
    const matchesTag = tag === 'all' || tags.includes(tag);
    const matchesQ = !q || (card.dataset.search || '').includes(q);
    const show = matchesTag && matchesQ;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  const empty = document.getElementById('recipeEmpty');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

document.querySelectorAll('.recipe-tag').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.recipe-tag').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterRecipes();
  });
});
const recipeSearchInput = document.getElementById('recipeSearch');
if (recipeSearchInput) recipeSearchInput.addEventListener('input', filterRecipes);

// ===== CHECKLIST PERSISTENCE =====
const CHECKLIST_KEY = 'ad-guide-checklist-v1';
(function restoreChecklist() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
    Object.entries(saved).forEach(([id, checked]) => {
      const el = document.getElementById(id);
      if (el && checked) {
        el.classList.add('checked');
        const check = el.querySelector('.cl-check');
        if (check) check.textContent = '☑';
      }
    });
  } catch (e) {}
})();

const origToggleCheck = window.toggleCheck;
window.toggleCheck = function(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const check = item.querySelector('.cl-check');
  const isChecked = item.classList.toggle('checked');
  if (check) check.textContent = isChecked ? '☑' : '☐';
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
    if (isChecked) saved[id] = true; else delete saved[id];
    localStorage.setItem(CHECKLIST_KEY, JSON.stringify(saved));
  } catch (e) {}
};

// ===== SHORTCUTS MODAL =====
const shortcutsModal = document.getElementById('shortcutsModal');
const shortcutsBackdrop = document.getElementById('shortcutsBackdrop');
const shortcutsBtn = document.getElementById('shortcutsBtn');
const shortcutsClose = document.getElementById('shortcutsClose');

function openShortcuts() {
  if (!shortcutsModal) return;
  shortcutsModal.classList.add('open');
  shortcutsModal.setAttribute('aria-hidden', 'false');
}
function closeShortcuts() {
  if (!shortcutsModal) return;
  shortcutsModal.classList.remove('open');
  shortcutsModal.setAttribute('aria-hidden', 'true');
}
if (shortcutsBtn) shortcutsBtn.addEventListener('click', openShortcuts);
if (shortcutsBackdrop) shortcutsBackdrop.addEventListener('click', closeShortcuts);
if (shortcutsClose) shortcutsClose.addEventListener('click', closeShortcuts);

// ===== GLOBAL KEYBOARD SHORTCUTS =====
let gKeyTimer = null;
document.addEventListener('keydown', (e) => {
  // Ignore when typing in an input
  const t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
  // Esc closes modals
  if (e.key === 'Escape') {
    if (shortcutsModal && shortcutsModal.classList.contains('open')) closeShortcuts();
    return;
  }
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.key === '?') { e.preventDefault(); openShortcuts(); return; }
  if (e.key === 't' || e.key === 'T') {
    if (themeToggle) { e.preventDefault(); themeToggle.click(); }
    return;
  }
  if (e.key === 'g' || e.key === 'G') {
    gKeyTimer = Date.now();
    setTimeout(() => { gKeyTimer = null; }, 1500);
    return;
  }
  if (gKeyTimer && Date.now() - gKeyTimer < 1500) {
    const map = { t: '#home', p: '#powershell', s: '#security', f: '#faq', a: '#alternatives', c: '#calculator', b: '#best-practices', d: '#templates' };
    const target = map[e.key.toLowerCase()];
    if (target) {
      e.preventDefault();
      gKeyTimer = null;
      if (target === '#home') scrollToTop();
      else window.location.hash = target;
    }
  }
});

// ===== COPY-LINK ANCHORS ON HEADINGS =====
(function addHeadingAnchors() {
  document.querySelectorAll('section[id] .section-title, section[id] .subsection-title').forEach(h => {
    const section = h.closest('section[id]');
    if (!section) return;
    const btn = document.createElement('button');
    btn.className = 'heading-anchor';
    btn.type = 'button';
    btn.textContent = '#';
    btn.setAttribute('aria-label', 'Copy link to this section');
    btn.setAttribute('title', 'Copy link to section');
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const url = `${location.origin}${location.pathname}#${section.id}`;
      const done = () => {
        btn.textContent = '✓';
        btn.classList.add('copied');
        toast('Link copied');
        setTimeout(() => { btn.textContent = '#'; btn.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done).catch(() => done());
      else { const ta = document.createElement('textarea'); ta.value = url; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta); }
    });
    h.appendChild(btn);
  });
})();

// ===== EXCEL TEMPLATE DOWNLOADS =====
// Generates HTML-based .xls files that Excel opens as a real workbook.
function xlsSheetHtml(title, headers, rows) {
  const headerHtml = headers.map(h => `<th style="background:#1f4e79;color:#fff;font-weight:bold;border:1px solid #999;padding:6px;">${h}</th>`).join('');
  const bodyHtml = rows.map((r, i) => {
    const bg = i % 2 ? 'background:#f2f6fc;' : '';
    return `<tr>${r.map((c, ci) => {
      let cell = c == null ? '' : String(c);
      let style = `border:1px solid #ccc;padding:6px;vertical-align:top;${bg}`;
      if (ci === 0 && /^(PHASE|CATEGORY|SECTION)/i.test(cell)) {
        style += 'font-weight:bold;background:#d9e2f3;';
      }
      return `<td style="${style}">${cell.replace(/\n/g, '<br>')}</td>`;
    }).join('')}</tr>`;
  }).join('');
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${title}</title>
<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${title.substring(0,31)}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>
<style>table{border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt;}</style>
</head><body>
<h2 style="font-family:Calibri;color:#1f4e79;">${title}</h2>
<p style="font-family:Calibri;color:#666;font-size:10pt;">Generated from AD Implementation Guide — ${new Date().toISOString().slice(0,10)}</p>
<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>
</body></html>`;
}

function saveBlob(blob, filename) {
  // IE / old Edge
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return true;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Give the browser a moment to start the download before revoking the URL
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
  return true;
}

function downloadXls(filename, html) {
  try {
    const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel' });
    saveBlob(blob, filename);
    toast(`Downloaded ${filename}`);
  } catch (err) {
    console.error('XLS download failed:', err);
    toast('Download failed - see console');
  }
}

function toCsv(headers, rows) {
  const esc = v => {
    const s = v == null ? '' : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map(r => r.map(esc).join(',')).join('\r\n');
}

function downloadCsv(filename, headers, rows) {
  try {
    const content = '﻿' + toCsv(headers, rows);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    saveBlob(blob, filename);
    toast(`Downloaded ${filename}`);
  } catch (err) {
    console.error('CSV download failed:', err);
    toast('Download failed - see console');
  }
}

const TEMPLATES = {
  'new-ad-implementation': {
    title: 'New AD Implementation Checklist',
    headers: ['Phase', 'Task', 'Owner', 'Target Date', 'Status', 'Notes'],
    rows: [
      ['PHASE 1: PLANNING', '', '', '', '', ''],
      ['Planning', 'Inventory current users, computers, applications', '', '', 'Not Started', ''],
      ['Planning', 'Choose DNS namespace (routable, not .local)', '', '', 'Not Started', 'e.g., corp.contoso.com'],
      ['Planning', 'Define OU structure (based on admin delegation)', '', '', 'Not Started', ''],
      ['Planning', 'Determine number & placement of DCs', '', '', 'Not Started', 'Min 2 per domain'],
      ['Planning', 'Plan AD Sites & Services topology', '', '', 'Not Started', ''],
      ['Planning', 'Define IP addressing and VLANs for DCs', '', '', 'Not Started', ''],
      ['Planning', 'Select Windows Server edition & licensing model', '', '', 'Not Started', ''],
      ['Planning', 'Document FSMO role placement', '', '', 'Not Started', ''],
      ['Planning', 'Backup/DR strategy defined', '', '', 'Not Started', ''],
      ['PHASE 2: INFRASTRUCTURE PREP', '', '', '', '', ''],
      ['Prep', 'Provision DC hardware/VMs (min 2 vCPU, 4GB RAM, 60GB disk)', '', '', 'Not Started', ''],
      ['Prep', 'Install Windows Server, patch fully', '', '', 'Not Started', ''],
      ['Prep', 'Rename server before promotion', '', '', 'Not Started', ''],
      ['Prep', 'Configure static IP + DNS', '', '', 'Not Started', ''],
      ['Prep', 'Open firewall ports (53, 88, 135, 389, 445, 636, 3268, 3269, 49152-65535)', '', '', 'Not Started', ''],
      ['Prep', 'Enable NTP sync on PDC Emulator to external source', '', '', 'Not Started', ''],
      ['PHASE 3: AD DS DEPLOYMENT', '', '', '', '', ''],
      ['Deploy', 'Install AD DS role (Install-WindowsFeature)', '', '', 'Not Started', ''],
      ['Deploy', 'Promote first DC (Install-ADDSForest)', '', '', 'Not Started', ''],
      ['Deploy', 'Install additional DCs (Install-ADDSDomainController)', '', '', 'Not Started', ''],
      ['Deploy', 'Verify replication (repadmin /replsummary)', '', '', 'Not Started', ''],
      ['Deploy', 'Verify DNS (nslookup, DNS zones)', '', '', 'Not Started', ''],
      ['Deploy', 'Confirm FSMO placement (netdom query fsmo)', '', '', 'Not Started', ''],
      ['PHASE 4: POST-DEPLOYMENT', '', '', '', '', ''],
      ['Post', 'Build OU structure', '', '', 'Not Started', ''],
      ['Post', 'Create baseline GPOs (Default Domain Policy review)', '', '', 'Not Started', ''],
      ['Post', 'Enable AD Recycle Bin (irreversible)', '', '', 'Not Started', ''],
      ['Post', 'Raise functional level after all DCs stable', '', '', 'Not Started', ''],
      ['Post', 'Create admin tier accounts (Tier 0/1/2)', '', '', 'Not Started', ''],
      ['Post', 'Configure time sync hierarchy', '', '', 'Not Started', ''],
      ['Post', 'Document admin/DSRM passwords in secure vault', '', '', 'Not Started', ''],
      ['PHASE 5: TESTING', '', '', '', '', ''],
      ['Test', 'Domain join test workstation', '', '', 'Not Started', ''],
      ['Test', 'Test logon with new user', '', '', 'Not Started', ''],
      ['Test', 'Test GPO application (gpresult /h)', '', '', 'Not Started', ''],
      ['Test', 'Simulate DC failure, verify client failover', '', '', 'Not Started', ''],
      ['Test', 'Restore test (System State backup)', '', '', 'Not Started', ''],
      ['Test', 'Document known issues & mitigation', '', '', 'Not Started', ''],
    ]
  },
  'ad-upgrade': {
    title: 'AD Upgrade Checklist',
    headers: ['Phase', 'Task', 'Owner', 'Target Date', 'Status', 'Notes / Evidence'],
    rows: [
      ['PHASE 1: PRE-UPGRADE ASSESSMENT', '', '', '', '', ''],
      ['Assessment', 'Document current OS version on every DC', '', '', 'Not Started', ''],
      ['Assessment', 'Current Domain Functional Level', '', '', 'Not Started', ''],
      ['Assessment', 'Current Forest Functional Level', '', '', 'Not Started', ''],
      ['Assessment', 'Verify no legacy (NT4/2003/2008R2) DCs', '', '', 'Not Started', ''],
      ['Assessment', 'Replication is healthy (repadmin /replsummary)', '', '', 'Not Started', ''],
      ['Assessment', 'SYSVOL on DFSR (not FRS)', '', '', 'Not Started', ''],
      ['Assessment', 'dcdiag /c /e clean on all DCs', '', '', 'Not Started', ''],
      ['Assessment', 'Confirm backup success (System State, within 24h)', '', '', 'Not Started', ''],
      ['Assessment', 'Identify apps bound to specific DC IPs/names', '', '', 'Not Started', ''],
      ['PHASE 2: PREREQUISITES', '', '', '', '', ''],
      ['Prereq', 'Target Server OS media/ISO available', '', '', 'Not Started', ''],
      ['Prereq', 'Licenses available for target edition', '', '', 'Not Started', ''],
      ['Prereq', 'Maintenance window approved', '', '', 'Not Started', ''],
      ['Prereq', 'Rollback plan documented', '', '', 'Not Started', ''],
      ['Prereq', 'Schema Admin / Enterprise Admin credentials ready', '', '', 'Not Started', ''],
      ['PHASE 3: MIGRATION (Introduce → Transfer → Decommission)', '', '', '', '', ''],
      ['Migration', 'Install new DC with target OS, join domain', '', '', 'Not Started', ''],
      ['Migration', 'Install AD DS role, promote (Install-ADDSDomainController)', '', '', 'Not Started', ''],
      ['Migration', 'Wait for full replication sync', '', '', 'Not Started', ''],
      ['Migration', 'Configure DNS on new DC (AD-integrated)', '', '', 'Not Started', ''],
      ['Migration', 'Set as Global Catalog', '', '', 'Not Started', ''],
      ['Migration', 'Transfer FSMO roles to new DC', '', '', 'Not Started', ''],
      ['Migration', 'Update DHCP scope DNS options to new DC IPs', '', '', 'Not Started', ''],
      ['Migration', 'Update any hard-coded DC IPs in apps', '', '', 'Not Started', ''],
      ['Migration', 'Demote old DCs (Uninstall-ADDSDomainController)', '', '', 'Not Started', ''],
      ['Migration', 'Clean up AD Sites & Services (remove old DC refs)', '', '', 'Not Started', ''],
      ['Migration', 'Metadata cleanup if any non-graceful removals', '', '', 'Not Started', ''],
      ['PHASE 4: FUNCTIONAL LEVEL RAISE', '', '', '', '', ''],
      ['FL Raise', 'Verify all DCs on target OS', '', '', 'Not Started', ''],
      ['FL Raise', 'Set-ADDomainMode on each domain', '', '', 'Not Started', ''],
      ['FL Raise', 'Set-ADForestMode on the forest', '', '', 'Not Started', ''],
      ['FL Raise', 'Verify new DFL/FFL (Get-ADDomain, Get-ADForest)', '', '', 'Not Started', ''],
      ['PHASE 5: VALIDATION', '', '', '', '', ''],
      ['Validate', 'Replication healthy across all new DCs', '', '', 'Not Started', ''],
      ['Validate', 'DNS resolution from all client sites', '', '', 'Not Started', ''],
      ['Validate', 'Client logons succeed', '', '', 'Not Started', ''],
      ['Validate', 'GPOs apply correctly (gpresult /h)', '', '', 'Not Started', ''],
      ['Validate', 'Line-of-business apps still authenticate', '', '', 'Not Started', ''],
      ['Validate', 'Backups configured & tested on new DCs', '', '', 'Not Started', ''],
    ]
  },
  'assessment-questionnaire': {
    title: 'AD Assessment Questionnaire',
    headers: ['Category', 'Question', 'Answer', 'Risk', 'Follow-Up Action'],
    rows: [
      ['CATEGORY: SCALE & SCOPE', '', '', '', ''],
      ['Scale', 'How many user accounts (active)?', '', '', ''],
      ['Scale', 'How many computer accounts?', '', '', ''],
      ['Scale', 'How many physical sites?', '', '', ''],
      ['Scale', 'How many domains / child domains?', '', '', ''],
      ['Scale', 'How many forests / forest trusts?', '', '', ''],
      ['CATEGORY: DC INFRASTRUCTURE', '', '', '', ''],
      ['DCs', 'Total number of DCs?', '', '', ''],
      ['DCs', 'OS versions in use (list each)', '', '', ''],
      ['DCs', 'Virtualized? Hypervisor platform?', '', '', ''],
      ['DCs', 'Current Domain Functional Level?', '', '', ''],
      ['DCs', 'Current Forest Functional Level?', '', '', ''],
      ['DCs', 'FSMO role placement documented?', '', '', ''],
      ['CATEGORY: SECURITY', '', '', '', ''],
      ['Security', 'Tier model (0/1/2) implemented?', '', '', ''],
      ['Security', 'PAW used for Tier 0?', '', '', ''],
      ['Security', 'Windows LAPS deployed?', '', '', ''],
      ['Security', 'Credential Guard enabled on Tier 0?', '', '', ''],
      ['Security', 'MFA on admin accounts?', '', '', ''],
      ['Security', 'NTLMv1 disabled?', '', '', ''],
      ['Security', 'LDAP signing + channel binding enforced?', '', '', ''],
      ['Security', 'krbtgt password age (days)?', '', '', ''],
      ['Security', 'AD Recycle Bin enabled?', '', '', ''],
      ['Security', 'Defender for Identity deployed?', '', '', ''],
      ['Security', 'Audit policy configured (Account Mgmt, Kerberos)?', '', '', ''],
      ['CATEGORY: OPERATIONS', '', '', '', ''],
      ['Ops', 'Who owns AD day-to-day?', '', '', ''],
      ['Ops', 'Backup frequency and type?', '', '', ''],
      ['Ops', 'Last successful restore test date?', '', '', ''],
      ['Ops', 'Monitoring in place (SIEM / Defender / native)?', '', '', ''],
      ['Ops', 'Patching cadence for DCs?', '', '', ''],
      ['Ops', 'Change control process?', '', '', ''],
      ['CATEGORY: HYBRID / CLOUD', '', '', '', ''],
      ['Hybrid', 'Entra ID in use?', '', '', ''],
      ['Hybrid', 'Entra Connect: version, sync method?', '', '', ''],
      ['Hybrid', 'Conditional Access policies defined?', '', '', ''],
      ['Hybrid', 'Hybrid Join configured?', '', '', ''],
      ['Hybrid', 'Password writeback enabled?', '', '', ''],
      ['CATEGORY: COMPLIANCE', '', '', '', ''],
      ['Compliance', 'Password policy (min length, complexity, age)?', '', '', ''],
      ['Compliance', 'Account lockout policy?', '', '', ''],
      ['Compliance', 'Fine-grained password policies in use?', '', '', ''],
      ['Compliance', 'Service accounts documented & owned?', '', '', ''],
      ['Compliance', 'Stale account cleanup process?', '', '', ''],
    ]
  },
  'security-checklist': {
    title: 'AD Security Hardening Checklist',
    headers: ['Category', 'Control', 'Priority', 'Status', 'Evidence / Notes'],
    rows: [
      ['SECTION: IDENTITY & PRIVILEGE', '', '', '', ''],
      ['Identity', 'Implement Tier 0/1/2 admin model', 'Critical', 'Not Started', ''],
      ['Identity', 'Add Tier 0 accounts to Protected Users group', 'Critical', 'Not Started', ''],
      ['Identity', 'Use Privileged Access Workstations (PAWs)', 'Critical', 'Not Started', ''],
      ['Identity', 'Daily driver accounts separate from admin accounts', 'Critical', 'Not Started', ''],
      ['Identity', 'MFA enforced for all admin accounts', 'Critical', 'Not Started', ''],
      ['Identity', 'Deploy Windows LAPS for local admin passwords', 'High', 'Not Started', ''],
      ['Identity', 'Disable Domain Admins everyday use', 'Critical', 'Not Started', ''],
      ['SECTION: KERBEROS / AUTH', '', '', '', ''],
      ['Auth', 'Disable NTLMv1 (audit then enforce)', 'High', 'Not Started', ''],
      ['Auth', 'Enforce AES-only on service accounts', 'High', 'Not Started', ''],
      ['Auth', 'Disable WDigest cleartext caching', 'High', 'Not Started', ''],
      ['Auth', 'Enable Credential Guard (Tier 0 / Tier 1 servers)', 'Critical', 'Not Started', ''],
      ['Auth', 'LDAP signing + channel binding enforced', 'High', 'Not Started', ''],
      ['Auth', 'SMB signing required (server + client)', 'Medium', 'Not Started', ''],
      ['Auth', 'Rotate krbtgt annually (and after incidents)', 'High', 'Not Started', ''],
      ['Auth', 'Remove unconstrained Kerberos delegation', 'High', 'Not Started', ''],
      ['Auth', 'Eliminate accounts with DONT_REQ_PREAUTH', 'Medium', 'Not Started', ''],
      ['SECTION: SERVICE ACCOUNTS', '', '', '', ''],
      ['Svc', 'Use gMSA (or dMSA on WS2025) for services', 'High', 'Not Started', ''],
      ['Svc', 'Service accounts with SPNs use AES only', 'High', 'Not Started', ''],
      ['Svc', 'No service accounts in Domain Admins', 'Critical', 'Not Started', ''],
      ['Svc', 'Service account passwords 25+ chars', 'High', 'Not Started', ''],
      ['SECTION: PASSWORD POLICY', '', '', '', ''],
      ['Password', 'Domain password policy: 14+ char min, max age <=120', 'Medium', 'Not Started', ''],
      ['Password', 'Fine-grained password policy for admins (20+ char)', 'High', 'Not Started', ''],
      ['Password', 'Account lockout policy (5 attempts, 15 min)', 'Medium', 'Not Started', ''],
      ['Password', 'Banned password list / Azure AD Password Protection', 'High', 'Not Started', ''],
      ['SECTION: MONITORING / DETECTION', '', '', '', ''],
      ['Monitoring', 'Deploy Microsoft Defender for Identity', 'Critical', 'Not Started', ''],
      ['Monitoring', 'SIEM: Sentinel/Splunk/Elastic with AD connector', 'High', 'Not Started', ''],
      ['Monitoring', 'Alert on Event IDs 4720/4728/4732/4756', 'High', 'Not Started', ''],
      ['Monitoring', 'Monitor Event 4769 w/ RC4 (Kerberoasting)', 'High', 'Not Started', ''],
      ['Monitoring', 'Audit 4662 for DS-Replication-Get-Changes (DCSync)', 'Critical', 'Not Started', ''],
      ['Monitoring', 'Honey accounts / canary tokens deployed', 'Medium', 'Not Started', ''],
      ['SECTION: DC HARDENING', '', '', '', ''],
      ['DC', 'DCs run dedicated role (no apps, no RDS)', 'Critical', 'Not Started', ''],
      ['DC', 'No browsing or email on DCs', 'Critical', 'Not Started', ''],
      ['DC', 'Latest cumulative updates installed', 'High', 'Not Started', ''],
      ['DC', 'Microsoft Security Baseline applied', 'High', 'Not Started', ''],
      ['DC', 'Firewall default-deny with explicit AD ports', 'Medium', 'Not Started', ''],
      ['DC', 'AD Recycle Bin enabled', 'Medium', 'Not Started', ''],
      ['SECTION: BACKUP / RECOVERY', '', '', '', ''],
      ['Backup', 'Daily System State backup of all DCs', 'Critical', 'Not Started', ''],
      ['Backup', 'Off-site / air-gapped backup retention', 'Critical', 'Not Started', ''],
      ['Backup', 'Documented DSRM passwords (vault)', 'Critical', 'Not Started', ''],
      ['Backup', 'Quarterly restore drill performed', 'High', 'Not Started', ''],
      ['Backup', 'Forest recovery runbook exists & tested', 'Critical', 'Not Started', ''],
    ]
  },
  'best-practices': {
    title: 'AD Best Practices Audit',
    headers: ['Area', 'Best Practice', 'Current State', 'Gap', 'Remediation'],
    rows: [
      ['AREA: ARCHITECTURE', '', '', '', ''],
      ['Architecture', 'Minimum 2 DCs per domain', '', '', ''],
      ['Architecture', 'At least 1 DC per physical site', '', '', ''],
      ['Architecture', 'Global Catalog in every site', '', '', ''],
      ['Architecture', 'FSMO roles documented & monitored', '', '', ''],
      ['Architecture', 'Routable DNS namespace (not .local)', '', '', ''],
      ['Architecture', 'Empty forest root for large enterprises', '', '', ''],
      ['AREA: OU DESIGN', '', '', '', ''],
      ['OUs', 'OU structure based on delegation (not org chart)', '', '', ''],
      ['OUs', 'OU depth <= 5 levels', '', '', ''],
      ['OUs', 'Dedicated Tier 0 OU protected from inheritance', '', '', ''],
      ['OUs', 'Service account OU with restricted access', '', '', ''],
      ['AREA: GROUP STRATEGY', '', '', '', ''],
      ['Groups', 'AGDLP nesting model used', '', '', ''],
      ['Groups', 'Clear naming convention (prefix/scope)', '', '', ''],
      ['Groups', 'Owner attribute populated for all groups', '', '', ''],
      ['Groups', 'Quarterly group membership reviews', '', '', ''],
      ['AREA: GPO MANAGEMENT', '', '', '', ''],
      ['GPO', 'Microsoft Security Baseline deployed', '', '', ''],
      ['GPO', 'GPOs scoped (not applied forest-wide where avoidable)', '', '', ''],
      ['GPO', 'GPO naming convention documented', '', '', ''],
      ['GPO', 'Weekly GPO backup (Backup-GPO -All)', '', '', ''],
      ['GPO', 'Change control for GPO edits', '', '', ''],
      ['AREA: REPLICATION', '', '', '', ''],
      ['Replication', 'All DCs replicate within 15 min intra-site', '', '', ''],
      ['Replication', 'Site link costs reflect WAN bandwidth', '', '', ''],
      ['Replication', 'SYSVOL on DFSR (not legacy FRS)', '', '', ''],
      ['Replication', 'repadmin /replsummary scheduled check', '', '', ''],
      ['AREA: TIME SYNC', '', '', '', ''],
      ['Time', 'PDC Emulator syncs to external NTP', '', '', ''],
      ['Time', 'All other DCs sync from PDC Emulator', '', '', ''],
      ['Time', 'Domain members sync from any DC', '', '', ''],
      ['Time', 'Monitoring for time drift >5s', '', '', ''],
      ['AREA: OPERATIONS', '', '', '', ''],
      ['Ops', 'Change management process for AD', '', '', ''],
      ['Ops', 'Monthly patching cycle for DCs', '', '', ''],
      ['Ops', 'Stale account cleanup (90 days)', '', '', ''],
      ['Ops', 'Annual AD health assessment', '', '', ''],
      ['Ops', 'Runbooks exist for FSMO seize / forest recovery', '', '', ''],
      ['AREA: HYBRID', '', '', '', ''],
      ['Hybrid', 'Entra Connect using Password Hash Sync (preferred)', '', '', ''],
      ['Hybrid', 'Seamless SSO enabled', '', '', ''],
      ['Hybrid', 'Conditional Access policies enforcing MFA', '', '', ''],
      ['Hybrid', 'Hybrid Join configured where supported', '', '', ''],
    ]
  },
};

function downloadTemplate(key, format) {
  const tpl = TEMPLATES[key];
  if (!tpl) { toast('Template not found'); return; }
  format = (format || 'xls').toLowerCase();
  if (format === 'csv') {
    downloadCsv(`${key}-template.csv`, tpl.headers, tpl.rows);
  } else {
    const html = xlsSheetHtml(tpl.title, tpl.headers, tpl.rows);
    downloadXls(`${key}-template.xls`, html);
  }
}

function downloadAllTemplates(format) {
  format = format || 'xls';
  Object.keys(TEMPLATES).forEach((k, i) => setTimeout(() => downloadTemplate(k, format), i * 500));
}

// ===== SCROLL ANIMATIONS =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .timeline-item, .phase, .fl-item, .bp-category, .faq-item, .resource-card, .lm-card, .attack-card, .alt-card, .recipe-card, .template-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});

updateScrollProgress();
