// scripts/seed-firestore.ts
import { db } from '../src/lib/firebase';
import { products as initialProducts } from '../src/lib/data';
import { collection, writeBatch, doc } from 'firebase/firestore';

async function seedDatabase() {
  console.log('Starting to seed the database...');
  const productsCollectionRef = collection(db, 'products');
  
  const batch = writeBatch(db);

  initialProducts.forEach((product) => {
    const { id, ...productData } = product;
    // Create a new document reference with a new auto-generated ID
    const docRef = doc(productsCollectionRef); 
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
});
