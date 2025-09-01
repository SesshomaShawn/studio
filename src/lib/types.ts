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
  name_lowercase: string;
};

export const productSchema = z.object({
  name: z.string().min(3, { message: "Tên phải có ít nhất 3 ký tự." }).transform(val => val.trim()),
  description: z.string().min(10, { message: "Mô tả phải có ít nhất 10 ký tự." }),
  price: z.coerce.number().positive({ message: "Giá phải là một số dương." }),
  unit: z.string().min(1, { message: "Đơn vị tính là bắt buộc." }),
  stock: z.coerce.number().int().nonnegative({ message: "Tồn kho phải là số nguyên không âm." }),
  expiryDate: z.date({
    required_error: "Hạn sử dụng là bắt buộc.",
  }),
  imageUrl: z.string().min(1, { message: "Ảnh là bắt buộc." }),
  category: z.string().min(2, { message: "Ngành hàng phải có ít nhất 2 ký tự." }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
