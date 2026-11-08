# 🚀 BÍ KÍP ĐI THI PE REACT - BẢNG CẤU HÌNH SIÊU TỐC TRONG 30 GIÂY

Template này được thiết kế để **tái sử dụng 100% cho MỌI ĐỀ THI PE (Shoes, Employee, Book, Room, Car, Student...)** mà không cần đụng vào code giao diện!

---

## ⚡ 30 GIÂY KHI VÀO PHÒNG THI: MỞ `src/config.js` SỬA CÁC DÒNG NÀY:

```javascript
export const CONFIG = {
  // 1. Tên đối tượng đề bài (VD: 'Book', 'Room', 'Car', 'Employee', 'Shoes'...)
  ENTITY_NAME: 'Book',

  // 2. Đường dẫn REST API Backend (port 8080)
  API_MAIN: '/books',                // Endpoint thực thể chính
  API_CATEGORY: '/categories',        // Endpoint danh mục phụ (hoặc '/departments')

  // 3. Tên thuộc tính trong JSON Backend trả về:
  FIELD_ID: 'bookId',                // ID (id, bookId, employeeId...)
  FIELD_NAME: 'title',               // Tên (title, fullName, name...)
  FIELD_CATEGORY: 'categoryName',    // Danh mục (categoryName, departmentName...)
  FIELD_PRICE: 'price',              // Giá / Lương (price, salary, cost...)
  FIELD_EXTRA: 'author',             // Thuộc tính phụ (author, position, manufacturer...)
  FIELD_DATE1: 'publishDate',        // Ngày 1 (publishDate, startDate, productionDate...)
  FIELD_DATE2: 'importDate',         // Ngày 2 (importDate, dateOfBirth...)

  // 4. Tên tham số khi lọc / tìm kiếm (?name=...&category=...)
  PARAM_SEARCH_NAME: 'name',
  PARAM_SEARCH_CAT: 'category',      // Nếu đề Employee thì đổi thành 'departmentId'

  // 5. Nhãn hiển thị tiêu đề cột
  LABEL_PRICE: 'Price(đ)',           // hoặc 'Salary'
  LABEL_EXTRA: 'Author',             // hoặc 'Position', 'Manufacturer'
};
```

---

## 🎁 CÁC TÍNH NĂNG TỰ ĐỘNG CHẠY 100%:
1. **Phân trang Hybrid (Server-side + Client-side Fallback)**:
   - Tự động gửi `?page=...&size=5` lên Spring Boot.
   - Tự động nhận `totalPages`, `totalElements` của Spring Boot `PageResponse` / `PageDTO`.
   - Bấm trang 1, 2, 3... tự gọi lại Backend lấy đúng dữ liệu.
   - Nếu Backend trả mảng thuần không phân trang: Tự động cắt Client-side.
2. **Auto-detect thông minh**:
   - Tự động nhận diện trường ID (`departmentId`, `categoryId`, `id`...) và trường tên (`departmentName`, `categoryName`, `name`...) trong Dropdown danh mục mà không bị lỗi.
3. **Format ngày tháng 2 chiều**:
   - Khi hiển thị: Tự đổi ngày Backend ISO thành dạng chuẩn `dd/MM/yyyy`.
   - Khi gửi đi (POST/PUT): Tự đổi `dd/MM/yyyy` thành `yyyy-MM-dd` để Spring Boot không bị lỗi parse Date.
4. **Đầy đủ 4 màn hình chuẩn quy định**:
   - `/`: Danh sách + Lọc + Reset + Phân trang + Nút Xóa (kèm Confirm Screen)
   - `/view/:id`: Xem chi tiết + Nút Quay Lại
   - `/add`: Thêm mới + Full Validation + Tự nạp danh mục
   - `/edit/:id`: Cập nhật + Tự nạp dữ liệu cũ + PUT API
