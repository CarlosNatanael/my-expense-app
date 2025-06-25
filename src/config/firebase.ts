// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth'; // <--- ASSIM
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC3vr38c_EsSqkJ3jaLcXTakFz17pSC7FE",
  authDomain: "my-expenses-app-61540.firebaseapp.com",
  projectId: "my-expenses-app-61540",
  storageBucket: "my-expenses-app-61540.firebasestorage.app",
  messagingSenderId: "230612860751",
  appId: "1:230612860751:android:4a9cbf064fbc843236cf3a",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app);

export const db = getFirestore(app);