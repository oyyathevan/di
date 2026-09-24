/* =========================================================
   Search Index — append all case studies
   Loads after search-index.js so it can append.
   ========================================================= */
(function(){
  'use strict';
  if (!window.CASES_DATA || !Array.isArray(window.CASES_DATA)) return;

  window.SEARCH_INDEX = window.SEARCH_INDEX || [];

  window.CASES_DATA.forEach(function(c){
    window.SEARCH_INDEX.push({
      page: 'cases.html',
      anchor: c.id,
      unit: 'Case Study',
      title: c.company + ' — ' + c.category,
      kw: (c.company + ' ' + c.problem + ' ' + c.lessons.join(' ') + ' ' +
           c.methods.join(' ') + ' ' + c.category + ' ' + c.region + ' ' + c.era)
          .toLowerCase()
    });
  });

  console.log('[search-index-cases] appended:', window.CASES_DATA.length, 'cases');
})();