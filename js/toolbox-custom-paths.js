/* =========================================================
   Toolbox — Custom Path Builder (Feature D)
   Loads after toolbox-map-extras.js
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function(){
    const DATA = window.TOOLBOX;
    if (!DATA) return;

    const STORAGE_KEY = 'dti-custom-paths';

    /* ---------- Load / save ---------- */
    function loadCustom(){
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch(e){ return []; }
    }
    function saveCustom(arr){
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
      catch(e){ console.warn('[custom-paths] save failed', e); }
    }

    let customPaths = loadCustom();

    /* ---------- DOM refs (built after extras runs) ---------- */
    let svg, vp, canvas, mapWrap, menu, customEl;

    /* Poll until the extras file has built the SVG + menu */
    let tries = 0;
    const poll = setInterval(() => {
      svg      = document.getElementById('tbMapSvg');
      vp       = document.getElementById('tbMapViewport');
      canvas   = svg?.querySelector('.tb-canvas');
      mapWrap  = document.getElementById('tbMap');
      menu     = document.getElementById('tbWalkMenu');
      customEl = document.getElementById('tbWalkCustom');

      if (svg && vp && canvas && menu && customEl &&
          window.__toolboxWalk){
        clearInterval(poll);
        init();
      } else if (++tries > 300){
        clearInterval(poll);
        console.warn('[custom-paths] prerequisites not ready');
      }
    }, 100);

    /* =========================================================
       Init
       ========================================================= */
    function init(){
      renderCustomList();
      injectRecordingBanner();
      setupRecClickListener();
      setupMenuDelegation();

      console.log('[custom-paths] ready — custom paths:', customPaths.length);
    }

    /* =========================================================
       Render custom paths in the dropdown
       ========================================================= */
    function renderCustomList(){
      if (!customEl) return;

      let html = '';

      customPaths.forEach(p => {
        html += `
          <div class="tb-walk-item-row" data-row="${escapeAttr(p.id)}">
            <button class="tb-walk-item-btn" data-play-custom="${escapeAttr(p.id)}" type="button">
              <span class="tb-walk-emoji">💾</span>
              <span class="tb-walk-name">${escapeHtml(p.name)}</span>
              <span class="tb-walk-count">${p.steps.length}</span>
            </button>
            <button class="tb-walk-delete" data-del="${escapeAttr(p.id)}"
                    title="Delete path" aria-label="Delete path">✕</button>
          </div>
        `;
      });

      html += `
        <button class="tb-walk-action" id="tbBuildPath" type="button">
          <span class="tb-walk-emoji">＋</span> Build new path…
        </button>
      `;

      customEl.innerHTML = html;
    }

    /* =========================================================
       Menu delegation for custom paths
       ========================================================= */
    function setupMenuDelegation(){
      customEl.addEventListener('click', e => {
        /* Delete */
        const del = e.target.closest('[data-del]');
        if (del){
          e.preventDefault();
          e.stopPropagation();
          deleteCustomPath(del.dataset.del);
          return;
        }

        /* Play custom */
        const play = e.target.closest('[data-play-custom]');
        if (play){
          e.preventDefault();
          e.stopPropagation();
          playCustomPath(play.dataset.playCustom);
          return;
        }

        /* Build new */
        const build = e.target.closest('#tbBuildPath');
        if (build){
          e.preventDefault();
          e.stopPropagation();
          startRecording();
          return;
        }
      });
    }

    /* =========================================================
       Play / delete custom paths
       ========================================================= */
    function playCustomPath(id){
      const p = customPaths.find(x => x.id === id);
      if (!p) return;

      /* Mark active */
      customEl.querySelectorAll('.tb-walk-item-row').forEach(r =>
        r.classList.toggle('active', r.dataset.row === id));

      window.__toolboxWalk.closeMenu();
      window.__toolboxWalk.startWalk(p.steps, p.name);
    }

    function deleteCustomPath(id){
      const p = customPaths.find(x => x.id === id);
      if (!p) return;
      if (!confirm('Delete "' + p.name + '"? This cannot be undone.')) return;
      customPaths = customPaths.filter(x => x.id !== id);
      saveCustom(customPaths);
      renderCustomList();
    }

    /* =========================================================
       Recording
       ========================================================= */
    const rec = {
      active: false,
      nodes: []
    };

    function injectRecordingBanner(){
      if (document.getElementById('tbRecBanner')) return;

      const banner = document.createElement('div');
      banner.id = 'tbRecBanner';
      banner.className = 'tb-rec-banner';
      banner.hidden = true;
      banner.innerHTML = `
        <span class="tb-rec-dot"></span>
        <strong>RECORDING</strong>
        <span class="tb-rec-info" id="tbRecInfo">0 selected</span>
        <span class="tb-rec-hint">Click nodes in order · Click again to remove</span>
        <div class="tb-rec-actions">
          <button id="tbRecSave" type="button" disabled>💾 Save path</button>
          <button id="tbRecUndo" type="button" disabled>↶ Undo</button>
          <button id="tbRecCancel" type="button">✕ Cancel</button>
        </div>
      `;

      /* Insert banner right above the viewport, inside .tb-map */
      const toolbar = mapWrap.querySelector('.tb-map-toolbar');
      if (toolbar && toolbar.nextSibling){
        mapWrap.insertBefore(banner, toolbar.nextSibling);
      } else {
        mapWrap.insertBefore(banner, vp);
      }

      document.getElementById('tbRecSave').addEventListener('click', saveFromRecording);
      document.getElementById('tbRecUndo').addEventListener('click', undoLastNode);
      document.getElementById('tbRecCancel').addEventListener('click', cancelRecording);
    }

    function startRecording(){
      rec.active = true;
      rec.nodes = [];

      window.__toolboxWalk.closeMenu();
      window.__toolboxWalk.stopWalk();

      const banner = document.getElementById('tbRecBanner');
      if (banner) banner.hidden = false;

      vp.classList.add('tb-recording');
      clearAllBadges();
      updateRecUI();

      /* Scroll map to top-left for a clean start */
      /* (optional; skip to avoid jumping) */
    }

    function cancelRecording(){
      if (rec.nodes.length > 0 &&
          !confirm('Discard this path?')) return;
      endRecording();
    }

    function endRecording(){
      rec.active = false;
      rec.nodes = [];
      const banner = document.getElementById('tbRecBanner');
      if (banner) banner.hidden = true;
      vp.classList.remove('tb-recording');
      clearAllBadges();
    }

    function undoLastNode(){
      if (!rec.nodes.length) return;
      rec.nodes.pop();
      renderBadges();
      updateRecUI();
    }

    /* ---------- Click interception (capture phase) ---------- */
    function setupRecClickListener(){
      document.addEventListener('click', e => {
        if (!rec.active) return;
        const node = e.target.closest('.tb-node');
        if (!node) return;

        /* Block toolbox.js and detail-popup handlers */
        e.stopImmediatePropagation();
        e.preventDefault();

        toggleRecNode(node.dataset.id);
      }, true /* capture */);

      /* Keyboard: Esc cancels recording */
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && rec.active){
          cancelRecording();
        }
      });
    }

    function toggleRecNode(id){
      const i = rec.nodes.indexOf(id);
      if (i === -1){
        if (rec.nodes.length >= 30){
          alert('Maximum 30 nodes per path.');
          return;
        }
        rec.nodes.push(id);
      } else {
        rec.nodes.splice(i, 1);
      }
      renderBadges();
      updateRecUI();
    }

    /* ---------- Badge rendering ---------- */
    function renderBadges(){
      clearAllBadges();
      rec.nodes.forEach((id, idx) => {
        const node = svg.querySelector(`.tb-node[data-id="${cssEsc(id)}"]`);
        if (!node) return;
        node.classList.add('tb-rec-active');

        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badge.setAttribute('class', 'tb-rec-badge');
        badge.setAttribute('transform', 'translate(148,-8)');
        badge.innerHTML =
          `<circle r="12" fill="#7C3AED" stroke="#fff" stroke-width="2.5"/>` +
          `<text y="4.5" text-anchor="middle" fill="#fff" ` +
          `font-size="11" font-weight="800" font-family="Inter,system-ui,sans-serif">${idx + 1}</text>`;
        node.appendChild(badge);
      });
    }

    function clearAllBadges(){
      svg.querySelectorAll('.tb-rec-badge').forEach(b => b.remove());
      svg.querySelectorAll('.tb-node.tb-rec-active').forEach(n =>
        n.classList.remove('tb-rec-active'));
    }

    /* ---------- UI update ---------- */
    function updateRecUI(){
      const info = document.getElementById('tbRecInfo');
      const saveBtn = document.getElementById('tbRecSave');
      const undoBtn = document.getElementById('tbRecUndo');
      const n = rec.nodes.length;

      if (info) info.textContent = n + ' selected';
      if (saveBtn) saveBtn.disabled = n < 2;
      if (undoBtn) undoBtn.disabled = n === 0;
    }

    /* ---------- Save ---------- */
    function saveFromRecording(){
      if (rec.nodes.length < 2) return;

      /* Build the name dialog */
      const overlay = document.createElement('div');
      overlay.className = 'tb-save-overlay';
      overlay.id = 'tbSaveOverlay';
      overlay.innerHTML = `
        <div class="tb-save-dialog" role="dialog" aria-modal="true" aria-labelledby="tbSaveTitle">
          <h3 id="tbSaveTitle">💾 Name your path</h3>
          <p>${rec.nodes.length} steps will be saved to your browser. You can use it any time.</p>
          <input type="text" id="tbSaveInput"
                 placeholder="e.g., My skip-queue project"
                 maxlength="50" autocomplete="off" />
          <div class="tb-save-actions">
            <button type="button" id="tbSaveCancel">Cancel</button>
            <button type="button" id="tbSaveConfirm" class="primary">Save path</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const input = document.getElementById('tbSaveInput');
      setTimeout(() => input.focus(), 60);

      document.getElementById('tbSaveCancel').addEventListener('click', () => {
        overlay.remove();
      });

      document.getElementById('tbSaveConfirm').addEventListener('click', () => {
        const name = (input.value || '').trim() || ('My path ' + new Date().toLocaleDateString());
        commitSave(name);
        overlay.remove();
      });

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('tbSaveConfirm').click();
        if (e.key === 'Escape') overlay.remove();
      });
    }

    function commitSave(name){
      const path = {
        id: 'custom-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6),
        name: name.slice(0, 50),
        steps: rec.nodes.slice(),
        createdAt: new Date().toISOString()
      };
      customPaths.push(path);
      saveCustom(customPaths);

      endRecording();
      renderCustomList();

      /* Show a small confirmation */
      const t = document.createElement('div');
      t.className = 'tb-export-toast';
      t.textContent = '✓ Path "' + path.name + '" saved';
      t.style.opacity = '1';
      document.body.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; }, 2200);
      setTimeout(() => t.remove(), 2600);
    }

    /* =========================================================
       Helpers
       ========================================================= */
    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[c]);
    }
    function escapeAttr(s){
      return escapeHtml(s);
    }
    function cssEsc(s){
      return String(s).replace(/["\\]/g, '\\$&');
    }
  });
})();