import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  unfoldIcsLines,
  parseContentLine,
  unescapeIcalText,
  icalValueToDayKey,
  addDaysToDayKey,
  nightsBetweenExclusive,
  parseIcs,
  collectBlockedDates
} from '../functions/lib/ical.js';

const FIXTURE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'airbnb-export.ics');
const AIRBNB_FIXTURE = readFileSync(FIXTURE_PATH, 'utf8');

// The fixture is a real-world-shaped Airbnb export: CRLF line endings, a
// folded DESCRIPTION, back-to-back reservations, a host block, a cancelled
// event, an event with no DTEND, and UTC DATE-TIME values.
const EXPECTED_FIXTURE_DATES = [
  // Event 1: Sep 20 -> Sep 24, DTEND EXCLUSIVE => nights 20,21,22,23
  '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23',
  // Event 2: back-to-back turnover, starts on event 1's checkout day
  '2026-09-24', '2026-09-25', '2026-09-26',
  // Event 3: single-night host block
  '2026-10-02',
  // Event 4: folded DESCRIPTION event
  '2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13',
  // Event 5 is CANCELLED and must NOT contribute dates
  // Event 6: no DTEND => defaults to exactly one night
  '2026-11-05',
  // Event 7: UTC DATE-TIME 20261120T150000Z -> 20261123T110000Z
  '2026-11-20', '2026-11-21', '2026-11-22'
];

describe('icalValueToDayKey', () => {
  it('converts VALUE=DATE values', () => {
    expect(icalValueToDayKey('20260920')).toBe('2026-09-20');
  });

  it('converts UTC DATE-TIME values to their UTC calendar day', () => {
    expect(icalValueToDayKey('20261120T150000Z')).toBe('2026-11-20');
    expect(icalValueToDayKey('20261130T235959Z')).toBe('2026-11-30');
    expect(icalValueToDayKey('20270101T003000Z')).toBe('2027-01-01');
  });

  it('uses the local calendar day for floating/TZID datetimes', () => {
    expect(icalValueToDayKey('20261120T150000')).toBe('2026-11-20');
  });

  it('returns null for garbage', () => {
    expect(icalValueToDayKey('not-a-date')).toBeNull();
    expect(icalValueToDayKey('')).toBeNull();
    expect(icalValueToDayKey(undefined)).toBeNull();
  });
});

describe('addDaysToDayKey', () => {
  it('rolls over months and years correctly', () => {
    expect(addDaysToDayKey('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDaysToDayKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToDayKey('2028-02-28', 1)).toBe('2028-02-29'); // leap year
    expect(addDaysToDayKey('2026-09-20', 4)).toBe('2026-09-24');
  });
});

describe('parseContentLine', () => {
  it('parses name, params and value', () => {
    expect(parseContentLine('DTSTART;VALUE=DATE:20260920')).toEqual({
      name: 'DTSTART',
      params: { VALUE: 'DATE' },
      value: '20260920'
    });
  });

  it('ignores colons inside quoted parameter values', () => {
    const prop = parseContentLine('DESCRIPTION;X-NOTE="time: 4pm":hello: world');
    expect(prop.value).toBe('hello: world');
    expect(prop.params['X-NOTE']).toBe('time: 4pm');
  });

  it('normalizes the property name casing', () => {
    expect(parseContentLine('summary:Reserved').name).toBe('SUMMARY');
  });

  it('returns null for non-content lines', () => {
    expect(parseContentLine('BEGIN:VEVENT')).toMatchObject({ name: 'BEGIN' });
    expect(parseContentLine('no-colon-here')).toBeNull();
  });
});

describe('unfoldIcsLines + unescapeIcalText', () => {
  it('unfolds RFC 5545 folded lines (CRLF + single WSP)', () => {
    const unfolded = unfoldIcsLines(
      'DESCRIPTION:Guest note: Two adults and one small dog\\, arriving\r\n  after 4pm. Confirmation code HMSQQLMN. Message through the Airbnb app\r\n  for early check-in requests.\r\nSTATUS:CONFIRMED\r\n'
    );
    // Each fold marker (CRLF + one WSP) is removed; the second WSP of every
    // continuation is real content, preserving single spaces between words.
    // The trailing CRLF yields a final empty line, which the parser tolerates.
    expect(unfolded).toEqual([
      'DESCRIPTION:Guest note: Two adults and one small dog\\, arriving after 4pm. Confirmation code HMSQQLMN. Message through the Airbnb app for early check-in requests.',
      'STATUS:CONFIRMED',
      ''
    ]);
  });

  it('handles lone-LF input as well as CRLF', () => {
    // The fold marker (LF + one WSP) is stripped, so "B:2" joins directly.
    expect(unfoldIcsLines('A:1\n B:2\nC:3')).toEqual(['A:1B:2', 'C:3']);
    expect(unfoldIcsLines('A:1\n  B:2\nC:3')).toEqual(['A:1 B:2', 'C:3']);
  });

  it('unescapes TEXT values', () => {
    expect(unescapeIcalText('dog\\, cat\\; fish')).toBe('dog, cat; fish');
    expect(unescapeIcalText('line one\\nline two')).toBe('line one\nline two');
    expect(unescapeIcalText('back\\\\slash')).toBe('back\\slash');
  });
});

describe('parseIcs with the Airbnb export fixture', () => {
  const { calendar, events } = parseIcs(AIRBNB_FIXTURE);

  it('reads calendar-level properties', () => {
    expect(calendar['X-WR-CALNAME']).toBe('airbnb_883921');
    expect(calendar.PRODID).toBe('-//Airbnb Inc//Hosting Calendar 1.0//EN');
    expect(calendar.VERSION).toBe('2.0');
  });

  it('extracts every VEVENT', () => {
    expect(events).toHaveLength(7);
  });

  it('keeps DTEND exclusive when computing blocked nights', () => {
    const stay = events[0]; // Sep 20 -> Sep 24
    expect(stay.start).toBe('2026-09-20');
    expect(stay.end).toBe('2026-09-24');
    expect(stay.nights).toEqual(['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23']);
    expect(stay.nights).not.toContain('2026-09-24'); // checkout day stays sellable
  });

  it('unfolds the folded DESCRIPTION into a single line', () => {
    const ev = events.find((e) => e.uid === 'HMSQQLMN-7573555901@airbnb.com');
    expect(ev.description).toBe(
      'Guest note: Two adults and one small dog, arriving after 4pm. Confirmation code HMSQQLMN. Message through the Airbnb app for early check-in requests.'
    );
  });

  it('flags cancelled events as not ok', () => {
    const cancelled = events.find((e) => e.status === 'CANCELLED');
    expect(cancelled.uid).toBe('HMSCANCEL-7573777777@airbnb.com');
    expect(cancelled.ok).toBe(false);
    expect(cancelled.skipReason).toBe('cancelled');
    expect(cancelled.nights).toEqual([]);
  });

  it('defaults a missing DTEND to exactly one blocked night', () => {
    const ev = events.find((e) => e.uid === 'block-883921-002@airbnb.com');
    expect(ev.end).toBeNull();
    expect(ev.nights).toEqual(['2026-11-05']);
  });

  it('converts UTC DATE-TIME start/end to nightly blocks', () => {
    const ev = events.find((e) => e.uid === 'HMSDTIME-7573999911@airbnb.com');
    expect(ev.start).toBe('2026-11-20');
    expect(ev.end).toBe('2026-11-23');
    expect(ev.nights).toEqual(['2026-11-20', '2026-11-21', '2026-11-22']);
  });
});

describe('collectBlockedDates with the Airbnb export fixture', () => {
  const result = collectBlockedDates(AIRBNB_FIXTURE);

  it('produces the exact deduped, sorted set of blocked nights', () => {
    expect(result.dates).toEqual(EXPECTED_FIXTURE_DATES);
  });

  it('merges back-to-back reservations without duplicating the turnover day', () => {
    expect(result.dates.filter((d) => d === '2026-09-24')).toHaveLength(1);
    expect(result.eventsIncluded).toBe(6);
  });

  it('skips the cancelled event', () => {
    expect(result.eventsSkipped).toEqual([
      { uid: 'HMSCANCEL-7573777777@airbnb.com', summary: 'Reserved', reason: 'cancelled' }
    ]);
    expect(result.dates).not.toContain('2026-10-20');
    expect(result.dates).not.toContain('2026-10-21');
  });

  it('keeps the first SUMMARY per night for block reasons', () => {
    expect(result.summaryByDate.get('2026-09-20')).toBe('Reserved');
    expect(result.summaryByDate.get('2026-10-02')).toBe('Blocked');
  });
});

describe('nightsBetweenExclusive edge cases', () => {
  it('caps pathological ranges so malformed feeds cannot hang the worker', () => {
    const nights = nightsBetweenExclusive('2026-01-01', '2036-01-01'); // ~3653 days
    expect(nights).toHaveLength(730);
  });

  it('returns empty when end <= start', () => {
    expect(nightsBetweenExclusive('2026-09-24', '2026-09-24')).toEqual([]);
    expect(nightsBetweenExclusive('2026-09-24', '2026-09-20')).toEqual([]);
  });
});

describe('malformed inline calendars', () => {
  it('skips events whose DTEND is not after DTSTART', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:bad-1@airbnb.com',
      'DTSTART;VALUE=DATE:20260920',
      'DTEND;VALUE=DATE:20260920', // same day => invalid
      'SUMMARY:Reserved',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:bad-2@airbnb.com',
      'DTSTART;VALUE=DATE:20260920',
      'DTEND;VALUE=DATE:20260918', // before start => invalid
      'SUMMARY:Reserved',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const result = collectBlockedDates(ics);
    expect(result.dates).toEqual([]);
    expect(result.eventsIncluded).toBe(0);
    expect(result.eventsSkipped.map((e) => e.reason)).toEqual([
      'dtend-not-after-dtstart',
      'dtend-not-after-dtstart'
    ]);
  });

  it('dedupes overlapping events and keeps the first summary', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:overlap-1@airbnb.com',
      'DTSTART;VALUE=DATE:20261005',
      'DTEND;VALUE=DATE:20261007',
      'SUMMARY:Reserved',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:overlap-2@airbnb.com',
      'DTSTART;VALUE=DATE:20261006',
      'DTEND;VALUE=DATE:20261008',
      'SUMMARY:Blocked',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const result = collectBlockedDates(ics);
    expect(result.dates).toEqual(['2026-10-05', '2026-10-06', '2026-10-07']);
    expect(result.summaryByDate.get('2026-10-06')).toBe('Reserved'); // first wins
    expect(result.eventsIncluded).toBe(2);
  });

  it('ignores VTODO / VFREEBUSY components and stray content', () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'BEGIN:VTODO',
      'DTSTART;VALUE=DATE:20261225',
      'END:VTODO',
      'RANDOM GARBAGE LINE',
      'BEGIN:VEVENT',
      'UID:only-event@airbnb.com',
      'DTSTART;VALUE=DATE:20261224',
      'DTEND;VALUE=DATE:20261226',
      'SUMMARY:Reserved',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const result = collectBlockedDates(ics);
    expect(result.dates).toEqual(['2026-12-24', '2026-12-25']);
  });
});
