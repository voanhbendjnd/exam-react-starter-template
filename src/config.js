/**
 * ====================================================================================
 * ⚡ PE REACT - BẢNG CẤU HÌNH DỰ ÁN
 * ------------------------------------------------------------------------------------
 * 👉 Đề bài yêu cầu entity gì, bạn CHỈ CẦN ĐIỀN TÊN VÀ ENDPOINT VÀO ĐÂY:
 *    - Toàn bộ tiêu đề cột và ô nhập form được viết TRỰC TIẾP bằng JSX tại các trang,
 *      giúp bạn dễ nhìn, dễ sửa và tự do ghép biến (VD: priceFrom - priceTo).
 * ====================================================================================
 */

export const CONFIG = {
  // 🔹 THÔNG TIN CHUNG
  ENTITY_NAME: 'Shoes',              // Đổi thành: 'Employee', 'Book', 'Room', 'Car'...
  API_MAIN: '/shoes',                // Endpoint chính: '/employees', '/books', '/rooms'...
  API_CATEGORY: '/categories',        // Endpoint danh mục: '/departments', '/room-types'...

  // 🔹 CÁC KHÓA BẮT BUỘC ĐỀ NÀO CŨNG CÓ:
  FIELD_ID: 'shoesId',               // Tên trường ID: 'employeeId', 'id', 'bookId'...
  FIELD_NAME: 'shoesName',           // Tên trường Tên: 'fullName', 'title', 'name'...
  FIELD_CATEGORY: 'categoryName',    // Tên trường Danh mục: 'departmentName', 'category'...
  PARAM_SEARCH_NAME: 'name',         // Param tìm tên khi lọc (thường là 'name')
  PARAM_SEARCH_CAT: 'category',      // Param lọc danh mục: 'departmentId', 'categoryId', 'category'

  // 🔹 CẤU HÌNH PHÂN TRANG MẶC ĐỊNH
  PAGE_SIZE: 5,
};
