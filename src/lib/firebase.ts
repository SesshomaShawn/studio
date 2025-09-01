// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: This is using your actual Firebase config object.
const firebaseConfig = {
  "projectId": "product-price-lookup",
  "appId": "1:145439781442:web:10178f758411b1aed3f3db",
  "storageBucket": "product-price-lookup.firebasestorage.app",
  "apiKey": "AIzaSyBi02fUm00lGddN1NeWpxrUQQBtjMH51vI",
  "authDomain": "product-price-lookup.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "145439781442"
};

// Initialize Firebase
// This pattern ensures that we're not trying to initialize the app more than once.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
