/* Live agent activity from Cogent Island's public feed.
   The feed address lives in data/live.json ({"feed": "https://…/api/public"}).
   Only real events are shown; with no feed the panel says so, and nothing is faked. */
(function () {
  var panel = document.getElementById('live');
  if (!panel) return;
  var list = panel.querySelector('.lv-list'), state = panel.querySelector('.lv-state'), stats = panel.querySelector('.lv-stats'), agentsEl = panel.querySelector('.lv-agents');
  var feed = '', seen = null, timer = null, visible = false;
  var COLOURS = { hermes: '#F2B544', claude: '#F59E5B', scout: '#F27BA0', grok: '#7FB6F2', sprig: '#B9DE78' };

  function ago(t) {
    var s = Math.max(0, (Date.now() - new Date(t).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return Math.floor(s / 86400) + ' d ago';
  }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function offline(msg) { panel.classList.remove('on'); state.textContent = msg; }

  function render(d) {
    panel.classList.add('on');
    state.textContent = 'Live · updated ' + ago(d.updated);
    stats.innerHTML = '<div><b>' + d.week.actions + '</b><span>actions this week</span></div><div><b>' + d.week.focusHours + '</b><span>focus hours this week</span></div><div><b>' + d.agents.filter(function (a) { return a.week > 0; }).length + ' / ' + d.agents.length + '</b><span>agents active this week</span></div>';
    agentsEl.innerHTML = d.agents.map(function (a) { return '<span style="--c:' + (COLOURS[a.id] || a.colour) + '"><i></i>' + esc(a.name) + ' <b>' + a.week + '</b></span>'; }).join('');
    list.innerHTML = d.events.slice(0, 6).map(function (e) {
      return '<li style="--c:' + (COLOURS[e.agent] || '#F2B544') + '"><i></i><span><b>' + esc(cap(e.agent)) + '</b> ' + esc(e.label) + ' <em>' + esc(e.business) + '</em></span><time datetime="' + esc(e.t) + '">' + ago(e.t) + '</time></li>';
    }).join('') || '<li class="lv-none">No public activity yet this week.</li>';
    // hand new events to the 3D island, oldest first
    var fresh = seen === null ? d.events.slice(0, 2) : d.events.filter(function (e) { return e.t > seen; });
    if (d.events.length) seen = d.events[0].t;
    if (window.__yardDispatch) fresh.slice().reverse().forEach(function (e) { window.__yardDispatch(e); });
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function poll() {
    clearTimeout(timer);
    if (!feed) return;
    fetch(feed, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(render).catch(function () { offline('Live feed paused. Back shortly.'); })
      .then(function () { if (visible) timer = setTimeout(poll, 30000); });
  }

  fetch('data/live.json', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) {
    feed = c.feed || '';
    if (!feed) { offline('Live feed not connected yet.'); return; }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) poll(); else clearTimeout(timer); }, { rootMargin: '200px' }).observe(panel);
    else { visible = true; poll(); }
  }).catch(function () { offline('Live feed not connected yet.'); });
})();
