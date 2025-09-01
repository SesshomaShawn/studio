import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initialProducts } from '../src/lib/data';

// IMPORTANT: This file should not be run in a browser environment.
// It is intended to be run from the command line using Node.js.

// Load your Firebase project configuration
// IMPORTANT: Make sure to replace this with your actual Firebase config.
const firebaseConfig = {
  "projectId": "product-price-lookup",
  "appId": "1:145439781442:web:7b8943e08891b2bdd3f3db",
  "storageBucket": "product-price-lookup.firebasestorage.app",
  "apiKey": "AIzaSyBi02fUm00lGddN1NeWpxrUQQBtjMH51vI",
  "authDomain": "product-price-lookup.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "145439781442"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  const productsCollection = collection(db, 'products');

  console.log('Seeding database...');

  // 1. Delete all existing documents in the collection
  console.log('Deleting existing products...');
  const querySnapshot = await getDocs(productsCollection);
  let deleteBatch = writeBatch(db);
  querySnapshot.forEach(doc => {
    deleteBatch.delete(doc.ref);
  });
  await deleteBatch.commit();
  console.log('Existing products deleted.');

  // 2. Add all products from the initialProducts array
  console.log('Adding new products...');
  let addBatch = writeBatch(db);
  initialProducts.forEach(product => {
    const docRef = doc(collection(db, 'products')); // Create a new doc with a random ID
    addBatch.set(docRef, product);
  });

  await addBatch.commit();

  console.log(`\u001b[32mSuccessfully seeded ${initialProducts.length} products.\u001b[0m`);
}

seedDatabase()
  .then(() => {
    console.log('Database seeding complete. Exiting...');
    // Firestore keeps an open connection, so we need to explicitly exit the process.
    process.exit(0);
  })
  .catch(e => {
    console.error('\u001b[31mError seeding database:\u001b[0m', e);
    process.exit(1);
  });
