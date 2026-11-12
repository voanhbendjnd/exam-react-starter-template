/**
 * ====================================================================================
 * ⚡ PE REACT - BẢNG CẤU HÌNH CỰC DỄ THEO FIELD_1, FIELD_2, FIELD_3...
 * ------------------------------------------------------------------------------------
 * 👉 Đề bài yêu cầu trường gì, bạn CHỈ CẦN ĐIỀN TÊN VÀO FIELD_1, FIELD_2, FIELD_3...
 *    Tất cả các trang List, Detail, Add, Edit sẽ TỰ ĐỘNG VẼ CỘT VÀ Ô NHẬP THEO!
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

  // ==================================================================================
  // 🎯 CÁC TRƯỜNG DỮ LIỆU ĐÁNH SỐ (ĐỀ CÓ TRƯỜNG NÀO THÌ ĐIỀN VÀO ĐÂY):
  // ==================================================================================
  
  // 👉 FIELD 1: (Ví dụ: Giá tiền / Lương / Điểm số...)
  FIELD_1: 'price',
  LABEL_1: 'Price(đ)',

  // 👉 FIELD 2: (Ví dụ: Nhà sản xuất / Chức vụ / Tác giả / Hãng xe...)
  FIELD_2: 'manufacturer',
  LABEL_2: 'Manufacturer',

  // 👉 FIELD 3: (Ví dụ: Ngày sản xuất / Ngày bắt đầu / Ngày sinh / Email...)
  FIELD_3: 'productionDate',
  LABEL_3: 'Production date',

  // 👉 FIELD 4: (Ví dụ: Ngày nhập / Ngày kết thúc / Số điện thoại...)
  FIELD_4: 'importDate',
  LABEL_4: 'Import Date',

  // 👉 FIELD 5: (Nếu đề có thêm trường số lượng, trạng thái... nếu không có thì để rỗng '')
  FIELD_5: 'quantity',
  LABEL_5: 'Quantity',

  // 🔹 CẤU HÌNH PHÂN TRANG
  PAGE_SIZE: 5,
  PAGE_CONFIRM_TITLE:''
};
