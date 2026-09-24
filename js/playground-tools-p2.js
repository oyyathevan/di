/* =========================================================
   PLAYGROUND — Phase 2 tools
   Affinity Map · Stakeholder Grid · 5 Whys Chain
   Registers into window.PG_REGISTRY
   ========================================================= */
(function(){
  'use strict';

  window.PG_REGISTRY = window.PG_REGISTRY || {};

  var LS_KEY = 'dti-pg-';

  function uid(){
    return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }
  function loadData(toolId, fallback){
    try {
      var raw = localStorage.getItem(LS_KEY + toolId);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallback));
    } catch(e){ return JSON.parse(JSON.stringify(fallback)); }
  }
  function saveData(toolId, data){
    try {
      localStorage.setItem(LS_KEY + toolId, JSON.stringify(data));
      var el = document.querySelector('[data-save-status="' + toolId + '"]');
      if (el){
        el.classList.remove('saving');
        el.textContent = '✓ Saved';
        clearTimeout(el._t);
        el._t = setTimeout(function(){ el.textContent = ''; }, 1600);
      }
    } catch(e){ console.warn('[p2] save failed', e); }
  }
  function debouncedSave(toolId, data){
    var el = document.querySelector('[data-save-status="' + toolId + '"]');
    if (el){
      el.classList.add('saving');
      el.textContent = '● Saving…';
    }
    clearTimeout(window['__p2timer_' + toolId]);
    window['__p2timer_' + toolId] = setTimeout(function(){
      saveData(toolId, data);
    }, 400);
  }

  /* =========================================================
     TOOL 1 — AFFINITY MAP
     ========================================================= */
  var AFFINITY_DEFAULT = {
    themes: [ { id:'t1', name:'Theme 1' } ],
    notes: []
  };

  window.PG_REGISTRY['affinity'] = {
    getData: function(){ return loadData('affinity', AFFINITY_DEFAULT); },
    setData: function(d){ saveData('affinity', d); },
    reset: function(){ localStorage.removeItem(LS_KEY + 'affinity'); },
    render: function(container){
      var data = loadData('affinity', AFFINITY_DEFAULT);

      var themesHTML = data.themes.map(function(t){
        var notesHTML = data.notes
          .filter(function(n){ return n.themeId === t.id; })
          .map(function(n){ return affinityNoteHTML(n); })
          .join('');

        return ''
          + '<div class="pg-affinity-theme" data-theme-id="' + esc(t.id) + '">'
          +   '<div class="pg-affinity-theme-head">'
          +     '<input type="text" data-theme="name" value="' + esc(t.name) + '" placeholder="Theme name">'
          +     '<button type="button" class="pg-affinity-theme-del" data-del-theme="' + esc(t.id) + '" aria-label="Delete theme">✕</button>'
          +   '</div>'
          +   '<div class="pg-affinity-notes" data-notes="' + esc(t.id) + '">'
          +     notesHTML
          +   '</div>'
          +   '<button type="button" class="pg-add-note" data-add-note-theme="' + esc(t.id) + '">+ Add note here</button>'
          + '</div>';
      }).join('');

      var ungrouped = data.notes.filter(function(n){ return !n.themeId || !data.themes.some(function(t){ return t.id === n.themeId; }); });
      var ungroupedHTML = ungrouped.map(function(n){ return affinityNoteHTML(n); }).join('');

      container.innerHTML = ''
        + '<div class="pg-affinity">'
        +   '<button type="button" class="pg-journey-add" data-add-theme>+ Add theme</button>'
        +   '<div class="pg-affinity-ungrouped" data-ungrouped>'
        +     '<div class="pg-affinity-section-title">Ungrouped notes · click to assign a theme</div>'
        +     '<div class="pg-affinity-notes" data-notes="ungrouped">' + ungroupedHTML + '</div>'
        +     '<button type="button" class="pg-add-note" data-add-note-ungrouped>+ Add ungrouped note</button>'
        +   '</div>'
        +   '<div>'
        +     '<div class="pg-affinity-section-title">Themes</div>'
        +     '<div class="pg-affinity-themes">' + themesHTML + '</div>'
        +   '</div>'
        + '</div>';
    },
    bind: function(container){
      container.addEventListener('input', function(e){
        var data = loadData('affinity', AFFINITY_DEFAULT);

        /* Theme name */
        if (e.target.dataset.theme === 'name'){
          var themeEl = e.target.closest('.pg-affinity-theme');
          var tid = themeEl.dataset.themeId;
          var t = data.themes.find(function(x){ return x.id === tid; });
          if (t){
            t.name = e.target.value;
            debouncedSave('affinity', data);
          }
          return;
        }

        /* Note text */
        var noteId = e.target.dataset.noteText;
        if (noteId){
          var note = data.notes.find(function(n){ return n.id === noteId; });
          if (note){
            note.text = e.target.innerText || '';
            debouncedSave('affinity', data);
          }
        }
      });

      container.addEventListener('change', function(e){
        var sel = e.target.closest('[data-note-theme]');
        if (!sel) return;
        var data = loadData('affinity', AFFINITY_DEFAULT);
        var note = data.notes.find(function(n){ return n.id === sel.dataset.noteTheme; });
        if (note){
          note.themeId = sel.value || null;
          debouncedSave('affinity', data);
          window.PG_REGISTRY['affinity'].render(container);
        }
      });

      container.addEventListener('click', function(e){
        /* Add theme */
        if (e.target.closest('[data-add-theme]')){
          var data = loadData('affinity', AFFINITY_DEFAULT);
          data.themes.push({ id: uid(), name: 'Theme ' + (data.themes.length + 1) });
          debouncedSave('affinity', data);
          window.PG_REGISTRY['affinity'].render(container);
          return;
        }

        /* Delete theme */
        var delTheme = e.target.closest('[data-del-theme]');
        if (delTheme){
          var data2 = loadData('affinity', AFFINITY_DEFAULT);
          var tid = delTheme.dataset.delTheme;
          data2.themes = data2.themes.filter(function(t){ return t.id !== tid; });
          data2.notes.forEach(function(n){ if (n.themeId === tid) n.themeId = null; });
          debouncedSave('affinity', data2);
          window.PG_REGISTRY['affinity'].render(container);
          return;
        }

        /* Add note to a specific theme */
        var addThemed = e.target.closest('[data-add-note-theme]');
        if (addThemed){
          var data3 = loadData('affinity', AFFINITY_DEFAULT);
          var tid2 = addThemed.dataset.addNoteTheme;
          var newNote = { id: uid(), text: '', themeId: tid2 };
          data3.notes.push(newNote);
          debouncedSave('affinity', data3);
          var notesEl = container.querySelector('[data-notes="' + tid2 + '"]');
          if (notesEl){
            notesEl.insertAdjacentHTML('beforeend', affinityNoteHTML(newNote));
            var t = notesEl.querySelector('[data-note-id="' + newNote.id + '"] .pg-note-text');
            if (t) t.focus();
          }
          return;
        }

        /* Add ungrouped note */
        if (e.target.closest('[data-add-note-ungrouped]')){
          var data4 = loadData('affinity', AFFINITY_DEFAULT);
          var newNote4 = { id: uid(), text: '', themeId: null };
          data4.notes.push(newNote4);
          debouncedSave('affinity', data4);
          window.PG_REGISTRY['affinity'].render(container);
          var u = container.querySelector('[data-notes="ungrouped"] [data-note-id="' + newNote4.id + '"] .pg-note-text');
          if (u) u.focus();
          return;
        }

        /* Delete note */
        var delNote = e.target.closest('[data-del-note]');
        if (delNote){
          var data5 = loadData('affinity', AFFINITY_DEFAULT);
          var nid = delNote.dataset.delNote;
          data5.notes = data5.notes.filter(function(n){ return n.id !== nid; });
          debouncedSave('affinity', data5);
          var noteEl = delNote.closest('.pg-note');
          if (noteEl) noteEl.remove();
        }
      });
    }
  };

  function affinityNoteHTML(note){
    /* Show theme picker only on ungrouped notes */
    var themes = loadData('affinity', AFFINITY_DEFAULT).themes || [];
    var picker = '';
    if (!note.themeId){
      picker = ''
        + '<select data-note-theme="' + esc(note.id) + '" style="font-size:.7rem;padding:2px 6px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;margin-top:4px">'
        +   '<option value="">— assign to —</option>'
        +   themes.map(function(t){
              return '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>';
            }).join('')
        + '</select>';
    }
    return ''
      + '<div class="pg-note" data-note-id="' + esc(note.id) + '">'
      +   '<div style="flex:1;min-width:0">'
      +     '<div class="pg-note-text" contenteditable="true" data-note-text="' + esc(note.id) + '">' + esc(note.text) + '</div>'
      +     picker
      +   '</div>'
      +   '<button type="button" class="pg-note-del" data-del-note="' + esc(note.id) + '" aria-label="Delete">✕</button>'
      + '</div>';
  }

  /* =========================================================
     TOOL 2 — STAKEHOLDER GRID
     ========================================================= */
  var SH_DEFAULT = {
    keepSatisfied: [],
    manageClosely: [],
    monitor: [],
    keepInformed: []
  };

  window.PG_REGISTRY['stakeholder'] = {
    getData: function(){ return loadData('stakeholder', SH_DEFAULT); },
    setData: function(d){ saveData('stakeholder', d); },
    reset: function(){ localStorage.removeItem(LS_KEY + 'stakeholder'); },
    render: function(container){
      var data = loadData('stakeholder', SH_DEFAULT);

      var quads = [
        { key:'keepSatisfied', label:'Keep Satisfied', emoji:'👥', dataKey:'keepSatisfied' },
        { key:'manageClosely', label:'Manage Closely', emoji:'⭐', dataKey:'manageClosely' },
        { key:'monitor',       label:'Monitor',        emoji:'👀', dataKey:'monitor' },
        { key:'keepInformed',  label:'Keep Informed',  emoji:'📢', dataKey:'keepInformed' }
      ];

      var quadHTML = quads.map(function(q){
        var itemsHTML = (data[q.dataKey] || []).map(function(s){
          return shItemHTML(s);
        }).join('');

        return ''
          + '<div class="pg-sh-quad" data-q="' + q.key + '" data-quad-key="' + q.dataKey + '">'
          +   '<div class="pg-sh-quad-head">'
          +     '<span class="q-emoji">' + q.emoji + '</span>'
          +     '<span>' + q.label + '</span>'
          +   '</div>'
          +   '<div class="pg-sh-items" data-items="' + q.dataKey + '">' + itemsHTML + '</div>'
          +   '<button type="button" class="pg-add-note" data-add-sh="' + q.dataKey + '">+ Add stakeholder</button>'
          + '</div>';
      }).join('');

      container.innerHTML = ''
        + '<p class="pg-sh-info">Place each stakeholder in the right quadrant — by how much <strong>influence</strong> they have (up/down) and how much <strong>interest</strong> they have (left/right).</p>'
        + '<div class="pg-sh-grid">'
        +   '<div class="pg-sh-axis-y">↑ Influence</div>'
        +   '<div class="pg-sh-axis-x">Interest →</div>'
        +   quadHTML
        + '</div>';
    },
    bind: function(container){
      container.addEventListener('input', function(e){
        var noteId = e.target.dataset.shText;
        if (!noteId) return;
        var data = loadData('stakeholder', SH_DEFAULT);
        for (var k in data){
          var s = data[k].find(function(x){ return x.id === noteId; });
          if (s){
            s.text = e.target.innerText || '';
            debouncedSave('stakeholder', data);
            return;
          }
        }
      });

      container.addEventListener('click', function(e){
        var addBtn = e.target.closest('[data-add-sh]');
        if (addBtn){
          var data = loadData('stakeholder', SH_DEFAULT);
          var key = addBtn.dataset.addSh;
          var item = { id: uid(), text: '' };
          if (!data[key]) data[key] = [];
          data[key].push(item);
          debouncedSave('stakeholder', data);
          var itemsEl = container.querySelector('[data-items="' + key + '"]');
          if (itemsEl){
            itemsEl.insertAdjacentHTML('beforeend', shItemHTML(item));
            var t = itemsEl.querySelector('[data-sh-id="' + item.id + '"] .pg-sh-item-text');
            if (t) t.focus();
          }
          return;
        }

        var delBtn = e.target.closest('[data-del-sh]');
        if (delBtn){
          var id = delBtn.dataset.delSh;
          var data2 = loadData('stakeholder', SH_DEFAULT);
          for (var k2 in data2){
            data2[k2] = data2[k2].filter(function(x){ return x.id !== id; });
          }
          debouncedSave('stakeholder', data2);
          var itemEl = delBtn.closest('.pg-sh-item');
          if (itemEl) itemEl.remove();
        }
      });
    }
  };

  function shItemHTML(s){
    return ''
      + '<div class="pg-sh-item" data-sh-id="' + esc(s.id) + '">'
      +   '<div class="pg-sh-item-text" contenteditable="true" data-sh-text="' + esc(s.id) + '">' + esc(s.text) + '</div>'
      +   '<button type="button" class="pg-sh-item-del" data-del-sh="' + esc(s.id) + '" aria-label="Delete">✕</button>'
      + '</div>';
  }

  /* =========================================================
     TOOL 3 — 5 WHYS CHAIN
     ========================================================= */
  var WHYS_DEFAULT = {
    problem: '',
    answers: ['', '', '', '', ''],
    countermeasure: ''
  };

  window.PG_REGISTRY['5whys'] = {
    getData: function(){ return loadData('5whys', WHYS_DEFAULT); },
    setData: function(d){ saveData('5whys', d); },
    reset: function(){ localStorage.removeItem(LS_KEY + '5whys'); },
    render: function(container){
      var data = loadData('5whys', WHYS_DEFAULT);

      var chainHTML = data.answers.map(function(a, i){
        var isRoot = i === data.answers.length - 1;
        return ''
          + '<div class="pg-5whys-step' + (isRoot ? ' root' : '') + '">'
          +   '<div class="pg-5whys-num">' + (isRoot ? '🎯' : (i + 1)) + '</div>'
          +   '<div class="pg-5whys-box">'
          +     '<div class="pg-5whys-label">' +
                (isRoot ? 'Root cause' : ('Why #' + (i + 1))) +
              '</div>'
          +     '<textarea data-why="' + i + '" placeholder="' +
                (isRoot ? 'The deepest cause — fix this and the problem cannot recur.' : 'Why does the previous answer happen?') +
              '">' + esc(a) + '</textarea>'
          +   '</div>'
          + '</div>';
      }).join('');

      container.innerHTML = ''
        + '<div class="pg-5whys">'
        +   '<div class="pg-5whys-problem">'
        +     '<label>🔴 The visible problem</label>'
        +     '<textarea data-5whys="problem" placeholder="e.g., Customer orders arrive late.">' + esc(data.problem) + '</textarea>'
        +   '</div>'
        +   '<div class="pg-5whys-chain">' + chainHTML + '</div>'
        +   '<div class="pg-5whys-counter">'
        +     '<label>💡 Proposed countermeasure</label>'
        +     '<textarea data-5whys="countermeasure" placeholder="What would you change to fix the root cause?">' + esc(data.countermeasure) + '</textarea>'
        +   '</div>'
        + '</div>';
    },
    bind: function(container){
      container.addEventListener('input', function(e){
        var data = loadData('5whys', WHYS_DEFAULT);

        if (e.target.dataset['5whys']){
          var k = e.target.dataset['5whys'];
          data[k] = e.target.value;
          debouncedSave('5whys', data);
          return;
        }

        if (e.target.dataset.why !== undefined){
          var i = parseInt(e.target.dataset.why, 10);
          data.answers[i] = e.target.value;
          debouncedSave('5whys', data);
        }
      });
    }
  };

  console.log('[playground-tools-p2] registered 3 tools');
})();