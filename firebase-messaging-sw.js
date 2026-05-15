// firebase-messaging-sw.js — Monte de Dios
// Handles background push via Firebase Cloud Messaging + REST polling
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const FB_CONFIG = {
  apiKey:            "AIzaSyDtn9Wye2f9xYKwOkWykvgK55xlKxcIqaM",
  authDomain:        "montededios-6ce3b.firebaseapp.com",
  databaseURL:       "https://montededios-6ce3b-default-rtdb.firebaseio.com",
  projectId:         "montededios-6ce3b",
  storageBucket:     "montededios-6ce3b.firebasestorage.app",
  messagingSenderId: "998397509768",
  appId:             "1:998397509768:web:31970be21f6b8462ffe690"
};

firebase.initializeApp(FB_CONFIG);
const messaging = firebase.messaging();

// ── Track last seen notification timestamp ──────────────────────────────────
let _lastSeenTs = Date.now();

// ── Background FCM message handler ─────────────────────────────────────────
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'Monte de Dios';
  const body  = payload.notification?.body  || payload.data?.body  || 'Hay cambios en el ministerio';
  return self.registration.showNotification(title, {
    body,
    icon:    '/montededios/icon-192.png',
    badge:   '/montededios/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag:     'montededios-fcm',
    silent:  false,
    data:    { url: '/montededios/' }
  });
});

// ── Notification click → open/focus app ─────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/montededios/';
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for(const c of list) { if('focus' in c) return c.focus(); }
      return clients.openWindow(url);
    })
  );
});

// ── Poll Firebase REST API for new notifications (works when app is CLOSED) ──
// This fires every 30 seconds via Background Sync / periodic sync
async function pollFirebaseNotifications() {
  try {
    const url = `${FB_CONFIG.databaseURL}/notifications.json?orderBy="ts"&startAt=${_lastSeenTs+1}&limitToLast=5`;
    const res  = await fetch(url);
    const data = await res.json();
    if(!data || typeof data !== 'object') return;

    const entries = Object.values(data).filter(n => n && n.ts > _lastSeenTs);
    if(!entries.length) return;

    // Update last seen
    _lastSeenTs = Math.max(...entries.map(n=>n.ts));

    // Show notification for each new entry
    for(const n of entries) {
      await self.registration.showNotification(n.title || 'Monte de Dios', {
        body:    n.body || '',
        icon:    '/montededios/icon-192.png',
        badge:   '/montededios/icon-192.png',
        vibrate: [300, 100, 300, 100, 300],
        tag:     'montededios-' + n.ts,
        silent:  false,
        data:    { url: '/montededios/' }
      });
    }
  } catch(e) { /* silently fail */ }
}

// ── Periodic Background Sync (Chrome Android supports this) ─────────────────
self.addEventListener('periodicsync', event => {
  if(event.tag === 'montededios-sync') {
    event.waitUntil(pollFirebaseNotifications());
  }
});

// ── Push event (standard FCM push) ──────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {}, notif = {};
  try { data = event.data ? event.data.json() : {}; notif = data.notification || data; } catch(e){}
  const title = notif.title || data.title || 'Monte de Dios';
  const body  = notif.body  || data.body  || 'Hay cambios en el ministerio';
  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon: '/montededios/icon-192.png', badge: '/montededios/icon-192.png',
      vibrate: [300,100,300,100,300], tag: 'montededios-push',
      silent: false, data: { url: '/montededios/' }
    })
  );
});

// ── SW Install: register periodic sync + set initial timestamp ──────────────
self.addEventListener('install', event => {
  self.skipWaiting();
  _lastSeenTs = Date.now();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(async () => {
      // Register periodic background sync if supported
      try {
        await self.registration.periodicSync.register('montededios-sync', {
          minInterval: 30 * 1000 // every 30 seconds
        });
      } catch(e) { /* not supported on all browsers */ }
    })
  );
});

// ── Message from main app: update timestamp or trigger poll ─────────────────
self.addEventListener('message', event => {
  if(event.data?.type === 'UPDATE_TIMESTAMP') {
    _lastSeenTs = event.data.ts || Date.now();
  }
  if(event.data?.type === 'POLL_NOW') {
    pollFirebaseNotifications();
  }
});
