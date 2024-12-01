import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API,
  authDomain: "gridlock-3a102.firebaseapp.com",
  projectId: "gridlock-3a102",
  storageBucket: "gridlock-3a102.firebasestorage.app",
  messagingSenderId: "194833496400",
  appId: "1:194833496400:web:c8618dd571977e15c59455",
  measurementId: "G-L0XRLLZK0P"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };