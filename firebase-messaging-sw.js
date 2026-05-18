// firebase-messaging-sw.js — Monte de Dios
// VERSIÓN OPTIMIZADA — maneja push con app cerrada, bloqueada o en background
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

// ── Handler principal: app cerrada, bloqueada o en background ─────────────────
// Firebase SDK llama esto cuando llega un push y la app NO está en primer plano
messaging.onBackgroundMessage(payload => {
  console.log('[SW] Background message:', payload);
  const title = payload.notification?.title
             || payload.data?.title
             || 'Monte de Dios';
  const body  = payload.notification?.body
             || payload.data?.body
             || 'Hay novedades en el ministerio';
  const url   = payload.fcmOptions?.link
             || payload.data?.url
             || self.registration.scope;

  // showNotification muestra la notificación del sistema operativo
  // Esto funciona incluso con la pantalla bloqueada
  return self.registration.showNotification(title, {
    body,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    vibrate:            [300, 100, 400, 100, 300],
    tag:                'montededios-' + Date.now(),
    renotify:           true,
    silent:             false,
    requireInteraction: false,
    data:               { url }
  });
});

// ── Fallback: captura push raw (data-only messages) ───────────────────────────
// Algunos dispositivos Android reciben data-only y el SDK no los intercepta
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch(e) {}

  const notif = payload.notification || {};
  const data  = payload.data || {};

  // Si ya tiene notification block, onBackgroundMessage lo maneja — evitar duplicado
  if(notif.title || notif.body) return;

  const title = data.title || 'Monte de Dios';
  const body  = data.body  || 'Tienes un nuevo aviso';
  const url   = data.url   || self.registration.scope;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      vibrate: [300, 100, 400, 100, 300],
      tag:     'montededios-data-' + Date.now(),
      renotify: true,
      data:    { url }
    })
  );
});

// ── Clic en notificación: abrir/enfocar la app ────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for(const c of list) {
        if('focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
