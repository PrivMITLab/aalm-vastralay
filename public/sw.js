/**
 * 👑 AALM VASTRALAY — SERVICE WORKER
 * Handles Web Push notifications for order dispatch, shipment tracking & delivery alerts.
 */

const CACHE_NAME = "av-static-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/icon",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Soft fail if offline during install
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Cache-first for static images/fonts, network-first for HTML and APIs
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external origins
  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Network-first for API and server mutations
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin/") || url.pathname.startsWith("/seller/")) {
    return;
  }

  // Cache-first for static assets
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate / network-first for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => cached || caches.match("/"));
      })
  );
});

// Listen for incoming Web Push events from the server
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "Aalm Vastralay (आलम वस्त्रालय)";
    const options = {
      body: payload.body || "Your order status has been updated.",
      icon: payload.icon || "/icon",
      badge: payload.badge || "/apple-icon",
      vibrate: [100, 50, 100],
      data: {
        url: payload.url || "/orders",
        orderId: payload.orderId,
        trackingNumber: payload.trackingNumber,
      },
      actions: [
        {
          action: "track",
          title: "Track Order 📦",
        },
        {
          action: "close",
          title: "Dismiss",
        },
      ],
      tag: payload.tag || "order-update",
      renotify: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("[SW] Push event handling error:", err);
  }
});

// Handle notification interaction and click routing
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const targetUrl = event.notification.data?.url || "/orders";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if open at our origin
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
