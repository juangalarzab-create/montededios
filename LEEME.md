# 📱 Monte de Dios — Guía de configuración Firebase
## Paso a paso, uno por uno

---

## ¿QUÉ ARCHIVOS NECESITAN TUS CREDENCIALES?

Solo **2 archivos** necesitan tus credenciales:
1. `index.html` ← el principal
2. `firebase-messaging-sw.js` ← para notificaciones en segundo plano

---

## PASO 1 — Crear el proyecto en Firebase

1. Ve a: **https://console.firebase.google.com**
2. Inicia sesión con tu cuenta de Google
3. Clic en **"Agregar proyecto"**
4. Nombre del proyecto: **montededios**
5. Deshabilita Google Analytics → **"Crear proyecto"** → **"Continuar"**

---

## PASO 2 — Activar Realtime Database

1. Menú izquierdo → **Build** → **Realtime Database**
2. Clic en **"Crear base de datos"**
3. Región: **United States (us-central1)**
4. Reglas: **"Iniciar en modo de prueba"** → **"Habilitar"**
5. Copia la URL que aparece:
   `https://montededios-default-rtdb.firebaseio.com`

### Reglas de seguridad (pestaña "Reglas"):
Borra todo y pega esto → clic en "Publicar":
```json
{
  "rules": {
    ".read": true,
    "events":    { ".write": true },
    "musicians": { ".write": true },
    "songs":     { ".write": true },
    "activity":  { ".write": true },
    "fcmTokens": { ".write": true },
    "users":     { ".write": true },
    "config":    { ".read": true, ".write": false }
  }
}
```

---

## PASO 3 — Clave VAPID (para notificaciones)

1. Ícono ⚙️ → **"Configuración del proyecto"**
2. Pestaña **"Cloud Messaging"**
3. Sección **"Web Push certificates"** → **"Generar par de claves"**
4. Copia la clave larga que aparece → es tu **VAPID KEY**

---

## PASO 4 — Registrar tu app web

1. Sigue en **"Configuración del proyecto"** (⚙️)
2. Sección **"Tus apps"** → clic en **"</>"** (Web)
3. Apodo: **montededios** → **"Registrar app"**
4. Copia el bloque firebaseConfig completo:
```
apiKey, authDomain, databaseURL, projectId,
storageBucket, messagingSenderId, appId
```
5. Clic en **"Continuar a la consola"**

---

## PASO 5 — Editar index.html

1. Abre `index.html` con Bloc de notas o cualquier editor
2. Presiona **Ctrl+F** y busca: `TU_API_KEY`
3. Encontrarás este bloque cerca del inicio del archivo:

```javascript
const firebaseConfig = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROJECT.firebaseapp.com",
  databaseURL:       "https://TU_PROJECT-default-rtdb.firebaseio.com",
  projectId:         "TU_PROJECT_ID",
  storageBucket:     "TU_PROJECT.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};
const VAPID_KEY = "TU_VAPID_KEY_AQUI";
```

4. Reemplaza cada valor con los tuyos del Paso 4:

| Texto a reemplazar | Cámbialo por |
|---|---|
| TU_API_KEY | Tu apiKey |
| TU_PROJECT.firebaseapp.com | Tu authDomain |
| https://TU_PROJECT-default-rtdb... | Tu databaseURL (del Paso 2) |
| TU_PROJECT_ID | Tu projectId |
| TU_PROJECT.appspot.com | Tu storageBucket |
| TU_SENDER_ID | Tu messagingSenderId |
| TU_APP_ID | Tu appId |
| TU_VAPID_KEY_AQUI | Tu VAPID KEY (del Paso 3) |

5. Guarda el archivo (Ctrl+S)

---

## PASO 6 — Editar firebase-messaging-sw.js

1. Abre `firebase-messaging-sw.js`
2. Busca `TU_API_KEY` igual que antes
3. Reemplaza exactamente los mismos valores que en el Paso 5
4. Guarda (Ctrl+S)

---

## PASO 7 — Subir a internet (Netlify - gratis)

1. Ve a **https://netlify.com**
2. Arrastra la carpeta `montededios` completa al área de deploy
3. Espera → obtienes una URL `https://xxxxx.netlify.app`
4. ¡Esa es tu app! Compártela con todos

---

## PASO 8 — Instalar en el celular

**Android (Chrome):**
→ Abre la URL → toca el botón "📲 Instalar App" del encabezado

**iPhone (Safari):**
→ Abre la URL → botón compartir ↑ → "Agregar a pantalla de inicio"

---

## PASO 9 — Primer acceso como Admin

- Nombre de perfil: **AdminLider**
- Contraseña: **monte2026**
- Cargo: **Líder** (acceso completo)

---

## ARCHIVOS DEL ZIP

| Archivo | Función | ¿Editar? |
|---|---|---|
| index.html | App completa | ✅ Pegar credenciales |
| firebase-messaging-sw.js | Notificaciones | ✅ Pegar credenciales |
| sw.js | Modo offline | ❌ No tocar |
| manifest.json | Nombre e icono app | ❌ No tocar |

---

## PROBLEMAS COMUNES

- **"Modo Demo"**: algún valor TU_... sin reemplazar en index.html
- **Sin notificaciones**: VAPID KEY incorrecta o sin dar permiso
- **No instala**: necesita HTTPS — usa Netlify o Firebase Hosting
- **"Permission denied"**: revisa las Reglas de Realtime Database
