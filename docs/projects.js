// Shared project registry for the map's project groups and the timeline's filters.
// Add a project here once: the map gets a group (if map !== false) and the timeline gets a Projects chip.
//   id      group / chip key          name   full name          short  label on the map at low zoom
//   color   group colour              match  regex (source string, case-insensitive) used to file timeline entries
//   map     false = timeline only (no map group)
// Topics: the timeline's second filter row. `tracks` maps the older per-entry tracks; `match` adds keyword rules.
window.PROJECTS = {
  groups: [
    { id: 'anthem',     name: 'Project Anthem — Meta / Atmoss LLC', short: 'Project Anthem', color: '#ff375f',
      match: 'Anthem|Atmoss|\\bMeta\\b|Fortis|Gatusi|Fair Oaks West|IDP 197415' },
    { id: 'mpd',        name: 'MPD-6 / Robson Ranch', short: 'MPD-6', color: '#ffd60a',
      match: 'MPD-6|Fair Oaks|Robson|Z-7851|Amethyst|PartnerTulsa' },
    { id: 'inola',      name: 'Inola smelter / Tulsa Port of Inola', short: 'Port of Inola', color: '#a2845e',
      match: 'Inola|smelter|Guava|Century Aluminum|\\bEGA\\b|Primary Aluminum' },
    { id: 'maip',       name: 'MidAmerica Industrial Park (Pryor) — Google, Lambda, GRDA', short: 'MidAmerica Industrial Park', color: '#34c759',
      match: 'Pryor|MidAmerica|Mid-America|Lambda|Myall|Chouteau|Grand River Energy Center' },
    { id: 'clydesdale', name: 'Project Clydesdale (Tulsa County)', short: 'Project Clydesdale', color: '#0a84ff',
      match: 'Clydesdale|Beale|Blue Owl|Owasso' },
    { id: 'mustang',    name: 'Project Mustang (Claremore)', short: 'Project Mustang', color: '#5e5ce6',
      match: 'Mustang|Claremore' },
    { id: 'spring',     name: 'Project Spring (Sand Springs)', short: 'Project Spring', color: '#30b0c7',
      match: 'Project Spring|Sand Springs|Horizon (Land )?Development|Osage County' },
    { id: 'coresci',    name: 'Core Scientific (Port of Muskogee)', short: 'Core Scientific', color: '#ff9f0a',
      match: 'Core Scientific' },
    { id: 'muskconf',   name: 'Confidential data center (Muskogee County)', short: 'Confidential DC (Muskogee)', color: '#ff2d55',
      match: 'Confidential data center' },
    { id: 'okc',        name: 'Oklahoma City data centers', short: 'OKC data centers', color: '#bf5af2',
      match: '7725|SE 67th|2040 Energy|Reno 1' },
    { id: 'infra',      name: 'Shared infrastructure — power lines, roads, sewer & water', short: '', color: '#8e8e93',
      match: 'S 193rd|193rd|273rd|Spunky Creek|Main Stem|TMUA-W|waterline|GRDA 161|Catoosa substation|Hidden Meadows|Settler' },
    { id: 'other',      name: 'Statewide & other places', short: '', color: '#6b6a65', map: false, match: '' }
  ],
  topics: [
    { id: 'land',   name: 'Zoning & land',        tracks: [], match: 'zoning|rezon|\\bMPD\\b|\\bZ-\\d{4}|ZCA|plat|PUD|annex|deed|buys|bought|purchase|acres|TMAPC|land|withdrawn' },
    { id: 'money',  name: 'Incentives & money',   tracks: ['money'], match: 'incentive|tax|increment|TIF|PILOT|\\$\\d|Local Development Act|LDA' },
    { id: 'power',  name: 'Power',                tracks: ['power'], match: 'substation|kV|transmission|PSO|GRDA|\\bMW\\b|power|electric' },
    { id: 'water',  name: 'Water & sewer',        tracks: [], match: 'water|sewer|wastewater|TMUA|OWRB|groundwater|cooling' },
    { id: 'roads',  name: 'Roads',                tracks: [], match: 'road|street|signal|roundabout|bridge|turnpike|ODOT|widening|right-of-way' },
    { id: 'build',  name: 'Construction',         tracks: [], match: 'construction|groundbreaking|breaks ground|clearing|building permit|site prep|stormwater' },
    { id: 'env',    name: 'Environment & permits', tracks: ['env'], match: 'ODEQ|DEQ|stormwater|air permit|PSD|emission|wetland|Army Corps|contamination' },
    { id: 'law',    name: 'Law & policy',         tracks: ['law'], match: 'moratorium|\\bHB \\d|\\bSB \\d|\\bAct\\b|lawsuit|sues|Attorney General|court|ordinance|recall|City Council|Commission|appoint|re-evaluat|notice' },
    { id: 'company', name: 'Companies & announcements', tracks: [], match: 'announce|joint venture|end customer|confirmed|acquir|\\bGoogle\\b|\\bMeta\\b|Lambda|Beale|\\bEGA\\b|Core Scientific' }
  ]
};
