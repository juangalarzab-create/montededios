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

// Handle background messages (app closed or in background)
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'Monte de Dios';
  const body  = payload.notification?.body  || payload.data?.body  || 'Hay cambios en el ministerio';

  return self.registration.showNotification(title, {
    body,
    icon:    '/montededios/icon-192.png',
    badge:   '/montededios/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag:     'montededios-' + Date.now(),
    silent:  false,
    data:    { url: payload.fcmOptions?.link || '/montededios/' }
  });
});

// Click on notification opens the app
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/montededios/';
  event.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
      for(const client of list) {
        if('focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
