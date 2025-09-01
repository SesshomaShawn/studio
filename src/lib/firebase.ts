import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  "projectId": "product-price-lookup",
  "appId": "1:145439781442:web:7b8943e08891b2bdd3f3db",
  "storageBucket": "product-price-lookup.firebasestorage.app",
  "apiKey": "AIzaSyBi02fUm00lGddN1NeWpxrUQQBtjMH51vI",
  "authDomain": "product-price-lookup.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "145439781442"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
