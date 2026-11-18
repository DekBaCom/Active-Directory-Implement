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

// ===== MOBILE CHAPTER PICKER =====
// On mobile (<=960px) the hamburger opens a bottom-sheet with every chapter,
// built dynamically from the existing .nav-group structure so there is no
// duplicate list to maintain.
const mobilePicker = document.getElementById('mobilePicker');
const mobilePickerList = document.getElementById('mobilePickerList');
const mpSearchBtn = document.getElementById('mpSearchBtn');
const mpThemeBtn = document.getElementById('mpThemeBtn');
const mpFootCount = document.getElementById('mpFootCount');

function buildMobilePicker() {
  if (!mobilePickerList) return;
  const groups = document.querySelectorAll('#navLinks > .nav-group');
  let chapterCount = 0;
  const html = [...groups].map(group => {
    const btn = group.querySelector('.nav-group-btn');
    const label = btn ? btn.textContent.replace(/[▾\s]+$/, '').trim() : '';
    const links = [...group.querySelectorAll('.nav-drop-link')].map(a => {
      const num = (a.querySelector('.dl-num') || {}).textContent || '';
      const text = a.textContent.replace(num, '').trim();
      chapterCount++;
      return `<a class="mp-link" href="${a.getAttribute('href')}">
                <span class="mp-num">${num}</span>
                <span class="mp-link-text">${text}</span>
              </a>`;
    }).join('');
    return `<div class="mp-group">
              <div class="mp-group-label">${label}</div>
              ${links}
            </div>`;
  }).join('');
  mobilePickerList.innerHTML = html;
  if (mpFootCount) mpFootCount.textContent = `${chapterCount} chapters`;
}

function openMobilePicker() {
  if (!mobilePicker) return;
  mobilePicker.classList.add('open');
  mobilePicker.setAttribute('aria-hidden', 'false');
  document.body.classList.add('mp-open');
  if (navToggle) {
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  }
}
function closeMobilePicker() {
  if (!mobilePicker) return;
  mobilePicker.classList.remove('open');
  mobilePicker.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('mp-open');
  if (navToggle) {
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
}

buildMobilePicker();

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    // On mobile (hamburger visible), open the picker instead of the accordion drawer.
    const isMobile = window.matchMedia('(max-width: 960px)').matches;
    if (isMobile && mobilePicker) {
      if (mobilePicker.classList.contains('open')) closeMobilePicker();
      else openMobilePicker();
      return;
    }
    // Desktop fallback (rare; hamburger is hidden on desktop by CSS).
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

if (mobilePicker) {
  // Close on backdrop / close button / any chapter tap
  mobilePicker.addEventListener('click', (e) => {
    if (e.target.closest('[data-mp-close]')) { closeMobilePicker(); return; }
    const link = e.target.closest('.mp-link');
    if (link) {
      // Let the browser navigate; close the sheet once anchor click fires.
      setTimeout(closeMobilePicker, 0);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobilePicker.classList.contains('open')) closeMobilePicker();
  });
}
// Proxy the header icons inside the picker to the real buttons
if (mpSearchBtn) mpSearchBtn.addEventListener('click', () => {
  closeMobilePicker();
  const sb = document.getElementById('searchBtn');
  if (sb) sb.click();
});
if (mpThemeBtn) mpThemeBtn.addEventListener('click', () => {
  const tt = document.getElementById('themeToggle');
  if (tt) tt.click();
  // Keep picker open so users can see theme change immediately
});

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
  // Mirror active state into the mobile picker
  document.querySelectorAll('.mp-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
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
  { title: 'WS 2008 R2 to WS 2025 Upgrade Path', hash: '#upgrade-path', keywords: 'upgrade path windows server 2008 r2 2012 2016 2019 2022 2025 schema version 47 56 69 87 88 92 adprep forestprep domainprep frs dfsr migration long-haul' },
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
  { title: 'Entra DS Cloud-Only Architecture', hash: '#architecture', keywords: 'entra ds cloud only architecture design diagram azure vnet dc managed workloads avd files sql' },
  { title: 'Entra DS Hybrid Architecture', hash: '#architecture', keywords: 'entra ds hybrid architecture design diagram on-prem ad ds entra connect phs forest trust expressroute' },
  // Chapters 13-21 (deep-dives)
  { title: 'FSMO Roles Deep-Dive', hash: '#fsmo-roles', keywords: 'fsmo schema master domain naming rid pdc emulator infrastructure transfer seize ntdsutil metadata cleanup w32tm time hierarchy netdom query' },
  { title: 'Sites, Subnets & Replication', hash: '#sites-replication', keywords: 'sites subnets replication site link bridgehead istg kcc dfsr frs sysvol repadmin replsummary showrepl syncall intra-site inter-site' },
  { title: 'DNS for Active Directory', hash: '#dns-for-ad', keywords: 'dns ad-integrated zone srv record scavenging conditional forwarder reverse lookup ptr split-brain nltest nslookup kerberos resolution' },
  { title: 'OU Design, Delegation & Service Accounts', hash: '#ou-delegation', keywords: 'ou design delegation tier 0 1 2 paw agdlp protected users authentication policy silos gmsa dmsa managed service account kdsrootkey install-adserviceaccount' },
  { title: 'Hybrid Identity (Entra Connect)', hash: '#hybrid-identity', keywords: 'hybrid identity entra connect cloud sync phs pta federation adfs seamless sso azureadssoacc password writeback device join register hybrid-joined upn source anchor ms-ds-consistencyguid' },
  { title: 'Group Policy Deep-Dive', hash: '#group-policy', keywords: 'group policy gpo lsdou local site domain ou inheritance block enforce security filtering wmi filter loopback preferences central store admx adml gpresult gpupdate invoke-gpupdate backup-gpo' },
  { title: 'Backup, Restore & Disaster Recovery', hash: '#backup-dr', keywords: 'backup restore system state ntds.dit sysvol tombstone lifetime recycle bin authoritative non-authoritative forest recovery runbook krbtgt rotation ransomware dcpromo metadata cleanup' },
  { title: 'Monitoring & Troubleshooting', hash: '#monitoring', keywords: 'monitoring troubleshooting dcdiag repadmin event viewer event id 4624 4625 4648 4728 4768 4769 4776 5136 1644 1864 2042 lingering objects mdi sentinel perfmon ldap searches' },
  { title: 'Migration & Upgrade', hash: '#migration', keywords: 'migration upgrade in-place swing dcpromo admt pes forest functional level domain functional level ffl dfl cross-forest sidhistory cloud sync pre-flight checklist rollback' },
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
  {
    id: 'gmsa-create',
    title: 'Create a gMSA (end-to-end)',
    desc: 'Generate KDS root key (once per forest), create the gMSA, install it on target servers.',
    tags: ['delegation', 'security'],
    code: `# 1. One-time per forest - generate the KDS root key
# The -10h trick makes the key immediately usable in a lab/single-DC setup.
Add-KdsRootKey -EffectiveTime ((Get-Date).AddHours(-10))

# 2. Group that contains hosts allowed to retrieve the password
New-ADGroup -Name "gMSA-SQL-Hosts" -GroupScope Global
Add-ADGroupMember "gMSA-SQL-Hosts" -Members "SQL-01$","SQL-02$"

# 3. Create the gMSA (SamAccountName must be <= 15 chars, no trailing $)
New-ADServiceAccount -Name "svcSQL01" \`
  -DNSHostName "svcSQL01.corp.com" \`
  -PrincipalsAllowedToRetrieveManagedPassword "gMSA-SQL-Hosts" \`
  -ServicePrincipalNames "MSSQLSvc/SQL-01.corp.com:1433"

# 4. On every target host (reboot first so computer-group membership applies)
Install-ADServiceAccount -Identity "svcSQL01"
Test-ADServiceAccount    -Identity "svcSQL01"   # must return True

# 5. Configure the service: Logon As = corp\\svcSQL01$ (trailing $, blank password)`
  },
  {
    id: 'delegate-ou-pwreset',
    title: 'Delegate Password Reset on an OU',
    desc: 'Grant a helpdesk group the right to reset passwords on user objects in a specific OU - without making them Domain Admins.',
    tags: ['delegation', 'security'],
    code: `Import-Module ActiveDirectory
$ouPath   = "AD:\\OU=Users,OU=BKK,DC=corp,DC=com"
$groupSid = (Get-ADGroup "HelpDesk-BKK").SID

# GUID for Extended Right "User-Force-Change-Password"
$resetPwRight = [GUID]"00299570-246d-11d0-a768-00aa006e0529"
# Object-class GUID for 'user'
$userClass    = [GUID]"bf967aba-0de6-11d0-a285-00aa003049e2"

$acl  = Get-Acl $ouPath
$rule = New-Object System.DirectoryServices.ActiveDirectoryAccessRule(
    $groupSid, "ExtendedRight", "Allow",
    $resetPwRight, "Descendents", $userClass)
$acl.AddAccessRule($rule)
Set-Acl -Path $ouPath -AclObject $acl

# Also allow writing pwdLastSet to force 'change at next logon'
# dsacls alternative (one-liner):
# dsacls "OU=Users,OU=BKK,DC=corp,DC=com" /I:S /G "CORP\\HelpDesk-BKK:CA;Reset Password;user"`
  },
  {
    id: 'create-site-subnet',
    title: 'Create AD Site + Subnet + Move DC',
    desc: 'Build out a new physical location: create the site, map an IP subnet to it, and move the DC into it.',
    tags: ['replication'],
    code: `Import-Module ActiveDirectory
$siteName    = "Bangkok"
$subnetCidr  = "10.20.0.0/16"
$siteLink    = "DEFAULTIPSITELINK"
$dcName      = "DC-BKK-01"

# 1. Create the site (if it does not already exist)
if (-not (Get-ADReplicationSite -Filter "Name -eq '$siteName'" -ErrorAction SilentlyContinue)) {
    New-ADReplicationSite -Name $siteName
}

# 2. Associate the subnet with the site
New-ADReplicationSubnet -Name $subnetCidr -Site $siteName

# 3. Add site to a site link (so replication can flow)
Set-ADReplicationSiteLink -Identity $siteLink -SitesIncluded @{Add=$siteName}

# 4. Move the DC into its site (the NTDS Settings object gets relocated)
Move-ADDirectoryServer -Identity $dcName -Site $siteName

# 5. Verify
Get-ADReplicationSubnet -Filter * | Select Name, Site
Get-ADDomainController -Identity $dcName | Select Name, Site`
  },
  {
    id: 'find-unmapped-subnets',
    title: 'Find Unmapped Client Subnets',
    desc: 'Scan DC netlogon logs for clients logging on from subnets that are not mapped to any AD site. Classic cause of "slow logons across the WAN".',
    tags: ['replication', 'health'],
    code: `# Netlogon logs "NO_CLIENT_SITE" when a client IP does not match any subnet.
# The log is at %SystemRoot%\\debug\\netlogon.log on each DC.

$dcs = Get-ADDomainController -Filter * | Select-Object -ExpandProperty HostName

$dcs | ForEach-Object {
  $path = "\\\\$_\\admin$\\debug\\netlogon.log"
  if (Test-Path $path) {
    Select-String -Path $path -Pattern "NO_CLIENT_SITE" |
      ForEach-Object {
        if ($_ -match "NO_CLIENT_SITE:\\s+(\\S+)\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)") {
          [pscustomobject]@{
            DC     = $_
            Client = $Matches[1]
            IP     = $Matches[2]
          }
        }
      }
  }
} | Group-Object IP | Sort-Object Count -Descending |
    Select-Object Count, Name -First 20`
  },
  {
    id: 'dns-scavenging',
    title: 'Enable DNS Scavenging on All Zones',
    desc: 'Enable aging/scavenging at the server and zone level - prevents stale A records from causing Kerberos failures.',
    tags: ['dns', 'health'],
    code: `# Enable scavenging on every DNS server in the forest
Get-ADDomainController -Filter * | ForEach-Object {
  Set-DnsServerScavenging -ComputerName $_.HostName \`
    -ScavengingState $true -ScavengingInterval 7.00:00:00 \`
    -ApplyOnAllZones
}

# Enable aging on every AD-integrated primary zone
Get-DnsServerZone | Where-Object {
  $_.ZoneType -eq 'Primary' -and $_.IsDsIntegrated -eq $true
} | ForEach-Object {
  Set-DnsServerZoneAging -Name $_.ZoneName \`
    -Aging $true -RefreshInterval 7.00:00:00 -NoRefreshInterval 7.00:00:00
}

# Verify
Get-DnsServerScavenging
Get-DnsServerZoneAging -Name "corp.com"`
  },
  {
    id: 'dns-srv-check',
    title: 'Validate Critical AD SRV Records',
    desc: 'Confirm the SRV records that domain clients, Kerberos, and GC lookups depend on are present and resolvable.',
    tags: ['dns', 'health'],
    code: `$domain = (Get-ADDomain).DNSRoot
$forest = (Get-ADForest).Name

$records = @(
  "_ldap._tcp.dc._msdcs.$domain",
  "_kerberos._tcp.dc._msdcs.$domain",
  "_kerberos._tcp.$domain",
  "_ldap._tcp.pdc._msdcs.$domain",
  "_gc._tcp.$forest",
  "_ldap._tcp.gc._msdcs.$forest"
)

$records | ForEach-Object {
  $r = Resolve-DnsName -Name $_ -Type SRV -ErrorAction SilentlyContinue
  [pscustomobject]@{
    Name      = $_
    Found     = [bool]$r
    Targets   = ($r | Where-Object Type -eq 'SRV' | ForEach-Object NameTarget) -join ','
  }
} | Format-Table -AutoSize`
  },
  {
    id: 'rotate-sso-password',
    title: 'Rotate AZUREADSSOACC Password (Seamless SSO)',
    desc: 'The hidden computer account that holds the Kerberos ticket for Entra ID must be rotated every 30 days. Skipping this is a known attack path (Silver SAML).',
    tags: ['hybrid', 'security'],
    code: `# Run on the Entra Connect server as an on-prem Domain Admin + Global Admin.
Import-Module "C:\\Program Files\\Microsoft Azure Active Directory Connect\\AzureADSSO.psd1"

New-AzureADSSOAuthenticationContext    # prompts for Global Admin creds
Get-AzureADSSOStatus | ConvertFrom-Json | Format-List   # which domains are enabled?

# Rotate the password (prompts for Domain Admin creds for the on-prem account)
Update-AzureADSSOForest

# Verify - LastModified should be "just now" on AZUREADSSOACC$
Get-ADComputer AZUREADSSOACC -Properties PasswordLastSet |
  Select Name, PasswordLastSet, Enabled`
  },
  {
    id: 'entra-sync-status',
    title: 'Entra Connect: Status + Force Sync',
    desc: 'Check the current sync cycle state, last sync time, and kick off a delta or initial sync on demand.',
    tags: ['hybrid', 'health'],
    code: `# Run on the Entra Connect / Cloud Sync server
Import-Module ADSync

# Scheduler state and intervals
Get-ADSyncScheduler

# Last run of each connector
Get-ADSyncConnectorRunStatus

# Any sync errors in the current cycle
Get-ADSyncConnectorStatistics

# Trigger a delta sync (every 30 min anyway - this just does it now)
Start-ADSyncSyncCycle -PolicyType Delta

# Rare: full initial sync (long running, use only after schema changes)
# Start-ADSyncSyncCycle -PolicyType Initial`
  },
  {
    id: 'gpo-orphans',
    title: 'Find Unlinked and Orphan GPOs',
    desc: 'Report GPOs that are not linked anywhere (candidates for deletion) and SYSVOL folders that have no matching GPO object (true orphans).',
    tags: ['gpo', 'health'],
    code: `Import-Module GroupPolicy, ActiveDirectory

# 1. Unlinked GPOs - exist in AD but not linked to any site/domain/OU
$unlinked = Get-GPO -All | ForEach-Object {
  $xml = [xml](Get-GPOReport -Guid $_.Id -ReportType Xml)
  if (-not $xml.GPO.LinksTo) {
    [pscustomobject]@{
      Name        = $_.DisplayName
      Id          = $_.Id
      Created     = $_.CreationTime
      Modified    = $_.ModificationTime
    }
  }
}
$unlinked | Format-Table -AutoSize

# 2. Orphan SYSVOL folders - folder exists but no GPO in AD points to it
$domain = (Get-ADDomain).DNSRoot
$policyGuids = (Get-GPO -All).Id.Guid
Get-ChildItem "\\\\$domain\\SYSVOL\\$domain\\Policies" -Directory |
  Where-Object { ($_.Name -replace '[{}]','') -notin $policyGuids } |
  Select Name, LastWriteTime`
  },
  {
    id: 'metadata-cleanup',
    title: 'Metadata Cleanup for a Dead DC',
    desc: 'Remove all AD, DNS and Sites references for a DC that was not demoted gracefully. Run after confirming the DC is permanently gone.',
    tags: ['backup', 'replication'],
    code: `# Replace with the dead DC's short name
$deadDC = "DC-OLD-01"
$site   = "Bangkok"

# 1. Remove from AD (requires RSAT AD module, Server 2008 R2+)
Remove-ADDomainController -Identity $deadDC -ForceRemoval

# If the above fails (DC was never promoted cleanly), fall back to ntdsutil:
# ntdsutil "metadata cleanup" "remove selected server $deadDC" quit quit

# 2. Clean up Sites and Services - NTDS Settings object and server
Remove-ADObject -Identity "CN=NTDS Settings,CN=$deadDC,CN=Servers,CN=$site,CN=Sites,CN=Configuration,$((Get-ADDomain).DistinguishedName.Replace('DC=','DC='))" -Recursive -Confirm:$false

# 3. Remove the DNS host records
Get-DnsServerResourceRecord -ZoneName (Get-ADDomain).DNSRoot |
  Where-Object { $_.RecordData.IPv4Address -or $_.HostName -like "*$deadDC*" } |
  ForEach-Object {
    Remove-DnsServerResourceRecord -ZoneName (Get-ADDomain).DNSRoot \`
      -InputObject $_ -Force -Confirm:$false
  }

# 4. Validate
Get-ADDomainController -Filter * | Select Name, Site
dcdiag /test:kccevent`
  },
  {
    id: 'restore-deleted-object',
    title: 'Restore a Deleted Object from Recycle Bin',
    desc: 'Recover a user, group, or whole OU that was accidentally deleted - as long as you are inside the tombstone lifetime window (180 days default).',
    tags: ['backup'],
    code: `# Prereq: AD Recycle Bin must already be enabled
# Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target (Get-ADForest).Name

# Find the deleted object (works for users, groups, OUs, computers)
$deleted = Get-ADObject -Filter 'IsDeleted -eq $true -and Name -like "*Smith*"' \`
  -IncludeDeletedObjects -Properties LastKnownParent, SamAccountName, whenChanged |
  Select Name, SamAccountName, LastKnownParent, whenChanged, ObjectGUID
$deleted | Format-Table -AutoSize

# Restore in place (parent OU must still exist)
$deleted | ForEach-Object {
  Restore-ADObject -Identity $_.ObjectGUID
}

# If the parent OU was also deleted, restore that FIRST:
# Restore-ADObject -Identity <OU-GUID>
# then restore children.

# If outside tombstone lifetime - the object is truly gone and must be
# recreated. Recycle Bin is NOT a replacement for backups.`
  },
  {
    id: 'preflight-fl-raise',
    title: 'Pre-Flight Check Before Raising FFL/DFL',
    desc: 'Validate that every DC is on the target OS, replication is clean, and SYSVOL is on DFSR - the three blockers to a successful functional-level raise.',
    tags: ['migration', 'health'],
    code: `Import-Module ActiveDirectory

Write-Host "\`n== 1. Current functional levels ==" -ForegroundColor Cyan
Get-ADForest | Select ForestMode, Name
Get-ADDomain | Select DomainMode, DNSRoot

Write-Host "\`n== 2. Oldest DC OS ==" -ForegroundColor Cyan
Get-ADDomainController -Filter * |
  Select Name, OperatingSystem, OperatingSystemVersion, Site |
  Sort OperatingSystem

Write-Host "\`n== 3. Replication health ==" -ForegroundColor Cyan
repadmin /replsummary

Write-Host "\`n== 4. SYSVOL on DFSR? (3 = Eliminated / DFSR, anything else = FRS) ==" -ForegroundColor Cyan
dfsrmig /GetMigrationState

Write-Host "\`n== 5. dcdiag quick check ==" -ForegroundColor Cyan
dcdiag /e /q

Write-Host "\`n== 6. Schema version ==" -ForegroundColor Cyan
(Get-ADObject "CN=Schema,$((Get-ADRootDSE).configurationNamingContext)" \`
  -Properties objectVersion).objectVersion
# 47=2003R2 56=2008R2 69=2016 87=2019 88=2022 92=2025`
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
      ['Planning', 'Define admin tier model (Tier 0/1/2) and PAW scope', '', '', 'Not Started', ''],
      ['Planning', 'Hybrid identity plan (Entra Connect now or later)', '', '', 'Not Started', ''],
      ['Planning', 'DNS strategy (split-brain vs delegation vs stand-alone)', '', '', 'Not Started', ''],
      ['Planning', 'Decide service account strategy (gMSA / dMSA on WS2025)', '', '', 'Not Started', ''],
      ['PHASE 2: INFRASTRUCTURE PREP', '', '', '', '', ''],
      ['Prep', 'Provision DC VMs (recommended 4 vCPU, 8 GB RAM, 100 GB OS, dedicated disk for NTDS/SYSVOL)', '', '', 'Not Started', ''],
      ['Prep', 'Enforce hypervisor anti-affinity (no 2 DCs on same host)', '', '', 'Not Started', ''],
      ['Prep', 'Install Windows Server, patch fully', '', '', 'Not Started', ''],
      ['Prep', 'Rename server before promotion', '', '', 'Not Started', ''],
      ['Prep', 'Configure static IP + DNS (point to another DC, loopback as secondary)', '', '', 'Not Started', ''],
      ['Prep', 'Enable BitLocker on OS volume and NTDS volume', '', '', 'Not Started', ''],
      ['Prep', 'Open firewall ports (53, 88, 135, 389, 445, 636, 3268, 3269, 49152-65535)', '', '', 'Not Started', ''],
      ['Prep', 'Disable Print Spooler service on DCs (PrintNightmare)', '', '', 'Not Started', ''],
      ['Prep', 'Disable SMB1, enforce SMB2+ signing', '', '', 'Not Started', ''],
      ['Prep', 'Disable TLS 1.0 / 1.1 on DCs', '', '', 'Not Started', ''],
      ['Prep', 'Enable NTP sync on PDC Emulator to external source', '', '', 'Not Started', ''],
      ['PHASE 3: AD DS DEPLOYMENT', '', '', '', '', ''],
      ['Deploy', 'Install AD DS role (Install-WindowsFeature)', '', '', 'Not Started', ''],
      ['Deploy', 'Promote first DC (Install-ADDSForest)', '', '', 'Not Started', ''],
      ['Deploy', 'Verify forest/schema (Get-ADForest, Get-ADObject -SearchBase "CN=Schema...")', '', '', 'Not Started', ''],
      ['Deploy', 'Install additional DCs (Install-ADDSDomainController)', '', '', 'Not Started', ''],
      ['Deploy', 'Verify replication (repadmin /replsummary + /showrepl)', '', '', 'Not Started', ''],
      ['Deploy', 'Verify DNS (nslookup SRV _ldap._tcp.dc._msdcs, zones populated)', '', '', 'Not Started', ''],
      ['Deploy', 'Confirm FSMO placement (netdom query fsmo)', '', '', 'Not Started', ''],
      ['Deploy', 'Confirm SYSVOL on DFSR and healthy', '', '', 'Not Started', ''],
      ['PHASE 4: POST-DEPLOYMENT', '', '', '', '', ''],
      ['Post', 'Build OU structure with explicit Tier 0 OU', '', '', 'Not Started', ''],
      ['Post', 'Redirect default Users and Computers containers (redirusr / redircmp)', '', '', 'Not Started', ''],
      ['Post', 'Protect critical OUs from accidental deletion', '', '', 'Not Started', ''],
      ['Post', 'Create baseline GPOs + apply Microsoft Security Baseline', '', '', 'Not Started', ''],
      ['Post', 'Enable AD Recycle Bin (IRREVERSIBLE)', '', '', 'Not Started', ''],
      ['Post', 'Raise functional level after all DCs stable', '', '', 'Not Started', ''],
      ['Post', 'Create admin tier accounts (Tier 0/1/2) + Protected Users', '', '', 'Not Started', ''],
      ['Post', 'Enable Windows LAPS for local admin passwords', '', '', 'Not Started', ''],
      ['Post', 'Configure time sync hierarchy (PDC -> external NTP)', '', '', 'Not Started', ''],
      ['Post', 'Document admin/DSRM passwords in secure vault', '', '', 'Not Started', ''],
      ['Post', 'Baseline backup (System State) and off-site copy', '', '', 'Not Started', ''],
      ['Post', 'Configure auditing (Account Mgmt, DS Access, Logon, Kerberos)', '', '', 'Not Started', ''],
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
      ['Assessment', 'DNS zones + scavenging settings documented', '', '', 'Not Started', ''],
      ['Assessment', 'Service accounts inventoried (SPNs, passwords)', '', '', 'Not Started', ''],
      ['Assessment', 'Legacy protocol audit (NTLMv1, SMB1, TLS 1.0/1.1)', '', '', 'Not Started', ''],
      ['PHASE 2: PREREQUISITES', '', '', '', '', ''],
      ['Prereq', 'Target Server OS media/ISO available', '', '', 'Not Started', ''],
      ['Prereq', 'Licenses available for target edition', '', '', 'Not Started', ''],
      ['Prereq', 'Schema prep run (adprep /forestprep, /domainprep)', '', '', 'Not Started', ''],
      ['Prereq', 'Schema version matches target (69 for WS 2016, 88 for WS 2025)', '', '', 'Not Started', ''],
      ['Prereq', 'Application compatibility tested (SSO, LDAP binds)', '', '', 'Not Started', ''],
      ['Prereq', 'Pilot DC introduced 2+ weeks before production', '', '', 'Not Started', ''],
      ['Prereq', 'Maintenance window approved', '', '', 'Not Started', ''],
      ['Prereq', 'Rollback plan documented + tested in lab', '', '', 'Not Started', ''],
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
      ['DCs', 'Replication topology (sites, links, costs) documented?', '', '', ''],
      ['CATEGORY: DNS', '', '', '', ''],
      ['DNS', 'AD-integrated DNS zones (list)', '', '', ''],
      ['DNS', 'Conditional forwarders configured?', '', '', ''],
      ['DNS', 'Scavenging + aging enabled?', '', '', ''],
      ['DNS', 'Split-brain DNS in use?', '', '', ''],
      ['DNS', 'Zone replication scope (forest vs domain)?', '', '', ''],
      ['CATEGORY: SERVICE ACCOUNTS', '', '', '', ''],
      ['Svc', 'Total number of service accounts?', '', '', ''],
      ['Svc', 'gMSA / dMSA adoption (count)?', '', '', ''],
      ['Svc', 'Service accounts with SPNs (count)?', '', '', ''],
      ['Svc', 'Service accounts in Domain Admins (count - should be 0)?', '', '', ''],
      ['Svc', 'Oldest service account password age?', '', '', ''],
      ['CATEGORY: LEGACY PROTOCOLS', '', '', '', ''],
      ['Legacy', 'NTLMv1 usage (audit events 8001-8004)?', '', '', ''],
      ['Legacy', 'SMB1 enabled anywhere?', '', '', ''],
      ['Legacy', 'TLS 1.0 / 1.1 still allowed?', '', '', ''],
      ['Legacy', 'Unconstrained Kerberos delegation (count)?', '', '', ''],
      ['Legacy', 'Accounts with DONT_REQ_PREAUTH (count)?', '', '', ''],
      ['Legacy', 'Accounts with password-never-expires (count)?', '', '', ''],
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
      ['DC', 'Print Spooler service disabled on DCs (PrintNightmare)', 'Critical', 'Not Started', ''],
      ['DC', 'SMB1 disabled; SMB2+ signing enforced', 'High', 'Not Started', ''],
      ['DC', 'TLS 1.0 / 1.1 disabled; TLS 1.2+ enforced', 'High', 'Not Started', ''],
      ['DC', 'BitLocker on OS volume and NTDS volume', 'Medium', 'Not Started', ''],
      ['DC', 'Latest cumulative updates installed', 'High', 'Not Started', ''],
      ['DC', 'Microsoft Security Baseline applied', 'High', 'Not Started', ''],
      ['DC', 'Firewall default-deny with explicit AD ports', 'Medium', 'Not Started', ''],
      ['DC', 'AD Recycle Bin enabled', 'Medium', 'Not Started', ''],
      ['SECTION: AD HYGIENE', '', '', '', ''],
      ['Hygiene', 'AdminSDHolder ACL reviewed; no stale protected accounts', 'High', 'Not Started', ''],
      ['Hygiene', 'SYSVOL scanned for GPP cpassword (and removed)', 'High', 'Not Started', ''],
      ['Hygiene', 'Nested / shadow admin audit (BloodHound or similar)', 'High', 'Not Started', ''],
      ['Hygiene', 'Stale computer accounts disabled (>90 days)', 'Medium', 'Not Started', ''],
      ['Hygiene', 'Accounts with password-never-expires reviewed', 'Medium', 'Not Started', ''],
      ['Hygiene', 'Unconstrained Kerberos delegation eliminated', 'High', 'Not Started', ''],
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
      ['AREA: DNS', '', '', '', ''],
      ['DNS', 'AD-integrated primary zones only (no file-based)', '', '', ''],
      ['DNS', 'Scavenging and aging enabled with sensible intervals', '', '', ''],
      ['DNS', 'Conditional forwarders for partner domains', '', '', ''],
      ['DNS', 'No external root hints from internal DNS', '', '', ''],
      ['DNS', 'Reverse lookup zones populated', '', '', ''],
      ['AREA: BACKUP / DR', '', '', '', ''],
      ['Backup', 'Daily System State backup of all DCs', '', '', ''],
      ['Backup', 'Backups held at least 180 days (tombstone lifetime)', '', '', ''],
      ['Backup', 'At least one off-site or air-gapped copy', '', '', ''],
      ['Backup', 'DSRM password stored in secure vault', '', '', ''],
      ['Backup', 'Quarterly non-authoritative restore drill performed', '', '', ''],
      ['Backup', 'Forest-recovery runbook exists and was tested in the last year', '', '', ''],
      ['AREA: MONITORING', '', '', '', ''],
      ['Monitoring', 'Microsoft Defender for Identity deployed', '', '', ''],
      ['Monitoring', 'SIEM ingesting DC security logs (Sentinel / Splunk / Elastic)', '', '', ''],
      ['Monitoring', 'Alerts configured on 4720 / 4728 / 4732 / 4756', '', '', ''],
      ['Monitoring', 'Alert on Event 4769 with RC4 (Kerberoasting)', '', '', ''],
      ['Monitoring', 'Alert on Event 4662 DS-Replication-Get-Changes (DCSync)', '', '', ''],
      ['Monitoring', 'Replication health dashboard', '', '', ''],
      ['AREA: HYBRID', '', '', '', ''],
      ['Hybrid', 'Entra Connect using Password Hash Sync (preferred)', '', '', ''],
      ['Hybrid', 'Seamless SSO enabled', '', '', ''],
      ['Hybrid', 'Conditional Access policies enforcing MFA', '', '', ''],
      ['Hybrid', 'Hybrid Join configured where supported', '', '', ''],
      ['Hybrid', 'Entra Connect Health agent installed and reporting', '', '', ''],
    ]
  },
  'fsmo-replication-topology': {
    title: 'FSMO & Replication Topology Worksheet',
    headers: ['Section', 'Item', 'Value / Holder', 'Site', 'Notes'],
    rows: [
      ['SECTION: FSMO ROLE HOLDERS', '', '', '', ''],
      ['FSMO', 'Schema Master (forest)', '', '', 'Co-locate with Domain Naming on forest root'],
      ['FSMO', 'Domain Naming Master (forest)', '', '', 'Forest root DC'],
      ['FSMO', 'PDC Emulator (per domain)', '', '', 'Best-connected DC; time source; GPO author target'],
      ['FSMO', 'RID Master (per domain)', '', '', 'Reliable DC in each domain'],
      ['FSMO', 'Infrastructure Master (per domain)', '', '', 'Non-GC in multi-domain forest; anywhere if single-domain or all-GC'],
      ['FSMO', 'FSMO placement reviewed in last 12 months', '', '', 'Audit cadence'],
      ['FSMO', 'Seize procedure documented and tested', '', '', ''],
      ['SECTION: DOMAIN CONTROLLERS', '', '', '', ''],
      ['DC', 'DC-01 name / OS / IP', '', '', ''],
      ['DC', 'DC-02 name / OS / IP', '', '', ''],
      ['DC', 'DC-03 name / OS / IP', '', '', ''],
      ['DC', 'DC-04 name / OS / IP', '', '', ''],
      ['DC', 'DC-05 name / OS / IP', '', '', ''],
      ['DC', 'Oldest DC OS version', '', '', 'Blocker for FFL/DFL raise'],
      ['DC', 'Number of Global Catalogs per site', '', '', 'Min 1 per site'],
      ['DC', 'Any RODCs?', '', '', ''],
      ['SECTION: AD SITES', '', '', '', ''],
      ['Site', 'Site 1 name / location', '', '', ''],
      ['Site', 'Site 2 name / location', '', '', ''],
      ['Site', 'Site 3 name / location', '', '', ''],
      ['Site', 'Default-First-Site-Name still contains DCs?', '', '', 'Should be No - move everything out'],
      ['SECTION: SUBNETS', '', '', '', ''],
      ['Subnet', 'Subnet 1 CIDR -> Site', '', '', ''],
      ['Subnet', 'Subnet 2 CIDR -> Site', '', '', ''],
      ['Subnet', 'Subnet 3 CIDR -> Site', '', '', ''],
      ['Subnet', 'Unmapped subnets found in netlogon.log?', '', '', 'Event 5807'],
      ['SECTION: SITE LINKS', '', '', '', ''],
      ['Link', 'Site Link 1 (sites, cost, interval)', '', '', ''],
      ['Link', 'Site Link 2 (sites, cost, interval)', '', '', ''],
      ['Link', 'Site Link 3 (sites, cost, interval)', '', '', ''],
      ['Link', 'Any preferred bridgeheads configured?', '', '', 'Usually unnecessary'],
      ['SECTION: REPLICATION HEALTH', '', '', '', ''],
      ['Health', 'repadmin /replsummary clean on all DCs', '', '', ''],
      ['Health', 'SYSVOL on DFSR (not FRS)', '', '', 'dfsrmig /GetMigrationState = 3'],
      ['Health', 'Longest replication latency observed (min)', '', '', ''],
      ['Health', 'Lingering objects found in last audit?', '', '', 'repadmin /removelingeringobjects'],
      ['Health', 'dcdiag /test:replications clean on all DCs', '', '', ''],
    ]
  },
  'dns-inventory': {
    title: 'DNS Zone & SRV Record Inventory',
    headers: ['Category', 'Item', 'Value / Status', 'Notes'],
    rows: [
      ['CATEGORY: FORWARD ZONES', '', '', ''],
      ['Zone', 'Primary AD-integrated zone name', '', 'e.g., corp.com'],
      ['Zone', 'Replication scope (forest / domain)', '', 'Forest for multi-domain'],
      ['Zone', 'Secure dynamic updates only?', '', 'Must be yes'],
      ['Zone', 'Additional application partitions?', '', ''],
      ['Zone', 'Any file-backed primary zones?', '', 'Should be No for AD zones'],
      ['CATEGORY: REVERSE ZONES', '', '', ''],
      ['Reverse', 'Reverse zone for subnet 1 exists', '', ''],
      ['Reverse', 'Reverse zone for subnet 2 exists', '', ''],
      ['Reverse', 'Reverse zone for subnet 3 exists', '', ''],
      ['Reverse', 'PTR records for every DC exist and resolve', '', 'nslookup <DC-IP>'],
      ['CATEGORY: FORWARDERS', '', '', ''],
      ['Forwarder', 'Root hints disabled where internal-only', '', ''],
      ['Forwarder', 'Primary external forwarder', '', 'ISP or 1.1.1.1 / 8.8.8.8'],
      ['Forwarder', 'Secondary external forwarder', '', ''],
      ['Forwarder', 'Conditional forwarder - partner domain 1', '', ''],
      ['Forwarder', 'Conditional forwarder - partner domain 2', '', ''],
      ['Forwarder', 'Conditional forwarder - trusted forest', '', ''],
      ['CATEGORY: SCAVENGING', '', '', ''],
      ['Scavenging', 'Server-level scavenging enabled on every DC', '', 'Get-DnsServerScavenging'],
      ['Scavenging', 'Zone-level aging enabled on every AD zone', '', 'Get-DnsServerZoneAging'],
      ['Scavenging', 'No-Refresh interval (default 7 days)', '', ''],
      ['Scavenging', 'Refresh interval (default 7 days)', '', ''],
      ['Scavenging', 'Scavenging period (default 7 days)', '', ''],
      ['CATEGORY: SRV RECORDS (must resolve)', '', '', ''],
      ['SRV', '_ldap._tcp.dc._msdcs.<domain>', '', 'Locate any DC'],
      ['SRV', '_kerberos._tcp.dc._msdcs.<domain>', '', 'Kerberos KDC'],
      ['SRV', '_kerberos._tcp.<domain>', '', ''],
      ['SRV', '_ldap._tcp.pdc._msdcs.<domain>', '', 'Find PDC'],
      ['SRV', '_gc._tcp.<forest>', '', 'GC discovery, port 3268'],
      ['SRV', '_ldap._tcp.gc._msdcs.<forest>', '', ''],
      ['SRV', 'Per-site SRV _ldap._tcp.<site>._sites.dc._msdcs.<domain>', '', 'Locate DC in client site'],
      ['CATEGORY: SPLIT-BRAIN / PUBLIC', '', '', ''],
      ['Split', 'Internal AD namespace != public domain, OR split-brain owned', '', ''],
      ['Split', 'External A records that could shadow internal ones audited', '', ''],
      ['Split', 'DNSSEC on public zone (if applicable)', '', ''],
      ['CATEGORY: CLIENT DNS CONFIG', '', '', ''],
      ['Client', 'DCs point primary DNS at another DC, secondary at loopback', '', 'No island mode'],
      ['Client', 'DHCP scopes hand out AD DNS servers (no public resolvers)', '', ''],
      ['Client', 'VPN clients receive internal DNS', '', ''],
      ['Client', 'dcdiag /test:dns /v clean', '', ''],
    ]
  },
  'gpo-inventory': {
    title: 'GPO Inventory & Audit Worksheet',
    headers: ['Category', 'GPO / Setting', 'Scope / Link', 'Status', 'Notes'],
    rows: [
      ['CATEGORY: FOUNDATIONAL GPOS', '', '', '', ''],
      ['Foundational', 'Default Domain Policy (passwords / lockout ONLY)', 'Domain root', '', 'Do not add other settings here'],
      ['Foundational', 'Default Domain Controllers Policy', 'Domain Controllers OU', '', 'Keep MS defaults; add new GPO for custom'],
      ['Foundational', 'Microsoft Security Baseline - Member Server', 'Member servers OU', '', 'From Security Compliance Toolkit'],
      ['Foundational', 'Microsoft Security Baseline - Domain Controller', 'Domain Controllers OU', '', ''],
      ['Foundational', 'Microsoft Security Baseline - Windows 10/11', 'Workstations OU', '', ''],
      ['CATEGORY: SECURITY HARDENING', '', '', '', ''],
      ['Hardening', 'Disable SMB1', 'All computers', '', ''],
      ['Hardening', 'SMB signing required', 'All computers', '', ''],
      ['Hardening', 'LDAP signing + channel binding required', 'Domain Controllers', '', ''],
      ['Hardening', 'TLS 1.0 / 1.1 disabled', 'All servers', '', ''],
      ['Hardening', 'WDigest cleartext disabled', 'All computers', '', ''],
      ['Hardening', 'Credential Guard enabled', 'Tier 0 / Tier 1 servers', '', ''],
      ['Hardening', 'Restricted Admin for RDP', 'All servers', '', ''],
      ['Hardening', 'Windows LAPS policy', 'All computers', '', ''],
      ['Hardening', 'Print Spooler disabled on DCs', 'Domain Controllers', '', 'PrintNightmare'],
      ['CATEGORY: USER EXPERIENCE', '', '', '', ''],
      ['UX', 'Drive mappings (GPP)', 'User OUs', '', 'Item-level targeting'],
      ['UX', 'Printer deployment (GPP)', 'Site or OU', '', ''],
      ['UX', 'Desktop background / corporate branding', 'User OUs', '', ''],
      ['UX', 'OneDrive Known Folder Move', 'User OUs', '', ''],
      ['CATEGORY: AUDIT POLICY', '', '', '', ''],
      ['Audit', 'Advanced Audit Policy baseline', 'All computers', '', 'Not legacy audit policy'],
      ['Audit', 'Credential validation (4776) success+failure', 'Domain Controllers', '', ''],
      ['Audit', 'Kerberos auth service (4768/4771)', 'Domain Controllers', '', ''],
      ['Audit', 'Kerberos service ticket (4769)', 'Domain Controllers', '', ''],
      ['Audit', 'Account management (4720/4728/4732)', 'All DCs', '', ''],
      ['Audit', 'DS Access (4662) for sensitive attributes', 'Domain Controllers', '', 'DCSync detection'],
      ['CATEGORY: HYGIENE', '', '', '', ''],
      ['Hygiene', 'Unlinked GPOs cleaned up quarterly', '', '', 'Audit via Get-GPOReport'],
      ['Hygiene', 'Orphan SYSVOL folders removed', '', '', ''],
      ['Hygiene', 'WMI filters inventoried; stale ones removed', '', '', ''],
      ['Hygiene', 'Central Store populated with latest ADMX', '', '', '\\\\<domain>\\SYSVOL\\<domain>\\Policies\\PolicyDefinitions'],
      ['Hygiene', 'Vendor ADMX (Chrome, Firefox, Office) in Central Store', '', '', ''],
      ['Hygiene', 'GPP cpassword audit (MS14-025) clean', '', '', 'grep SYSVOL for cpassword'],
      ['Hygiene', 'Loopback processing GPOs documented', '', '', 'Merge vs Replace'],
      ['Hygiene', 'Block Inheritance on any OU - documented reason', '', '', ''],
      ['Hygiene', 'Enforced GPO links inventoried', '', '', ''],
      ['CATEGORY: CHANGE CONTROL', '', '', '', ''],
      ['Change', 'Weekly Backup-GPO -All to secure location', '', '', ''],
      ['Change', 'GPO change goes through change ticket', '', '', ''],
      ['Change', 'Pre-prod GPO test environment exists', '', '', ''],
      ['Change', 'GPO owner and purpose documented in Description', '', '', ''],
    ]
  },
  'backup-dr-runbook': {
    title: 'Backup, Restore & Forest Recovery Runbook',
    headers: ['Phase', 'Step', 'Owner', 'Target / Result', 'Status', 'Evidence'],
    rows: [
      ['PHASE 0: STANDING STATE', '', '', '', '', ''],
      ['Baseline', 'AD Recycle Bin enabled', '', '', 'Not Started', ''],
      ['Baseline', 'Daily System State backup of every DC', '', '', 'Not Started', ''],
      ['Baseline', 'At least 2 DCs per domain backed up on different schedules', '', '', 'Not Started', ''],
      ['Baseline', 'Backup retention >= 180 days (tombstone lifetime)', '', '', 'Not Started', ''],
      ['Baseline', 'One off-site / air-gapped copy weekly', '', '', 'Not Started', ''],
      ['Baseline', 'DSRM password stored in secure vault (per DC)', '', '', 'Not Started', ''],
      ['Baseline', 'Weekly GPO backup (Backup-GPO -All)', '', '', 'Not Started', ''],
      ['Baseline', 'CA database backup (if AD CS)', '', '', 'Not Started', ''],
      ['Baseline', 'DHCP + DNS export scheduled', '', '', 'Not Started', ''],
      ['PHASE 1: QUARTERLY DRILL - SINGLE DC RESTORE', '', '', '', '', ''],
      ['Drill', 'Pick one DC, restore from last backup to isolated lab network', '', '', 'Not Started', ''],
      ['Drill', 'Non-authoritative restore boots cleanly', '', '', 'Not Started', ''],
      ['Drill', 'Replication converges with partners in lab', '', '', 'Not Started', ''],
      ['Drill', 'Document time-to-restore (RTO) vs target', '', '', 'Not Started', ''],
      ['PHASE 2: AUTHORITATIVE RESTORE (OU / OBJECT)', '', '', '', '', ''],
      ['Authoritative', 'Identify deleted object GUID', '', '', 'Not Started', ''],
      ['Authoritative', 'Try AD Recycle Bin first (fast path)', '', '', 'Not Started', ''],
      ['Authoritative', 'If outside Recycle Bin - boot DC in DSRM', '', '', 'Not Started', ''],
      ['Authoritative', 'ntdsutil "authoritative restore" "restore subtree <DN>"', '', '', 'Not Started', ''],
      ['Authoritative', 'Reboot, verify object exists, verify USN bumped', '', '', 'Not Started', ''],
      ['Authoritative', 'Force replication outbound to partners', '', '', 'Not Started', ''],
      ['PHASE 3: FOREST RECOVERY (RANSOMWARE / COMPROMISE)', '', '', '', '', ''],
      ['Forest', 'Incident declared - isolate every DC from network', '', '', 'Not Started', ''],
      ['Forest', 'Identify last-known-good System State per domain', '', '', 'Not Started', ''],
      ['Forest', 'Pick one DC per domain, restore to isolated network', '', '', 'Not Started', ''],
      ['Forest', 'Seize all FSMO roles onto restored DC', '', '', 'Not Started', ''],
      ['Forest', 'Metadata cleanup of every other DC', '', '', 'Not Started', ''],
      ['Forest', 'Raise RID pool and invalidate current pool', '', '', 'Not Started', ''],
      ['Forest', 'Reset krbtgt password (TWICE, 10h+ apart)', '', '', 'Not Started', ''],
      ['Forest', 'Reset trust passwords for all trusts', '', '', 'Not Started', ''],
      ['Forest', 'Reset computer account passwords for all DCs', '', '', 'Not Started', ''],
      ['Forest', 'Reset all privileged user passwords', '', '', 'Not Started', ''],
      ['Forest', 'Clean DNS and SYSVOL of stale records', '', '', 'Not Started', ''],
      ['Forest', 'Rebuild remaining DCs from scratch (DCPROMO)', '', '', 'Not Started', ''],
      ['Forest', 'Reconnect to production network - monitored', '', '', 'Not Started', ''],
      ['Forest', 'Post-recovery audit for persistence mechanisms', '', '', 'Not Started', ''],
      ['PHASE 4: COMMUNICATIONS', '', '', '', '', ''],
      ['Comms', 'Who declares the incident?', '', '', 'Not Started', ''],
      ['Comms', 'Who notifies legal / compliance?', '', '', 'Not Started', ''],
      ['Comms', 'Who speaks to execs / board?', '', '', 'Not Started', ''],
      ['Comms', 'Who speaks to customers / press?', '', '', 'Not Started', ''],
      ['Comms', 'Status page / internal channel for updates', '', '', 'Not Started', ''],
      ['Comms', 'Postmortem (blameless) within 14 days', '', '', 'Not Started', ''],
    ]
  },
  'event-id-alerts': {
    title: 'AD Event ID Alert Catalogue',
    headers: ['Event ID', 'Log', 'What it means', 'Severity', 'Baseline / Threshold', 'SIEM Action'],
    rows: [
      ['SECTION: AUTHENTICATION', '', '', '', '', ''],
      ['4624', 'Security', 'Successful logon (type 3 = network, 10 = RDP, 2 = interactive)', 'Info', 'Baseline per account', 'Correlate; profile'],
      ['4625', 'Security', 'Failed logon', 'Warning', 'Spike > 10/min per user', 'Password spray alert'],
      ['4648', 'Security', 'Explicit credential use (runas)', 'Warning', 'Any from non-admin workstation', 'Lateral movement signal'],
      ['4672', 'Security', 'Special privileges assigned at logon (admin)', 'Info', 'Match against known admin accounts', 'Flag unknown accounts'],
      ['4768', 'Security', 'Kerberos TGT requested', 'Info', 'Per-user baseline', 'Spray: many users, same source'],
      ['4769', 'Security', 'Kerberos service ticket requested', 'Info-Warning', 'RC4 + privileged = Kerberoasting', 'Alert on RC4 (0x17)'],
      ['4771', 'Security', 'Kerberos pre-auth failed', 'Warning', 'Spike > 10/min', 'Password spray'],
      ['4776', 'Security', 'NTLM auth attempted', 'Warning', 'Should trend to zero over time', 'Alert on NTLMv1'],
      ['SECTION: ACCOUNT MANAGEMENT', '', '', '', '', ''],
      ['4720', 'Security', 'User account created', 'Alert', 'Any outside change window', 'High-priority alert'],
      ['4722', 'Security', 'User account enabled', 'Warning', 'Correlate with 4725', ''],
      ['4725', 'Security', 'User account disabled', 'Warning', '', ''],
      ['4726', 'Security', 'User account deleted', 'Alert', '', 'Correlate with ticket'],
      ['4728', 'Security', 'Member added to global group', 'Alert', 'Privileged groups = critical', 'Alert on DA / EA / Schema'],
      ['4732', 'Security', 'Member added to domain-local group', 'Alert', 'Same', ''],
      ['4756', 'Security', 'Member added to universal group', 'Alert', 'Enterprise Admins = critical', ''],
      ['4738', 'Security', 'User account changed', 'Warning', 'Watch adminCount, SPN additions', ''],
      ['4740', 'Security', 'User account locked out', 'Info-Warning', 'Spike = spray', ''],
      ['SECTION: DS OBJECT ACCESS', '', '', '', '', ''],
      ['4662', 'Security', 'DS object access (requires audit policy)', 'Variable', 'DS-Replication-Get-Changes GUID = DCSync', 'Alert on DCSync by non-DC'],
      ['5136', 'Security', 'Directory object modified', 'Warning', 'Sensitive OUs / attrs', ''],
      ['5137', 'Security', 'Directory object created', 'Warning', '', ''],
      ['5141', 'Security', 'Directory object deleted', 'Warning', '', ''],
      ['SECTION: DIRECTORY SERVICE', '', '', '', '', ''],
      ['1202', 'Directory Service', 'Expired security protocol SSL/TLS used', 'Warning', '', ''],
      ['1644', 'Directory Service', 'Expensive / inefficient LDAP query', 'Warning', 'Any > 1 per minute', 'App misbehaving'],
      ['1864', 'Directory Service', 'Replication partner not available for N days', 'Alert', '>3 days = alert', ''],
      ['2042', 'Directory Service', 'Replication outside tombstone lifetime', 'Alert', 'Any occurrence', 'Lingering objects - clean up'],
      ['SECTION: DNS SERVER', '', '', '', '', ''],
      ['4013', 'DNS Server', 'AD-integrated zone data not yet loaded', 'Warning', 'Startup only', ''],
      ['4015', 'DNS Server', 'AD-integrated DNS failed to load zone', 'Alert', 'Any', 'DNS broken on this DC'],
      ['4016', 'DNS Server', 'AD-integrated DNS replication problem', 'Alert', 'Any', ''],
      ['SECTION: NETLOGON', '', '', '', '', ''],
      ['5807', 'System', 'Client logon from unmapped subnet', 'Warning', 'Spike = missing subnet', 'Add subnet to AD site'],
      ['5722', 'System', 'Secure channel to workstation broken', 'Warning', '', ''],
      ['SECTION: DFSR / SYSVOL', '', '', '', '', ''],
      ['2213', 'DFS Replication', 'DFSR volume recovery completed', 'Info', '', ''],
      ['4012', 'DFS Replication', 'DFSR replication has not synced for N days', 'Alert', '>60 days = journal wrap risk', ''],
      ['5002', 'DFS Replication', 'DFSR connection lost', 'Warning', '', ''],
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

// ===== PWA SERVICE WORKER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
