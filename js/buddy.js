/* =========================================================
   Study Buddy — Unit picker + 2-attempt retry
   ========================================================= */
(function(){
  'use strict';

  function init(){
    const fab    = document.getElementById('buddyFab');
    const panel  = document.getElementById('buddyPanel');
    const body   = document.getElementById('buddyBody');
    const input  = document.getElementById('buddyInput');
    const send   = document.getElementById('buddySend');
    const close  = document.getElementById('buddyClose');
    const topicL = document.getElementById('buddyTopic');
    if (!fab || !panel || !body) return;

    /* ---- Session state ---- */
    let session = {
      unit: null,         // e.g. "unit2"
      queue: [],          // shuffled question list
      idx: 0,             // current question index
      attempts: 0,        // attempts on current question
      score: 0,           // correct on first try
      total: 0            // total asked
    };

    /* ---- Helpers ---- */
    function bot(html){
      const d = document.createElement('div');
      d.className = 'buddy-msg bot';
      d.innerHTML = html;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function me(text){
      const d = document.createElement('div');
      d.className = 'buddy-msg me';
      d.textContent = text;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function clearBody(){ body.innerHTML = ''; }
    function shuffle(a){
      a = a.slice();
      for (let i = a.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    /* ---- Unit picker ---- */
    function showUnitPicker(){
      clearBody();
      if (topicL) topicL.textContent = 'Choose a unit';
      bot('Hi! I\'m your Study Buddy 🤖<br>Which unit would you like to practise?');
      const btns = Object.keys(window.BUDDY_UNITS || {}).map(key => {
        const u = window.BUDDY_UNITS[key];
        return `<button class="buddy-action" data-unit="${key}">${u.emoji} ${u.name.split('—')[0].trim()}</button>`;
      }).join('');
      bot(`<div class="opts">${btns}</div>`);
    }

    /* ---- Start a unit ---- */
    function startUnit(unitKey){
      const u = window.BUDDY_UNITS[unitKey];
      if (!u || !u.questions?.length){
        bot('Sorry — that unit has no questions yet.');
        return;
      }
      session = {
        unit: unitKey,
        queue: shuffle(u.questions),
        idx: 0,
        attempts: 0,
        score: 0,
        total: 0
      };
      if (topicL) topicL.textContent = u.name;
      bot(`<b>${u.emoji} ${u.name}</b><br>Great choice! I'll ask ${u.questions.length} questions.<br>You get <b>2 tries</b> per question.`);
      setTimeout(askQuestion, 500);
    }

    /* ---- Ask current question ---- */
    function askQuestion(){
      const u = window.BUDDY_UNITS[session.unit];
      const q = session.queue[session.idx];
      if (!q){
        endSession();
        return;
      }
      session.attempts = 0;
      const opts = q.o.map((txt, i) =>
        `<button data-i="${i}">${String.fromCharCode(65+i)}. ${txt}</button>`
      ).join('');
      bot(`<b>Q${session.idx + 1} of ${u.questions.length}.</b> ${q.q}
        <div class="opts" data-correct="${q.a}" data-exp="${q.e.replace(/"/g,'&quot;')}">${opts}</div>`);
    }

    /* ---- Handle option click ---- */
    function handleAnswer(btn, wrap){
      if (wrap.dataset.locked === '1') return;
      const correct = parseInt(wrap.dataset.correct, 10);
      const picked  = parseInt(btn.dataset.i, 10);
      const q       = session.queue[session.idx];
      session.attempts++;

      me(btn.textContent);

      if (picked === correct){
        /* Correct */
        wrap.dataset.locked = '1';
        wrap.querySelectorAll('button').forEach(b => {
          if (parseInt(b.dataset.i,10) === correct) b.classList.add('correct');
        });
        if (session.attempts === 1) session.score++;
        session.total++;
        const tryMsg = session.attempts === 1
          ? '✅ Correct on first try!'
          : '✅ Correct — you got it on the second try.';
        bot(`${tryMsg} ${wrap.dataset.exp}
          <br><br><button class="buddy-action" data-act="next">Next question →</button>`);
        return;
      }

      /* Wrong */
      btn.classList.add('wrong');
      if (session.attempts === 1){
        /* First wrong → try again */
        bot(`❌ Not quite. <b>Try again</b> — here's the same question:
          <div class="opts" data-correct="${correct}" data-exp="${wrap.dataset.exp}" data-locked="0">
            ${q.o.map((txt,i)=>`<button data-i="${i}">${String.fromCharCode(65+i)}. ${txt}</button>`).join('')}
          </div>`);
        return;
      }

      /* Second wrong → reveal and move on */
      wrap.dataset.locked = '1';
      wrap.querySelectorAll('button').forEach(b => {
        if (parseInt(b.dataset.i,10) === correct) b.classList.add('correct');
      });
      session.total++;
      bot(`❌ Still not right. The answer was <b>${String.fromCharCode(65+correct)}</b>.
        ${wrap.dataset.exp}
        <br><br><button class="buddy-action" data-act="next">Next question →</button>`);
    }

    /* ---- Next question ---- */
    function nextQuestion(){
      session.idx++;
      const u = window.BUDDY_UNITS[session.unit];
      if (session.idx >= session.queue.length){
        endSession();
        return;
      }
      askQuestion();
    }

    /* ---- End of session ---- */
    function endSession(){
      const u = window.BUDDY_UNITS[session.unit];
      const pct = session.total
        ? Math.round((session.score / session.total) * 100)
        : 0;
      bot(`🎉 <b>Session complete!</b><br>
        You scored <b>${session.score} / ${session.total}</b> correct on first try (${pct}%).`);
      if (topicL) topicL.textContent = u.name + ' — done';
      bot(`<div class="opts">
        <button class="buddy-action" data-unit="${session.unit}">🔄 Play again</button>
        <button class="buddy-action" data-act="picker">📚 Choose another unit</button>
      </div>`);
    }

    /* ---- Event: clicks inside chat ---- */
    body.addEventListener('click', (e) => {
      /* Unit button */
      const ub = e.target.closest('.buddy-action[data-unit]');
      if (ub){ startUnit(ub.dataset.unit); return; }

      /* Next question */
      const nb = e.target.closest('.buddy-action[data-act="next"]');
      if (nb){ nextQuestion(); return; }

      /* Back to picker */
      const pb = e.target.closest('.buddy-action[data-act="picker"]');
      if (pb){ showUnitPicker(); return; }

      /* Answer option */
      const ob = e.target.closest('.opts button');
      if (!ob) return;
      const wrap = ob.closest('.opts');
      if (!wrap || !session.unit) return;
      handleAnswer(ob, wrap);
    });

    /* ---- Open / close ---- */
    fab.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open') && !body.dataset.greeted){
        body.dataset.greeted = '1';
        showUnitPicker();
      }
    });
    close.addEventListener('click', () => panel.classList.remove('open'));

    /* ---- Free-text input (basic) ---- */
    function handleInput(){
      const txt = input.value.trim();
      if (!txt) return;
      me(txt);
      input.value = '';
      const t = txt.toLowerCase();
      if (t.includes('quiz') || t.includes('start')){
        showUnitPicker();
        return;
      }
      if (t.includes('unit 2') || t.includes('unit ii') || t === '2'){
        startUnit('unit2');
        return;
      }
      if (t.includes('unit 1') || t.includes('unit i') || t === '1'){
        startUnit('unit1');
        return;
      }
      if (t.includes('help')){
        bot('Try: "quiz", "unit 2", "unit 5", or tap a unit above.');
        return;
      }
      bot('I\'m an offline quiz bot. Tap a unit above, or type "quiz" to see units.');
    }
    send.addEventListener('click', handleInput);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleInput(); });

    /* ---- Keyboard ---- */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') panel.classList.remove('open');
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();