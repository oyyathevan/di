/* Language Switcher — cookie + reload method (reliable) */
(function(){
  'use strict';

  const KEY = 'dti-lang';
  const CODES = 'en,te,hi,ta,kn,ml,mr,bn,gu';

  /* ---------- Cookie helpers ---------- */
  function setCookie(name, value){
    const exp = 'expires=' + new Date(Date.now() + 365*864e5).toUTCString();
    document.cookie = name + '=' + value + '; ' + exp + '; path=/';
  }
  function deleteCookie(name){
    const past = 'expires=Thu, 01 Jan 1970 00:00:00 UTC';
    document.cookie = name + '=; ' + past + '; path=/';
    document.cookie = name + '=; ' + past + '; path=/; domain=' + location.hostname;
  }

  /* ---------- Apply language by setting cookie ---------- */
  function applyCookie(code){
    if(code === 'en'){
      deleteCookie('googtrans');
    } else {
      // Google expects /source/target format
      setCookie('googtrans', '/en/' + code);
    }
  }

  /* ---------- Load Google Translate widget (needed for translation to work) ---------- */
  function loadGT(){
    if(!document.getElementById('google_translate_element')){
      const d = document.createElement('div');
      d.id = 'google_translate_element';
      d.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden';
      document.body.appendChild(d);
    }
    window.googleTranslateElementInit = function(){
      try{
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: CODES,
          autoDisplay: false
        }, 'google_translate_element');
      }catch(e){ console.warn('[translate]', e); }
    };
    if(!document.querySelector('script[src*="translate_a/element.js"]')){
      const s = document.createElement('script');
      s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      s.async = true;
      document.body.appendChild(s);
    }
  }

  /* ---------- Change language: set cookie + reload ---------- */
  function setLang(code){
    applyCookie(code);
    localStorage.setItem(KEY, code);
    // Reload so the widget picks up the cookie on fresh page load
    location.reload();
  }

  /* ---------- Update pill UI ---------- */
  function refreshUI(code){
    document.querySelectorAll('.lang-switch').forEach(sw => {
      const c = sw.querySelector('.lang-current');
      if(c) c.textContent = code.toUpperCase();
      sw.querySelectorAll('.lang-item').forEach(it =>
        it.classList.toggle('active', it.dataset.code === code));
    });
  }

  function closeAll(){
    document.querySelectorAll('.lang-switch.open').forEach(el => el.classList.remove('open'));
  }

  /* ---------- Init ---------- */
  function init(){
    // On load: if a language is stored, make sure cookie matches
    const saved = localStorage.getItem(KEY) || 'en';
    applyCookie(saved);

    // Wire buttons
    document.querySelectorAll('.lang-switch').forEach(sw => {
      sw.addEventListener('click', e => {
        if(e.target.closest('.lang-item')) return;
        e.stopPropagation();
        const wasOpen = sw.classList.contains('open');
        closeAll();
        if(!wasOpen) sw.classList.add('open');
      });
      sw.querySelectorAll('.lang-item').forEach(it => {
        it.addEventListener('click', e => {
          e.stopPropagation();
          const code = it.dataset.code;
          if(code === (localStorage.getItem(KEY) || 'en')){
            closeAll();
            return;   // same language, no reload
          }
          setLang(code);   // will reload
        });
      });
    });

    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape') closeAll();
    });

    refreshUI(saved);
    loadGT();
    console.log('[translate] ready — current:', saved);
  }

  if(document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();