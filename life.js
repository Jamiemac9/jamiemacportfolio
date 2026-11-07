/* My life in motion: a cinematic travel story built from data/places.json.
   Trips become chapters (grouped by country and time); each opens with a title card
   while a small globe flies there from home, then the photos play full-frame. */
(function () {
  var root = document.getElementById('life');
  if (!root) return;
  var stage = root.querySelector('.lm-stage');
  var frames = [].slice.call(root.querySelectorAll('.lm-frame'));
  var textEl = root.querySelector('.lm-text'), chEl = root.querySelector('.lm-ch'), titleEl = root.querySelector('.lm-title'), introEl = root.querySelector('.lm-intro'), capEl = root.querySelector('.lm-cap');
  var card = root.querySelector('.lm-card'), segEl = root.querySelector('.lm-seg'), chapsEl = root.querySelector('.lm-chapters');
  var globeEl = root.querySelector('.lm-globe'), distEl = root.querySelector('.lm-dist'), msg = root.querySelector('.lm-msg');
  var playBtn = root.querySelector('[data-lm="play"]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DWELL = 4600, CARD = 2600;

  function getJSON(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  function km(a, b) {
    var t = Math.PI / 180, dLat = (b.lat - a.lat) * t, dLon = (b.lon - a.lon) * t;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
  }
  function days(a, b) { return Math.abs((new Date(b) - new Date(a)) / 864e5) || 0; }
  function pad(n) { return String(n).padStart(2, '0'); }

  var started = false;
  function start() {
    if (started) return; started = true;
    Promise.all([getJSON('data/places.json'), getJSON('data/land.json')]).then(function (r) { build(r[0], r[1]); })
      .catch(function () { msg.textContent = 'The story couldn’t load here. It works on the live site.'; });
  }

  function build(data, land) {
    var home = data.home, stories = data.stories || {};
    var photos = (data.photos || []).slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    if (!photos.length) { msg.textContent = 'Photos coming soon.'; return; }

    // ---- chapters: a new one when the country changes or there is a long gap ----
    var chapters = [], seen = {};
    photos.forEach(function (p) {
      var c = chapters[chapters.length - 1];
      if (!c || c.country !== p.country || days(c.last, p.date) > 20) {
        seen[p.country] = (seen[p.country] || 0) + 1;
        var key = p.country + (seen[p.country] > 1 ? '#' + seen[p.country] : '');
        var st = stories[key] || {};
        c = { key: key, country: p.country, title: st.title || p.place || p.country, intro: st.intro || '', photos: [], last: p.date };
        chapters.push(c);
      }
      c.photos.push(p); c.last = p.date;
    });
    chapters.forEach(function (c) {
      c.lat = c.photos.reduce(function (m, p) { return m + p.lat; }, 0) / c.photos.length;
      c.lon = c.photos.reduce(function (m, p) { return m + p.lon; }, 0) / c.photos.length;
      c.km = km(home, c);
    });
    var countries = {}; chapters.forEach(function (c) { countries[c.country] = 1; });
    var sub = document.getElementById('lmsub');
    if (sub) sub.textContent = chapters.length + ' journeys, ' + Object.keys(countries).length + ' countries, ' + photos.length + ' frames, each pinned where it was taken. Let it play, tap to move through it, or jump to a chapter.';

    // chapter buttons
    var chapBtns = chapters.map(function (c, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'lm-chap';
      b.innerHTML = '<small>Chapter ' + pad(i + 1) + '</small><b>' + c.title + '</b><span>' + c.country + '</span>';
      b.addEventListener('click', function () { goChapter(i, true); });
      chapsEl.appendChild(b); return b;
    });

    var globe = makeGlobe(land, home, chapters);

    // ---- playback ----
    var ci = 0, pi = 0, front = 0, timer = null, playing = !reduce, inView = false, busy = false;
    function setPlaying(on) {
      playing = on; root.classList.toggle('paused', !on);
      playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      playBtn.querySelector('.i-pause').style.display = on ? '' : 'none';
      playBtn.querySelector('.i-play').style.display = on ? 'none' : '';
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      var cur = segEl.querySelector('i.cur');
      if (cur) { cur.classList.remove('run'); void cur.offsetWidth; if (playing && inView) cur.classList.add('run'); }
      if (playing && inView && !busy) timer = setTimeout(next, DWELL);
    }
    function bars() {
      var c = chapters[ci];
      segEl.innerHTML = c.photos.map(function (_, j) { return '<i class="' + (j < pi ? 'done' : j === pi ? 'cur' : '') + '"></i>'; }).join('');
      segEl.style.setProperty('--dw', DWELL + 'ms');
      chapBtns.forEach(function (b, j) { b.classList.toggle('on', j === ci); b.style.setProperty('--p', j < ci ? '100%' : j === ci ? ((pi + 1) / c.photos.length * 100) + '%' : '0%'); });
    }
    function show(p) {
      var f = frames[1 - front], img = f.querySelector('img');
      var done = false;
      function swap() {
        if (done) return; done = true;
        f.querySelector('.lm-bg').style.backgroundImage = 'url("' + p.src + '")';
        var wide = img.naturalWidth / Math.max(1, img.naturalHeight) > 1.25 && stage.clientWidth / stage.clientHeight > 1.2;
        f.querySelector('.lm-fg').classList.toggle('wide', wide);
        img.style.setProperty('--ox', (30 + Math.random() * 40) + '%'); img.style.setProperty('--oy', (30 + Math.random() * 40) + '%');
        img.style.setProperty('--tx', ((Math.random() - 0.5) * 3).toFixed(2) + '%'); img.style.setProperty('--ty', ((Math.random() - 0.5) * 3).toFixed(2) + '%');
        img.style.setProperty('--kb', (DWELL + 2600) + 'ms');
        img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
        f.classList.add('on'); frames[front].classList.remove('on'); front = 1 - front;
      }
      img.onload = swap; img.alt = p.caption || p.place || '';
      img.src = p.src;
      if (img.complete && img.naturalWidth) swap();
      setTimeout(swap, 1500);
      capEl.classList.add('swap');
      setTimeout(function () { capEl.textContent = [p.caption, p.place].filter(Boolean).filter(function (v, k, a) { return a.indexOf(v) === k; }).join('  ·  '); capEl.classList.remove('swap'); }, 350);
      // preload the next photo
      var n = nextRef(); var pre = new Image(); pre.src = chapters[n[0]].photos[n[1]].src;
    }
    function nextRef() { var c = chapters[ci]; return pi + 1 < c.photos.length ? [ci, pi + 1] : [(ci + 1) % chapters.length, 0]; }
    function goChapter(i, user) {
      ci = (i + chapters.length) % chapters.length; pi = 0;
      var c = chapters[ci];
      clearTimeout(timer); busy = true;
      card.querySelector('.k').textContent = 'Chapter ' + pad(ci + 1);
      card.querySelector('h3').textContent = c.title;
      card.querySelector('p').textContent = c.country + '  ·  ' + c.km.toLocaleString('en-GB') + ' km from ' + home.name;
      card.classList.remove('on'); void card.offsetWidth; card.classList.add('on');
      textEl.classList.add('swap');
      if (globe) globe.flyTo(ci);
      distEl.innerHTML = '<b>' + c.km.toLocaleString('en-GB') + '</b> km from ' + home.name;
      show(c.photos[0]); bars();
      setTimeout(function () {
        chEl.textContent = 'Chapter ' + pad(ci + 1) + '  ·  ' + c.country;
        titleEl.textContent = c.title; introEl.textContent = c.intro;
        textEl.classList.remove('swap');
      }, 500);
      setTimeout(function () { card.classList.remove('on'); busy = false; schedule(); }, reduce ? 900 : CARD);
      if (user && !playing && !reduce) setPlaying(true);
    }
    function goPhoto(j) {
      var c = chapters[ci];
      if (j >= c.photos.length) return goChapter(ci + 1);
      if (j < 0) { if (ci === 0) return; ci--; pi = chapters[ci].photos.length - 1; goChapterAt(pi); return; }
      pi = j; show(c.photos[pi]); bars(); schedule();
    }
    function goChapterAt(j) {
      var c = chapters[ci]; pi = j; card.classList.remove('on'); busy = false;
      chEl.textContent = 'Chapter ' + pad(ci + 1) + '  ·  ' + c.country; titleEl.textContent = c.title; introEl.textContent = c.intro;
      distEl.innerHTML = '<b>' + c.km.toLocaleString('en-GB') + '</b> km from ' + home.name;
      if (globe) globe.flyTo(ci);
      show(c.photos[pi]); bars(); schedule();
    }
    function next() { goPhoto(pi + 1); }
    function prev() { goPhoto(pi - 1); }

    root.querySelector('[data-lm="next"]').addEventListener('click', function (e) { e.stopPropagation(); next(); });
    root.querySelector('[data-lm="prev"]').addEventListener('click', function (e) { e.stopPropagation(); prev(); });
    playBtn.addEventListener('click', function (e) { e.stopPropagation(); setPlaying(!playing); });
    // tap left third = back, elsewhere = forward (like stories); swipe works too
    var down = null;
    stage.addEventListener('pointerdown', function (e) { down = [e.clientX, e.clientY]; });
    stage.addEventListener('pointerup', function (e) {
      if (!down || e.target.closest('button')) { down = null; return; }
      var dx = e.clientX - down[0], dy = e.clientY - down[1]; down = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); return; }
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { var r = stage.getBoundingClientRect(); (e.clientX - r.left) < r.width / 3 ? prev() : next(); }
    });
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      if (e.key === ' ') { setPlaying(!playing); e.preventDefault(); }
    });
    stage.addEventListener('mouseenter', function () { if (playing) { clearTimeout(timer); root.classList.add('paused'); } });
    stage.addEventListener('mouseleave', function () { if (playing) { root.classList.remove('paused'); schedule(); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; if (globe) globe.visible = inView; schedule(); }, { threshold: 0.35 }).observe(stage);
    else inView = true;

    msg.style.display = 'none';
    setPlaying(playing);
    goChapter(0);
  }

  // ---- small globe that flies between chapters ----
  function makeGlobe(land, home, chapters) {
    if (!window.THREE) return null;
    var T = THREE;
    try { var tc = document.createElement('canvas'); if (!(tc.getContext('webgl2') || tc.getContext('webgl'))) return null; } catch (e) { return null; }
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    var S = globeEl.clientWidth || 180;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(S, S); renderer.outputEncoding = T.sRGBEncoding;
    globeEl.appendChild(renderer.domElement);
    var scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    function vec(lat, lon, r) { var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180; return new T.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)); }
    var DIST = 4.4;
    scene.add(new T.Mesh(new T.SphereGeometry(0.995, 48, 36), new T.MeshBasicMaterial({ color: 0x0d1220 })));
    scene.add(new T.Mesh(new T.SphereGeometry(1.1, 48, 36), new T.ShaderMaterial({
      uniforms: { c: { value: new T.Color(0xF2B544) } }, transparent: true, side: T.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.6 - dot(vN, vec3(0.0,0.0,1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * i * 0.6; }'
    })));
    var pos = []; for (var i = 0; i < land.length; i += 2) { var v = vec(land[i], land[i + 1], 1.0); pos.push(v.x, v.y, v.z); }
    var lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    scene.add(new T.Points(lg, new T.PointsMaterial({ color: 0xb4bdd3, size: 0.02, transparent: true, opacity: 0.9 })));
    function dot(lat, lon, col, r) { var m = new T.Mesh(new T.SphereGeometry(r, 12, 8), new T.MeshBasicMaterial({ color: col })); m.position.copy(vec(lat, lon, 1.01)); scene.add(m); return m; }
    dot(home.lat, home.lon, 0xF2B544, 0.03);
    var pins = chapters.map(function (c) { return dot(c.lat, c.lon, 0xffffff, 0.026); });
    var arcs = chapters.map(function (c) {
      var A = vec(home.lat, home.lon, 1), B = vec(c.lat, c.lon, 1), mid = A.clone().add(B).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(1 + A.distanceTo(B) * 0.42);
      var curve = new T.QuadraticBezierCurve3(A, mid, B);
      var g = new T.BufferGeometry().setFromPoints(curve.getPoints(80));
      var mat = new T.LineBasicMaterial({ color: 0xF2B544, transparent: true, opacity: 0.18 });
      scene.add(new T.Line(g, mat)); g.setDrawRange(0, 81);
      return { curve: curve, mat: mat, geo: g };
    });
    var plane = new T.Mesh(new T.SphereGeometry(0.035, 12, 8), new T.MeshBasicMaterial({ color: 0xffffff })); scene.add(plane);
    var ring = new T.Mesh(new T.RingGeometry(0.05, 0.065, 32), new T.MeshBasicMaterial({ color: 0xF2B544, transparent: true, side: T.DoubleSide })); scene.add(ring);
    camera.position.copy(vec(home.lat - 10, home.lon, DIST)); camera.lookAt(0, 0, 0);
    var fly = null, trip = null, cur = 0, api = { visible: true };
    api.flyTo = function (i) {
      cur = i; var c = chapters[i];
      var mid = vec((home.lat + c.lat) / 2 - 8, (home.lon + c.lon) / 2, DIST), to = vec(c.lat - 8, c.lon, DIST);
      fly = { t: 0, a: camera.position.clone(), m: mid, b: to };
      trip = { t: 0, curve: arcs[i].curve };
      arcs.forEach(function (a, j) { a.mat.opacity = j === i ? 0.95 : 0.18; });
      ring.position.copy(vec(c.lat, c.lon, 1.012)); ring.lookAt(ring.position.clone().multiplyScalar(2));
    };
    function slerp(a, b, t) { var u = a.clone().normalize(), w = b.clone().normalize(), ang = u.angleTo(w); if (ang < 1e-4) return w.multiplyScalar(DIST); var ax = u.clone().cross(w).normalize(); return u.applyAxisAngle(ax, ang * t).multiplyScalar(DIST); }
    var clock = new T.Clock(), el = 0;
    renderer.setAnimationLoop(function () {
      var dt = Math.min(clock.getDelta(), 0.05); if (!api.visible) return; el += dt;
      if (fly) {
        fly.t = Math.min(1, fly.t + dt / (reduce ? 0.01 : 2.2));
        var e = fly.t < 0.5 ? 4 * fly.t * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 3) / 2;
        camera.position.copy(e < 0.5 ? slerp(fly.a, fly.m, e * 2) : slerp(fly.m, fly.b, (e - 0.5) * 2));
        if (fly.t >= 1) fly = null;
      } else if (!reduce) {
        var c = chapters[cur]; camera.position.copy(vec(c.lat - 8 + Math.sin(el * 0.3) * 2, c.lon + Math.sin(el * 0.2) * 6, DIST));
      }
      camera.lookAt(0, 0, 0);
      if (trip) { trip.t = Math.min(1, trip.t + dt / (reduce ? 0.01 : 2.2)); plane.position.copy(trip.curve.getPoint(trip.t)); }
      var p = (el * 0.7) % 1; ring.scale.setScalar(1 + p * 2.2); ring.material.opacity = 0.9 * (1 - p);
      pins.forEach(function (m, j) { m.scale.setScalar(j === cur ? 1.4 : 0.8); });
      renderer.render(scene, camera);
    });
    return api;
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '600px' });
    io.observe(root);
  } else start();
})();
