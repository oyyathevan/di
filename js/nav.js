/* =========================================================
   nav.js — Sidebar · Scroll-spy · Back-to-top · Copy buttons
   (Search lives in search.js · Theme toggle lives in layout.js)
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else
      fn();
  }

  onReady(function init(){

    /* =========================================================
       1 · Mobile sidebar drawer toggle
       ========================================================= */
    const sidebar = document.querySelector('.sidebar');
    const menuBtn = document.querySelector('.menu-btn');

    if (menuBtn && sidebar){
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      /* Close drawer when a link is clicked (mobile UX) */
      sidebar.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          if (window.matchMedia('(max-width:900px)').matches){
            sidebar.classList.remove('open');
          }
        });
      });

      /* Close drawer when clicking outside */
      document.addEventListener('click', e => {
        if (!sidebar.classList.contains('open')) return;
        if (sidebar.contains(e.target)) return;
        if (e.target === menuBtn || menuBtn.contains(e.target)) return;
        sidebar.classList.remove('open');
      });
    }

    /* =========================================================
       2 · Active sidebar link — scroll spy
       Works on unit pages where sidebar items link to #anchors.
       ========================================================= */
    const anchorLinks = Array.from(
      document.querySelectorAll('.sidebar a[href^="#"]')
    );
    const topicSections = Array.from(document.querySelectorAll('.topic'));

    if (anchorLinks.length && topicSections.length &&
        'IntersectionObserver' in window){

      const activeByScroll = new Map();   /* id → isVisible */

      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          activeByScroll.set(e.target.id, e.isIntersecting);
        });

        /* Find first visible topic */
        let active = null;
        for (const t of topicSections){
          if (activeByScroll.get(t.id)){ active = t.id; break; }
        }

        if (active){
          anchorLinks.forEach(l => l.classList.remove('active'));
          const link = document.querySelector(
            `.sidebar a[href="#${cssEsc(active)}"]`
          );
          if (link){
            link.classList.add('active');
            /* Open the parent submenu, if collapsed */
            const parentSub = link.closest('.sub');
            if (parentSub) parentSub.style.display = '';
          }
        }
      }, {
        rootMargin: '-25% 0px -65% 0px',
        threshold: 0
      });

      topicSections.forEach(t => io.observe(t));
    }

    /* =========================================================
       3 · Back-to-top button
       ========================================================= */
    const toTop = document.getElementById('toTop');
    if (toTop){
      window.addEventListener('scroll', () => {
        toTop.style.display = window.scrollY > 400 ? 'block' : 'none';
      }, { passive: true });

      toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* =========================================================
       4 · Copy-code buttons
       Wraps every <pre><code> block in .code-block if not wrapped.
       ========================================================= */
    document.querySelectorAll('pre').forEach(pre => {
      if (pre.closest('.code-block')) return;   /* already handled */
      if (!pre.querySelector('code')) return;   /* only code blocks */

      const wrap = document.createElement('div');
      wrap.className = 'code-block';
      pre.parentNode.insertBefore(wrap, pre);
      wrap.appendChild(pre);

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code')?.innerText || pre.innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 1400);
        }).catch(() => {
          /* Fallback for older browsers */
          const range = document.createRange();
          range.selectNode(pre);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
          document.execCommand('copy');
          btn.textContent = 'Copied!';
          setTimeout(() => btn.textContent = 'Copy', 1400);
        });
      });
      wrap.appendChild(btn);
    });

    /* =========================================================
       Utility
       ========================================================= */
    function cssEsc(s){
      return String(s).replace(/["\\]/g, '\\$&');
    }

    console.log('[nav] ready');
  });
})();