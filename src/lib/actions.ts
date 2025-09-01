'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductFormValues } from './types';
import { initialProducts } from './data';
import { productSchema } from './types';

// NOTE: Since we are not using a database, these actions will not persist.
// The data will reset on every server restart or page reload.

let products: Product[] = initialProducts.map((p, i) => ({
    ...p,
    id: (i + 1).toString(),
    name_lowercase: p.name.toLowerCase()
}));

export async function saveImage(dataUri: string): Promise<string> {
    // In a local-only setup, we can't "save" the image anywhere permanently.
    // If it's a new base64 image, we just return it. The browser will display it,
    // but it will be gone on the next reload.
    return dataUri;
}


export async function getProducts(filters: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; totalCount: number, lastVisibleId?: string }> {

  let filteredProducts = products;

  if (filters.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
  }
    
  if (filters.query) {
    const searchTerm = filters.query.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name_lowercase.includes(searchTerm));
  } 
  
  const totalCount = filteredProducts.length;
  const pageLimit = filters.limit || 8;
  const page = filters.page || 1;
  const startIndex = (page - 1) * pageLimit;
  const endIndex = startIndex + pageLimit;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return { products: paginatedProducts, totalCount };
}


export async function getAllCategories(): Promise<string[]> {
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }
  
  // This will not persist.
  console.log("Creating product (local only):", validatedFields.data);

  revalidatePath('/');
  return { success: 'Đã tạo mặt hàng (chỉ cục bộ)!' };
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }
  
  // This will not persist.
  console.log(`Updating product ${id} (local only):`, validatedFields.data);
  
  revalidatePath('/');
  return { success: 'Đã cập nhật mặt hàng (chỉ cục bộ)!' };
}

export async function deleteProduct(id: string) {
   // This will not persist.
  console.log(`Deleting product ${id} (local only)`);
  
  revalidatePath('/');
  return { success: 'Đã xóa mặt hàng (chỉ cục bộ)!' };
}
