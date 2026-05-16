// firebase-messaging-sw.js — Monte de Dios
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

// ── 1. FCM SDK background handler (app cerrada / minimizada) ─────────────────
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'Monte de Dios';
  const body  = payload.notification?.body  || payload.data?.body  || 'Hay cambios en el ministerio';
  const url   = payload.fcmOptions?.link    || payload.data?.url   || self.registration.scope;
  return self.registration.showNotification(title, {
    body, icon:'/icon-192.png', badge:'/icon-192.png',
    vibrate:[300,100,300,100,300],
    tag:'montededios-bg', renotify:true, silent:false,
    requireInteraction:false, data:{url}
  });
});

// ── 2. Raw push event — captura TODO push, incluyendo data-only ──────────────
//    Esto garantiza que llegue incluso si el SDK FCM no lo intercepta
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch(e) {}
  const notif = payload.notification || {};
  const data  = payload.data || {};

  // Solo mostrar si no tiene notification block (data-only) para evitar duplicados
  // El SDK maneja los que tienen notification block; nosotros manejamos los data-only
  if(notif.title || notif.body) return; // ya lo maneja onBackgroundMessage

  const title = data.title || 'Monte de Dios';
  const body  = data.body  || 'Tienes un nuevo aviso';
  const url   = data.url   || self.registration.scope;

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon:'/icon-192.png', badge:'/icon-192.png',
      vibrate:[300,100,300,100,300],
      tag:'montededios-data', renotify:true, silent:false,
      requireInteraction:false, data:{url}
    })
  );
});

// ── 3. Clic en notificación abre/enfoca la app ───────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || self.registration.scope;
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for(const c of list){
        if(c.url.includes(self.registration.scope) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    })
  );
});
