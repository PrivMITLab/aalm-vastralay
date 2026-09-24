/**
 * 👑 AALM VASTRALAY — SERVICE WORKER
 * Handles Web Push notifications for order dispatch, shipment tracking & delivery alerts.
 */

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
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
