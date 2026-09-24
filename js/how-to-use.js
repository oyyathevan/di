/* =========================================================
   HOW TO USE — role filter + accordion helpers
   ========================================================= */
(function(){
  'use strict';

  function onReady(fn){
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function init(){
    var tabs = document.querySelectorAll('.htu-role-tab');
    var cards = document.querySelectorAll('[data-roles]');
    if (!tabs.length) return;

    var STORAGE_KEY = 'dti-howtouse-role';

    function applyRole(role){
      /* Tab active state */
      tabs.forEach(function(t){
        t.classList.toggle('active', t.dataset.role === role);
      });

      /* Cards: hide those that don't match (role='both' always shows unless role='both') */
      cards.forEach(function(card){
        var roles = card.dataset.roles.split(',');
        var show = (role === 'both') || roles.indexOf('both') !== -1 || roles.indexOf(role) !== -1;
        card.style.display = show ? '' : 'none';
      });

      /* Also filter entire categories — hide a section if all its cards are hidden */
      document.querySelectorAll('.htu-category').forEach(function(cat){
        var visible = cat.querySelectorAll('[data-roles]:not([style*="display: none"])').length;
        /* If category has no data-roles cards, keep it visible */
        var hasFiltered = cat.querySelectorAll('[data-roles]').length > 0;
        cat.style.display = (hasFiltered && visible === 0) ? 'none' : '';
      });

      try { localStorage.setItem(STORAGE_KEY, role); } catch(_){}
    }

    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        applyRole(tab.dataset.role);
      });
    });

    /* Restore saved role, default 'both' */
    var saved = 'both';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'both'; } catch(_){}
    applyRole(saved);

    console.log('[how-to-use] ready — role:', saved,
                '| filterable cards:', cards.length);
  });
})();