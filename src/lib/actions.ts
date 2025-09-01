'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductFormValues } from './types';
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
  limit,
  startAfter,
  getDoc,
  getCountFromServer
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
  const productsRef = collection(db, 'products');
  let q = query(productsRef);
  let countQuery = query(collection(db, "products"));

  if (filters.query) {
    const searchTerm = filters.query.toLowerCase();
    // Firestore doesn't support native text search like SQL's LIKE.
    // This is a common workaround for simple cases. For complex search, you'd use a
    // dedicated search service like Algolia or Elasticsearch.
    // We query for names greater than or equal to the search term, and less than the next character.
    q = query(q, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
    countQuery = query(countQuery, where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
  }

  if (filters.category && filters.category !== 'all') {
    q = query(q, where('category', '==', filters.category));
    countQuery = query(countQuery, where('category', '==', filters.category));
  }
  
  const totalCountSnapshot = await getCountFromServer(countQuery);
  const totalCount = totalCountSnapshot.data().count;

  const page = filters.page || 1;
  const pageLimit = filters.limit || 8;
  
  // For pagination, we need to fetch documents up to the current page
  // and get the last document of the previous page to use as a cursor.
  if (page > 1) {
    const prevPageLimit = (page - 1) * pageLimit;
    const prevPageQuery = query(q, limit(prevPageLimit));
    const prevPageSnapshot = await getDocs(prevPageQuery);
    const lastVisible = prevPageSnapshot.docs[prevPageSnapshot.docs.length - 1];
    q = query(q, startAfter(lastVisible));
  }
  
  q = query(q, limit(pageLimit));
  
  const snapshot = await getDocs(q);
  
  const products = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to JS Date
      expiryDate: data.expiryDate.toDate(),
    } as Product;
  });

  return { products, totalCount };
}

export async function getAllCategories(): Promise<string[]> {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  const categories = new Set(snapshot.docs.map(doc => doc.data().category as string));
  return Array.from(categories).sort();
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }

  try {
    await addDoc(collection(db, 'products'), validatedFields.data);
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

  const productRef = doc(db, 'products', id);
  
  try {
    await updateDoc(productRef, validatedFields.data);
    revalidatePath('/');
    return { success: 'Product updated successfully!' };
  } catch(e) {
    console.error("Error updating document: ", e);
    return { error: 'Failed to update product.' };
  }
}

export async function deleteProduct(id: string) {
  const productRef = doc(db, 'products', id);
  
  try {
    await deleteDoc(productRef);
    revalidatePath('/');
    return { success: 'Product deleted successfully!' };
  } catch (e) {
    console.error("Error deleting document: ", e);
    return { error: 'Failed to delete product.' };
  }
}
