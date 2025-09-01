// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase config object
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
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}


const db = getFirestore(app);

export { db };
