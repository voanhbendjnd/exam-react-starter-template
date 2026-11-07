/**
 * CONFIG TẬP TRUNG CHO TOÀN BỘ TEMPLATE PE REACT
 * ---------------------------------------------------------------------------------
 * File này được thiết kế theo mô hình GENERIC (dùng chung cho MỌI ĐỀ THI):
 * Dù đề thi là Quản lý Giày (Shoes), Ô tô (Cars), Sách (Books), Phòng (Rooms),
 * Nhân viên (Employees), hay Sinh viên (Students)... bạn CHỈ CẦN THAY ĐỔI FILE NÀY!
 * ---------------------------------------------------------------------------------
 */

// 1. TÊN THỰC THỂ CỦA ĐỀ THI (Ví dụ: 'Shoes', 'Book', 'Room', 'Product', 'Employee', 'Student')
const ENTITY_NAME = 'Shoes'; 

export const CONFIG = {
  // Tên thực thể dùng chung
  ENTITY_NAME: ENTITY_NAME,
  LOGO_TEXT: 'Logo',

  // 2. CẤU HÌNH CÁC ĐƯỜNG DẪN REST API (Mặc định chạy ở http://localhost:8080/api)
  API: {
    ENDPOINT_MAIN: `/${ENTITY_NAME.toLowerCase()}`,            // Ví dụ: '/shoes', '/books', '/rooms'
    ENDPOINT_SEARCH: `/${ENTITY_NAME.toLowerCase()}/search`,   // API tìm kiếm nếu đề có (GET /search)
    ENDPOINT_CATEGORY: '/categories',                          // API danh mục phân loại phụ lục
  },

  // 3. TÊN CÁC TRƯỜNG DỮ LIỆU JSON (Khớp với thuộc tính Backend đề thi trả về)
  FIELDS: {
    ID: 'id',                               // ID bản ghi ('id', 'shoesId', 'bookId'...)
    NAME: 'name',                           // Tên thực thể ('name', 'title', 'shoesName'...)
    CATEGORY: 'category',                   // Tên danh mục ('category', 'categoryName', 'type'...)
    CATEGORY_ID: 'categoryId',              // ID danh mục nếu gửi ID ('categoryId', 'typeId'...)
    MANUFACTURER: 'manufacturer',           // Hãng/Nhà sản xuất/Tác giả ('manufacturer', 'author', 'brand'...)
    PRICE: 'price',                         // Giá tiền/Lương/Điểm ('price', 'salary', 'cost'...)
    PROD_DATE: 'productionDate',             // Ngày 1: Ngày tạo/Sản xuất/Bắt đầu ('productionDate', 'createDate'...)
    IMPORT_DATE: 'importDate',               // Ngày 2: Ngày nhập/Cập nhật/Kết thúc ('importDate', 'updateDate'...)
    STATUS: 'status',                       // Trạng thái nếu đề có
    DESCRIPTION: 'description',             // Mô tả chi tiết nếu đề có
  },

  // 4. TIÊU ĐỀ & NHÃN HIỂN THỊ (Tự động biến đổi theo ENTITY_NAME)
  LABELS: {
    PAGE_LIST_TITLE: `${ENTITY_NAME} List`,
    PAGE_ADD_TITLE: `Add New ${ENTITY_NAME}`,
    PAGE_DETAIL_TITLE: 'VIEW DETAILS',
    PAGE_CONFIRM_TITLE: 'Confirmation',

    COL_INDEX: '#',
    COL_NAME: `${ENTITY_NAME} Name`,
    COL_CATEGORY: 'Category',
    COL_MANUFACTURER: 'Manufacturer',
    COL_PRICE: 'Price(đ)',
    COL_PROD_DATE: 'Production date',
    COL_IMPORT_DATE: 'Import Date',
    COL_ACTION: 'Action',

    BTN_FILTER: 'Filter',
    BTN_ADD_NEW: 'Add New',
    BTN_SAVE: 'Save',
    BTN_BACK: 'Back',
    BTN_BACK_VN: 'Quay Lai',
    BTN_YES: 'Yes',
    BTN_CLOSE: 'Close',
    BTN_DELETE: 'Delete',
    BTN_VIEW: 'View',
  },

  // 5. CÁC CÂU THÔNG BÁO CHUẨN CỦA ĐỀ THI
  MESSAGES: {
    NO_RECORDS_FOUND: 'No records found',
    DELETE_SUCCESS: 'Deleted successfully',
    CREATE_SUCCESS: `Created new ${ENTITY_NAME.toLowerCase()} successfully`,
    UPDATE_SUCCESS: 'Updated successfully',
    DELETE_CONFIRM: (name) =>
      `Are you sure you want to delete ${ENTITY_NAME.toLowerCase()} "${name}"?`,
  },

  // 6. LUẬT KIỂM TRA DỮ LIỆU (VALIDATION RULES DỄ DÀNG BẬT/TẮT HOẶC CHỈNH GIÁ TRỊ)
  VALIDATION: {
    NAME_MAX_LENGTH: 100,
    NAME_NO_DUPLICATE: true,               // Bật/tắt kiểm tra trùng tên

    PRICE_REQUIRED: true,
    PRICE_MIN: 0,                         // > 0
    PRICE_MAX: 10000,                     // < 10000
    PRICE_MAX_LENGTH: 5,

    MANUFACTURER_MAX_LENGTH: 100,
    DATE_FORMAT_REGEX: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, // dd/MM/yyyy
  },

  // 7. CẤU HÌNH PHÂN TRANG (PAGINATION)
  PAGINATION: {
    PAGE_SIZE: 5,
  },
};
