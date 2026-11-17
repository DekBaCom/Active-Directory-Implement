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
    navLinks.classList.toggle('open');
  });
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks) navLinks.classList.remove('open');
  });
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
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
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `AD-Cost-Estimate.${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
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

// ===== SCROLL ANIMATIONS =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.card, .timeline-item, .phase, .fl-item, .bp-category, .faq-item, .resource-card, .lm-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});

updateScrollProgress();
