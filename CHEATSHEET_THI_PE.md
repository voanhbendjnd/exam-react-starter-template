# 📌 CHEATSHEET PE REACT: BỘ LUẬT VALIDATE SIÊU TỐC (CHỈ 1 DÒNG GHÉP LUẬT BẰNG `||`)

Hệ thống đã tích hợp sẵn bộ kiểm tra dữ liệu **`V` (Validator)** ngay trong `src/utils/validator.js`.
Khi bạn muốn kiểm tra bất kỳ trường nào, chỉ cần **viết 1 dòng duy nhất và ghép các luật bằng dấu `||`**:

---

## ⚡ CÚ PHÁP THẦN THÁNH: `V.luat1(...) || V.luat2(...)`

Trong hàm `validateForm()` của [src/pages/AddPage.jsx](file:///src/pages/AddPage.jsx) hoặc `EditPage.jsx`:

```javascript
// 👉 Ví dụ 1: Email VỪA BẮT BUỘC, VỪA ĐÚNG ĐỊNH DẠNG EMAIL:
newErrors.email = V.required(formData.email, 'Email') || V.email(formData.email);

// 👉 Ví dụ 2: Giá tiền VỪA BẮT BUỘC, VỪA LÀ SỐ DƯƠNG (> 0), VỪA NHỎ HƠN 10000:
newErrors.price = V.required(formData.price, 'Price') || V.positive(formData.price) || V.range(formData.price, 0, 10000);

// 👉 Ví dụ 3: Ngày sinh VỪA BẮT BUỘC, VỪA ĐÚNG ĐỊNH DẠNG DD/MM/YYYY:
newErrors.dob = V.required(formData.dob, 'Date of birth') || V.date(formData.dob);

// 👉 Ví dụ 4: Tên VỪA BẮT BUỘC, VỪA CẤM TRÙNG LẶP (No duplicate):
newErrors.name = V.required(formData.name, 'Name') || V.noDuplicate(formData.name, existingItems, 'fieldName');

// 👉 Ví dụ 5: Số điện thoại (Optional: không bắt buộc, nhưng nếu nhập thì phải đúng 10 số):
newErrors.phone = V.phone(formData.phone);
```

---

## 📋 BẢNG TRA CỨU TẤT CẢ CÁC LUẬT CỦA BỘ `V`:

| Luật của `V` | Ý nghĩa & Điều kiện kiểm tra | Cách viết ví dụ |
| :--- | :--- | :--- |
| **`V.required(val, label)`** | Bắt buộc nhập, không được để trống hoặc toàn dấu cách | `V.required(formData.name, 'Tên')` |
| **`V.email(val, label)`** | Phải đúng định dạng email (`abc@xyz.com`) | `V.email(formData.email)` |
| **`V.date(val, label)`** | Phải đúng chuẩn `dd/MM/yyyy` và là ngày lịch có thật | `V.date(formData.dob, 'Ngày sinh')` |
| **`V.positive(val, label)`** | Phải là số và giá trị phải lớn hơn 0 (`> 0`) | `V.positive(formData.salary, 'Lương')` |
| **`V.range(val, min, max)`** | Phải nằm trong khoảng giữa `min` và `max` | `V.range(formData.price, 0, 10000)` |
| **`V.phone(val, label)`** | Phải là số điện thoại 10 số bắt đầu bằng số 0 | `V.phone(formData.phone)` |
| **`V.maxLen(val, max)`** | Độ dài chuỗi không được vượt quá số ký tự | `V.maxLen(formData.desc, 255)` |
| **`V.minLen(val, min)`** | Độ dài chuỗi tối thiểu | `V.minLen(formData.code, 3)` |
| **`V.noDuplicate(val, list, field)`** | Cấm trùng lặp với danh sách đã có trong database | `V.noDuplicate(val, existingItems, 'shoesName')` |

---

## 🎯 CÁCH HOẠT ĐỘNG:
Toán tử `||` trong JavaScript sẽ kiểm tra từ trái sang phải:
1. Nếu luật đầu tiên bị lỗi (ví dụ để trống) ➔ Hiện thông báo của `V.required` và dừng lại.
2. Nếu luật đầu tiên hợp lệ ➔ Chạy tiếp sang luật thứ hai (ví dụ kiểm tra định dạng email `V.email`).
3. Nếu tất cả đều hợp lệ ➔ Trả về `null` (không có lỗi).

👉 **Cực kỳ ngắn gọn, không cần viết lại `if...else` dài dòng, muốn ghép 2, 3 hay 4 luật cho 1 ô chỉ cần nối bằng dấu `||`!**
