import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, doc as firestoreDoc, setDoc, collection, getDocs, query, where , onSnapshot} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCO1gk43JWHQXOIxAv1B1XBZmArJy0SP0k",
  authDomain: "certification-4e3e5.firebaseapp.com",
  projectId: "certification-4e3e5",
  storageBucket: "certification-4e3e5.appspot.com",
  messagingSenderId: "716281600672",
  appId: "1:716281600672:web:329d700adb5418d76fc7c5",
  measurementId: "G-RT097C6BT3"
};

let app;
let auth;
let firestore;
let storage;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  firestore = getFirestore(app);
  storage = getStorage(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  firestore = getFirestore(app);
  storage = getStorage(app); 
}

export { auth, firestore, storage, firestoreDoc, setDoc, collection, getDocs, query, where, onSnapshot };
