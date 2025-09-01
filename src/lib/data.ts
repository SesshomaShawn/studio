import type { Product } from './types';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be a database.
// For this demo, we're using an in-memory array.
//
// ĐỂ THÊM DỮ LIỆU CỦA RIÊNG BẠN:
// 1. Sao chép khối đối tượng sản phẩm mẫu bên dưới.
// 2. Dán nó vào trong dấu ngoặc vuông `[]` của mảng `products`.
// 3. Thay đổi các giá trị (ví dụ: "Tên sản phẩm của bạn") thành thông tin chi tiết về sản phẩm của bạn.
// 4. Thêm bao nhiêu đối tượng sản phẩm tùy thích, phân cách mỗi đối tượng bằng dấu phẩy.
/*
 * Mẫu đối tượng sản phẩm để sao chép:
 *
  {
    id: uuidv4(), // Tạo ID duy nhất cho mỗi sản phẩm
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

export let products: Product[] = [
  // Dán các đối tượng sản phẩm tùy chỉnh của bạn vào đây.
  // Ví dụ:
  /*
  {
    id: uuidv4(),
    name: 'Cà phê hạt nguyên chất',
    description: 'Hạt cà phê Arabica rang mộc, hương thơm nồng nàn.',
    price: 150000,
    unit: 'túi 500g',
    stock: 50,
    expiryDate: new Date('2025-10-20'),
    imageUrl: 'https://picsum.photos/400/300?random=9',
    category: 'Đồ uống',
  },
  */
];
