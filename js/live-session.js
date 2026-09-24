/* =========================================================
   LIVE SESSION MODE
   Modes: practical · studio · exam
   ========================================================= */
(function(){
  'use strict';

  window.__liveSessionLoaded = true;
  console.log('[live-session] script loaded');

  var PATH = (location.pathname.split('/').pop() || '').toLowerCase();
  var IS_PRACTICAL = /^practical-u[1-5]\.html?$/.test(PATH);
  var IS_STUDIO    = /^studio\.html?$/.test(PATH);
  var IS_UNIT      = /^unit[1-5]\.html?$/.test(PATH);

  console.log('[live-session] path:', PATH,
              '| practical:', IS_PRACTICAL,
              '| studio:', IS_STUDIO,
              '| unit:', IS_UNIT);

  if (!IS_PRACTICAL && !IS_STUDIO && !IS_UNIT) return;

  /* =========================================================
     STATE
     ========================================================= */
  var state = {
    mode: 'practical',
    activity: null,
    activityNum: '',
    activityTitle: '',
    steps: [],
    idx: 0,
    secondsPerStep: 300,
    remaining: 0,
    paused: false,
    soundOn: true,
    timerHandle: null,
    totalElapsed: 0,
    stepElapsed: [],
    running: false,
    revealed: false,
    examFilter: 'all'      // 'all' | '2' | '5' | '10'
  };

  /* =========================================================
     INIT
     ========================================================= */
  function init(){
    if (IS_PRACTICAL) injectPracticalButtons();
    if (IS_STUDIO)    injectStudioButton();
    if (IS_UNIT)      injectExamButton();

    buildSetup();
    buildOverlay();
    wireKeyboard();

    console.log('[live-session] ready — buttons:',
                document.querySelectorAll('.live-session-btn,.live-session-btn-lg').length);
  }

  /* =========================================================
     BUTTON INJECTION — practical
     ========================================================= */
  function injectPracticalButtons(){
    var activities = document.querySelectorAll('.activity');
    if (!activities.length){
      console.warn('[live-session] no .activity elements found');
      return;
    }
    activities.forEach(function(activity){
      var actions = activity.querySelector('.activity-actions');
      if (!actions) return;
      if (actions.querySelector('.live-session-btn')) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'live-session-btn';
      btn.textContent = 'Start Session';
      btn.dataset.mode = 'practical';
      actions.appendChild(btn);
    });
  }

  /* =========================================================
     BUTTON INJECTION — Studio
     ========================================================= */
  function injectStudioButton(){
    if (document.getElementById('liveStudioWrap')) return;

    var anchor =
      document.querySelector('.studio-progress') ||
      document.querySelector('.studio-stages') ||
      document.querySelector('.studio-hero');
    if (!anchor){
      console.warn('[live-session] no anchor found on studio page');
      return;
    }

    var wrap = document.createElement('div');
    wrap.id = 'liveStudioWrap';
    wrap.className = 'live-studio-cta';
    wrap.innerHTML = ''
      + '<button type="button" class="live-session-btn-lg" data-mode="studio">'
      +   'Run Studio Session'
      + '</button>'
      + '<span class="live-studio-hint">'
      +   'Present all <strong>26 steps</strong> to your class — '
      +   'with a timer for each step and full-screen controls.'
      + '</span>';

    anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
  }

  /* =========================================================
     BUTTON INJECTION — Exam Review (unit pages)
     ========================================================= */
  function injectExamButton(){
    var examSection = document.querySelector('.exam-qa');
    if (!examSection){
      console.log('[live-session] no exam-qa section on this page');
      return;
    }
    if (document.getElementById('liveExamWrap')) return;

    var wrap = document.createElement('div');
    wrap.id = 'liveExamWrap';
    wrap.className = 'live-exam-cta';
    wrap.innerHTML = ''
      + '<div class="live-exam-text">'
      +   '<b>📝 Exam Rapid Review</b>'
      +   '<span>Present this unit\'s questions one by one. '
      +     'Class answers aloud or on paper, then click to reveal.</span>'
      + '</div>'
      + '<button type="button" class="live-session-btn" data-mode="exam">'
      +   'Start Review'
      + '</button>';

    examSection.parentNode.insertBefore(wrap, examSection);
  }

  /* =========================================================
     EVENT DELEGATION — all Start buttons
     ========================================================= */
  document.addEventListener('click', function(e){
    var btn = e.target.closest('.live-session-btn,.live-session-btn-lg');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var mode = btn.dataset.mode || 'practical';
    console.log('[live-session] start clicked — mode:', mode);

    if (mode === 'practical'){
      var activity = btn.closest('.activity');
      if (!activity){ console.error('[live-session] no parent .activity'); return; }
      openSetup(activity, 'practical');
    } else if (mode === 'studio'){
      openSetup(null, 'studio');
    } else if (mode === 'exam'){
      openSetup(null, 'exam');
    }
  });

  /* =========================================================
     SETUP DIALOG
     ========================================================= */
  var setupEl = null;
  var pendingActivity = null;
  var pendingMode = 'practical';

  function buildSetup(){
    if (document.getElementById('liveSetup')){
      setupEl = document.getElementById('liveSetup');
      return;
    }
    var el = document.createElement('div');
    el.className = 'live-setup';
    el.id = 'liveSetup';
    el.innerHTML = ''
      + '<div class="live-setup-card" role="dialog" aria-modal="true">'
      +   '<h3 id="liveSetupTitle">▶ Start Live Session</h3>'
      +   '<p id="liveSetupDesc">Run this activity step by step on screen.</p>'
      +   '<div class="live-setup-row" data-mode-only="exam">'
      +     '<label>Question type</label>'
      +     '<div class="radios">'
      +       '<label><input type="radio" name="liveExamFilter" value="all" checked> All</label>'
      +       '<label><input type="radio" name="liveExamFilter" value="2"> 2-mark</label>'
      +       '<label><input type="radio" name="liveExamFilter" value="5"> 5-mark</label>'
      +       '<label><input type="radio" name="liveExamFilter" value="10"> 10-mark</label>'
      +     '</div>'
      +   '</div>'
      +   '<div class="live-setup-row">'
      +     '<label>Time per step</label>'
      +     '<div class="radios">'
      +       '<label><input type="radio" name="liveTime" value="auto" checked> Auto</label>'
      +       '<label><input type="radio" name="liveTime" value="custom"> Custom</label>'
      +       '<label><input type="number" id="liveCustomMin" min="1" max="60" value="5" disabled> min / step</label>'
      +     '</div>'
      +   '</div>'
      +   '<div class="live-setup-row">'
      +     '<label>Options</label>'
      +     '<div class="radios">'
      +       '<label><input type="checkbox" id="liveSound" checked> Soft chime on time-up</label>'
      +     '</div>'
      +   '</div>'
      +   '<div class="live-setup-actions">'
      +     '<button type="button" class="live-btn" id="liveSetupCancel">Cancel</button>'
      +     '<button type="button" class="live-btn primary" id="liveSetupStart">Start →</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(el);
    setupEl = el;

    var customInput = el.querySelector('#liveCustomMin');
    el.querySelectorAll('input[name="liveTime"]').forEach(function(r){
      r.addEventListener('change', function(){
        customInput.disabled = !(r.value === 'custom' && r.checked);
      });
    });

    el.querySelector('#liveSetupCancel').addEventListener('click', closeSetup);
    el.querySelector('#liveSetupStart').addEventListener('click', startFromSetup);
  }

  function openSetup(activity, mode){
    if (!setupEl) buildSetup();
    pendingActivity = activity || null;
    pendingMode = mode;

    var title = document.getElementById('liveSetupTitle');
    var desc  = document.getElementById('liveSetupDesc');

    if (mode === 'exam'){
      if (title) title.textContent = '📝 Start Exam Rapid Review';
      if (desc)  desc.textContent = 'Show each question, let the class answer, then reveal. Best for pre-exam revision.';
    } else if (mode === 'studio'){
      if (title) title.textContent = '▶ Start Studio Session';
      if (desc)  desc.textContent = 'Walk the class through all 26 Studio Mode steps — grouped by stage, with a timer per step.';
    } else {
      if (title) title.textContent = '▶ Start Live Session';
      if (desc)  desc.textContent = 'Run this activity step by step on screen. Students see a large timer and the current step.';
    }

    /* Show/hide exam-specific filter */
    setupEl.querySelectorAll('[data-mode-only="exam"]').forEach(function(row){
      row.classList.toggle('active', mode === 'exam');
    });

    setupEl.classList.add('open');
    console.log('[live-session] setup open — mode:', mode);
  }

  function closeSetup(){
    if (setupEl) setupEl.classList.remove('open');
    pendingActivity = null;
  }

  function startFromSetup(){
    var mode = pendingMode;
    var activity = pendingActivity;

    var customRadio = setupEl.querySelector('input[name="liveTime"][value="custom"]');
    var useCustom = customRadio && customRadio.checked;
    var customMin = parseInt(setupEl.querySelector('#liveCustomMin').value, 10) || 5;
    var soundOn = setupEl.querySelector('#liveSound').checked;

    var examFilter = 'all';
    var examRadio = setupEl.querySelector('input[name="liveExamFilter"]:checked');
    if (examRadio) examFilter = examRadio.value;

    setupEl.classList.remove('open');
    pendingActivity = null;

    var opts = {
      secondsPerStep: useCustom ? customMin * 60 : null,
      soundOn: soundOn,
      examFilter: examFilter
    };

    if (mode === 'studio') startStudioSession(opts);
    else if (mode === 'exam') startExamSession(opts);
    else startPracticalSession(activity, opts);
  }

  /* =========================================================
     OVERLAY
     ========================================================= */
  var overlayEl = null;

  function buildOverlay(){
    if (document.getElementById('liveOverlay')){
      overlayEl = document.getElementById('liveOverlay');
      return;
    }
    var el = document.createElement('div');
    el.className = 'live-overlay';
    el.id = 'liveOverlay';
    el.innerHTML = ''
      + '<div class="live-topbar">'
      +   '<div class="live-activity-name">'
      +     '<span class="live-num" id="liveNum">Activity</span>'
      +     '<span class="live-sep">·</span>'
      +     '<span class="live-title" id="liveTitle">Title</span>'
      +   '</div>'
      +   '<div class="live-progress-wrap">'
      +     '<span class="live-step-count" id="liveStepCount">Step 1 of 1</span>'
      +     '<div class="live-progress-bar">'
      +       '<div class="live-progress-fill" id="liveProgressFill"></div>'
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="live-center">'
      +   '<span class="live-question-badge" id="liveQBadge">2-MARK</span>'
      +   '<div class="live-step-text" id="liveStepText">Ready.</div>'
      +   '<div class="live-answer" id="liveAnswer"></div>'
      +   '<div class="live-timer" id="liveTimer">00:00</div>'
      +   '<div class="live-timer-label" id="liveTimerLabel">min : sec</div>'
      + '</div>'
      + '<div class="live-next" id="liveNext">'
      +   '<span class="live-next-label">Up next</span>'
      +   '<span class="live-next-text" id="liveNextText">—</span>'
      + '</div>'
      + '<div class="live-controls">'
      +   '<button type="button" class="live-btn" id="livePrev">← Prev <span class="kbd">←</span></button>'
      +   '<button type="button" class="live-btn reveal" id="liveReveal">👁 Reveal Answer <span class="kbd">R</span></button>'
      +   '<button type="button" class="live-btn primary" id="livePause">⏸ Pause <span class="kbd">Space</span></button>'
      +   '<button type="button" class="live-btn" id="liveNextBtn">Next → <span class="kbd">→</span></button>'
      +   '<button type="button" class="live-btn danger" id="liveEnd">✕ End <span class="kbd">Esc</span></button>'
      + '</div>'
      + '<div class="live-end" id="liveEndScreen">'
      +   '<div class="end-emoji">🎉</div>'
      +   '<h2>Session complete</h2>'
      +   '<div class="end-meta" id="liveEndMeta">—</div>'
      +   '<div class="end-actions">'
      +     '<button type="button" class="live-btn" id="liveEndCopy">📋 Copy recap</button>'
      +     '<button type="button" class="live-btn" id="liveEndRestart">🔁 Start again</button>'
      +     '<button type="button" class="live-btn primary" id="liveEndClose">← Back to page</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(el);
    overlayEl = el;

    el.querySelector('#livePause').addEventListener('click', togglePause);
    el.querySelector('#liveNextBtn').addEventListener('click', nextStep);
    el.querySelector('#livePrev').addEventListener('click', prevStep);
    el.querySelector('#liveEnd').addEventListener('click', confirmEnd);
    el.querySelector('#liveEndClose').addEventListener('click', endSession);
    el.querySelector('#liveEndRestart').addEventListener('click', restartSession);
    el.querySelector('#liveEndCopy').addEventListener('click', copyRecap);
    el.querySelector('#liveReveal').addEventListener('click', toggleReveal);
  }

  /* =========================================================
     EXTRACT — practical
     ========================================================= */
  function extractPracticalSteps(activity){
    var out = [];
    activity.querySelectorAll('.steps-content li').forEach(function(li){
      var t = (li.innerText || '').trim();
      if (t) out.push(t);
    });
    if (!out.length){
      activity.querySelectorAll('.steps-workspace li').forEach(function(li){
        var t = (li.innerText || '').trim();
        if (t) out.push(t);
      });
    }
    return out.map(function(t){ return { text: t }; });
  }

  function extractPracticalMeta(activity){
    var num = ((activity.querySelector('.ah-num') || {}).innerText || 'Activity').trim();
    var title = ((activity.querySelector('.ah-title') || {}).innerText || 'Untitled').trim();
    var timeText = ((activity.querySelector('.ah-meta span') || {}).innerText || '45');
    var totalMin = parseInt(String(timeText).replace(/\D/g,''), 10) || 45;
    return { num: num, title: title, totalMin: totalMin };
  }

  /* =========================================================
     EXTRACT — studio
     ========================================================= */
  function extractStudioSteps(){
    var out = [];
    var stepEls = document.querySelectorAll('.studio-step');
    stepEls.forEach(function(stepEl){
      var panel = stepEl.closest('.studio-panel');
      var stage = '';
      if (panel){
        var stageEl = panel.querySelector('.studio-stage-intro h2');
        if (stageEl) stage = (stageEl.innerText || '').trim();
      }
      var stepNo = ((stepEl.querySelector('.step-no') || {}).innerText || '').trim();
      var title = '';
      var titleEl = stepEl.querySelector('.studio-step-title');
      if (titleEl){
        var clone = titleEl.cloneNode(true);
        var noSpan = clone.querySelector('.step-no');
        if (noSpan && noSpan.parentNode) noSpan.parentNode.removeChild(noSpan);
        title = (clone.innerText || '').trim();
      }
      var instruction = ((stepEl.querySelector('.instruction') || {}).innerText || '').trim();
      var parts = [];
      if (stepNo) parts.push(stepNo);
      if (title) parts.push(stepNo ? '· ' + title : title);
      var head = parts.join(' ');
      var text = head + (instruction ? '\n\n' + instruction : '');

      out.push({
        stage: stage, no: stepNo, title: title,
        instruction: instruction, text: text
      });
    });
    return out;
  }

  /* =========================================================
     EXTRACT — exam questions
     ========================================================= */
  function extractExamSteps(filter){
    var out = [];
    var section = document.querySelector('.exam-qa');
    if (!section) return out;

    var groups = section.querySelectorAll('.exam-qa-group');
    groups.forEach(function(group){
      /* Determine group type from h3 */
      var h3Text = ((group.querySelector('h3') || {}).innerText || '').toUpperCase();
      var type = '2';
      if (/5[\-\s]?MARK/.test(h3Text)) type = '5';
      if (/10[\-\s]?MARK/.test(h3Text)) type = '10';

      if (filter && filter !== 'all' && filter !== type) return;

      group.querySelectorAll('.exam-q').forEach(function(q){
        var qnum = ((q.querySelector('.qnum') || {}).innerText || '').trim();
        var qtext = ((q.querySelector('.qtext') || {}).innerText || '').trim();
        var qanswerEl = q.querySelector('.qanswer');

        /* Preserve inner HTML for the answer (tables, lists, etc.) */
        var answerHTML = qanswerEl ? qanswerEl.innerHTML : '';

        out.push({
          type: type,
          num: qnum,
          question: qtext,
          answerHTML: answerHTML,
          text: qtext,                  /* shown in main area */
          badge: type + '-MARK'
        });
      });
    });
    return out;
  }

  /* =========================================================
     SESSION STARTERS
     ========================================================= */
  function startPracticalSession(activity, opts){
    if (!overlayEl) buildOverlay();

    var meta = extractPracticalMeta(activity);
    var steps = extractPracticalSteps(activity);
    if (!steps.length){ alert('No steps found in this activity.'); return; }

    state.mode = 'practical';
    state.activity = activity;
    state.activityNum = meta.num;
    state.activityTitle = meta.title;
    state.steps = steps;
    state.idx = 0;
    state.paused = false;
    state.totalElapsed = 0;
    state.stepElapsed = new Array(steps.length).fill(0);
    state.secondsPerStep = (opts && opts.secondsPerStep)
      ? opts.secondsPerStep
      : Math.max(60, Math.round((meta.totalMin * 60) / steps.length));
    state.soundOn = !!(opts && opts.soundOn);

    overlayEl.setAttribute('data-mode', 'practical');
    overlayEl.classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('liveNum').textContent = state.activityNum || 'Activity';
    document.getElementById('liveTitle').textContent = state.activityTitle || 'Untitled';
    showStep(0);

    if (state.timerHandle) clearInterval(state.timerHandle);
    state.timerHandle = setInterval(tick, 1000);
    state.running = true;

    console.log('[live-session] practical session running — steps:', steps.length);
  }

  function startStudioSession(opts){
    if (!overlayEl) buildOverlay();

    var steps = extractStudioSteps();
    if (!steps.length){ alert('No Studio steps found.'); return; }

    state.mode = 'studio';
    state.activity = null;
    state.steps = steps;
    state.idx = 0;
    state.paused = false;
    state.totalElapsed = 0;
    state.stepElapsed = new Array(steps.length).fill(0);
    state.secondsPerStep = (opts && opts.secondsPerStep) ? opts.secondsPerStep : 4 * 60;
    state.soundOn = !!(opts && opts.soundOn);

    overlayEl.setAttribute('data-mode', 'studio');
    overlayEl.classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('liveNum').textContent = 'Studio Mode';
    showStep(0);

    if (state.timerHandle) clearInterval(state.timerHandle);
    state.timerHandle = setInterval(tick, 1000);
    state.running = true;

    console.log('[live-session] studio session running — steps:', steps.length);
  }

  function startExamSession(opts){
    if (!overlayEl) buildOverlay();

    var filter = (opts && opts.examFilter) || 'all';
    var steps = extractExamSteps(filter);
    if (!steps.length){
      alert('No exam questions found for this filter.');
      return;
    }

    state.mode = 'exam';
    state.activity = null;
    state.examFilter = filter;
    state.activityNum = 'Exam Rapid Review';
    state.steps = steps;
    state.idx = 0;
    state.paused = false;
    state.totalElapsed = 0;
    state.stepElapsed = new Array(steps.length).fill(0);
    /* Exam default: 90 sec per question */
    state.secondsPerStep = (opts && opts.secondsPerStep) ? opts.secondsPerStep : 90;
    state.soundOn = !!(opts && opts.soundOn);

    overlayEl.setAttribute('data-mode', 'exam');
    overlayEl.classList.add('open');
    document.body.style.overflow = 'hidden';

    document.getElementById('liveNum').textContent = 'Exam Review';
    document.getElementById('liveTitle').textContent =
      (filter === 'all' ? 'All questions' : filter + '-mark only') +
      ' · ' + steps.length + ' questions';

    showStep(0);

    if (state.timerHandle) clearInterval(state.timerHandle);
    state.timerHandle = setInterval(tick, 1000);
    state.running = true;

    console.log('[live-session] exam session running — questions:', steps.length);
  }

  /* =========================================================
     TICK
     ========================================================= */
  function tick(){
    if (!state.running) return;
    if (state.paused) return;
    var endScreen = document.getElementById('liveEndScreen');
    if (endScreen && endScreen.classList.contains('open')) return;

    state.remaining -= 1;
    state.totalElapsed += 1;
    state.stepElapsed[state.idx] = (state.stepElapsed[state.idx] || 0) + 1;
    updateTimerDisplay();

    if (state.remaining <= 0){
      if (state.soundOn) playChime();
      var t = document.getElementById('liveTimer');
      if (t) t.classList.add('done');
      /* In exam mode, auto-reveal the answer when time is up */
      if (state.mode === 'exam' && !state.revealed) revealAnswer();
    }
  }

  /* =========================================================
     SHOW STEP
     ========================================================= */
  function showStep(i){
    if (i < 0) i = 0;
    if (i >= state.steps.length){ finishSession(); return; }

    state.idx = i;
    state.remaining = state.secondsPerStep;
    state.paused = false;
    state.revealed = false;

    var step = state.steps[i];

    /* Reset animations */
    var textEl = document.getElementById('liveStepText');
    textEl.style.animation = 'none';
    void textEl.offsetWidth;
    textEl.style.animation = '';

    /* Hide + reset answer */
    var ansEl = document.getElementById('liveAnswer');
    if (ansEl){
      ansEl.classList.remove('revealed');
      ansEl.innerHTML = '';
    }

    /* Hide + reset reveal button state */
    var revBtn = document.getElementById('liveReveal');
    if (revBtn){
      revBtn.classList.remove('revealed');
      revBtn.innerHTML = '👁 Reveal Answer <span class="kbd">R</span>';
      revBtn.disabled = false;
    }

    /* Content by mode */
    if (state.mode === 'exam'){
      var badge = document.getElementById('liveQBadge');
      if (badge) badge.textContent = step.badge || 'Q';
      textEl.textContent = step.question || '';
      if (ansEl) ansEl.innerHTML = step.answerHTML || '';
      document.getElementById('liveNum').textContent = step.num || 'Q';
      document.getElementById('liveTitle').textContent =
        (state.examFilter === 'all' ? 'All questions' : state.examFilter + '-mark only');
    } else if (state.mode === 'studio'){
      textEl.textContent = step.text || '';
      document.getElementById('liveNum').textContent = 'Studio Mode';
      document.getElementById('liveTitle').textContent =
        step.stage ? step.stage.replace(/^[^\w]*\s*/, '') : 'Design Sprint';
    } else {
      textEl.textContent = step.text || '';
    }

    var total = state.steps.length;
    document.getElementById('liveStepCount').textContent =
      'Step ' + (i + 1) + ' of ' + total;
    document.getElementById('liveProgressFill').style.width =
      ((i) / total * 100) + '%';

    /* Next preview */
    var nextEl = document.getElementById('liveNext');
    var nextTxt = document.getElementById('liveNextText');
    if (i + 1 < total){
      var nx = state.steps[i + 1];
      if (state.mode === 'studio'){
        nextTxt.textContent = (nx.no ? nx.no + ' · ' : '') + (nx.title || '');
      } else if (state.mode === 'exam'){
        nextTxt.textContent = (nx.num ? nx.num + ' · ' : '') + (nx.question || '');
      } else {
        nextTxt.textContent = nx.text || '';
      }
      nextEl.classList.remove('empty');
    } else {
      nextTxt.textContent = 'Last step — wrap up and recap.';
      nextEl.classList.add('empty');
    }

    var pauseBtn = document.getElementById('livePause');
    pauseBtn.innerHTML = '⏸ Pause <span class="kbd">Space</span>';
    document.getElementById('liveTimerLabel').textContent = 'min : sec';
    document.getElementById('livePrev').disabled = (i === 0);

    updateTimerDisplay();
  }

  function updateTimerDisplay(){
    var t = document.getElementById('liveTimer');
    if (!t) return;
    var sec = Math.max(0, state.remaining);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    t.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');

    t.classList.remove('warn','danger','done');
    if (state.remaining <= 0){
      t.classList.add('done');
    } else if (state.remaining <= state.secondsPerStep * 0.10){
      t.classList.add('danger');
    } else if (state.remaining <= state.secondsPerStep * 0.25){
      t.classList.add('warn');
    }
  }

  /* =========================================================
     REVEAL — exam mode
     ========================================================= */
  function revealAnswer(){
    if (state.mode !== 'exam') return;
    state.revealed = true;
    var ansEl = document.getElementById('liveAnswer');
    if (ansEl) ansEl.classList.add('revealed');
    var revBtn = document.getElementById('liveReveal');
    if (revBtn){
      revBtn.classList.add('revealed');
      revBtn.innerHTML = '👁 Hide Answer <span class="kbd">R</span>';
    }
  }
  function hideAnswer(){
    if (state.mode !== 'exam') return;
    state.revealed = false;
    var ansEl = document.getElementById('liveAnswer');
    if (ansEl) ansEl.classList.remove('revealed');
    var revBtn = document.getElementById('liveReveal');
    if (revBtn){
      revBtn.classList.remove('revealed');
      revBtn.innerHTML = '👁 Reveal Answer <span class="kbd">R</span>';
    }
  }
  function toggleReveal(){
    if (state.mode !== 'exam') return;
    if (state.revealed) hideAnswer();
    else revealAnswer();
  }

  /* =========================================================
     CONTROLS
     ========================================================= */
  function togglePause(){
    if (!state.running) return;
    state.paused = !state.paused;
    var btn = document.getElementById('livePause');
    var lbl = document.getElementById('liveTimerLabel');
    if (state.paused){
      btn.innerHTML = '▶ Resume <span class="kbd">Space</span>';
      if (lbl) lbl.textContent = 'paused';
    } else {
      btn.innerHTML = '⏸ Pause <span class="kbd">Space</span>';
      if (lbl) lbl.textContent = 'min : sec';
    }
  }

  function nextStep(){
    if (state.idx + 1 >= state.steps.length){ finishSession(); return; }
    showStep(state.idx + 1);
  }

  function prevStep(){
    if (state.idx === 0) return;
    showStep(state.idx - 1);
  }

  function confirmEnd(){
    if (!state.running){ endSession(); return; }
    if (window.confirm('End this session early?')) endSession();
  }

  /* =========================================================
     FINISH / END
     ========================================================= */
  function finishSession(){
    state.running = false;
    var screen = document.getElementById('liveEndScreen');
    screen.classList.add('open');

    var m = Math.floor(state.totalElapsed / 60);
    var s = state.totalElapsed % 60;
    var lead;
    if (state.mode === 'studio'){
      lead = 'Studio Mode · ' + state.steps.length + ' steps';
    } else if (state.mode === 'exam'){
      lead = 'Exam Rapid Review · ' + state.steps.length + ' questions';
    } else {
      lead = state.activityNum + ' · ' + state.activityTitle;
    }
    document.getElementById('liveEndMeta').textContent =
      lead + ' · ' + m + ' min ' + String(s).padStart(2,'0') + ' s total';

    if (state.soundOn) playChime(true);
  }

  function endSession(){
    state.running = false;
    state.paused = false;
    if (state.timerHandle){ clearInterval(state.timerHandle); state.timerHandle = null; }
    overlayEl.classList.remove('open');
    document.getElementById('liveEndScreen').classList.remove('open');
    document.body.style.overflow = '';
    state.idx = 0;
    state.totalElapsed = 0;
    state.revealed = false;
  }

  function restartSession(){
    var mode = state.mode;
    var activity = state.activity;
    var opts = {
      secondsPerStep: state.secondsPerStep,
      soundOn: state.soundOn,
      examFilter: state.examFilter
    };
    endSession();
    setTimeout(function(){
      if (mode === 'studio') startStudioSession(opts);
      else if (mode === 'exam') startExamSession(opts);
      else if (activity) startPracticalSession(activity, opts);
    }, 60);
  }

  /* =========================================================
     COPY RECAP
     ========================================================= */
  function copyRecap(){
    var lines = [];
    if (state.mode === 'studio') lines.push('🎨 Studio Mode Session');
    else if (state.mode === 'exam') lines.push('📝 Exam Rapid Review');
    else lines.push('🎉 ' + state.activityNum + ' — ' + state.activityTitle);
    lines.push('');

    state.steps.forEach(function(step, i){
      var sec = state.stepElapsed[i] || 0;
      var m = Math.floor(sec / 60);
      var ss = sec % 60;
      var label;
      if (state.mode === 'studio'){
        label = (step.no ? step.no + ' ' : '') + (step.title || '');
        if (step.stage) label = '[' + step.stage.replace(/^[^\w]*\s*/, '') + ']  ' + label;
      } else if (state.mode === 'exam'){
        label = (step.num ? step.num + ' ' : '') + (step.question || '');
      } else {
        label = step.text || '';
      }
      lines.push((i+1) + '. ' + label + '  (' + m + 'm ' + String(ss).padStart(2,'0') + 's)');
    });
    lines.push('');
    var t = state.totalElapsed;
    lines.push('Total: ' + Math.floor(t/60) + 'm ' + String(t%60).padStart(2,'0') + 's');

    var txt = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(function(){
        var btn = document.getElementById('liveEndCopy');
        var orig = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(function(){ btn.textContent = orig; }, 1400);
      }).catch(function(){ fallbackCopy(txt); });
    } else {
      fallbackCopy(txt);
    }
  }

  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(_){}
    document.body.removeChild(ta);
  }

  /* =========================================================
     SOUND
     ========================================================= */
  function playChime(longer){
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var now = ctx.currentTime;
      var notes = longer ? [523.25, 659.25, 783.99] : [659.25];
      notes.forEach(function(freq, i){
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        var t0 = now + i * 0.15;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.8);
      });
      setTimeout(function(){ try { ctx.close(); } catch(_){} }, 1500);
    } catch(_){}
  }

  /* =========================================================
     KEYBOARD
     ========================================================= */
  function wireKeyboard(){
    document.addEventListener('keydown', function(e){
      if (!overlayEl || !overlayEl.classList.contains('open')) return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      var endOpen = document.getElementById('liveEndScreen').classList.contains('open');

      if (e.key === 'Escape'){
        e.preventDefault();
        if (endOpen) endSession();
        else confirmEnd();
        return;
      }
      if (endOpen) return;

      if (e.key === ' '){ e.preventDefault(); togglePause(); }
      else if (e.key === 'ArrowRight'){ e.preventDefault(); nextStep(); }
      else if (e.key === 'ArrowLeft'){ e.preventDefault(); prevStep(); }
      else if ((e.key === 'r' || e.key === 'R') && state.mode === 'exam'){
        e.preventDefault();
        toggleReveal();
      }
    });
  }

  /* =========================================================
     BOOT
     ========================================================= */
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();