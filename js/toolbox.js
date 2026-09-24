/* =========================================================
   Designer's Toolbox — List + Map views
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function init(){
    const DATA = window.TOOLBOX;
    if (!DATA || !Array.isArray(DATA.methods)){
      console.warn('[toolbox] data not loaded');
      return;
    }

    /* =========================================================
       Constants
       ========================================================= */
    const UNIT_COLORS = {
      1:'#2563EB', 2:'#0D9488', 3:'#D97706',
      4:'#7C3AED', 5:'#059669'
    };

    /* Canvas layout */
    const MAP = {
      width: 1600, height: 1100,
      padX: 60, padY: 80,
      colW: 160, colGap: 100,
      nodeH: 54, nodeGap: 12
    };

    /* =========================================================
       State
       ========================================================= */
    const state = {
      view: 'list',
      search: '',
      stages: new Set(),
      units: new Set(),
      sort: 'default',
      mapRendered: false
    };

    /* =========================================================
       DOM
       ========================================================= */
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));

    const list       = $('#tbList');
    const empty      = $('#tbEmpty');
    const searchEl   = $('#tbSearch');
    const clearBtn   = $('#tbSearchClear');
    const sortEl     = $('#tbSort');
    const resetBtn   = $('#tbReset');
    const countEl    = $('#tbResultCount');
    const activeEl   = $('#tbActiveFilters');
    const stageWrap  = $('#tbStageChips');
    const unitWrap   = $('#tbUnitChips');
    const detail     = $('#tbDetail');
    const detailClose= $('#tbDetailClose');
    const viewBtns   = $$('.tb-view-btn');

    if (!list) return;

    /* =========================================================
       Helpers
       ========================================================= */
    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      })[c]);
    }
    function escapeAttr(s){ return escapeHtml(s).replace(/"/g, '&quot;'); }

    function methodById(id){
      return DATA.methods.find(m => m.id === id);
    }

    function connectionCount(id){
      let c = 0;
      DATA.edges.forEach(e => { if (e.from === id || e.to === id) c++; });
      return c;
    }

    function truncate(str, max){
      if (!str) return '';
      return str.length <= max ? str : str.slice(0, max - 1) + '…';
    }

    /* =========================================================
       Inject map container (so HTML doesn't need editing)
       ========================================================= */
    function buildMapContainer(){
      if ($('#tbMap')) return;
      const wrap = document.createElement('div');
      wrap.className = 'tb-map';
      wrap.id = 'tbMap';
      wrap.hidden = true;
      wrap.innerHTML = `
        <div class="tb-map-toolbar">
          <button id="tbZoomOut" aria-label="Zoom out" title="Zoom out">−</button>
          <span class="tb-map-zoom-label" id="tbZoomLabel">100%</span>
          <button id="tbZoomIn" aria-label="Zoom in" title="Zoom in">＋</button>
          <button id="tbZoomReset" aria-label="Reset view" title="Reset view">⟲</button>
          <button id="tbMapFit" aria-label="Fit to screen" title="Fit to screen">⤢</button>
          <span class="tb-map-hint">Drag to pan · Scroll to zoom · Click a node to open</span>
        </div>
        <div class="tb-map-viewport" id="tbMapViewport">
          <svg id="tbMapSvg" xmlns="http://www.w3.org/2000/svg"></svg>
        </div>
      `;
      list.parentNode.insertBefore(wrap, list);
    }

    /* =========================================================
       Chips
       ========================================================= */
    function buildChips(){
      stageWrap.innerHTML = '';
      const allStage = document.createElement('button');
      allStage.className = 'tb-chip active';
      allStage.textContent = 'All';
      allStage.dataset.stage = '';
      stageWrap.appendChild(allStage);

      DATA.stages.forEach(s => {
        const chip = document.createElement('button');
        chip.className = 'tb-chip';
        chip.textContent = s.emoji + ' ' + s.id;
        chip.dataset.stage = s.id;
        stageWrap.appendChild(chip);
      });

      unitWrap.innerHTML = '';
      const allUnit = document.createElement('button');
      allUnit.className = 'tb-chip active';
      allUnit.textContent = 'All';
      allUnit.dataset.unit = '';
      unitWrap.appendChild(allUnit);
      [1,2,3,4,5].forEach(n => {
        const chip = document.createElement('button');
        chip.className = 'tb-chip';
        chip.textContent = 'Unit ' + n;
        chip.dataset.unit = String(n);
        unitWrap.appendChild(chip);
      });

      [stageWrap, unitWrap].forEach(container => {
        container.addEventListener('click', e => {
          const chip = e.target.closest('.tb-chip');
          if (!chip) return;
          if (chip.dataset.stage !== undefined){
            const v = chip.dataset.stage;
            if (!v) state.stages.clear();
            else state.stages.has(v) ? state.stages.delete(v) : state.stages.add(v);
          }
          if (chip.dataset.unit !== undefined){
            const v = chip.dataset.unit;
            if (!v) state.units.clear();
            else state.units.has(v) ? state.units.delete(v) : state.units.add(v);
          }
          refreshChipStates();
          refresh();
        });
      });
    }

    function refreshChipStates(){
      stageWrap.querySelectorAll('.tb-chip').forEach(c => {
        const v = c.dataset.stage;
        if (!v) c.classList.toggle('active', state.stages.size === 0);
        else c.classList.toggle('active', state.stages.has(v));
      });
      unitWrap.querySelectorAll('.tb-chip').forEach(c => {
        const v = c.dataset.unit;
        if (!v) c.classList.toggle('active', state.units.size === 0);
        else c.classList.toggle('active', state.units.has(v));
      });
    }

    /* =========================================================
       Filter + Sort
       ========================================================= */
    function getFiltered(){
      const q = state.search.toLowerCase().trim();
      const arr = DATA.methods.filter(m => {
        if (state.stages.size && !state.stages.has(m.stage)) return false;
        if (state.units.size && !state.units.has(String(m.unit))) return false;
        if (q){
          const blob = (m.name + ' ' + m.useWhen + ' ' + m.description + ' ' + m.stage + ' ' + m.section).toLowerCase();
          if (!blob.includes(q)) return false;
        }
        return true;
      });

      const stageOrder = DATA.stages.map(s => s.id);
      switch (state.sort){
        case 'az':
          arr.sort((a,b) => a.name.localeCompare(b.name)); break;
        case 'unit':
          arr.sort((a,b) => a.unit - b.unit || a.name.localeCompare(b.name)); break;
        case 'connected':
          arr.sort((a,b) => connectionCount(b.id) - connectionCount(a.id)); break;
        default:
          arr.sort((a,b) =>
            (stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage)) ||
            (a.unit - b.unit));
      }
      return arr;
    }

    /* =========================================================
       List render
       ========================================================= */
    function cardHTML(m){
      const color = UNIT_COLORS[m.unit] || '#2563EB';
      const meta = [
        '⏱ ' + m.time + ' min',
        '👥 ' + m.group,
        '📘 ' + m.section
      ];
      return `
        <article class="tb-card" style="--unit-color:${color};" data-id="${escapeAttr(m.id)}" tabindex="0">
          <div class="tb-card-head">
            <span class="tb-card-emoji">${m.emoji}</span>
            <div class="tb-card-title">
              <h3 class="tb-card-name">${escapeHtml(m.name)}</h3>
              <div class="tb-card-tag">Unit ${m.unit} · ${escapeHtml(m.stage)}</div>
            </div>
          </div>
          <p class="tb-card-usewhen"><b>Use when</b>${escapeHtml(m.useWhen)}</p>
          <div class="tb-card-meta">${meta.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
          <div class="tb-card-actions">
            <a class="tb-open-topic" href="${escapeAttr(m.link)}" onclick="event.stopPropagation();">Open topic →</a>
            <button class="tb-view-details" data-id="${escapeAttr(m.id)}">Details</button>
            <button class="tb-show-on-map" data-id="${escapeAttr(m.id)}" title="Show on map">🗺</button>
          </div>
        </article>`;
    }

    function renderList(filtered){
      if (filtered.length === 0){
        list.innerHTML = '';
        empty.hidden = false;
      } else {
        empty.hidden = true;
        list.innerHTML = filtered.map(cardHTML).join('');
      }
    }

    /* =========================================================
       Map layout
       ========================================================= */
    function computeLayout(){
      const stageOrder = DATA.stages.map(s => s.id);
      const byStage = {};
      DATA.methods.forEach(m => {
        (byStage[m.stage] = byStage[m.stage] || []).push(m);
      });

      const nodes = {};
      stageOrder.forEach((stageId, colIdx) => {
        const list = byStage[stageId] || [];
        const x = MAP.padX + colIdx * (MAP.colW + MAP.colGap);
        list.forEach((m, i) => {
          const y = MAP.padY + i * (MAP.nodeH + MAP.nodeGap);
          nodes[m.id] = {
            method: m,
            x: x, y: y,
            w: MAP.colW, h: MAP.nodeH,
            cx: x + MAP.colW / 2,
            cy: y + MAP.nodeH / 2,
            stage: stageId
          };
        });
      });

      return { nodes, stageOrder };
    }

    function edgePath(a, b){
      /* Same column */
      if (a.x === b.x){
        const bulge = 70;
        const rx = a.x + a.w + bulge;
        return `M${a.x + a.w},${a.cy} C${rx},${a.cy} ${rx},${b.cy} ${b.x + b.w},${b.cy}`;
      }
      /* Cross-column */
      const midX = (a.x + a.w + b.x) / 2;
      return `M${a.x + a.w},${a.cy} C${midX},${a.cy} ${midX},${b.cy} ${b.x},${b.cy}`;
    }

    /* =========================================================
       Map render
       ========================================================= */
    function renderMap(){
      const svg = $('#tbMapSvg');
      if (!svg) return;

      const { nodes, stageOrder } = computeLayout();
      svg.setAttribute('viewBox', `0 0 ${MAP.width} ${MAP.height}`);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      /* ---- Defs ---- */
      const defs = `
        <defs>
          <marker id="tbArrow" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#94A3B8"/>
          </marker>
          <marker id="tbArrowHl" viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="#7C3AED"/>
          </marker>
        </defs>`;

      /* ---- Stage headers ---- */
      const headers = stageOrder.map((sid, i) => {
        const stage = DATA.stages.find(s => s.id === sid);
        const x = MAP.padX + i * (MAP.colW + MAP.colGap) + MAP.colW / 2;
        return `<text class="tb-stage-header" x="${x}" y="45" text-anchor="middle"
                      font-size="13" fill="${stage.color}">
                  ${stage.emoji}  ${sid}
                </text>`;
      }).join('');

      /* ---- Edges ---- */
      const edges = DATA.edges.map((e, idx) => {
        const a = nodes[e.from];
        const b = nodes[e.to];
        if (!a || !b) return '';
        const d = edgePath(a, b);
        return `<path class="tb-edge"
                      data-from="${escapeAttr(e.from)}"
                      data-to="${escapeAttr(e.to)}"
                      data-idx="${idx}"
                      d="${d}"
                      fill="none"
                      stroke="#CBD5E1"
                      stroke-width="1.5"
                      opacity="0.55"
                      marker-end="url(#tbArrow)"/>`;
      }).join('');

      /* ---- Nodes ---- */
      const nodeEls = Object.values(nodes).map(n => {
        const color = UNIT_COLORS[n.method.unit] || '#2563EB';
        const name = truncate(n.method.name, 17);
        return `
          <g class="tb-node"
             data-id="${escapeAttr(n.method.id)}"
             transform="translate(${n.x},${n.y})"
             tabindex="0" role="button"
             aria-label="${escapeAttr(n.method.name)}">
            <rect width="${n.w}" height="${n.h}" rx="10" ry="10"
                  fill="#ffffff" stroke="${color}" stroke-width="1.5"/>
            <text x="14" y="${n.h/2 + 6}"
                  font-size="18" dominant-baseline="middle">${n.method.emoji}</text>
            <text x="42" y="${n.h/2 + 5}"
                  font-size="11.5" font-weight="700"
                  fill="#1F2937" dominant-baseline="middle">
              ${escapeHtml(name)}
            </text>
            <text x="${n.w - 10}" y="14" text-anchor="end"
                  font-size="8" font-weight="800"
                  fill="${color}" opacity="0.8">U${n.method.unit}</text>
          </g>`;
      }).join('');

      svg.innerHTML = `${defs}
        <g class="tb-canvas">
          <g class="tb-stage-headers">${headers}</g>
          <g class="tb-edges">${edges}</g>
          <g class="tb-nodes">${nodeEls}</g>
        </g>`;

      /* Apply current transform */
      applyMapTransform();
    }

    /* =========================================================
       Map zoom / pan
       ========================================================= */
    const mapXform = { scale: 1, tx: 0, ty: 0 };
    window.__toolboxMap = mapXform;   // exposed for map-extras.js
    function applyMapTransform(){
      const svg = $('#tbMapSvg');
      if (!svg) return;
      const g = svg.querySelector('.tb-canvas');
      if (!g) return;
      g.setAttribute('transform',
        `translate(${mapXform.tx},${mapXform.ty}) scale(${mapXform.scale})`);
      const lbl = $('#tbZoomLabel');
      if (lbl) lbl.textContent = Math.round(mapXform.scale * 100) + '%';
    }

    function setupMapInteractions(){
      const svg = $('#tbMapSvg');
      const vp = $('#tbMapViewport');
      if (!svg || !vp || svg.dataset.bound) return;
      svg.dataset.bound = '1';

      /* ---- Zoom with wheel ---- */
      vp.addEventListener('wheel', e => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const next = Math.max(0.4, Math.min(2.6, mapXform.scale * delta));
        const rect = vp.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const k = next / mapXform.scale;
        mapXform.tx = mx - k * (mx - mapXform.tx);
        mapXform.ty = my - k * (my - mapXform.ty);
        mapXform.scale = next;
        applyMapTransform();
      }, { passive: false });

      /* ---- Pan with drag ---- */
      let dragging = false, lastX = 0, lastY = 0, moved = 0;
      vp.addEventListener('mousedown', e => {
        if (e.target.closest('.tb-node')) return;
        dragging = true; moved = 0;
        lastX = e.clientX; lastY = e.clientY;
        vp.classList.add('grabbing');
      });
      window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        mapXform.tx += dx;
        mapXform.ty += dy;
        lastX = e.clientX; lastY = e.clientY;
        applyMapTransform();
      });
      window.addEventListener('mouseup', () => {
        dragging = false;
        vp.classList.remove('grabbing');
      });

      /* ---- Touch pan (one finger) ---- */
      let tLastX = 0, tLastY = 0;
      vp.addEventListener('touchstart', e => {
        if (e.touches.length === 1 && !e.target.closest('.tb-node')){
          tLastX = e.touches[0].clientX;
          tLastY = e.touches[0].clientY;
        }
      }, { passive: true });
      vp.addEventListener('touchmove', e => {
        if (e.touches.length === 1 && tLastX !== 0){
          const x = e.touches[0].clientX, y = e.touches[0].clientY;
          mapXform.tx += x - tLastX;
          mapXform.ty += y - tLastY;
          tLastX = x; tLastY = y;
          applyMapTransform();
          e.preventDefault();
        }
      }, { passive: false });
      vp.addEventListener('touchend', () => { tLastX = 0; tLastY = 0; });

      /* ---- Zoom buttons ---- */
      $('#tbZoomIn')?.addEventListener('click', () => {
        mapXform.scale = Math.min(2.6, mapXform.scale * 1.2);
        applyMapTransform();
      });
      $('#tbZoomOut')?.addEventListener('click', () => {
        mapXform.scale = Math.max(0.4, mapXform.scale / 1.2);
        applyMapTransform();
      });
      $('#tbZoomReset')?.addEventListener('click', () => {
        mapXform.scale = 1; mapXform.tx = 0; mapXform.ty = 0;
        applyMapTransform();
      });
      $('#tbMapFit')?.addEventListener('click', () => {
        mapXform.scale = 1; mapXform.tx = 0; mapXform.ty = 0;
        applyMapTransform();
      });

      /* ---- Node interactions (delegated) ---- */
      svg.addEventListener('mouseover', e => {
        const node = e.target.closest('.tb-node');
        if (node) highlightNode(node.dataset.id);
      });
      svg.addEventListener('mouseout', e => {
        const node = e.target.closest('.tb-node');
        if (node) clearNodeHighlight();
      });
      svg.addEventListener('click', e => {
        const node = e.target.closest('.tb-node');
        if (!node) return;
        if (moved > 5) return; // was a drag, not a click
        openDetail(node.dataset.id);
      });
      svg.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const node = e.target.closest('.tb-node');
        if (!node) return;
        e.preventDefault();
        openDetail(node.dataset.id);
      });
      svg.addEventListener('focusin', e => {
        const node = e.target.closest('.tb-node');
        if (node) highlightNode(node.dataset.id);
      });
      svg.addEventListener('focusout', e => {
        const node = e.target.closest('.tb-node');
        if (node) clearNodeHighlight();
      });
    }

    /* =========================================================
       Highlight node + neighbours
       ========================================================= */
    function highlightNode(id){
      const svg = $('#tbMapSvg');
      if (!svg) return;
      const nodes = svg.querySelectorAll('.tb-node');
      const edges = svg.querySelectorAll('.tb-edge');

      nodes.forEach(n => n.classList.add('tb-dim'));
      edges.forEach(e => e.classList.add('tb-dim'));

      const self = svg.querySelector(`.tb-node[data-id="${cssEsc(id)}"]`);
      if (self){ self.classList.remove('tb-dim'); self.classList.add('tb-hl'); }

      const neighbours = new Set();
      DATA.edges.forEach(e => {
        if (e.from === id) neighbours.add(e.to);
        if (e.to === id) neighbours.add(e.from);
      });

      svg.querySelectorAll(`.tb-edge[data-from="${cssEsc(id)}"], .tb-edge[data-to="${cssEsc(id)}"]`)
        .forEach(e => {
          e.classList.remove('tb-dim');
          e.classList.add('tb-hl');
          e.setAttribute('marker-end', 'url(#tbArrowHl)');
        });

      neighbours.forEach(nid => {
        const n = svg.querySelector(`.tb-node[data-id="${cssEsc(nid)}"]`);
        if (n){ n.classList.remove('tb-dim'); n.classList.add('tb-nb'); }
      });
    }

    function clearNodeHighlight(){
      const svg = $('#tbMapSvg');
      if (!svg) return;
      svg.querySelectorAll('.tb-dim,.tb-hl,.tb-nb').forEach(el =>
        el.classList.remove('tb-dim','tb-hl','tb-nb'));
      svg.querySelectorAll('.tb-edge').forEach(e =>
        e.setAttribute('marker-end', 'url(#tbArrow)'));
    }

    function cssEsc(s){
      return String(s).replace(/["\\]/g, '\\$&');
    }

    /* =========================================================
       View switch
       ========================================================= */
    function setView(v){
      state.view = v;
      viewBtns.forEach(b => {
        const on = b.dataset.view === v;
        b.classList.toggle('active', on);
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      const mapEl = $('#tbMap');
      if (v === 'map'){
        if (list) list.style.display = 'none';
        if (empty) empty.hidden = true;
        if (mapEl) mapEl.hidden = false;
        if (!state.mapRendered){
          renderMap();
          setupMapInteractions();
          state.mapRendered = true;
        } else {
          applyMapTransform();
        }
      } else {
        if (list) list.style.display = '';
        if (mapEl) mapEl.hidden = true;
        refreshList();
      }
      updateResultCount();
    }

    /* =========================================================
       Detail popup
       ========================================================= */
    let currentDetailId = null;

    function openDetail(id){
      const m = methodById(id);
      if (!m) return;
      currentDetailId = id;

      $('#tbDetailEmoji').textContent = m.emoji;
      $('#tbDetailTag').textContent = `Unit ${m.unit} · ${m.section} · ${m.stage}`;
      $('#tbDetailTitle').textContent = m.name;
      $('#tbDetailDesc').textContent = m.description;

      $('#tbDetailMeta').innerHTML = `
        <div class="tb-detail-meta-item"><b>Time</b><span>⏱ ${m.time} min</span></div>
        <div class="tb-detail-meta-item"><b>Group</b><span>👥 ${escapeHtml(m.group)}</span></div>
      `;

      const inputs  = m.inputs.map(methodById).filter(Boolean);
      const outputs = m.outputs.map(methodById).filter(Boolean);

      let linksHTML = '';
      if (inputs.length){
        linksHTML += `
          <div class="tb-detail-links-section">
            <h4>⬅ Uses input from</h4>
            <div class="tb-detail-links-list">
              ${inputs.map(i =>
                `<button class="tb-detail-link-chip" data-jump="${escapeAttr(i.id)}">${i.emoji} ${escapeHtml(i.name)}</button>`
              ).join('')}
            </div>
          </div>`;
      }
      if (outputs.length){
        linksHTML += `
          <div class="tb-detail-links-section">
            <h4>➡ Feeds into</h4>
            <div class="tb-detail-links-list">
              ${outputs.map(o =>
                `<button class="tb-detail-link-chip" data-jump="${escapeAttr(o.id)}">${o.emoji} ${escapeHtml(o.name)}</button>`
              ).join('')}
            </div>
          </div>`;
      }
      $('#tbDetailLinks').innerHTML = linksHTML;

      const openLink = $('#tbDetailOpen');
      openLink.href = m.link;

      /* Ensure "Show on map" button exists */
      let mapBtn = $('#tbDetailMap');
      if (!mapBtn){
        mapBtn = document.createElement('button');
        mapBtn.className = 'tb-detail-btn';
        mapBtn.id = 'tbDetailMap';
        mapBtn.textContent = '🗺 Show on map';
        const actions = document.querySelector('.tb-detail-actions');
        const copy = $('#tbDetailCopy');
        if (copy) actions.insertBefore(mapBtn, copy);
        else actions.appendChild(mapBtn);
      }
      mapBtn.onclick = () => {
        closeDetail();
        setView('map');
        setTimeout(() => {
          const svg = $('#tbMapSvg');
          const node = svg?.querySelector(`.tb-node[data-id="${cssEsc(m.id)}"]`);
          if (node){
            node.classList.add('tb-hl');
            const rect = node.getBoundingClientRect();
            const vp   = $('#tbMapViewport').getBoundingClientRect();
            mapXform.tx -= (rect.left + rect.width/2) - (vp.left + vp.width/2);
            mapXform.ty -= (rect.top + rect.height/2) - (vp.top + vp.height/2);
            applyMapTransform();
            setTimeout(() => node.classList.remove('tb-hl'), 1600);
          }
        }, 180);
      };

      detail.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeDetail(){
      detail.hidden = true;
      document.body.style.overflow = '';
      currentDetailId = null;
    }

    /* =========================================================
       Result counter + active filters
       ========================================================= */
    function updateResultCount(){
      const total = DATA.methods.length;
      const filtered = getFiltered();
      const active = state.search || state.stages.size || state.units.size;

      countEl.textContent = active
        ? `Showing ${filtered.length} of ${total} methods`
        : `Showing all ${total} methods`;

      activeEl.innerHTML = '';
      if (state.search)
        activeEl.innerHTML += `<span class="tb-active-filter">🔍 ${escapeHtml(state.search)}</span>`;
      state.stages.forEach(s =>
        activeEl.innerHTML += `<span class="tb-active-filter">${escapeHtml(s)}</span>`);
      state.units.forEach(u =>
        activeEl.innerHTML += `<span class="tb-active-filter">Unit ${escapeHtml(u)}</span>`);

      clearBtn.hidden = !state.search;
    }

    /* =========================================================
       Refresh (list + map highlight)
       ========================================================= */
    function refreshList(){
      const filtered = getFiltered();
      renderList(filtered);
    }

    function refresh(){
      updateResultCount();
      if (state.view === 'list') refreshList();
      else applyMapFilter();
    }

    function applyMapFilter(){
      /* Dim nodes that don't match the current search/filter */
      const svg = $('#tbMapSvg');
      if (!svg) return;
      const filtered = new Set(getFiltered().map(m => m.id));

      svg.querySelectorAll('.tb-node').forEach(n => {
        n.classList.toggle('tb-dim', !filtered.has(n.dataset.id));
      });
      svg.querySelectorAll('.tb-edge').forEach(e => {
        const ok = filtered.has(e.dataset.from) && filtered.has(e.dataset.to);
        e.classList.toggle('tb-dim', !ok);
      });
    }

    /* =========================================================
       Events
       ========================================================= */
    function bindEvents(){
      /* Search */
      let searchTimer = null;
      searchEl.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          state.search = searchEl.value;
          refresh();
        }, 150);
      });
      clearBtn.addEventListener('click', () => {
        searchEl.value = ''; state.search = ''; refresh(); searchEl.focus();
      });

      /* Sort */
      sortEl.addEventListener('change', () => {
        state.sort = sortEl.value; refresh();
      });

      /* Reset */
      resetBtn.addEventListener('click', () => {
        state.search = '';
        state.stages.clear();
        state.units.clear();
        state.sort = 'default';
        searchEl.value = '';
        sortEl.value = 'default';
        refreshChipStates();
        refresh();
      });

      /* View toggle */
      viewBtns.forEach(b => {
        b.addEventListener('click', () => {
          if (b.disabled) return;
          setView(b.dataset.view);
        });
      });

      /* List cards */
      list.addEventListener('click', e => {
        const showOnMap = e.target.closest('.tb-show-on-map');
        if (showOnMap){
          e.preventDefault();
          openDetail(showOnMap.dataset.id);
          setTimeout(() => $('#tbDetailMap')?.click(), 40);
          return;
        }
        const detailsBtn = e.target.closest('.tb-view-details');
        if (detailsBtn){
          e.preventDefault();
          openDetail(detailsBtn.dataset.id);
          return;
        }
        if (e.target.closest('a')) return;
        const card = e.target.closest('.tb-card');
        if (card) openDetail(card.dataset.id);
      });
      list.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        const card = e.target.closest('.tb-card');
        if (card) openDetail(card.dataset.id);
      });

      /* Detail popup */
      detailClose.addEventListener('click', closeDetail);
      detail.addEventListener('click', e => {
        if (e.target === detail) closeDetail();
      });
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !detail.hidden) closeDetail();
      });

      $('#tbDetailLinks').addEventListener('click', e => {
        const chip = e.target.closest('.tb-detail-link-chip');
        if (!chip) return;
        const id = chip.dataset.jump;
        closeDetail();
        setTimeout(() => openDetail(id), 100);
      });

      $('#tbDetailCopy').addEventListener('click', () => {
        const m = methodById(currentDetailId);
        if (!m) return;
        const text =
          `${m.emoji} ${m.name}\n` +
          `Unit ${m.unit} · ${m.section}\n\n` +
          `When to use: ${m.useWhen}\n\n` +
          `${m.description}\n\n` +
          `Time: ${m.time} min · Group: ${m.group}`;
        navigator.clipboard.writeText(text).then(() => {
          const btn = $('#tbDetailCopy');
          const orig = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(() => btn.textContent = orig, 1400);
        }).catch(() => alert('Copy failed — select text manually.'));
      });
    }

    /* =========================================================
       Deep link: #m=<id> opens detail
       ========================================================= */
    function applyHash(){
      const m = location.hash.match(/^#m=(.+)$/);
      if (m && methodById(m[1])){
        setView('list');
        setTimeout(() => openDetail(m[1]), 60);
      }
    }

    /* =========================================================
       Init
       ========================================================= */
    buildMapContainer();
    buildChips();
    refreshChipStates();
    refresh();
    bindEvents();
    applyHash();

    /* Hero stats */
    const statM = document.getElementById('tbStatMethods');
    const statE = document.getElementById('tbStatEdges');
    if (statM) statM.textContent = DATA.methods.length;
    if (statE) statE.textContent = DATA.edges.length;

    console.log('[toolbox] ready —', DATA.methods.length, 'methods ·', DATA.edges.length, 'edges');
  });
})();