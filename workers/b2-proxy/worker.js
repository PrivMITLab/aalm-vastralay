/**
 * aalm-b2-proxy – Cloudflare Worker that serves files from a PRIVATE Backblaze B2 bucket
 * with edge caching. Free tier: 100,000 requests/day.
 *
 * Environment variables (Worker Settings → Variables):
 *   B2_KEY_ID, B2_APP_KEY, B2_BUCKET_NAME
 *
 * Usage: https://aalm-b2-proxy.<your-subdomain>.workers.dev/<file-key>
 * The app references cold-storage images as "b2:<file-key>" (see src/lib/media-resolver.ts).
 */

let authCache = null; // { downloadUrl, authorizationToken, expires }

async function getB2Auth(env) {
  if (authCache && authCache.expires > Date.now()) return authCache;
  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: { Authorization: "Basic " + btoa(`${env.B2_KEY_ID}:${env.B2_APP_KEY}`) },
  });
  if (!res.ok) throw new Error(`B2 authorize failed: ${res.status}`);
  const json = await res.json();
  authCache = {
    downloadUrl: json.downloadUrl,
    authorizationToken: json.authorizationToken,
    expires: Date.now() + 23 * 60 * 60 * 1000, // tokens are valid for 24h
  };
  return authCache;
}

const workerHandler = {
  async fetch(request, env, ctx) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }
    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!key || key.includes("..")) return new Response("Not found", { status: 404 });

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let auth;
    try {
      auth = await getB2Auth(env);
    } catch (err) {
      return new Response(`Upstream auth error: ${err.message}`, { status: 502 });
    }

    const upstream = await fetch(`${auth.downloadUrl}/file/${env.B2_BUCKET_NAME}/${key}`, {
      headers: { Authorization: auth.authorizationToken },
      cf: { cacheEverything: true, cacheTtl: 31536000 },
    });

    if (upstream.status === 401) {
      authCache = null; // token expired early – force refresh on next request
    }
    if (!upstream.ok) {
      return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/octet-stream");
    const len = upstream.headers.get("Content-Length");
    if (len) headers.set("Content-Length", len);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Served-From", "backblaze-b2");

    const response = new Response(upstream.body, { status: 200, headers });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};

export default workerHandler;
