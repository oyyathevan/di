/* =========================================================
   PRINT — Full Unit (with options modal) + Q&A Only
   ========================================================= */
(function(){
  'use strict';

  var MODAL_ID = 'printPreviewModal';
  var STORAGE_KEY = 'dti-print-prefs';

  /* ---------- Preferences ---------- */
  function defaultPrefs(){
    return { notes: true, defs: true, objectives: true, qa: false, quiz: false };
  }
  function loadPrefs(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultPrefs();
    } catch(_){ return defaultPrefs(); }
  }
  function savePrefs(prefs){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch(_){}
  }

  /* ---------- Apply hide classes based on prefs ---------- */
  function applyPrintClasses(prefs){
    var body = document.body;
    body.classList.remove('print-hide-notes', 'print-hide-qa', 'print-hide-quiz',
                          'print-qa-only', 'print-notes-only');
    if (!prefs.notes)      body.classList.add('print-hide-notes');
    if (!prefs.qa)         body.classList.add('print-hide-qa');
    if (!prefs.quiz)       body.classList.add('print-hide-quiz');
  }
  function clearPrintClasses(){
    document.body.classList.remove(
      'print-hide-notes', 'print-hide-qa', 'print-hide-quiz',
      'print-qa-only', 'print-notes-only'
    );
  }

  /* ---------- Preview modal ---------- */
  function buildModal(){
    if (document.getElementById(MODAL_ID)) return;
    var prefs = loadPrefs();

    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'print-preview-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = ''
      + '<div class="ppm-card" role="dialog" aria-modal="true" aria-labelledby="ppmTitle">'
      +   '<h3 id="ppmTitle">🖨 Print Full Unit</h3>'
      +   '<p class="ppm-sub">Choose what to include. Your choice is remembered.</p>'
      +   '<div class="ppm-options">'
      +     '<label><input type="checkbox" data-opt="notes" ' + (prefs.notes ? 'checked' : '') + '> 📘 Notes (topics)</label>'
      +     '<label><input type="checkbox" data-opt="objectives" ' + (prefs.objectives ? 'checked' : '') + '> 🎯 Learning Objectives</label>'
      +     '<label><input type="checkbox" data-opt="defs" ' + (prefs.defs ? 'checked' : '') + '> 📖 Key Definitions</label>'
      +     '<label><input type="checkbox" data-opt="qa" ' + (prefs.qa ? 'checked' : '') + '> 📝 Exam Q&amp;A</label>'
      +     '<label><input type="checkbox" data-opt="quiz" ' + (prefs.quiz ? 'checked' : '') + '> 🎮 Self-Check Quizzes</label>'
      +   '</div>'
      +   '<div class="ppm-actions">'
      +     '<button type="button" class="ppm-btn" data-act="cancel">Cancel</button>'
      +     '<button type="button" class="ppm-btn primary" data-act="print">Print →</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function(e){
      if (e.target === modal) return closeModal();
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      if (btn.dataset.act === 'cancel') closeModal();
      if (btn.dataset.act === 'print') runPrintFromModal();
    });

    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  function openModal(){
    buildModal();
    var modal = document.getElementById(MODAL_ID);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(function(){
      var firstCb = modal.querySelector('input[type="checkbox"]');
      if (firstCb) firstCb.focus();
    }, 60);
  }
  function closeModal(){
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  /* ---------- Print from modal ---------- */
  function runPrintFromModal(){
    var modal = document.getElementById(MODAL_ID);
    var prefs = defaultPrefs();
    modal.querySelectorAll('[data-opt]').forEach(function(cb){
      prefs[cb.dataset.opt] = cb.checked;
    });
    savePrefs(prefs);
    closeModal();

    /* Ensure exam Q&A bodies are expanded so they print */
    document.querySelectorAll('.exam-qa').forEach(function(el){
      el.classList.add('open');
    });

    applyPrintClasses(prefs);
    setTimeout(function(){
      window.print();
      setTimeout(clearPrintClasses, 500);
    }, 80);
  }

  /* ---------- Direct Q&A-only print ---------- */
  function printQADirectly(){
    clearPrintClasses();
    document.body.classList.add('print-qa-only');
    document.querySelectorAll('.exam-qa').forEach(function(el){
      el.classList.add('open');
    });
    setTimeout(function(){
      window.print();
      setTimeout(clearPrintClasses, 500);
    }, 80);
  }

  /* ---------- Bind print buttons ---------- */
  function bindButtons(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-print]');
      if (!btn) return;
      e.preventDefault();
      var scope = btn.dataset.print;
      if (scope === 'qa') printQADirectly();
      else openModal();
    });
  }

  /* ---------- Init ---------- */
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      bindButtons();
      buildModal();
    });
  } else {
    bindButtons();
    buildModal();
  }

  console.log('[print] ready — modal enabled');
})();