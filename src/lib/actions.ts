'use server';

import { revalidatePath } from 'next/cache';
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
  getCountFromServer,
  orderBy,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString, deleteObject } from "firebase/storage";
import { db, storage } from './firebase';
import type { Product, ProductFormValues } from './types';
import { productSchema } from './types';

// In a real app, this would save the image to a cloud storage bucket
// and return the public URL.
export async function saveImage(dataUri: string): Promise<string> {
    if (!dataUri.startsWith('data:image')) {
        // If it's not a new data URI, assume it's an existing URL and return it.
        return dataUri;
    }
    const blobType = dataUri.substring(dataUri.indexOf(':') + 1, dataUri.indexOf(';'));
    const fileExtension = blobType.split('/')[1];
    const storageRef = ref(storage, `products/${Date.now()}.${fileExtension}`);
    
    // We need to remove the metadata from the data URI before uploading.
    const base64Data = dataUri.split(',')[1];

    await uploadString(storageRef, base64Data, 'base64', {
        contentType: blobType,
    });
    
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
}

export async function getProducts(filters: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  lastVisibleId?: string;
}): Promise<{ products: Product[]; totalCount: number, lastVisibleId?: string }> {
  
  const productsCollection = collection(db, 'products');
  let q = query(productsCollection);
  let countQuery = query(productsCollection);

  if (filters.category && filters.category !== 'all') {
    q = query(q, where('category', '==', filters.category));
    countQuery = query(countQuery, where('category', '==', filters.category));
  }
    
  if (filters.query) {
    const searchTerm = filters.query.toLowerCase();
    const endTerm = searchTerm + '\uf8ff';
    q = query(q, where('name_lowercase', '>=', searchTerm), where('name_lowercase', '<=', endTerm));
    countQuery = query(countQuery, where('name_lowercase', '>=', searchTerm), where('name_lowercase', '<=', endTerm));
  } 
  
  // Apply orderBy after all where clauses
  if (!filters.query) {
    q = query(q, orderBy('name'));
  }


  // Get total count for pagination based on the same filters
  const countSnapshot = await getCountFromServer(countQuery);
  const totalCount = countSnapshot.data().count;

  const pageLimit = filters.limit || 8;
  
  if (filters.page && filters.page > 1 && filters.lastVisibleId) {
    const lastVisibleSnap = await getDoc(doc(db, 'products', filters.lastVisibleId));
    if (lastVisibleSnap.exists()) {
      q = query(q, startAfter(lastVisibleSnap));
    }
  }
  
  q = query(q, limit(pageLimit));
  
  const snapshot = await getDocs(q);

  const products: Product[] = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      // Convert Firestore Timestamp to Date
      expiryDate: data.expiryDate.toDate(),
    } as Product;
  });

  const lastVisibleId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : undefined;

  return { products, totalCount, lastVisibleId };
}


export async function getAllCategories(): Promise<string[]> {
  const productsCollection = collection(db, 'products');
  const snapshot = await getDocs(productsCollection);
  const categories = new Set(snapshot.docs.map(doc => doc.data().category as string));
  return Array.from(categories).sort();
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }
  
  try {
     const { imageUrl, ...productData } = validatedFields.data;
     const savedImageUrl = await saveImage(imageUrl);
    
    await addDoc(collection(db, 'products'), {
        ...productData,
        name_lowercase: productData.name.toLowerCase(),
        imageUrl: savedImageUrl,
    });

    revalidatePath('/');
    return { success: 'Đã tạo mặt hàng thành công!' };
  } catch (e) {
    console.error("Lỗi khi thêm tài liệu: ", e);
    return { error: "Không thể tạo mặt hàng." };
  }
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }
  
  const docRef = doc(db, 'products', id);
  try {
    const { imageUrl, ...productData } = validatedFields.data;
    const savedImageUrl = await saveImage(imageUrl);

    await updateDoc(docRef, {
        ...productData,
        name_lowercase: productData.name.toLowerCase(),
        imageUrl: savedImageUrl,
    });
    revalidatePath('/');
    return { success: 'Đã cập nhật mặt hàng thành công!' };
  } catch (e) {
     console.error("Lỗi khi cập nhật tài liệu: ", e);
    return { error: "Không thể cập nhật mặt hàng." };
  }
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, 'products', id);
   try {
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const imageUrl = docSnap.data().imageUrl;
      if(imageUrl && imageUrl.includes('firebasestorage')){
         const imageRef = ref(storage, imageUrl);
         await deleteObject(imageRef).catch(e => console.error("Lỗi xóa ảnh từ storage:", e));
      }
    }
    await deleteDoc(docRef);
    revalidatePath('/');
    return { success: 'Đã xóa mặt hàng thành công!' };
  } catch(e) {
    console.error("Lỗi xóa tài liệu: ", e);
    return { error: "Không thể xóa mặt hàng." };
  }
}
