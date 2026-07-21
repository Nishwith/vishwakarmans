/**
 * Cloudflare Worker: caching reverse proxy for Supabase Storage.
 *
 * Flow: edge cache check → miss → fetch from Supabase Storage origin →
 * attach immutable Cache-Control → cache at edge → serve.
 *
 * Expects SUPABASE_STORAGE_URL env var (e.g. https://amcsynborvioqgqmsbhn.supabase.co/storage/v1/object/public).
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Only proxy GET requests for media paths
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Check Cloudflare edge cache first
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), request);
    let response = await cache.match(cacheKey);

    if (response) return response;

    // Cache miss — fetch from Supabase Storage origin
    const originUrl = `${env.SUPABASE_STORAGE_URL}${url.pathname}`;
    const originResponse = await fetch(originUrl);

    if (!originResponse.ok) {
      return new Response('Not Found', { status: 404 });
    }

    // Clone and attach immutable caching headers
    response = new Response(originResponse.body, originResponse);
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Access-Control-Allow-Origin', '*');

    // Store in edge cache (non-blocking)
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  },
};
