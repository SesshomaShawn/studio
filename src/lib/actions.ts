'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductFormValues } from './types';
import { productSchema } from './types';
import { initialProducts as allProducts } from './data';
import { v4 as uuidv4 } from 'uuid';

// In a real app, you'd be interacting with a database.
// For this demo, we're using a simple in-memory array.
let products: Product[] = allProducts.map(p => ({ ...p, id: uuidv4() }));

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
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  let filteredProducts = products;

  if (filters.query) {
    const searchTerm = filters.query.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
  }

  if (filters.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
  }

  const totalCount = filteredProducts.length;
  const page = filters.page || 1;
  const limit = filters.limit || 8;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return { products: paginatedProducts, totalCount };
}

export async function getAllCategories(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }

  const newProduct: Product = {
    id: uuidv4(),
    ...validatedFields.data,
  };

  products.unshift(newProduct); // Add to the beginning of the array
  revalidatePath('/');
  return { success: 'Product created successfully!' };
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return { error: 'Product not found!' };
  }

  products[index] = {
    ...products[index],
    ...validatedFields.data,
  };

  revalidatePath('/');
  return { success: 'Product updated successfully!' };
}

export async function deleteProduct(id: string) {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return { error: 'Product not found!' };
  }

  products.splice(index, 1);
  revalidatePath('/');
  return { success: 'Product deleted successfully!' };
}
