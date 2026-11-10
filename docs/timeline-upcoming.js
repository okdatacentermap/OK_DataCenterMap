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
    { id: 'up-2026-12-02-zca41-hearing', date: '2026-12-02', time: '1:00 pm', where: 'City Council Chamber, 175 E. 2nd St., Tulsa',
      title: 'Planning Commission hearing on the proposed data-center zoning rules (ZCA-41)',
      text: 'The Planning Office’s work-session agenda (Nov 4) says the proposed data-center text amendments are scheduled for a Planning Commission hearing on Dec 2, 2026; after the Commission’s recommendation they go to the City Council.',
      src: [['Planning Commission work session agenda, Nov 4, 2026', 'official/TMAPC/2026-11-04_TMAPC_Work-Session-Agenda_ZCA-41-data-centers.pdf']], tracks: ['anthem'] },
    { id: 'up-2026-12-31-moratorium-end', date: '2026-12-31', time: '',
      title: 'Council moratorium on new data centers is scheduled to run through this date',
      text: 'The Council’s March 25, 2026 moratorium (Ord. 25764) is “effective through December 31, 2026”, per the Planning Office’s Nov 4 work-session agenda; Anthem phase 1 and one additional data center are exempt.',
      src: [['Planning Commission work session agenda, Nov 4, 2026', 'official/TMAPC/2026-11-04_TMAPC_Work-Session-Agenda_ZCA-41-data-centers.pdf'], 'moratorium'], tracks: ['anthem'] }
  ]
};
