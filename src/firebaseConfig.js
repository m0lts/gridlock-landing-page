import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const isDev =
  import.meta.env.MODE === "development" ||
  window.location.hostname === "localhost";

const pick = (key) =>
  import.meta.env[
    (isDev ? `VITE_${key}_DEV` : `VITE_${key}_PROD`)
  ];

const firebaseConfig = {
  apiKey: pick("FIREBASE_API"),
  authDomain: pick("FIREBASE_AUTH_DOMAIN"),
  projectId: pick("FIREBASE_PROJECT_ID"),
  storageBucket: pick("FIREBASE_STORAGE"),
  messagingSenderId: pick("FIREBASE_SENDER_ID"),
  appId: pick("FIREBASE_APP_ID"),
  measurementId: pick("FIREBASE_MEASUREMENT_ID"),
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Optional: export which env we think we are in
export const WEB_ENV = isDev ? "dev" : "prod";

// Export project ID
export const PROJECT_ID = firebaseConfig.projectId;