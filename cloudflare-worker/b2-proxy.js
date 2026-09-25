/**
 * 👑 AALM VASTRALAY — BACKBLAZE B2 PRIVATE BUCKET CLOUDFLARE WORKER PROXY
 * Location: cloudflare-worker/b2-proxy.js
 *
 * Provides $0 egress fee media streaming via Cloudflare Bandwidth Alliance:
 *  - Serves private Backblaze B2 bucket objects without making bucket public
 *  - Caches B2 auth tokens in Cloudflare KV (env.B2_TOKEN_KV) for 23 hours
 *  - 401 Auto-Retry: On 401, purges KV+memory token, re-authorizes once, retries upstream with X-Retry: 1
 *  - Video Range Forwarding: Relays Range header, 206 Partial Content, Content-Range, Accept-Ranges
 *  - 50MB Video Ceiling: Rejects oversized proxied videos (>50MB) with clear 502 JSON diagnostic
 *  - Emits immutable edge cache headers: Cache-Control: public, max-age=31536000, immutable
 *  - Emits CDN-Cache-Control for Cloudflare 300+ edge PoPs
 *  - Opaque proxy URLs: Browser never sees Backblaze credentials or raw endpoints
 */

const MAX_PROXIED_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const VIDEO_EXT_REGEX = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;

let authCache = null;

/**
 * Validates required Cloudflare Worker environment variables on startup.
 * Fails fast with clear instructions naming the missing secrets.
 */
function validateWorkerEnv(env) {
  const missing = [];
  if (!env.B2_BUCKET_NAME) missing.push("B2_BUCKET_NAME (configure in wrangler-b2-proxy.toml [vars])");
  if (!env.B2_KEY_ID) missing.push("B2_KEY_ID (run: wrangler secret put B2_KEY_ID --config wrangler-b2-proxy.toml)");
  if (!env.B2_APP_KEY) missing.push("B2_APP_KEY (run: wrangler secret put B2_APP_KEY --config wrangler-b2-proxy.toml)");
  if (missing.length > 0) {
    return `Cloudflare Worker misconfigured! Missing required environment variables:\n - ${missing.join("\n - ")}`;
  }
  return null;
}

/**
 * Obtains an authorized Backblaze B2 account token with KV and memory caching.
 * Set forceFresh=true to bypass caches and force upstream re-authorization.
 */
async function getB2Auth(env, forceFresh = false) {
  if (!forceFresh) {
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

    // 1. Startup Environment Validation
    const envError = validateWorkerEnv(env);
    if (envError) {
      return new Response(envError, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

    // 2. Strict Key Sanitization (blocks path traversal ../, hidden files, empty keys)
    if (!key || key.includes("..") || key.startsWith(".") || key.includes("\\")) {
      return new Response("Not found", { status: 404 });
    }

    // 3. Client Range Header for Video Seeking (MP4/WebM)
    const rangeHeader = request.headers.get("Range");
    const isVideo = VIDEO_EXT_REGEX.test(key);

    // 4. Edge Cache Matching (Only for full non-range requests)
    const cache = caches.default;
    const cacheKey = new Request(url.toString(), { method: "GET" });
    if (!rangeHeader) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // 5. Authorize with Backblaze B2
    let auth;
    try {
      auth = await getB2Auth(env);
    } catch (err) {
      return new Response(`Upstream authorization error: ${err.message}`, { status: 502 });
    }

    // Helper to build upstream request
    const buildUpstreamRequest = (authToken) => {
      const upstreamUrl = `${auth.downloadUrl}/file/${env.B2_BUCKET_NAME}/${key}`;
      const headers = new Headers();
      headers.set("Authorization", authToken);
      if (rangeHeader) {
        headers.set("Range", rangeHeader);
      }
      return { upstreamUrl, headers };
    };

    let reqConfig = buildUpstreamRequest(auth.authorizationToken);
    let upstream = await fetch(reqConfig.upstreamUrl, {
      headers: reqConfig.headers,
      cf: {
        cacheEverything: !rangeHeader,
        cacheTtl: 31536000,
      },
    });

    let wasRetried = false;

    // 6. Upstream 401 Auto-Retry Logic (Purge token, re-auth once, retry upstream once)
    if (upstream.status === 401) {
      authCache = null;
      if (env.B2_TOKEN_KV && typeof env.B2_TOKEN_KV.delete === "function") {
        try {
          await env.B2_TOKEN_KV.delete("b2_auth_token");
        } catch {
          // Non-fatal
        }
      }

      try {
        auth = await getB2Auth(env, true /* forceFresh */);
        reqConfig = buildUpstreamRequest(auth.authorizationToken);
        upstream = await fetch(reqConfig.upstreamUrl, {
          headers: reqConfig.headers,
          cf: {
            cacheEverything: !rangeHeader,
            cacheTtl: 31536000,
          },
        });
        wasRetried = true;
      } catch (retryErr) {
        return new Response(`Upstream re-authorization error: ${retryErr.message}`, { status: 502 });
      }
    }

    if (!upstream.ok) {
      return new Response("Media asset not found", {
        status: upstream.status === 404 ? 404 : 502,
      });
    }

    // 7. Video 50MB Cap Enforcement
    const contentLengthStr = upstream.headers.get("Content-Length");
    const contentLength = contentLengthStr ? parseInt(contentLengthStr, 10) : 0;
    if (isVideo && contentLength > MAX_PROXIED_VIDEO_BYTES && !rangeHeader) {
      return new Response(
        JSON.stringify({
          error: "Video exceeds 50MB Cloudflare Worker proxy limit. Please stream directly from B2 or use compressed preview.",
          maxBytes: MAX_PROXIED_VIDEO_BYTES,
          contentLength,
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Served-From": "backblaze-b2-cloudflare-proxy",
          },
        }
      );
    }

    // 8. Assemble Servable Edge Response
    const headers = new Headers();
    headers.set("Content-Type", upstream.headers.get("Content-Type") || "application/octet-stream");
    if (contentLengthStr) headers.set("Content-Length", contentLengthStr);

    // Relay Video Seeking Headers (206 Partial Content)
    headers.set("Accept-Ranges", "bytes");
    const contentRange = upstream.headers.get("Content-Range");
    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("CDN-Cache-Control", "public, max-age=31536000");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("X-Served-From", "backblaze-b2-cloudflare-proxy");
    if (wasRetried) {
      headers.set("X-Retry", "1");
    }

    // Use 206 status code if upstream was partial content
    const responseStatus = upstream.status === 206 ? 206 : 200;
    const response = new Response(upstream.body, { status: responseStatus, headers });

    // Cache in Cloudflare Edge only if not a Range request and status is 200
    if (!rangeHeader && responseStatus === 200 && ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  },
};

export default workerHandler;
