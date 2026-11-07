# 🚀 BÍ KÍP ĐI THI PE REACT - TUÂN THỦ 100% QUY TẮC PHÒNG THI EOS (SECTION B.3)

Tài liệu này hướng dẫn cách sử dụng bộ **GENERIC STARTER TEMPLATE** đã được chuẩn hóa để **tái sử dụng cho MỌI ĐỀ THI PE** môn SBA301 (hoặc các môn Single Page Application ReactJS tương tự) mà **không bị gán cứng (hardcode) tên đề bài**.

---

## 📋 BẢNG ĐỐI CHIẾU 100% QUY CHẾ PHÒNG THI (SECTION B.3)

| Mục | Quy định trong đề thi PE | Trạng thái trong Template | Cách thực hiện |
| :---: | :--- | :---: | :--- |
| **3.1** | Tên thư mục: `<ClassName>_<StudentID>_<ProjectCode>_PE` | ✅ Đã cấu hình sẵn | Khi nộp bài, đổi tên folder thành: ví dụ `SE1910_CE190709_SMS_PE` |
| **3.2** | React JS, React-bootstrap, Vite, JavaScript trên NodeJS | ✅ Đã cài đặt chuẩn | Sử dụng đúng React + React-Bootstrap + Vite |
| **3.3** | Dùng: React JS, React-Router-DOM, React-Bootstrap, axios, Vite.<br>⚠️ **KHÔNG DÙNG THƯ VIỆN KHÁC** | ✅ TUÂN THỦ TUYỆT ĐỐI | `package.json` **CHỈ CÓ ĐÚNG 5 THƯ VIỆN NÀY**, tuyệt đối an toàn với phần mềm EOS |
| **3.4** | Tên component & thuộc tính đặt theo đề | ✅ Thiết kế Generic | Đặt tên dùng chung (`ListPage`, `DetailPage`, `AddPage`), toàn bộ text hiển thị điều khiển qua `config.js` |
| **3.5** | Nén file zip nộp lên hệ thống EOS | ✅ Đã tối ưu | **XÓA THƯ MỤC `node_modules` TRƯỚC KHI NÉN ZIP** |
| **3.6** | Kết nối REST API chạy tại **cổng 8080** | ✅ Đã cấu hình sẵn | Trong `src/api.js`: `BASE_URL = 'http://localhost:8080/api'` |
| **3.7** | Địa chỉ truy cập ứng dụng là **http://localhost:5173/** | ✅ Đã cấu hình sẵn | Trong `vite.config.js`: `port: 5173, strictPort: true` |
| **3.8** | Thư mục dự án BẮT BUỘC có file **`jsconfig.json`** | ✅ Đã tạo sẵn | Nội dung chuẩn 100% theo quy định EOS |

---

## 🏗️ CẤU TRÚC GENERIC DÙNG CHUNG (TÁI SỬ DỤNG CHO MỌI ĐỀ)

```text
src/
├── api.js                         # Axios trỏ sẵn vào http://localhost:8080/api
├── config.js                      # 🎯 TRUNG TÂM CẤU HÌNH (SỬA DUY NHẤT FILE NÀY KHI ĐI THI)
├── App.jsx                        # React Router điều hướng generic: /, /add, /view/:id
├── components/
│   ├── Header.jsx                 # Header layout: [ Logo ... Date: dd/MM/yyyy ]
│   ├── ConfirmationModal.jsx      # Modal xác nhận xóa generic (Yes / Close)
│   └── PaginationControl.jsx      # Phân trang generic (Previous 1, 2, 3 ... Next)
├── pages/
│   ├── ListPage.jsx               # Màn hình danh sách chung (Lọc, bảng, xóa, phân trang)
│   ├── DetailPage.jsx             # Màn hình xem chi tiết chung (View Details + nút Quay Lại)
│   └── AddPage.jsx                # Màn hình thêm mới chung + Hệ thống Validation linh hoạt
└── MasterCrudPage.jsx             # Màn hình dự phòng nếu đề thi yêu cầu Single-Page Modal CRUD
```

---

## ⚡ HƯỚNG DẪN 30 GIÂY KHI VÀO PHÒNG THI

Dù đề thi là Quản lý Giày (`Shoes`), Sách (`Book`), Phòng khách sạn (`Room`), Ô tô (`Car`), hay Sinh viên (`Student`), bạn **KHÔNG CẦN SỬA CODE GIAO DIỆN HAY TÊN FILE**. Chỉ cần mở **`src/config.js`**:

```javascript
// 1. ĐỔI TÊN ĐỐI TƯỢNG (Ví dụ: 'Shoes', 'Book', 'Room', 'Student'...)
const ENTITY_NAME = 'Shoes'; 

export const CONFIG = {
  ENTITY_NAME: ENTITY_NAME,

  // 2. ĐƯỜNG DẪN API THEO ĐỀ BÀI
  API: {
    ENDPOINT_MAIN: '/shoes',            // API chính (GET/POST/PUT/DELETE)
    ENDPOINT_SEARCH: '/shoes/search',   // API tìm kiếm có điều kiện (nếu đề có)
    ENDPOINT_CATEGORY: '/categories',   // API nạp dropdown danh mục phụ
  },

  // 3. TÊN CÁC TRƯỜNG TRONG JSON TRẢ VỀ TỪ BACKEND
  FIELDS: {
    ID: 'id',                           // id, shoesId, bookId...
    NAME: 'name',                       // name, shoesName, title...
    CATEGORY: 'category',               // category, categoryName, type...
    MANUFACTURER: 'manufacturer',       // manufacturer, author, brand...
    PRICE: 'price',                     // price, salary, cost...
    PROD_DATE: 'productionDate',         // productionDate, createDate...
    IMPORT_DATE: 'importDate',           // importDate, updateDate...
  },

  // 4. LUẬT VALIDATION (BẬT/TẮT THEO ĐỀ)
  VALIDATION: {
    NAME_MAX_LENGTH: 100,
    NAME_NO_DUPLICATE: true,            // true nếu đề cấm trùng tên
    PRICE_MIN: 0,                       // Giá > 0
    PRICE_MAX: 10000,                   // Giá < 10000
    DATE_FORMAT_REGEX: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, // dd/MM/yyyy
  },
};
```

---

## 🎁 TOÀN BỘ TÍNH NĂNG TỰ ĐỘNG CHẠY NGAY LẬP TỨC:
1. **Lọc dữ liệu (Filter)**: Ô tìm kiếm theo tên + dropdown danh mục + nút `Filter` (tự động thử API search hoặc fallback lọc client-side mượt mà).
2. **Phân trang (Pagination)**: Dòng đếm `Show x of y records` và thanh chuyển trang `Previous 1, 2, 3 ... Next`.
3. **Xem chi tiết (View Details)**: Màn hình chi tiết đẹp mắt với nút `Quay Lai` trở về danh sách.
4. **Thêm mới (Add New) có Full Validation**: Bắt buộc nhập, độ dài tối đa, kiểm tra trùng tên (**No duplicate**), khoảng giá, và kiểm tra định dạng ngày **dd/MM/yyyy**.
5. **Xác nhận xóa (Confirmation Dialog)**: Popup xác nhận xóa chuẩn theo layout `Yes / Close`, sau khi xóa hiện thông báo `"Deleted successfully"` và tự nạp lại danh sách.
6. **Thông báo chuẩn đề**: Khi bảng trống hiện `"No records found"`, khi thêm mới thành công hiện `"Created new ... successfully"`.
