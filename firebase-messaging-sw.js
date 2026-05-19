// firebase-messaging-sw.js — Monte de Dios
// VERSIÓN 3.0 — Push con app CERRADA, pantalla bloqueada o suspendida
// Compatible: Android Chrome, iOS Safari PWA, PC Chrome/Edge/Firefox
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

// ── INSTALACIÓN INMEDIATA sin esperar cierre de pestañas anteriores ───────────
self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e  => e.waitUntil(self.clients.claim()));

// ── HELPER: mostrar notificación del sistema operativo ────────────────────────
function _showNotif(title, body, url, tag) {
  return self.registration.showNotification(title, {
    body:               body || 'Hay novedades en el ministerio',
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    vibrate:            [300, 100, 400, 100, 300],
    tag:                tag || ('mdios-' + Date.now()),
    renotify:           true,
    silent:             false,
    requireInteraction: false,
    data:               { url: url || self.registration.scope }
  });
}

// ── HANDLER FCM SDK: background / app cerrada ─────────────────────────────────
// Firebase llama a esto cuando el push llega y la app NO está en primer plano.
// Funciona en Android Chrome, iOS Safari PWA y PC.
messaging.onBackgroundMessage(payload => {
  console.log('[FCM-SW] onBackgroundMessage:', JSON.stringify(payload));
  const title = payload.notification?.title || payload.data?.title || 'Monte de Dios';
  const body  = payload.notification?.body  || payload.data?.body  || 'Hay novedades en el ministerio';
  const url   = payload.fcmOptions?.link    || payload.data?.url   || self.registration.scope;
  return _showNotif(title, body, url, 'mdios-bg-' + Date.now());
});

// ── FALLBACK raw push: cubre data-only messages y Android sin GMS completo ────
// MIUI, EMUI, ColorOS y otros forks de Android a veces no llaman a
// onBackgroundMessage. Este listener es el último recurso.
self.addEventListener('push', event => {
  console.log('[FCM-SW] push raw event');
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch(e) {}

  const notif = payload.notification || {};
  const data  = payload.data         || {};

  // Si tiene notification block → onBackgroundMessage lo maneja, no duplicar.
  if(notif.title || notif.body) {
    event.waitUntil(Promise.resolve()); // keepalive para Android
    return;
  }

  // Data-only: mostrar desde campos data.*
  const title = data.title || payload.title || 'Monte de Dios';
  const body  = data.body  || payload.body  || 'Tienes un nuevo aviso';
  const url   = data.url   || self.registration.scope;

  event.waitUntil(_showNotif(title, body, url, 'mdios-data-' + Date.now()));
});

// ── CLIC EN NOTIFICACIÓN: abrir o enfocar la app ──────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const c of list) {
        if('focus' in c) { c.navigate?.(url); return c.focus(); }
      }
      return clients.openWindow(url);
    })
  );
});
