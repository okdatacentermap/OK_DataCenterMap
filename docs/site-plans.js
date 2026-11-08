// Developer site plans, traced site boundaries and renderings for the other projects.
// Site plans are fitted to recorded boundaries (least squares on property-line corners, Web Mercator) and masked to the
// property, drawn like the Anthem site-plan sheet. Renderings that cannot be fitted to the ground are listed in the
// project's cards under "Facts & sources".
(function () {
  'use strict';
  if (typeof byId !== 'function') return;
  var PLANS = [
    { group: 'mustang', key: 'plan', color: '#5e5ce6',
      label: 'Conceptual site plan (Beale / Kimley-Horn, Feb 2026)',
      file: 'media/mustang_siteplan_kimley-horn_2026-02_fitted.webp', size: [707, 417],
      // TL, TR, BR, BL as [lon, lat]
      corners: [[-95.6191225, 36.3526526], [-95.5928709, 36.3526794], [-95.5928563, 36.340273], [-95.619108, 36.3402461]],
      note: '7 corners of the Project Plan Exhibit B incentive districts; RMS 1.9 m',
      source: ['Beale Infrastructure — Claremore', 'https://bealeinfra.com/location/claremore/'] },
    { group: 'clydesdale', key: 'plan', color: '#0a84ff',
      label: 'Site rendering (Beale, 2025-04-23)',
      file: 'media/clydesdale_siteplan_beale_2025-04-23_fitted.webp', size: [775, 774],
      corners: [[-95.9198638, 36.2785187], [-95.9020859, 36.2785545], [-95.9021024, 36.2640873], [-95.9198803, 36.2640515]],
      note: '7 corners of the Clydesdale plat outline; RMS 5.2 m',
      source: ['Beale Infrastructure — Tulsa County', 'https://bealeinfra.com/location/tulsa-county/'] },
    { group: 'inola', key: 'plan', color: '#a2845e',
      label: 'Smelter plot plan (air-permit application v2, 2026-09-03)',
      file: 'media/inola-smelter_plot-plan_PSD-app-v2_2026-09-03_fitted.webp', size: [1612, 732],
      corners: [[-95.5687257,36.1302383], [-95.5355629,36.1295599], [-95.5359452,36.1173435], [-95.5691028,36.1180219]],
      note: 'Figure 2 of the corrected PSD application; placed from its own Oklahoma North state-plane grid (EPSG:2267), no hand fitting',
      source: ['ODEQ permit 2026-0100-C PSD — application v2', 'https://applications.deq.ok.gov/PermitsPublicReview/permitinformation.aspx?id=1072402'], on: false },
    { group: 'inola', key: 'rend', color: '#b8421f',
      label: 'Smelter rendering (\u00a9 Oklahoma Primary Aluminum, fitted to the ground)',
      file: 'media/inola-smelter_OPA_rendering-1_fitted.webp', size: [1320, 593],
      corners: [[-95.5225576,36.1097631], [-95.5744031,36.115397], [-95.5631255,36.1312068], [-95.5409713,36.132234]],
      note: 'Oblique aerial rendering fitted with a ground-plane projective transform to the plot plan (potroom ends, pond) and to imagery (Sofidel pond and building); RMS 26 m on 8 points. Building heights lean away from the camera; masked to the property boundary.',
      source: ['KTUL \u2014 renderings released with the impact study', 'https://ktul.com/news/local/oklahoma-primary-aluminum-releases-impact-study-on-proposed-smelter-in-inola'] }
  ];
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('anthem-overlay-groups-v3') || 'null'); } catch (e) {}
  var paints = [];
  PLANS.forEach(function (P) {
    var g = byId(P.group); if (!g) return;
    var pane = map.createPane('p_plan_' + P.group + '_' + P.key);
    g.panes.push(pane);                     // stacks just under the group's vectors and follows its opacity slider
    var corners = P.corners.map(function (c) { return [c[1], c[0]]; });
    var src = [[0, 0], [P.size[0], 0], [P.size[0], P.size[1]], [0, P.size[1]]];
    var el = document.createElement('img'); el.className = 'warp'; el.alt = P.label;
    el.src = P.file; pane.appendChild(el);
    var on = P.on !== false; if (!on) el.style.display = 'none';
    var paint = function () { if (on) warp(el, src, corners); };
    el.onload = paint; paints.push(paint);
    var sub = addSub(P.group, { key: P.key, on: P.on !== false, label: swatch(P.color) + P.label,
      show: function (v) { on = v; el.style.display = v ? '' : 'none'; paint(); } });
    var o = saved && saved.filter(function (x) { return x.id === P.group; })[0];
    if (o && o.subs && P.key in o.subs) sub.on = o.subs[P.key];
  });
  map.on('zoomend moveend viewreset resize', function () { paints.forEach(function (f) { f(); }); });

  // ---------- site boundaries traced from a developer's or park's published graphic (approximate) ----------
  var TRACED = [
    { group: 'maip', key: 'lambda-site', color: '#34c759', facts: 'project:Lambda (MidAmerica)',
      name: 'Lambda data center site (approximate)',
      note: 'Traced from MidAmerica Industrial Park’s site graphic and matched to imagery by the rail curve, the north road and the east line; about 340 ac traced vs. 329 ac reported. Approximate (±30–40 m).',
      source: ['MidAmerica Industrial Park — Lambda project Q&A (site graphic)', 'https://maip.com/news/article/lambda-data-center-project-community-questions-and-answers'],
      ring: [[-95.303481,36.234612],[-95.297048,36.234864],[-95.296963,36.229535],[-95.29683,36.224718],[-95.296821,36.220707],[-95.299796,36.217624],[-95.300899,36.217874],[-95.302195,36.218579],[-95.303238,36.219597],[-95.303861,36.220519],[-95.304718,36.221546],[-95.305434,36.222765],[-95.306154,36.223891],[-95.306874,36.225017],[-95.307275,36.226158],[-95.307392,36.227126],[-95.30723,36.228386],[-95.306682,36.229385],[-95.305975,36.230392],[-95.305272,36.231283],[-95.304442,36.232666],[-95.3037,36.234439],[-95.303481,36.234612]] }
  ];
  TRACED.push({ group: 'inola', key: 'opa-property', color: '#a2845e', facts: 'project:Inola aluminum smelter (proposed)',
    name: 'Smelter property boundary (air-permit modeling protocol)',
    note: 'Property boundary from Figure 4-1 of the Class II modeling protocol in the PSD application, read from its UTM grid; about 712 ac. OPA says it plans to fence the whole boundary.',
    source: ['ODEQ permit 2026-0100-C PSD — application v2', 'https://applications.deq.ok.gov/PermitsPublicReview/permitinformation.aspx?id=1072402'],
    ring: [[-95.56486,36.133281],[-95.564789,36.119283],[-95.543189,36.119119],[-95.542923,36.121087],[-95.541498,36.121206],[-95.539699,36.121645],[-95.53867,36.122113],[-95.536624,36.123405],[-95.538632,36.126038],[-95.547155,36.126213],[-95.547184,36.128799],[-95.551547,36.131158],[-95.551613,36.133208],[-95.55184,36.133426],[-95.56486,36.133281]] });
  TRACED.forEach(function (T) {
    if (!byId(T.group)) return;
    var f = { type: 'Feature', geometry: { type: 'Polygon', coordinates: [T.ring] }, properties: {} };
    var grp = L.geoJSON(f, Object.assign(vec(T.group), { style: { color: T.color, weight: 2.5, dashArray: '5 4', fillColor: T.color, fillOpacity: .15 },
      onEachFeature: function (ff, l) { bindInfo(l, '<b>' + esc(T.name) + '</b><br><span style="font-size:11px">' + esc(T.note) + '</span>', [T.facts], [{ f: T.note, links: [T.source] }]); } }));
    var sub = addSub(T.group, { key: T.key, label: swatch(T.color) + esc(T.name), grp: grp });
    var o = saved && saved.filter(function (x) { return x.id === T.group; })[0];
    if (o && o.subs && T.key in o.subs) sub.on = o.subs[T.key];
  });

  // ---------- renderings that can't be fitted to the ground: listed in the project's cards (Facts & sources) ----------
  var R = 'media/renderings/';
  var RENDERINGS = [
    { keys: ['project:Project Clydesdale', 'dcsite:clydesdale'],
      f: 'Developer renderings (Beale Infrastructure, 2025-04-23): ground-level views from the 86th St creek crossing and the neighbourhood to the west, and an aerial view from 76th St & Sheridan Rd. The plan view is on the map as an overlay.',
      items: [['86th St creek crossing', R + 'clydesdale_beale_2025-04-23_86th-St-creek-crossing.webp'], ['From the residential neighbourhood', R + 'clydesdale_beale_2025-04-23_from-residential-neighborhood.webp'], ['Aerial view', R + 'clydesdale_beale_2025-04-23_aerial-view.webp'], ['Beale Infrastructure — Tulsa County', 'https://bealeinfra.com/location/tulsa-county/']] },
    { keys: ['project:Project Spring', 'dcsite:spring'],
      f: 'Conceptual renderings (Kimley-Horn, 2025-11-17): two views from Highway 97 and the site entrance. The City’s project plan (Exhibit D) shows a draft layout of diagonal buildings and says the site plan is subject to change.',
      items: [['View from Highway 97 (1)', R + 'spring_kimley-horn_2025-11-17_view-from-Hwy-97-a.webp'], ['View from Highway 97 (2)', R + 'spring_kimley-horn_2025-11-17_view-from-Hwy-97-b.webp'], ['Site entrance from Highway 97', R + 'spring_kimley-horn_2025-11-17_site-entrance.webp'], ['Project Spring website', 'https://www.projectspringok.com/'], ['City of Sand Springs — Project Plan (draft, Exhibits A–D)', 'https://www.sandspringsok.gov/DocumentCenter/View/6017/Project-Spring-Project-Plan']] },
    { keys: ['project:Inola aluminum smelter (proposed)', 'project:Tulsa Port of Inola (smelter site)', 'dcsite:inola'],
      f: 'Developer renderings (Oklahoma Primary Aluminum, released Sept 2026 with its economic-impact study): two aerial views of the smelter beside the Sofidel plant at the Tulsa Port of Inola, and a location view toward the town of Inola. Design concepts, not photographs. Rendering 1 and the air-permit plot plan are on the map as overlays.',
      items: [['Rendering 1', R + 'inola-smelter_OPA_2026-09_rendering-1.webp'], ['Rendering 2', R + 'inola-smelter_OPA_2026-09_rendering-2.webp'], ['Location view', R + 'inola-smelter_OPA_2026-09_rendering-3-location.webp'], ['KTUL — impact study and renderings', 'https://ktul.com/news/local/oklahoma-primary-aluminum-releases-impact-study-on-proposed-smelter-in-inola'], ['ODEQ air-permit file 2026-0100-C PSD (application v2 with plot plan, modeling protocol, deficiency letters)', 'https://applications.deq.ok.gov/PermitsPublicReview/permitinformation.aspx?id=1072402']] },
    { keys: ['project:Core Scientific (Port Muskogee)', 'dcsite:coresci'],
      f: 'Company rendering of the Muskogee data center (via Core Scientific), published with reporting on its plan to grow the campus to about 1.5 GW.',
      items: [['Rendering', R + 'core-scientific_muskogee_rendering.webp'], ['Data Center Knowledge — Muskogee 1.5 GW plan', 'https://www.datacenterknowledge.com/data-center-construction/core-scientific-bets-on-1-5-gw-ai-campus-in-oklahoma']] },
    { keys: ['project:Lambda (MidAmerica)'],
      f: 'MidAmerica Industrial Park’s site graphic for Lambda (Oct 2026) — the source of the traced site outline on the map.',
      items: [['Site graphic', R + 'lambda_maip_2026-10_site-graphic.webp'], ['MidAmerica — Lambda Q&A', 'https://maip.com/news/article/lambda-data-center-project-community-questions-and-answers']] }
  ];
  RENDERINGS.forEach(function (r, i) {
    var ids = r.items.map(function (it, j) { var id = 'rend_' + i + '_' + j; FACTS.sources[id] = it; return id; });
    r.keys.forEach(function (k) { (FACTS.facts[k] = FACTS.facts[k] || []).push({ f: r.f, s: ids }); });
  });

  renderList(); applyLayers();
})();
