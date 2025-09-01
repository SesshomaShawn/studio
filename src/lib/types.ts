import { z } from "zod";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  expiryDate: Date;
  imageUrl: string;
  category: string;
};

export const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).transform(val => val.trim()),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  unit: z.string().min(1, { message: "Unit is required." }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer." }),
  expiryDate: z.date({
    required_error: "An expiry date is required.",
  }),
  // Allow any string for imageUrl, as it can be a URL or a data URI
  imageUrl: z.string().min(1, { message: "Image is required." }),
  category: z.string().min(2, { message: "Category must be at least 2 characters." }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
