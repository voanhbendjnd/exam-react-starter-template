/**
 * ====================================================================================
 * 🛡️ BỘ CÔNG CỤ VALIDATOR SIÊU TỐC CHO PHÒNG THI PE REACT
 * ------------------------------------------------------------------------------------
 * 👉 CÁCH DÙNG: Ghép các luật tùy ý chỉ trong 1 dòng bằng dấu ||
 * Ví dụ:
 *    newErrors.email = V.required(val, 'Email') || V.email(val);
 *    newErrors.price = V.required(val, 'Price') || V.positive(val) || V.range(val, 0, 10000);
 *    newErrors.dob   = V.required(val, 'Date') || V.date(val);
 *    newErrors.name  = V.required(val, 'Name') || V.noDuplicate(val, list, 'fieldName');
 * ====================================================================================
 */

export const V = {
  // 1. BẮT BUỘC NHẬP (NOT EMPTY)
  required: (val, label = 'This field') => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return `${label} is mandatory and cannot be empty.`;
    }
    return null;
  },

  // 2. ĐỊNH DẠNG EMAIL (Nếu có nhập thì phải đúng format abc@xyz.com)
  email: (val, label = 'Email') => {
    if (!val || String(val).trim() === '') return null; // Nếu rỗng thì bỏ qua (dành cho optional)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(String(val).trim())) {
      return `${label} is not a valid email address.`;
    }
    return null;
  },

  // 3. ĐỊNH DẠNG NGÀY THÁNG DD/MM/YYYY
  date: (val, label = 'Date') => {
    if (!val || String(val).trim() === '') return null;
    const str = String(val).trim();
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!regex.test(str)) {
      return `${label} must follow format dd/MM/yyyy (e.g. 20/01/2025).`;
    }

    const parts = str.split('/');
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    const dateObj = new Date(y, m - 1, d);

    if (
      dateObj.getFullYear() !== y ||
      dateObj.getMonth() !== m - 1 ||
      dateObj.getDate() !== d
    ) {
      return `${label} is an invalid calendar date.`;
    }
    return null;
  },

  // 4. SỐ DƯƠNG (> 0)
  positive: (val, label = 'Value') => {
    if (val === undefined || val === null || String(val).trim() === '') return null;
    const num = Number(val);
    if (isNaN(num)) {
      return `${label} must be a valid number.`;
    }
    if (num <= 0) {
      return `${label} must be greater than 0.`;
    }
    return null;
  },

  // 5. KHOẢNG GIÁ TRỊ (min < val < max)
  range: (val, min = 0, max = 10000, label = 'Value') => {
    if (val === undefined || val === null || String(val).trim() === '') return null;
    const num = Number(val);
    if (isNaN(num)) return `${label} must be a number.`;
    if (num <= min || num >= max) {
      return `${label} must be greater than ${min} and less than ${max}.`;
    }
    return null;
  },

  // 6. SỐ ĐIỆN THOẠI (10 số, bắt đầu bằng 0)
  phone: (val, label = 'Phone') => {
    if (!val || String(val).trim() === '') return null;
    const regex = /^0\d{9}$/;
    if (!regex.test(String(val).trim())) {
      return `${label} must be 10 digits starting with 0 (e.g. 0901234567).`;
    }
    return null;
  },

  // 7. ĐỘ DÀI TỐI ĐA (MAX LENGTH)
  maxLen: (val, max = 100, label = 'This field') => {
    if (!val) return null;
    if (String(val).trim().length > max) {
      return `${label} cannot exceed ${max} characters.`;
    }
    return null;
  },

  // 8. ĐỘ DÀI TỐI THIỂU (MIN LENGTH)
  minLen: (val, min = 3, label = 'This field') => {
    if (!val) return null;
    if (String(val).trim().length < min) {
      return `${label} must be at least ${min} characters.`;
    }
    return null;
  },

  // 9. CẤM TRÙNG LẶP (NO DUPLICATE)
  noDuplicate: (val, list = [], fieldName = 'name', label = 'Value') => {
    if (!val || !list || list.length === 0) return null;
    const searchVal = String(val).trim().toLowerCase();
    const isDup = list.some((item) => {
      const existing = String(item[fieldName] || item.name || '').trim().toLowerCase();
      return existing === searchVal;
    });
    if (isDup) {
      return `${label} "${val}" already exists. Duplicate is not allowed.`;
    }
    return null;
  },
};

