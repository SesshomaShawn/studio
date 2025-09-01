// This script seeds the Firestore database with initial product data.
// To run it, use: `npm run db:seed`

import { db } from '../src/lib/firebase';
import { initialProducts } from '../src/lib/data';
import { collection, writeBatch, getDocs, doc, deleteDoc } from 'firebase/firestore';

async function seedDatabase() {
  const productsCollectionRef = collection(db, 'products');
  
  // 1. Delete all existing products in the collection to prevent duplicates
  console.log('Deleting existing products...');
  try {
    const existingProductsSnapshot = await getDocs(productsCollectionRef);
    if (!existingProductsSnapshot.empty) {
      const deleteBatch = writeBatch(db);
      existingProductsSnapshot.docs.forEach(document => {
        deleteBatch.delete(document.ref);
      });
      await deleteBatch.commit();
      console.log(`Deleted ${existingProductsSnapshot.size} existing products.`);
    } else {
        console.log('No existing products to delete.');
    }
  } catch (error) {
    // It's okay if the collection doesn't exist yet, we'll create it.
    console.log("Collection 'products' may not exist yet. Proceeding to seed.");
  }


  // 2. Add the new products from `initialProducts`
  console.log('Seeding new products...');
  if (initialProducts.length === 0) {
    console.log('No initial products to seed. Exiting.');
    return;
  }

  const seedBatch = writeBatch(db);

  initialProducts.forEach((product) => {
    const newProductRef = doc(productsCollectionRef); // Auto-generates an ID
    seedBatch.set(newProductRef, product);
  });

  try {
    await seedBatch.commit();
    console.log(`Successfully seeded ${initialProducts.length} products.`);
  } catch (error) {
    console.error('Error seeding new products:', error);
  }
}

seedDatabase();
