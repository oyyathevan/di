/* =========================================================
   DTI Notes — Studio Mode
   Guided project playbook with auto-save + report
   ========================================================= */
(function(){
  'use strict';

  const PREFIX = 'dti-studio:';
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  /* ---------- Load saved problem ---------- */
  const problemInput = $('#studioProblem');
  if (problemInput) {
    problemInput.value = localStorage.getItem(PREFIX+'problem') || '';
    problemInput.addEventListener('input', () => {
      localStorage.setItem(PREFIX+'problem', problemInput.value);
    });
  }

  /* ---------- Restore all textarea/input values ---------- */
  $$('.studio-step').forEach(step => {
    const id = step.dataset.id;
    const field = step.querySelector('textarea, input[type="text"]');
    if (field) {
      const saved = localStorage.getItem(PREFIX+id);
      if (saved) field.value = saved;
      field.addEventListener('input', () => {
        localStorage.setItem(PREFIX+id, field.value);
        updateStepCompletion(step);
        updateProgress();
      });
    }
    const check = step.querySelector('.studio-step-check');
    if (check) {
      check.addEventListener('click', () => {
        step.classList.toggle('completed');
        updateProgress();
      });
    }
  });

  /* ---------- A step counts as completed if field has content ---------- */
  function updateStepCompletion(step){
    const field = step.querySelector('textarea, input[type="text"]');
    if (field && field.value.trim().length > 0) {
      step.classList.add('completed');
    } else {
      step.classList.remove('completed');
    }
  }

  /* ---------- Progress bar + stage tab states ---------- */
  function updateProgress(){
    const allSteps = $$('.studio-step');
    const doneSteps = allSteps.filter(s => {
      if (s.classList.contains('completed')) return true;
      const f = s.querySelector('textarea, input[type="text"]');
      return f && f.value.trim().length > 0;
    });
    const pct = allSteps.length
      ? Math.round((doneSteps.length / allSteps.length) * 100)
      : 0;
    const fill = $('#studioBar');
    const lbl  = $('#studioBarLabel');
    if (fill) fill.style.width = pct + '%';
    if (lbl)  lbl.textContent = `${doneSteps.length} / ${allSteps.length} steps · ${pct}%`;

    // Stage tab done state
    $$('.studio-panel').forEach(panel => {
      const stageId = panel.dataset.stage;
      const steps = $$('.studio-step', panel);
      const done  = steps.filter(s => {
        if (s.classList.contains('completed')) return true;
        const f = s.querySelector('textarea, input[type="text"]');
        return f && f.value.trim().length > 0;
      }).length;
      const tab = $(`.studio-stage-tab[data-stage="${stageId}"]`);
      if (tab) {
        if (done === steps.length && steps.length > 0) tab.classList.add('done');
        else tab.classList.remove('done');
      }
    });
  }

  /* ---------- Stage tab switching ---------- */
  const tabs   = $$('.studio-stage-tab');
  const panels = $$('.studio-panel');

  function showStage(id){
    tabs.forEach(t => t.classList.toggle('active', t.dataset.stage === id));
    panels.forEach(p => p.classList.toggle('active', p.dataset.stage === id));
    // Scroll to top of studio area smoothly
    const wrap = $('.studio-wrap');
    if (wrap) window.scrollTo({ top: wrap.offsetTop - 80, behavior: 'smooth' });
  }
  tabs.forEach(tab => tab.addEventListener('click', () => showStage(tab.dataset.stage)));

  /* ---------- Prev / Next stage buttons ---------- */
  const stageOrder = tabs.map(t => t.dataset.stage);
  $$('.studio-stage-nav button[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.closest('.studio-panel');
      const cur   = panel.dataset.stage;
      const i     = stageOrder.indexOf(cur);
      const next  = btn.dataset.dir === 'next' ? i + 1 : i - 1;
      if (next >= 0 && next < stageOrder.length) showStage(stageOrder[next]);
    });
  });

  /* ---------- Report generation ---------- */
  const reportBtn = $('#generateReport');
  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      const problem = localStorage.getItem(PREFIX+'problem') || '(not set)';
      const name = localStorage.getItem(PREFIX+'name') || '';
      const roll = localStorage.getItem(PREFIX+'roll') || '';
      let html = `
        <h1>🎨 Design Project Report</h1>
        <p class="report-meta">
          ${name ? `<b>${name}</b> · ` : ''}${roll ? `${roll} · ` : ''}
          Generated on ${new Date().toLocaleString()}
        </p>
        <h2>🧭 Problem Statement</h2>
        <div class="report-answer${problem==='(not set)'?' empty':''}">${escapeHtml(problem)}</div>
      `;
      const stages = $$('.studio-panel');
      stages.forEach(panel => {
        const stageTitle = panel.querySelector('.studio-stage-intro h2')?.innerText || panel.dataset.stage;
        html += `<h2>${stageTitle}</h2>`;
        const steps = $$('.studio-step', panel);
        steps.forEach(step => {
          const id = step.dataset.id;
          const title = step.querySelector('.studio-step-title')?.innerText.replace(/\s+/g,' ').trim() || id;
          const val = localStorage.getItem(PREFIX+id) || '';
          html += `<div style="margin-bottom:14px">
            <div style="font-weight:600;font-size:.88rem;margin-bottom:4px;color:#7C3AED">${title}</div>
            <div class="report-answer${val.trim()?'':' empty'}">${val.trim()?escapeHtml(val):'(no answer yet)'}</div>
          </div>`;
        });
      });
      html += `
        <div class="report-actions">
          <button class="primary" onclick="window.print()">🖨 Print / Save PDF</button>
          <button onclick="copyReport()">📋 Copy as text</button>
          <button onclick="document.getElementById('studioReport').classList.remove('open')">Close</button>
        </div>
      `;
      const box = $('#studioReport');
      box.innerHTML = html;
      box.classList.add('open');
      box.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[c]);
  }
  window.copyReport = function(){
    const text = $('#studioReport').innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert('Report copied to clipboard.');
    });
  };

  /* ---------- Optional name/roll ---------- */
  const nameField = $('#studioName');
  const rollField = $('#studioRoll');
  if (nameField) {
    nameField.value = localStorage.getItem(PREFIX+'name') || '';
    nameField.addEventListener('input', () =>
      localStorage.setItem(PREFIX+'name', nameField.value));
  }
  if (rollField) {
    rollField.value = localStorage.getItem(PREFIX+'roll') || '';
    rollField.addEventListener('input', () =>
      localStorage.setItem(PREFIX+'roll', rollField.value));
  }

  /* ---------- Reset ---------- */
  const resetBtn = $('#studioReset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('Clear all Studio answers? This cannot be undone.')) return;
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
      location.reload();
    });
  }

  /* ---------- Init ---------- */
  updateProgress();
})();