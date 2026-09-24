/* =========================================================
   CASE STUDY LIBRARY — full build
   Search · filter · render · modal · deep links · share · print
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function init(){
    var DATA = window.CASES_DATA;
    var CATS = window.CASES_CATEGORIES || [];
    if (!Array.isArray(DATA)){ console.warn('[cases] no CASES_DATA'); return; }

    /* ---------- DOM ---------- */
    var grid        = document.getElementById('casesGrid');
    var empty       = document.getElementById('casesEmpty');
    var countEl     = document.getElementById('casesCount');
    var searchEl    = document.getElementById('casesSearch');
    var resetBtn    = document.getElementById('casesReset');
    var catChips    = document.getElementById('casesCategoryChips');
    var regionChips = document.getElementById('casesRegionChips');
    var eraChips    = document.getElementById('casesEraChips');
    var modal       = document.getElementById('caseModal');
    var modalBody   = document.getElementById('caseModalBody');
    var modalEmoji  = document.getElementById('caseModalEmoji');
    var modalTag    = document.getElementById('caseModalTag');
    var modalTitle  = document.getElementById('caseModalTitle');
    var modalMeta   = document.getElementById('caseModalMeta');
    var modalClose  = document.getElementById('caseModalClose');
    var modalPrev   = document.getElementById('caseModalPrev');
    var modalNext   = document.getElementById('caseModalNext');
    var modalShare  = document.getElementById('caseModalShare');
    var modalPrint  = document.getElementById('caseModalPrint');

    if (!grid) return;

    /* ---------- State ---------- */
    var state = {
      search: '',
      category: 'all',
      region: 'all',
      era: 'all',
      currentIndex: -1,
      filtered: []
    };

    var CAT_COLOR = {};
    CATS.forEach(function(c){ CAT_COLOR[c.id] = c.color; });

    /* ---------- Utility ---------- */
    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, function(ch){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch];
      });
    }
    function escapeAttr(s){ return escapeHtml(s); }

    /* Friendly method-name from id */
    var METHOD_LABELS = {
      'bmc':'BMC','vpc':'VPC','ipr-check':'IPR Check','mvp':'MVP',
      'dfv':'DFV Check','cad-simulation':'CAD & Simulation',
      'gtm':'GTM','ab-testing':'A/B Testing','ai-ideation':'AI Ideation',
      '5-whys':'5 Whys','pov':'POV','hmw':'HMW'
    };
    function methodLabel(id){
      if (METHOD_LABELS[id]) return METHOD_LABELS[id];
      return id.split('-').map(function(w){
        return w.charAt(0).toUpperCase() + w.slice(1);
      }).join(' ');
    }

    /* ---------- Build filter chips ---------- */
    function buildChips(){
      var catHTML = '<button class="cases-chip active" data-val="all" type="button">All</button>';
      CATS.forEach(function(c){
        catHTML += '<button class="cases-chip" data-val="' + c.id + '" type="button">'
                 + c.emoji + ' ' + c.id + '</button>';
      });
      catChips.innerHTML = catHTML;

      regionChips.innerHTML = ['all','Global','India'].map(function(r){
        return '<button class="cases-chip' + (r === 'all' ? ' active' : '') + '" '
             + 'data-val="' + r + '" type="button">' + (r === 'all' ? 'All' : r) + '</button>';
      }).join('');

      eraChips.innerHTML = ['all','Classic','Modern'].map(function(e){
        var label = e === 'all' ? 'All' : (e === 'Classic' ? 'Classic (<2000)' : 'Modern (2000+)');
        return '<button class="cases-chip' + (e === 'all' ? ' active' : '') + '" '
             + 'data-val="' + e + '" type="button">' + label + '</button>';
      }).join('');
    }

    function bindChipRow(el, key){
      el.addEventListener('click', function(e){
        var chip = e.target.closest('.cases-chip');
        if (!chip) return;
        el.querySelectorAll('.cases-chip').forEach(function(c){
          c.classList.toggle('active', c === chip);
        });
        state[key] = chip.dataset.val;
        render();
      });
    }

    /* ---------- Filter ---------- */
    function getFiltered(){
      var q = state.search.toLowerCase().trim();
      return DATA.filter(function(c){
        if (state.category !== 'all' && c.category !== state.category) return false;
        if (state.region   !== 'all' && c.region   !== state.region)   return false;
        if (state.era      !== 'all' && c.era      !== state.era)      return false;
        if (q){
          var blob = (c.company + ' ' + c.problem + ' '
                    + c.lessons.join(' ') + ' '
                    + c.methods.join(' ') + ' '
                    + c.category + ' ' + c.region).toLowerCase();
          if (blob.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    /* ---------- Card render ---------- */
    function cardHTML(c){
      var color = CAT_COLOR[c.category] || '#1E3A8A';
      var excerpt = c.problem.length > 120 ? c.problem.slice(0, 117) + '…' : c.problem;
      return ''
        + '<button class="case-card" type="button" data-id="' + escapeAttr(c.id) + '" '
        + 'style="--cc:' + color + '">'
        +   '<div class="case-card-emoji">' + c.emoji + '</div>'
        +   '<div class="case-card-tag">' + escapeHtml(c.category) + ' · ' + escapeHtml(c.region) + '</div>'
        +   '<h3>' + escapeHtml(c.company) + '</h3>'
        +   '<p class="case-card-excerpt">' + escapeHtml(excerpt) + '</p>'
        +   '<div class="case-card-meta">'
        +     '<span>📅 ' + escapeHtml(c.era) + '</span>'
        +     '<span>🎯 ' + c.methods.length + ' methods</span>'
        +   '</div>'
        + '</button>';
    }

    /* ---------- Render grid ---------- */
    function render(){
      state.filtered = getFiltered();
      var n = state.filtered.length;
      var total = DATA.length;
      var hasFilter = state.search || state.category !== 'all'
                     || state.region !== 'all' || state.era !== 'all';

      countEl.textContent = hasFilter
        ? 'Showing ' + n + ' of ' + total + ' cases'
        : 'Showing all ' + total + ' cases';

      if (!n){
        grid.innerHTML = '';
        empty.hidden = false;
        return;
      }
      empty.hidden = true;
      grid.innerHTML = state.filtered.map(cardHTML).join('');
    }

    /* ---------- Modal ---------- */
    function openCase(id){
      var c = DATA.find(function(x){ return x.id === id; });
      if (!c) return;

      var idx = state.filtered.findIndex(function(x){ return x.id === id; });
      state.currentIndex = idx === -1 ? 0 : idx;

      renderModal(c);
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      try { history.replaceState({}, '', '#' + c.id); } catch(_){}
      setTimeout(function(){ modalClose && modalClose.focus(); }, 60);
    }

    function renderModal(c){
      var color = CAT_COLOR[c.category] || '#1E3A8A';
      modalEmoji.textContent = c.emoji;
      modalTag.textContent = c.category + ' · ' + c.region + ' · ' + c.era;
      modalTag.style.color = color;
      modalTitle.textContent = c.company;

      modalMeta.innerHTML = ''
        + '<span>🎯 ' + c.units.length + ' units</span>'
        + '<span>🛠 ' + c.methods.length + ' methods</span>'
        + '<span>📖 ' + c.lessons.length + ' lessons</span>';

      /* Body */
      var body = '';
      body += '<h3>The problem</h3>';
      body += '<p>' + escapeHtml(c.problem) + '</p>';

      body += '<h3>The approach</h3>';
      body += '<ul>' + c.approach.map(function(a){
        return '<li>' + escapeHtml(a) + '</li>';
      }).join('') + '</ul>';

      body += '<h3>The outcome</h3>';
      body += '<ul>' + c.outcome.map(function(o){
        return '<li>' + escapeHtml(o) + '</li>';
      }).join('') + '</ul>';

      body += '<h3>Key lessons</h3>';
      body += '<ol>' + c.lessons.map(function(l){
        return '<li>' + escapeHtml(l) + '</li>';
      }).join('') + '</ol>';

      /* Related methods → deep-link to Toolbox */
      body += '<h3>Methods used</h3>';
      body += '<div class="case-modal-methods">';
      body += c.methods.map(function(m){
        var label = methodLabel(m);
        var url = 'toolbox.html#m=' + encodeURIComponent(m);
        return '<a class="case-modal-method" href="' + url + '">🛠 ' + escapeHtml(label) + '</a>';
      }).join('');
      body += '</div>';

      /* Related units → deep-link to unit pages */
      body += '<h3>Related units</h3>';
      body += '<div class="case-modal-methods">';
      body += c.units.map(function(u){
        return '<a class="case-modal-method" href="unit' + u + '.html">📘 Unit ' + u + '</a>';
      }).join('');
      body += '</div>';

      modalBody.innerHTML = body;

      modalPrev.disabled = state.currentIndex <= 0;
      modalNext.disabled = state.currentIndex >= state.filtered.length - 1;
    }

    function closeCase(){
      modal.hidden = true;
      document.body.style.overflow = '';
      state.currentIndex = -1;
      try { history.replaceState({}, '', location.pathname); } catch(_){}
    }

    function showCaseAt(idx){
      if (idx < 0 || idx >= state.filtered.length) return;
      state.currentIndex = idx;
      renderModal(state.filtered[idx]);
      try { history.replaceState({}, '', '#' + state.filtered[idx].id); } catch(_){}
    }

    /* ---------- Share ---------- */
    function shareCurrent(){
      var c = state.filtered[state.currentIndex];
      if (!c) return;
      var url = location.origin + location.pathname + '#' + c.id;
      var text = c.emoji + ' ' + c.company + ' — a case study from DTI Notes';

      if (navigator.share){
        navigator.share({ title: c.company, text: text, url: url })
          .catch(function(){ /* user cancelled */ });
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(function(){
          toast('Link copied to clipboard');
        }).catch(function(){
          fallbackCopy(url);
          toast('Link copied');
        });
        return;
      }
      fallbackCopy(url);
      toast('Link copied');
    }

    function fallbackCopy(text){
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch(_){}
      document.body.removeChild(ta);
    }

    /* ---------- Toast ---------- */
    function toast(msg){
      var t = document.getElementById('casesToast');
      if (!t){
        t = document.createElement('div');
        t.id = 'casesToast';
        t.className = 'cases-toast';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._timer);
      t._timer = setTimeout(function(){ t.classList.remove('show'); }, 1800);
    }

    /* ---------- Print ---------- */
    function printCurrentCase(){
      var c = state.filtered[state.currentIndex];
      if (!c) return;
      document.body.classList.add('print-single-case');
      setTimeout(function(){
        window.print();
        setTimeout(function(){ document.body.classList.remove('print-single-case'); }, 400);
      }, 80);
    }

    /* ---------- Events ---------- */
    function bindEvents(){
      var searchTimer = null;
      searchEl.addEventListener('input', function(){
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function(){
          state.search = searchEl.value;
          render();
        }, 180);
      });

      resetBtn.addEventListener('click', function(){
        state.search = '';
        state.category = 'all';
        state.region = 'all';
        state.era = 'all';
        searchEl.value = '';
        [catChips, regionChips, eraChips].forEach(function(row){
          row.querySelectorAll('.cases-chip').forEach(function(c){
            c.classList.toggle('active', c.dataset.val === 'all');
          });
        });
        render();
      });

      grid.addEventListener('click', function(e){
        var card = e.target.closest('.case-card');
        if (!card) return;
        openCase(card.dataset.id);
      });

      modalClose.addEventListener('click', closeCase);
      modal.addEventListener('click', function(e){
        if (e.target === modal) closeCase();
      });
      modalPrev.addEventListener('click', function(){ showCaseAt(state.currentIndex - 1); });
      modalNext.addEventListener('click', function(){ showCaseAt(state.currentIndex + 1); });
      if (modalShare) modalShare.addEventListener('click', shareCurrent);
      if (modalPrint) modalPrint.addEventListener('click', printCurrentCase);

      document.addEventListener('keydown', function(e){
        if (modal.hidden) return;
        if (e.key === 'Escape'){ closeCase(); return; }
        if (e.key === 'ArrowLeft'){ showCaseAt(state.currentIndex - 1); }
        if (e.key === 'ArrowRight'){ showCaseAt(state.currentIndex + 1); }
        if ((e.key === 'p' || e.key === 'P') && !e.metaKey && !e.ctrlKey){
          e.preventDefault();
          printCurrentCase();
        }
      });
    }

    /* ---------- Deep link ---------- */
    function resetFilters(){
      state.search = '';
      state.category = 'all';
      state.region = 'all';
      state.era = 'all';
      searchEl.value = '';
      [catChips, regionChips, eraChips].forEach(function(row){
        row.querySelectorAll('.cases-chip').forEach(function(c){
          c.classList.toggle('active', c.dataset.val === 'all');
        });
      });
      render();
    }

    function applyHash(){
      var m = location.hash.match(/^#([a-z0-9\-]+)$/i);
      if (!m) return;
      var c = DATA.find(function(x){ return x.id === m[1]; });
      if (!c) return;
      if (!state.filtered.some(function(x){ return x.id === c.id; })){
        resetFilters();
      }
      openCase(c.id);
    }

    /* ---------- Init ---------- */
    buildChips();
    bindChipRow(catChips, 'category');
    bindChipRow(regionChips, 'region');
    bindChipRow(eraChips, 'era');
    bindEvents();
    render();
    applyHash();

    console.log('[cases] ready — total:', DATA.length, '| categories:', CATS.length);
  });
})();