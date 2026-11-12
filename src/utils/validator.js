/**
 * ====================================================================================
 * 🛡️ BỘ VALIDATION SIÊU MẠNH & TOÀN DIỆN CHO PE REACT (SBA301)
 * ------------------------------------------------------------------------------------
 * Hỗ trợ 2 CÁCH DÙNG LINH HOẠT NHẤT:
 * 
 * 🟢 CÁCH 1: Ghép luật 1 dòng siêu nhanh bằng dấu || (Khuyên dùng trong phòng thi):
 *    newErrors.email = V.required(val, 'Email') || V.email(val);
 *    newErrors.price = V.required(val, 'Price') || V.positive(val) || V.range(val, 0, 10000);
 *    newErrors.dob   = V.required(val, 'Date') || V.date(val) || V.minAge(val, 18);
 *    newErrors.name  = V.required(val, 'Name') || V.noDuplicate(val, items, 'name', currentId);
 *    newErrors.range = V.compare(formData.priceTo, formData.priceFrom, '>', 'Price To must be greater than Price From.');
 * 
 * 🔵 CÁCH 2: Dùng cấu hình Object Rules (như sba-pe):
 *    newErrors.email = V.validate(val, { required: true, email: true, name: 'Email' });
 * ====================================================================================
 */

export const V = {
  // 1. BẮT BUỘC NHẬP (NOT EMPTY)
  required: (val, fieldName = 'This field') => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return `${fieldName} is mandatory and cannot be empty.`;
    }
    return null;
  },

  // 2. EMAIL (abc@xyz.com)
  email: (val, fieldName = 'Email') => {
    if (!val || String(val).trim() === '') return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(String(val).trim())) {
      return `${fieldName} is invalid email format.`;
    }
    return null;
  },

  // 3. NGÀY THÁNG (Format dd/MM/yyyy hoặc yyyy-MM-dd)
  date: (val, fieldName = 'Date', format = 'dd/MM/yyyy') => {
    if (!val || String(val).trim() === '') return null;
    const str = String(val).trim();

    let day, month, year;
    if (format === 'dd/MM/yyyy') {
      const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return `${fieldName} must follow format dd/MM/yyyy (e.g. 20/01/2025).`;
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
    } else {
      const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return `${fieldName} must follow format yyyy-MM-dd.`;
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    }

    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
      return `${fieldName} is an invalid calendar date.`;
    }
    return null;
  },

  // 4. KIỂM TRA ĐỘ TUỔI TỐI THIỂU (Ví dụ nhân viên phải đủ 18 tuổi)
  minAge: (val, minAgeYears = 18, fieldName = 'Age') => {
    if (!val) return null;
    let d;
    if (String(val).includes('/')) {
      const parts = String(val).split('/');
      d = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      d = new Date(val);
    }
    if (isNaN(d.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    if (age < minAgeYears) {
      return `${fieldName} must be at least ${minAgeYears} years old.`;
    }
    return null;
  },

  // 5. SỐ DƯƠNG (> 0)
  positive: (val, fieldName = 'Value') => {
    if (val === undefined || val === null || String(val).trim() === '') return null;
    const num = Number(val);
    if (isNaN(num)) return `${fieldName} must be a valid number.`;
    if (num <= 0) return `${fieldName} must be greater than 0.`;
    return null;
  },

  // 6. SỐ NGUYÊN (Integer)
  integer: (val, fieldName = 'Value') => {
    if (val === undefined || val === null || String(val).trim() === '') return null;
    const num = Number(val);
    if (isNaN(num) || !Number.isInteger(num)) {
      return `${fieldName} must be an integer number.`;
    }
    return null;
  },

  // 7. KHOẢNG GIÁ TRỊ (min <= val <= max hoặc exclusive)
  range: (val, min = 1000, max = 1000000, fieldName = 'Value', exclusive = false) => {
    if (val === undefined || val === null || String(val).trim() === '') return null;
    const num = Number(val);
    if (isNaN(num)) return `${fieldName} must be a number.`;
    if (exclusive) {
      if (num <= min || num >= max) {
        return `${fieldName} must be greater than ${min} and less than ${max}.`;
      }
    } else {
      if (num < min || num > max) {
        return `${fieldName} must be between ${min} and ${max}.`;
      }
    }
    return null;
  },

  // 8. SỐ ĐIỆN THOẠI (9-11 chữ số)
  phone: (val, fieldName = 'Phone') => {
    if (!val || String(val).trim() === '') return null;
    const digits = String(val).replace(/\D/g, '');
    if (digits.length < 9 || digits.length > 11) {
      return `${fieldName} must contain only digits (9-11 characters).`;
    }
    return null;
  },

  // 9. ĐỘ DÀI TỐI ĐA (Max Length)
  maxLen: (val, max = 100, fieldName = 'This field') => {
    if (!val) return null;
    if (String(val).length > max) {
      return `${fieldName} must not exceed ${max} characters.`;
    }
    return null;
  },

  // 10. ĐỘ DÀI TỐI THIỂU (Min Length)
  minLen: (val, min = 3, fieldName = 'This field') => {
    if (!val) return null;
    if (String(val).length < min) {
      return `${fieldName} must be at least ${min} characters.`;
    }
    return null;
  },

  // 11. CẤM TRÙNG LẶP THÔNG MINH (Hỗ trợ cả Create lẫn Edit loại trừ ID hiện tại)
  noDuplicate: (val, list = [], matchField = 'name', entityTitle = 'Value', currentId = null, idFieldName = 'id') => {
    if (!val || !list || list.length === 0) return null;
    const searchVal = String(val).trim().toLowerCase();
    const isDup = list.some((item) => {
      // Khi đang Edit: bỏ qua bản ghi hiện tại đang sửa
      if (currentId !== null && currentId !== undefined) {
        const itemId = item[idFieldName] || item.id || item.shoesId || item.employeeId;
        if (String(itemId) === String(currentId)) return false;
      }
      const existing = String(item[matchField] || item.name || item.fullName || item.shoesName || '').trim().toLowerCase();
      return existing === searchVal;
    });
    if (isDup) {
      return `${entityTitle} "${val}" already exists. Duplicate is not allowed.`;
    }
    return null;
  },

  // 12. SO SÁNH GIỮA 2 TRƯỜNG (Cross-field Validation - VD: priceTo > priceFrom)
  compare: (val1, val2, operator = '>', message = 'Invalid comparison') => {
    if (val1 === undefined || val1 === '' || val2 === undefined || val2 === '') return null;
    const num1 = Number(val1);
    const num2 = Number(val2);

    if (operator === '>') {
      if (!(num1 > num2)) return message;
    } else if (operator === '>=') {
      if (!(num1 >= num2)) return message;
    } else if (operator === '<') {
      if (!(num1 < num2)) return message;
    } else if (operator === '<=') {
      if (!(num1 <= num2)) return message;
    } else if (operator === '!=') {
      if (val1 === val2) return message;
    }
    return null;
  },

  // 13. CÁCH 2: VALIDATE THEO CẤU HÌNH OBJECT (DÀNH CHO AI THÍCH VIẾT DẠNG RULE OBJECT)
  validate: (val, rules = {}) => {
    const fieldTitle = rules.name || rules.fieldTitle || rules.title || 'This field';
    if (rules.required) {
      const err = V.required(val, fieldTitle);
      if (err) return rules.requiredMessage || err;
    }
    if (!val && val !== 0) return null;

    if (rules.email) {
      const err = V.email(val, fieldTitle);
      if (err) return rules.emailMessage || err;
    }
    if (rules.date) {
      const err = V.date(val, fieldTitle, rules.dateFormat || 'dd/MM/yyyy');
      if (err) return rules.dateMessage || err;
    }
    if (rules.positive) {
      const err = V.positive(val, fieldTitle);
      if (err) return rules.positiveMessage || err;
    }
    if (rules.integer) {
      const err = V.integer(val, fieldTitle);
      if (err) return rules.integerMessage || err;
    }
    if (rules.phone) {
      const err = V.phone(val, fieldTitle);
      if (err) return rules.phoneMessage || err;
    }
    if (rules.minLen !== undefined) {
      const err = V.minLen(val, rules.minLen, fieldTitle);
      if (err) return err;
    }
    if (rules.maxLen !== undefined) {
      const err = V.maxLen(val, rules.maxLen, fieldTitle);
      if (err) return err;
    }
    if (rules.min !== undefined || rules.max !== undefined) {
      const err = V.range(val, rules.min ?? 0, rules.max ?? 10000, fieldTitle, rules.exclusive);
      if (err) return rules.rangeMessage || err;
    }
    if (rules.pattern) {
      if (!rules.pattern.test(String(val))) {
        return rules.patternMessage || `${fieldTitle} is invalid format.`;
      }
    }
    return null;
  },
};
