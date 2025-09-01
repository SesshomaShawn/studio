// This script seeds the Firestore database with initial product data.
// To run it, use: `npm run db:seed`

import { db } from '../src/lib/firebase';
import { initialProducts } from '../src/lib/data';
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';

async function seedDatabase() {
  console.log('Seeding database...');
  const productsCollection = collection(db, 'products');

  // Check if the collection is already populated
  const snapshot = await getDocs(productsCollection);
  if (!snapshot.empty) {
    console.log('Database already seeded. Exiting.');
    return;
  }

  if (initialProducts.length === 0) {
    console.log('No initial products to seed. Exiting.');
    return;
  }

  const batch = writeBatch(db);

  initialProducts.forEach((product) => {
    // Create a new document reference with an auto-generated ID
    const newProductRef = doc(productsCollection);
    batch.set(newProductRef, product);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${initialProducts.length} products.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
