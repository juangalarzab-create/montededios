// firebase-messaging-sw.js
// ⚠️ Reemplaza con tu configuración de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
 apiKey: "AIzaSyDtn9Wye2f9xYKwOkWykvgK55xlKxcIqaM",
  authDomain: "montededios-6ce3b.firebaseapp.com",
  databaseURL: "https://montededios-6ce3b-default-rtdb.firebaseio.com",
  projectId: "montededios-6ce3b",
  storageBucket: "montededios-6ce3b.firebasestorage.app",
  messagingSenderId: "998397509768",
  appId: "1:998397509768:web:31970be21f60be35571f3d"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Monte de Dios', {
    body:    body  || 'Hay novedades en tus eventos',
    icon:    icon  || '/icon-192.png',
    badge:   '/icon-192.png',
    vibrate: [200, 100, 200],
    data:    { url: payload.fcmOptions?.link || '/' }
  });
});
