/* =========================================================
   Print handler — Full unit or Q&A only
   ========================================================= */
(function(){
  'use strict';

  function printFull(){
    document.body.classList.remove('print-qa-only');
    // Force exam-qa open so answers print
    document.querySelectorAll('.exam-qa').forEach(el => el.classList.add('open'));
    setTimeout(() => window.print(), 60);
  }

  function printQA(){
    document.body.classList.add('print-qa-only');
    document.querySelectorAll('.exam-qa').forEach(el => el.classList.add('open'));
    setTimeout(() => {
      window.print();
      setTimeout(() => document.body.classList.remove('print-qa-only'), 400);
    }, 60);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-print]');
    if (!b) return;
    e.preventDefault();
    const scope = b.dataset.print;
    if (scope === 'qa') printQA();
    else printFull();
  });

  console.log('[print] ready');
})();