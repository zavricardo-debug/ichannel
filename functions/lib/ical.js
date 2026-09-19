// Shared RFC 5545 (iCalendar) parsing helpers.
//
// Used by the POST /api/import-airbnb Cloudflare Pages Function to turn an
// external channel's .ics export (Airbnb, Booking.com, Vrbo, ...) into
// nightly `dateOverrides` blocks, and by the vitest suite.
//
// Key contract — DTEND is EXCLUSIVE (RFC 5545 §3.6.1):
//   DTSTART;VALUE=DATE:20260920
//   DTEND;VALUE=DATE:20260924
// blocks the nights 2026-09-20 .. 2026-09-23. The 09-24 checkout day stays
// sellable, which is what lets back-to-back reservations share a turnover day.

// Guard against malformed/absurd ranges creating unbounded loops.
const MAX_NIGHTS_PER_EVENT = 730;

// ---------------------------------------------------------------------------
// Low-level text handling
// ---------------------------------------------------------------------------

// Unfold content lines (RFC 5545 §3.1): a line starting with a single space
// or tab is a continuation of the previous line and the fold marker is
// removed. Handles CRLF, lone CR and lone LF inputs.
export function unfoldIcsLines(text) {
  const normalized = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = [];
  for (const raw of normalized.split('\n')) {
    if ((raw.startsWith(' ') || raw.startsWith('\t')) && lines.length > 0) {
      lines[lines.length - 1] += raw.slice(1);
    } else {
      lines.push(raw);
    }
  }
  return lines;
}

// Split a content line into { name, params, value }. The name/value separator
// is the first ':' that is not inside a double-quoted param value, e.g.
//   DTSTART;VALUE=DATE:20260920
//   DESCRIPTION;TZID="America/Los_Angeles":See you\, then
export function parseContentLine(line) {
  let inQuotes = false;
  let colonIdx = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ':' && !inQuotes) {
      colonIdx = i;
      break;
    }
  }
  if (colonIdx === -1) return null;

  const value = line.slice(colonIdx + 1);
  const segments = line.slice(0, colonIdx).split(';');
  const name = segments[0].trim().toUpperCase();
  if (!name) return null;

  const params = {};
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const eq = seg.indexOf('=');
    if (eq === -1) continue;
    params[seg.slice(0, eq).trim().toUpperCase()] = seg.slice(eq + 1).trim().replace(/^"|"$/g, '');
  }
  return { name, params, value };
}

// Unescape TEXT values (RFC 5545 §3.3.11): "\\,", "\\;", "\\n", "\\N", "\\\\".
export function unescapeIcalText(value) {
  return String(value)
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

// ---------------------------------------------------------------------------
// Calendar-day helpers (all keys are `YYYY-MM-DD`)
// ---------------------------------------------------------------------------

function formatUtcDayKey(dt) {
  const y = String(dt.getUTCFullYear()).padStart(4, '0');
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Convert an iCal DATE or DATE-TIME value into a `YYYY-MM-DD` day key.
//   `20260920`              -> `2026-09-20`        (VALUE=DATE)
//   `20261120T150000Z`      -> `2026-11-20`        (UTC datetime -> UTC day)
//   `20261120T150000`       -> `2026-11-20`        (local datetime -> local day,
//                                                     the right granularity for
//                                                     nightly blocks)
export function icalValueToDayKey(value) {
  const v = String(value || '').trim();
  let m = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;

  m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(v);
  if (m) {
    const [, y, mo, d, h, mi, s, z] = m;
    if (z === 'Z') {
      return formatUtcDayKey(new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s)));
    }
    return `${y}-${mo}-${d}`;
  }
  return null;
}

// Add `n` days to a `YYYY-MM-DD` key using UTC arithmetic (no DST surprises).
export function addDaysToDayKey(dayKey, n) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return formatUtcDayKey(new Date(Date.UTC(y, m - 1, d + n)));
}

export function compareDayKeys(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// Nights in [startKey, endKey) — DTEND inclusive of start, exclusive of end.
export function nightsBetweenExclusive(startKey, endKey) {
  const nights = [];
  let cursor = startKey;
  while (compareDayKeys(cursor, endKey) < 0 && nights.length < MAX_NIGHTS_PER_EVENT) {
    nights.push(cursor);
    cursor = addDaysToDayKey(cursor, 1);
  }
  return nights;
}

// ---------------------------------------------------------------------------
// VEVENT parsing
// ---------------------------------------------------------------------------

function finalizeEvent(rawProps) {
  const get = (name) => rawProps[name]?.value;

  const uid = get('UID') || null;
  const summary = unescapeIcalText(get('SUMMARY') || '').trim();
  const description = unescapeIcalText(get('DESCRIPTION') || '').trim();
  const status = (get('STATUS') || '').trim().toUpperCase();

  const start = icalValueToDayKey(get('DTSTART'));
  const rawEnd = get('DTEND');
  const end = rawEnd ? icalValueToDayKey(rawEnd) : null;

  let nights = [];
  let skipReason = null;

  if (status === 'CANCELLED') {
    skipReason = 'cancelled';
  } else if (!start) {
    skipReason = 'missing-dtstart';
  } else if (end && compareDayKeys(end, start) <= 0) {
    // RFC 5545: DTEND must be strictly after DTSTART.
    skipReason = 'dtend-not-after-dtstart';
  } else {
    // RFC 5545 §3.6.1: when DTEND is absent on an all-day (VALUE=DATE) event
    // it defaults to DTSTART + 1 day — i.e. exactly one blocked night.
    const exclusiveEnd = end || addDaysToDayKey(start, 1);
    nights = nightsBetweenExclusive(start, exclusiveEnd);
  }

  return {
    uid,
    summary,
    description,
    status,
    start,
    end,
    nights,
    ok: skipReason === null && nights.length > 0,
    skipReason
  };
}

// Parse an .ics document into calendar-level props and finalized VEVENTs.
export function parseIcs(text) {
  const calendar = {};
  const events = [];
  let currentEventProps = null;

  for (const line of unfoldIcsLines(text)) {
    if (/^BEGIN:VEVENT$/i.test(line.trim())) {
      currentEventProps = {};
      continue;
    }
    if (/^END:VEVENT$/i.test(line.trim())) {
      if (currentEventProps) events.push(finalizeEvent(currentEventProps));
      currentEventProps = null;
      continue;
    }
    const prop = parseContentLine(line);
    if (!prop) continue;
    if (currentEventProps) {
      currentEventProps[prop.name] = prop;
    } else {
      calendar[prop.name] = prop.value;
    }
  }

  return { calendar, events };
}

// Turn an .ics document into deduped, chronologically sorted blocked nights.
// For each night we also keep the first non-empty SUMMARY so the UI can show
// why the night is blocked (Airbnb exports use "Reserved" / "Blocked").
export function collectBlockedDates(text) {
  const { calendar, events } = parseIcs(text);

  const dateSet = new Set();
  const summaryByDate = new Map();
  const eventsSkipped = [];
  let eventsIncluded = 0;

  for (const ev of events) {
    if (!ev.ok) {
      eventsSkipped.push({ uid: ev.uid, summary: ev.summary, reason: ev.skipReason });
      continue;
    }
    eventsIncluded++;
    for (const night of ev.nights) {
      dateSet.add(night);
      if (!summaryByDate.has(night) && ev.summary) {
        summaryByDate.set(night, ev.summary);
      }
    }
  }

  return {
    calendar,
    dates: [...dateSet].sort(),
    summaryByDate,
    eventsIncluded,
    eventsSkipped
  };
}
