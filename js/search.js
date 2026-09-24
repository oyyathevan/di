/* =========================================================
   SEARCH — in-page (unit pages) + cross-page (all others)
   ========================================================= */
(function () {
  'use strict';

  let debounceTimer = null;
  const originalHTML = new Map();
  let hitIndex = 0;
  let currentQuery = '';

  function $$(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }
  function escapeRe(str){ return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }

  /* ---------- Counter ---------- */
  function updateCounter(current, total){
    const el = document.getElementById('searchCounter');
    if (!el) return;
    if (!currentQuery){
      el.classList.remove('show','warn');
      el.textContent = '';
      return;
    }
    if (total === 0){
      el.textContent = '0 matches';
      el.classList.add('show','warn');
      return;
    }
    el.textContent = (current + 1) + ' / ' + total;
    el.classList.remove('warn');
    el.classList.add('show');
  }

  /* ---------- Toast ---------- */
  function toast(text, type){
    let el = document.getElementById('searchMsg');
    if (!el){
      el = document.createElement('div');
      el.id = 'searchMsg';
      el.style.cssText =
        'position:fixed;top:70px;left:50%;transform:translateX(-50%);' +
        'padding:8px 16px;border-radius:999px;font-size:.82rem;font-weight:600;' +
        'z-index:9999;box-shadow:0 4px 14px rgba(0,0,0,.12);' +
        'transition:opacity .2s ease;pointer-events:none;max-width:80vw;' +
        'text-align:center;';
      document.body.appendChild(el);
    }
    if (!text){ el.style.opacity = 0; return; }
    el.textContent = text;
    el.style.background = type === 'warn' ? '#FEE2E2' : '#E0E7FF';
    el.style.color      = type === 'warn' ? '#991B1B' : '#1E3A8A';
    el.style.opacity = 1;
  }

  /* =========================================================
     CROSS-PAGE RESULTS PANEL
     ========================================================= */
  function ensureResultsPanel(){
    let el = document.getElementById('searchResults');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'searchResults';
    el.className = 'search-results-panel';
    document.body.appendChild(el);
    return el;
  }

  function hideResultsPanel(){
    const el = document.getElementById('searchResults');
    if (el) el.classList.remove('show');
  }

  function runCrossPageSearch(query){
    const panel = ensureResultsPanel();
    const q = query.toLowerCase().trim();

    if (!window.SEARCH_INDEX || !Array.isArray(window.SEARCH_INDEX)){
      panel.innerHTML = '<div class="search-results-header">Search index not loaded</div>';
      panel.classList.add('show');
      updateCounter(0, 0);
      return;
    }
    if (!q){
      hideResultsPanel();
      return;
    }

    const matches = window.SEARCH_INDEX.filter(item => {
      const blob = ((item.title||'') + ' ' + (item.kw||'') + ' ' + (item.unit||'')).toLowerCase();
      return blob.indexOf(q) !== -1;
    });

    if (!matches.length){
      hideResultsPanel();
      toast('No matches for "' + query + '"', 'warn');
      updateCounter(0, 0);
      return;
    }

    const shown = matches.slice(0, 25);
    const html = shown.map(m => `
      <a class="search-result-item" href="${escapeHtml(m.page)}#${escapeHtml(m.anchor)}">
        <span class="search-result-unit">${escapeHtml(m.unit)}</span>
        <span class="search-result-title">${escapeHtml(m.title)}</span>
      </a>
    `).join('');

    panel.innerHTML =
      '<div class="search-results-header">' +
      matches.length + ' result' + (matches.length === 1 ? '' : 's') +
      ' · click to open</div>' + html;
    panel.classList.add('show');

    updateCounter(0, matches.length);
    toast('', '');
  }

  /* =========================================================
     IN-PAGE SEARCH (unit pages)
     ========================================================= */
  function cacheOriginals(){
    $$('.topic').forEach(t => {
      if (!originalHTML.has(t)) originalHTML.set(t, t.innerHTML);
    });
  }

  function highlightHTML(html, re){
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'MARK')
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(node => {
      const txt = node.nodeValue;
      re.lastIndex = 0;
      if (!re.test(txt)) return;

      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = re.exec(txt)) !== null){
        if (m.index > last){
          frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        }
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = m.index + m[0].length;
        if (m[0].length === 0) re.lastIndex++;
      }
      if (last < txt.length){
        frag.appendChild(document.createTextNode(txt.slice(last)));
      }
      node.parentNode.replaceChild(frag, node);
    });

    return tmp.innerHTML;
  }

  function clearSearch(){
    $$('.topic').forEach(t => {
      if (originalHTML.has(t)) t.innerHTML = originalHTML.get(t);
      t.style.display = '';
    });
    hitIndex = 0;
    currentQuery = '';
    updateCounter(0, 0);
    toast('', '');
    hideResultsPanel();
  }

  function runInPageSearch(rawQuery, jumpToFirst){
    cacheOriginals();

    const q = (rawQuery || '').trim();
    if (!q){ clearSearch(); return; }
    currentQuery = q;

    /* Ignore single-character queries to avoid highlighting every letter */
    if (q.length < 2){
      clearSearch();
      return;
    }

    const needle = q.toLowerCase();
    const re = new RegExp(escapeRe(q), 'gi');

    let visibleTopics = 0;
    let totalHits = 0;
    let firstMark = null;

    $$('.topic').forEach(topic => {
      const pristine = originalHTML.get(topic);
      if (!pristine) return;

      const probe = document.createElement('div');
      probe.innerHTML = pristine;
      const plain = (probe.textContent || '').toLowerCase();

      if (plain.indexOf(needle) === -1){
        topic.style.display = 'none';
        topic.innerHTML = pristine;
        return;
      }

      topic.style.display = '';
      topic.innerHTML = highlightHTML(pristine, re);

      const marks = topic.querySelectorAll('mark.search-hit');
      totalHits += marks.length;
      visibleTopics++;
      if (!firstMark && marks.length) firstMark = marks[0];
    });

    hitIndex = 0;
    updateCounter(0, totalHits);

    if (totalHits === 0){
      toast('No matches for "' + q + '"', 'warn');
      return;
    }

    toast(
      totalHits + ' match' + (totalHits === 1 ? '' : 'es') +
      ' in ' + visibleTopics + ' topic' + (visibleTopics === 1 ? '' : 's') +
      ' · Enter for next',
      'info'
    );

    if (jumpToFirst && firstMark){
      firstMark.scrollIntoView({ behavior:'smooth', block:'center' });
      firstMark.classList.add('search-hit-current');
    }
  }

  /* ---------- Router: in-page vs cross-page ---------- */
  function runSearch(rawQuery, jumpToFirst){
    const topics = $$('.topic');
    if (topics.length){
      hideResultsPanel();
      runInPageSearch(rawQuery, jumpToFirst);
    } else {
      runCrossPageSearch(rawQuery || '');
    }
  }

  /* ---------- Input (debounced) ---------- */
  document.addEventListener('input', (e) => {
    if (!e.target || e.target.id !== 'search') return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runSearch(e.target.value, true);
    }, 220);
  });

  /* ---------- Enter → next hit (in-page only) ---------- */
  document.addEventListener('keydown', (e) => {
    if (!e.target || e.target.id !== 'search') return;
    if (e.key !== 'Enter') return;

    const hits = $$('mark.search-hit');
    if (!hits.length){
      runSearch(e.target.value, true);
      return;
    }
    e.preventDefault();
    hitIndex = (hitIndex + 1) % hits.length;
    updateCounter(hitIndex, hits.length);
    hits.forEach(h => h.classList.remove('search-hit-current'));
    hits[hitIndex].classList.add('search-hit-current');
    hits[hitIndex].scrollIntoView({ behavior:'smooth', block:'center' });
  });

  /* ---------- Esc → clear ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const s = document.getElementById('search');
    if (!s) return;
    if (document.activeElement !== s && !document.getElementById('searchResults')?.classList.contains('show')) return;
    s.value = '';
    clearSearch();
  });

  /* ---------- Outside click closes results panel ---------- */
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('searchResults');
    if (!panel || !panel.classList.contains('show')) return;
    if (e.target.closest('#searchResults')) return;
    if (e.target.id === 'search') return;
    hideResultsPanel();
  });

  console.log('[search] ready');
})();