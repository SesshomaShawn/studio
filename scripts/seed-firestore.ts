// This script seeds the Firestore database with initial product data.
// To run it, use: `npm run db:seed`

import { db } from '../src/lib/firebase';
import { initialProducts } from '../src/lib/data';
import { collection, writeBatch, getDocs } from 'firebase/firestore';

async function seedDatabase() {
  console.log('Seeding database...');
  const productsCollection = collection(db, 'products');

  // Check if the collection is already populated
  const snapshot = await getDocs(productsCollection);
  if (!snapshot.empty) {
    console.log('Database already seeded. Exiting.');
    return;
  }

  const batch = writeBatch(db);

  initialProducts.forEach((product) => {
    const docRef = collection(db, 'products'); // Firestore will auto-generate an ID
    // Note: We don't pass an ID. Firestore will create one.
    // The product object should not contain an `id` field when creating.
    batch.set(doc(docRef), product);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${initialProducts.length} products.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
