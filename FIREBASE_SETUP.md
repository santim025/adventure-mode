# Activar sincronización en tiempo real (Firebase)

Con Firebase, cuando Santiago sume puntos desde su celular, Nicol verá el
cambio **al instante** en el suyo (y viceversa). Además sale un aviso tipo
"🎉 Nicol canjeó: Viaje a Glamping".

Sin Firebase, la app igual funciona, pero cada dispositivo tiene sus propios
datos (`localStorage`). Verás un chip **Local** en el header.

---

## 1. Crear el proyecto en Firebase Console

1. Entra a https://console.firebase.google.com y loguéate con tu cuenta Google.
2. Clic en **"Add project"** → ponle un nombre (ej. `adventure-mode`).
3. En "Google Analytics" puedes desactivarlo — no lo necesitas.
4. Espera a que cree el proyecto y entra.

## 2. Registrar la app web

1. En el dashboard, clic en el ícono **`</>`** ("Add app" → Web).
2. Nickname: `adventure-mode-web`. **No** marques "Firebase Hosting" por ahora.
3. Te dará un bloque `firebaseConfig`. **Cópialo** — lo vas a usar en el paso 5.

## 3. Activar Firestore

1. En el menú izquierdo: **Build → Firestore Database → Create database**.
2. Location: elige `nam5` o la región que prefieras (no importa mucho).
3. Modo: **"Start in production mode"** (después cambiamos las reglas).
4. Pestaña **Rules** → pega esto y publica:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /adventure/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Esto dice: solo se lee/escribe el estado si el usuario está autenticado
(nosotros usamos anonymous auth en el siguiente paso).

## 4. Activar Anonymous Authentication

1. Menú izquierdo: **Build → Authentication → Get started**.
2. Pestaña **Sign-in method** → busca **Anonymous** → activa el toggle → Save.

## 5. Pegar las llaves en el proyecto

1. En la raíz de `puntos-pareja/` crea un archivo llamado **`.env.local`**
   (si no existe, copia `.env.example`).
2. Rellena así, reemplazando `xxx` con lo que viene en `firebaseConfig` del paso 2:

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_APP_ID=1:xxxx:web:xxxxxxxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxx
```

3. **Detén** el dev server (Ctrl+C en la terminal) y vuelve a ejecutarlo:
   ```
   npm run dev
   ```
   Las variables de entorno solo se leen al arrancar.

4. Recarga la app en el navegador. En el header, el chip **Local** debe cambiar
   a **En vivo** (🟢).

## 6. Probar sincronización

1. Abre la app en tu celular y en tu PC a la vez (misma URL si expones con
   `npm run dev -- --host`, o déjala desplegada en Vercel/Netlify).
2. Suma puntos en un dispositivo. El otro debería actualizarse en ~1 segundo
   y mostrar un toast tipo `Santiago sumó ✨ +50`.
3. Canjea un premio. Al otro le llega `🎉 Nicol canjeó: Viaje a Glamping`.

---

## Seguridad / consideraciones

- Las `VITE_FIREBASE_*` quedan visibles en el cliente — **es normal con
  Firebase Web**. Lo que te protege son las Firestore Rules del paso 3.
- Con las reglas anteriores, cualquiera autenticado (incluso anónimamente) a
  tu proyecto puede leer/escribir el doc. Para una app de pareja privada está
  bien, porque el proyecto es solo tuyo y el doc path es fijo.
- Si quieres endurecerlo más, podemos añadir un "código de pareja" (PIN) que
  se valide antes de permitir escribir. Avísame si quieres ese paso.

## Notificaciones push (cuando la app está cerrada)

Lo que hicimos hasta aquí te da avisos **mientras la app está abierta** en
ambos lados. Si también quieres que llegue notificación al celular con la app
cerrada, hay que añadir:

1. Convertir la app en PWA (service worker + manifest).
2. Integrar Firebase Cloud Messaging (FCM) + VAPID key.
3. Disparar el envío desde Cloud Functions o desde el cliente (menos ideal).

Dime cuando quieras ese paso y lo hacemos.
