import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { onRequestPost, onRequestOptions } from '../functions/api/import-airbnb.js';

const FIXTURE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'airbnb-export.ics');
const AIRBNB_FIXTURE = readFileSync(FIXTURE_PATH, 'utf8');

const ENDPOINT = 'https://ichannel.pages.dev/api/import-airbnb';

function makeRequest(body, headers = { 'Content-Type': 'application/json' }) {
  return new Request(ENDPOINT, {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

function stubFetch(impl) {
  vi.stubGlobal('fetch', vi.fn(impl));
}

beforeEach(() => {
  stubFetch(
    () =>
      new Response(AIRBNB_FIXTURE, {
        status: 200,
        headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
      })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/import-airbnb — happy path', () => {
  it('fetches the .ics server-side and returns a dateOverrides patch', async () => {
    const res = await onRequestPost({
      request: makeRequest({
        listingId: 'prop-1',
        icalUrl: 'https://www.airbnb.com/calendar/ical/883921.ics?s=xyz'
      })
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(res.headers.get('access-control-allow-origin')).toBe('*');

    const payload = await res.json();
    expect(payload.success).toBe(true);
    expect(payload.listingId).toBe('prop-1');
    expect(payload.source).toBe('airbnb-ical');
    expect(payload.eventsImported).toBe(6);
    expect(payload.eventsSkipped).toBe(1); // the fixture's cancelled reservation
    expect(payload.skippedEvents).toEqual([
      { uid: 'HMSCANCEL-7573777777@airbnb.com', summary: 'Reserved', reason: 'cancelled' }
    ]);
    expect(payload.nightsBlocked).toBe(16);
    expect(payload.calendarName).toBe('airbnb_883921');

    // The function must have fetched the feed itself (server-side), with the
    // exact Airbnb URL passed through.
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('https://www.airbnb.com/calendar/ical/883921.ics?s=xyz');
  });

  it('writes blocked cells with the Airbnb summary as the reason', async () => {
    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/883921.ics' })
    });
    const { dateOverrides } = await res.json();
    const overrides = dateOverrides['prop-1'];

    expect(overrides['2026-09-20']).toEqual({ blocked: true, reason: 'Airbnb: Reserved' });
    expect(overrides['2026-10-02']).toEqual({ blocked: true, reason: 'Airbnb: Blocked' });
  });

  it('treats DTEND as exclusive — checkout days stay unblocked', async () => {
    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/883921.ics' })
    });
    const { dateOverrides } = await res.json();
    const overrides = dateOverrides['prop-1'];

    // Stay Sep 20 -> Sep 24 blocks 20..23 but NOT the 24th checkout day...
    expect(overrides['2026-09-23']).toBeTruthy();
    // ...unless another reservation starts on that day (back-to-back, event 2).
    // The last event ends 2026-11-23T11:00Z, so the 23rd must stay free.
    expect(overrides['2026-11-22']).toBeTruthy();
    expect(overrides['2026-11-23']).toBeUndefined();

    // And the folded-description event ends 2026-10-14 -> the 14th stays free.
    expect(overrides['2026-10-13']).toBeTruthy();
    expect(overrides['2026-10-14']).toBeUndefined();

    expect(Object.keys(overrides)).toHaveLength(16);
  });

  it('scopes the patch under the requested listingId', async () => {
    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-2', icalUrl: 'https://www.airbnb.com/calendar/ical/110294.ics' })
    });
    const { dateOverrides } = await res.json();
    expect(Object.keys(dateOverrides)).toEqual(['prop-2']);
  });
});

describe('POST /api/import-airbnb — request validation', () => {
  it('rejects invalid JSON bodies', async () => {
    const res = await onRequestPost({ request: makeRequest('{not json') });
    expect(res.status).toBe(400);
    const payload = await res.json();
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/Invalid JSON/i);
  });

  it('rejects a missing icalUrl', async () => {
    const res = await onRequestPost({ request: makeRequest({ listingId: 'prop-1' }) });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/icalUrl is required/i);
  });

  it('rejects a missing/invalid listingId', async () => {
    const res = await onRequestPost({
      request: makeRequest({ listingId: '', icalUrl: 'https://www.airbnb.com/calendar/ical/1.ics' })
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/listingId is required/i);
  });

  it('rejects non-HTTPS URLs', async () => {
    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'http://www.airbnb.com/calendar/ical/883921.ics' })
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/HTTPS/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ['https://localhost/calendar.ics', 'loopback by name'],
    ['https://127.0.0.1/calendar.ics', 'loopback IPv4'],
    ['https://192.168.1.10/calendar.ics', 'private range'],
    ['https://10.0.0.5/calendar.ics', 'private range'],
    ['https://172.16.4.9/calendar.ics', 'private range'],
    ['https://169.254.169.254/latest/meta-data', 'cloud metadata endpoint'],
    ['https://host.local/calendar.ics', 'mDNS'],
    ['https://host.internal/calendar.ics', 'internal TLD']
  ])('blocks %s (%s) to prevent SSRF', async (url) => {
    const res = await onRequestPost({ request: makeRequest({ listingId: 'prop-1', icalUrl: url }) });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/public host/i);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('POST /api/import-airbnb — upstream failures', () => {
  it('surfaces upstream HTTP errors as 502', async () => {
    stubFetch(() => new Response('Not Found', { status: 404 }));

    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/dead.ics' })
    });
    expect(res.status).toBe(502);
    const payload = await res.json();
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/HTTP 404/i);
    expect(payload.upstreamStatus).toBe(404);
  });

  it('maps fetch timeouts to 504', async () => {
    stubFetch(() => {
      throw new DOMException('The operation timed out.', 'AbortError');
    });

    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/slow.ics' })
    });
    expect(res.status).toBe(504);
    expect((await res.json()).error).toMatch(/timed out/i);
  });

  it('maps network failures to 502', async () => {
    stubFetch(() => {
      throw new TypeError('fetch failed: DNS resolution error');
    });

    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/883921.ics' })
    });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/Failed to fetch/i);
  });

  it('rejects non-iCalendar payloads (e.g. HTML login pages) with 400', async () => {
    stubFetch(
      () =>
        new Response('<!doctype html><html><body>Airbnb login</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        })
    );

    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/login' })
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not an iCalendar/i);
  });
});

describe('POST /api/import-airbnb — cancelled events in payload', () => {
  it('reports skipped events but still succeeds', async () => {
    const res = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/883921.ics' })
    });
    const payload = await res.json();
    expect(payload.success).toBe(true);
    expect(payload.nightsBlocked).toBe(16); // cancelled event contributes nothing
    expect(payload.eventsSkipped).toBe(1);

    // ...so feed it a calendar where the only event is cancelled.
    const cancelledOnly = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:x@airbnb.com',
      'DTSTART;VALUE=DATE:20260920',
      'DTEND;VALUE=DATE:20260922',
      'SUMMARY:Reserved',
      'STATUS:CANCELLED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    stubFetch(() => new Response(cancelledOnly, { status: 200 }));

    const res2 = await onRequestPost({
      request: makeRequest({ listingId: 'prop-1', icalUrl: 'https://www.airbnb.com/calendar/ical/883921.ics' })
    });
    const payload2 = await res2.json();
    expect(payload2.success).toBe(true);
    expect(payload2.nightsBlocked).toBe(0);
    expect(payload2.eventsSkipped).toBe(1);
    expect(payload2.skippedEvents[0].reason).toBe('cancelled');
    expect(payload2.dateOverrides['prop-1']).toEqual({});
  });
});

describe('OPTIONS /api/import-airbnb', () => {
  it('answers CORS preflight', async () => {
    const res = await onRequestOptions();
    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
  });
});
