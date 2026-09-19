// Cloudflare Pages Function: POST /api/import-airbnb
//
// Airbnb's iCal export endpoints do NOT send CORS headers, so a browser
// cannot fetch them directly. This function performs the fetch server-side
// on the Cloudflare edge, parses the VEVENTs out of the .ics payload and
// converts them into a `dateOverrides` patch (one blocked cell per reserved
// night) that the client merges into its state.
//
// DTEND is treated as EXCLUSIVE (RFC 5545 §3.6.1): a stay Sep 20 -> Sep 24
// blocks 2026-09-20 .. 2026-09-23, so the checkout day stays sellable and
// back-to-back reservations can share a turnover day.
//
// Request:  POST /api/import-airbnb
//           { "listingId": "prop-1", "icalUrl": "https://www.airbnb.com/calendar/ical/883921.ics?s=..." }
// Response: { "success": true, "listingId": "prop-1", "nightsBlocked": 11,
//             "eventsImported": 3, "eventsSkipped": 0,
//             "dateOverrides": { "prop-1": { "2026-09-20": { "blocked": true, "reason": "Airbnb: Reserved" } } } }

import { collectBlockedDates } from '../lib/ical.js';

const FETCH_TIMEOUT_MS = 15_000;
const MAX_ICS_BYTES = 2_000_000; // 2 MB is far more than any calendar feed needs
const MAX_LISTING_ID_LENGTH = 64;
const LISTING_ID_RE = /^[\w-]{1,64}$/;

// ---------------------------------------------------------------------------
// SSRF protection: the function fetches a caller-supplied URL, so refuse
// anything that is not a public HTTPS endpoint.
// ---------------------------------------------------------------------------
function isBlockedHost(hostname) {
  // Normalize: lowercase, strip IPv6 brackets and a trailing FQDN dot.
  let h = String(hostname || '').toLowerCase().trim();
  if (h.startsWith('[') && h.endsWith(']')) h = h.slice(1, -1);
  h = h.replace(/\.$/, '');

  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  if (h.endsWith('.local') || h.endsWith('.internal')) return true;
  if (h === '::1' || h === '::' || h === '0:0:0:0:0:0:0:1') return true;

  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (v4.slice(1).some((oct) => Number(oct) > 255)) return true;
    if (a === 0 || a === 10 || a === 127) return true;               // this-network, private, loopback
    if (a === 169 && b === 254) return true;                         // link-local (cloud metadata: 169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true;                // private
    if (a === 192 && b === 168) return true;                         // private
    if (a === 100 && b >= 64 && b <= 127) return true;               // CGNAT
    if (a >= 224) return true;                                       // multicast / reserved
  }
  return false;
}

function validateImportUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { ok: false, error: 'icalUrl is required (the Airbnb iCal export URL ending in .ics).' };
  }
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return { ok: false, error: 'icalUrl is not a valid URL.' };
  }
  if (url.protocol !== 'https:') {
    return { ok: false, error: 'icalUrl must use HTTPS.' };
  }
  if (isBlockedHost(url.hostname)) {
    return { ok: false, error: 'icalUrl must point at a public host (internal/private addresses are blocked).' };
  }
  return { ok: true, url };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestPost(context) {
  const headers = context.request.headers;
  if (headers.get('content-length') && Number(headers.get('content-length')) > 10_000) {
    return json({ success: false, error: 'Request body too large.' }, 413);
  }

  const body = await context.request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return json({ success: false, error: 'Invalid JSON body.' }, 400);
  }

  const listingId = String(body.listingId || '').trim();
  if (!LISTING_ID_RE.test(listingId)) {
    return json({ success: false, error: `listingId is required (max ${MAX_LISTING_ID_LENGTH} chars, letters/digits/-/_).` }, 400);
  }

  const check = validateImportUrl(body.icalUrl);
  if (!check.ok) {
    return json({ success: false, error: check.error }, 400);
  }
  const icalUrl = check.url.toString();

  // ---- Server-side fetch (Airbnb blocks direct browser requests via CORS) ----
  let res;
  try {
    res = await fetch(icalUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'iChannel-PMS/1.0 (+https://ichannel.pages.dev; iCal importer)',
        'Accept': 'text/calendar, application/ics, text/plain;q=0.9, */*;q=0.5',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
  } catch (err) {
    const timedOut = err && (err.name === 'TimeoutError' || err.name === 'AbortError');
    return json(
      {
        success: false,
        error: timedOut
          ? `Fetching the Airbnb calendar timed out after ${FETCH_TIMEOUT_MS / 1000}s.`
          : `Failed to fetch the Airbnb calendar: ${err?.message || 'network error'}`
      },
      timedOut ? 504 : 502
    );
  }

  if (!res.ok) {
    return json(
      { success: false, error: `The calendar feed returned HTTP ${res.status} ${res.statusText}. Check that the Airbnb iCal export URL is still valid (they can be revoked/regenerated).`, upstreamStatus: res.status },
      502
    );
  }

  const icsText = await res.text().catch(() => '');
  if (!icsText || icsText.length > MAX_ICS_BYTES) {
    return json({ success: false, error: 'The calendar feed returned an empty or oversized payload.' }, 502);
  }
  if (!/BEGIN:VCALENDAR/i.test(icsText)) {
    return json({ success: false, error: 'The response is not an iCalendar (.ics) feed — no VCALENDAR found. Double-check the Airbnb export URL.' }, 400);
  }

  // ---- Parse VEVENTs into nightly blocks (DTEND exclusive) ----
  const { dates, summaryByDate, eventsIncluded, eventsSkipped, calendar } = collectBlockedDates(icsText);

  const overridesForListing = {};
  for (const dateKey of dates) {
    const summary = summaryByDate.get(dateKey);
    overridesForListing[dateKey] = {
      blocked: true,
      reason: summary ? `Airbnb: ${summary}` : 'Airbnb reservation'
    };
  }

  return json({
    success: true,
    listingId,
    source: 'airbnb-ical',
    sourceUrl: icalUrl,
    calendarName: calendar['X-WR-CALNAME'] || null,
    fetchedAt: new Date().toISOString(),
    eventsImported: eventsIncluded,
    eventsSkipped: eventsSkipped.length,
    skippedEvents: eventsSkipped,
    nightsBlocked: dates.length,
    dates,
    // Client merges this patch straight into its dateOverrides state.
    dateOverrides: {
      [listingId]: overridesForListing
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
