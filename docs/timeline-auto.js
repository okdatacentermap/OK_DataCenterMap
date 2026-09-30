// Timeline additions, computed in the browser when the page loads (no rebuild needed):
//  1. files every hand-written entry under Projects and Topics from projects.js — explicit
//     `projects: [...]` / `topics: [...]` on an entry win over the keyword rules;
//  2. adds "from records" entries generated from the map's own data — ODEQ stormwater permit filings, recorded deeds /
//     sales of mapped land, and City Council easements — skipping any a hand-written entry already covers.
// Load after timeline-data.js and projects.js, before timeline.js. Needs the page's PERMITS / DCS / TRACTS / EASE data.
(function () {
  'use strict';
  var T = window.TIMELINE, PR = window.PROJECTS;
  if (!T || !PR) return;
  var G = PR.groups, TP = PR.topics;
  var rx = function (s) { return s ? new RegExp(s, 'i') : null; };
  G.forEach(function (g) { g.re = rx(g.match); }); TP.forEach(function (t) { t.re = rx(t.match); });
  var uniq = function (a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); };

  function projectsFor(text, tracks) {
    var out = [];
    (tracks || []).forEach(function (t) { if (t === 'anthem' || t === 'mpd') out.push(t); });
    G.forEach(function (g) { if (g.re && g.re.test(text)) out.push(g.id); });
    if (!out.length && (tracks || []).indexOf('infra') >= 0) out.push('infra');
    return uniq(out.length ? out : ['other']);
  }
  function topicsFor(text, tracks) {
    var out = [];
    TP.forEach(function (t) { if ((tracks || []).some(function (k) { return t.tracks.indexOf(k) >= 0; }) || (t.re && t.re.test(text))) out.push(t.id); });
    if ((tracks || []).indexOf('infra') >= 0 && !out.some(function (x) { return x === 'water' || x === 'roads'; })) out.push('water');
    return uniq(out);
  }

  // ---------- 1. classify hand-written entries ----------
  var curated = [];
  T.groups.forEach(function (g) { g.events.forEach(function (e) {
    var text = e.title + ' ' + (e.text || '');
    e.projects = e.projects || projectsFor(text, e.tracks);
    e.topics = e.topics || topicsFor(text, e.tracks);
    curated.push(e);
  }); });
  var cited = curated.map(function (e) { return JSON.stringify(e.src || []) + ' ' + e.title + ' ' + (e.text || ''); }).join('\n');

  // ---------- 2. entries from the map's records ----------
  var auto = [];
  var iso = function (d) { var m;
    if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d))) return m[0];
    if ((m = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/.exec(d))) return m[3] + '-' + ('0' + m[1]).slice(-2) + '-' + ('0' + m[2]).slice(-2);
    return null; };
  var centre = function (geom) { var xs = [], ys = [];
    (function walk(c) { if (typeof c[0] === 'number') { xs.push(c[0]); ys.push(c[1]); } else c.forEach(walk); })(geom.coordinates);
    return [(Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2, (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2]; };
  var add = function (e) { e.auto = true; e.projects = e.projects || projectsFor(e.title + ' ' + (e.text || ''), []); e.topics = e.topics || topicsFor(e.title + ' ' + (e.text || ''), []); auto.push(e); };

  // ODEQ stormwater permits (data-center, industrial and Anthem items; the ~50 unrelated local permits are left out)
  if (typeof PERMITS !== 'undefined') PERMITS.features.forEach(function (f) { var p = f.properties, d = iso(p.date || '');
    if (!/^deq/.test(p.cat) || p.scope === 'local' || !d || cited.indexOf(p.id) >= 0) return;
    var ll = f.geometry.type === 'Point' ? [f.geometry.coordinates[1], f.geometry.coordinates[0]] : centre(f.geometry);
    add({ id: 'rec-deq-' + p.id, date: d, title: (p.cat === 'deq-pending' ? 'ODEQ stormwater permit application: ' : 'ODEQ stormwater permit: ') + p.name,
      text: [p.who, p.id, p.project && p.project !== p.name ? p.project : ''].filter(Boolean).join(' · ') + '. Construction stormwater coverage (OKR10) for land disturbance; the point is the filer’s gate location.',
      projects: projectsFor((p.project || '') + ' ' + p.name, p.scope === 'anthem' ? ['anthem'] : []), topics: ['env', 'build'],
      src: [p.cat === 'deq-pending' ? 'odeq_pend' : 'odeq_in'], map: [ll[0], ll[1], 15] }); });

  // recorded deeds / sales on mapped land (data-center sites)
  if (typeof DCS !== 'undefined') { var seenSale = {};
    DCS.features.forEach(function (f) { var p = f.properties; if (!p.sale) return;
      p.sale.split('; ').forEach(function (s) { var d = iso(s); if (!d) return;
        var k = p.site + '|' + d; if (seenSale[k]) { seenSale[k].acres += p.acres; seenSale[k].n++; return; }
        var ll = centre(f.geometry), price = (/\$\d{1,3}(?:,\d{3})+/.exec(s) || [''])[0], from = (/from (.+)$/.exec(s) || [])[1];
        seenSale[k] = { id: 'rec-deed-' + p.site + '-' + d, date: d, acres: p.acres, n: 1, site: p.siteName, holder: p.holder, from: from, price: price, s: s, src: p.src, ll: ll }; }); });
    Object.keys(seenSale).forEach(function (k) { var x = seenSale[k];
      if (cited.indexOf(x.date) >= 0 && cited.toLowerCase().indexOf(x.holder.split(/[ ,]/)[0].toLowerCase()) >= 0) return;
      add({ id: x.id, date: x.date, title: 'Deed recorded: ' + x.holder + (x.from ? ' from ' + x.from.replace(/ \(.*\)$/, '') : '') + (x.price ? ', ' + x.price : ''),
        text: x.site + ' — ' + x.n + ' parcel' + (x.n > 1 ? 's' : '') + ', about ' + Math.round(x.acres) + ' ac on today’s roll. Record: ' + x.s + '.',
        topics: ['land'], src: [['County record', x.src]], map: [x.ll[0], x.ll[1], 14] }); }); }

  // City Council easements not already cited by a hand-written entry
  if (typeof EASE !== 'undefined') { var byCC = {};
    EASE.features.forEach(function (f) { var p = f.properties; if (cited.indexOf(p.pdf) >= 0) return;
      var k = p.cc + '|' + p.project; (byCC[k] = byCC[k] || { p: p, pdfs: [], acres: 0, f: f }).pdfs.push(p.pdf); byCC[k].acres += +p.acres; });
    Object.keys(byCC).forEach(function (k) { var x = byCC[k], ll = centre(x.f.geometry);
      add({ id: 'rec-ease-' + x.p.cc + '-' + x.p.doc, date: x.p.cc, title: 'City Council accepts easements: ' + x.p.project,
        text: uniq(x.pdfs).length + ' document' + (uniq(x.pdfs).length > 1 ? 's' : '') + ', ' + x.acres.toFixed(2) + ' ac (grantor: ' + x.p.owner + ').',
        topics: ['water'], src: uniq(x.pdfs), map: [ll[0], ll[1], 16] }); }); }

  // ---------- place record entries into the timeline's periods ----------
  var key = function (d) { return d.length === 7 ? d + '-15' : d.length === 4 ? d + '-07-01' : d; };
  var spans = T.groups.map(function (g) { var ds = g.events.map(function (e) { return key(e.date); }).sort();
    return { g: g, lo: ds[0] || '0000', hi: ds[ds.length - 1] || '9999' }; });
  auto.forEach(function (e) { var k = key(e.date), best = null, bd = Infinity;
    spans.forEach(function (s) { var dist = k < s.lo ? Date.parse(s.lo) - Date.parse(k) : k > s.hi ? Date.parse(k) - Date.parse(s.hi) : 0;
      if (dist < bd) { bd = dist; best = s; } });
    if (best) best.g.events.push(e); });
  T.groups.forEach(function (g) { g.events.sort(function (a, b) { return key(a.date) < key(b.date) ? -1 : key(a.date) > key(b.date) ? 1 : 0; }); });

  // ---------- filter dimensions for timeline.js ----------
  T.dims = {
    projects: G.map(function (g) { return { id: g.id, name: g.name.replace(/ — .*$/, ''), color: g.color }; }),
    topics: TP.map(function (t) { return { id: t.id, name: t.name }; })
  };
  T.autoCount = auto.length;
})();
