/* My life in motion: an interactive globe built from data/places.json.
   Each photo is pinned where it was taken (from the photo's GPS data). */
(function () {
  var root = document.getElementById('life');
  if (!root) return;
  var stage = root.querySelector('.life-globe');
  var card = root.querySelector('.life-card');
  var strip = root.querySelector('.life-strip');
  var statsEl = root.querySelector('.life-stats');
  var tag = root.querySelector('.life-tag');
  var playBtn = root.querySelector('[data-life="play"]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var started = false;

  function getJSON(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); }
  function km(a, b) {
    var R = 6371, t = Math.PI / 180, dLat = (b.lat - a.lat) * t, dLon = (b.lon - a.lon) * t;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }
  function fmtDate(d) { if (!d) return ''; var p = d.split('-'); var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return (p[2] ? +p[2] + ' ' : '') + (p[1] ? m[+p[1] - 1] + ' ' : '') + p[0]; }
  function coord(v, pos, neg) { return Math.abs(v).toFixed(2) + '° ' + (v >= 0 ? pos : neg); }
  function countUp(el, to, suffix) {
    if (reduce) { el.textContent = to.toLocaleString('en-GB') + (suffix || ''); return; }
    var t0 = performance.now();
    (function f(now) { var p = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e).toLocaleString('en-GB') + (suffix || ''); if (p < 1) requestAnimationFrame(f); })(t0);
  }

  function start() {
    if (started) return; started = true;
    Promise.all([getJSON('data/places.json'), getJSON('data/land.json')]).then(function (r) { build(r[0], r[1]); })
      .catch(function () { stage.querySelector('.life-msg').textContent = 'The globe couldn’t load here. It works on the live site.'; });
  }

  function build(data, land) {
    var home = data.home, photos = data.photos || [];
    // group photos into places (within ~50 km)
    var places = [];
    photos.forEach(function (p) {
      var hit = null;
      for (var i = 0; i < places.length; i++) if (km(places[i], p) < 3) { hit = places[i]; break; }
      if (!hit) { hit = { lat: p.lat, lon: p.lon, place: p.place, country: p.country, photos: [] }; places.push(hit); }
      hit.photos.push(p);
    });
    var countries = {}; places.forEach(function (p) { if (p.country) countries[p.country] = 1; });
    var far = places.reduce(function (m, p) { return Math.max(m, km(home, p)); }, 0);
    var total = places.reduce(function (m, p) { return m + km(home, p) * 2; }, 0);

    statsEl.innerHTML = '<div><b data-n="' + Object.keys(countries).length + '">0</b><span>countries</span></div><div><b data-n="' + places.length + '">0</b><span>places</span></div><div><b data-n="' + photos.length + '">0</b><span>photos</span></div><div><b data-n="' + far + '" data-s=" km">0</b><span>furthest from home</span></div>';
    statsEl.querySelectorAll('b').forEach(function (b) { countUp(b, +b.getAttribute('data-n'), b.getAttribute('data-s')); });

    // ---------- three.js globe ----------
    var T = THREE;
    if (T.ColorManagement) T.ColorManagement.legacyMode = false;
    var W = stage.clientWidth, H = stage.clientHeight;
    var renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H); renderer.outputEncoding = T.sRGBEncoding;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Globe with a pin for each place in the photos');
    stage.appendChild(renderer.domElement);
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(36, W / H, 0.1, 100);
    var controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.5; controls.autoRotate = !reduce; controls.autoRotateSpeed = 0.35;
    if (coarse) renderer.domElement.style.touchAction = 'pan-y';

    function vec(lat, lon, r) {
      var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
      return new T.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
    }
    var DIST = 4.3;
    camera.position.copy(vec(home.lat - 8, home.lon + 10, DIST));
    controls.update();

    var globe = new T.Group(); scene.add(globe);
    globe.add(new T.Mesh(new T.SphereGeometry(0.995, 64, 48), new T.MeshBasicMaterial({ color: 0x0d1220 })));
    // atmosphere
    var atm = new T.ShaderMaterial({
      uniforms: { c: { value: new T.Color(0xF2B544) } }, transparent: true, side: T.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 4.0); gl_FragColor = vec4(c, 1.0) * i * 0.55; }'
    });
    scene.add(new T.Mesh(new T.SphereGeometry(1.12, 64, 48), atm));
    // land dots
    var pos = [];
    for (var i = 0; i < land.length; i += 2) { var v = vec(land[i], land[i + 1], 1.0); pos.push(v.x, v.y, v.z); }
    var lg = new T.BufferGeometry(); lg.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    var dotMat = new T.PointsMaterial({ color: 0xaab4cc, size: 0.0145, transparent: true, opacity: 0.85 });
    globe.add(new T.Points(lg, dotMat));
    // graticule ring at equator, subtle
    var eq = new T.Mesh(new T.TorusGeometry(1.002, 0.0012, 4, 160), new T.MeshBasicMaterial({ color: 0x2a3550 })); eq.rotation.x = Math.PI / 2; globe.add(eq);

    // home marker
    function marker(lat, lon, color, size) {
      var g = new T.Group(), p = vec(lat, lon, 1.0);
      g.position.copy(p); g.lookAt(p.clone().multiplyScalar(2));
      var dot = new T.Mesh(new T.CircleGeometry(size, 24), new T.MeshBasicMaterial({ color: color }));
      dot.position.z = 0.003; g.add(dot);
      var ring = new T.Mesh(new T.RingGeometry(size * 1.4, size * 1.9, 32), new T.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, side: T.DoubleSide }));
      ring.position.z = 0.004; g.add(ring); g.userData.ring = ring;
      var spike = new T.Mesh(new T.CylinderGeometry(0.0025, 0.0025, 0.09, 6), new T.MeshBasicMaterial({ color: color }));
      spike.rotation.x = Math.PI / 2; spike.position.z = 0.045; g.add(spike);
      var cap = new T.Mesh(new T.SphereGeometry(size * 0.55, 12, 8), new T.MeshBasicMaterial({ color: 0xffffff }));
      cap.position.z = 0.09; g.add(cap);
      globe.add(g); return g;
    }
    var homeM = marker(home.lat, home.lon, 0xF2B544, 0.014);
    var pinCol = [0xF27BA0, 0x5FD4C4, 0xA98BF5, 0x7FB6F2, 0xB9DE78];
    var pins = places.map(function (p, i) { var m = marker(p.lat, p.lon, pinCol[i % pinCol.length], 0.016); m.userData.idx = i; m.traverse(function (o) { o.userData.idx = i; }); return m; });
    var pickables = []; pins.forEach(function (m) { m.traverse(function (o) { if (o.isMesh) pickables.push(o); }); });

    // arcs from home
    function arcCurve(a, b) {
      var A = vec(a.lat, a.lon, 1.0), B = vec(b.lat, b.lon, 1.0);
      var mid = A.clone().add(B).multiplyScalar(0.5), d = A.distanceTo(B);
      if (mid.length() < 0.001) mid.set(0, 1, 0);
      mid.normalize().multiplyScalar(1 + d * 0.38);
      return new T.QuadraticBezierCurve3(A, mid, B);
    }
    var arcs = places.map(function (p, i) {
      var curve = arcCurve(home, p);
      var g = new T.BufferGeometry().setFromPoints(curve.getPoints(90));
      var mat = new T.LineDashedMaterial({ color: pinCol[i % pinCol.length], dashSize: 0.03, gapSize: 0.02, transparent: true, opacity: 0.55 });
      var line = new T.Line(g, mat); line.computeLineDistances(); globe.add(line);
      return { curve: curve, line: line, mat: mat };
    });
    // traveller (plane)
    var plane = new T.Group();
    var body = new T.Mesh(new T.ConeGeometry(0.018, 0.06, 8), new T.MeshBasicMaterial({ color: 0xffffff }));
    body.rotation.x = Math.PI / 2; plane.add(body);
    var glowS = new T.Mesh(new T.SphereGeometry(0.03, 12, 8), new T.MeshBasicMaterial({ color: 0xF2B544, transparent: true, opacity: 0.35 }));
    plane.add(glowS); globe.add(plane); plane.visible = false;
    var trip = null; // {curve, t, back}

    // ---------- UI: carousel + card ----------
    function placeOf(p) { for (var i = 0; i < places.length; i++) if (places[i].photos.indexOf(p) >= 0) return i; return 0; }
    strip.innerHTML = '';
    var track = document.createElement('div'); track.className = 'lc-track'; strip.appendChild(track);
    var slides = photos.map(function (p, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'lc-slide';
      b.setAttribute('aria-label', (p.caption || p.place) + ', ' + fmtDate(p.date));
      b.innerHTML = '<img src="' + p.thumb + '" alt="" loading="' + (i < 4 ? 'eager' : 'lazy') + '" width="480" height="360"><span class="lc-cap"><b>' + (p.caption || p.place) + '</b><small>' + (p.place || '') + ' · ' + fmtDate(p.date) + '</small></span>';
      b.addEventListener('click', function () { if (!dragged) go(i, true); });
      track.appendChild(b); return b;
    });
    var nav = document.createElement('div'); nav.className = 'lc-nav';
    nav.innerHTML = '<button type="button" class="lc-btn" data-d="-1" aria-label="Previous photo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6"></path></svg></button><div class="lc-prog"><i></i></div><span class="lc-count">01 / ' + String(photos.length).padStart(2, '0') + '</span><button type="button" class="lc-btn" data-d="1" aria-label="Next photo"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6"></path></svg></button>';
    strip.parentNode.insertBefore(nav, strip.nextSibling);
    var prog = nav.querySelector('.lc-prog i'), countEl = nav.querySelector('.lc-count');
    nav.querySelectorAll('.lc-btn').forEach(function (b) { b.addEventListener('click', function () { go(idx + (+b.getAttribute('data-d')), true); }); });

    var idx = 0, auto = !reduce, timer = null, resumeT = null, inView = false, DWELL = 4800, dragX = null, dragDX = 0, dragged = false;
    function layout(extra) {
      if (!slides.length) return;
      var sw = slides[0].offsetWidth, gap = 16, vw = strip.clientWidth;
      var x = vw / 2 - (idx * (sw + gap) + sw / 2) + (extra || 0);
      track.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
      slides.forEach(function (s, j) { var d = Math.abs(j - idx); s.style.setProperty('--d', Math.min(3, d)); s.classList.toggle('on', d === 0); s.tabIndex = d === 0 ? 0 : -1; });
    }
    function restartProg() { prog.classList.remove('run'); void prog.offsetWidth; if (auto && inView) prog.classList.add('run'); }
    function schedule() { clearTimeout(timer); if (auto && inView) timer = setTimeout(function () { go(idx + 1); }, DWELL); restartProg(); }
    function go(i, user) {
      idx = (i + photos.length) % photos.length; layout();
      countEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(photos.length).padStart(2, '0');
      var p = photos[idx]; select(placeOf(p), p);
      if (user) { auto = false; setPlay(false); clearTimeout(resumeT); resumeT = setTimeout(function () { auto = !reduce; setPlay(auto); schedule(); }, 12000); }
      schedule();
    }
    function setPlay(on) { playBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); playBtn.querySelector('span').textContent = on ? 'Pause' : 'Play the journey'; }
    // drag / swipe
    strip.addEventListener('pointerdown', function (e) { dragX = e.clientX; dragDX = 0; dragged = false; track.classList.add('drag'); });
    window.addEventListener('pointermove', function (e) { if (dragX === null) return; dragDX = e.clientX - dragX; if (Math.abs(dragDX) > 6) dragged = true; layout(dragDX); });
    window.addEventListener('pointerup', function () {
      if (dragX === null) return; track.classList.remove('drag');
      var sw = slides[0] ? slides[0].offsetWidth : 300, steps = Math.round(-dragDX / (sw * 0.6));
      dragX = null; if (dragged && steps) go(idx + steps, true); else layout();
      setTimeout(function () { dragged = false; }, 0);
    });
    strip.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(idx + 1, true); e.preventDefault(); } if (e.key === 'ArrowLeft') { go(idx - 1, true); e.preventDefault(); } });
    strip.addEventListener('mouseenter', function () { clearTimeout(timer); prog.classList.remove('run'); });
    strip.addEventListener('mouseleave', function () { schedule(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; schedule(); }, { threshold: 0.25 }).observe(strip);
    addEventListener('resize', function () { layout(); });

    var cur = -1, curPhoto = null, fly = null;
    function select(i, photo) {
      cur = i; var pl = places[i]; curPhoto = photo || pl.photos[0];
      var dist = km(home, pl);
      card.classList.remove('in'); void card.offsetWidth;
      card.innerHTML = '<div class="life-photo"><img src="' + curPhoto.src + '" alt="' + (curPhoto.caption || pl.place) + '"></div>' +
        '<div class="life-meta"><div class="life-k">' + (pl.country || '') + (curPhoto.date ? ' · ' + fmtDate(curPhoto.date) : '') + '</div>' +
        '<h3>' + (pl.place || 'Somewhere new') + '</h3>' + (curPhoto.caption ? '<p>' + curPhoto.caption + '</p>' : '') +
        '<div class="life-row"><span>' + coord(curPhoto.lat, 'N', 'S') + ' · ' + coord(curPhoto.lon, 'E', 'W') + '</span><span><b class="life-km">0</b> km from ' + home.name + '</span></div></div>';
      card.classList.add('in');
      countUp(card.querySelector('.life-km'), dist);
      var to = vec(pl.lat - 6, pl.lon, DIST);
      if (camera.position.distanceTo(to) > 0.05) fly = { t: 0, from: camera.position.clone(), to: to };
      controls.autoRotate = false;
      if (!trip || trip.curve !== arcs[i].curve) { trip = { curve: arcs[i].curve, t: 0 }; }
      plane.visible = true;
      arcs.forEach(function (a, j) { a.mat.opacity = j === i ? 1 : 0.25; });
      tag.textContent = pl.place || ''; tag.classList.add('on');
    }
    function stopPlay() { auto = false; clearTimeout(timer); setPlay(false); prog.classList.remove('run'); }
    playBtn.addEventListener('click', function () {
      clearTimeout(resumeT);
      if (auto) { stopPlay(); return; }
      auto = true; setPlay(true); go(idx + 1);
    });
    root.querySelector('[data-life="reset"]').addEventListener('click', function () {
      stopPlay(); fly = { t: 0, from: camera.position.clone(), to: vec(home.lat - 8, home.lon + 10, DIST) };
      tag.classList.remove('on'); controls.autoRotate = !reduce;
    });

    // picking
    var ray = new T.Raycaster(), ptr = new T.Vector2(), down = null;
    renderer.domElement.addEventListener('pointerdown', function (e) { down = [e.clientX, e.clientY]; });
    renderer.domElement.addEventListener('pointerup', function (e) {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
      var r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      var hit = ray.intersectObjects(pickables, false)[0];
      if (hit) { var hi = hit.object.userData.idx; go(photos.indexOf(places[hi].photos[0]), true); }
    });
    renderer.domElement.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = renderer.domElement.getBoundingClientRect();
      ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      renderer.domElement.style.cursor = ray.intersectObjects(pickables, false).length ? 'pointer' : 'grab';
    });

    function resize() { W = stage.clientWidth; H = stage.clientHeight; if (!W || !H) return; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else addEventListener('resize', resize);
    var visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(root);

    var clock = new T.Clock(), el = 0, tmp = new T.Vector3();
    renderer.setAnimationLoop(function () {
      var dt = Math.min(clock.getDelta(), 0.05); if (!visible) return; el += dt;
      if (fly) {
        fly.t = Math.min(1, fly.t + dt / (reduce ? 0.01 : 1.6));
        var e = fly.t < 0.5 ? 4 * fly.t * fly.t * fly.t : 1 - Math.pow(-2 * fly.t + 2, 3) / 2;
        var a = fly.from.clone().normalize(), b = fly.to.clone().normalize();
        var ang = a.angleTo(b), axis = a.clone().cross(b);
        if (axis.lengthSq() < 1e-8) camera.position.copy(fly.to);
        else { axis.normalize(); camera.position.copy(a.applyAxisAngle(axis, ang * e).multiplyScalar(DIST)); }
        if (fly.t >= 1) fly = null;
      }
      controls.update();
      [homeM].concat(pins).forEach(function (m, i) { var p = ((el * 0.6) + i * 0.3) % 1; m.userData.ring.scale.setScalar(1 + p * 1.8); m.userData.ring.material.opacity = 0.8 * (1 - p); });
      arcs.forEach(function (a) { a.mat.dashOffset = -el * 0.15; });
      if (trip) {
        trip.t = Math.min(1, trip.t + dt / (reduce ? 0.01 : 2.4));
        var pt = trip.curve.getPoint(trip.t), ah = trip.curve.getPoint(Math.min(1, trip.t + 0.01));
        plane.position.copy(pt); plane.lookAt(ah);
        glowS.scale.setScalar(1 + Math.sin(el * 8) * 0.2);
        if (trip.t >= 1) { trip.t = 0; }
      }
      renderer.render(scene, camera);
      // place tag above the selected pin
      if (cur >= 0) {
        tmp.copy(pins[cur].position).multiplyScalar(1.12).applyMatrix4(globe.matrixWorld).project(camera);
        var facing = pins[cur].position.clone().normalize().dot(camera.position.clone().normalize()) > 0.1;
        tag.style.transform = 'translate(-50%,-100%) translate(' + ((tmp.x + 1) / 2 * W).toFixed(1) + 'px,' + ((1 - tmp.y) / 2 * H - 10).toFixed(1) + 'px)';
        tag.style.opacity = facing ? 1 : 0;
      }
    });
    stage.querySelector('.life-msg').style.display = 'none';
    root.classList.add('ready');
    setPlay(auto); requestAnimationFrame(function () { layout(); if (photos.length) go(0); });
  }

  if (!window.THREE || !THREE.OrbitControls) { stage.querySelector('.life-msg').textContent = 'This browser can’t show the globe.'; return; }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { rootMargin: '500px' });
    io.observe(root);
  } else start();
})();
