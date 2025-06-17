// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC3vr38c_EsSqkJ3jaLcXTakFz17pSC7FE", // O seu apiKey
  authDomain: "my-expenses-app-61540.firebaseapp.com", // O seu authDomain
  projectId: "my-expenses-app-61540", // O seu projectId
  storageBucket: "my-expenses-app-61540.firebasestorage.app", // O seu storageBucket
  messagingSenderId: "230612860751", // O seu messagingSenderId
  appId: "1:230612860751:android:4a9cbf064fbc843236cf3a", // <-- AQUI ESTÁ O APPID CORRETO
  measurementId: "G-1WV87X4J6X" // Opcional, se você ativou o Analytics
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Opcional: Se quiser usar o Firebase Analytics (descomente se tiver ativado)
import { getAnalytics } from 'firebase/analytics';
export const analytics = getAnalytics(app);