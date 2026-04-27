import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseEnabled = Boolean(
  config.apiKey && config.projectId && config.appId
);

export let db = null;
export let auth = null;
export let authReady = Promise.resolve(null);

if (firebaseEnabled) {
  const app = initializeApp(config);
  db = getFirestore(app);
  auth = getAuth(app);
  authReady = signInAnonymously(auth)
    .then((cred) => cred.user)
    .catch((err) => {
      console.error("[firebase] anonymous sign-in failed:", err);
      return null;
    });
} else {
  console.info(
    "[firebase] deshabilitado: faltan variables VITE_FIREBASE_* en .env.local. " +
      "La app corre en modo local con localStorage."
  );
}

export const COUPLE_DOC_PATH = ["adventure", "state"];

export const deviceId = (() => {
  try {
    const KEY = "pc.deviceId";
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id =
        crypto.randomUUID?.() ??
        `d-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `tmp-${Math.random().toString(36).slice(2)}`;
  }
})();
