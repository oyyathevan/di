/* =========================================================
   Toolbox — Map extras
   Mini-map · Fullscreen · Export · Print
   Walkthrough: Curated paths + Play-from-node + Random
   (Custom path builder added in Response 2)
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

    let tries = 0;
    const poll = setInterval(() => {
      const svg = document.getElementById('tbMapSvg');
      if (svg && svg.querySelector('.tb-canvas .tb-node')){
        clearInterval(poll);
        enhance();
      } else if (++tries > 300){
        clearInterval(poll);
        console.warn('[toolbox-extras] map not detected');
      }
    }, 100);

    /* =========================================================
       Main
       ========================================================= */
    function enhance(){
      const map     = document.getElementById('tbMap');
      const svg     = document.getElementById('tbMapSvg');
      const vp      = document.getElementById('tbMapViewport');
      const toolbar = map.querySelector('.tb-map-toolbar');
      const canvas  = svg.querySelector('.tb-canvas');
      const mapX    = window.__toolboxMap || { scale:1, tx:0, ty:0 };

      if (!map || !svg || !vp || !toolbar || !canvas) return;

      const UNIT_COLOR = {1:'#2563EB',2:'#0D9488',3:'#D97706',4:'#7C3AED',5:'#059669'};
      const VB_W = 1600, VB_H = 1100;

      /* =========================================================
         1 · Toolbar extras + walkthrough dropdown
         ========================================================= */
      const PATHS_KEY = 'dti-walk-path';
      const activePathId = localStorage.getItem(PATHS_KEY) || 'full';

      const extras = document.createElement('span');
      extras.style.cssText = 'display:inline-flex;gap:6px;align-items:center';
      extras.innerHTML = `
        <div class="tb-walk-wrap">
          <button id="tbWalkBtn" type="button" title="Walkthrough">
            🎬 <span class="tb-walk-btn-label">Walkthrough</span> ▾
          </button>
          <div class="tb-walk-menu" id="tbWalkMenu" role="menu">
            <div class="tb-walk-section-label">Curated paths</div>
            <div id="tbWalkPaths"></div>
            <div class="tb-walk-divider"></div>
            <div class="tb-walk-section-label">Custom paths</div>
            <div id="tbWalkCustom"><div class="tb-walk-action" style="color:#94A3B8;cursor:default;font-weight:500">＋ Coming in next step…</div></div>
            <div class="tb-walk-divider"></div>
            <button class="tb-walk-action" id="tbWalkPlayFrom" disabled>
              <span class="tb-walk-emoji">▶</span> Play from selected node
              <span class="tb-walk-hint" id="tbWalkPlayFromHint">no node selected</span>
            </button>
            <button class="tb-walk-action" id="tbWalkRandom">
              <span class="tb-walk-emoji">🎲</span> Random journey
            </button>
            <button class="tb-walk-action stop" id="tbWalkStop" style="display:none">
              <span class="tb-walk-emoji">⏹</span> Stop
            </button>
          </div>
        </div>
        <span class="tb-walk-progress" id="tbWalkProg" hidden>1 / 22</span>
        <button id="tbFullBtn" title="Fullscreen">⛶</button>
        <button id="tbPngBtn"  title="Download PNG">📥</button>
        <button id="tbSvgBtn"  title="Download SVG">⤓</button>
        <button id="tbMapPrint" title="Print map (A4 landscape)">🖨</button>
      `;

      const hint = toolbar.querySelector('.tb-map-hint');
      if (hint) toolbar.insertBefore(extras, hint);
      else toolbar.appendChild(extras);

      /* ---- Render curated paths ---- */
      const walkPathsEl = document.getElementById('tbWalkPaths');
      function renderWalkPaths(){
        walkPathsEl.innerHTML = (DATA.paths || []).map(p => `
          <button class="tb-walk-item${p.id === activePathId ? ' active' : ''}"
                  data-path="${p.id}" role="menuitem">
            <span class="tb-walk-emoji">${p.emoji}</span>
            <span class="tb-walk-name">${p.name}</span>
            <span class="tb-walk-count">${p.steps.length}</span>
          </button>
        `).join('');
      }
      renderWalkPaths();

      /* ---- Menu open/close ---- */
      const walkBtn  = document.getElementById('tbWalkBtn');
      const walkMenu = document.getElementById('tbWalkMenu');

      function openMenu(){ walkMenu.classList.add('open'); }
      function closeMenu(){ walkMenu.classList.remove('open'); }
      function toggleMenu(){ walkMenu.classList.toggle('open'); }

      walkBtn.addEventListener('click', e => {
        e.stopPropagation();
        toggleMenu();
      });
      document.addEventListener('click', e => {
        if (!walkMenu.contains(e.target) && e.target !== walkBtn) closeMenu();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeMenu();
      });

      /* ---- Select a path ---- */
      walkPathsEl.addEventListener('click', e => {
        const btn = e.target.closest('[data-path]');
        if (!btn) return;
        const id = btn.dataset.path;
        localStorage.setItem(PATHS_KEY, id);
        walkPathsEl.querySelectorAll('.tb-walk-item').forEach(el => {
          el.classList.toggle('active', el.dataset.path === id);
        });
        window.__activePathId = id;
        // Auto-play on select
        startCuratedPath(id);
        closeMenu();
      });

      /* =========================================================
         2 · Walkthrough engine
         ========================================================= */
      const walkState = {
        path: [],
        idx: 0,
        timer: null,
        source: ''
      };

      const progEl = document.getElementById('tbWalkProg');
      const stopEl = document.getElementById('tbWalkStop');

      function clearHL(){
        svg.querySelectorAll('.tb-dim,.tb-pulse,.tb-walk')
          .forEach(el => el.classList.remove('tb-dim','tb-pulse','tb-walk'));
      }

      function centerOnNode(node){
        const nr = node.getBoundingClientRect();
        const vr = vp.getBoundingClientRect();
        const W = vp.clientWidth, H = vp.clientHeight;
        const fitScale = Math.min(W / VB_W, H / VB_H);
        const offX = (W - VB_W * fitScale) / 2;
        const offY = (H - VB_H * fitScale) / 2;
        const s = mapX.scale;
        const cx = (nr.left + nr.width / 2) - vr.left;
        const cy = (nr.top  + nr.height / 2) - vr.top;
        const mt = (node.getAttribute('transform') || '')
          .match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
        if (!mt) return;
        const ux = +mt[1] + 80;
        const uy = +mt[2] + 27;
        mapX.tx = (cx - offX) / fitScale - ux * s;
        mapX.ty = (cy - offY) / fitScale - uy * s;
        canvas.setAttribute('transform',
          `translate(${mapX.tx},${mapX.ty}) scale(${mapX.scale})`);
      }

      function playStep(){
        clearHL();
        svg.querySelectorAll('.tb-node').forEach(n => n.classList.add('tb-dim'));
        svg.querySelectorAll('.tb-edge').forEach(e => e.classList.add('tb-dim'));

        const id = walkState.path[walkState.idx];
        const node = svg.querySelector(`.tb-node[data-id="${cssEsc(id)}"]`);
        if (!node){ advanceOrEnd(); return; }

        node.classList.remove('tb-dim');
        node.classList.add('tb-pulse');
        centerOnNode(node);

        if (walkState.idx > 0){
          const prev = walkState.path[walkState.idx - 1];
          svg.querySelectorAll(
            `.tb-edge[data-from="${cssEsc(prev)}"][data-to="${cssEsc(id)}"],` +
            `.tb-edge[data-from="${cssEsc(id)}"][data-to="${cssEsc(prev)}"]`
          ).forEach(e => {
            e.classList.remove('tb-dim');
            e.classList.add('tb-walk');
          });
        }

        progEl.textContent = (walkState.idx + 1) + ' / ' + walkState.path.length;
        progEl.hidden = false;

        advanceOrEnd();
      }

      function advanceOrEnd(){
        walkState.idx++;
        if (walkState.idx >= walkState.path.length){
          setTimeout(stopWalk, 900);
        }
      }

      function startWalk(ids, source){
        stopWalk();
        if (!ids || !ids.length) return;
        walkState.path = ids.slice();
        walkState.idx = 0;
        walkState.source = source || '';
        walkBtn.classList.add('active');
        stopEl.style.display = '';
        playStep();
        walkState.timer = setInterval(() => {
          if (walkState.idx >= walkState.path.length) return;
          playStep();
        }, 1400);
      }

      function stopWalk(){
        if (walkState.timer){
          clearInterval(walkState.timer);
          walkState.timer = null;
        }
        walkState.path = [];
        walkState.idx = 0;
        walkBtn.classList.remove('active');
        stopEl.style.display = 'none';
        progEl.hidden = true;
        clearHL();
      }

      stopEl.addEventListener('click', () => { stopWalk(); closeMenu(); });

      /* Expose for custom-path builder */
      window.__toolboxWalk = {
        startWalk: startWalk,
        stopWalk:  stopWalk,
        closeMenu: closeMenu,
        openMenu:  openMenu
      };
      /* ---- Play a curated path by id ---- */
      function startCuratedPath(id){
        const p = (DATA.paths || []).find(x => x.id === id);
        if (!p) return;
        startWalk(p.steps, p.name);
      }

      /* ---- Random journey ---- */
      function buildRandomPath(){
        const entries = DATA.methods.filter(m =>
          !DATA.edges.some(e => e.to === m.id)
        );
        if (!entries.length) return [];

        for (let attempt = 0; attempt < 3; attempt++){
          const start = entries[Math.floor(Math.random() * entries.length)];
          const visited = new Set([start.id]);
          const ids = [start.id];
          let cur = start.id;
          for (let n = 0; n < 19; n++){
            const outs = DATA.edges.filter(e =>
              e.from === cur && !visited.has(e.to)
            );
            if (!outs.length) break;
            const pick = outs[Math.floor(Math.random() * outs.length)];
            visited.add(pick.to);
            ids.push(pick.to);
            cur = pick.to;
          }
          if (ids.length >= 5 || attempt === 2) return ids;
        }
        return [];
      }

      document.getElementById('tbWalkRandom').addEventListener('click', () => {
        const ids = buildRandomPath();
        if (!ids.length) return;
        startWalk(ids, 'Random');
        closeMenu();
      });

      /* =========================================================
         3 · Play from selected node
         ========================================================= */
      const playFromBtn = document.getElementById('tbWalkPlayFrom');
      const playFromHint = document.getElementById('tbWalkPlayFromHint');

      /* Track selected node from popup */
      let selectedNodeId = null;

      function setSelectedNode(id){
        selectedNodeId = id;
        if (id){
          playFromBtn.disabled = false;
          const m = DATA.methods.find(x => x.id === id);
          playFromHint.textContent = m ? m.name : 'selected';
        } else {
          playFromBtn.disabled = true;
          playFromHint.textContent = 'no node selected';
        }
      }

      /* Inject "Play from here" button into detail popup */
      function injectDetailPlayBtn(){
        const actions = document.querySelector('.tb-detail-actions');
        if (!actions || actions.querySelector('#tbDetailPlay')) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tb-detail-btn';
        btn.id = 'tbDetailPlay';
        btn.style.display = 'none';
        btn.textContent = '▶ Play from here';
        actions.appendChild(btn);

        btn.addEventListener('click', () => {
          const id = btn.dataset.methodId;
          if (!id) return;
          document.getElementById('tbDetailClose')?.click();
          setSelectedNode(id);
          setTimeout(() => {
            const path = buildPathFromNode(id);
            if (path.length) startWalk(path, 'From ' + (DATA.methods.find(x=>x.id===id)?.name || ''));
          }, 160);
        });

        const title = document.getElementById('tbDetailTitle');
        if (title){
          new MutationObserver(() => {
            const name = title.textContent.trim();
            const m = DATA.methods.find(x => x.name === name);
            if (m){
              btn.dataset.methodId = m.id;
              btn.style.display = '';
              setSelectedNode(m.id);
            } else {
              btn.style.display = 'none';
            }
          }).observe(title, { childList: true, characterData: true, subtree: true });
        }
      }

      /* Build a path starting from a given node */
      function buildPathFromNode(startId){
        /* 1. Prefer suffix of an existing curated path */
        for (const p of (DATA.paths || [])){
          const i = p.steps.indexOf(startId);
          if (i !== -1) return p.steps.slice(i);
        }
        /* 2. Fall back to forward graph traversal */
        const visited = new Set([startId]);
        const ids = [startId];
        let cur = startId;
        for (let n = 0; n < 14; n++){
          const outs = DATA.edges.filter(e =>
            e.from === cur && !visited.has(e.to)
          );
          if (!outs.length) break;
          /* Prefer fastest next step */
          outs.sort((a,b) =>
            ((DATA.methods.find(m => m.id === a.to)?.time) || 999) -
            ((DATA.methods.find(m => m.id === b.to)?.time) || 999)
          );
          const next = outs[0].to;
          visited.add(next);
          ids.push(next);
          cur = next;
        }
        return ids;
      }

      playFromBtn.addEventListener('click', () => {
        if (!selectedNodeId) return;
        const path = buildPathFromNode(selectedNodeId);
        if (path.length) startWalk(path, 'From ' + (DATA.methods.find(x=>x.id===selectedNodeId)?.name || ''));
        closeMenu();
      });

      /* Watch for the popup being added (it's static HTML so this runs once) */
      injectDetailPlayBtn();
      /* Re-run occasionally in case the popup gets re-rendered */
      setInterval(injectDetailPlayBtn, 2000);

      /* =========================================================
         4 · Mini-map
         ========================================================= */
      const mm = document.createElement('div');
      mm.className = 'tb-minimap';
      mm.id = 'tbMinimap';
      mm.innerHTML = `
        <svg viewBox="0 0 ${VB_W} ${VB_H}" preserveAspectRatio="xMidYMid meet">
          <g id="tbMinimapNodes"></g>
          <rect id="tbMinimapVp" class="tb-minimap-viewport"
                x="0" y="0" width="${VB_W}" height="${VB_H}"/>
        </svg>`;
      vp.appendChild(mm);

      const mmNodes = document.getElementById('tbMinimapNodes');
      svg.querySelectorAll('.tb-node').forEach(n => {
        const tf = (n.getAttribute('transform') || '').match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
        if (!tf) return;
        const x = +tf[1], y = +tf[2];
        const m = DATA.methods.find(m => m.id === n.dataset.id);
        if (!m) return;
        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        r.setAttribute('x', x);
        r.setAttribute('y', y);
        r.setAttribute('width', 160);
        r.setAttribute('height', 54);
        r.setAttribute('rx', 8);
        r.setAttribute('fill', UNIT_COLOR[m.unit] || '#2563EB');
        r.setAttribute('opacity', 0.75);
        r.dataset.nodeId = m.id;
        mmNodes.appendChild(r);
      });

      function syncMinimap(){
        const t = canvas.getAttribute('transform') || '';
        const mt = t.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
        const ms = t.match(/scale\(([-\d.]+)\)/);
        if (!mt || !ms) return;
        const tx = +mt[1], ty = +mt[2], s = +ms[1];
        const W = vp.clientWidth, H = vp.clientHeight;
        const fitScale = Math.min(W / VB_W, H / VB_H);
        const offX = (W - VB_W * fitScale) / 2;
        const offY = (H - VB_H * fitScale) / 2;
        const x1 = ((0 - offX) / fitScale - tx) / s;
        const x2 = ((W - offX) / fitScale - tx) / s;
        const y1 = ((0 - offY) / fitScale - ty) / s;
        const y2 = ((H - offY) / fitScale - ty) / s;
        const r = document.getElementById('tbMinimapVp');
        if (r){
          r.setAttribute('x', x1);
          r.setAttribute('y', y1);
          r.setAttribute('width',  Math.max(30, x2 - x1));
          r.setAttribute('height', Math.max(30, y2 - y1));
        }
      }

      if (window.MutationObserver){
        new MutationObserver(syncMinimap)
          .observe(canvas, { attributes:true, attributeFilter:['transform'] });
      }
      window.addEventListener('resize', syncMinimap);
      document.addEventListener('fullscreenchange', () => setTimeout(syncMinimap, 120));
      setTimeout(syncMinimap, 250);

      mm.addEventListener('click', e => {
        const r = mm.getBoundingClientRect();
        const fitM = Math.min(r.width / VB_W, r.height / VB_H);
        const offMX = (r.width  - VB_W * fitM) / 2;
        const offMY = (r.height - VB_H * fitM) / 2;
        const userX = (e.clientX - r.left - offMX) / fitM;
        const userY = (e.clientY - r.top  - offMY) / fitM;
        const W = vp.clientWidth, H = vp.clientHeight;
        const fitScale = Math.min(W / VB_W, H / VB_H);
        const offX = (W - VB_W * fitScale) / 2;
        const offY = (H - VB_H * fitScale) / 2;
        const s = mapX.scale;
        mapX.tx = (W / 2 - offX) / fitScale - userX * s;
        mapX.ty = (H / 2 - offY) / fitScale - userY * s;
        canvas.setAttribute('transform',
          `translate(${mapX.tx},${mapX.ty}) scale(${mapX.scale})`);
      });

      /* =========================================================
         5 · Fullscreen
         ========================================================= */
      document.getElementById('tbFullBtn').addEventListener('click', () => {
        if (!document.fullscreenElement)
          map.requestFullscreen?.().catch(err => console.warn(err));
        else
          document.exitFullscreen?.();
      });

      /* =========================================================
         6 · Export
         ========================================================= */
      function cleanClone(){
        const c = svg.cloneNode(true);
        const g = c.querySelector('.tb-canvas');
        if (g) g.setAttribute('transform', 'translate(0,0) scale(1)');
        c.querySelectorAll('.tb-dim,.tb-hl,.tb-nb,.tb-pulse,.tb-walk')
          .forEach(el => el.classList.remove('tb-dim','tb-hl','tb-nb','tb-pulse','tb-walk'));
        c.querySelectorAll('.tb-edge').forEach(e =>
          e.setAttribute('marker-end', 'url(#tbArrow)'));
        c.insertAdjacentHTML('afterbegin',
          '<rect width="100%" height="100%" fill="#ffffff"/>');
        return c;
      }

      function downloadBlob(blob, name){
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
      }

      function toast(msg){
        let t = document.getElementById('tbToast');
        if (!t){
          t = document.createElement('div');
          t.id = 'tbToast';
          t.className = 'tb-export-toast';
          document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        clearTimeout(t._t);
        t._t = setTimeout(() => t.style.opacity = '0', 2200);
      }

      document.getElementById('tbPngBtn').addEventListener('click', () => {
        toast('Preparing PNG…');
        const xml = new XMLSerializer().serializeToString(cleanClone());
        const url = URL.createObjectURL(new Blob([xml], {type:'image/svg+xml;charset=utf-8'}));
        const img = new Image();
        img.onload = () => {
          const W = 3200, H = 2200;
          const cv = document.createElement('canvas');
          cv.width = W; cv.height = H;
          const ctx = cv.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
          cv.toBlob(b => { downloadBlob(b, 'designers-toolbox-map.png'); toast('PNG downloaded ✓'); });
        };
        img.onerror = () => { URL.revokeObjectURL(url); toast('PNG export failed'); };
        img.src = url;
      });

      document.getElementById('tbSvgBtn').addEventListener('click', () => {
        const xml = new XMLSerializer().serializeToString(cleanClone());
        const blob = new Blob([xml], {type:'image/svg+xml;charset=utf-8'});
        downloadBlob(blob, 'designers-toolbox-map.svg');
        toast('SVG downloaded ✓');
      });

      /* =========================================================
         7 · Print map
         ========================================================= */
      document.getElementById('tbMapPrint').addEventListener('click', () => {
        document.body.classList.add('print-map');
        setTimeout(() => {
          window.print();
          setTimeout(() => document.body.classList.remove('print-map'), 400);
        }, 80);
      });

      /* =========================================================
         Utility
         ========================================================= */
      function cssEsc(s){
        return String(s).replace(/["\\]/g, '\\$&');
      }

      /* Init selected state from default path */
      window.__activePathId = activePathId;

      console.log('[toolbox-extras] ready — paths:', (DATA.paths||[]).length,
                  '· walkthrough A/B/C online');
    }
  });
})();