// Cloudflare Pages Function: /api/channels
export async function onRequestGet(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  };

  const payload = {
    provider: 'iChannel PMS & Channel Manager (Cloudflare Pages)',
    timestamp: new Date().toISOString(),
    status: 'online',
    supportedChannels: ['airbnb', 'booking', 'vrbo', 'direct'],
    features: [
      'Two-Way Rate Sync',
      'Instant Availability Distribution',
      'Minimum Stay Rules',
      'Length of Stay Discounts',
      'iCal Feeds RFC 5545',
      'Webhook Ingestion'
    ]
  };

  return new Response(JSON.stringify(payload, null, 2), { headers });
}
