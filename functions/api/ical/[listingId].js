// Cloudflare Pages Function: /api/ical/[listingId]
// Serves RFC 5545 iCalendar feed for Airbnb, Booking.com, and Vrbo 2-way sync
export async function onRequestGet(context) {
  const listingId = context.params.listingId || 'prop-1';
  const cleanId = listingId.replace('.ics', '');

  const now = new Date();
  const formatIcalDate = (d) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//iChannel//Vacation Rental Channel Manager//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:iChannel - ${cleanId}`,
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VEVENT',
    `UID:res-sample-${cleanId}-1@ichannel.pages.dev`,
    `DTSTAMP:${formatIcalDate(now)}`,
    'DTSTART;VALUE=DATE:20260920',
    'DTEND;VALUE=DATE:20260924',
    'SUMMARY:Reserved (iChannel Unified Sync)',
    'DESCRIPTION:Direct & Channel Booked block managed by iChannel PMS',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'BEGIN:VEVENT',
    `UID:res-sample-${cleanId}-2@ichannel.pages.dev`,
    `DTSTAMP:${formatIcalDate(now)}`,
    'DTSTART;VALUE=DATE:20261002',
    'DTEND;VALUE=DATE:20261007',
    'SUMMARY:Reserved (iChannel Unified Sync)',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return new Response(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cleanId}.ics"`,
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
