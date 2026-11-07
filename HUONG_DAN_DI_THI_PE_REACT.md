# BÍ KÍP ĐI THI PE REACT - TUÂN THỦ 100% QUY TẮC PHÒNG THI EOS (SECTION B.3)

Tài liệu này đối chiếu **từng mục một** theo đúng bảng quy chế thi thực hành **Section B.3 Project structure requirements** của Đại học FPT.

---

## 📋 BẢNG ĐỐI CHIẾU 100% QUY CHẾ PHÒNG THI (SECTION B.3)

| Mục | Quy định trong đề thi PE | Trạng thái trong Template | Cách thực hiện |
| :---: | :--- | :---: | :--- |
| **3.1** | Tên thư mục theo định dạng:<br>`<ClassName>_<StudentID>_<ProjectCode>_PE` | ✅ Đã cấu hình sẵn | Khi nộp bài, đổi tên folder thành: Ví dụ: `SE1910_CE190709_SBA301_PE` |
| **3.2** | React JS, React-bootstrap, Vite, JavaScript trên NodeJS | ✅ Đã cài đặt chuẩn | Sử dụng đúng React + React-Bootstrap + Vite |
| **3.3** | Dùng: React JS, React-Router-DOM, React-Bootstrap, axios, Vite.<br>⚠️ **LƯU Ý: KHÔNG ĐƯỢC DÙNG THƯ VIỆN KHÁC** | ✅ TUÂN THỦ TUYỆT ĐỐI | Trong `package.json` **CHỈ CÓ ĐÚNG 5 THƯ VIỆN NÀY**, không có thư viện lạ nào (không lucide-react, không font-awesome, không redux) |
| **3.4** | Tên component & thuộc tính đặt theo đề | ✅ Dễ dàng tùy biến | Chỉ cần đổi 6 dòng trong `CONFIG` ở file `MasterCrudPage.jsx` |
| **3.5** | Nén file zip nộp lên hệ thống EOS | ✅ Đã tối ưu | **XÓA THƯ MỤC `node_modules` TRƯỚC KHI NÉN ZIP** để file nhẹ và đúng chuẩn EOS |
| **3.6** | Kết nối REST API chạy tại **cổng 8080** | ✅ Đã cấu hình sẵn | Trong `src/api.js`: `BASE_URL = 'http://localhost:8080/api'` |
| **3.7** | Địa chỉ truy cập ứng dụng là **http://localhost:5173/** | ✅ Đã cấu hình sẵn | Trong `vite.config.js`: `port: 5173, strictPort: true` |
| **3.8** | Thư mục dự án BẮT BUỘC có file **`jsconfig.json`** | ✅ Đã tạo sẵn | Nội dung file `jsconfig.json` chuẩn 100% theo đề bài |

---

## ⚡ 3 BƯỚC LÀM BÀI TRONG PHÒNG THI (3 PHÚT LÀ XONG FULL TÍNH NĂNG)

### 🔹 Bước 1: Khởi động Backend của đề bài (chạy ở cổng 8080)
- Kiểm tra Backend đề bài cấp đang chạy tại cổng `8080`.
- File `src/api.js` đã trỏ sẵn vào `http://localhost:8080/api`.

### 🔹 Bước 2: Xem tên thuộc tính dữ liệu của đề bài
Gọi thử API GET (Ví dụ: `http://localhost:8080/api/rooms` hoặc `/products`), xem JSON trả về tên các trường là gì.

### 🔹 Bước 3: Mở `src/MasterCrudPage.jsx` đổi 6 dòng `CONFIG`
```javascript
export const CONFIG = {
  API_ENDPOINT: '/rooms',              // Đổi thành: '/products', '/employees', '/students'...
  FIELD_ID: 'roomId',                  // Đổi thành: 'id', 'productId', 'studentId'...
  FIELD_NAME: 'roomNumber',            // Đổi thành: 'name', 'productName', 'fullName'...
  FIELD_CATEGORY: 'roomType',          // Đổi thành: 'category', 'department', 'major'...
  FIELD_PRICE: 'roomPricePerDay',      // Đổi thành: 'price', 'salary', 'gpa'...
  FIELD_STATUS: 'roomStatus',          // Đổi thành: 'status', 'active'...
  FIELD_DESC: 'roomDetailDescription', // Đổi thành: 'description', 'notes'...
};
```

---

## 🎁 CÁC TÍNH NĂNG TỰ ĐỘNG CÓ SẴN (ĐẠT ĐIỂM TỐI ĐA):
1. **Hiển thị danh sách từ API (Read)**: Dùng component `<Table striped hover bordered>` của `react-bootstrap`.
2. **Tìm kiếm thời gian thực (Search)**: Gõ từ khóa lọc theo tên/mô tả ngay lập tức.
3. **Lọc theo Danh mục & Trạng thái (Filter)**: 2 dropdown chọn danh mục và Active/Inactive.
4. **Sắp xếp theo giá (Sort)**: Tăng dần ⬆️ / Giảm dần ⬇️.
5. **Chọn 1 ô (Radio single select)**: Bấm chọn 1 ô thì dòng đó đổi màu vàng nổi bật và hiện thông báo ID đang chọn.
6. **Chọn NHIỀU ô (Checkbox multi-select)**:
   - Checkbox từng dòng.
   - Checkbox "Chọn tất cả" trên đầu bảng.
   - Nút **"🗑️ Xóa các mục đã chọn" (Bulk Delete)** tự động hiện ra khi có checkbox được tích!
7. **Thêm mới (Create)**: Dùng component `<Modal>` của `react-bootstrap` nhập liệu và gọi `POST`.
8. **Chỉnh sửa (Update)**: Nút "✏️ Sửa" mở Modal tự điền dữ liệu cũ và gọi `PUT`.
9. **Xóa (Delete)**: Nút "🗑️ Xóa" có hộp thoại xác nhận `window.confirm` và gọi `DELETE`.
10. **Thông báo (Alert)**: Dùng component `<Alert>` của `react-bootstrap` tự tắt sau 3.5 giây.
11. **Điều hướng (Routing)**: Sử dụng chuẩn `react-router-dom` với `<BrowserRouter>`, `<Routes>`, `<Route>`.

---

## 📦 HƯỚNG DẪN NỘP BÀI LÊN HỆ THỐNG EOS:
1. Đổi tên thư mục dự án theo mã sinh viên của bạn:  
   `<Lớp>_<MSSV>_<MãMôn>_PE`  
   *(Ví dụ: `SE1910_CE190709_SBA301_PE`)*
2. **Xóa thư mục `node_modules`** (Để file zip nhẹ < 5MB theo yêu cầu của EOS).  
   *(Lưu ý: Hệ thống chấm bài của trường đã có sẵn `node_modules` ở thư mục cha theo cấu hình trong `jsconfig.json`).*
3. Nén thư mục thành file `.zip`.
4. Upload file zip lên phần mềm thi EOS và bấm Submit!
