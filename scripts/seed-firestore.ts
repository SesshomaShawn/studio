// scripts/seed-firestore.ts
import { db } from '../src/lib/firebase';
import { products as initialProducts } from '../src/lib/data';
import { collection, writeBatch, getDocs } from 'firebase/firestore';

async function seedDatabase() {
  console.log('Starting to seed the database...');

  const productsCollection = collection(db, 'products');

  // Optional: Check if collection is empty before seeding
  const snapshot = await getDocs(productsCollection);
  if (!snapshot.empty) {
    console.log('Products collection already contains data. Skipping seed.');
    return;
  }

  const batch = writeBatch(db);

  initialProducts.forEach((product) => {
    // Firestore will auto-generate an ID if we don't specify one
    const { id, ...productData } = product;
    const docRef = collection(db, 'products').doc();
    batch.set(docRef, productData);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${initialProducts.length} products.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
  console.log('Database seeding finished.');
  // The process will exit automatically.
});
