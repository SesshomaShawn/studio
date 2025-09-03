'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductFormValues } from './types';
import { productSchema } from './types';
import { products as mockProducts } from './data';
import { v4 as uuidv4 } from 'uuid';

let products: Product[] = [...mockProducts];

// Simulate network delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function saveImage(dataUri: string): Promise<string> {
    // In a real app, this would upload to a cloud storage and return the URL.
    // For this mock version, we'll just return the data URI as if it were a public URL.
    await sleep(500); 
    console.log("Simulating image save for:", dataUri.substring(0, 50) + "...");
    // We'll use a placeholder image service URL for demonstration
    const width = 400;
    const height = 300;
    const randomImageId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/id/${randomImageId}/${width}/${height}`;
}


export async function getProducts(filters: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; totalCount: number }> {
    await sleep(300);
    
    let filteredProducts = products;

    if (filters.category && filters.category !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === filters.category.toLowerCase());
    }

    if (filters.query) {
        filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(filters.query.toLowerCase()));
    }
    
    const totalCount = filteredProducts.length;

    const page = filters.page || 1;
    const limit = filters.limit || 8;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return { products: paginatedProducts, totalCount };
}


export async function getAllCategories(): Promise<string[]> {
    await sleep(100);
    const categories = [...new Set(products.map(p => p.category))];
    return categories.sort();
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error('Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }
  
  await sleep(500);

  const newProduct: Product = {
      id: uuidv4(),
      ...validatedFields.data,
      createdAt: new Date(),
      updatedAt: new Date(),
  };

  products.unshift(newProduct); // Add to the beginning of the array

  revalidatePath('/');
  return { success: `Đã tạo mặt hàng "${newProduct.name}" thành công!` };
}


export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }

  await sleep(500);
  
  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
      return { error: 'Không tìm thấy mặt hàng.' };
  }

  products[productIndex] = {
      ...products[productIndex],
      ...validatedFields.data,
      updatedAt: new Date(),
  };


  revalidatePath('/');
  return { success: `Đã cập nhật mặt hàng "${products[productIndex].name}" thành công!` };
}

export async function deleteProduct(id: string) {
    await sleep(500);
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return { error: 'Không tìm thấy mặt hàng.' };
    }
    
    products = products.filter(p => p.id !== id);

    revalidatePath('/');
    return { success: 'Đã xóa mặt hàng thành công!' };
}
