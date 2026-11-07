/* My life in motion: a clean photo carousel (6 per page) with a full-screen viewer.
   Reads data/places.json, so new trips added with tools/add_travel.py appear automatically. */
(function () {
  var root = document.getElementById('life');
  if (!root) return;
  var track = root.querySelector('.lc-pages'), dotsEl = root.querySelector('.lc-dots'), chipsEl = root.querySelector('.lc-chips');
  var prevBtn = root.querySelector('[data-lc="prev"]'), nextBtn = root.querySelector('[data-lc="next"]');
  var box = document.getElementById('lbox');
  var PER = 6, all = [], list = [], pages = 0;

  fetch('data/places.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    all = (d.photos || []).slice().sort(function (a, b) { return (a.date || '').localeCompare(b.date || ''); });
    var countries = [];
    all.forEach(function (p) { if (p.country && countries.indexOf(p.country) < 0) countries.push(p.country); });
    var sub = root.querySelector('.lc-sub');
    if (sub) sub.textContent = all.length + ' photos from ' + countries.length + ' countries, each placed where it was taken.';
    ['All'].concat(countries).forEach(function (c, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'lc-chip' + (i === 0 ? ' on' : ''); b.textContent = c;
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        chipsEl.querySelectorAll('.lc-chip').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
        render(c === 'All' ? all : all.filter(function (p) { return p.country === c; }));
      });
      chipsEl.appendChild(b);
    });
    render(all);
  }).catch(function () { track.innerHTML = '<p class="lc-empty">Photos couldn’t load.</p>'; });

  function render(items) {
    list = items; pages = Math.ceil(list.length / PER);
    var html = '';
    for (var pg = 0; pg < pages; pg++) {
      html += '<div class="lc-page">';
      list.slice(pg * PER, pg * PER + PER).forEach(function (p, k) {
        var i = pg * PER + k;
        html += '<button type="button" class="lc-tile" data-i="' + i + '" aria-label="Open photo: ' + esc(p.caption || p.place) + '">' +
          '<img src="' + p.thumb + '" alt="" width="480" height="360" decoding="async" loading="' + (pg === 0 ? 'eager' : 'lazy') + '">' +
          '<span class="lc-tc"><b>' + esc(p.caption || '') + '</b><small>' + esc(p.place || '') + '</small></span></button>';
      });
      html += '</div>';
    }
    track.innerHTML = html; track.scrollLeft = 0;
    dotsEl.innerHTML = pages > 1 ? Array.apply(null, { length: pages }).map(function (_, i) { return '<button type="button" aria-label="Page ' + (i + 1) + '"' + (i === 0 ? ' class="on"' : '') + '></button>'; }).join('') : '';
    dotsEl.querySelectorAll('button').forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
    track.querySelectorAll('.lc-tile').forEach(function (t) { t.addEventListener('click', function () { open(+t.getAttribute('data-i')); }); });
    update();
  }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function cur() { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }
  function go(i) { track.scrollTo({ left: Math.max(0, Math.min(pages - 1, i)) * track.clientWidth, behavior: 'smooth' }); }
  function update() {
    var c = cur();
    dotsEl.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i === c); });
    prevBtn.disabled = c <= 0; nextBtn.disabled = c >= pages - 1;
  }
  var st; track.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(update, 60); }, { passive: true });
  prevBtn.addEventListener('click', function () { go(cur() - 1); });
  nextBtn.addEventListener('click', function () { go(cur() + 1); });

  // ---- full-screen viewer ----
  var bImg = box.querySelector('img'), bCap = box.querySelector('.lb-cap'), bCount = box.querySelector('.lb-count'), idx = 0, lastFocus = null;
  function show(i) {
    idx = (i + list.length) % list.length; var p = list[idx];
    box.classList.add('loading');
    var im = new Image();
    im.onload = function () { bImg.src = p.src; bImg.alt = p.caption || p.place || ''; box.classList.remove('loading'); };
    im.src = p.src;
    bCap.innerHTML = '<b>' + esc(p.caption || '') + '</b><span>' + esc([p.place, p.country].filter(Boolean).join(', ')) + '</span>';
    bCount.textContent = (idx + 1) + ' / ' + list.length;
    [idx + 1, idx - 1].forEach(function (j) { var q = list[(j + list.length) % list.length]; if (q) (new Image()).src = q.src; });
  }
  function open(i) {
    lastFocus = document.activeElement; show(i);
    box.hidden = false; requestAnimationFrame(function () { box.classList.add('on'); });
    document.documentElement.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function close() {
    box.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(function () { box.hidden = true; bImg.removeAttribute('src'); }, 250);
    if (lastFocus) lastFocus.focus();
  }
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('lb-stage')) close(); });
  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(idx + 1);
    if (e.key === 'ArrowLeft') show(idx - 1);
  });
  var sx = null;
  box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
})();
