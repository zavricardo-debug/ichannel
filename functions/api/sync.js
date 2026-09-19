// Cloudflare Pages Function: /api/sync
export async function onRequestPost(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  try {
    const body = await context.request.json().catch(() => ({}));
    const { channel, listingId, rates, availability } = body;

    // Simulate Cloudflare Worker edge processing
    const result = {
      success: true,
      jobId: `cf-sync-${Date.now()}`,
      channel: channel || 'all',
      listingId: listingId || 'all',
      status: 'dispatched',
      syncedAt: new Date().toISOString(),
      channelsDispatched: channel ? [channel] : ['airbnb', 'booking', 'vrbo'],
      edgeRegion: context.request.cf?.colo || 'IAD'
    };

    return new Response(JSON.stringify(result, null, 2), { headers });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
