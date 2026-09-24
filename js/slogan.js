/* Header Slogan Carousel — bulletproof build */
(function(){
  'use strict';

  function init(){
    window.__sloganLoaded = true;
    console.log('[slogan] init running…');

    const SLOGANS = [
      ['Empathize','Ideate','Iterate'],
      ['Learn','Think','Build'],
      ['Think','Beyond']
    ];
    const HOLD_MS = 5500;
    const FADE_MS = 550;

    const pill = document.querySelector('.slogan-pill');
    if (!pill){
      console.warn('[slogan] .slogan-pill NOT FOUND in header');
      return;
    }
    const textEl = pill.querySelector('.slogan-text');
    if (!textEl){
      console.warn('[slogan] .slogan-text NOT FOUND inside pill');
      return;
    }
    console.log('[slogan] found pill + text ✓');

    // Inline fallback — guarantees visibility even if CSS fails
    if (!pill.offsetWidth){
      console.warn('[slogan] pill has 0 width — applying inline fallback');
      pill.style.cssText =
        'display:inline-flex;align-items:center;justify-content:center;' +
        'height:30px;padding:0 18px;margin:0 10px;border-radius:999px;' +
        'background:linear-gradient(135deg,#DBEAFE,#E9D5FF);' +
        'font-size:.8rem;font-weight:700;cursor:pointer;user-select:none;white-space:nowrap';
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function render(words){
      return words.map((w,i) =>
        '<span class="word w'+(i+1)+'">'+w+'</span>'
      ).join('<span class="sep">·</span>');
    }

    if (reduce){
      textEl.innerHTML = render(SLOGANS[0]);
      textEl.classList.add('show');
      return;
    }

    let idx=0, timer=null, paused=false;

    function show(i, instant){
      idx = ((i % SLOGANS.length) + SLOGANS.length) % SLOGANS.length;
      if (instant){
        textEl.innerHTML = render(SLOGANS[idx]);
        textEl.classList.add('show');
        console.log('[slogan] showing:', SLOGANS[idx].join(' · '));
        return;
      }
      textEl.classList.remove('show');
      setTimeout(() => {
        if (paused) return;
        textEl.innerHTML = render(SLOGANS[idx]);
        textEl.classList.add('show');
        console.log('[slogan] showing:', SLOGANS[idx].join(' · '));
      }, FADE_MS);
    }

    function schedule(){
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (paused) return;
        show(idx + 1);
        schedule();
      }, HOLD_MS);
    }

    function start(){ paused=false; show(idx, true); schedule(); }
    function pause(){ paused=true; clearTimeout(timer); }
    function resume(){ if(!paused) return; paused=false; schedule(); }

    pill.addEventListener('click', () => {
      pause();
      show(idx + 1);
      timer = setTimeout(() => { paused=false; schedule(); }, HOLD_MS);
    });
    pill.addEventListener('mouseenter', pause);
    pill.addEventListener('mouseleave', resume);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? pause() : resume();
    });

    start();
    console.log('[slogan] started ✓');
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();