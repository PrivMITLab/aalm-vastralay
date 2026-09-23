/**
 * 👑 AALM VASTRALAY — BACKBLAZE B2 PRIVATE BUCKET CLOUDFLARE WORKER PROXY
 * Location: cloudflare-worker/b2-proxy.js
 *
 * Provides $0 egress fee media streaming via Cloudflare Bandwidth Alliance:
 *  - Serves private Backblaze B2 bucket objects without making bucket public
 *  - Caches B2 auth tokens in Cloudflare KV (env.B2_TOKEN_KV) for 23 hours
 *  - Emits immutable edge cache headers: Cache-Control: public, max-age=31536000, immutable
 *  - Emits CDN-Cache-Control for Cloudflare 300+ edge PoPs
 *  - Opaque proxy URLs: Browser never sees Backblaze S3 credentials or raw endpoint
 */

let authCache = null;

async function getB2Auth(env) {
  if (env.B2_TOKEN_KV && typeof env.B2_TOKEN_KV.get === "function") {
    try {
      const cached = await env.B2_TOKEN_KV.get("b2_auth_token", "json");
      if (cached && cached.expires > Date.now()) {
        return cached;
      }
    } catch {
      // Fall through to memory cache
    }
  }

  if (authCache && authCache.expires > Date.now()) {
    return authCache;
  }

  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    headers: {
      Authorization: "Basic " + btoa(`${env.B2_KEY_ID}:${env.B2_APP_KEY}`),
    },
  });

  if (!res.ok) {
    throw new Error(`B2 authorize failed with status: ${res.status}`);
  }

  const json = await res.json();
  const tokenData = {
    downloadUrl: json.downloadUrl,
    authorizationToken: json.authorizationToken,
    expires: Date.now() + 23 * 60 * 60 * 1000,
  };

  authCache = tokenData;

  if (env.B2_TOKEN_KV && typeof env.B2_TOKEN_KV.put === "function") {
    try {
      await env.B2_TOKEN_KV.put("b2_auth_token", JSON.stringify(tokenData), {
        expirationTtl: 23 * 60 * 60,
      });
    } catch {
      // Non-fatal
    }
  }

  return tokenData;
}

const workerHandler = {
  async fetch(request, env, ctx) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

    if (!key || key.includes("..") || key.startsWith(".")) {
      return new Response("Not found", { status: 404 });
    }

    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    let auth;
    try {
      auth = await getB2Auth(env);
    } catch (err) {
      return new Response(`Upstream authorization error: ${err.message}`, { status: 502 });
    }

    const upstreamUrl = `${auth.downloadUrl}/file/${env.B2_BUCKET_NAME}/${key}`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Authorization: auth.authorizationToken,
      },
      cf: {
        cacheEverything: true,
        cacheTtl: 31536000,
      },
    });

    if (upstream.status === 401) {
      authCache = null;
      if (env.B2_TOKEN_KV && typeof env.B2_TOKEN_KV.delete === "function") {
        ctx.waitUntil(env.B2_TOKEN_KV.delete("b2_auth_token"));
      }
    }

    if (!upstream.ok) {
      return new Response("Media asset not found", {
        status: upstream.status === 404 ? 404 : 502,
      });
    }

    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/octet-stream");
    const len = upstream.headers.get("Content-Length");
    if (len) headers.set("Content-Length", len);

    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("CDN-Cache-Control", "public, max-age=31536000");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Served-From", "backblaze-b2-cloudflare-proxy");

    const response = new Response(upstream.body, { status: 200, headers });
    ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
};

export default workerHandler;
