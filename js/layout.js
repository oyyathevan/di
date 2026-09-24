/* =========================================================
   Shared Layout — Header + Sidebar + Footer + Critical CSS
   Edit this file once → every page updates.
   ========================================================= */
(function(){
  'use strict';

  /* ---------- CONFIG ---------- */
  const SITE = {
    brand: 'DTI Notes',
    brandHref: 'index.html',
    /* Header brand mark — L monogram + LITHU wordmark */
    brandMark: {
      name: 'LITHU',
      svg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="24" height="24" rx="5.5" fill="#1E3A8A"/><path d="M8.4 6.8V16.2H16.4" stroke="#FBFAF8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17.6" cy="7" r="1.8" fill="#EA580C"/></svg>'
    },
    footer: {
      line1: 'Design Thinking and Innovation — Study Notes',
      line2: 'L-T-P-C: 0-1-3-2.5',
      credit: '© 2026 · Made by <strong>@oyyathevan</strong>'
    },
    languages: [
      { code:'en', label:'English'  },
      { code:'te', label:'తెలుగు'    },
      { code:'hi', label:'हिन्दी'     },
      { code:'ta', label:'தமிழ்'     },
      { code:'kn', label:'ಕನ್ನಡ'     },
      { code:'ml', label:'മലയാളം'    },
      { code:'mr', label:'मराठी'      },
      { code:'bn', label:'বাংলা'      },
      { code:'gu', label:'ગુજરાતી'    }
    ],
    nav: [
      { href:'index.html',       label:'🏠 Home' },
      { href:'how-to-use.html',  label:'🧭 How to Use' },
      { href:'unit1.html',       label:'Unit I — Foundations & Empathy' },
      { href:'unit2.html',       label:'Unit II — Problem Definition' },
      { href:'unit3.html',       label:'Unit III — Ideation' },
      { href:'unit4.html',       label:'Unit IV — Prototyping' },
      { href:'unit5.html',       label:'Unit V — Innovation' },
      { href:'templates.html',   label:'📋 Templates' },
      { href:'resources.html',   label:'📚 Resources' },
      { href:'lesson-plan.html', label:'🗓 Lesson Plan' },
      { href:'practical.html',   label:'🧪 Practical Activities' },
      { href:'cases.html',       label:'📚 Case Study Library' },
      { href:'toolbox.html',     label:'🛠 Designer\'s Toolbox' },
      { href:'playground.html',  label:'🛠 Tool Playground' },
      {
        href:'beyond.html',
        label:'📚 Beyond the Syllabus',
        sub: [
          { href:'beyond-u1.html', label:'Unit I — Extra Topics' },
          { href:'beyond-u2.html', label:'Unit II — Extra Topics' },
          { href:'beyond-u3.html', label:'Unit III — Extra Topics' },
          { href:'beyond-u4.html', label:'Unit IV — Extra Topics' },
          { href:'beyond-u5.html', label:'Unit V — Extra Topics' }
        ]
      },
      { href:'exam-notes.html',  label:'📝 Exam Notes' },
      { href:'studio.html',      label:'🎨 Studio Mode' }
    ]
  };

  /* ---------- CRITICAL CSS ---------- */
  function injectCriticalCSS(){
    if (document.getElementById('layout-critical-css')) return;
    const style = document.createElement('style');
    style.id = 'layout-critical-css';
    style.textContent = `
      /* Header shell */
      .topbar{
        position:sticky;top:0;z-index:50;
        display:flex;gap:12px;align-items:center;
        padding:10px 20px;background:#fff;
        border-bottom:1px solid #E2E8F0;
        box-shadow:0 1px 2px rgba(0,0,0,.03);
      }
      .topbar .menu-btn{
        background:none;border:1px solid #E2E8F0;border-radius:8px;
        padding:6px 10px;font-size:1rem;cursor:pointer;display:none;
      }
      .topbar .brand{
        font-weight:700;color:#1E3A8A;text-decoration:none;
        font-size:1.05rem;letter-spacing:.2px;
      }
      .topbar #search{
        flex:1;max-width:420px;margin-left:12px;
        padding:8px 12px;border:1px solid #E2E8F0;
        border-radius:8px;font-size:.9rem;background:#F8FAFC;outline:none;
      }
      .topbar #search:focus{border-color:#1E3A8A;background:#fff}
      .topbar #theme-btn{
        background:none;border:1px solid #E2E8F0;border-radius:8px;
        padding:6px 10px;font-size:1rem;cursor:pointer;
      }
      /* Brand mark — L monogram + LITHU */
      .topbar .brand-mark{
        display:inline-flex;align-items:center;gap:9px;
        margin-left:auto;padding:6px 14px 6px 10px;
        border-radius:999px;
        background:linear-gradient(135deg,#F8FAFC 0%,#EEF2FF 100%);
        border:1px solid rgba(30,58,138,.15);
        box-shadow:0 1px 2px rgba(30,58,138,.04);
        white-space:nowrap;user-select:none;
      }
      .topbar .brand-mark__logo{
        display:inline-flex;align-items:center;justify-content:center;
        width:22px;height:22px;flex-shrink:0;
      }
      .topbar .brand-mark__logo svg{display:block;width:100%;height:100%;}
      .topbar .brand-mark__name{
        font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
        font-size:.82rem;font-weight:800;letter-spacing:.12em;
        color:#1E3A8A;line-height:1;text-transform:uppercase;
      }

      /* Exam mode toggle */
      .exam-toggle{
        display:inline-flex;align-items:center;gap:6px;
        height:30px;padding:0 12px;margin:0 4px;
        border-radius:999px;background:#EEF2FF;border:1px solid #C7D2FE;
        color:#1E3A8A;font-size:.78rem;font-weight:700;cursor:pointer;
        user-select:none;white-space:nowrap;transition:.15s;font-family:inherit;
      }
      .exam-toggle:hover{background:#E0E7FF}
      .exam-toggle.exam{background:#7C3AED;color:#fff;border-color:#7C3AED}
      .exam-toggle.exam:hover{background:#6D28D9}

      /* Language switcher */
      .lang-switch{
        position:relative;display:inline-flex;align-items:center;gap:6px;
        height:30px;padding:0 12px;margin:0 4px;border-radius:999px;
        background:#F1F5F9;border:1px solid #E2E8F0;color:#1F2937;
        font-size:.78rem;font-weight:600;cursor:pointer;user-select:none;
        white-space:nowrap;font-family:inherit;
      }
      .lang-switch:hover{background:#E2E8F0}
      .lang-switch .lang-globe{font-size:.9rem;line-height:1}
      .lang-switch .lang-current{min-width:22px;text-align:center}
      .lang-switch .lang-caret{font-size:.6rem;opacity:.6}
      .lang-switch .lang-menu{
        position:absolute !important;
        top:calc(100% + 6px) !important;
        right:0 !important;
        display:none !important;
        min-width:180px !important;
        max-height:340px !important;
        overflow-y:auto !important;
        padding:6px !important;
        background:#fff !important;
        border:1px solid #E2E8F0 !important;
        border-radius:10px !important;
        box-shadow:0 8px 24px rgba(0,0,0,.12) !important;
        z-index:99999 !important;
        flex-direction:column !important;
      }
      .lang-switch.open .lang-menu{display:block !important}
      .lang-switch .lang-item{
        display:block !important;
        padding:8px 12px !important;
        border-radius:6px !important;
        font-size:.82rem !important;
        font-weight:500 !important;
        color:#1F2937 !important;
        cursor:pointer !important;
        white-space:nowrap !important;
        text-align:left !important;
      }
      .lang-switch .lang-item:hover{background:#F1F5F9 !important}
      .lang-switch .lang-item.active{
        background:#E0E7FF !important;color:#1E3A8A !important;font-weight:700 !important;
      }

      /* Google Translate hide */
      .goog-te-banner-frame{display:none !important}
      body{top:0 !important}
      #google_translate_element,.skiptranslate{display:none !important}

      /* Sidebar */
      .sidebar{font-size:.92rem}
      .sidebar ul{list-style:none;padding:0;margin:0}
      .sidebar > ul > li{margin-bottom:4px}
      .sidebar a{
        display:block;padding:6px 10px;border-radius:8px;
        color:#64748B;text-decoration:none;transition:.15s;
      }
      .sidebar a:hover{background:#F1F5F9;color:#1F2937}
      .sidebar a.active{background:#EEF2FF;color:#1E3A8A;font-weight:600}
      .sidebar li.has-sub .sub{display:none;margin-top:4px;margin-left:12px;
        padding-left:10px;border-left:1px solid #EBE9E6}
      .sidebar li.has-sub.open .sub{display:block}
      .sidebar li.has-sub > a .sub-caret{
        float:right;font-size:.7rem;opacity:.5;transition:transform .2s;
      }
      .sidebar li.has-sub.open > a .sub-caret{transform:rotate(180deg)}

      /* Footer */
      .footer{
        margin-top:56px;padding:26px 20px;
        background:#fff;border-top:1px solid #E2E8F0;
        text-align:center;color:#64748B;font-size:.9rem;
      }
      .footer p{margin:4px 0}
      .footer .credit{font-weight:600;color:#1F2937;margin-top:10px}
      .footer .credit strong{color:#1E3A8A}
      #toTop{
        position:fixed;right:20px;bottom:20px;z-index:60;
        width:42px;height:42px;border-radius:50%;
        background:#1E3A8A;color:#fff;border:none;
        font-size:1.1rem;cursor:pointer;display:none;
        box-shadow:0 4px 12px rgba(0,0,0,.2);
      }

      /* Dark mode */
      [data-theme="dark"] .topbar{background:#1E293B;border-color:#334155}
      [data-theme="dark"] .topbar .brand{color:#93C5FD}
      [data-theme="dark"] .topbar #search{background:#0F172A;color:#E2E8F0;border-color:#334155}
      [data-theme="dark"] .topbar #search:focus{border-color:#93C5FD;background:#0F172A}
      [data-theme="dark"] .topbar #theme-btn{border-color:#334155;color:#E2E8F0}
      [data-theme="dark"] .topbar .brand-mark{
        background:linear-gradient(135deg,#1E293B 0%,#312E81 100%);
        border-color:rgba(147,197,253,.2);
      }
      [data-theme="dark"] .topbar .brand-mark__name{color:#DBEAFE}
      [data-theme="dark"] .topbar .brand-mark__logo svg rect{fill:#6366F1}
      [data-theme="dark"] .topbar .brand-mark__logo svg path{stroke:#FBFAF8}
      [data-theme="dark"] .topbar .brand-mark__logo svg circle{fill:#FB923C}
      [data-theme="dark"] .lang-switch{background:#1E293B;border-color:#334155;color:#E2E8F0}
      [data-theme="dark"] .lang-switch:hover{background:#243049}
      [data-theme="dark"] .lang-switch .lang-menu{background:#1E293B !important;border-color:#334155 !important}
      [data-theme="dark"] .lang-switch .lang-item{color:#E2E8F0 !important}
      [data-theme="dark"] .lang-switch .lang-item:hover{background:#243049 !important}
      [data-theme="dark"] .lang-switch .lang-item.active{background:#1E40AF !important;color:#DBEAFE !important}
      [data-theme="dark"] .sidebar a{color:#94A3B8}
      [data-theme="dark"] .sidebar a:hover{background:#1E293B;color:#E2E8F0}
      [data-theme="dark"] .sidebar a.active{background:#1E40AF;color:#DBEAFE}
      [data-theme="dark"] .sidebar li.has-sub .sub{border-left-color:#2E2823}
      [data-theme="dark"] .footer{background:#1E293B;border-color:#334155;color:#94A3B8}
      [data-theme="dark"] .footer .credit{color:#E2E8F0}

      /* Mobile */
      @media(max-width:820px){
        .topbar .menu-btn{display:block}
        .lang-switch .lang-current,.lang-switch .lang-caret{display:none}
        .lang-switch{padding:0 8px}
      }
      @media(max-width:600px){
        .topbar .brand-mark{padding:6px;gap:0}
        .topbar .brand-mark__name{display:none}
      }
    `;
    document.head.appendChild(style);
  }

  /* ---------- ASSET INJECTION ---------- */
  function injectAssets(){
    /* exam.css */
    if (!document.querySelector('link[href="css/exam.css"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'css/exam.css';
      document.head.appendChild(l);
    }
    /* exam-mode.js */
    if (!document.querySelector('script[src="js/exam-mode.js"]')) {
      const s = document.createElement('script');
      s.src = 'js/exam-mode.js';
      s.async = true;
      document.body.appendChild(s);
    }
    /* print.js */
    if (!document.querySelector('script[src="js/print.js"]')) {
      const s = document.createElement('script');
      s.src = 'js/print.js';
      s.async = true;
      document.body.appendChild(s);
    }
    /* reading-mode.js */
    if (!document.querySelector('script[src="js/reading-mode.js"]')) {
      const s = document.createElement('script');
      s.src = 'js/reading-mode.js';
      s.async = true;
      document.body.appendChild(s);
    }
    /* live-session.css + live-session.js — only on practical pages */
    (function(){
      var name = (location.pathname.split('/').pop() || '').toLowerCase();
      if (!/^practical-u[1-5]\.html?$/.test(name) &&
          !/^studio\.html?$/.test(name) &&
          !/^unit[1-5]\.html?$/.test(name)) return;

      if (!document.querySelector('link[href="css/live-session.css"]')) {
        const l = document.createElement('link');
        l.rel = 'stylesheet';
        l.href = 'css/live-session.css';
        document.head.appendChild(l);
      }
      if (!document.querySelector('script[src="js/live-session.js"]')) {
        const s = document.createElement('script');
        s.src = 'js/live-session.js';
        s.async = true;
        document.body.appendChild(s);
      }
    })();

    /* search-index-cases.js */
    if (!document.querySelector('script[src="js/search-index-cases.js"]')) {
      const s = document.createElement('script');
      s.src = 'js/search-index-cases.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }

  /* ---------- HEADER ---------- */
  function headerHTML(){
    const langItems = SITE.languages.map(l =>
      `<span class="lang-item" data-code="${l.code}">${l.label}</span>`
    ).join('');

    return `
<header class="topbar">
  <button class="menu-btn" aria-label="Toggle menu">☰</button>
  <a class="brand" href="${SITE.brandHref}">${SITE.brand}</a>
  <input type="search" id="search" placeholder="Search topics…" autocomplete="off" />
  <span class="search-counter" id="searchCounter" aria-live="polite" aria-atomic="true"></span>
  <button id="theme-btn" aria-label="Toggle dark mode">🌙</button>

  <button class="exam-toggle" aria-label="Switch to Exam mode">📖 Learn</button>

  <span class="lang-switch" role="button" tabindex="0" aria-label="Change language">
    <span class="lang-globe">🌐</span>
    <span class="lang-current">EN</span>
    <span class="lang-caret">▾</span>
    <span class="lang-menu" role="menu">${langItems}</span>
  </span>

  <span class="slogan-pill" aria-hidden="true" title="Click to change">
    <span class="slogan-text"></span>
  </span>

  <span class="brand-mark" aria-label="${SITE.brandMark.name}">
    <span class="brand-mark__logo">${SITE.brandMark.svg}</span>
    <span class="brand-mark__name">${SITE.brandMark.name}</span>
  </span>
</header>`;
  }

  /* ---------- SIDEBAR ---------- */
  function sidebarHTML(){
    const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

    const items = SITE.nav.map(item => {
      const isActive = item.href.toLowerCase() === current;

      if (item.sub && item.sub.length){
        const subActive = item.sub.some(s => s.href.toLowerCase() === current);
        const open = isActive || subActive;
        const subItems = item.sub.map(s => {
          const sActive = s.href.toLowerCase() === current;
          return `<li><a href="${s.href}"${sActive ? ' class="active"' : ''}>${s.label}</a></li>`;
        }).join('\n');

        return `<li class="has-sub${open ? ' open' : ''}">
          <a href="${item.href}" class="group-title${open ? ' active' : ''}">${item.label}<span class="sub-caret">▾</span></a>
          <ul class="sub">${subItems}</ul>
        </li>`;
      }

      return `<li><a href="${item.href}"${isActive ? ' class="active"' : ''}>${item.label}</a></li>`;
    }).join('\n');

    return `
<nav class="sidebar" aria-label="Main navigation">
  <ul>
${items}
  </ul>
</nav>`;
  }

  /* ---------- FOOTER ---------- */
  function footerHTML(){
    return `
<footer class="footer">
  <p>${SITE.footer.line1}</p>
  <p>${SITE.footer.line2}</p>
  <p class="credit">${SITE.footer.credit}</p>
</footer>
<button id="toTop" aria-label="Back to top">↑</button>`;
  }

  /* ---------- THEME TOGGLE ---------- */
  function setupThemeToggle(){
    const KEY = 'dti-theme';
    const html = document.documentElement;

    const saved = localStorage.getItem(KEY) || 'light';
    if (html.dataset.theme !== saved) html.dataset.theme = saved;

    let tries = 0;
    const iv = setInterval(() => {
      const btn = document.getElementById('theme-btn');
      if (!btn){
        if (++tries > 40) clearInterval(iv);
        return;
      }
      clearInterval(iv);

      if (btn.dataset.themeReady === '1'){
        syncButton(btn);
        return;
      }
      btn.dataset.themeReady = '1';
      syncButton(btn);

      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = next;
        localStorage.setItem(KEY, next);
        syncButton(btn);
        console.log('[layout] theme →', next);
      }, true);
    }, 40);

    function syncButton(btn){
      const dark = html.dataset.theme === 'dark';
      btn.textContent = dark ? '☀️' : '🌙';
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', dark ? 'Light mode' : 'Dark mode');
    }
  }

  /* ---------- PRINT CHROME ---------- */
  function injectPrintChrome(){
    if (document.getElementById('print-page-style')) return;

    var main = document.querySelector('main');
    if (!main) return;

    function esc(s){
      return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
      });
    }

    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var isUnit = /^unit[1-5]\.html?$/.test(path);

    var h1El = main.querySelector('h1');
    var h1Text = h1El
      ? h1El.innerText.replace(/\s+/g,' ').trim()
      : (document.title.split('|')[0] || 'Study Notes').trim();
    var headerTitle = h1Text.length > 70 ? h1Text.slice(0, 67) + '…' : h1Text;

    var styleEl = document.createElement('style');
    styleEl.id = 'print-page-style';
    styleEl.textContent =
      '@media print{@page{@top-right{content:"' +
      headerTitle.replace(/"/g,'\\"') + '";}}}';
    document.head.appendChild(styleEl);

    if (isUnit && !main.querySelector('.print-cover')){
      var dash = h1Text.indexOf('—');
      var unitLabel = dash > -1 ? h1Text.slice(0, dash).trim() : h1Text;
      var subtitle = dash > -1 ? h1Text.slice(dash + 1).trim() : '';

      var today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      var cover = document.createElement('div');
      cover.className = 'print-cover';
      cover.setAttribute('aria-hidden','true');
      cover.innerHTML =
        '<div class="cover-eyebrow">Design Thinking and Innovation</div>' +
        '<div class="cover-rule"></div>' +
        '<h1 class="cover-unit">' + esc(unitLabel) + '</h1>' +
        '<h2 class="cover-subtitle">' + esc(subtitle) + '</h2>' +
        '<div class="cover-meta">' +
          '<p>Study Notes · 17-Week Course</p>' +
          '<p>Prepared by <strong>@oyyathevan</strong></p>' +
          '<p>Printed on ' + esc(today) + '</p>' +
        '</div>';
      main.insertBefore(cover, main.firstChild);
    }
  }

  /* ---------- INJECT ---------- */
  function inject(){
    injectCriticalCSS();
    injectAssets();

    const h = document.getElementById('site-header');
    if (h) h.outerHTML = headerHTML();

    const s = document.getElementById('site-sidebar');
    if (s) s.outerHTML = sidebarHTML();

    const f = document.getElementById('site-footer');
    if (f) f.outerHTML = footerHTML();

    setupThemeToggle();
    injectPrintChrome();

    /* Sub-menu toggle on mobile */
    document.querySelectorAll('.sidebar .has-sub > a.group-title').forEach(a => {
      a.addEventListener('click', e => {
        if (window.matchMedia('(max-width:900px)').matches){
          e.preventDefault();
          a.parentElement.classList.toggle('open');
        }
      });
    });

    console.log('[layout] header + sidebar + footer injected for:',
                location.pathname.split('/').pop());
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', inject);
  else
    inject();
})();