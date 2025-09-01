import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initialProducts } from '../src/lib/data';
import "dotenv/config"; // Make sure to install dotenv: npm install dotenv

// IMPORTANT: This file should not be run in a browser environment.
// It is intended to be run from the command line using Node.js.

// Load your Firebase project configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("\u001b[31mError: Firebase configuration is missing. Make sure your .env file is set up correctly.\u001b[0m");
  process.exit(1);
}


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  const productsCollection = collection(db, 'products');

  console.log('Seeding database...');

  // 1. Delete all existing documents in the collection
  console.log('Deleting existing products...');
  const querySnapshot = await getDocs(productsCollection);
  if (querySnapshot.size > 0) {
    let deleteBatch = writeBatch(db);
    querySnapshot.forEach(doc => {
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`${querySnapshot.size} existing products deleted.`);
  } else {
    console.log("No existing products to delete.");
  }


  // 2. Add all products from the initialProducts array
  console.log('Adding new products...');
  let addBatch = writeBatch(db);
  initialProducts.forEach(product => {
    const docRef = doc(collection(db, 'products')); // Create a new doc with a random ID
    const { name, ...rest } = product;
    addBatch.set(docRef, {
      ...rest,
      name,
      name_lowercase: name.toLowerCase(),
    });
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
