/* The Yard: an interactive 3D island. Each venture is a building; the Hermes agents fly between them. */
(function () {
  var root = document.getElementById('yard');
  if (!root) return;
  var stage = root.querySelector('.yard-stage');
  var loader = root.querySelector('.yard-loader');
  var ringFg = root.querySelector('.yard-ring-fg');
  var pct = root.querySelector('.yard-pct');
  var msg = root.querySelector('.yard-msg');
  var pop = root.querySelector('.yard-pop');
  var labelsEl = root.querySelector('.yard-labels');
  var bubble = root.querySelector('.yard-bubble');
  var slider = root.querySelector('#yard-time');
  var clockEl = root.querySelector('.yard-clock');
  var liveBtn = root.querySelector('.yard-live');
  var toast = root.querySelector('.yard-toast');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  function say(t) { toast.textContent = t; toast.classList.add('on'); clearTimeout(say._t); say._t = setTimeout(function () { toast.classList.remove('on'); }, 2400); }

  var INFO = {
    hq: { tag: 'Agentic systems', name: 'Hermes HQ', accent: '#F2B544', desc: 'The control tower. An orchestrator plans the work, specialist agents carry it out, and a person approves what ships.', lines: ['Orchestrator + specialists', 'Human approval gates', 'Runs on a London VPS'], link: null },
    ci: { tag: 'Digital operations', name: 'Cogent Intelligence', accent: '#5FD4C4', desc: 'The mill. Turns repetitive back-office work into automated operations with clear rules and a trail behind every decision.', lines: ['Intake · routing · reporting', 'Rules kept in the database', 'Engineer to operator'], link: 'https://cogentintelligence.co.uk' },
    arch: { tag: 'Systems & architecture', name: 'The Server Hall', accent: '#A98BF5', desc: 'Where the systems live: cloud architecture, hosting, databases and security, designed to stay up and stay compliant.', lines: ['Cloudflare · London VPS', 'PostgreSQL · Prisma', 'Cyber Essentials controls'], link: null },
    apx: { tag: 'Building for businesses', name: 'APX Digital', accent: '#7FB6F2', desc: 'The studio. Websites, portals, CRMs and IT for UK businesses, built properly and then looked after.', lines: ['Websites · portals · CRMs', 'Cyber Essentials prep', 'Retained support'], link: 'https://apxdigital.io' },
    sa: { tag: 'Compliance systems', name: 'Support Audit', accent: '#F2B544', desc: 'The records office. Built from eight years in HMO and supported housing, it checks whether a provider\u2019s support evidence stands up.', lines: ['Property and support evidence', 'Graded by an auditor', 'Exempt · supported · transitional'], link: 'https://supportaudit.co.uk' },
    lg: { tag: 'Sector knowledge', name: 'ExemptAccommodation.com', accent: '#F27BA0', desc: 'The signal mast. Supported housing rules in plain English, free tools for providers and landlords, and regulation alerts broadcast when the rules change.', lines: ['Audit readiness check', 'Exempt accommodation checker', 'Service charge calculator'], link: 'https://exemptaccommodation.com' },
    epc: { tag: 'Personal projects', name: 'Personal projects', accent: '#B9DE78', desc: 'The terraces: the things I build because I want to. Some of them turn into businesses.', lines: ['EPC Birmingham', 'Labs', 'Side builds'], link: 'https://epcbirmingham.co.uk' },
    gym: { tag: 'Personal training', name: 'High Performance Fit', accent: '#F59E5B', desc: 'The gym. Thirteen years of coaching, Level 4 qualified, and the food logging app I built for clients.', lines: ['1-2-1, small-group and online', 'Kings Heath, Birmingham', 'Barcode food logging app'], link: 'https://highperformancefit.co.uk' },
    agents: { tag: 'AI agents', name: 'The Hermes team', accent: '#5FD4C4', desc: 'Four agents, each with one job, working across every building on the island.', lines: ['Claude · Hermes · OpenRouter', 'Outputs wait for approval'], link: null }
  };
  var USES = {
    hq: ['A job comes in and the orchestrator breaks it into tasks', 'Specialist agents pick up the code, ops and content', 'Each output waits at a review gate before it goes out'],
    ci: ['Enquiries and emails are sorted and routed automatically', 'Reports build themselves from live data in Postgres', 'Exceptions go to a person; everything else just runs'],
    arch: ['Design the architecture before a line of code', 'Host in the UK behind Cloudflare, with Postgres at the core', 'Harden it to Cyber Essentials and keep it monitored'],
    apx: ['Scope what the business actually needs', 'Build the site, portal or system, and host it', 'Support and improve it month to month'],
    sa: ['A managing agent sends a batch of resident files', 'Each file is checked against a clear evidence standard', 'The provider gets a graded report with actions'],
    lg: ['A provider checks which exempt category their scheme is likely to fall into', 'The service charge calculator splits eligible and ineligible lines for Housing Benefit', 'When regulation changes, the tracker updates and alerts go out'],
    epc: ['EPC Birmingham: a local EPC site with a calculator and guides', 'High Performance Fit app: barcode food logging for clients', 'Lab builds: agents, security tests and cloud experiments'],
    gym: ['A new client books a consultation', 'Programme and macros are set, and food is logged by barcode', 'Weekly check-ins keep progress on track'],
    agents: ['@orchestrator plans the day and assigns the work', '@code builds and ships; @coo files, reviews and follows up', '@marketing drafts content, and nothing goes out unapproved']
  };
  Object.keys(USES).forEach(function (k) { INFO[k].uses = USES[k]; });
  var CASES = [
    { key: 'ci', label: 'Digital operations', from: 'ci', to: 'hq' },
    { key: 'arch', label: 'Systems & architecture', from: 'apx', to: 'arch' },
    { key: 'agents', label: 'AI agents', from: 'hq', to: 'ci' },
    { key: 'hq', label: 'Agentic systems', from: 'arch', to: 'hq' },
    { key: 'apx', label: 'Building for businesses', from: 'hq', to: 'apx' },
    { key: 'sa', label: 'Compliance systems', from: 'hq', to: 'sa' },
    { key: 'lg', label: 'Sector knowledge & tools', from: 'lg', to: 'sa' },
    { key: 'epc', label: 'Personal projects', from: 'gym', to: 'epc' }
  ];
  var AGENTS = [
    { key: 'orchestrator', name: '@orchestrator', accent: '#F2B544', desc: 'Plans the day and hands each job to the right agent.', says: ['Morning run planned. Handing out jobs.', 'Next job: outreach drafts for review.', 'All agents checked in.'] },
    { key: 'code', name: '@code', accent: '#5FD4C4', desc: 'Builds and ships the sites, apps and automations.', says: ['Deploy finished. All green.', 'Hub template forked for a new site.', 'Tests passing. Shipping it.'] },
    { key: 'coo', name: '@coo', accent: '#7FB6F2', desc: 'Keeps operations tidy: files, reviews and follow-ups.', says: ['Audit file passed to the auditor.', 'Review queue cleared.', 'Regulation update published.'] },
    { key: 'marketing', name: '@marketing', accent: '#F27BA0', desc: 'Drafts posts and outreach, and sends nothing without review.', says: ['LinkedIn post drafted for review.', 'Outreach copy checked against the gate.', 'Case study ready to read.'] }
  ];

  var started = false;
  function start() {
    if (started) return; started = true;
    if (!window.THREE) { fail(); return; }
    try { var c = document.createElement('canvas'); if (!(c.getContext('webgl2') || c.getContext('webgl'))) { fail(); return; } } catch (e) { fail(); return; }
    build();
  }
  function fail() {
    loader.querySelector('.yard-msg').textContent = 'This browser can’t show 3D. The ventures are listed below.';
    root.querySelector('.yard-ring').style.display = 'none';
  }

  /* ------------------------------------------------------------------ */
  function build() {
    var T = THREE;
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    var W = stage.clientWidth, H = stage.clientHeight;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5));
    renderer.setSize(W, H);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = !coarse;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'Interactive 3D island. Each building is one of Jamie’s ventures.');
    renderer.domElement.setAttribute('role', 'img');
    stage.appendChild(renderer.domElement);

    var scene = new T.Scene();
    scene.fog = new T.Fog(0xf2c6a8, 40, 90);
    var camera = new T.PerspectiveCamera(34, W / H, 0.1, 300);
    camera.position.set(19, 14, 19);
    var controls = new T.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.2, 0);
    controls.enableDamping = true; controls.dampingFactor = 0.07;
    controls.enablePan = false; controls.enableZoom = false;
    controls.minPolarAngle = 0.55; controls.maxPolarAngle = 1.3;
    controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.45;
    if (coarse) { controls.enableRotate = false; renderer.domElement.style.touchAction = 'pan-y'; }
    controls.update();
    var homePos = camera.position.clone();

    var hemi = new T.HemisphereLight(0xcfe3ff, 0x5a4a3a, 0.6); scene.add(hemi);
    var sun = new T.DirectionalLight(0xffe2b8, 2.2);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    var sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80;
    sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.02;
    scene.add(sun); scene.add(sun.target);
    var moon = new T.DirectionalLight(0x8fa8ff, 0); moon.position.set(-14, 18, -8); scene.add(moon);

    function M(c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, flatShading: true, roughness: 0.85, metalness: 0 }, o || {})); }
    function mesh(g, m, x, y, z) { var o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true; return o; }
    function box(w, h, d, m, x, y, z) { return mesh(new T.BoxGeometry(w, h, d), m, x, y, z); }
    function cyl(rt, rb, h, s, m, x, y, z) { return mesh(new T.CylinderGeometry(rt, rb, h, s), m, x, y, z); }
    function roof(w, d, h, m, x, y, z) { var r = mesh(new T.ConeGeometry(0.72, h, 4), m, x, y, z); r.rotation.y = Math.PI / 4; r.scale.set(w, 1, d); return r; }

    var winMat = M(0xffcf7a, { emissive: 0xffb54a, emissiveIntensity: 0.2, roughness: 0.4 });
    var lampMat = M(0xfff1c9, { emissive: 0xffd27a, emissiveIntensity: 0.2 });
    var glow = {};
    function glowMat(hex) { if (!glow[hex]) glow[hex] = M(hex, { emissive: hex, emissiveIntensity: 0.8, roughness: 0.4 }); return glow[hex]; }
    function windows(g, w, h, d, rows, cols, y0) {
      for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
        var x = -w / 2 + (c + 0.5) * (w / cols), y = y0 + r * 0.55;
        g.add(box(0.22, 0.28, 0.04, winMat, x, y, d / 2 + 0.01));
        g.add(box(0.22, 0.28, 0.04, winMat, x, y, -d / 2 - 0.01));
      }
    }

    var steps = [];
    var island = new T.Group(); scene.add(island);
    var clickables = [], buildings = {}, spinners = [], pulses = [], lamps = [], heatFans = [];
    var R = 11;

    /* --- island --- */
    steps.push(['Raising the island…', function () {
      var top = cyl(R, R * 0.97, 0.9, 40, M(0x6fae4f), 0, 0, 0); top.castShadow = false; island.add(top);
      var rimG = new T.CylinderGeometry(R * 0.97, R * 0.9, 1.2, 40, 2);
      island.add(mesh(rimG, M(0x8a5a36), 0, -1.0, 0));
      var g = new T.ConeGeometry(R * 0.9, 7.5, 28, 6, true);
      var p = g.attributes.position, v = new T.Vector3();
      for (var i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); if (v.y < 3.6) { var j = 0.75 + Math.sin(i * 12.9898) * 0.35; v.x *= j; v.z *= j; v.y += Math.cos(i * 4.1) * 0.35; } p.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals();
      var under = mesh(g, M(0x6b4127, { side: T.DoubleSide }), 0, -5.35, 0); under.rotation.x = Math.PI; island.add(under);
      var strata = cyl(R * 0.9, R * 0.82, 0.5, 40, M(0x5a3520), 0, -1.75, 0); island.add(strata);
      for (var k = 0; k < 5; k++) { var a = k * 1.3 + 0.4, rr = R + 1.5 + (k % 2); var rock = mesh(new T.DodecahedronGeometry(0.45 + (k % 3) * 0.2, 0), M(0x7a4d2e), Math.cos(a) * rr, -2 - k * 0.6, Math.sin(a) * rr); island.add(rock); rock.userData.float = { y: rock.position.y, s: 0.6 + k * 0.17 }; spinners.push(rock); }
      var path = new T.Mesh(new T.RingGeometry(2.6, 3.4, 48), M(0xd9c7a2, { side: T.DoubleSide })); path.rotation.x = -Math.PI / 2; path.position.y = 0.46; path.receiveShadow = true; island.add(path);
      var plaza = new T.Mesh(new T.CircleGeometry(2.0, 32), M(0xcdb995)); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.455; plaza.receiveShadow = true; island.add(plaza);
      var pond = new T.Mesh(new T.CircleGeometry(1.5, 24), M(0x4aa3c9, { roughness: 0.15, metalness: 0.1, emissive: 0x1a4a66, emissiveIntensity: 0.3 })); pond.rotation.x = -Math.PI / 2; pond.position.set(-3.976, 0.47, 3.032); island.add(pond);
      var stream = box(0.7, 0.05, 5.2, M(0x4aa3c9, { roughness: 0.15, emissive: 0x1a4a66, emissiveIntensity: 0.3 }), -6.599, 0.47, 5.034); stream.rotation.y = -0.9192; island.add(stream);
      var fall = box(0.7, 3.2, 0.12, M(0x7cc6e6, { transparent: true, opacity: 0.75, emissive: 0x2a6a88, emissiveIntensity: 0.4 }), -8.571, -1.1, 6.538); fall.rotation.y = -0.9192; fall.castShadow = false; island.add(fall);
    }]);

    /* --- paths to buildings + building slots --- */
    var slots = { sa: 0, ci: 1, apx: 2, arch: 3, lg: 4, epc: 5, gym: 6 };
    function slotPos(i) { var a = i / 7 * Math.PI * 2 + 0.25; return { x: Math.cos(a) * 6.9, z: Math.sin(a) * 6.9, a: a }; }
    function addPath(i) {
      var s = slotPos(i), len = 3.2; var p = box(0.9, 0.04, len, M(0xd9c7a2), Math.cos(s.a) * 4.9, 0.455, Math.sin(s.a) * 4.9); p.rotation.y = -s.a + Math.PI / 2; p.castShadow = false; island.add(p);
    }
    function place(key, g, i) {
      var s = slotPos(i); g.position.set(s.x, 0.45, s.z); g.rotation.y = -s.a - Math.PI / 2;
      g.traverse(function (o) { o.userData.key = key; if (o.isMesh) clickables.push(o); });
      g.userData.key = key; g.userData.base = 1; g.userData.h = g.userData.h || 3;
      island.add(g); buildings[key] = g; addPath(i);
    }

    steps.push(['Building the town square…', function () {
      var g = new T.Group(), stone = M(0xd8cdb8), dark = M(0x34384a);
      g.add(box(1.5, 3.4, 1.5, stone, 0, 1.7, 0));
      g.add(box(1.7, 0.25, 1.7, dark, 0, 3.45, 0));
      g.add(roof(2.3, 2.3, 1.6, M(0x3d4a6b), 0, 4.35, 0));
      g.add(cyl(0.04, 0.04, 0.9, 6, dark, 0, 5.5, 0));
      g.add(mesh(new T.OctahedronGeometry(0.18, 0), glowMat(0xF2B544), 0, 6.0, 0));
      var hands = [];
      for (var f = 0; f < 4; f++) {
        var face = new T.Group(); face.rotation.y = f * Math.PI / 2;
        var disc = mesh(new T.CylinderGeometry(0.5, 0.5, 0.06, 24), M(0xfff6e2, { emissive: 0xfff0c8, emissiveIntensity: 0.15 }), 0, 2.75, 0.78); disc.rotation.x = Math.PI / 2; face.add(disc);
        var hh = box(0.06, 0.3, 0.03, dark, 0, 0, 0); hh.geometry.translate(0, 0.15, 0); hh.position.set(0, 2.75, 0.83);
        var mh = box(0.04, 0.42, 0.03, dark, 0, 0, 0); mh.geometry.translate(0, 0.21, 0); mh.position.set(0, 2.75, 0.85);
        face.add(hh); face.add(mh); hands.push([hh, mh]); g.add(face);
      }
      g.add(box(0.5, 0.8, 0.05, M(0x5b3a24), 0, 0.4, 0.76));
      windows(g, 1.5, 0, 1.5, 2, 2, 1.0);
      g.userData.h = 6.3; g.userData.hands = hands;
      g.traverse(function (o) { o.userData.key = 'hq'; if (o.isMesh) clickables.push(o); });
      g.position.set(0, 0.45, 0); island.add(g); buildings.hq = g;
      // benches + lamps around the plaza
      for (var l = 0; l < 8; l++) {
        var a = l / 8 * Math.PI * 2 + 0.1, x = Math.cos(a) * 3.75, z = Math.sin(a) * 3.75;
        island.add(cyl(0.05, 0.07, 1.4, 6, dark, x, 1.15, z));
        var bulb = mesh(new T.SphereGeometry(0.14, 8, 6), lampMat, x, 1.9, z); bulb.castShadow = false; island.add(bulb);
        if (l % 2 === 0) { var pl = new T.PointLight(0xffc472, 0, 6, 2); pl.position.set(x, 2.0, z); island.add(pl); lamps.push(pl); }
      }
    }]);

    steps.push(['Opening the records office…', function () {
      var g = new T.Group(), brick = M(0xb4573f), roofM = M(0x3b3f4a), trim = M(0xe8dcc4);
      g.add(box(3.0, 1.9, 2.0, brick, 0, 0.95, 0));
      g.add(box(3.15, 0.15, 2.15, trim, 0, 1.95, 0));
      g.add(roof(3.1, 2.1, 1.2, roofM, 0, 2.6, 0));
      g.add(box(0.35, 0.9, 0.35, brick, 0.9, 3.0, -0.3));
      g.add(box(0.7, 1.0, 0.06, M(0x5b3a24), 0, 0.5, 1.02));
      g.add(box(1.4, 0.32, 0.06, glowMat(0xF2B544), 0, 1.6, 1.04));
      windows(g, 3.0, 0, 2.0, 1, 4, 1.15);
      // filing stacks
      var files = [0xf3e3c3, 0xe9cf9d, 0xd8b779];
      for (var s = 0; s < 3; s++) for (var t = 0; t < 3 - s % 2; t++) g.add(box(0.5, 0.18, 0.38, M(files[(s + t) % 3]), -1.9 + t * 0.03, 0.1 + s * 0.19, 0.6 - t * 0.42));
      g.userData.h = 4.0; place('sa', g, slots.sa);
    }]);

    steps.push(['Starting the mill…', function () {
      var g = new T.Group();
      g.add(cyl(0.95, 1.15, 3.4, 10, M(0xe4ddcc), 0, 1.7, 0));
      g.add(mesh(new T.ConeGeometry(1.25, 1.3, 10), M(0x2f7f78), 0, 4.05, 0));
      g.add(box(0.6, 0.9, 0.06, M(0x5b3a24), 0, 0.45, 1.12));
      for (var i = 0; i < 4; i++) { var w = box(0.24, 0.32, 0.06, winMat, 0, 1.4 + i * 0.6, 1.05 - i * 0.04); g.add(w); }
      var hub = new T.Group(); hub.position.set(0, 3.1, 1.25);
      hub.add(mesh(new T.SphereGeometry(0.18, 8, 6), M(0x34384a)));
      for (var b = 0; b < 4; b++) { var bl = box(0.28, 1.9, 0.05, glowMat(0x5FD4C4)); bl.geometry.translate(0, 1.0, 0); bl.rotation.z = b * Math.PI / 2; hub.add(bl); }
      hub.userData.spin = 0.9; spinners.push(hub); g.add(hub);
      // server shed
      g.add(box(1.3, 0.8, 1.0, M(0x2b3140), 1.5, 0.4, -0.2));
      for (var r = 0; r < 3; r++) g.add(box(0.9, 0.06, 0.02, glowMat(0x5FD4C4), 1.5, 0.25 + r * 0.18, 0.31));
      g.userData.h = 5.0; place('ci', g, slots.ci);
    }]);

    steps.push(['Fitting out the studio…', function () {
      var g = new T.Group(), white = M(0xeef0f3), glass = M(0x7fb6f2, { roughness: 0.15, metalness: 0.2, emissive: 0x2a5a8a, emissiveIntensity: 0.35 });
      g.add(box(2.6, 1.4, 2.0, white, 0, 0.7, 0));
      g.add(box(2.0, 1.2, 1.7, white, 0.4, 2.0, -0.1));
      g.add(box(2.4, 0.9, 0.05, glass, 0, 0.75, 1.01));
      g.add(box(1.8, 0.8, 0.05, glass, 0.4, 2.0, 0.76));
      g.add(box(2.7, 0.1, 2.1, M(0x34384a), 0, 1.42, 0));
      g.add(box(2.1, 0.1, 1.8, M(0x34384a), 0.4, 2.63, -0.1));
      var sign = box(1.2, 0.36, 0.06, glowMat(0x7FB6F2), 0.4, 2.95, 0.3); g.add(sign);
      g.add(cyl(0.02, 0.02, 0.9, 6, M(0x34384a), -0.3, 3.1, -0.4));
      var dish = mesh(new T.SphereGeometry(0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.6), M(0xd9dde3, { side: T.DoubleSide }), -0.3, 3.5, -0.4); dish.rotation.x = -0.9; g.add(dish);
      g.userData.h = 4.0; place('apx', g, slots.apx);
    }]);

    steps.push(['Racking the servers…', function () {
      var g = new T.Group(), shell = M(0x2b3140), trim = M(0x9aa1ae, { metalness: 0.4, roughness: 0.5 });
      g.add(box(3.0, 1.3, 1.9, shell, 0, 0.65, 0));
      g.add(box(3.1, 0.12, 2.0, trim, 0, 1.36, 0));
      g.add(box(2.6, 0.9, 0.05, M(0x141922, { roughness: 0.2, metalness: 0.3 }), 0, 0.65, 0.96));
      for (var rk = 0; rk < 5; rk++) for (var ld = 0; ld < 4; ld++) { var led = box(0.08, 0.05, 0.03, glowMat([0xA98BF5, 0x5FD4C4, 0xA98BF5, 0xB9DE78][(rk + ld) % 4]), -1.0 + rk * 0.5, 0.35 + ld * 0.18, 0.99); led.castShadow = false; led.userData.blink = 0.5 + Math.random() * 2.5; g.add(led); spinners.push(led); }
      [-0.8, 0.8].forEach(function (x) {
        g.add(cyl(0.38, 0.38, 0.22, 14, trim, x, 1.53, -0.2));
        var fan = new T.Group(); fan.position.set(x, 1.66, -0.2);
        for (var b = 0; b < 3; b++) { var bl = box(0.6, 0.02, 0.09, M(0x2b2f3a)); bl.rotation.y = b * 2.094; fan.add(bl); }
        fan.userData.spin = 12; spinners.push(fan); g.add(fan);
      });
      var cloud = new T.Group(), cm = M(0xf4f1ea, { roughness: 0.6, emissive: 0xA98BF5, emissiveIntensity: 0.12 });
      [[0, 0, 0, 0.5], [0.5, -0.08, 0.05, 0.38], [-0.5, -0.1, 0, 0.36], [0.2, 0.25, -0.05, 0.36]].forEach(function (c) { cloud.add(mesh(new T.IcosahedronGeometry(c[3], 1), cm, c[0], c[1], c[2])); });
      cloud.position.set(0, 3.0, 0); cloud.userData.float = { y: 3.0, s: 0.9 }; spinners.push(cloud); g.add(cloud);
      for (var dl = 0; dl < 3; dl++) { var beam = cyl(0.015, 0.015, 1.1, 4, glowMat(0xA98BF5), -0.3 + dl * 0.3, 2.0, 0); beam.castShadow = false; g.add(beam); }
      g.userData.h = 3.8; place('arch', g, slots.arch);
    }]);

    steps.push(['Putting up the mast…', function () {
      var g = new T.Group(), steel = M(0x9aa1ae, { metalness: 0.4, roughness: 0.5 });
      g.add(box(1.4, 0.9, 1.2, M(0xe7e2d6), 0.9, 0.45, 0.2));
      g.add(roof(1.5, 1.3, 0.6, M(0x8b3a55), 0.9, 1.2, 0.2));
      var hgt = 5.6;
      for (var c = 0; c < 4; c++) { var a = c * Math.PI / 2 + Math.PI / 4; var leg = cyl(0.04, 0.05, hgt, 5, steel, Math.cos(a) * 0.32, hgt / 2, Math.sin(a) * 0.32); leg.rotation.z = Math.cos(a) * 0.05; leg.rotation.x = -Math.sin(a) * 0.05; g.add(leg); }
      for (var k = 1; k < 7; k++) { var y = k * 0.8, s = 0.62 - k * 0.04; var rg = mesh(new T.TorusGeometry(s * 0.5, 0.025, 4, 4), steel, 0, y, 0); rg.rotation.x = Math.PI / 2; rg.rotation.z = Math.PI / 4; g.add(rg); }
      var beacon = mesh(new T.SphereGeometry(0.17, 10, 8), glowMat(0xF27BA0), 0, hgt + 0.1, 0); g.add(beacon); g.userData.beacon = beacon;
      for (var p = 0; p < 3; p++) {
        var ring = new T.Mesh(new T.TorusGeometry(0.4, 0.035, 6, 40), new T.MeshBasicMaterial({ color: 0xF27BA0, transparent: true, opacity: 0.8 }));
        ring.position.set(0, hgt + 0.1, 0); ring.rotation.x = Math.PI / 2; ring.userData.phase = p / 3; g.add(ring); pulses.push(ring);
      }
      g.userData.h = 6.5; place('lg', g, slots.lg);
    }]);

    steps.push(['Fitting heat pumps on the terraces…', function () {
      var g = new T.Group(), cols = [0xc9644a, 0xb7a58a, 0xa95d4a, 0xd1b38a];
      for (var i = 0; i < 4; i++) {
        var x = -1.65 + i * 1.1;
        g.add(box(1.08, 1.5, 1.6, M(cols[i]), x, 0.75, 0));
        g.add(roof(1.15, 1.75, 0.8, M(0x4a4e5c), x, 1.9, 0));
        g.add(box(0.36, 0.7, 0.05, M([0x2f5d8a, 0x7a2f3a, 0x2f6a4a, 0x3a3a3a][i]), x - 0.2, 0.35, 0.81));
        g.add(box(0.3, 0.32, 0.05, winMat, x + 0.25, 0.55, 0.81));
        g.add(box(0.3, 0.32, 0.05, winMat, x + 0.25, 1.15, 0.81));
        g.add(box(0.3, 0.32, 0.05, winMat, x - 0.2, 1.15, 0.81));
        g.add(box(0.25, 0.5, 0.25, M(0x8b4a36), x + 0.3, 2.3, -0.3));
        if (i !== 1) {
          g.add(box(0.55, 0.42, 0.28, M(0xf2f2ee), x, 0.21, 1.05));
          var fan = new T.Group(); fan.position.set(x, 0.22, 1.2);
          var disc2 = mesh(new T.CylinderGeometry(0.15, 0.15, 0.02, 14), M(0x2b2f3a)); disc2.rotation.x = Math.PI / 2; fan.add(disc2);
          for (var b = 0; b < 3; b++) { var bl = box(0.04, 0.24, 0.01, M(0xbfc5cf)); bl.position.z = 0.02; bl.rotation.z = b * 2.094; fan.add(bl); }
          fan.userData.spin = 4; spinners.push(fan); g.add(fan);
        }
      }
      g.add(box(1.5, 0.5, 0.06, glowMat(0xB9DE78), 0, 2.85, -0.9));
      g.userData.h = 3.6; place('epc', g, slots.epc);
    }]);

    steps.push(['Racking the weights…', function () {
      var g = new T.Group(), wall = M(0x3a3f4d), steel = M(0x22252e, { metalness: 0.5, roughness: 0.4 });
      g.add(box(3.0, 1.5, 2.0, wall, 0, 0.75, 0));
      g.add(box(3.1, 0.12, 2.1, M(0xF59E5B), 0, 1.55, 0));
      g.add(box(2.6, 0.9, 0.05, M(0xffd2a6, { emissive: 0xff9a4a, emissiveIntensity: 0.4 }), 0, 0.7, 1.01));
      var bar = cyl(0.06, 0.06, 2.4, 8, M(0xc8ccd4, { metalness: 0.6, roughness: 0.3 }), 0, 2.15, 0); bar.rotation.z = Math.PI / 2; g.add(bar);
      [-1, 1].forEach(function (sd) { for (var p = 0; p < 2; p++) { var pl = cyl(0.42 - p * 0.1, 0.42 - p * 0.1, 0.14, 16, steel, sd * (0.95 - p * 0.16), 2.15, 0); pl.rotation.z = Math.PI / 2; g.add(pl); } });
      g.add(cyl(0.05, 0.05, 0.5, 6, M(0x34384a), -0.9, 1.85, 0)); g.add(cyl(0.05, 0.05, 0.5, 6, M(0x34384a), 0.9, 1.85, 0));
      g.add(box(0.6, 0.6, 0.6, M(0x6b4a2e), 1.9, 0.3, 0.5));
      g.add(box(0.45, 0.45, 0.45, M(0x6b4a2e), 1.95, 0.83, 0.5));
      g.userData.h = 3.4; place('gym', g, slots.gym);
    }]);

    steps.push(['Planting the trees…', function () {
      var greens = [0x4f8f3e, 0x5fa34a, 0x3f7a36, 0x86b54c, 0xd9893a, 0xc75b39, 0xe2b04a];
      var trunk = M(0x6b4a2e), placed = 0, tries = 0, avoid = [];
      for (var k in buildings) avoid.push(buildings[k].position);
      while (placed < 70 && tries < 700) {
        tries++;
        var a = Math.random() * Math.PI * 2, r = 4.2 + Math.random() * 6.3, x = Math.cos(a) * r, z = Math.sin(a) * r;
        var ok = true;
        for (var i = 0; i < avoid.length; i++) { var dx = avoid[i].x - x, dz = avoid[i].z - z; if (dx * dx + dz * dz < 2.4 * 2.4) { ok = false; break; } }
        for (var s = 0; s < 7 && ok; s++) { var sp = slotPos(s); var ang = Math.atan2(z, x) - sp.a; ang = Math.atan2(Math.sin(ang), Math.cos(ang)); if (Math.abs(ang) < 0.14 && r < 6) ok = false; }
        var pa = Math.atan2(z, x) - 2.49; pa = Math.atan2(Math.sin(pa), Math.cos(pa)); if (Math.hypot(x - (-3.976), z - (3.032)) < 2.1 || (Math.abs(pa) * r < 0.9 && r > 5)) ok = false;
        if (!ok) continue;
        var t = new T.Group(), sz = 0.7 + Math.random() * 0.6, c = greens[Math.floor(Math.random() * greens.length)];
        t.add(cyl(0.08 * sz, 0.12 * sz, 0.7 * sz, 5, trunk, 0, 0.35 * sz, 0));
        if (Math.random() < 0.55) { t.add(mesh(new T.ConeGeometry(0.55 * sz, 1.1 * sz, 7), M(c), 0, 1.05 * sz, 0)); t.add(mesh(new T.ConeGeometry(0.42 * sz, 0.85 * sz, 7), M(c), 0, 1.55 * sz, 0)); }
        else t.add(mesh(new T.IcosahedronGeometry(0.55 * sz, 0), M(c), 0, 1.05 * sz, 0));
        t.position.set(x, 0.45, z); t.rotation.y = Math.random() * 6; island.add(t); placed++;
      }
      for (var b = 0; b < 26; b++) { var a2 = Math.random() * 6.28, r2 = 9.6 + Math.random() * 1.1; island.add(mesh(new T.DodecahedronGeometry(0.15 + Math.random() * 0.15, 0), M(0x9a9488), Math.cos(a2) * r2, 0.5, Math.sin(a2) * r2)); }
    }]);

    var drones = [], stars;
    steps.push(['Waking the agents…', function () {
      var keys = Object.keys(buildings);
      AGENTS.forEach(function (ag, i) {
        var d = new T.Group(), col = new T.Color(ag.accent);
        var body = mesh(new T.SphereGeometry(0.26, 14, 10), M(0xf4f1ea, { roughness: 0.5 })); body.scale.y = 0.85; d.add(body);
        d.add(mesh(new T.CylinderGeometry(0.27, 0.27, 0.1, 16), M(0x2b2f3a), 0, 0.02, 0));
        var eye = mesh(new T.SphereGeometry(0.08, 8, 6), M(col, { emissive: col, emissiveIntensity: 1.4 }), 0, 0.03, 0.24); d.add(eye);
        d.add(cyl(0.02, 0.02, 0.2, 5, M(0x2b2f3a), 0, 0.3, 0));
        var rotor = new T.Group(); rotor.position.y = 0.42;
        for (var b = 0; b < 2; b++) { var bl = box(0.7, 0.02, 0.07, M(0x2b2f3a)); bl.rotation.y = b * Math.PI / 2; rotor.add(bl); }
        rotor.userData.spin = 22; spinners.push(rotor); d.add(rotor);
        var pkt = mesh(new T.BoxGeometry(0.18, 0.18, 0.18), M(col, { emissive: col, emissiveIntensity: 0.9 }), 0, -0.36, 0); d.add(pkt);
        d.traverse(function (o) { o.userData.agent = i; if (o.isMesh) clickables.push(o); });
        var from = keys[i % keys.length];
        d.userData = { agent: i, from: from, to: keys[(i + 2) % keys.length], t: Math.random(), dur: 5 + i, wait: 0, pkt: pkt };
        d.position.copy(topOf(from)); island.add(d); drones.push(d);
      });
      var sg = new T.BufferGeometry(), sp = [];
      for (var s = 0; s < 700; s++) { var th = Math.random() * 6.28, ph = Math.random() * 1.3, rr = 120; sp.push(Math.cos(th) * Math.sin(ph) * rr, Math.cos(ph) * rr * 0.9 + 6, Math.sin(th) * Math.sin(ph) * rr); }
      sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
      stars = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: 0.55, transparent: true, opacity: 0, fog: false }));
      scene.add(stars);
    }]);

    function topOf(key) { var b = buildings[key]; var v = b.position.clone(); v.y += (b.userData.h || 3) + 0.9; return v; }

    steps.push(['Lighting the lamps…', function () {
      Object.keys(buildings).forEach(function (k) {
        var el = document.createElement('button');
        el.type = 'button'; el.className = 'yard-tag'; el.style.setProperty('--c', INFO[k].accent);
        el.innerHTML = '<i></i>' + INFO[k].name; el.dataset.key = k;
        el.addEventListener('click', function (e) { e.stopPropagation(); openPop(k); });
        labelsEl.appendChild(el); buildings[k].userData.tag = el;
      });
    }]);

    /* --- run the build steps with an honest progress ring --- */
    var si = 0, C = 2 * Math.PI * 52;
    function next() {
      if (si >= steps.length) { finish(); return; }
      msg.textContent = steps[si][0];
      requestAnimationFrame(function () {
        steps[si][1](); si++;
        var p = si / steps.length; ringFg.style.strokeDashoffset = C * (1 - p); pct.textContent = Math.round(p * 100) + '%';
        setTimeout(next, reduce ? 0 : 140);
      });
    }
    next();

    /* --- time of day --- */
    var follow = true, hour = 12;
    var skyDay = [[0.55, 0.69, 0.9], [0.98, 0.79, 0.65]], skyDusk = [[0.36, 0.33, 0.62], [0.98, 0.58, 0.47]], skyNight = [[0.04, 0.06, 0.16], [0.16, 0.13, 0.32]];
    function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function css(c) { return 'rgb(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ')'; }
    function setHour(h) {
      hour = h;
      var ang = (h - 6) / 12 * Math.PI, el = Math.sin(ang), d = Math.max(0, Math.min(1, el * 1.6 + 0.05));
      var dusk = Math.max(0, 1 - Math.abs(el) * 3.2) * (el > -0.35 ? 1 : 0);
      sun.position.set(Math.cos(ang) * 26, Math.max(2, el * 26), 10);
      sun.intensity = 2.6 * d; sun.color.setRGB(1, 0.78 + 0.18 * d - 0.1 * dusk, 0.6 + 0.35 * d - 0.15 * dusk);
      moon.intensity = 0.55 * (1 - d);
      hemi.intensity = 0.3 + 0.45 * d;
      hemi.color.setRGB(0.55 + 0.3 * d, 0.62 + 0.27 * d, 0.95);
      var top, bot;
      if (el >= 0) { top = mix(skyDusk[0], skyDay[0], Math.min(1, el * 2.4)); bot = mix(skyDusk[1], skyDay[1], Math.min(1, el * 2.4)); }
      else { var n = Math.min(1, -el * 3); top = mix(skyDusk[0], skyNight[0], n); bot = mix(skyDusk[1], skyNight[1], n); }
      stage.style.background = 'linear-gradient(180deg,' + css(top) + ' 0%,' + css(bot) + ' 100%)';
      scene.fog.color.setRGB(bot[0], bot[1], bot[2]);
      var night = 1 - d;
      winMat.emissiveIntensity = 0.15 + 1.6 * night; lampMat.emissiveIntensity = 0.15 + 2.2 * night;
      lamps.forEach(function (l) { l.intensity = 2.2 * night; });
      if (stars) stars.material.opacity = Math.max(0, night - 0.25);
      renderer.toneMappingExposure = 0.95 + 0.35 * night;
      var hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
      clockEl.textContent = (follow ? 'Live · ' : '') + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      slider.value = h;
      root.classList.toggle('is-night', night > 0.6);
      var hands = buildings.hq && buildings.hq.userData.hands;
      if (hands) hands.forEach(function (p) { p[0].rotation.z = -((h % 12) / 12) * Math.PI * 2; p[1].rotation.z = -((h % 1)) * Math.PI * 2; });
    }
    function realHour() { var n = new Date(); return n.getHours() + n.getMinutes() / 60; }
    slider.addEventListener('input', function () { follow = false; liveBtn.setAttribute('aria-pressed', 'false'); setHour(+slider.value); });
    liveBtn.addEventListener('click', function () { follow = true; liveBtn.setAttribute('aria-pressed', 'true'); setHour(realHour()); });

    /* --- interaction --- */
    var ray = new T.Raycaster(), ptr = new T.Vector2(), hoverKey = null, openKey = null, downAt = null;
    function pick(e) {
      var r = renderer.domElement.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1; ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      var hit = ray.intersectObjects(clickables, false)[0];
      if (!hit) return null;
      if (hit.object.userData.agent !== undefined) return 'agent:' + hit.object.userData.agent;
      return hit.object.userData.key || null;
    }
    renderer.domElement.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var k = pick(e); hoverKey = k; renderer.domElement.style.cursor = k ? 'pointer' : 'grab';
    });
    renderer.domElement.addEventListener('pointerdown', function (e) { downAt = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', function (e) {
      if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
      var k = pick(e); if (k) { stopTour(); openPop(k); } else closePop();
    });
    function openPop(k) {
      openKey = k;
      var info, accent;
      if (k.indexOf('agent:') === 0) { var a = AGENTS[+k.split(':')[1]]; info = { tag: 'Hermes agent', name: a.name, desc: a.desc, lines: ['Part of the Hermes agent team', 'Outputs wait for human approval'], link: null }; accent = a.accent; }
      else { info = INFO[k]; accent = info.accent; }
      pop.style.setProperty('--c', accent);
      pop.innerHTML = '<button type="button" class="yard-x" aria-label="Close">\u00d7</button><div class="yard-pt">' + info.tag + '</div><h4>' + info.name + '</h4><p>' + info.desc + '</p>' + (info.uses ? '<ol class="yard-uses">' + info.uses.map(function (l) { return '<li><span>' + l + '</span></li>'; }).join('') + '</ol><div class="yard-tagsline">' + info.lines.join(' \u00b7 ') + '</div>' : '<ul>' + info.lines.map(function (l) { return '<li><i></i>' + l + '</li>'; }).join('') + '</ul>') + (info.link ? '<a href="' + info.link + '">Visit ' + info.link.replace('https://', '') + ' \u2197</a>' : '');
      pop.querySelector('.yard-x').addEventListener('click', closePop);
      pop.classList.add('on');
      controls.autoRotate = false;
    }
    function closePop() { openKey = null; pop.classList.remove('on'); if (!fly) controls.autoRotate = !reduce && autoOn && !tourOn && caseIdx < 0; }
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });

    /* --- camera fly + use cases --- */
    var fly = null, casesEl = root.querySelector('.yard-cases'), caseBtns = [], tourOn = false, tourTimer = null, caseIdx = -1;
    function flyTo(tp, tt) { fly = { t: 0, fp: camera.position.clone(), ft: controls.target.clone(), tp: tp, tt: tt }; controls.autoRotate = false; }
    function flyToKey(key) {
      var b = buildings[key === 'agents' ? 'hq' : key]; if (!b) return;
      var tt = b.position.clone(); tt.y += (b.userData.h || 3) * 0.45;
      var dir = new T.Vector3(b.position.x, 0, b.position.z);
      if (dir.lengthSq() < 0.5) dir.set(1, 0, 1);
      dir.normalize();
      var tp = tt.clone().add(dir.multiplyScalar(W < 640 ? 15 : 12)); tp.y = tt.y + 6.5;
      flyTo(tp, tt);
    }
    function runCase(i, fromTour) {
      var c = CASES[i]; caseIdx = i;
      caseBtns.forEach(function (b, j) { b.classList.toggle('on', j === i); b.setAttribute('aria-pressed', j === i); });
      flyToKey(c.key); openPop(c.key);
      var d = drones[c.key === 'agents' ? 0 : i % drones.length];
      if (d) { var u = d.userData; u.from = c.from; u.to = c.to; u.t = 0; u.wait = 0; u.dur = 4.5; d.position.copy(topOf(c.from)); }
      if (!fromTour) stopTour();
    }
    function stopTour() { tourOn = false; clearInterval(tourTimer); var b = root.querySelector('[data-act="tour"]'); if (b) b.setAttribute('aria-pressed', 'false'); }
    function startTour() { tourOn = true; root.querySelector('[data-act="tour"]').setAttribute('aria-pressed', 'true'); runCase((caseIdx + 1) % CASES.length, true); tourTimer = setInterval(function () { runCase((caseIdx + 1) % CASES.length, true); }, 7500); }
    CASES.forEach(function (c, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'yard-case'; b.style.setProperty('--c', INFO[c.key].accent);
      b.setAttribute('aria-pressed', 'false'); b.innerHTML = '<i></i>' + c.label;
      b.addEventListener('click', function () { runCase(i); });
      casesEl.appendChild(b); caseBtns.push(b);
    });

    /* --- toolbar --- */
    var autoOn = !reduce, labelsOn = true;
    function zoom(f) { var off = camera.position.clone().sub(controls.target); var len = Math.max(11, Math.min(36, off.length() * f)); off.setLength(len); camera.position.copy(controls.target).add(off); }
    root.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function () {
        var act = b.getAttribute('data-act');
        if (act === 'in') zoom(0.82);
        if (act === 'out') zoom(1.22);
        if (act === 'reset') { stopTour(); caseIdx = -1; closePop(); flyTo(homePos.clone(), new T.Vector3(0, 1.2, 0)); caseBtns.forEach(function (x) { x.classList.remove('on'); }); }
        if (act === 'tour') { if (tourOn) stopTour(); else startTour(); }
        if (act === 'spin') { autoOn = !autoOn; controls.autoRotate = autoOn && !openKey; b.setAttribute('aria-pressed', autoOn); }
        if (act === 'labels') { labelsOn = !labelsOn; labelsEl.style.display = labelsOn ? '' : 'none'; b.setAttribute('aria-pressed', labelsOn); }
        if (act === 'orbit') { controls.enableRotate = !controls.enableRotate; renderer.domElement.style.touchAction = controls.enableRotate ? 'none' : 'pan-y'; b.setAttribute('aria-pressed', controls.enableRotate); say(controls.enableRotate ? 'Drag to orbit is on' : 'Page scrolling restored'); }
        if (act === 'full') {
          try {
            if (document.fullscreenElement) document.exitFullscreen();
            else { var p = root.requestFullscreen ? root.requestFullscreen() : null; if (p && p.catch) p.catch(function () { say('Full screen isn’t available here'); }); if (!p && !root.requestFullscreen) say('Full screen isn’t available here'); }
          } catch (err) { say('Full screen isn’t available here'); }
        }
      });
    });

    function resize() { W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return; renderer.setSize(W, H); camera.aspect = W / H; camera.fov = W < 640 ? 46 : 34; camera.updateProjectionMatrix(); }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);

    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(root);

    /* --- speech bubbles --- */
    var bubbleAgent = -1, bubbleUntil = 0, nextBubble = 4;
    function speak(now) {
      if (now > nextBubble && drones.length) {
        bubbleAgent = Math.floor(Math.random() * drones.length);
        var a = AGENTS[bubbleAgent];
        bubble.innerHTML = '<b style="color:' + a.accent + '">' + a.name + '</b>' + a.says[Math.floor(Math.random() * a.says.length)];
        bubbleUntil = now + 3.6; nextBubble = now + 9 + Math.random() * 4; bubX = -1;
      }
    }

    var camDir = new T.Vector3(1, 0, 1).normalize(), tmpV = new T.Vector3(), bubX = -1, bubY = -1;
    var v3 = new T.Vector3(), clock = new T.Clock(), elapsed = 0, keys;
    function front(pos) { tmpV.set(pos.x, 0, pos.z); if (tmpV.lengthSq() < 1) return 1; tmpV.normalize(); return tmpV.dot(camDir); }
    function finish() {
      setHour(realHour());
      keys = Object.keys(buildings);
      loader.classList.add('done');
      root.classList.add('ready');
      setTimeout(function () { loader.style.display = 'none'; }, 700);
      renderer.setAnimationLoop(tick);
    }
    var lastFollow = 0;
    function tick() {
      var dt = Math.min(clock.getDelta(), 0.05);
      if (!visible) return;
      elapsed += dt;
      if (follow && elapsed - lastFollow > 20) { lastFollow = elapsed; setHour(realHour()); }
      if (fly) {
        fly.t = Math.min(1, fly.t + dt / (reduce ? 0.01 : 1.5));
        var fe = fly.t < 0.5 ? 4 * fly.t * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 3) / 2;
        camera.position.lerpVectors(fly.fp, fly.tp, fe); controls.target.lerpVectors(fly.ft, fly.tt, fe);
        if (fly.t >= 1) fly = null;
      }
      controls.update();
      camDir.set(camera.position.x - controls.target.x, 0, camera.position.z - controls.target.z).normalize();
      var slow = reduce ? 0.25 : 1;
      spinners.forEach(function (s) {
        if (s.userData.spin) s.rotation[s.userData.spin > 10 ? 'y' : 'z'] += s.userData.spin * dt * slow;
        if (s.userData.blink) s.visible = Math.sin(elapsed * s.userData.blink * 2 + s.position.x * 7) > -0.55;
        if (s.userData.float) s.position.y = s.userData.float.y + Math.sin(elapsed * s.userData.float.s) * 0.25;
      });
      pulses.forEach(function (r) { var p = ((elapsed * 0.45 * slow) + r.userData.phase) % 1; r.scale.setScalar(1 + p * 7); r.material.opacity = 0.75 * (1 - p); });
      var bc = buildings.lg && buildings.lg.userData.beacon; if (bc) bc.material.emissiveIntensity = 0.6 + Math.abs(Math.sin(elapsed * 2.2)) * 1.4;
      // drones
      drones.forEach(function (d) {
        var u = d.userData;
        if (u.wait > 0) { u.wait -= dt; d.position.y = topOf(u.from).y + Math.sin(elapsed * 3 + u.agent) * 0.08; return; }
        u.t += dt / u.dur * slow;
        if (u.t >= 1) { u.from = u.to; do { u.to = keys[Math.floor(Math.random() * keys.length)]; } while (u.to === u.from); u.t = 0; u.wait = 0.8 + Math.random(); u.dur = 4 + Math.random() * 3; return; }
        var a = topOf(u.from), b = topOf(u.to), t = u.t, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        var mid = a.clone().lerp(b, 0.5); mid.y = Math.max(a.y, b.y) + 2.6;
        v3.set((1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * mid.x + e * e * b.x, (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * mid.y + e * e * b.y, (1 - e) * (1 - e) * a.z + 2 * (1 - e) * e * mid.z + e * e * b.z);
        var dx = v3.x - d.position.x, dz = v3.z - d.position.z;
        if (dx * dx + dz * dz > 1e-6) d.rotation.y = Math.atan2(dx, dz);
        d.rotation.z = Math.sin(elapsed * 2 + u.agent) * 0.08;
        d.position.copy(v3);
        u.pkt.position.y = -0.36 + Math.sin(elapsed * 4 + u.agent) * 0.03;
      });
      // hover scale
      for (var k in buildings) { var g = buildings[k], target = (hoverKey === k || openKey === k) ? 1.06 : 1; var s = g.scale.x + (target - g.scale.x) * 0.15; g.scale.setScalar(s); }
      renderer.render(scene, camera);
      // labels + popup + bubble positions
      var rw = stage.clientWidth, rh = stage.clientHeight;
      if (labelsEl.style.display !== 'none') for (var k2 in buildings) {
        var b2 = buildings[k2]; v3.copy(b2.position); v3.y += b2.userData.h + 0.35; v3.project(camera);
        var tag = b2.userData.tag; if (!tag) continue;
        var behind = v3.z > 1, fr = front(b2.position), op = behind ? 0 : Math.max(0, Math.min(1, (fr + 0.25) / 0.45));
        if (openKey && openKey !== k2) op *= 0.35; if (openKey === k2) op = 0;
        tag.style.transform = 'translate(-50%,-100%) translate(' + ((v3.x + 1) / 2 * rw).toFixed(1) + 'px,' + ((1 - v3.y) / 2 * rh).toFixed(1) + 'px)';
        tag.style.opacity = op.toFixed(2); tag.style.pointerEvents = op > 0.5 ? 'auto' : 'none'; tag.classList.toggle('hot', hoverKey === k2);
      }
      if (openKey) {
        var obj = openKey === 'agents' ? drones[0] : (openKey.indexOf('agent:') === 0 ? drones[+openKey.split(':')[1]] : buildings[openKey]);
        v3.copy(obj.position); v3.y += (obj.userData.h || 0.4) + 0.6; v3.project(camera);
        var px = (v3.x + 1) / 2 * rw, py = (1 - v3.y) / 2 * rh;
        var pw = pop.offsetWidth, ph = pop.offsetHeight;
        px = Math.max(pw / 2 + 12, Math.min(rw - pw / 2 - 12, px)); py = Math.max(ph + 60, Math.min(rh - 60, py));
        pop.style.transform = 'translate(-50%,-100%) translate(' + px.toFixed(1) + 'px,' + (py - 14).toFixed(1) + 'px)';
      }
      speak(elapsed);
      if (bubbleAgent >= 0 && drones[bubbleAgent] && elapsed < bubbleUntil) {
        var dp = drones[bubbleAgent].position; v3.copy(dp); v3.y += 0.7; v3.project(camera);
        var bx = (v3.x + 1) / 2 * rw, by = (1 - v3.y) / 2 * rh - 8;
        var vis = v3.z < 1 && front(dp) > -0.15 && bx > 60 && bx < rw - 60 && by > 90 && by < rh - 60 && !openKey;
        if (bubX < 0) { bubX = bx; bubY = by; } bubX += (bx - bubX) * 0.25; bubY += (by - bubY) * 0.25;
        bubble.style.transform = 'translate(-50%,-100%) translate(' + bubX.toFixed(1) + 'px,' + bubY.toFixed(1) + 'px)';
        bubble.classList.toggle('on', vis);
      } else bubble.classList.remove('on');
    }
  }

  /* lazy start when the section nears the viewport */
  var small = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  if (small) {
    // phones: wait for a tap so the 3D scene never slows the page
    root.querySelector('.yard-ring').style.display = 'none'; pct.style.display = 'none';
    msg.innerHTML = '';
    var go = document.createElement('button'); go.type = 'button'; go.className = 'yard-go';
    go.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>Explore the 3D island';
    loader.insertBefore(go, msg); msg.textContent = 'Every venture as a building you can explore';
    go.addEventListener('click', function () { go.remove(); root.querySelector('.yard-ring').style.display = ''; pct.style.display = ''; start(); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '300px' });
    io.observe(root);
  } else start();
})();
