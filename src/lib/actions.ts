'use server';

import { revalidatePath } from 'next/cache';
import type { Product, ProductFormValues } from './types';
import { productSchema } from './types';
import { createServerClient } from './supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function saveImage(dataUri: string): Promise<string> {
    const supabase = createServerClient();
    const matches = dataUri.match(/^data:(image\/(?:png|jpeg|gif));base64,(.*)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid image data URI');
    }

    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `public/${uuidv4()}.png`;

    const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, buffer, {
            contentType: contentType,
            upsert: true,
        });

    if (error) {
        console.error('Lỗi tải ảnh lên Supabase:', String(error));
        throw new Error('Không thể tải ảnh lên.');
    }
    
    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);

    return publicUrl;
}

export async function getProducts(filters: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ products: Product[]; totalCount: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 8;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.category && filters.category !== 'all') {
        where.category = filters.category;
    }
    if (filters.query) {
        where.name = {
            contains: filters.query,
            mode: 'insensitive',
        };
    }

    try {
        const products = await prisma.product.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
            skip,
        });
        const totalCount = await prisma.product.count({ where });

        return { products: products.map(p => ({...p, price: p.price.toNumber()})), totalCount };
    } catch (error) {
        console.error('Database Error:', String(error));
        return { products: [], totalCount: 0 };
    }
}

export async function getAllCategories(): Promise<string[]> {
    try {
        const categories = await prisma.product.findMany({
            select: {
                category: true,
            },
            distinct: ['category'],
        });
        return categories.map(c => c.category).sort();
    } catch (error) {
        console.error('Database Error:', String(error));
        return [];
    }
}

export async function createProduct(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error('Validation errors:', validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }

  try {
    await prisma.product.create({
      data: validatedFields.data,
    });
    revalidatePath('/');
    return { success: 'Đã tạo mặt hàng thành công!' };
  } catch (error) {
    console.error('Database Error:', String(error));
    return { error: 'Không thể tạo mặt hàng.' };
  }
}

export async function updateProduct(id: string, values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Dữ liệu không hợp lệ!',
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath('/');
    return { success: 'Đã cập nhật mặt hàng thành công!' };
  } catch (error) {
    console.error('Database Error:', String(error));
    return { error: 'Không thể cập nhật mặt hàng.' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: 'Đã xóa mặt hàng thành công!' };
  } catch (error) {
    console.error('Database Error:', String(error));
    return { error: 'Không thể xóa mặt hàng.' };
  }
}
