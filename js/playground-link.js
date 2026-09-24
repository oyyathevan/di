/* =========================================================
   PLAYGROUND LINK — adds "Open in Playground" buttons
   Runs only on practical-u1..u5.html
   ========================================================= */
(function(){
  'use strict';

  var PATH = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!/^practical-u[1-5]\.html?$/.test(PATH)) return;

  /* Map activity IDs → playground tool IDs */
  var MAP = {
    '1-3': 'empathy-map',
    '1-4': 'persona',
    '1-5': 'journey',
    '2-1': 'affinity',
    '2-4': 'stakeholder',
    '2-5': '5whys',
    '3-2': 'scamper',
    '3-6': 'decision',
    '3-7': 'impact',
    '5-3': 'vpc-bmc',
    '5-5': 'vpc-bmc'
  };

  function init(){
    var activities = document.querySelectorAll('.activity');
    if (!activities.length) return;

    activities.forEach(function(activity){
      var id = activity.dataset.activityId;
      var toolId = MAP[id];
      if (!toolId) return;

      var actions = activity.querySelector('.activity-actions');
      if (!actions) return;
      if (actions.querySelector('.playground-link')) return;

      var btn = document.createElement('a');
      btn.className = 'playground-link';
      btn.href = 'playground.html#' + toolId;
      btn.textContent = '🛠 Open in Playground';
      btn.style.cssText =
        'display:inline-flex;align-items:center;gap:6px;padding:9px 16px;' +
        'border-radius:8px;border:1px solid #D97706;background:#FEF3C7;' +
        'color:#78350F;font-size:.82rem;font-weight:700;text-decoration:none;' +
        'margin-left:8px;transition:.15s';
      btn.addEventListener('mouseenter', function(){
        btn.style.background = '#FDE68A';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.background = '#FEF3C7';
      });

      actions.appendChild(btn);
    });

    console.log('[playground-link] added buttons:', document.querySelectorAll('.playground-link').length);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
  else
    init();
})();