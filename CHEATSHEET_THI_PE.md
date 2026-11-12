# 🏆 CẨM NANG THI PE REACT (SBA301) - PHIÊN BẢN TƯỜNG MINH & DỄ DÙNG NHẤT

> **Điểm nổi bật của bản template này:**
> 1. **KHÔNG DÙNG VÒNG LẶP / MAP ĐỘNG ĐỂ SINH CỘT HOẶC FORM**: Mọi cột ở `ListPage`, dòng ở `DetailPage`, ô nhập ở `AddPage`/`EditPage` đều được viết **thẳng bằng JSX**. Người mới học React chỉ cần nhìn vào là sửa được ngay, không sợ bị rối.
> 2. **DỄ DÀNG GHÉP BIẾN TỪ SERVER**: Muốn ghép `priceFrom - priceTo` hay bất kỳ biểu thức nào, chỉ cần gõ thẳng `{item.priceFrom} - {item.priceTo}`.
> 3. **CONFIRMATION MODAL ĐƠN GIẢN**: Dùng text mặc định rõ ràng, chỉ cần truyền `itemName` hoặc sửa chữ trực tiếp trong file.
> 4. **BỘ VALIDATION `V` SIÊU MẠNH**: Ghép luật 1 dòng bằng toán tử `||` hoặc dùng Object rules như `sba-pe`, hỗ trợ cả so sánh 2 trường (`priceTo > priceFrom`), check tuổi `minAge`, cấm trùng lặp loại trừ ID khi sửa.

---

## 1. 📋 THÊM / SỬA CỘT Ở `ListPage.jsx` (KHÔNG DÙNG FOR / MAP)

Mở file [src/pages/ListPage.jsx](file:///src/pages/ListPage.jsx):

### Bước 1: Thêm thẻ `<th>` vào tiêu đề bảng:
```jsx
<thead>
  <tr style={{ backgroundColor: '#cfe2ff' }}>
    <th style={{ width: '60px' }}>#</th>
    <th>{CONFIG.ENTITY_NAME} Name</th>
    <th>Category</th>
    <th>Manufacturer</th>
    <th>Price(đ)</th>

    {/* 💡 THÊM CỘT MỚI TẠI ĐÂY (Ví dụ cột Range Price hoặc bất kỳ): */}
    <th>Price Range(đ)</th>

    <th style={{ width: '180px' }}>Action</th>
  </tr>
</thead>
```

### Bước 2: Thêm thẻ `<td>` tương ứng trong phần duyệt dữ liệu:
```jsx
{items.map((item, index) => {
  return (
    <tr key={index}>
      <td>{index + 1}</td>
      <td className="text-start fw-medium">{item.shoesName || item.name}</td>
      <td>{item.category?.categoryName || item.category}</td>
      <td>{item.manufacturer}</td>
      <td>{Number(item.price).toLocaleString()}</td>

      {/* 💡 GHÉP BIẾN TRỰC TIẾP TỪ SERVER (priceFrom - priceTo): */}
      <td className="fw-semibold text-primary">
        {Number(item.priceFrom).toLocaleString()} - {Number(item.priceTo).toLocaleString()}
      </td>

      <td>
        <span role="button" onClick={() => handleOpenDeleteDialog(item)}>Delete</span> | 
        <Link to={`/view/${item.id}`}>View</Link> | 
        <Link to={`/edit/${item.id}`}>Edit</Link>
      </td>
    </tr>
  );
})}
```
*(Nếu thêm cột, nhớ tăng `colSpan` ở dòng Loading và "No records found" từ 6 lên 7).*

---

## 2. 🔍 HIỂN THỊ CHI TIẾT Ở `DetailPage.jsx`

Mở file [src/pages/DetailPage.jsx](file:///src/pages/DetailPage.jsx):
Mọi thông tin được viết tường minh theo từng `<Row>` `<Col>`:

```jsx
{/* Hiển thị trường đơn */}
<Row className="mb-2">
  <Col xs={5} className="text-end fw-medium text-secondary">Manufacturer:</Col>
  <Col xs={7} className="text-dark">{item?.manufacturer}</Col>
</Row>

{/* 💡 Ghép 2 biến từ server (priceFrom - priceTo): */}
<Row className="mb-2">
  <Col xs={5} className="text-end fw-medium text-secondary">Price Range (đ):</Col>
  <Col xs={7} className="text-dark fw-bold text-primary">
    {formatNumber(item?.priceFrom)} - {formatNumber(item?.priceTo)}
  </Col>
</Row>

{/* Định dạng ngày dd/mm/yyyy: */}
<Row className="mb-2">
  <Col xs={5} className="text-end fw-medium text-secondary">Production Date:</Col>
  <Col xs={7} className="text-dark">{formatDate(item?.productionDate)}</Col>
</Row>
```

---

## 3. 🛡️ BỘ VALIDATION `V` SIÊU TỐC (`src/utils/validator.js`)

Trong [src/pages/AddPage.jsx](file:///src/pages/AddPage.jsx) và [src/pages/EditPage.jsx](file:///src/pages/EditPage.jsx), hàm `validateForm()` sử dụng cú pháp nối luật bằng dấu `||`:

```javascript
const validateForm = () => {
  const newErrors = {};

  // 1. Tên bắt buộc + Cấm trùng lặp (Khi edit truyền thêm id để không tự bắt trùng chính nó)
  newErrors.name =
    V.required(formData.name, 'Name') ||
    V.noDuplicate(formData.name, existingItems, 'shoesName', 'Shoes', id);

  // 2. Email bắt buộc + Đúng định dạng
  newErrors.email = V.required(formData.email, 'Email') || V.email(formData.email);

  // 3. Giá tiền bắt buộc + Là số dương (> 0) + Nằm trong khoảng 10.000 đến 50.000.000
  newErrors.price = 
    V.required(formData.price, 'Price') || 
    V.positive(formData.price, 'Price') ||
    V.range(formData.price, 10000, 50000000, 'Price');

  // 4. So sánh 2 biến (Price To phải lớn hơn Price From):
  if (formData.priceFrom && formData.priceTo) {
    newErrors.priceTo = V.compare(
      formData.priceTo,
      formData.priceFrom,
      '>',
      'Price To must be strictly greater than Price From.'
    );
  }

  // 5. Ngày sản xuất bắt buộc + Đúng format dd/MM/yyyy
  newErrors.productionDate =
    V.required(formData.productionDate, 'Production Date') ||
    V.date(formData.productionDate, 'Production Date');

  // 6. Độ tuổi tối thiểu (Ví dụ nhân viên phải từ 18 tuổi trở lên):
  newErrors.dob = V.required(formData.dob, 'Date of birth') || V.date(formData.dob) || V.minAge(formData.dob, 18);

  // Dọn dẹp lỗi null
  Object.keys(newErrors).forEach((key) => {
    if (!newErrors[key]) delete newErrors[key];
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Bảng tra cứu các luật có sẵn của `V`:
| Hàm kiểm tra | Điều kiện kiểm tra | Ví dụ áp dụng |
| :--- | :--- | :--- |
| **`V.required(val, name)`** | Bắt buộc nhập, không để trống | `V.required(formData.name, 'Name')` |
| **`V.email(val, name)`** | Định dạng email `user@domain.ext` | `V.email(formData.email)` |
| **`V.date(val, name, format)`**| Chuẩn `dd/MM/yyyy` (hoặc `yyyy-MM-dd`) và ngày có thật | `V.date(formData.dob)` |
| **`V.minAge(val, age, name)`** | Ngày sinh phải đủ số tuổi tối thiểu | `V.minAge(formData.dob, 18)` |
| **`V.positive(val, name)`** | Số dương `> 0` | `V.positive(formData.price)` |
| **`V.integer(val, name)`** | Số nguyên không có phần thập phân | `V.integer(formData.quantity)` |
| **`V.range(val, min, max)`** | Khoảng giá trị `min <= x <= max` | `V.range(formData.price, 0, 1000)` |
| **`V.phone(val, name)`** | 10 chữ số bắt đầu bằng số `0` | `V.phone(formData.phone)` |
| **`V.maxLen(val, max)`** | Chiều dài chuỗi tối đa | `V.maxLen(formData.desc, 255)` |
| **`V.minLen(val, min)`** | Chiều dài chuỗi tối thiểu | `V.minLen(formData.code, 3)` |
| **`V.noDuplicate(...)`** | Cấm trùng (hỗ trợ bỏ qua `currentId` khi edit) | `V.noDuplicate(name, items, field, entity, id)` |
| **`V.compare(v1, v2, op, msg)`**| So sánh giữa 2 trường (`>`, `>=`, `<`, `<=`, `!=`, `==`) | `V.compare(priceTo, priceFrom, '>')` |
| **`V.validate(val, rules)`** | Kiểu Object rules như `sba-pe` | `V.validate(val, { required: true, email: true })` |

---

## 4. 🗑️ MODAL XÁC NHẬN XÓA (`ConfirmationModal.jsx`)

File [src/components/ConfirmationModal.jsx](file:///src/components/ConfirmationModal.jsx) đã dùng **text mặc định tĩnh**, không phụ thuộc config:
- Tiêu đề mặc định: `"Confirmation"`
- Câu hỏi mặc định: `Are you sure you want to delete "${itemName}"?`
- Hai nút: `[ Yes ]` và `[ Close ]`

Khi gọi ở `ListPage.jsx`:
```jsx
<ConfirmationModal
  show={deleteModalShow}
  itemName={itemToDelete?.shoesName || itemToDelete?.name || ''}
  onClose={() => setDeleteModalShow(false)}
  onConfirm={handleConfirmDelete}
  loading={actionLoading}
/>
```
*(Nếu đề yêu cầu câu hỏi khác, bạn có thể truyền trực tiếp prop `message="Bạn có chắc chắn muốn xóa..."` hoặc sửa trực tiếp trong file `ConfirmationModal.jsx`!)*
