/* =========================================================
   Designer's Toolbox + Concept Map — Data
   50 methods · 84 edges across 5 units
   Single source of truth for both views.
   ========================================================= */
window.TOOLBOX = {

  /* =========================================================
     METHODS — 50 total
     Fields:
       id          unique slug (used by edges + links)
       emoji       visual icon
       name        short display title
       unit        1–5
       stage       Empathize · Define · Ideate · Prototype · Test · Innovate
       section     "§ x.y"
       link        "unitX.html#x-y"
       useWhen     one-line "when to use"
       description 1–2 sentence explanation
       time        approximate minutes
       group       "Individual" · "Group" · "Either"
       inputs      [method ids]    — what feeds into it
       outputs     [method ids]    — what it feeds
     ========================================================= */
  methods: [

    /* ============ EMPATHIZE — Unit I ============ */
    {
      id:'observation', emoji:'🔍', name:'Observation',
      unit:1, stage:'Empathize', section:'§ 1.6', link:'unit1.html#1-6',
      useWhen:'You want raw, unbiased data about what people actually do.',
      description:'Watching users in their real environment without interfering — capturing actions, not opinions.',
      time:45, group:'Individual',
      inputs:[], outputs:['empathy-map','persona','journey-map']
    },
    {
      id:'interview', emoji:'🎤', name:'User Interview',
      unit:1, stage:'Empathize', section:'§ 1.9', link:'unit1.html#1-9',
      useWhen:'You need stories, motivations, and language directly from users.',
      description:'Open-ended conversation where the user talks more than you do. Focus on "Tell me about…" not yes/no.',
      time:60, group:'Either',
      inputs:[], outputs:['empathy-map','persona','journey-map','affinity-mapping']
    },
    {
      id:'contextual-inquiry', emoji:'🏠', name:'Contextual Inquiry',
      unit:1, stage:'Empathize', section:'§ 1.9', link:'unit1.html#1-9',
      useWhen:'You want to see how context (space, tools, other people) shapes behaviour.',
      description:'Observation + interview in the user\'s real environment — kitchen, classroom, shop.',
      time:90, group:'Either',
      inputs:[], outputs:['empathy-map','journey-map']
    },
    {
      id:'empathy-map', emoji:'🗺️', name:'Empathy Map',
      unit:1, stage:'Empathize', section:'§ 1.10', link:'unit1.html#1-10',
      useWhen:'You have interview notes and need to organise them into Says / Thinks / Does / Feels.',
      description:'A four-quadrant tool that captures the user\'s world — words, thoughts, actions, and emotions.',
      time:40, group:'Individual',
      inputs:['observation','interview','contextual-inquiry'],
      outputs:['persona','journey-map','affinity-mapping']
    },
    {
      id:'persona', emoji:'👤', name:'Persona',
      unit:1, stage:'Empathize', section:'§ 1.11', link:'unit1.html#1-11',
      useWhen:'You need to represent a user group so design decisions stay user-centered.',
      description:'A fictional but realistic character with a name, age, goal, and top frustrations.',
      time:45, group:'Individual',
      inputs:['observation','interview','empathy-map'],
      outputs:['journey-map','pov']
    },
    {
      id:'journey-map', emoji:'🛤️', name:'Journey Map',
      unit:1, stage:'Empathize', section:'§ 1.11', link:'unit1.html#1-11',
      useWhen:'You want to see where users feel worst during a product or service.',
      description:'A timeline of stages a user goes through, with what they do, think, and feel at each step.',
      time:60, group:'Either',
      inputs:['observation','interview','empathy-map','persona'],
      outputs:['problem-statement','affinity-mapping']
    },

    /* ============ DEFINE — Unit II ============ */
    {
      id:'affinity-mapping', emoji:'📊', name:'Affinity Mapping',
      unit:2, stage:'Define', section:'§ 2.1', link:'unit2.html#2-1',
      useWhen:'You have many observations and need to find patterns.',
      description:'Group similar research notes into themes; each theme becomes an insight.',
      time:45, group:'Group',
      inputs:['interview','observation','empathy-map','journey-map'],
      outputs:['problem-statement','pov']
    },
    {
      id:'problem-statement', emoji:'🎯', name:'Problem Statement',
      unit:2, stage:'Define', section:'§ 2.2', link:'unit2.html#2-2',
      useWhen:'You need one clear sentence: [User] needs [need] because [insight].',
      description:'A narrow, actionable framing of the real user problem — not the symptom.',
      time:30, group:'Either',
      inputs:['affinity-mapping','journey-map','5-whys','stakeholder-map'],
      outputs:['pov','5-whys','need-opportunity']
    },
    {
      id:'pov', emoji:'💬', name:'POV Statement',
      unit:2, stage:'Define', section:'§ 2.3', link:'unit2.html#2-3',
      useWhen:'You want to reframe the problem from the user\'s perspective.',
      description:'A Point-of-View sentence combining user, need, and surprising insight.',
      time:20, group:'Either',
      inputs:['problem-statement','persona'],
      outputs:['hmw']
    },
    {
      id:'hmw', emoji:'❓', name:'HMW Questions',
      unit:2, stage:'Define', section:'§ 2.3', link:'unit2.html#2-3',
      useWhen:'You need to open the problem into multiple ideation directions.',
      description:'"How Might We…?" questions that convert a POV into open-ended prompts.',
      time:25, group:'Either',
      inputs:['pov'],
      outputs:['brainstorming','brainwriting','scamper','mind-map','reverse-brainstorming']
    },
    {
      id:'stakeholder-map', emoji:'🌳', name:'Stakeholder Map',
      unit:2, stage:'Define', section:'§ 2.4', link:'unit2.html#2-4',
      useWhen:'You want to make sure no affected group is ignored.',
      description:'A 2×2 grid classifying people by influence and interest.',
      time:40, group:'Either',
      inputs:[], outputs:['problem-statement']
    },
    {
      id:'5-whys', emoji:'🔽', name:'5 Whys',
      unit:2, stage:'Define', section:'§ 2.4', link:'unit2.html#2-4',
      useWhen:'A problem keeps happening and you want the root, not a patch.',
      description:'Ask "Why?" five times to descend from symptom to root cause.',
      time:40, group:'Either',
      inputs:['problem-statement'],
      outputs:['root-cause','problem-statement']
    },
    {
      id:'root-cause', emoji:'🎯', name:'Root Cause',
      unit:2, stage:'Define', section:'§ 2.4', link:'unit2.html#2-4',
      useWhen:'You have asked enough "whys" and found the underlying cause.',
      description:'The fundamental reason the problem exists. Fixing it prevents recurrence.',
      time:15, group:'Individual',
      inputs:['5-whys'],
      outputs:['problem-statement']
    },
    {
      id:'need-opportunity', emoji:'📈', name:'Need-Opportunity Matrix',
      unit:2, stage:'Define', section:'§ 2.5', link:'unit2.html#2-5',
      useWhen:'You have multiple candidate problems and need to prioritize.',
      description:'A 2×2 grid sorting problems into Quick Wins, Big Bets, Fill-ins, or Avoid.',
      time:30, group:'Group',
      inputs:['problem-statement'],
      outputs:['problem-statement']
    },

    /* ============ IDEATE — Unit III ============ */
    {
      id:'brainstorming', emoji:'💭', name:'Brainstorming',
      unit:3, stage:'Ideate', section:'§ 3.2', link:'unit3.html#3-2',
      useWhen:'You need a large quantity of ideas fast.',
      description:'Group ideation with rules: no criticism, wild ideas welcome, build on others.',
      time:30, group:'Group',
      inputs:['hmw'], outputs:['impact-feasibility','mind-map']
    },
    {
      id:'brainwriting', emoji:'✍️', name:'Brainwriting',
      unit:3, stage:'Ideate', section:'§ 3.2', link:'unit3.html#3-2',
      useWhen:'Shyness or dominant voices are blocking idea flow.',
      description:'Ideas written silently then passed to others — removes groupthink.',
      time:30, group:'Group',
      inputs:['hmw'], outputs:['impact-feasibility']
    },
    {
      id:'scamper', emoji:'🎨', name:'SCAMPER',
      unit:3, stage:'Ideate', section:'§ 3.2', link:'unit3.html#3-2',
      useWhen:'You\'re stuck and need 7 fresh angles on an existing product.',
      description:'A checklist: Substitute · Combine · Adapt · Modify · Put · Eliminate · Reverse.',
      time:40, group:'Either',
      inputs:['hmw'], outputs:['impact-feasibility','decision-matrix']
    },
    {
      id:'mind-map', emoji:'🧠', name:'Mind Map',
      unit:3, stage:'Ideate', section:'§ 3.2', link:'unit3.html#3-2',
      useWhen:'You want to see visual connections between ideas.',
      description:'A central concept with radiating branches that reveals related thoughts.',
      time:25, group:'Individual',
      inputs:['brainstorming','hmw'], outputs:['impact-feasibility']
    },
    {
      id:'reverse-brainstorming', emoji:'🔄', name:'Reverse Brainstorming',
      unit:3, stage:'Ideate', section:'§ 3.3', link:'unit3.html#3-3',
      useWhen:'Direct brainstorming feels stuck or too obvious.',
      description:'Ask "How can we make the problem worse?" then reverse each answer.',
      time:30, group:'Group',
      inputs:['hmw'], outputs:['impact-feasibility']
    },
    {
      id:'analogical', emoji:'🌉', name:'Analogical Thinking',
      unit:3, stage:'Ideate', section:'§ 3.3', link:'unit3.html#3-3',
      useWhen:'You want to borrow solutions from unrelated fields.',
      description:'Find a similar problem in another domain and adapt its solution.',
      time:35, group:'Either',
      inputs:[], outputs:['biomimicry','impact-feasibility']
    },
    {
      id:'biomimicry', emoji:'🦋', name:'Biomimicry',
      unit:3, stage:'Ideate', section:'§ 3.3', link:'unit3.html#3-3',
      useWhen:'Nature might have already solved your problem.',
      description:'Copy strategies from plants and animals to design human solutions.',
      time:45, group:'Either',
      inputs:['analogical'], outputs:['impact-feasibility']
    },
    {
      id:'lateral', emoji:'↔️', name:'Lateral Thinking',
      unit:3, stage:'Ideate', section:'§ 3.4', link:'unit3.html#3-4',
      useWhen:'The obvious answer isn\'t working.',
      description:'Solve sideways instead of head-on — ignore the obvious path.',
      time:30, group:'Individual',
      inputs:[], outputs:['forced-connections','reverse-brainstorming']
    },
    {
      id:'forced-connections', emoji:'🔗', name:'Forced Connections',
      unit:3, stage:'Ideate', section:'§ 3.4', link:'unit3.html#3-4',
      useWhen:'You need unexpected combinations.',
      description:'Combine two unrelated things to spark a new idea.',
      time:25, group:'Either',
      inputs:['lateral'], outputs:['impact-feasibility']
    },
    {
      id:'morphological-analysis', emoji:'🧩', name:'Morphological Analysis',
      unit:3, stage:'Ideate', section:'§ 3.4', link:'unit3.html#3-4',
      useWhen:'You want to systematically explore combinations.',
      description:'Break the problem into parts, list options per part, recombine.',
      time:45, group:'Either',
      inputs:[], outputs:['impact-feasibility']
    },
    {
      id:'triz', emoji:'⚙️', name:'TRIZ',
      unit:3, stage:'Ideate', section:'§ 3.5', link:'unit3.html#3-5',
      useWhen:'Two requirements contradict each other.',
      description:'A method with 40 principles for resolving contradictions rather than accepting trade-offs.',
      time:50, group:'Either',
      inputs:[], outputs:['impact-feasibility']
    },
    {
      id:'ai-ideation', emoji:'🤖', name:'AI-Assisted Ideation',
      unit:3, stage:'Ideate', section:'§ 3.6', link:'unit3.html#3-6',
      useWhen:'You want 10× speed and many variations.',
      description:'Use AI tools to generate ideas fast, then evaluate with human judgment.',
      time:40, group:'Individual',
      inputs:[], outputs:['impact-feasibility']
    },
    {
      id:'impact-feasibility', emoji:'🎯', name:'Impact-Feasibility Matrix',
      unit:3, stage:'Ideate', section:'§ 3.7', link:'unit3.html#3-7',
      useWhen:'You have 20+ ideas and need to sort the best.',
      description:'A 2×2 grid: Quick Wins, Big Bets, Fill-ins, Avoid.',
      time:20, group:'Either',
      inputs:['brainstorming','scamper','brainwriting','mind-map','biomimicry','triz'],
      outputs:['decision-matrix']
    },
    {
      id:'decision-matrix', emoji:'📊', name:'Decision Matrix',
      unit:3, stage:'Ideate', section:'§ 3.8', link:'unit3.html#3-8',
      useWhen:'You need a defensible, weighted choice between top concepts.',
      description:'Weighted scoring table across criteria — cost, usability, safety.',
      time:30, group:'Group',
      inputs:['impact-feasibility'],
      outputs:['storyboard','paper-prototype']
    },

    /* ============ PROTOTYPE — Unit IV ============ */
    {
      id:'paper-prototype', emoji:'📝', name:'Paper Prototype',
      unit:4, stage:'Prototype', section:'§ 4.2', link:'unit4.html#4-2',
      useWhen:'You want the cheapest, fastest version to test an idea.',
      description:'Hand-drawn screens you can "click through" by hand.',
      time:45, group:'Either',
      inputs:['decision-matrix'], outputs:['user-testing']
    },
    {
      id:'storyboard', emoji:'🎬', name:'Storyboard',
      unit:4, stage:'Prototype', section:'§ 4.2', link:'unit4.html#4-2',
      useWhen:'You want to plan the user journey before building.',
      description:'A 4–6 panel comic strip showing how the user experiences the solution.',
      time:45, group:'Individual',
      inputs:['decision-matrix'], outputs:['digital-prototype','role-play']
    },
    {
      id:'physical-prototype', emoji:'📦', name:'Physical Prototype',
      unit:4, stage:'Prototype', section:'§ 4.1', link:'unit4.html#4-1',
      useWhen:'Your solution is a physical product.',
      description:'A 3D model built with cardboard, clay, or 3D printing.',
      time:90, group:'Group',
      inputs:['decision-matrix'], outputs:['user-testing']
    },
    {
      id:'digital-prototype', emoji:'💻', name:'Digital Prototype',
      unit:4, stage:'Prototype', section:'§ 4.3', link:'unit4.html#4-3',
      useWhen:'Your solution is an app or website.',
      description:'A clickable mock-up in Figma, Adobe XD, or Marvel.',
      time:90, group:'Either',
      inputs:['storyboard'], outputs:['user-testing']
    },
    {
      id:'role-play', emoji:'🎭', name:'Role-Play Prototype',
      unit:4, stage:'Prototype', section:'§ 4.3', link:'unit4.html#4-3',
      useWhen:'Your solution is a service or process.',
      description:'Team acts out the user experience to find friction points.',
      time:45, group:'Group',
      inputs:['storyboard'], outputs:['service-prototype']
    },
    {
      id:'service-prototype', emoji:'🏨', name:'Service Prototype',
      unit:4, stage:'Prototype', section:'§ 4.3', link:'unit4.html#4-3',
      useWhen:'The service is invisible and needs to be made tangible.',
      description:'Simulate the service with people and props — like a hotel check-in rehearsal.',
      time:60, group:'Group',
      inputs:['role-play'], outputs:['user-testing']
    },
    {
      id:'low-fidelity', emoji:'⚡', name:'Low-Fidelity Prototype',
      unit:4, stage:'Prototype', section:'§ 4.4', link:'unit4.html#4-4',
      useWhen:'Testing concepts before investing in polish.',
      description:'Rough, cheap, quick — usually paper or simple mock-up.',
      time:45, group:'Either',
      inputs:['paper-prototype'], outputs:['user-testing']
    },
    {
      id:'high-fidelity', emoji:'✨', name:'High-Fidelity Prototype',
      unit:4, stage:'Prototype', section:'§ 4.4', link:'unit4.html#4-4',
      useWhen:'The concept has survived testing and needs a realistic version.',
      description:'A close-to-final mock-up with realistic visuals and interactions.',
      time:120, group:'Either',
      inputs:['digital-prototype'], outputs:['user-testing']
    },
    {
      id:'rapid-prototyping', emoji:'🚀', name:'Rapid Prototyping',
      unit:4, stage:'Prototype', section:'§ 4.4', link:'unit4.html#4-4',
      useWhen:'You want to test many versions quickly.',
      description:'Build and test several iterations in short cycles.',
      time:60, group:'Group',
      inputs:['low-fidelity','high-fidelity'], outputs:['mvp']
    },
    {
      id:'mvp', emoji:'⚡', name:'Minimum Viable Prototype',
      unit:4, stage:'Prototype', section:'§ 4.5', link:'unit4.html#4-5',
      useWhen:'You need to test the riskiest assumption at the lowest cost.',
      description:'The smallest version that answers one key question — like Dropbox\'s demo video.',
      time:60, group:'Group',
      inputs:['rapid-prototyping'], outputs:['user-testing','dfv']
    },

    /* ============ TEST — Unit IV ============ */
    {
      id:'user-testing', emoji:'👥', name:'User Testing',
      unit:4, stage:'Test', section:'§ 4.7', link:'unit4.html#4-7',
      useWhen:'You have a prototype and real users to watch.',
      description:'Give the prototype to users, watch them use it silently, record their struggles.',
      time:60, group:'Group',
      inputs:['paper-prototype','digital-prototype','physical-prototype','low-fidelity','high-fidelity','mvp'],
      outputs:['feedback-collection','think-aloud','dfv']
    },
    {
      id:'think-aloud', emoji:'🗣️', name:'Think-Aloud',
      unit:4, stage:'Test', section:'§ 4.7', link:'unit4.html#4-7',
      useWhen:'You want to know where users get stuck, not just that they get stuck.',
      description:'Users speak their thoughts while using the prototype.',
      time:30, group:'Individual',
      inputs:['user-testing'], outputs:['feedback-collection']
    },
    {
      id:'feedback-collection', emoji:'📝', name:'Feedback Collection',
      unit:4, stage:'Test', section:'§ 4.7', link:'unit4.html#4-7',
      useWhen:'You have raw test notes and need them structured.',
      description:'Convert observations into themes with severity ratings and recommendations.',
      time:30, group:'Individual',
      inputs:['user-testing','think-aloud'], outputs:['iteration-log','prototype']
    },
    {
      id:'iteration-log', emoji:'📓', name:'Iteration Log',
      unit:4, stage:'Test', section:'§ 4.9', link:'unit4.html#4-9',
      useWhen:'You are about to change the prototype.',
      description:'Records every version: what changed, why, and what happened after.',
      time:20, group:'Individual',
      inputs:['feedback-collection','design-critique'], outputs:['prototype']
    },
    {
      id:'design-critique', emoji:'🎯', name:'Design Critique',
      unit:4, stage:'Test', section:'§ 4.9', link:'unit4.html#4-9',
      useWhen:'You want structured peer feedback on the design.',
      description:'A session answering: what works, what doesn\'t, what could improve.',
      time:40, group:'Group',
      inputs:['prototype'], outputs:['iteration-log']
    },
    {
      id:'cad-simulation', emoji:'🖥️', name:'CAD & Simulation',
      unit:4, stage:'Test', section:'§ 4.10', link:'unit4.html#4-10',
      useWhen:'You want to test stress, airflow, or fit virtually before building.',
      description:'Computer-Aided Design + simulation tools — Tesla uses this to avoid physical crash tests.',
      time:90, group:'Individual',
      inputs:['physical-prototype'], outputs:['prototype']
    },

    /* ============ INNOVATE — Unit V ============ */
    {
      id:'dfv', emoji:'💎', name:'DFV Check',
      unit:5, stage:'Innovate', section:'§ 5.5', link:'unit5.html#5-5',
      useWhen:'You need to test that an idea is Desirable, Feasible, and Viable.',
      description:'The three-lens sanity check that filters out ideas missing one of the three.',
      time:30, group:'Group',
      inputs:['user-testing','mvp'], outputs:['vpc']
    },
    {
      id:'vpc', emoji:'🎯', name:'Value Proposition Canvas',
      unit:5, stage:'Innovate', section:'§ 5.5', link:'unit5.html#5-5',
      useWhen:'You need to articulate why customers will choose your product.',
      description:'Two sides — Customer Profile (Jobs, Pains, Gains) and Value Map (Products, Relievers, Creators).',
      time:50, group:'Group',
      inputs:['dfv'], outputs:['bmc','pitch']
    },
    {
      id:'bmc', emoji:'📋', name:'Business Model Canvas',
      unit:5, stage:'Innovate', section:'§ 5.6', link:'unit5.html#5-6',
      useWhen:'You need to describe how the venture creates and captures value.',
      description:'A 9-block canvas covering customers, value, channels, revenue, and cost.',
      time:60, group:'Group',
      inputs:['vpc'], outputs:['ipr-check','pitch']
    },
    {
      id:'ipr-check', emoji:'©️', name:'IPR Check',
      unit:5, stage:'Innovate', section:'§ 5.8', link:'unit5.html#5-8',
      useWhen:'You are about to share your idea publicly.',
      description:'Identify which elements need Patents, Trademarks, Copyright, or Design protection.',
      time:30, group:'Individual',
      inputs:['bmc'], outputs:['pitch']
    },
    {
      id:'responsible-innovation', emoji:'🤝', name:'Responsible Innovation',
      unit:5, stage:'Innovate', section:'§ 5.9', link:'unit5.html#5-9',
      useWhen:'You want your innovation to be ethical, inclusive, and sustainable.',
      description:'A lens that asks: who benefits, who could be harmed, and what about the environment.',
      time:25, group:'Group',
      inputs:[], outputs:['pitch']
    },
    {
      id:'pitch', emoji:'🎤', name:'Innovation Pitch',
      unit:5, stage:'Innovate', section:'§ 5.10', link:'unit5.html#5-10',
      useWhen:'You are presenting the innovation to stakeholders, professors, or investors.',
      description:'A 3-minute structured pitch: Problem · Solution · Market · Model · Team · Ask.',
      time:90, group:'Group',
      inputs:['vpc','bmc','ipr-check','responsible-innovation'],
      outputs:[]
    }
  ],

  /* =========================================================
     EDGES — 84 relationships
     Fields:
       from, to    method ids
       label       'feeds into' | 'uses' | 'informs' | 'validates' | 'converts to'
     ========================================================= */
  edges: [

    /* ---- Empathize internal ---- */
    { from:'observation',          to:'empathy-map',            label:'informs' },
    { from:'interview',            to:'empathy-map',            label:'informs' },
    { from:'contextual-inquiry',   to:'empathy-map',            label:'informs' },
    { from:'observation',          to:'persona',                label:'informs' },
    { from:'interview',            to:'persona',                label:'informs' },
    { from:'interview',            to:'journey-map',            label:'informs' },
    { from:'contextual-inquiry',   to:'journey-map',            label:'informs' },
    { from:'empathy-map',          to:'persona',                label:'feeds into' },
    { from:'empathy-map',          to:'journey-map',            label:'feeds into' },
    { from:'persona',              to:'journey-map',            label:'feeds into' },

    /* ---- Empathize → Define ---- */
    { from:'interview',            to:'affinity-mapping',       label:'informs' },
    { from:'observation',          to:'affinity-mapping',       label:'informs' },
    { from:'empathy-map',          to:'affinity-mapping',       label:'informs' },
    { from:'journey-map',          to:'affinity-mapping',       label:'informs' },
    { from:'affinity-mapping',     to:'problem-statement',      label:'feeds into' },
    { from:'affinity-mapping',     to:'pov',                    label:'feeds into' },
    { from:'journey-map',          to:'problem-statement',      label:'informs' },
    { from:'persona',              to:'pov',                    label:'informs' },

    /* ---- Define internal ---- */
    { from:'problem-statement',    to:'pov',                    label:'converts to' },
    { from:'pov',                  to:'hmw',                    label:'converts to' },
    { from:'problem-statement',    to:'5-whys',                 label:'feeds into' },
    { from:'5-whys',               to:'root-cause',             label:'feeds into' },
    { from:'root-cause',           to:'problem-statement',      label:'informs' },
    { from:'stakeholder-map',      to:'problem-statement',      label:'informs' },
    { from:'problem-statement',    to:'need-opportunity',       label:'feeds into' },
    { from:'need-opportunity',     to:'problem-statement',      label:'informs' },

    /* ---- Define → Ideate ---- */
    { from:'hmw',                  to:'brainstorming',          label:'starts' },
    { from:'hmw',                  to:'brainwriting',           label:'starts' },
    { from:'hmw',                  to:'scamper',                label:'starts' },
    { from:'hmw',                  to:'mind-map',               label:'starts' },
    { from:'hmw',                  to:'reverse-brainstorming',  label:'starts' },

    /* ---- Ideate internal ---- */
    { from:'brainstorming',        to:'scamper',                label:'uses' },
    { from:'brainstorming',        to:'mind-map',               label:'uses' },
    { from:'brainstorming',        to:'brainwriting',           label:'variant' },
    { from:'brainstorming',        to:'reverse-brainstorming',  label:'variant' },
    { from:'scamper',              to:'forced-connections',     label:'uses' },
    { from:'scamper',              to:'morphological-analysis', label:'uses' },
    { from:'analogical',           to:'biomimicry',             label:'feeds into' },
    { from:'lateral',              to:'reverse-brainstorming',  label:'variant' },
    { from:'lateral',              to:'forced-connections',     label:'uses' },
    { from:'triz',                 to:'morphological-analysis', label:'uses' },
    { from:'ai-ideation',          to:'brainstorming',          label:'augments' },

    /* ---- Ideate convergence ---- */
    { from:'brainstorming',        to:'impact-feasibility',     label:'feeds into' },
    { from:'brainwriting',         to:'impact-feasibility',     label:'feeds into' },
    { from:'scamper',              to:'impact-feasibility',     label:'feeds into' },
    { from:'mind-map',             to:'impact-feasibility',     label:'feeds into' },
    { from:'biomimicry',           to:'impact-feasibility',     label:'feeds into' },
    { from:'triz',                 to:'impact-feasibility',     label:'feeds into' },
    { from:'morphological-analysis',to:'impact-feasibility',    label:'feeds into' },
    { from:'forced-connections',   to:'impact-feasibility',     label:'feeds into' },
    { from:'impact-feasibility',   to:'decision-matrix',        label:'feeds into' },

    /* ---- Ideate → Prototype ---- */
    { from:'decision-matrix',      to:'storyboard',             label:'selects for' },
    { from:'decision-matrix',      to:'paper-prototype',        label:'selects for' },
    { from:'decision-matrix',      to:'physical-prototype',     label:'selects for' },
    { from:'storyboard',           to:'digital-prototype',      label:'feeds into' },
    { from:'storyboard',           to:'role-play',              label:'feeds into' },
    { from:'role-play',            to:'service-prototype',      label:'feeds into' },

    /* ---- Prototype internal ---- */
    { from:'paper-prototype',      to:'low-fidelity',           label:'is a' },
    { from:'physical-prototype',   to:'low-fidelity',           label:'is a' },
    { from:'digital-prototype',    to:'high-fidelity',          label:'is a' },
    { from:'low-fidelity',         to:'rapid-prototyping',      label:'feeds into' },
    { from:'high-fidelity',        to:'rapid-prototyping',      label:'feeds into' },
    { from:'rapid-prototyping',    to:'mvp',                    label:'feeds into' },

    /* ---- Prototype → Test ---- */
    { from:'paper-prototype',      to:'user-testing',           label:'tested by' },
    { from:'physical-prototype',   to:'user-testing',           label:'tested by' },
    { from:'digital-prototype',    to:'user-testing',           label:'tested by' },
    { from:'low-fidelity',         to:'user-testing',           label:'tested by' },
    { from:'high-fidelity',        to:'user-testing',           label:'tested by' },
    { from:'service-prototype',    to:'user-testing',           label:'tested by' },
    { from:'mvp',                  to:'user-testing',           label:'tested by' },

    /* ---- Test internal ---- */
    { from:'user-testing',         to:'think-aloud',            label:'uses' },
    { from:'user-testing',         to:'feedback-collection',    label:'feeds into' },
    { from:'think-aloud',          to:'feedback-collection',    label:'feeds into' },
    { from:'feedback-collection',  to:'iteration-log',          label:'feeds into' },
    { from:'design-critique',      to:'iteration-log',          label:'feeds into' },
    { from:'iteration-log',        to:'prototype',              label:'improves' },
    { from:'cad-simulation',       to:'prototype',              label:'validates' },
    { from:'feedback-collection',  to:'prototype',              label:'improves' },
    { from:'mvp',                  to:'dfv',                    label:'validated by' },

    /* ---- Test → Innovate ---- */
    { from:'user-testing',         to:'dfv',                    label:'validates' },
    { from:'dfv',                  to:'vpc',                    label:'feeds into' },
    { from:'vpc',                  to:'bmc',                    label:'feeds into' },
    { from:'vpc',                  to:'pitch',                  label:'informs' },
    { from:'bmc',                  to:'ipr-check',              label:'feeds into' },
    { from:'bmc',                  to:'pitch',                  label:'informs' },
    { from:'ipr-check',            to:'pitch',                  label:'informs' },
    { from:'responsible-innovation',to:'pitch',                 label:'frames' }
  ],

  stages: [
    { id:'Empathize', color:'#2563EB', emoji:'❤️' },
    { id:'Define',    color:'#0D9488', emoji:'🎯' },
    { id:'Ideate',    color:'#D97706', emoji:'🎨' },
    { id:'Prototype', color:'#7C3AED', emoji:'🧪' },
    { id:'Test',      color:'#E11D48', emoji:'👥' },
    { id:'Innovate',  color:'#059669', emoji:'💡' }
  ],

  /* =========================================================
     CURATED WALKTHROUGH PATHS
     5 journeys covering the common use cases.
     ========================================================= */
  paths: [
    { id:'full', emoji:'🌟', name:'Full journey', steps:[
      'observation','interview','empathy-map','persona','journey-map',
      'affinity-mapping','problem-statement','pov','hmw',
      'brainstorming','scamper','impact-feasibility','decision-matrix',
      'storyboard','digital-prototype','user-testing','feedback-collection',
      'iteration-log','mvp','dfv','vpc','pitch'
    ]},
    { id:'sprint', emoji:'⚡', name:'Fast innovation sprint', steps:[
      'problem-statement','hmw','brainstorming','decision-matrix',
      'paper-prototype','user-testing','feedback-collection','mvp','vpc','pitch'
    ]},
    { id:'research', emoji:'🔍', name:'Deep research path', steps:[
      'observation','interview','contextual-inquiry','empathy-map',
      'persona','journey-map','affinity-mapping','problem-statement'
    ]},
    { id:'ideation', emoji:'🎨', name:'Ideation blast', steps:[
      'problem-statement','hmw','brainstorming','brainwriting','scamper',
      'mind-map','biomimicry','triz','impact-feasibility'
    ]},
    { id:'prototype', emoji:'🏆', name:'Prototype to pitch', steps:[
      'decision-matrix','storyboard','digital-prototype','user-testing',
      'feedback-collection','iteration-log','mvp','dfv','vpc','bmc','ipr-check','pitch'
    ]}
  ]
};

/* Quick sanity log — remove later if you prefer silence */
(function(){
  if (window.console && window.TOOLBOX){
    var m = window.TOOLBOX.methods.length;
    var e = window.TOOLBOX.edges.length;
    console.log('[toolbox-data] loaded:', m, 'methods ·', e, 'edges');
  }
})();