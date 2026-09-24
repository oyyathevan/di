/* =========================================================
   Print Activities — single / all · two modes
   Modes: 'blank' (fill-in sheet) · 'reference' (steps shown)
   ========================================================= */
(function () {
  'use strict';

  const MODE_KEY = 'dti-print-mode';

  function getMode() {
    const cb = document.getElementById('modeReference');
    if (cb) return cb.checked ? 'reference' : 'blank';
    return localStorage.getItem(MODE_KEY) || 'blank';
  }

  function setMode(mode) {
    localStorage.setItem(MODE_KEY, mode);
    document.body.classList.toggle('print-mode-reference', mode === 'reference');
    const cb = document.getElementById('modeReference');
    if (cb) cb.checked = mode === 'reference';
  }

  function printOne(activityId) {
    setMode(getMode());
    document.body.classList.add('print-single');
    document.querySelectorAll('.activity').forEach(a => {
      a.classList.toggle('print-target', a.dataset.activityId === activityId);
    });
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-single');
        document.querySelectorAll('.activity').forEach(a =>
          a.classList.remove('print-target'));
      }, 300);
    }, 60);
  }

  function printAll() {
    setMode(getMode());
    document.body.classList.add('print-all');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.body.classList.remove('print-all');
      }, 300);
    }, 60);
  }

  function init() {
    const savedMode = localStorage.getItem(MODE_KEY) || 'blank';
    setMode(savedMode);

    const cb = document.getElementById('modeReference');
    if (cb) {
      cb.addEventListener('change', () => {
        setMode(cb.checked ? 'reference' : 'blank');
      });
    }

    document.addEventListener('click', (e) => {
      const single = e.target.closest('[data-print-activity]');
      if (single) {
        e.preventDefault();
        printOne(single.dataset.printActivity);
        return;
      }
      const all = e.target.closest('[data-print-all]');
      if (all) {
        e.preventDefault();
        printAll();
        return;
      }
    });

    console.log('[print-activities] ready · mode:', savedMode);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();