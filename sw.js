// Monte de Dios Service Worker v1.0
const CACHE = 'montededios-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// ── INSTALL: cache assets ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(ASSETS).catch(() => {}) // Don't fail if some assets can't cache
    )
  );
});

// ── ACTIVATE: clean old caches ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: network-first, fallback to cache ────────────────────────────────
self.addEventListener('fetch', event => {
  // Skip Firebase and Google Fonts requests (always online)
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful GET responses
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── PUSH NOTIFICATIONS ─────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title   = data.notification?.title   || 'Monte de Dios';
  const body    = data.notification?.body    || 'Hay cambios en tus eventos';
  const icon    = data.notification?.icon    || '/icon-192.png';
  const badge   = '/icon-192.png';
  const tag     = data.notification?.tag     || 'montededios';

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon, badge, tag,
      vibrate: [200, 100, 200],
      data: { url: data.notification?.click_action || '/' }
    })
  );
});

// ── NOTIFICATION CLICK ─────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) return client.focus();
        }
        // Otherwise open new window
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
