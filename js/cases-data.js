/* =========================================================
   CASE STUDY LIBRARY — 40 real-world cases
   Fields:
     id, emoji, company, region, category, era, units,
     problem, approach (array), outcome (array),
     lessons (array), methods (array of toolbox method ids)
   ========================================================= */
window.CASES_DATA = [

  /* ============ DESIGN THINKING (5) ============ */
  {
    id:'ideo-shopping-cart', emoji:'🛒', company:'IDEO Shopping Cart',
    region:'Global', category:'Design Thinking', era:'Classic', units:[1,2,4],
    problem:'In 1999, ABC Nightline challenged IDEO to redesign the shopping cart — a product that had barely changed in 60 years — in just 5 days.',
    approach:[
      'Sent a team to observe real shoppers in stores for hours',
      'Interviewed a shopping-cart repairman to learn every failure mode',
      'Ran brainstorming with no-criticism rules — 100+ ideas in 1 hour',
      'Built 4 working prototypes overnight, each with a distinct approach',
      'Tested with real shoppers, then refined the winner'
    ],
    outcome:[
      'The redesigned cart became a case study taught worldwide',
      'Showcased how a 5-day sprint can produce breakthrough ideas',
      'Turned Design Thinking into a mainstream business language'
    ],
    lessons:[
      'Observation beats assumption — the repairman knew more than any survey',
      'Quantity of prototypes beats perfection of the first one',
      'Deep empathy is what makes ideas land with real users'
    ],
    methods:['observation','interview','empathy-map','brainstorming','rapid-prototyping']
  },
  {
    id:'airbnb', emoji:'🏠', company:'Airbnb',
    region:'Global', category:'Design Thinking', era:'Modern', units:[1,2,4,5],
    problem:'In 2008, Airbnb was failing. Few bookings. The founders couldn\'t understand why — the tech worked fine.',
    approach:[
      'Travelled to New York to meet hosts face-to-face',
      'Stayed in their homes, watched how they took listing photos',
      'Ran affinity mapping on host interviews — one theme emerged: photos',
      'Hired professional photographers for early listings',
      'Rebuilt onboarding around a persona called "Maria"'
    ],
    outcome:[
      'Bookings doubled in a month',
      'Airbnb became one of the largest hospitality companies on Earth',
      'Their empathy-driven redesign is now a textbook case'
    ],
    lessons:[
      'Empathy work beats analytics when the numbers look fine but growth doesn\'t come',
      'A single insight (photos drive bookings) can be worth billions',
      'Design Thinking scales — the same process that fixed a struggling startup runs at IPO stage'
    ],
    methods:['interview','affinity-mapping','empathy-map','persona']
  },
  {
    id:'stanford-dschool', emoji:'🎓', company:'Stanford d.school',
    region:'Global', category:'Design Thinking', era:'Classic', units:[1,3],
    problem:'In 2005, engineering education taught analysis but not creativity. Stanford wanted to create designers of solutions, not just problem-solvers.',
    approach:[
      'Founded the Hasso Plattner Institute of Design (d.school)',
      'Codified Design Thinking as five stages: Empathize → Define → Ideate → Prototype → Test',
      'Made every class a hands-on studio, not a lecture',
      'Invited students from engineering, medicine, business, law into the same room'
    ],
    outcome:[
      'The 5-stage model became the standard globally',
      'd.school graduates now lead design at Apple, Google, IDEO, and hundreds of startups',
      'Cross-disciplinary teams became the norm in design education'
    ],
    lessons:[
      'A framework is more useful than a theory — students can act on it',
      'Radical collaboration (mixed backgrounds) produces better ideas',
      'Naming the mindset matters — "Design Thinking" became a movement'
    ],
    methods:['brainstorming','rapid-prototyping','user-testing']
  },
  {
    id:'ibm-design', emoji:'💼', company:'IBM Design Program',
    region:'Global', category:'Design Thinking', era:'Modern', units:[5],
    problem:'By 2012, IBM\'s software felt outdated. Engineering-led decisions were producing products that users avoided. The company needed a cultural reset.',
    approach:[
      'Hired 1,000+ designers in 3 years',
      'Standardised on Design Thinking as the company-wide method',
      'Built IBM Design Studios where engineers, designers, and PMs worked in the same room',
      'Trained every employee on DT basics — not just designers'
    ],
    outcome:[
      'Software NPS scores improved dramatically',
      'IBM products like Watson were rebuilt around user research',
      'Became one of the largest corporate Design Thinking rollouts in history'
    ],
    lessons:[
      'Design Thinking works at enterprise scale — not just startups',
      'Leadership commitment is essential — a program without a sponsor fails',
      'Training non-designers is what turns a method into a culture'
    ],
    methods:['interview','rapid-prototyping','design-critique']
  },
  {
    id:'kaiser-permanente', emoji:'🏥', company:'Kaiser Permanente',
    region:'Global', category:'Design Thinking', era:'Modern', units:[1,2],
    problem:'Hospital nurses were spending more time finding supplies than caring for patients. Turnover was high, and morale was low.',
    approach:[
      'Partnered with IDEO to run nurse-shadowing research',
      'Observed over 100 shift changes across multiple hospitals',
      'Identified that supplies were stored chaotically, causing wasted minutes every shift',
      'Co-designed with nurses, not for them'
    ],
    outcome:[
      'Reduced time-to-supply by over 50% in pilot units',
      'Nurse satisfaction improved measurably',
      'Model rolled out across dozens of hospitals'
    ],
    lessons:[
      'Empathy work in operational environments reveals waste nobody noticed',
      'Co-designing with the people affected produces lasting change',
      'Small friction, multiplied across thousands of shifts, is enormous waste'
    ],
    methods:['observation','contextual-inquiry','co-design','user-testing']
  },

  /* ============ INNOVATION — GLOBAL (8) ============ */
  {
    id:'iphone', emoji:'📱', company:'Apple iPhone',
    region:'Global', category:'Innovation', era:'Modern', units:[1,3,4,5],
    problem:'In 2006, phones had tiny keyboards and separate MP3 players. Users carried 3–4 devices. Nobody liked the clutter.',
    approach:[
      'Reframed the problem: "one device for everything"',
      'Prototyped touchscreens for 2 years before launch',
      'Built a secret team of 1,000 people under NDA',
      'Tested prototypes internally with employees before revealing'
    ],
    outcome:[
      '6.1 million units sold in year 1',
      'Killed the iPod, Walkman, and compact camera markets',
      'Sparked the entire smartphone era'
    ],
    lessons:[
      'Reframing beats improving',
      'Prototype early, launch late',
      'Integration can be more innovative than invention'
    ],
    methods:['reframing','rapid-prototyping','user-testing']
  },
  {
    id:'netflix-streaming', emoji:'🎬', company:'Netflix',
    region:'Global', category:'Innovation', era:'Modern', units:[5],
    problem:'Netflix started as a mail-order DVD service. By 2007, broadband made streaming possible — but the business model was DVD.',
    approach:[
      'Recognised technology shift early — streaming would kill DVDs',
      'Invested in streaming infrastructure before it was profitable',
      'Reframed the value prop: "Watch anywhere, no ads, cancel anytime"',
      'Pivoted the whole company to streaming, even at the cost of short-term revenue'
    ],
    outcome:[
      'Streaming became the dominant model by 2012',
      'Netflix produced original content, becoming a studio',
      'DVD business was shut down entirely by 2023'
    ],
    lessons:[
      'Disrupt yourself before someone else does',
      'Business model innovation can beat product innovation',
      'Long-term vision beats short-term metrics'
    ],
    methods:['reframing','vpc','bmc']
  },
  {
    id:'spotify', emoji:'🎵', company:'Spotify',
    region:'Global', category:'Innovation', era:'Modern', units:[5],
    problem:'Piracy was killing the music industry. iTunes sold songs for 99¢, but users wanted access, not ownership.',
    approach:[
      'Reframed the business model: subscription streaming, not per-song sales',
      'Built two customer segments — free (ad-supported) and premium',
      'Licensed music from labels with a disruptive revenue-share model',
      'Invested in personalisation (Discover Weekly) to keep users'
    ],
    outcome:[
      '100M+ paying subscribers by 2024',
      'Became the world\'s largest music streaming service',
      'Influenced every media industry — video, audiobooks, podcasts'
    ],
    lessons:[
      'Access beats ownership for digital goods',
      'Two-sided models can serve free and paying users together',
      'Personalisation is a retention weapon'
    ],
    methods:['bmc','vpc','reframing']
  },
  {
    id:'uber', emoji:'🚕', company:'Uber',
    region:'Global', category:'Disruption', era:'Modern', units:[5],
    problem:'Taxi systems were opaque — no fixed pricing, no tracking, cash-only, poor user trust.',
    approach:[
      'Reframed the service: not "better taxis" but "make the taxi experience disappear"',
      'No fleet ownership — drivers are independent contractors',
      'Dynamic pricing, cashless payments, live tracking',
      'Two-sided marketplace — riders and drivers grow together'
    ],
    outcome:[
      'Disrupted taxi markets across 70+ countries',
      'Inspired a wave of two-sided marketplaces (Ola, Grab, Bolt)',
      'Regulatory and labour debates still ongoing'
    ],
    lessons:[
      'Disruption replaces the rules, not the product',
      'Two-sided marketplaces require solving both sides at once',
      'Business model innovation can disrupt faster than product innovation'
    ],
    methods:['reframing','bmc','dfv']
  },
  {
    id:'tesla', emoji:'🚗', company:'Tesla',
    region:'Global', category:'Innovation', era:'Modern', units:[4,5],
    problem:'Electric cars in 2005 were slow, ugly, and low-range. The industry assumed EVs would always be niche.',
    approach:[
      'Reframed the EV as a premium desirable object, not a compromise',
      'Simulated crash tests and aerodynamics in software before building',
      'Built the Supercharger network — solved range anxiety with infrastructure',
      'Went direct-to-consumer instead of using dealerships'
    ],
    outcome:[
      'Tesla became the most valuable car company by 2020',
      'Forced every major automaker to accelerate EV plans',
      'Established simulation-first product development'
    ],
    lessons:[
      'Category design beats feature competition',
      'Simulation and CAD change the economics of innovation',
      'GTM and business-model choice can be as innovative as the product'
    ],
    methods:['cad-simulation','gtm','reframing']
  },
  {
    id:'dropbox-mvp', emoji:'📦', company:'Dropbox',
    region:'Global', category:'Innovation', era:'Modern', units:[4,5],
    problem:'File sync was hard to build. But would anyone use it? The founder wasn\'t sure people wanted another storage app.',
    approach:[
      'Instead of building, made a 3-minute demo video showing how it *would* work',
      'Posted the video on Hacker News',
      '75,000 people signed up overnight',
      'Built the product only after demand was proven'
    ],
    outcome:[
      'Became the standard file-sync service',
      'Reached $1B+ in revenue',
      'The video MVP became the classic MVP teaching case'
    ],
    lessons:[
      'The best MVP tests the idea, not the product',
      'Testing the riskiest assumption first saves months',
      'A demo video can be a valid MVP'
    ],
    methods:['mvp','user-testing','dfv']
  },
  {
    id:'instagram-pivot', emoji:'📷', company:'Instagram',
    region:'Global', category:'Innovation', era:'Modern', units:[4],
    problem:'The founders built "Burbn" — a check-in app with many features. Users ignored most of them.',
    approach:[
      'Studied user behaviour: only one feature mattered — photo sharing',
      'Killed every other feature overnight',
      'Rebuilt the whole app around a single, focused experience',
      'Launched as Instagram in October 2010'
    ],
    outcome:[
      '1M users in 2 months, 10M in 1 year',
      'Acquired by Facebook for $1B in 2012',
      'Became the visual identity layer of the internet'
    ],
    lessons:[
      'Iteration sometimes means removing, not adding',
      'Study what users *do*, not what they say',
      'Focus is a strategy — not a constraint'
    ],
    methods:['user-testing','design-critique','iteration-log']
  },
  {
    id:'amazon-1click', emoji:'🛒', company:'Amazon 1-Click',
    region:'Global', category:'Innovation', era:'Classic', units:[4,5],
    problem:'Amazon watched users abandon carts at the payment step. Multiple steps were killing conversions.',
    approach:[
      'Observed session recordings — payment forms took 45+ seconds to complete',
      'Reframed the problem: not "faster forms" but "no forms at all"',
      'Designed "1-Click" — one button to order using saved details',
      'Patented the flow, then licensed it to Apple and others'
    ],
    outcome:[
      'Reduced checkout time by ~90%',
      'Became one of Amazon\'s most valuable patents',
      'Now standard across every e-commerce platform'
    ],
    lessons:[
      'Watch where users pause — that\'s where innovation lives',
      'Small friction at scale is enormous revenue loss',
      'Innovation can be protected — IPR gives a competitive moat'
    ],
    methods:['user-testing','reframing','ipr-check']
  },

  /* ============ INNOVATION — INDIA (8) ============ */
  {
    id:'zerodha', emoji:'📈', company:'Zerodha',
    region:'India', category:'Innovation', era:'Modern', units:[5],
    problem:'Indian brokerage was expensive and complex. Commissions ate into returns. Opening an account took weeks.',
    approach:[
      'Reframed the model: flat ₹20 per intraday trade, ₹0 for delivery',
      'Built a self-service, paperless onboarding flow',
      'Skipped advertising — grew through word of mouth and free education',
      'Focused on retail traders who were ignored by traditional brokers'
    ],
    outcome:[
      'Became India\'s largest retail broker by active users',
      'Profitable without ever raising external capital',
      'Inspired dozens of low-cost brokers across India'
    ],
    lessons:[
      'Blue ocean beats competition — change the game, don\'t win at the old one',
      'Word of mouth is the cheapest and strongest marketing',
      'Business model innovation can disrupt a century-old industry'
    ],
    methods:['reframing','blue-ocean','bmc']
  },
  {
    id:'paytm', emoji:'💰', company:'Paytm',
    region:'India', category:'Innovation', era:'Modern', units:[1,5],
    problem:'In 2014, India was a cash-heavy economy. Digital payments were English-only, urban, and confusing for first-time internet users.',
    approach:[
      'Built the app in 10+ Indian languages',
      'Simplified payment flows for users who had never used an app before',
      'Supported UPI early — became India\'s default scan-and-pay',
      'Built offline merchant network with QR codes'
    ],
    outcome:[
      'Hundreds of millions of users across India',
      'Key player in India\'s UPI-driven digital payment boom',
      'Became a listed public company in 2021'
    ],
    lessons:[
      'Language is access — not translation',
      'Designing for first-time users changes everything',
      'Cultural context beats global templates'
    ],
    methods:['cultural-design','user-testing','reframing']
  },
  {
    id:'ola', emoji:'🚗', company:'Ola',
    region:'India', category:'Innovation', era:'Modern', units:[5],
    problem:'Indian cities had unreliable auto-rickshaws and expensive taxis. No cashless booking. No tracking.',
    approach:[
      'Adapted Uber\'s two-sided marketplace to Indian realities',
      'Added cash payments — most users still preferred cash',
      'Onboarded auto-rickshaw drivers, not just cars',
      'Built local language support and offline-friendly flows'
    ],
    outcome:[
      'Became India\'s largest ride-hailing platform',
      'Expanded to EV manufacturing (Ola Electric)',
      'Forced global competitors to adapt locally'
    ],
    lessons:[
      'Copying a global model requires local adaptation',
      'Cash is still king in many emerging markets',
      'Local competitors can beat global giants by going deeper on local context'
    ],
    methods:['cultural-design','gtm','bmc']
  },
  {
    id:'ather', emoji:'⚡', company:'Ather Energy',
    region:'India', category:'Innovation', era:'Modern', units:[4,5],
    problem:'Electric two-wheelers in India were perceived as slow, ugly, and unreliable. Nobody wanted them.',
    approach:[
      'Redesigned the scooter as a premium product, not a compromise',
      'Focused on design, performance, and build quality',
      'Built the Ather Grid — public charging infrastructure',
      'Used software (dashboard, OTA updates) as a differentiator'
    ],
    outcome:[
      'Became one of India\'s leading premium EV makers',
      'Helped shift public perception of electric scooters',
      'Inspired a wave of EV startups across India'
    ],
    lessons:[
      'Desirability can be manufactured — design premium, get premium',
      'Infrastructure (charging) is as important as the product',
      'Software can differentiate hardware products'
    ],
    methods:['prototype','user-testing','vpc']
  },
  {
    id:'zomato', emoji:'🍽️', company:'Zomato',
    region:'India', category:'Innovation', era:'Modern', units:[2,4],
    problem:'In 2010, no reliable way to find restaurant reviews in India. Printed menus were outdated and misleading.',
    approach:[
      'Started as a website of restaurant menus — scanned by founders',
      'Expanded to reviews, then to delivery',
      'Validated demand with a physical menu booklet before building the app',
      'Built logistics infra for food delivery only after demand was proven'
    ],
    outcome:[
      'Became India\'s largest food-delivery platform',
      'Acquired Uber Eats India',
      'Now listed on Indian stock exchanges'
    ],
    lessons:[
      'Validate the problem before building the app',
      'Physical artefacts can test digital assumptions',
      'Pivot from content to service when demand shifts'
    ],
    methods:['problem-validation','mvp','user-testing']
  },
  {
    id:'flipkart', emoji:'🛍️', company:'Flipkart',
    region:'India', category:'Innovation', era:'Modern', units:[5],
    problem:'In 2007, Indian e-commerce didn\'t exist. People didn\'t trust online shopping. Payment systems were primitive.',
    approach:[
      'Started with books — the category Amazon had proven',
      'Built trust via cash-on-delivery, easy returns',
      'Invested in logistics (Ekart) instead of depending on third-party couriers',
      'Went deeper than global competitors on last-mile delivery'
    ],
    outcome:[
      'Became India\'s largest e-commerce platform',
      'Acquired by Walmart in 2018 for $16B',
      'Established India\'s digital commerce infrastructure'
    ],
    lessons:[
      'Trust takes time — remove friction one step at a time',
      'Vertical integration (logistics) is a competitive moat',
      'Local infrastructure beats global templates'
    ],
    methods:['bmc','gtm','reframing']
  },
  {
    id:'dunzo', emoji:'🏃', company:'Dunzo',
    region:'India', category:'Innovation', era:'Modern', units:[2,4],
    problem:'In 2015, urban Indians needed quick errands run — but no reliable, affordable service existed.',
    approach:[
      'Started as a WhatsApp bot for errands in Bengaluru',
      'Tested manually with a small user base before building an app',
      'Expanded to food, groceries, and courier only after proving the core',
      'Focused on 20–30 minute deliveries — a clear promise'
    ],
    outcome:[
      'Became a leading quick-commerce player in India',
      'Inspired a whole category (10-minute delivery)',
      'Acquired by Reliance in 2024'
    ],
    lessons:[
      'Manual MVP is a valid MVP',
      'A clear, measurable promise ("20-min delivery") drives word-of-mouth',
      'Category creation is a strategic choice, not a feature'
    ],
    methods:['mvp','problem-validation','user-testing']
  },
  {
    id:'amul', emoji:'🧈', company:'Amul',
    region:'India', category:'Social', era:'Classic', units:[5],
    problem:'In 1946, dairy farmers in Gujarat were exploited by middlemen. Milk prices were set by traders, not producers.',
    approach:[
      'Built a cooperative owned by farmers, not a private company',
      'Created the Amul brand for national distribution',
      'Invested in the "White Revolution" — technology + training for farmers',
      'Used savvy marketing (the Amul Girl) to build national presence'
    ],
    outcome:[
      'Made India the world\'s largest milk producer',
      'Lifted millions of farmers out of poverty',
      'Became India\'s most trusted dairy brand'
    ],
    lessons:[
      'Business model innovation can be social innovation',
      'Cooperative models can scale where private models can\'t',
      'Brand power built on trust lasts decades'
    ],
    methods:['bmc','responsible-innovation','gtm']
  },

  /* ============ FRUGAL (5) ============ */
  {
    id:'tata-nano', emoji:'🚙', company:'Tata Nano',
    region:'India', category:'Frugal', era:'Modern', units:[3,5],
    problem:'In 2003, an Indian family of four on a motorbike was unsafe but couldn\'t afford a car. The cheapest car was ₹3 lakh+.',
    approach:[
      'Reframed cost as a design constraint, not a limit',
      'Ruthlessly eliminated or reinvented every part',
      'Distributed manufacturing — assembled at dealer locations, not a mega-factory',
      'Kept the promise: a ₹1 lakh car, without subsidy'
    ],
    outcome:[
      'Launched in 2009 at ₹1 lakh',
      'Became a global symbol of frugal engineering',
      'Commercial success was mixed, but the innovation is legendary'
    ],
    lessons:[
      'Constraints force creativity',
      'Frugal is not cheap — it\'s clever',
      'Design thinking can target the "bottom of the pyramid"'
    ],
    methods:['scamper','morphological-analysis','reframing']
  },
  {
    id:'jaipur-foot', emoji:'🦿', company:'Jaipur Foot',
    region:'India', category:'Frugal', era:'Classic', units:[5],
    problem:'In 1968, most Indian amputees couldn\'t afford prosthetics. Imported limbs cost more than a year\'s income.',
    approach:[
      'Designed a prosthetic that can be made in 4 hours by local technicians',
      'Used locally available materials (rubber, wood, aluminium)',
      'Made it waterproof, adaptable, and culturally appropriate (squatting, cross-legged sitting)',
      'Delivered it free or at very low cost'
    ],
    outcome:[
      'Over 1.5 million people fitted globally',
      'Fitted in 30+ countries including Afghanistan and Sudan',
      'Became a benchmark for frugal assistive technology'
    ],
    lessons:[
      'Cost is not a compromise — it\'s a design variable',
      'Cultural fit matters as much as functionality',
      'Design can be a force for dignity'
    ],
    methods:['prototype','user-testing','responsible-innovation']
  },
  {
    id:'aravind-eye', emoji:'👁️', company:'Aravind Eye Care',
    region:'India', category:'Frugal', era:'Classic', units:[5],
    problem:'In 1976, millions of Indians went blind from cataracts because they couldn\'t afford surgery.',
    approach:[
      'Adopted assembly-line cataract surgery — high volume, high quality',
      'Charged market rates to affluent patients, subsidising the poor',
      'Manufactured own intraocular lenses (Aurolab) to cut costs',
      'Brought care to villages via mobile camps'
    ],
    outcome:[
      'Performed 5+ million surgeries',
      'Cost per surgery 1/50th of Western hospitals',
      'Became a global case study in frugal healthcare'
    ],
    lessons:[
      'Cross-subsidy can scale quality healthcare',
      'Vertical integration (making your own supplies) cuts costs dramatically',
      'Volume + standardisation = quality at scale'
    ],
    methods:['bmc','responsible-innovation','reframing']
  },
  {
    id:'mitticool', emoji:'🏺', company:'Mitticool',
    region:'India', category:'Frugal', era:'Modern', units:[5],
    problem:'In 2001, a Gujarat earthquake destroyed Mansukhbhai Prajapati\'s pottery business. He rebuilt — but how?',
    approach:[
      'Designed a clay refrigerator that cools without electricity',
      'Used traditional pottery techniques with a new structure',
      'Zero electricity, zero maintenance, fully biodegradable',
      'Market to rural households with no power or with unstable power'
    ],
    outcome:[
      'Sells in India and exported to 20+ countries',
      'Featured in Forbes and on global frugal innovation lists',
      'Employs local artisans in a rural workshop'
    ],
    lessons:[
      'Traditional materials can solve modern problems',
      'Sustainable innovation doesn\'t need to be high-tech',
      'Frugal innovation creates livelihoods, not just products'
    ],
    methods:['reframing','prototype','responsible-innovation']
  },
  {
    id:'narayana-health', emoji:'❤️', company:'Narayana Health',
    region:'India', category:'Frugal', era:'Modern', units:[5],
    problem:'Cardiac surgery in India in 2000 cost ₹2 lakh+ — out of reach for most families.',
    approach:[
      'Built large hospitals with high surgery volumes to lower costs',
      'Standardised procedures like manufacturing',
      'Used telemedicine and mobile clinics for follow-ups',
      'Charged patients on a sliding scale based on income'
    ],
    outcome:[
      'Performed among the highest volumes of cardiac surgeries globally',
      'Cost per surgery reduced to a fraction of Western rates',
      'Model studied by Harvard Business School'
    ],
    lessons:[
      'Standardisation is not just for factories',
      'Volume can be a strategy for affordability',
      'Quality and accessibility are not opposites'
    ],
    methods:['bmc','reframing','responsible-innovation']
  },

  /* ============ SOCIAL (4) ============ */
  {
    id:'selco', emoji:'☀️', company:'SELCO Solar',
    region:'India', category:'Social', era:'Classic', units:[5],
    problem:'In the 1990s, rural Karnataka had no reliable electricity. Kerosene lamps were unhealthy and expensive.',
    approach:[
      'Not just sold solar panels — designed financing for rural families',
      'Partnered with local banks to offer micro-loans',
      'Trained local technicians to install and repair',
      'Customised solutions for tailors, fishermen, shops'
    ],
    outcome:[
      'Installed solar systems in 500,000+ homes',
      'Loans repaid on time in 95%+ of cases',
      'Showed that poor users are excellent credit customers'
    ],
    lessons:[
      'Affordability is a design problem, not a price problem',
      'Service and maintenance matter as much as the product',
      'Solutions must be tailored to real livelihoods'
    ],
    methods:['contextual-inquiry','bmc','responsible-innovation']
  },
  {
    id:'barefoot-college', emoji:'🎓', company:'Barefoot College',
    region:'India', category:'Social', era:'Classic', units:[5],
    problem:'In the 1970s, rural Rajasthan had no trained professionals. Conventional colleges didn\'t reach the villages.',
    approach:[
      'Trained rural women (many illiterate) as solar engineers',
      'Used sign language, colour coding, and hands-on learning',
      'Built in the village, for the village',
      'No certificates required — skill is what matters'
    ],
    outcome:[
      'Trained 3,000+ solar engineers across 90+ countries',
      'Electrified tens of thousands of rural homes',
      'Became a global model for inclusive education'
    ],
    lessons:[
      'Education can bypass literacy if the method is right',
      'Inclusive innovation serves people others forget',
      'Local trainers sustain impact beyond the classroom'
    ],
    methods:['cultural-design','responsible-innovation']
  },
  {
    id:'grameen-bank', emoji:'🏦', company:'Grameen Bank',
    region:'Global', category:'Social', era:'Classic', units:[5],
    problem:'In 1976, poor Bangladeshis (mostly women) had no access to credit — banks required collateral they didn\'t have.',
    approach:[
      'Made small loans (micro-loans) without collateral',
      'Built group-based lending — peers guarantee repayment',
      'Focused on women borrowers — they reinvested more than men',
      'Loans for income-generating activities only'
    ],
    outcome:[
      'Grew to 9M+ borrowers, 97% women',
      'Repayment rates above 95%',
      'Muhammad Yunus won the Nobel Peace Prize in 2006'
    ],
    lessons:[
      'Assumptions about poor creditworthiness are wrong',
      'Group accountability replaces collateral',
      'Designing for women changes household dynamics'
    ],
    methods:['bmc','responsible-innovation','reframing']
  },
  {
    id:'khan-academy', emoji:'📚', company:'Khan Academy',
    region:'Global', category:'Social', era:'Modern', units:[5],
    problem:'In 2004, a man tutoring his cousin remotely used Yahoo Doodle. The approach was scaling — but the tools weren\'t.',
    approach:[
      'Recorded simple videos instead of live tutoring',
      'Free for everyone, forever',
      'Built software for practice and progress tracking',
      'Refused advertising and monetisation'
    ],
    outcome:[
      '100M+ users globally',
      'Translated into 50+ languages',
      'Used by schools as core curriculum support'
    ],
    lessons:[
      'Free can scale better than paid for education',
      'Video + practice + progress = a complete learning loop',
      'A single insight ("async video beats live") can define a category'
    ],
    methods:['reframing','bmc','responsible-innovation']
  },

  /* ============ FAILURES (7) ============ */
  {
    id:'google-glass', emoji:'👓', company:'Google Glass',
    region:'Global', category:'Failure', era:'Modern', units:[4,5],
    problem:'Google tried to build a smart-glasses wearable. Tech worked. Users hated it.',
    approach:[
      'Built impressive hardware — camera, HUD, voice control',
      'Launched to a small group of "Explorers" at $1,500 each',
      'Underestimated social context — recording strangers was invasive',
      'No clear use case beyond demo'
    ],
    outcome:[
      'Killed for consumers in 2015',
      'Rebranded for enterprise (manufacturing, surgery) — smaller success',
      'Became a case study in "tech without user empathy"'
    ],
    lessons:[
      'Great tech fails without a real user need',
      'Social context is as important as functionality',
      'Prototyping with real users early would have caught it'
    ],
    methods:['user-testing','dfv','reframing']
  },
  {
    id:'juicero', emoji:'🧃', company:'Juicero',
    region:'Global', category:'Failure', era:'Modern', units:[5],
    problem:'A startup raised $120M to sell a $700 Wi-Fi juicer that squeezed proprietary juice packs.',
    approach:[
      'Over-engineered the machine (400+ parts, Wi-Fi, QR scanner)',
      'Locked users into proprietary juice packs at $5–8 each',
      'Assumed premium positioning would work without validation',
      'Ignored that users could squeeze the packs by hand'
    ],
    outcome:[
      'Shut down in 2017, 16 months after launch',
      'Became a symbol of Silicon Valley over-engineering',
      'Investors lost ~$120M'
    ],
    lessons:[
      'Solve a real problem, not an imagined one',
      'If the simplest solution already works, don\'t over-build',
      'Validation beats vision when the vision is unproven'
    ],
    methods:['problem-validation','dfv','user-testing']
  },
  {
    id:'theranos', emoji:'🩸', company:'Theranos',
    region:'Global', category:'Failure', era:'Modern', units:[4,5],
    problem:'A startup promised blood tests from a single finger-prick, replacing expensive lab work.',
    approach:[
      'Told an inspiring story but never proved the science',
      'Blocked peer review and independent validation',
      'Ran real patient tests on third-party machines while claiming own tech',
      'Silenced internal doubters with NDAs'
    ],
    outcome:[
      'Founder Elizabeth Holmes convicted of fraud in 2022',
      'Company dissolved in 2018',
      'Became the biggest cautionary tale of "fake innovation"'
    ],
    lessons:[
      'Vision without validation is fraud',
      'Peer review and transparency are non-negotiable in science',
      'Responsible innovation is about honesty, not hype'
    ],
    methods:['problem-validation','responsible-innovation','dfv']
  },
  {
    id:'nokia', emoji:'📵', company:'Nokia',
    region:'Global', category:'Failure', era:'Modern', units:[5],
    problem:'In 2007, Nokia dominated global phones. The iPhone launched — and Nokia kept improving its own phones instead of reframing.',
    approach:[
      'Doubled down on hardware specs — better cameras, longer battery',
      'Underestimated the software + ecosystem shift',
      'Internal politics slowed the response',
      'Kept iterating on Symbian instead of starting fresh'
    ],
    outcome:[
      'Sold its phone business to Microsoft in 2013',
      'Became a case study in "disruption blindness"',
      'Its CEO famously said: "We didn\'t do anything wrong — but somehow, we lost."'
    ],
    lessons:[
      'Sustaining innovation can be a trap',
      'Watch for category shifts, not just feature competition',
      'Culture can block a response even when strategy sees the threat'
    ],
    methods:['disruptive-innovation','reframing','dfv']
  },
  {
    id:'kodak', emoji:'📸', company:'Kodak',
    region:'Global', category:'Failure', era:'Classic', units:[5],
    problem:'Kodak invented the digital camera in 1975 — but was so invested in film that it buried the invention.',
    approach:[
      'Sat on digital camera tech for years to protect film revenue',
      'Underestimated how fast digital would replace film',
      'Licensed the tech but never made it the core business',
      'Focused on sustaining film innovation instead of a category shift'
    ],
    outcome:[
      'Filed for bankruptcy in 2012',
      'Sold its patents to survive',
      'Became the classic case of "innovator\'s dilemma"'
    ],
    lessons:[
      'The biggest risk is not innovating when you already own the future',
      'Revenue protection can block strategic clarity',
      'Innovator\'s dilemma is real — managed by design, not by luck'
    ],
    methods:['disruptive-innovation','reframing']
  },
  {
    id:'blockbuster', emoji:'🎥', company:'Blockbuster',
    region:'Global', category:'Failure', era:'Classic', units:[5],
    problem:'Blockbuster dominated video rentals — 9,000 stores at peak. Netflix offered mail-order DVDs and Blockbuster dismissed it as niche.',
    approach:[
      'Kept physical stores as the core business',
      'Late and reluctant to invest in streaming',
      'Refused to buy Netflix for $50M in 2000',
      'Layered on fees (late fees) that users hated'
    ],
    outcome:[
      'Filed for bankruptcy in 2010',
      'Netflix became a $200B+ company',
      'Became the standard "disrupted by a startup" case'
    ],
    lessons:[
      'Disruption often starts small and looks unimportant',
      'User frustration (late fees) is a signal, not a revenue line',
      'Distribution innovation can destroy an entire industry'
    ],
    methods:['disruptive-innovation','reframing']
  },
  {
    id:'wework', emoji:'🏢', company:'WeWork',
    region:'Global', category:'Failure', era:'Modern', units:[5],
    problem:'WeWork promised to reinvent office space. At its peak valuation ($47B), it was seen as a tech company.',
    approach:[
      'Long-term leases, short-term subleases — cash-flow risk ignored',
      'Grew rapidly without unit economics working',
      'Cult-like founder culture blocked dissent',
      'Filed for IPO in 2019 — investors saw the numbers'
    ],
    outcome:[
      'IPO withdrawn in 2019',
      'Valued down 90%+ within weeks',
      'Filed for bankruptcy in 2023'
    ],
    lessons:[
      'Narrative beats numbers only for so long',
      'Unit economics > story',
      'Culture of "founder knows best" prevents learning'
    ],
    methods:['dfv','bmc','problem-validation']
  },

  /* ============ MODERN EMERGING (3) ============ */
  {
    id:'chatgpt', emoji:'🤖', company:'ChatGPT',
    region:'Global', category:'Innovation', era:'Modern', units:[3,5],
    problem:'AI was powerful but locked inside research papers and demo videos. Nobody could use it in daily work.',
    approach:[
      'Reframed the problem: not "better AI" but "AI anyone can use"',
      'Trained on huge datasets — then shipped a simple chat interface',
      'Released with no marketing, just a blog post',
      'Iterated fast — weekly updates based on user behaviour'
    ],
    outcome:[
      '100M users in 2 months — fastest-growing product ever at launch',
      'Triggered a global AI arms race',
      'Redefined how people interact with AI'
    ],
    lessons:[
      'Distribution beats novelty',
      'Interfaces can be as innovative as technology',
      'Fast iteration + user feedback accelerates product-market fit'
    ],
    methods:['reframing','mvp','gtm']
  },
  {
    id:'notion', emoji:'📝', company:'Notion',
    region:'Global', category:'Innovation', era:'Modern', units:[5],
    problem:'In 2016, productivity tools were siloed — notes in one app, tasks in another, databases in a third.',
    approach:[
      'Reframed: "one workspace for everything"',
      'Built a flexible block-based system users could shape themselves',
      'Community templates drove adoption organically',
      'Grew through users sharing their Notion setups on social media'
    ],
    outcome:[
      '20M+ users by 2023',
      'Used as a company-wide OS at startups, universities, nonprofits',
      'Became a template for "flexible, user-shaped products"'
    ],
    lessons:[
      'Flexible primitives beat fixed features',
      'Community can be the primary growth channel',
      'Users as co-designers — they shape the product for others'
    ],
    methods:['reframing','gtm','user-testing']
  },
  {
    id:'duolingo', emoji:'🦉', company:'Duolingo',
    region:'Global', category:'Innovation', era:'Modern', units:[4,5],
    problem:'Language learning was expensive, slow, and boring. Most people quit.',
    approach:[
      'Made learning a game — streaks, XP, leaderboards',
      'Free for everyone with an ad-supported tier',
      'Tested 100+ experiments per quarter (A/B testing culture)',
      'Push notifications as an engagement tool'
    ],
    outcome:[
      '500M+ users worldwide',
      'Most successful language-learning app ever',
      'A/B testing culture studied by product teams globally'
    ],
    lessons:[
      'Gamification can overcome motivational barriers',
      'Constant A/B testing turns product development into science',
      'Free with ads scales where paid models fail'
    ],
    methods:['ab-testing','vpc','user-testing']
  }
];

/* =========================================================
   CATEGORIES — for filter chips
   ========================================================= */
window.CASES_CATEGORIES = [
  { id:'Design Thinking', emoji:'🎨', color:'#2563EB' },
  { id:'Innovation',      emoji:'💡', color:'#059669' },
  { id:'Disruption',      emoji:'⚡', color:'#D97706' },
  { id:'Frugal',          emoji:'🌱', color:'#7C3AED' },
  { id:'Social',          emoji:'🤝', color:'#E11D48' },
  { id:'Failure',         emoji:'⚠️', color:'#64748B' }
];

/* Sanity log */
(function(){
  if (window.console && window.CASES_DATA){
    console.log('[cases-data] loaded:', window.CASES_DATA.length, 'cases');
  }
})();