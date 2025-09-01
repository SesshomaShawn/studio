'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductFormValues } from './types';
import { v4 as uuidv4 } from 'uuid';
import { productSchema } from './types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  limit as firestoreLimit,
  startAt,
  getCountFromServer,
  orderBy,
  startAfter
} from 'firebase/firestore';


// In a real app, this would save the image to a cloud storage bucket
// and return the public URL. For this demo, we'll just return the data URI.
export async function saveImage(dataUri: string): Promise<string> {
  // Simulate upload time
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Here you would typically upload the file to a service like Cloud Storage for Firebase
  // and get a public URL. For this demo, we'll just return the data URI itself
  // as our "saved" URL. This is not efficient for a real app but works for prototyping.
  console.log(`"Saving" image of length ${dataUri.length}`);
  return dataUri;
}

export async function getProducts(filters: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; totalCount: number }> {
    const productsRef = collection(db, "products");
    let q = query(productsRef, orderBy("name"));
    
    let constraints = [];
    if (filters.category && filters.category !== 'all') {
        constraints.push(where("category", "==", filters.category));
    }
    
    if (filters.query) {
        // Firestore doesn't support partial string matching natively.
        // For a real app, use a search service like Algolia or Elasticsearch.
        // For this demo, we'll filter after fetching, which is inefficient.
    }

    const countQuery = query(productsRef, ...constraints);
    const snapshot = await getCountFromServer(countQuery);
    const totalCount = snapshot.data().count;
    
    const page = filters.page || 1;
    const limit = filters.limit || 8;
    
    if (page > 1) {
        const first = query(productsRef, ...constraints, orderBy("name"), firestoreLimit((page - 1) * limit));
        const documentSnapshots = await getDocs(first);
        const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
        q = query(productsRef, ...constraints, orderBy("name"), startAfter(lastVisible), firestoreLimit(limit));
    } else {
        q = query(productsRef, ...constraints, orderBy("name"), firestoreLimit(limit));
    }
    
    const documentSnapshots = await getDocs(q);

    let productsData = documentSnapshots.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to Date
        expiryDate: data.expiryDate.toDate(),
      } as Product;
    });

     if (filters.query) {
        const lowerCaseQuery = filters.query.toLowerCase();
        productsData = productsData.filter(p => p.name.toLowerCase().includes(lowerCaseQuery));
    }

    return { products: productsData, totalCount };
}


export async function getAllCategories(): Promise<string[]> {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    const categories = new Set(snapshot.docs.map(doc => doc.data().category as string));
    return Array.from(categories).sort();
}


export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error(validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Invalid fields!',
    };
  }

  try {
    await addDoc(collection(db, "products"), validatedFields.data);
    revalidatePath('/');
    return { success: 'Product created successfully!' };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { error: 'Failed to create product.' };
  }
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }

  const productRef = doc(db, "products", id);

  try {
    await updateDoc(productRef, validatedFields.data);
    revalidatePath('/');
    return { success: 'Product updated successfully!' };
  } catch (e) {
    console.error("Error updating document: ", e);
    return { error: 'Failed to update product.' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, "products", id));
    revalidatePath('/');
    return { success: 'Product deleted successfully!' };
  } catch (e) {
    console.error("Error deleting document: ", e);
    return { error: 'Failed to delete product.' };
  }
}