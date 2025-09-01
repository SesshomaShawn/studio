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
    
    let queryConstraints = [];
    if (filters.category && filters.category !== 'all') {
        queryConstraints.push(where("category", "==", filters.category));
    }

    if (filters.query) {
        const queryText = filters.query.toLowerCase();
        // Firestore doesn't support case-insensitive "contains" search natively.
        // This query finds documents where the name starts with the query text.
        // It requires an index on 'name_lowercase'.
        queryConstraints.push(orderBy("name"));
        queryConstraints.push(where("name", ">=", queryText));
        queryConstraints.push(where("name", "<=", queryText + '\uf8ff'));
    } else {
        // Default sort order if no query is provided.
        queryConstraints.push(orderBy("name"));
    }

    const countQuery = query(productsRef, ...queryConstraints);
    const totalCountSnapshot = await getDocs(countQuery);
    const totalCount = totalCountSnapshot.size;
    
    const page = filters.page || 1;
    const limit = filters.limit || 8;
    
    let paginatedQuery = countQuery;

    if (page > 1) {
        const lastVisibleIndex = (page - 1) * limit -1;
        if(lastVisibleIndex < totalCountSnapshot.docs.length){
            const lastVisible = totalCountSnapshot.docs[lastVisibleIndex];
            paginatedQuery = query(countQuery, startAfter(lastVisible), firestoreLimit(limit));
        } else {
            // This page is out of bounds
            paginatedQuery = query(countQuery, firestoreLimit(limit), startAfter(totalCountSnapshot.docs[totalCountSnapshot.docs.length-1]));
        }
    } else {
        paginatedQuery = query(countQuery, firestoreLimit(limit));
    }
    
    const documentSnapshots = await getDocs(paginatedQuery);

    let productsData = documentSnapshots.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp to Date if it exists
        expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : new Date(data.expiryDate),
      } as Product;
    });

    return { products: productsData, totalCount };
}


export async function getAllCategories(): Promise<string[]> {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    if(snapshot.empty){
      return [];
    }
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
  
  const dataToSave = {
      ...validatedFields.data,
      name: validatedFields.data.name.toLowerCase() // Store name in lowercase for case-insensitive search
  };

  try {
    await addDoc(collection(db, "products"), dataToSave);
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
  
   const dataToSave = {
      ...validatedFields.data,
      name: validatedFields.data.name.toLowerCase() // Store name in lowercase
  };


  try {
    await updateDoc(productRef, dataToSave);
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