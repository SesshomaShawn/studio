import type { Product } from './types';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be a database.
// This file is now used to SEED the initial data into Firestore.
// You can add your custom data here before running the seed script.
//
// ĐỂ THÊM DỮ LIỆU CỦA RIÊNG BẠN:
// 1. Sao chép khối đối tượng sản phẩm mẫu bên dưới.
// 2. Dán nó vào trong dấu ngoặc vuông `[]` của mảng `initialProducts`.
// 3. Thay đổi các giá trị (ví dụ: "Tên sản phẩm của bạn") thành thông tin chi tiết về sản phẩm của bạn.
// 4. Thêm bao nhiêu đối tượng sản phẩm tùy thích, phân cách mỗi đối tượng bằng dấu phẩy.
/*
 * Mẫu đối tượng sản phẩm để sao chép:
 *
  {
    // Firestore sẽ tự động tạo ID, bạn không cần cung cấp trường này.
    name: 'Tên sản phẩm của bạn',
    description: 'Mô tả chi tiết về sản phẩm của bạn.',
    price: 19.99, // Giá sản phẩm (dạng số)
    unit: 'cái', // Đơn vị tính (ví dụ: kg, hộp, cái)
    stock: 100, // Số lượng tồn kho (dạng số nguyên)
    expiryDate: new Date('YYYY-MM-DD'), // Ngày hết hạn, thay YYYY-MM-DD
    imageUrl: 'https://picsum.photos/400/300', // URL hình ảnh sản phẩm
    category: 'Danh mục của bạn', // Danh mục sản phẩm
  },

*/

export const initialProducts: Omit<Product, 'id'>[] = [
  // Dán các đối tượng sản phẩm tùy chỉnh của bạn vào đây.
  // Ví dụ:
  {
    name: 'Organic Bananas',
    description: 'A bunch of fresh, organic bananas.',
    price: 1.99,
    unit: 'bunch',
    stock: 150,
    expiryDate: new Date('2025-08-15'),
    imageUrl: 'https://picsum.photos/400/300?random=1',
    category: 'Fruits',
  },
  {
    name: 'Whole Wheat Bread',
    description: 'A healthy loaf of whole wheat bread.',
    price: 3.49,
    unit: 'loaf',
    stock: 80,
    expiryDate: new Date('2025-07-28'),
    imageUrl: 'https://picsum.photos/400/300?random=2',
    category: 'Bakery',
  },
  {
    name: 'Free-Range Eggs',
    description: 'A dozen large, brown free-range eggs.',
    price: 4.99,
    unit: 'dozen',
    stock: 120,
    expiryDate: new Date('2025-08-20'),
    imageUrl: 'https://picsum.photos/400/300?random=3',
    category: 'Dairy & Eggs',
  },
  {
    name: 'Cheddar Cheese',
    description: 'A block of sharp cheddar cheese.',
    price: 6.99,
    unit: 'block',
    stock: 60,
    expiryDate: new Date('2025-09-30'),
    imageUrl: 'https://picsum.photos/400/300?random=4',
    category: 'Dairy & Eggs',
  },
   {
    name: 'Avocado',
    description: 'Creamy and delicious Hass avocado.',
    price: 1.50,
    unit: 'piece',
    stock: 200,
    expiryDate: new Date('2025-07-25'),
    imageUrl: 'https://picsum.photos/400/300?random=5',
    category: 'Fruits',
  },
  {
    name: 'Greek Yogurt',
    description: 'Plain Greek yogurt, high in protein.',
    price: 4.29,
    unit: 'tub',
    stock: 75,
    expiryDate: new Date('2025-08-10'),
    imageUrl: 'https://picsum.photos/400/300?random=6',
    category: 'Dairy & Eggs',
  },
  {
    name: 'Baby Spinach',
    description: 'A bag of fresh baby spinach.',
    price: 3.99,
    unit: 'bag',
    stock: 90,
    expiryDate: new Date('2025-08-01'),
    imageUrl: 'https://picsum.photos/400/300?random=7',
    category: 'Vegetables',
  },
  {
    name: 'Sourdough Bread',
    description: 'Artisanal sourdough loaf with a crispy crust.',
    price: 5.99,
    unit: 'loaf',
    stock: 40,
    expiryDate: new Date('2025-07-26'),
    imageUrl: 'https://picsum.photos/400/300?random=8',
    category: 'Bakery',
  },
];
