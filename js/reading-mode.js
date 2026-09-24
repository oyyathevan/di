/* =========================================================
   Reading Mode — distraction-free topic view
   Click "Aa" on any topic → opens a book-like reading page
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function(){
    /* Only run on unit pages */
    const topics = Array.from(document.querySelectorAll('.topic'));
    if (!topics.length) return;

    const SCROLL_KEY = 'dti-read-scroll';

    /* =========================================================
       State
       ========================================================= */
    let currentTopicId = null;
    let barEl = null;
    let topbarEl = null;
    let controlsEl = null;

    /* =========================================================
       Inject "Aa" button into every topic header
       ========================================================= */
    function injectButtons(){
      document.querySelectorAll('.topic').forEach(topic => {
        const head = topic.querySelector('.topic-head');
        if (!head) return;

        /* Skip if already injected */
        if (head.querySelector('.reading-btn')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'reading-btn';
        btn.setAttribute('aria-label', 'Open reading mode');
        btn.setAttribute('title', 'Reading mode');
        btn.innerHTML = 'Aa';

        btn.addEventListener('click', e => {
          e.stopPropagation();
          e.preventDefault();
          openReading(topic.id);
        });

        /* Place it just after the listen button */
        const listenBtn = head.querySelector('.listen-btn');
        if (listenBtn && listenBtn.nextSibling){
          head.insertBefore(btn, listenBtn.nextSibling);
        } else {
          head.appendChild(btn);
        }
      });
    }

    /* =========================================================
       Read-time estimate
       ========================================================= */
    function estimateReadTime(el){
      const words = (el.innerText || '').trim().split(/\s+/).length;
      return Math.max(1, Math.round(words / 200));
    }

    /* =========================================================
       Build the reading shell (top bar + progress + controls)
       ========================================================= */
    function buildShell(topic){
      /* Top bar */
      const topbar = document.createElement('div');
      topbar.className = 'reading-topbar';
      const heading =
        (topic.querySelector('.topic-head h2')?.innerText || '').trim();

      topbar.innerHTML =
        '<button class="reading-back" aria-label="Back to notes">' +
          '<span aria-hidden="true">←</span> Back' +
        '</button>' +
        '<div class="reading-meta">' +
          '<span class="reading-section">' +
            (topic.querySelector('.sec-no')?.innerText || '') +
          '</span>' +
          '<span class="reading-time">' +
            estimateReadTime(topic) + ' min read' +
          '</span>' +
        '</div>';

      topbar.querySelector('.reading-back').addEventListener('click', closeReading);

      /* Progress bar */
      const progress = document.createElement('div');
      progress.className = 'reading-progress';
      progress.innerHTML = '<div class="reading-progress-bar"></div>';

      /* Floating controls */
      const controls = document.createElement('div');
      controls.className = 'reading-controls';
      controls.innerHTML =
        '<button data-r-mode="normal" class="active" aria-label="Normal text size">Aa</button>' +
        '<button data-r-mode="large" aria-label="Large text size">Aa+</button>' +
        '<button data-r-mode="theme" aria-label="Toggle theme">◐</button>' +
        '<button data-r-mode="close" aria-label="Close reading mode">✕</button>';

      controls.addEventListener('click', e => {
        const btn = e.target.closest('button[data-r-mode]');
        if (!btn) return;
        const mode = btn.dataset.rMode;
        if (mode === 'close'){ closeReading(); return; }
        if (mode === 'theme'){
          const html = document.documentElement;
          const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
          html.dataset.theme = next;
          try { localStorage.setItem('dti-theme', next); } catch(_){}
          return;
        }
        /* Font size modes */
        document.body.classList.remove('reading-font-normal','reading-font-large');
        document.body.classList.add('reading-font-' + mode);
        controls.querySelectorAll('button[data-r-mode="normal"],button[data-r-mode="large"]')
          .forEach(b => b.classList.toggle('active', b === btn));
      });

      document.body.appendChild(topbar);
      document.body.appendChild(progress);
      document.body.appendChild(controls);

      return { topbar, progress, controls };
    }

    /* =========================================================
       Open reading mode
       ========================================================= */
    function openReading(topicId){
      const topic = document.getElementById(topicId);
      if (!topic) return;

      /* Close any existing */
      if (currentTopicId) closeReading(true);

      /* Mark state */
      currentTopicId = topicId;
      document.body.classList.add('reading-mode');
      document.body.setAttribute('data-reading-topic', topicId);
      topic.classList.add('reading-active');

      /* Build shell */
      const shell = buildShell(topic);
      topbarEl = shell.topbar;
      barEl = shell.progress.querySelector('.reading-progress-bar');
      controlsEl = shell.controls;

      /* Restore scroll position for this topic */
      const saved = readScrollMap()[topicId] || 0;
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved, behavior: 'auto' });
        updateProgress();
      });

      /* Bind scroll → progress */
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress, { passive: true });

      /* ESC closes */
      document.addEventListener('keydown', escHandler);

      /* URL hash (for shareability & browser back) */
      try {
        history.pushState(
          { reading: topicId },
          '',
          '#' + topicId + '&read'
        );
      } catch(_){}

      /* Save scroll on unload */
      window.addEventListener('beforeunload', rememberScroll);
    }

    /* =========================================================
       Close reading mode
       ========================================================= */
    function closeReading(silent){
      if (!currentTopicId) return;

      /* Save scroll for later resume */
      if (!silent) rememberScroll();

      /* Remove classes */
      document.body.classList.remove(
        'reading-mode',
        'reading-font-normal',
        'reading-font-large'
      );
      document.body.removeAttribute('data-reading-topic');

      const topic = document.getElementById(currentTopicId);
      if (topic) topic.classList.remove('reading-active');

      /* Remove shell */
      document.querySelectorAll(
        '.reading-topbar,.reading-progress,.reading-controls'
      ).forEach(el => el.remove());

      topbarEl = barEl = controlsEl = null;

      /* Unbind */
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      document.removeEventListener('keydown', escHandler);

      /* Clean URL hash */
      if (location.hash.endsWith('&read')){
        try {
          history.replaceState({}, '', location.pathname + location.search);
        } catch(_){}
      }

      currentTopicId = null;
    }

    function escHandler(e){
      if (e.key === 'Escape') closeReading();
    }

    /* =========================================================
       Progress
       ========================================================= */
    function updateProgress(){
      if (!barEl) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
      barEl.style.width = pct + '%';
    }

    /* =========================================================
       Scroll persistence
       ========================================================= */
    function readScrollMap(){
      try {
        return JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}');
      } catch(_){ return {}; }
    }
    function rememberScroll(){
      if (!currentTopicId) return;
      const map = readScrollMap();
      map[currentTopicId] = window.scrollY;
      try {
        localStorage.setItem(SCROLL_KEY, JSON.stringify(map));
      } catch(_){}
    }

    /* =========================================================
       Deep-link: page loaded with #topic&read
       ========================================================= */
    function applyHash(){
      const m = location.hash.match(/^#([^&]+)&read$/);
      if (!m) return;
      const id = m[1];
      if (document.getElementById(id)) openReading(id);
    }
    window.addEventListener('hashchange', applyHash);
    window.addEventListener('popstate', () => {
      const m = location.hash.match(/^#([^&]+)&read$/);
      if (m) applyHash();
      else if (currentTopicId) closeReading(true);
    });

    /* =========================================================
       Init
       ========================================================= */
    injectButtons();
    applyHash();

    console.log('[reading-mode] ready — buttons injected:', document.querySelectorAll('.reading-btn').length);
  });
})();