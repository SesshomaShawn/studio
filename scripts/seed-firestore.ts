
// scripts/seed-firestore.ts
import { db } from '../src/lib/firebase';
import { products as initialProducts } from '../src/lib/data';
import { collection, writeBatch, doc } from 'firebase/firestore';

async function seedDatabase() {
  console.log('Starting to seed the database...');
  
  if (!initialProducts || initialProducts.length === 0) {
    console.log("No initial products found in src/lib/data.ts. Aborting seed.");
    return;
  }
  
  const productsCollectionRef = collection(db, 'products');
  const batch = writeBatch(db);

  initialProducts.forEach((product) => {
    // When using a batch write with auto-generated IDs, you must first create a document reference with no path arguments.
    const docRef = doc(productsCollectionRef); 
    
    // The original product's `id` field from the local array is not needed, Firestore will generate one.
    const { id, ...productData } = product; 
    
    // Ensure names are lowercase for case-insensitive querying
    const dataToSave = {
      ...productData,
      name: productData.name.toLowerCase(),
      // Ensure expiryDate is a format Firestore understands (like a Date object)
      expiryDate: new Date(productData.expiryDate),
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
