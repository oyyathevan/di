/* =========================================================
   PLAYGROUND — core engine + 3 tools
   Empathy Map · Persona Builder · Journey Mapper
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function(){
    var TOOLS = window.PG_TOOLS || [];
    var tabsEl = document.getElementById('pgTabs');
    var panelsEl = document.getElementById('pgPanels');
    if (!tabsEl || !panelsEl) return;

    var LS_KEY = 'dti-pg-';
    var saveTimer = null;

    /* =========================================================
       UTILITIES
       ========================================================= */
    function $(sel, root){ return (root || document).querySelector(sel); }
    function $$(sel, root){ return Array.from((root || document).querySelectorAll(sel)); }

    function esc(s){
      return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
      });
    }

    function uid(){
      return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    function load(toolId){
      try {
        var raw = localStorage.getItem(LS_KEY + toolId);
        return raw ? JSON.parse(raw) : null;
      } catch(e){ return null; }
    }

    function save(toolId, data){
      try {
        localStorage.setItem(LS_KEY + toolId, JSON.stringify(data));
        flashSaveStatus(toolId, 'saved');
      } catch(e){
        console.warn('[playground] save failed', e);
      }
    }

    function debouncedSave(toolId, data){
      flashSaveStatus(toolId, 'saving');
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function(){
        save(toolId, data);
      }, 400);
    }

    function flashSaveStatus(toolId, state){
      var el = document.querySelector('[data-save-status="' + toolId + '"]');
      if (!el) return;
      el.classList.toggle('saving', state === 'saving');
      el.textContent = state === 'saving' ? '● Saving…' : '✓ Saved';
      if (state === 'saved'){
        setTimeout(function(){
          el.textContent = '';
          el.classList.remove('saving');
        }, 1600);
      }
    }

    function toast(msg){
      var t = document.getElementById('pgToast');
      if (!t){
        t = document.createElement('div');
        t.id = 'pgToast';
        t.className = 'pg-toast';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._t);
      t._t = setTimeout(function(){ t.classList.remove('show'); }, 1800);
    }

    /* =========================================================
       TOOLBAR
       ========================================================= */
    function toolbarHTML(tool){
      return ''
        + '<div class="pg-toolbar">'
        +   '<span class="pg-toolbar-title">' + tool.emoji + ' ' + esc(tool.name) + '</span>'
        +   '<span class="pg-save-status" data-save-status="' + tool.id + '"></span>'
        +   '<button type="button" data-action="reset" class="danger">↺ Reset</button>'
        +   '<button type="button" data-action="print">🖨 Print</button>'
        +   '<button type="button" data-action="export">💾 Download JSON</button>'
        +   '<button type="button" data-action="import">📂 Load JSON</button>'
        +   '<input type="file" accept="application/json" hidden data-import-input="' + tool.id + '">'
        + '</div>'
        + '<div class="pg-canvas" data-canvas="' + tool.id + '"></div>';
    }

    function wireToolbar(toolId, getData, setData, resetData){
      var panel = document.querySelector('.pg-panel[data-tool="' + toolId + '"]');
      if (!panel) return;

      panel.addEventListener('click', function(e){
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.dataset.action;

        if (action === 'reset'){
          if (!confirm('Clear all data in this tool?')) return;
          resetData();
          renderTool(toolId);
        } else if (action === 'print'){
          document.body.classList.add('pg-printing');
          window.print();
          setTimeout(function(){ document.body.classList.remove('pg-printing'); }, 400);
        } else if (action === 'export'){
          var data = getData();
          var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'dt-' + toolId + '-' + new Date().toISOString().slice(0,10) + '.json';
          document.body.appendChild(a); a.click();
          setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 400);
          toast('Downloaded ' + a.download);
        } else if (action === 'import'){
          var input = panel.querySelector('[data-import-input]');
          if (input) input.click();
        }
      });

      var fileInput = panel.querySelector('[data-import-input]');
      if (fileInput){
        fileInput.addEventListener('change', function(){
          var f = fileInput.files && fileInput.files[0];
          if (!f) return;
          var reader = new FileReader();
          reader.onload = function(ev){
            try {
              var data = JSON.parse(ev.target.result);
              setData(data);
              renderTool(toolId);
              toast('Loaded ' + f.name);
            } catch(err){
              alert('Could not parse JSON file.');
            }
          };
          reader.readAsText(f);
          fileInput.value = '';
        });
      }
    }

    /* =========================================================
       EMPATHY MAP
       ========================================================= */
    var EMPATHY_DEFAULT = {
      user: '',
      says: [],
      thinks: [],
      does: [],
      feels: []
    };

    function empathyData(){
      return load('empathy-map') || JSON.parse(JSON.stringify(EMPATHY_DEFAULT));
    }
    function empathyReset(){
      localStorage.removeItem(LS_KEY + 'empathy-map');
    }

    function empathyRender(container){
      var data = empathyData();

      var quadrants = [
        { key:'says',   emoji:'💬', label:'Says'   },
        { key:'thinks', emoji:'🧠', label:'Thinks' },
        { key:'does',   emoji:'🏃', label:'Does'   },
        { key:'feels',  emoji:'❤️', label:'Feels'  }
      ];

      var html = ''
        + '<div class="pg-empathy-user">'
        +   '<label>Whose empathy map is this?</label>'
        +   '<input type="text" data-empathy="user" value="' + esc(data.user) + '" placeholder="e.g., Arjun, 20, second-year engineering student">'
        + '</div>'
        + '<div class="pg-empathy-grid">';

      quadrants.forEach(function(q){
        html += ''
          + '<div class="pg-quadrant" data-q="' + q.key + '">'
          +   '<div class="pg-quadrant-head">'
          +     '<span class="q-emoji">' + q.emoji + '</span>'
          +     '<span>' + q.label + '</span>'
          +   '</div>'
          +   '<div class="pg-notes" data-notes="' + q.key + '">';

        data[q.key].forEach(function(note){
          html += noteHTML(note, q.key);
        });

        html += ''
          +   '</div>'
          +   '<button type="button" class="pg-add-note" data-add-note="' + q.key + '">+ Add note</button>'
          + '</div>';
      });

      html += '</div>';
      container.innerHTML = html;
    }

    function noteHTML(note, qKey){
      return ''
        + '<div class="pg-note" data-note-id="' + esc(note.id) + '" data-q="' + esc(qKey) + '">'
        +   '<div class="pg-note-text" contenteditable="true" data-note-text="' + esc(note.id) + '">' + esc(note.text) + '</div>'
        +   '<button type="button" class="pg-note-del" data-del-note="' + esc(note.id) + '" aria-label="Delete note">✕</button>'
        + '</div>';
    }

    function empathyBind(container){
      container.addEventListener('input', function(e){
        var data = empathyData();

        if (e.target.matches('[data-empathy="user"]')){
          data.user = e.target.value;
          debouncedSave('empathy-map', data);
          return;
        }

        var noteId = e.target.dataset.noteText;
        if (noteId){
          var q = e.target.closest('.pg-note').dataset.q;
          var note = data[q].find(function(n){ return n.id === noteId; });
          if (note){
            note.text = e.target.innerText || '';
            debouncedSave('empathy-map', data);
          }
        }
      });

      container.addEventListener('click', function(e){
        var addBtn = e.target.closest('[data-add-note]');
        if (addBtn){
          var data = empathyData();
          var q = addBtn.dataset.addNote;
          var note = { id: uid(), text: '' };
          data[q].push(note);
          var notesEl = container.querySelector('[data-notes="' + q + '"]');
          if (notesEl){
            notesEl.insertAdjacentHTML('beforeend', noteHTML(note, q));
            var newText = notesEl.querySelector('[data-note-id="' + note.id + '"] .pg-note-text');
            if (newText) newText.focus();
          }
          debouncedSave('empathy-map', data);
          return;
        }

        var delBtn = e.target.closest('[data-del-note]');
        if (delBtn){
          var noteId = delBtn.dataset.delNote;
          var noteEl = delBtn.closest('.pg-note');
          var q = noteEl.dataset.q;
          var data = empathyData();
          data[q] = data[q].filter(function(n){ return n.id !== noteId; });
          noteEl.remove();
          debouncedSave('empathy-map', data);
        }
      });
    }

    /* =========================================================
       PERSONA BUILDER
       ========================================================= */
    var PERSONA_DEFAULT = {
      name:'', age:'', role:'', location:'',
      goal:'', frustration:'', quote:'', bio:''
    };

    function personaData(){
      return load('persona') || Object.assign({}, PERSONA_DEFAULT);
    }
    function personaReset(){
      localStorage.removeItem(LS_KEY + 'persona');
    }

    function personaRender(container){
      var d = personaData();
      var initial = (d.name && d.name.charAt(0).toUpperCase()) || '?';

      container.innerHTML = ''
        + '<div class="pg-persona-layout">'
        +   '<div class="pg-persona-form">'
        +     '<label>Name</label>'
        +     '<input type="text" data-persona="name" value="' + esc(d.name) + '" placeholder="e.g., Arjun">'
        +     '<label>Age</label>'
        +     '<input type="text" data-persona="age" value="' + esc(d.age) + '" placeholder="e.g., 20">'
        +     '<label>Role / Occupation</label>'
        +     '<input type="text" data-persona="role" value="' + esc(d.role) + '" placeholder="e.g., Second-year engineering student">'
        +     '<label>Location</label>'
        +     '<input type="text" data-persona="location" value="' + esc(d.location) + '" placeholder="e.g., Chennai">'
        +     '<label>Goal</label>'
        +     '<textarea data-persona="goal" placeholder="What are they trying to achieve?">' + esc(d.goal) + '</textarea>'
        +     '<label>Top frustration</label>'
        +     '<textarea data-persona="frustration" placeholder="What is their biggest pain point?">' + esc(d.frustration) + '</textarea>'
        +     '<label>Signature quote</label>'
        +     '<input type="text" data-persona="quote" value="' + esc(d.quote) + '" placeholder="e.g., I never have enough time.">'
        +     '<label>One-line day-in-the-life</label>'
        +     '<textarea data-persona="bio" placeholder="e.g., Rushes between classes, eats lunch at his desk.">' + esc(d.bio) + '</textarea>'
        +   '</div>'
        +   '<div class="pg-persona-preview">'
        +     '<div class="pg-persona-card">'
        +       '<div class="pg-persona-avatar" data-pv="avatar">' + esc(initial) + '</div>'
        +       '<h3 class="pg-persona-name" data-pv="name">' + (esc(d.name) || 'Unnamed persona') + '</h3>'
        +       '<div class="pg-persona-role" data-pv="role">' + (esc(d.role) || '—') + '</div>'
        +     '</div>'
        +     '<div class="pg-persona-quote" data-pv="quote">' + (esc(d.quote) || '"…"') + '</div>'
        +     '<div class="pg-persona-row">'
        +       '<b>Goal</b>'
        +       '<span data-pv="goal">' + esc(d.goal) + '</span>'
        +     '</div>'
        +     '<div class="pg-persona-row">'
        +       '<b>Top frustration</b>'
        +       '<span data-pv="frustration">' + esc(d.frustration) + '</span>'
        +     '</div>'
        +     '<div class="pg-persona-row">'
        +       '<b>Day in the life</b>'
        +       '<span data-pv="bio">' + esc(d.bio) + '</span>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }

    function personaBind(container){
      container.addEventListener('input', function(e){
        var key = e.target.dataset.persona;
        if (!key) return;
        var data = personaData();
        data[key] = e.target.value;
        debouncedSave('persona', data);

        var pv = container.querySelector('[data-pv="' + key + '"]');
        if (pv){
          var fallback = '';
          if (key === 'name') fallback = 'Unnamed persona';
          else if (key === 'quote') fallback = '"…"';
          else if (key === 'role') fallback = '—';
          pv.textContent = e.target.value || fallback;

          if (key === 'name'){
            var av = container.querySelector('[data-pv="avatar"]');
            if (av) av.textContent = (e.target.value && e.target.value.charAt(0).toUpperCase()) || '?';
          }
        }
      });
    }

    /* =========================================================
       JOURNEY MAPPER
       ========================================================= */
    var JOURNEY_DEFAULT = { stages: [] };

    var FEELINGS = [
      { id:'happy',  emoji:'😊' },
      { id:'neutral',emoji:'😐' },
      { id:'sad',    emoji:'😖' },
      { id:'angry',  emoji:'😡' },
      { id:'love',   emoji:'🤩' }
    ];

    function journeyData(){
      return load('journey') || JSON.parse(JSON.stringify(JOURNEY_DEFAULT));
    }
    function journeyReset(){
      localStorage.removeItem(LS_KEY + 'journey');
    }

    function journeyRender(container){
      var data = journeyData();

      var html = '<div class="pg-journey-stages" data-journey-stages>';

      data.stages.forEach(function(s, i){
        html += journeyStageHTML(s, i);
      });

      html += '</div>'
        + '<button type="button" class="pg-journey-add" data-add-stage>+ Add stage</button>';

      container.innerHTML = html;
    }

    function journeyStageHTML(s, i){
      var feelingsHTML = FEELINGS.map(function(f){
        return '<button type="button" data-feel="' + f.id + '" class="' +
          (s.feeling === f.id ? 'active' : '') + '">' + f.emoji + '</button>';
      }).join('');

      return ''
        + '<div class="pg-journey-stage" data-stage-id="' + esc(s.id) + '">'
        +   '<div class="pg-journey-stage-num">'
        +     '<span>Stage ' + (i + 1) + '</span>'
        +     '<button type="button" class="pg-journey-stage-del" data-del-stage="' + esc(s.id) + '" aria-label="Delete">✕</button>'
        +   '</div>'
        +   '<input type="text" data-stage="name" placeholder="Stage name" value="' + esc(s.name) + '">'
        +   '<textarea data-stage="action" placeholder="What does the user do?">' + esc(s.action) + '</textarea>'
        +   '<div class="pg-journey-feeling">' + feelingsHTML + '</div>'
        + '</div>';
    }

    function journeyBind(container){
      container.addEventListener('input', function(e){
        var key = e.target.dataset.stage;
        if (!key) return;
        var stageEl = e.target.closest('.pg-journey-stage');
        if (!stageEl) return;
        var id = stageEl.dataset.stageId;
        var data = journeyData();
        var s = data.stages.find(function(x){ return x.id === id; });
        if (s){
          s[key] = e.target.value;
          debouncedSave('journey', data);
        }
      });

      container.addEventListener('click', function(e){
        /* Feelings */
        var f = e.target.closest('[data-feel]');
        if (f){
          var stageEl = f.closest('.pg-journey-stage');
          var id = stageEl.dataset.stageId;
          var data = journeyData();
          var s = data.stages.find(function(x){ return x.id === id; });
          if (s){
            s.feeling = f.dataset.feel;
            $$('[data-feel]', stageEl).forEach(function(b){
              b.classList.toggle('active', b === f);
            });
            debouncedSave('journey', data);
          }
          return;
        }

        /* Add stage */
        if (e.target.closest('[data-add-stage]')){
          var data2 = journeyData();
          data2.stages.push({
            id: uid(),
            name: '', action: '', feeling: ''
          });
          debouncedSave('journey', data2);
          journeyRender(container);
          var lastStage = container.querySelector('.pg-journey-stage:last-child');
          if (lastStage){
            var inp = lastStage.querySelector('[data-stage="name"]');
            if (inp) inp.focus();
          }
          return;
        }

        /* Delete stage */
        var delBtn = e.target.closest('[data-del-stage]');
        if (delBtn){
          var stageEl2 = delBtn.closest('.pg-journey-stage');
          var id2 = stageEl2.dataset.stageId;
          var data3 = journeyData();
          data3.stages = data3.stages.filter(function(x){ return x.id !== id2; });
          debouncedSave('journey', data3);
          journeyRender(container);
        }
      });
    }

    /* =========================================================
       RENDER DISPATCHER
       ========================================================= */
    function renderTool(toolId){
      var canvas = document.querySelector('[data-canvas="' + toolId + '"]');
      if (!canvas) return;

      /* Plugin registry — new tools can self-register */
      if (window.PG_REGISTRY && window.PG_REGISTRY[toolId] && window.PG_REGISTRY[toolId].render){
        window.PG_REGISTRY[toolId].render(canvas);
        return;
      }

      if (toolId === 'empathy-map') empathyRender(canvas);
      else if (toolId === 'persona') personaRender(canvas);
      else if (toolId === 'journey') journeyRender(canvas);
    }

        function bindTool(toolId, container){
      if (window.PG_REGISTRY && window.PG_REGISTRY[toolId] && window.PG_REGISTRY[toolId].bind){
        window.PG_REGISTRY[toolId].bind(container);
        return;
      }

      if (toolId === 'empathy-map') empathyBind(container);
      else if (toolId === 'persona') personaBind(container);
      else if (toolId === 'journey') journeyBind(container);
    }

    /* =========================================================
       BUILD HUB
       ========================================================= */
    function build(){
      var tabsHTML = '';
      var panelsHTML = '';

      var firstActive = null;

            /* Wire each panel */
      TOOLS.filter(function(t){ return t.active; }).forEach(function(tool){
        var panel = document.querySelector('.pg-panel[data-tool="' + tool.id + '"]');
        var getData, setData, resetData;

        if (window.PG_REGISTRY && window.PG_REGISTRY[tool.id]){
          var reg = window.PG_REGISTRY[tool.id];
          getData = reg.getData;
          setData = reg.setData;
          resetData = reg.reset;
        } else if (tool.id === 'empathy-map'){
          getData = empathyData;
          setData = function(d){ save('empathy-map', d); };
          resetData = empathyReset;
        } else if (tool.id === 'persona'){
          getData = personaData;
          setData = function(d){ save('persona', d); };
          resetData = personaReset;
        } else if (tool.id === 'journey'){
          getData = journeyData;
          setData = function(d){ save('journey', d); };
          resetData = journeyReset;
        }

        wireToolbar(tool.id, getData, setData, resetData);

        var canvas = panel.querySelector('[data-canvas]');
        if (canvas) bindTool(tool.id, canvas);

        renderTool(tool.id);
      });

      tabsEl.innerHTML = tabsHTML;
      panelsEl.innerHTML = panelsHTML;

            /* Wire each panel */
      TOOLS.filter(function(t){ return t.active; }).forEach(function(tool){
        var panel = document.querySelector('.pg-panel[data-tool="' + tool.id + '"]');
        var getData, setData, resetData;

        if (window.PG_REGISTRY && window.PG_REGISTRY[tool.id]){
          var reg = window.PG_REGISTRY[tool.id];
          getData = reg.getData;
          setData = reg.setData;
          resetData = reg.reset;
        } else if (tool.id === 'empathy-map'){
          getData = empathyData;
          setData = function(d){ save('empathy-map', d); };
          resetData = empathyReset;
        } else if (tool.id === 'persona'){
          getData = personaData;
          setData = function(d){ save('persona', d); };
          resetData = personaReset;
        } else if (tool.id === 'journey'){
          getData = journeyData;
          setData = function(d){ save('journey', d); };
          resetData = journeyReset;
        }

        wireToolbar(tool.id, getData, setData, resetData);

        var canvas = panel.querySelector('[data-canvas]');
        if (canvas) bindTool(tool.id, canvas);

        renderTool(tool.id);
      });

      /* Tab switch */
      tabsEl.addEventListener('click', function(e){
        var tab = e.target.closest('.pg-tab');
        if (!tab) return;
        activate(tab.dataset.tool);
      });

      /* Deep link */
      var hash = (location.hash || '').replace('#', '');
      var valid = TOOLS.some(function(t){ return t.active && t.id === hash; });
      activate(valid ? hash : firstActive);
    }

    function activate(toolId){
      $$('.pg-tab').forEach(function(t){
        t.classList.toggle('active', t.dataset.tool === toolId);
      });
      $$('.pg-panel').forEach(function(p){
        p.classList.toggle('active', p.dataset.tool === toolId);
      });
      try { history.replaceState({}, '', '#' + toolId); } catch(_){}
    }

    /* =========================================================
       TOAST + PRINT STYLES
       ========================================================= */
    (function ensureToastStyles(){
      if (document.getElementById('pg-toast-styles')) return;
      var st = document.createElement('style');
      st.id = 'pg-toast-styles';
      st.textContent =
        '.pg-toast{position:fixed;bottom:24px;left:50%;' +
        'transform:translateX(-50%) translateY(12px);background:#1E293B;' +
        'color:#fff;padding:10px 22px;border-radius:999px;font-size:.84rem;' +
        'font-weight:600;z-index:9999;opacity:0;pointer-events:none;' +
        'transition:opacity .25s ease,transform .25s ease;' +
        'box-shadow:0 10px 28px rgba(0,0,0,.35);}' +
        '.pg-toast.show{opacity:1;transform:translateX(-50%) translateY(0);}';
      document.head.appendChild(st);
    })();

    /* =========================================================
       GO
       ========================================================= */
       build();
    console.log('[playground] ready — tools:', TOOLS.filter(function(t){ return t.active; }).length);

    /* Safety net: if a plugin registers after this file runs, refresh once */
    setTimeout(function(){
      TOOLS.filter(function(t){ return t.active; }).forEach(function(tool){
        var canvas = document.querySelector('[data-canvas="' + tool.id + '"]');
        if (canvas && !canvas.children.length){
          renderTool(tool.id);
        }
      });
    }, 100);
  });
})();