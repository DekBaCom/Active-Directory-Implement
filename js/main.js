'use strict';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('backToTop').classList.toggle('visible', window.scrollY > 400);
  updateActiveNavLink();
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
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

// ===== BACK TO TOP =====
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== HERO PARTICLES =====
(function createParticles() {
  const container = document.getElementById('particles');
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
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.target > 100 ? 'M+' : (el.dataset.target > 10 ? '%' : '+');
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
  check.textContent = isChecked ? '✅' : '☐';
}

// ===== COPY CODE =====
function copyCode(btn) {
  const code = btn.closest('.code-block').querySelector('pre').innerText;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ===== COST CALCULATOR =====
const PRICES = {
  serverEdition: { essentials: 501, standard: 1069, datacenter: 6155 },
  cal: { device: 38, user: 38, none: 0 },
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
  const numUsers = parseInt(document.getElementById('numUsers').value);
  const numDCs = parseInt(document.getElementById('numDCs').value);
  const numSites = parseInt(document.getElementById('numSites').value);
  const edition = document.getElementById('serverEdition').value;
  const deployModel = document.getElementById('deployModel').value;
  const azureLicense = document.getElementById('azureLicense').value;
  const calType = document.getElementById('calType').value;
  const includeHardware = document.getElementById('includeHardware').checked;
  const includeProServices = document.getElementById('includeProServices').checked;
  const includeADCS = document.getElementById('includeADCS').checked;
  const includeMDI = document.getElementById('includeMDI').checked;

  // Update display values
  document.getElementById('numUsersVal').textContent = numUsers.toLocaleString();
  document.getElementById('numDCsVal').textContent = numDCs;
  document.getElementById('numSitesVal').textContent = numSites;

  // Calculate costs
  const licenseCost = deployModel === 'cloud' ? 0 : numDCs * PRICES.serverEdition[edition];
  const calCost = calType === 'none' ? 0 : numUsers * PRICES.cal[calType];
  const hardwareCost = includeHardware && deployModel !== 'cloud' ? numDCs * PRICES.hardware : 0;
  const proServicesCost = includeProServices ? PRICES.proServices : 0;
  const adcsCost = includeADCS ? PRICES.adcs : 0;

  // Annual costs
  const azureAnnual = azureLicense === 'none' || azureLicense === 'free' ? 0 : numUsers * PRICES.azure[azureLicense] * 12;
  const mdiAnnual = includeMDI ? numUsers * PRICES.mdi * 12 : 0;

  // Cloud-only (AADDS) pricing override
  let cloudAnnual = 0;
  if (deployModel === 'cloud') {
    cloudAnnual = numUsers <= 1000 ? 440 : numUsers <= 10000 ? 2200 : 6600;
  }

  const total = licenseCost + calCost + hardwareCost + proServicesCost + adcsCost;
  const annual = azureAnnual + mdiAnnual + cloudAnnual;

  // Update UI
  document.getElementById('costLicenses').textContent = `$${licenseCost.toLocaleString()}`;
  document.getElementById('costCALs').textContent = `$${calCost.toLocaleString()}`;
  document.getElementById('costHardware').textContent = `$${hardwareCost.toLocaleString()}`;
  document.getElementById('costAzure').textContent = azureAnnual > 0 ? `$${azureAnnual.toLocaleString()}/yr` : '$0';
  document.getElementById('costProServices').textContent = proServicesCost > 0 ? `$${proServicesCost.toLocaleString()}` : '$0';
  document.getElementById('costADCS').textContent = adcsCost > 0 ? `$${adcsCost.toLocaleString()}` : '$0';
  document.getElementById('costMDI').textContent = mdiAnnual > 0 ? `$${mdiAnnual.toLocaleString()}/yr` : '$0';
  document.getElementById('costTotal').textContent = `$${total.toLocaleString()}`;
  document.getElementById('costAnnual').textContent = annual > 0 ? `$${annual.toLocaleString()}/yr` : '$0';

  // Chart
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

// Initialize calculator
updateCalc();

// ===== DOWNLOAD ESTIMATE =====
function downloadEstimate() {
  const numUsers = document.getElementById('numUsersVal').textContent;
  const numDCs = document.getElementById('numDCsVal').textContent;
  const edition = document.getElementById('serverEdition').selectedOptions[0].text;
  const total = document.getElementById('costTotal').textContent;
  const annual = document.getElementById('costAnnual').textContent;

  const content = `ACTIVE DIRECTORY COST ESTIMATE
==============================
Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

CONFIGURATION
=============
Users:              ${numUsers}
Domain Controllers: ${numDCs}
Server Edition:     ${edition}

COST BREAKDOWN
==============
Server Licenses:    ${document.getElementById('costLicenses').textContent}
CALs:               ${document.getElementById('costCALs').textContent}
Hardware:           ${document.getElementById('costHardware').textContent}
Azure AD/Entra ID:  ${document.getElementById('costAzure').textContent}
Pro Services:       ${document.getElementById('costProServices').textContent}
AD CS Setup:        ${document.getElementById('costADCS').textContent}
Defender Identity:  ${document.getElementById('costMDI').textContent}

TOTAL UPFRONT:      ${total}
ANNUAL RECURRING:   ${annual}

NOTE: Estimates based on MSRP. Actual costs vary by
region, volume licensing, and negotiated discounts.
Software Assurance adds ~25-29% annually.
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'AD-Cost-Estimate.txt';
  a.click();
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

document.querySelectorAll('.card, .timeline-item, .phase, .fl-item, .bp-category, .faq-item, .resource-card, .lm-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
});
