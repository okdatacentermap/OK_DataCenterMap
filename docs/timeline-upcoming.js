// timeline-upcoming.js — scheduled items the project is tracking, shown at the top of the timeline as "Coming up"
// from (today) until (today + windowDays). The page decides by the visitor's own date, so an item appears by itself when it
// comes within the window and drops off after its date: no rebuild or push is needed on the day.
// Facts only: add an item only when an official posted agenda / notice / order states the date (cite it in `src`).
// Once the event has happened, record what occurred as a normal entry in timeline-data.js and delete the item here.
// Fields: id, date 'YYYY-MM-DD', time (text, optional), where (optional), title, text, src [[label, url-or-path]], tracks [...]
//   from: 'YYYY-MM-DD' (optional) earliest day to show it, windowDays here is the default.
window.TIMELINE_UPCOMING = {
  windowDays: 21,
  items: [
    { id: 'up-2026-11-16-persica-bocc', date: '2026-11-16', time: '9:00 am', where: 'Commissioners Meeting Room, North Annex, Wagoner County',
      title: 'County Commissioners: Persica Solar, LLC v. Board of County Commissioners (CV-25-111)',
      text: 'The posted agenda lists an executive session on Case No. CV-25-111, Persica Solar, LLC v. Board of County Commissioners (\u201cpending litigation and remanded proceedings\u201d), followed by open-session discussion and possible action on the case, to include possible appeal.',
      src: [['Wagoner County Commissioners agenda, Nov 16, 2026', 'https://wagonercounty.ok.gov/AgendaCenter/ViewFile/Agenda/_11162026-1205']], tracks: ['power'] },
    { id: 'up-2026-12-02-zca41-hearing', date: '2026-12-02', time: '1:00 pm', where: 'City Council Chamber, 175 E. 2nd St., Tulsa',
      title: 'Planning Commission hearing on the proposed data-center zoning rules (ZCA-41)',
      text: 'The Planning Office’s work-session agenda (Nov 4) says the proposed data-center text amendments are scheduled for a Planning Commission hearing on Dec 2, 2026; after the Commission’s recommendation they go to the City Council.',
      src: [['Planning Commission work session agenda, Nov 4, 2026', 'official/TMAPC/2026-11-04_TMAPC_Work-Session-Agenda_ZCA-41-data-centers.pdf']], tracks: ['anthem'] },
    { id: 'up-2026-12-02-moratorium-extension', date: '2026-12-02', time: '', where: 'Council Chamber, 175 E. 2nd St., Tulsa',
      title: 'City Council: ordinance extending the data-center building-permit moratorium through March 31, 2027',
      text: 'The Council’s Nov 18 agenda lists an ordinance (Emergency Clause; Councilor Bellis) extending the existing moratorium on Data Center Building Permits through March 31, 2027, preserving existing exemptions and appeals procedures, with automatic expiration. The agenda schedules it for the Public Works committee and the Council on Nov 18 and for the Council again on Dec 2.',
      src: [['City Council agenda, Nov 18, 2026 (item 6.m)', 'official/CityCouncil/2026-11-18_CC_Regular-5PM-Agenda.pdf']], tracks: ['anthem'] },
    { id: 'up-2026-12-31-moratorium-end', date: '2026-12-31', time: '',
      title: 'Council moratorium on new data centers is scheduled to run through this date',
      text: 'The Council’s March 25, 2026 moratorium (Ord. 25764) is “effective through December 31, 2026”, per the Planning Office’s Nov 4 work-session agenda; Anthem phase 1 and one additional data center are exempt. An ordinance extending it through March 31, 2027 is on the Council’s Nov 18 agenda and set again for Dec 2.',
      src: [['Planning Commission work session agenda, Nov 4, 2026', 'official/TMAPC/2026-11-04_TMAPC_Work-Session-Agenda_ZCA-41-data-centers.pdf'], 'moratorium'], tracks: ['anthem'] }
  ]
};
