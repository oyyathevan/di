/* =========================================================
   DTI Notes — Extras
   Flip cards · MCQ quiz · Multilingual audio narrator
   ========================================================= */
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    console.log('[extras] initialising…');

    /* =========================================================
       #5a — FLIP CARDS
       ========================================================= */
    const flipCards = document.querySelectorAll('.flip-card');
    flipCards.forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('click', () => card.classList.toggle('flipped'));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });
    console.log('[extras] flip cards found:', flipCards.length);

    /* =========================================================
       #5b — MCQ QUIZ
       ========================================================= */
    const quizBox = document.querySelector('.quiz-box');
    const scoreBox = document.getElementById('quizScore');

    function refreshScore() {
      if (!scoreBox) return;
      const all = document.querySelectorAll('.quiz-q');
      const done = document.querySelectorAll('.quiz-q.answered');
      const right = document.querySelectorAll('.quiz-q[data-result="correct"]');
      if (done.length === 0) {
        scoreBox.textContent = 'Answer the questions above to see your score.';
        return;
      }
      if (done.length === all.length) {
        const pct = Math.round((right.length / all.length) * 100);
        scoreBox.innerHTML = `🎉 <strong>${right.length} / ${all.length}</strong> correct (${pct}%)`;
      } else {
        scoreBox.innerHTML = `Progress: <strong>${done.length} / ${all.length}</strong> answered`;
      }
    }

    if (quizBox) {
      quizBox.addEventListener('click', e => {
        const opt = e.target.closest('.opt');
        if (!opt) return;
        const q = opt.closest('.quiz-q');
        if (!q || q.classList.contains('answered')) return;
        const opts = q.querySelectorAll('.opt');
        const correctIdx = parseInt(q.dataset.correct, 10);
        const pickedIdx = Array.prototype.indexOf.call(opts, opt);
        q.classList.add('answered');
        opts.forEach(o => o.classList.add('disabled'));
        if (pickedIdx === correctIdx) {
          opt.classList.add('correct');
          q.dataset.result = 'correct';
        } else {
          opt.classList.add('wrong');
          if (opts[correctIdx]) opts[correctIdx].classList.add('correct');
          q.dataset.result = 'wrong';
        }
        refreshScore();
      });
    }

    const resetBtn = document.getElementById('quizReset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.querySelectorAll('.quiz-q').forEach(q => {
          q.classList.remove('answered');
          delete q.dataset.result;
          q.querySelectorAll('.opt').forEach(o =>
            o.classList.remove('correct', 'wrong', 'disabled'));
        });
        refreshScore();
      });
    }
    refreshScore();

    /* =========================================================
       #7 — MULTILINGUAL AUDIO NARRATOR
       ========================================================= */
    const Speech = window.speechSynthesis;
    const player = document.querySelector('.audio-player');
    let currentTopicId = null;
    let queue = [], queueIdx = 0;
    let isPaused = false;
    let keepAliveTimer = null;
    let currentVoice = null;

    /* ---------- Language config ---------- */
    const LANG_VOICE_MAP = {
      en: ['en-IN', 'en-GB', 'en-US', 'en-AU', 'en'],
      te: ['te-IN', 'te'],
      hi: ['hi-IN', 'hi'],
      ta: ['ta-IN', 'ta'],
      kn: ['kn-IN', 'kn'],
      ml: ['ml-IN', 'ml'],
      mr: ['mr-IN', 'mr'],
      bn: ['bn-IN', 'bn'],
      gu: ['gu-IN', 'gu']
    };
    const LANG_LABEL = {
      en: 'English', te: 'Telugu', hi: 'Hindi', ta: 'Tamil',
      kn: 'Kannada', ml: 'Malayalam', mr: 'Marathi',
      bn: 'Bengali', gu: 'Gujarati'
    };

    function getCurrentLang() {
      try { return localStorage.getItem('dti-lang') || 'en'; }
      catch (e) { return 'en'; }
    }

    function waitForVoices() {
      return new Promise(resolve => {
        if (!Speech) return resolve([]);
        let voices = Speech.getVoices();
        if (voices.length) return resolve(voices);
        const t = setTimeout(() => resolve(Speech.getVoices() || []), 3000);
        Speech.onvoiceschanged = () => {
          clearTimeout(t);
          resolve(Speech.getVoices() || []);
        };
      });
    }

    /* Find the best voice for the requested language */
    function findVoiceFor(lang, voices) {
      const codes = LANG_VOICE_MAP[lang] || LANG_VOICE_MAP.en;

      /* 1. Exact code match */
      for (let i = 0; i < codes.length; i++) {
        const v = voices.find(x => x.lang === codes[i]);
        if (v) return { voice: v, exact: true };
      }

      /* 2. Prefix match (e.g. 'te-IN.utf8') */
      const prefix = lang + '-';
      const approx = voices.find(x =>
        (x.lang || '').toLowerCase().indexOf(prefix) === 0);
      if (approx) return { voice: approx, exact: true };

      /* 3. Fallback to any English voice */
      const enVoice = voices.find(x =>
        (x.lang || '').toLowerCase().indexOf('en') === 0);
      return { voice: enVoice || voices[0] || null, exact: false };
    }

    /* ---------- Voice-not-available warning ---------- */
    function showVoiceWarning(lang) {
      if (sessionStorage.getItem('dti-voice-warned') === '1') return;
      const label = LANG_LABEL[lang] || lang;

      let toast = document.getElementById('voiceWarn');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'voiceWarn';
        toast.className = 'voice-warn';
        toast.innerHTML = ''
          + '<span class="vw-icon">🔊</span>'
          + '<span class="vw-text">'
          +   '<strong>' + label + '</strong> voice not installed on this device. '
          +   'Reading with an English voice. '
          +   '<a href="https://support.google.com/accessibility/android/answer/6006983" '
          +      'target="_blank" rel="noopener">Install a voice →</a>'
          + '</span>'
          + '<button type="button" class="vw-close" aria-label="Dismiss">✕</button>';
        document.body.appendChild(toast);
        toast.querySelector('.vw-close').addEventListener('click', () => {
          toast.classList.remove('show');
          sessionStorage.setItem('dti-voice-warned', '1');
        });
      }

      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => toast.classList.remove('show'), 8000);
    }

    /* Pick the matching voice for the current page language */
    async function pickVoice() {
      const lang = getCurrentLang();
      const voices = await waitForVoices();
      const result = findVoiceFor(lang, voices);

      if (!result.exact && lang !== 'en') {
        console.warn('[extras] no ' + lang + ' voice — falling back to English');
        showVoiceWarning(lang);
      }

      currentVoice = result.voice;
      return result;
    }

    /* Init on page load */
    (async function initVoice() {
      if (!Speech) return;
      const lang = getCurrentLang();
      const result = await pickVoice();
      console.log(
        '[extras] audio lang:', lang,
        '| voice:', result.voice ? (result.voice.lang + ' / ' + result.voice.name) : 'none',
        '| exact match:', result.exact
      );

      /* Add a small language badge next to the audio player label */
      if (player && lang !== 'en') {
        const label = player.querySelector('.ap-label');
        if (label && !label.querySelector('.voice-lang-badge')) {
          const badge = document.createElement('span');
          badge.className = 'voice-lang-badge';
          badge.textContent = LANG_LABEL[lang] || lang;
          label.appendChild(badge);
        }
      }
    })();

    /* ---------- Text chunking ---------- */
    function chunkText(text, max = 180) {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const chunks = [];
      let buf = '';
      for (const s of sentences) {
        if ((buf + ' ' + s).length > max && buf) {
          chunks.push(buf.trim());
          buf = s;
        } else {
          buf = buf ? buf + ' ' + s : s;
        }
      }
      if (buf) chunks.push(buf.trim());
      return chunks;
    }

    function buildQueue() {
      const topics = currentTopicId
        ? [document.getElementById(currentTopicId)]
        : Array.from(document.querySelectorAll('.topic'));
      queue = [];
      topics.filter(Boolean).forEach(t => {
        const title = (t.querySelector('h2')?.innerText || '').trim();
        const raw = t.innerText.replace(/🔊|📌/g, '').replace(/\s+/g, ' ').trim();
        chunkText(title + '. ' + raw, 180).forEach(c =>
          queue.push({ id: t.id, title, text: c }));
      });
      queueIdx = 0;
      console.log('[extras] audio queue built, chunks:', queue.length);
    }

    async function speakCurrent() {
      if (!Speech) return;
      if (queueIdx >= queue.length) { stopSpeaking(); return; }
      const item = queue[queueIdx];

      document.querySelectorAll('.topic .speaking')
        .forEach(el => el.classList.remove('speaking'));
      const el = document.getElementById(item.id);
      if (el) {
        el.classList.add('speaking');
        if (!currentTopicId) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      const utt = new SpeechSynthesisUtterance(item.text);
      if (currentVoice) {
        utt.voice = currentVoice;
        utt.lang = currentVoice.lang;
      } else {
        utt.lang = 'en-US';
      }
      utt.rate = parseFloat(document.getElementById('apSpeed')?.value || '1');
      utt.pitch = 1;
      utt.volume = 1;

      utt.onstart = () => {
        setPlayState(true);
        updateStatus(`Now reading: ${item.title}`);
        startKeepAlive();
      };
      utt.onend = () => {
        stopKeepAlive();
        queueIdx++;
        if (queueIdx < queue.length) speakCurrent();
        else stopSpeaking();
      };
      utt.onerror = (e) => {
        console.warn('[extras] speech error:', e.error);
        stopKeepAlive();
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        queueIdx++;
        if (queueIdx < queue.length) speakCurrent();
        else { updateStatus(`⚠️ Voice error: ${e.error || 'unknown'}`); stopSpeaking(); }
      };

      Speech.speak(utt);
    }

    function startKeepAlive() {
      stopKeepAlive();
      keepAliveTimer = setInterval(() => {
        if (Speech && Speech.speaking && !Speech.paused) {
          Speech.pause(); Speech.resume();
        }
      }, 12000);
    }
    function stopKeepAlive() {
      if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
    }
    function updateStatus(msg) {
      const s = player?.querySelector('.ap-status');
      if (s) s.textContent = msg;
    }
    function setPlayState(on) {
      const b = player?.querySelector('#apPlay');
      if (b) b.textContent = on ? '⏸' : '▶';
    }
    function stopSpeaking() {
      if (!Speech) return;
      try { Speech.cancel(); } catch (_) {}
      stopKeepAlive();
      isPaused = false;
      setPlayState(false);
      document.querySelectorAll('.topic .speaking')
        .forEach(el => el.classList.remove('speaking'));
      document.querySelectorAll('.listen-btn.playing')
        .forEach(b => b.classList.remove('playing'));
      updateStatus('Stopped');
      currentTopicId = null;
    }

    /* ---------- Bind controls ---------- */
    const apPlay = document.getElementById('apPlay');
    if (apPlay) {
      apPlay.addEventListener('click', async () => {
        if (!Speech) {
          updateStatus('⚠️ Speech not supported in this browser.');
          return;
        }
        if (Speech.speaking && !Speech.paused) {
          Speech.pause(); isPaused = true; setPlayState(false);
          updateStatus('Paused'); return;
        }
        if (isPaused) {
          Speech.resume(); isPaused = false; setPlayState(true);
          updateStatus('Resumed'); return;
        }
        if (!currentVoice) await pickVoice();
        buildQueue();
        if (!queue.length) { updateStatus('Nothing to read.'); return; }
        speakCurrent();
      });
    }

    document.getElementById('apStop')?.addEventListener('click', stopSpeaking);
    document.getElementById('apSpeed')?.addEventListener('change', () => {
      if (Speech && Speech.speaking) { Speech.cancel(); speakCurrent(); }
    });

    document.querySelectorAll('.listen-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!Speech) return;
        const topic = btn.closest('.topic');
        if (!topic) return;
        if (btn.classList.contains('playing')) { stopSpeaking(); return; }
        document.querySelectorAll('.listen-btn.playing')
          .forEach(b => b.classList.remove('playing'));
        btn.classList.add('playing');
        if (!currentVoice) await pickVoice();
        currentTopicId = topic.id;
        buildQueue();
        speakCurrent();
      });
    });

    console.log('[extras] all features initialised ✓');
  });
})();