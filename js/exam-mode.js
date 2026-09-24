/* =========================================================
   Exam Mode toggle — Learn ↔ Exam
   ========================================================= */
(function(){
  'use strict';

  const KEY = 'dti-mode';   // "learn" | "exam"

  function apply(mode){
    document.body.classList.toggle('exam-mode', mode === 'exam');
    document.querySelectorAll('.exam-toggle').forEach(btn => {
      btn.classList.toggle('exam', mode === 'exam');
      btn.innerHTML = mode === 'exam' ? '📝 Exam' : '📖 Learn';
      btn.setAttribute('aria-label',
        mode === 'exam' ? 'Switch to Learn mode' : 'Switch to Exam mode');
    });
    localStorage.setItem(KEY, mode);
  }

  function toggle(){
    const current = localStorage.getItem(KEY) || 'learn';
    apply(current === 'exam' ? 'learn' : 'exam');
  }

  function init(){
    const mode = localStorage.getItem(KEY) || 'learn';
    apply(mode);

    // Delegated — survives header injection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.exam-toggle')) {
        e.preventDefault();
        toggle();
      }
    });

    console.log('[exam-mode] ready — mode:', mode);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();