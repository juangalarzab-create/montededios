// firebase-messaging-sw.js — Monte de Dios
// Handles background push notifications via Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyDtn9Wye2f9xYKwOkWykvgK55xlKxcIqaM",
  authDomain:        "montededios-6ce3b.firebaseapp.com",
  databaseURL:       "https://montededios-6ce3b-default-rtdb.firebaseio.com",
  projectId:         "montededios-6ce3b",
  storageBucket:     "montededios-6ce3b.firebasestorage.app",
  messagingSenderId: "998397509768",
  appId:             "1:998397509768:web:31970be21f6b8462ffe690"
});

const messaging = firebase.messaging();

// Handle background messages (app closed, screen locked, or backgrounded)
// This fires when FCM sends a push to this device and the app is NOT in foreground
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw] Background message received:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Monte de Dios';
  const body  = payload.notification?.body  || payload.data?.body  || 'Hay cambios en el ministerio';
  const url   = payload.fcmOptions?.link || payload.data?.url || '/';

  // Always show system notification — this appears even when device is locked
  return self.registration.showNotification(title, {
    body,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    vibrate:            [300, 100, 300, 100, 300],
    tag:                'montededios-msg',  // same tag = replaces previous instead of stacking
    renotify:           true,               // still rings/vibrates even if replacing
    silent:             false,
    requireInteraction: false,
    data:               { url }
  });
});

// Handle raw push events (fallback for data-only messages without notification field)
// This ensures notifications show even for push events FCM SDK might not intercept
self.addEventListener('push', event => {
  let data = {}, notif = {};
  try {
    const raw = event.data ? event.data.json() : {};
    data  = raw.data || raw;
    notif = raw.notification || {};
  } catch(e) {}

  // Only handle if firebase SDK hasn't already handled it (avoid doubles)
  // We check if this is a "data-only" message (no notification block)
  if(!notif.title && !notif.body) {
    const title = data.title || 'Monte de Dios';
    const body  = data.body  || 'Tienes un nuevo aviso';
    const url   = data.url   || '/';

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon:               '/icon-192.png',
        badge:              '/icon-192.png',
        vibrate:            [300, 100, 300, 100, 300],
        tag:                'montededios-push',
        renotify:           true,
        silent:             false,
        requireInteraction: false,
        data:               { url }
      })
    );
  }
});

// Click on notification opens the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for(const client of list) {
        if('focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
