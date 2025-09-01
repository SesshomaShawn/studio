// scripts/seed-firestore.ts
import { db } from '../src/lib/firebase';
import { products as initialProducts } from '../src/lib/data';
import { collection, writeBatch, doc } from 'firebase/firestore';

async function seedDatabase() {
  console.log('Starting to seed the database...');
  const productsCollectionRef = collection(db, 'products');
  
  // First, let's make sure the local data is what we expect
  if (!initialProducts || initialProducts.length === 0) {
    console.log("No initial products found in src/lib/data.ts. Aborting seed.");
    return;
  }
  
  const batch = writeBatch(db);

  initialProducts.forEach((product) => {
    // For batch writes, you should create a document reference first if you want an auto-generated ID
    const docRef = doc(collection(db, 'products'));
    // The original product's `id` field from the local array is not needed, Firestore will generate one.
    const { id, ...productData } = product; 
    
    const dataToSave = {
      ...productData,
      name: productData.name.toLowerCase() // Also ensure names are lowercase for consistency
    };

    batch.set(docRef, dataToSave);
  });

  try {
    await batch.commit();
    console.log(`Successfully seeded ${initialProducts.length} products into the 'products' collection.`);
  } catch (error) {
    console.error('Error seeding database. This might be due to Firestore rules or connection issues.', error);
  }
}

seedDatabase().then(() => {
  console.log('Database seeding process finished.');
});
