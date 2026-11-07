/**
 * ====================================================================================
 * 🎯 TRUNG TÂM CẤU HÌNH PE REACT - FILE QUAN TRỌNG NHẤT KHI VÀO PHÒNG THI
 * ------------------------------------------------------------------------------------
 * 👉 NGUYÊN TẮC: Mở file này trước tiên khi nhận đề. Đổi các dòng dưới đây là 
 *    giao diện, bảng, form, thông báo và API tự động khớp theo đề mới!
 * ====================================================================================
 */

// 🔹 [ĐIỂM THAY ĐỔI 1]: TÊN ĐỐI TƯỢNG CỦA ĐỀ THI
// Đổi thành: 'Shoes', 'Book', 'Room', 'Product', 'Car', 'Student', 'Employee'...
const ENTITY_NAME = 'Shoes'; 

export const CONFIG = {
  ENTITY_NAME: ENTITY_NAME,
  LOGO_TEXT: 'Logo',

  // 🔹 [ĐIỂM THAY ĐỔI 2]: ĐƯỜNG DẪN CÁC REST API TỪ ĐỀ BÀI (Spring Boot port 8080)
  API: {
    // API chính (GET danh sách, POST tạo mới, DELETE xóa, PUT sửa)
    ENDPOINT_MAIN: `/${ENTITY_NAME.toLowerCase()}`,            // Ví dụ: '/shoes', '/products', '/rooms'
    
    // API tìm kiếm (nếu đề có yêu cầu GET /shoes/search?...)
    ENDPOINT_SEARCH: `/${ENTITY_NAME.toLowerCase()}/search`,
    
    // API lấy danh mục phân loại cho dropdown (ví dụ: '/categories', '/room-types'...)
    ENDPOINT_CATEGORY: '/categories',
  },

  // 🔹 [ĐIỂM THAY ĐỔI 3]: TÊN CÁC THUỘC TÍNH JSON MÀ BACKEND TRẢ VỀ
  // Nhìn vào Response mẫu của Backend hoặc Database để điền chính xác từng chữ hoa/thường:
  FIELDS: {
    ID: 'shoesId',                          // Đổi thành: 'id', 'shoesId', 'productId', 'roomId'...
    NAME: 'shoesName',                      // Đổi thành: 'name', 'shoesName', 'title', 'fullName'...
    CATEGORY: 'categoryName',               // Đổi thành: 'category', 'categoryName', 'roomType'...
    CATEGORY_ID: 'categoryId',              // Khóa ngoại ID danh mục nếu có
    MANUFACTURER: 'manufacturer',           // Đổi thành: 'manufacturer', 'brand', 'author', 'company'...
    PRICE: 'price',                         // Đổi thành: 'price', 'salary', 'fee', 'rentPrice'...
    PROD_DATE: 'productionDate',             // Ngày 1: 'productionDate', 'startDate', 'createdDate'...
    IMPORT_DATE: 'importDate',               // Ngày 2: 'importDate', 'endDate', 'updatedDate'...
    
    // 💡 MUỐN MỞ RỘNG THÊM THUỘC TÍNH MỚI (Ví dụ số lượng, trạng thái):
    QUANTITY: 'quantity',                   // Số lượng tồn kho nếu đề có
    STATUS: 'status',                       // Trạng thái nếu đề có
    DESCRIPTION: 'description',             // Mô tả nếu đề có
  },

  // 🔹 [ĐIỂM THAY ĐỔI 4]: TIÊU ĐỀ BẢNG VÀ NHÃN CỦA TỪNG CỘT
  LABELS: {
    PAGE_LIST_TITLE: `${ENTITY_NAME} List`,
    PAGE_ADD_TITLE: `Add New ${ENTITY_NAME}`,
    PAGE_EDIT_TITLE: `Edit ${ENTITY_NAME}`,
    PAGE_DETAIL_TITLE: 'VIEW DETAILS',
    PAGE_CONFIRM_TITLE: 'Confirmation',

    COL_INDEX: '#',
    COL_NAME: `${ENTITY_NAME} Name`,
    COL_CATEGORY: 'Category',
    COL_MANUFACTURER: 'Manufacturer',
    COL_PRICE: 'Price(đ)',
    COL_PROD_DATE: 'Production date',
    COL_IMPORT_DATE: 'Import Date',
    COL_QUANTITY: 'Quantity',               // Nhãn cho cột mở rộng
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
    BTN_EDIT: 'Edit',
  },

  // 🔹 [ĐIỂM THAY ĐỔI 5]: CÁC CÂU THÔNG BÁO THEO ĐÚNG ĐỀ BÀI YÊU CẦU
  MESSAGES: {
    NO_RECORDS_FOUND: 'No records found',
    DELETE_SUCCESS: 'Deleted successfully',
    CREATE_SUCCESS: `Created new ${ENTITY_NAME.toLowerCase()} successfully`,
    UPDATE_SUCCESS: 'Updated successfully',
    DELETE_CONFIRM: (name) =>
      `Are you sure you want to delete ${ENTITY_NAME.toLowerCase()} "${name}"?`,
  },

  // 🔹 [ĐIỂM THAY ĐỔI 6]: CÁC LUẬT VALIDATION (Sửa theo bảng Screen Definition)
  VALIDATION: {
    NAME_MAX_LENGTH: 100,
    NAME_NO_DUPLICATE: true,                // true = cấm trùng tên; false = cho phép trùng
    
    PRICE_REQUIRED: true,
    PRICE_MIN: 0,                          // Giá phải > 0
    PRICE_MAX: 10000,                      // Giá phải < 10000 (nếu đề không giới hạn thì để 999999999)
    PRICE_MAX_LENGTH: 5,                   // Độ dài tối đa của giá

    MANUFACTURER_MAX_LENGTH: 100,
    DATE_FORMAT_REGEX: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, // dd/MM/yyyy
  },

  // 🔹 [ĐIỂM THAY ĐỔI 7]: SỐ BẢN GHI TRÊN 1 TRANG
  PAGINATION: {
    PAGE_SIZE: 5,                           // Đề yêu cầu 5 hay 10 thì sửa ở đây
  },
};
