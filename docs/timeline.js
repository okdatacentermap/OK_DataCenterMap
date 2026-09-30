// Timeline mode for the Anthem / MPD-6 map.
// Needs: window.TIMELINE from the data file, and the page's global `map` (Leaflet)
// and optional `FACTS.sources` catalog. Load both scripts after the page script.
(function () {
  'use strict';
  var T = window.TIMELINE;
  if (!T || typeof L === 'undefined' || typeof map === 'undefined') return;

  var KEY = 'anthem-timeline-v2';
  var SUMMARY_LABEL = 'Summary';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var catalog = (typeof FACTS !== 'undefined' && FACTS && FACTS.sources) ? FACTS.sources : {};

  // ---------- memory ----------
  var state = { mode: 'map', scroll: 0, tracks: [], q: '', seen: [], last: '', records: true };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  // v1 → v2 (project / topic filters): keep what a returning reader has already seen; old track filters are dropped
  try { if (!localStorage.getItem(KEY)) { var v1 = JSON.parse(localStorage.getItem('anthem-timeline-v1') || '{}'); state.seen = v1.seen || []; } } catch (e) {}
  var seen = new Set(state.seen || []);
  function save() {
    state.seen = Array.from(seen);
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ---------- helpers ----------
  // black or white text for a coloured tag, by the background's relative luminance (WCAG)
  function inkOn(hex) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || ''); if (!m) return '#000';
    var L = [m[1], m[2], m[3]].map(function (h) { var c = parseInt(h, 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    var lum = 0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2];
    return lum > 0.179 ? '#000' : '#fff';
  }
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function fmtDate(d) {
    var p = d.split('-');
    var m = MONTHS[+p[1] - 1];
    return p[2] ? m + ' ' + (+p[2]) + ', ' + p[0] : m + ' ' + p[0];
  }
  function resolveSrc(s) {
    if (Array.isArray(s)) return { t: s[0], u: s[1] };
    if (catalog[s]) return { t: catalog[s][0], u: catalog[s][1] };
    var name = decodeURIComponent(s.split('/').pop()).replace(/\.[a-z]+$/i, '').replace(/[_-]+/g, ' ');
    return { t: name, u: s };
  }
  function isExternal(u) { return /^https?:/i.test(u); }

  var allEvents = [];
  T.groups.forEach(function (g) {
    // keep each period in date order; month-only dates sort to the start of their month
    g.events = g.events.map(function (e, i) { return [e, i]; })
      .sort(function (a, b) { return a[0].date < b[0].date ? -1 : a[0].date > b[0].date ? 1 : a[1] - b[1]; })
      .map(function (x) { return x[0]; });
    g.events.forEach(function (e) { e.group = g; allEvents.push(e); });
  });
  function unseenCount() { return allEvents.filter(function (e) { return !e.auto && !seen.has(e.id); }).length; }

  // ---------- styles ----------
  var css = [
    '.tl-switch{display:flex;gap:0;margin:0 0 12px;border:1px solid #c9c7c0;border-radius:8px;overflow:hidden}',
    '.tl-switch button{flex:1;border:0;background:#fff;padding:7px 8px;font:600 13px system-ui,sans-serif;cursor:pointer;color:#333;position:relative}',
    '.tl-switch button[aria-pressed=true]{background:#1f3b57;color:#fff}',
    '.tl-badge{display:inline-block;min-width:16px;padding:0 5px;margin-left:6px;border-radius:9px;background:#d9480f;color:#fff;font:700 11px/16px system-ui,sans-serif}',
    '.tl-ov{position:absolute;inset:0;z-index:1000;background:#f7f6f2;color:#1d1d1b;display:none;flex-direction:column;font:14px/1.5 system-ui,sans-serif;cursor:auto}',
    '.tl-ov.open{display:flex}',
    '.tl-head{padding:12px 20px 10px;border-bottom:1px solid #dddbd3;background:#fff;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}',
    '.tl-head h2{margin:0;font-size:17px;flex:1 1 auto}',
    '.tl-head .tl-upd{color:#6b6a65;font-size:12px}',
    '.tl-q{flex:0 1 220px;padding:6px 9px;border:1px solid #c9c7c0;border-radius:6px;font:inherit}',
    '.tl-x{border:0;background:none;font-size:22px;line-height:1;cursor:pointer;color:#555;padding:0 4px}',
    '.tl-chips{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px}',
    '.tl-chip{border:1px solid #c9c7c0;background:#fff;border-radius:14px;padding:2px 10px;font:12px system-ui,sans-serif;cursor:pointer;color:#333}',
    '.tl-chip[aria-pressed=true]{background:#1f3b57;border-color:#1f3b57;color:#fff}',
    '.tl-body{flex:1;overflow:auto;display:flex}',
    '.tl-rail{position:sticky;top:0;align-self:flex-start;padding:16px 8px 16px 16px;display:flex;flex-direction:column;gap:2px;min-width:92px}',
    '.tl-rail a{color:#1f3b57;text-decoration:none;font-size:12px;padding:3px 6px;border-radius:4px;white-space:nowrap}',
    '.tl-rail a:hover{background:#e8e6df}',
    '.tl-main{flex:1;max-width:820px;padding:8px 24px 60px 8px}',
    '.tl-group{margin:18px 0 8px}',
    '.tl-group h3{margin:0 0 2px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#6b6a65}',
    '.tl-group h4{margin:0 0 8px;font-size:17px}',
    '.tl-sum{background:#fff;border-left:3px solid #1f3b57;padding:8px 12px;margin:0 0 12px;border-radius:0 6px 6px 0}',
    '.tl-sum b{display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#1f3b57;margin-bottom:2px}',
    '.tl-list{list-style:none;margin:0;padding:0 0 0 14px;border-left:2px solid #d6d3ca}',
    '.tl-ev{position:relative;margin:0 0 10px;padding:8px 12px;background:#fff;border:1px solid #e3e1d9;border-radius:6px}',
    '.tl-ev::before{content:"";position:absolute;left:-21px;top:14px;width:10px;height:10px;border-radius:50%;background:#1f3b57;border:2px solid #f7f6f2}',
    '.tl-ev.tl-region::before{background:#8a8778}',
    '.tl-ev.flash{box-shadow:0 0 0 3px #f59f00}',
    '.tl-date{font-size:12px;color:#6b6a65;font-variant-numeric:tabular-nums}',
    '.tl-new{margin-left:6px;font:700 10px system-ui,sans-serif;color:#d9480f;text-transform:uppercase}',
    '.tl-inf{margin-left:6px;font:italic 11px system-ui,sans-serif;color:#8a6d00}',
    '.tl-ev h5{margin:1px 0 3px;font-size:14.5px}',
    '.tl-ev p{margin:0 0 6px}',
    '.tl-tags{display:flex;flex-wrap:wrap;gap:4px;margin:0 0 4px}',
    '.tl-tag{font-size:11px;color:#555;background:#efede6;border-radius:3px;padding:0 6px}',
    '.tl-tag.p{color:#000}',
    '.tl-row{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '.tl-row b{font:600 11px system-ui,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:#6b6a65;min-width:58px}',
    '.tl-chip .dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;vertical-align:0}',
    '.tl-rec{font:12px system-ui,sans-serif;color:#555;display:flex;gap:5px;align-items:center;margin-left:auto}',
    '.tl-ev.tl-auto h5{font-weight:600}',
    '.tl-src-rec{font-size:10.5px;color:#fff;background:#6b6a65;border-radius:3px;padding:0 5px;margin-left:6px}',
    '.tl-act{display:flex;flex-wrap:wrap;gap:4px 12px;align-items:baseline;font-size:12.5px}',
    '.tl-act a{color:#1f5f99}',
    '.tl-map{border:1px solid #1f3b57;background:#fff;color:#1f3b57;border-radius:4px;padding:1px 8px;font:600 12px system-ui,sans-serif;cursor:pointer}',
    '.tl-link{border:0;background:none;color:#888;cursor:pointer;font:12px system-ui,sans-serif;padding:0}',
    '.tl-empty{padding:40px 0;color:#6b6a65}',
    '.tl-back{position:absolute;top:10px;left:50%;transform:translateX(-50%);z-index:999;display:none;border:0;background:#1f3b57;color:#fff;border-radius:16px;padding:6px 14px;font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)}',
    '.tl-back.show{display:block}',
    '@media (max-width:700px){.tl-rail{display:none}.tl-main{padding:8px 12px 60px}}'
  ].join('\n');
  document.head.appendChild(el('style', { text: css }));

  // ---------- side-panel switch ----------
  var side = document.getElementById('side');
  var bMap = el('button', { type: 'button', text: 'Map' });
  var badge = el('span', { class: 'tl-badge' });
  var bTl = el('button', { type: 'button' }, ['Timeline', badge]);
  var sw = el('div', { class: 'tl-switch', role: 'group', 'aria-label': 'View' }, [bMap, bTl]);
  if (side) side.insertBefore(sw, side.firstChild);
  function paintBadge() { var n = unseenCount(); badge.textContent = n; badge.style.display = n ? '' : 'none'; }

  // ---------- overlay ----------
  var container = map.getContainer();
  var ov = el('div', { class: 'tl-ov', role: 'region', 'aria-label': 'Timeline' });
  var q = el('input', { class: 'tl-q', type: 'search', placeholder: 'Search the timeline', value: state.q || '' });
  var chips = el('div', { class: 'tl-chips' });
  var head = el('div', { class: 'tl-head' }, [
    el('h2', { text: 'Timeline' }),
    el('span', { class: 'tl-upd', text: 'Updated ' + fmtDate(T.updated) }),
    q,
    el('button', { class: 'tl-x', type: 'button', title: 'Back to map (Esc)', 'aria-label': 'Close timeline', text: '×', onclick: function () { setMode('map'); } }),
    chips
  ]);
  var rail = el('nav', { class: 'tl-rail', 'aria-label': 'Periods' });
  var main = el('div', { class: 'tl-main' });
  var body = el('div', { class: 'tl-body' }, [rail, main]);
  ov.appendChild(head); ov.appendChild(body);
  container.appendChild(ov);
  L.DomEvent.disableClickPropagation(ov);
  L.DomEvent.disableScrollPropagation(ov);
  ['keydown', 'keypress', 'keyup', 'dblclick', 'mousedown', 'touchstart', 'pointerdown', 'wheel', 'contextmenu'].forEach(function (t) {
    ov.addEventListener(t, function (e) { if (!(t === 'keydown' && e.key === 'Escape')) e.stopPropagation(); });
  });

  var back = el('button', { class: 'tl-back', type: 'button', text: '◂ Back to timeline', onclick: function () { back.classList.remove('show'); setMode('timeline'); } });
  container.appendChild(back);
  L.DomEvent.disableClickPropagation(back);

  // filter chips
  var active = new Set(state.tracks || []);
  function chip(k, label, color, row) {
    var c = el('button', { class: 'tl-chip', type: 'button', 'aria-pressed': active.has(k) ? 'true' : 'false' }, [color ? el('span', { class: 'dot', style: 'background:' + color }) : null, label]);
    c.addEventListener('click', function () {
      if (active.has(k)) active.delete(k); else active.add(k);
      c.setAttribute('aria-pressed', active.has(k) ? 'true' : 'false');
      state.tracks = Array.from(active); save(); render();
    });
    row.appendChild(c);
  }
  var DIMS = T.dims, nameOf = {}, colorOf = {};
  if (DIMS) {
    DIMS.projects.forEach(function (p) { nameOf['p:' + p.id] = p.name; colorOf['p:' + p.id] = p.color; });
    DIMS.topics.forEach(function (t) { nameOf['t:' + t.id] = t.name; });
    var rowP = el('div', { class: 'tl-row' }, [el('b', { text: 'Projects' })]), rowT = el('div', { class: 'tl-row' }, [el('b', { text: 'Topics' })]);
    DIMS.projects.forEach(function (p) { chip('p:' + p.id, p.name, p.color, rowP); });
    DIMS.topics.forEach(function (t) { chip('t:' + t.id, t.name, null, rowT); });
    var rec = el('input', { type: 'checkbox' }); rec.checked = state.records !== false;
    rec.addEventListener('change', function () { state.records = rec.checked; save(); render(); });
    rowT.appendChild(el('label', { class: 'tl-rec', title: 'Entries generated from the map’s records: ODEQ permit filings, recorded deeds, Council easements' }, [rec, 'Records (' + (T.autoCount || 0) + ')']));
    chips.appendChild(rowP); chips.appendChild(rowT);
  } else Object.keys(T.tracks).forEach(function (k) { chip(k, T.tracks[k], null, chips); });
  var qTimer;
  q.addEventListener('input', function () { clearTimeout(qTimer); qTimer = setTimeout(function () { state.q = q.value; save(); render(); }, 150); });

  // ---------- render ----------
  var cards = {};
  function matches(e) {
    if (DIMS) {
      if (e.auto && state.records === false) return false;
      var selP = [], selT = []; active.forEach(function (k) { if (k.indexOf('p:') === 0) selP.push(k.slice(2)); else if (k.indexOf('t:') === 0) selT.push(k.slice(2)); });
      if (selP.length && !(e.projects || []).some(function (x) { return selP.indexOf(x) >= 0; })) return false;
      if (selT.length && !(e.topics || []).some(function (x) { return selT.indexOf(x) >= 0; })) return false;
    } else if (active.size && !e.tracks.some(function (t) { return active.has(t); })) return false;
    var s = (state.q || '').trim().toLowerCase();
    if (!s) return true;
    var hay = [e.title, e.text || '', e.date, e.group.title].concat((e.src || []).map(function (x) { return resolveSrc(x).t; })).join(' ').toLowerCase();
    return s.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function render() {
    main.textContent = ''; rail.textContent = ''; cards = {};
    var shown = 0;
    T.groups.forEach(function (g) {
      var evs = g.events.filter(matches);
      if (!evs.length) return;
      shown += evs.length;
      rail.appendChild(el('a', { href: '#', text: g.label, onclick: function (ev) { ev.preventDefault(); document.getElementById('tl-' + g.id).scrollIntoView({ behavior: 'smooth' }); } }));
      var list = el('ol', { class: 'tl-list' });
      evs.forEach(function (e) { list.appendChild(card(e)); });
      main.appendChild(el('section', { class: 'tl-group', id: 'tl-' + g.id }, [
        el('h3', { text: g.label }),
        el('h4', { text: g.title }),
        el('div', { class: 'tl-sum' }, [el('b', { text: SUMMARY_LABEL }), g.summary]),
        list
      ]));
    });
    if (!shown) main.appendChild(el('p', { class: 'tl-empty', text: 'Nothing matches these filters.' }));
    observe();
  }
  function card(e) {
    var tags = el('div', { class: 'tl-tags' }, DIMS
      ? (e.projects || []).map(function (p) { var bg = colorOf['p:' + p] || '#888';
          return el('span', { class: 'tl-tag p', style: 'background:' + bg + ';color:' + inkOn(bg), text: nameOf['p:' + p] || p }); })
          .concat((e.topics || []).map(function (t) { return el('span', { class: 'tl-tag', text: nameOf['t:' + t] || t }); }))
      : (e.tracks || []).map(function (t) { return el('span', { class: 'tl-tag', text: T.tracks[t] }); }));
    var act = el('div', { class: 'tl-act' });
    if (e.map) act.appendChild(el('button', { class: 'tl-map', type: 'button', text: 'Show on map', onclick: function () { showOnMap(e); } }));
    (e.src || []).forEach(function (s) {
      var r = resolveSrc(s);
      act.appendChild(el('a', { href: r.u, target: '_blank', rel: 'noopener', text: r.t + (isExternal(r.u) ? ' ↗' : '') }));
    });
    act.appendChild(el('button', { class: 'tl-link', type: 'button', title: 'Copy a link to this entry', text: '#', onclick: function () {
      var u = location.href.split('#')[0] + '#t=' + e.id;
      if (navigator.clipboard) navigator.clipboard.writeText(u).catch(function () {});
      history.replaceState(null, '', '#t=' + e.id);
    } }));
    var li = el('li', { class: 'tl-ev' + (e.auto ? ' tl-auto tl-region' : (e.tracks || []).indexOf('region') >= 0 && e.tracks.length === 1 ? ' tl-region' : ''), 'data-id': e.id }, [
      el('div', { class: 'tl-date' }, [fmtDate(e.date),
        e.auto ? el('span', { class: 'tl-src-rec', title: 'Generated from the map’s records', text: 'from records' }) : seen.has(e.id) ? null : el('span', { class: 'tl-new', text: 'new' }),
        e.inferred ? el('span', { class: 'tl-inf', text: 'inferred' }) : null]),
      el('h5', { text: e.title }),
      e.text ? el('p', { text: e.text }) : null,
      tags, act
    ]);
    cards[e.id] = li;
    return li;
  }

  // mark entries seen once they have been on screen for a moment
  var io;
  function observe() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.getAttribute('data-id');
        setTimeout(function () {
          if (seen.has(id) || !ov.classList.contains('open')) return;
          seen.add(id); save(); paintBadge();
        }, 1200);
      });
    }, { root: body, threshold: 0.6 });
    Object.keys(cards).forEach(function (id) { io.observe(cards[id]); });
  }

  // ---------- map link ----------
  var hl;
  function showOnMap(e) {
    state.last = e.id; state.scroll = body.scrollTop; save();
    setMode('map');
    back.classList.add('show');
    map.flyTo([e.map[0], e.map[1]], e.map[2] || 15, { duration: 0.8 });
    if (hl) map.removeLayer(hl);
    hl = L.circle([e.map[0], e.map[1]], { radius: 180, color: '#f59f00', weight: 3, fill: false }).addTo(map)
      .bindTooltip(fmtDate(e.date) + ' — ' + e.title, { permanent: true, direction: 'top' });
    setTimeout(function () { if (hl) { map.removeLayer(hl); hl = null; } }, 12000);
  }

  // ---------- mode ----------
  function setMode(m) {
    if (m === 'map' && state.mode === 'timeline') state.scroll = body.scrollTop;
    state.mode = m; save();
    bMap.setAttribute('aria-pressed', m === 'map' ? 'true' : 'false');
    bTl.setAttribute('aria-pressed', m === 'timeline' ? 'true' : 'false');
    ov.classList.toggle('open', m === 'timeline');
    if (m === 'timeline') {
      back.classList.remove('show');
      body.scrollTop = state.scroll || 0;
      if (state.last && cards[state.last]) flash(state.last);
      q.blur();
    }
  }
  function flash(id) {
    var c = cards[id]; if (!c) return;
    c.classList.add('flash');
    setTimeout(function () { c.classList.remove('flash'); }, 1600);
  }
  function goTo(id) {
    if (!cards[id]) {
      active.clear(); state.tracks = []; state.q = ''; q.value = ''; save();
      Array.prototype.forEach.call(chips.querySelectorAll('.tl-chip'), function (c) { c.setAttribute('aria-pressed', 'false'); });
      render();
    }
    setMode('timeline');
    if (cards[id]) { cards[id].scrollIntoView({ block: 'center' }); flash(id); }
  }
  bMap.addEventListener('click', function () { setMode('map'); });
  bTl.addEventListener('click', function () { setMode('timeline'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && state.mode === 'timeline') setMode('map'); });
  window.addEventListener('hashchange', fromHash);
  function fromHash() { var m = /^#t=(.+)$/.exec(location.hash); if (m) goTo(decodeURIComponent(m[1])); }

  render(); paintBadge();
  setMode(state.mode === 'timeline' ? 'timeline' : 'map');
  fromHash();
})();
