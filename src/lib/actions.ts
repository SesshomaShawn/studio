"use server";

import { revalidatePath } from "next/cache";
import { products } from "./data";
import type { Product, ProductFormValues } from "./types";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { productSchema } from "./types";

// Simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts(filters: { query?: string; category?: string }): Promise<Product[]> {
  await delay(1000); // Simulate DB query time

  let filteredProducts = products;

  if (filters.query) {
    const lowerCaseQuery = filters.query.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(lowerCaseQuery));
  }

  if (filters.category && filters.category !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
  }

  return filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return products.find(p => p.id === id);
}

export async function getAllCategories(): Promise<string[]> {
  const categories = new Set(products.map(p => p.category));
  return Array.from(categories).sort();
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields!",
    };
  }

  const newProduct: Product = {
    id: uuidv4(),
    ...validatedFields.data,
  };

  products.unshift(newProduct);
  revalidatePath("/");

  return {
    success: "Product created successfully!",
  };
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields!",
    };
  }

  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return {
      error: "Product not found!",
    };
  }

  products[index] = { ...products[index], ...validatedFields.data };
  revalidatePath("/");

  return {
    success: "Product updated successfully!",
  };
}

export async function deleteProduct(id: string) {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return {
      error: "Product not found!",
    };
  }

  products.splice(index, 1);
  revalidatePath("/");

  return {
    success: "Product deleted successfully!",
  };
}
