import DOMPurify from 'dompurify';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Vietnamese phone number patterns
const VIETNAMESE_PHONE_PATTERNS = [
  /^(\+84|84|0)[1-9]\d{8}$/,  // Standard format
  /^(\+84|84|0)[1-9]\d{9}$/,  // With area code
  /^(\+84|84|0)[1-9]\d{7}$/   // Landline
];

// Vietnamese email pattern (more permissive)
const VIETNAMESE_EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Vietnamese name pattern (allows Vietnamese characters)
const VIETNAMESE_NAME_PATTERN = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s]+$/;

// Vietnamese address pattern (allows Vietnamese characters and numbers)
const VIETNAMESE_ADDRESS_PATTERN = /^[a-zA-Z0-9ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ\s,.-/]+$/;

// Vietnamese tax code pattern (10 or 13 digits)
const VIETNAMESE_TAX_CODE_PATTERN = /^\d{10}(\d{3})?$/;

// Price/currency validation (Vietnamese Dong)
const VIETNAMESE_CURRENCY_PATTERN = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$/;

// Product code patterns
const PRODUCT_CODE_PATTERN = /^[A-Z0-9-_]{3,20}$/;
const BARCODE_PATTERN = /^\d{8,13}$/;

// Inventory-related patterns
const SERIAL_NUMBER_PATTERN = /^[A-Z0-9]{8,25}$/;
const SKU_PATTERN = /^[A-Z0-9-]{6,20}$/;

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Sanitize input to prevent XSS attacks
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    // Basic HTML sanitization
    const sanitized = DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
    
    // Remove potentially dangerous characters
    return sanitized
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .trim();
  }

  // Validate single field
  validateField(value: any, rule: ValidationRule): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Sanitize if requested
    if (rule.sanitize && typeof value === 'string') {
      value = this.sanitizeInput(value);
    }

    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push('Trường này là bắt buộc');
      return { isValid: false, errors, warnings };
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return { isValid: true, errors: [], warnings };
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`Tối thiểu ${rule.minLength} ký tự`);
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`Tối đa ${rule.maxLength} ký tự`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push('Định dạng không hợp lệ');
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`Giá trị tối thiểu là ${rule.min}`);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`Giá trị tối đa là ${rule.max}`);
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult === false) {
        errors.push('Giá trị không hợp lệ');
      } else if (typeof customResult === 'string') {
        errors.push(customResult);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Validate object against schema
  validateObject(data: any, schema: ValidationSchema): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [fieldName, rule] of Object.entries(schema)) {
      const fieldValue = data[fieldName];
      const fieldResult = this.validateField(fieldValue, rule);

      if (!fieldResult.isValid) {
        fieldResult.errors.forEach(error => {
          errors.push(`${fieldName}: ${error}`);
        });
      }

      if (fieldResult.warnings) {
        fieldResult.warnings.forEach(warning => {
          warnings.push(`${fieldName}: ${warning}`);
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Specific validation methods for Vietnamese context
  validateVietnamesePhone(phone: string): ValidationResult {
    const errors: string[] = [];
    
    if (!phone) {
      errors.push('Số điện thoại là bắt buộc');
      return { isValid: false, errors };
    }

    const sanitized = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    const isValid = VIETNAMESE_PHONE_PATTERNS.some(pattern => pattern.test(sanitized));
    
    if (!isValid) {
      errors.push('Số điện thoại không hợp lệ (VD: 0901234567)');
    }

    return { isValid, errors };
  }

  validateVietnameseEmail(email: string): ValidationResult {
    const errors: string[] = [];
    
    if (!email) {
      return { isValid: true, errors }; // Email is optional in most cases
    }

    const sanitized = this.sanitizeInput(email).toLowerCase();
    
    if (!VIETNAMESE_EMAIL_PATTERN.test(sanitized)) {
      errors.push('Email không hợp lệ (VD: example@domain.com)');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateVietnameseName(name: string): ValidationResult {
    const errors: string[] = [];
    
    if (!name) {
      errors.push('Tên là bắt buộc');
      return { isValid: false, errors };
    }

    const sanitized = this.sanitizeInput(name);
    
    if (sanitized.length < 2) {
      errors.push('Tên phải có ít nhất 2 ký tự');
    }

    if (sanitized.length > 50) {
      errors.push('Tên không được quá 50 ký tự');
    }

    if (!VIETNAMESE_NAME_PATTERN.test(sanitized)) {
      errors.push('Tên chỉ được chứa chữ cái và khoảng trắng');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateVietnameseAddress(address: string): ValidationResult {
    const errors: string[] = [];
    
    if (!address) {
      return { isValid: true, errors }; // Address might be optional
    }

    const sanitized = this.sanitizeInput(address);
    
    if (sanitized.length < 5) {
      errors.push('Địa chỉ phải có ít nhất 5 ký tự');
    }

    if (sanitized.length > 200) {
      errors.push('Địa chỉ không được quá 200 ký tự');
    }

    if (!VIETNAMESE_ADDRESS_PATTERN.test(sanitized)) {
      errors.push('Địa chỉ chứa ký tự không hợp lệ');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateVietnameseTaxCode(taxCode: string): ValidationResult {
    const errors: string[] = [];
    
    if (!taxCode) {
      return { isValid: true, errors }; // Tax code might be optional
    }

    const sanitized = taxCode.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    if (!VIETNAMESE_TAX_CODE_PATTERN.test(sanitized)) {
      errors.push('Mã số thuế không hợp lệ (10 hoặc 13 số)');
    }

    return { isValid: errors.length === 0, errors };
  }

  validatePrice(price: string | number): ValidationResult {
    const errors: string[] = [];
    
    if (price === null || price === undefined || price === '') {
      errors.push('Giá là bắt buộc');
      return { isValid: false, errors };
    }

    let numericPrice: number;
    
    if (typeof price === 'string') {
      // Handle Vietnamese currency format
      const cleaned = price.replace(/[.,]/g, '');
      numericPrice = parseFloat(cleaned);
    } else {
      numericPrice = price;
    }

    if (isNaN(numericPrice)) {
      errors.push('Giá phải là số');
      return { isValid: false, errors };
    }

    if (numericPrice < 0) {
      errors.push('Giá không được âm');
    }

    if (numericPrice > 10000000000) { // 10 billion VND
      errors.push('Giá quá lớn');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateQuantity(quantity: string | number): ValidationResult {
    const errors: string[] = [];
    
    if (quantity === null || quantity === undefined || quantity === '') {
      errors.push('Số lượng là bắt buộc');
      return { isValid: false, errors };
    }

    const numericQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

    if (isNaN(numericQuantity)) {
      errors.push('Số lượng phải là số nguyên');
      return { isValid: false, errors };
    }

    if (numericQuantity < 0) {
      errors.push('Số lượng không được âm');
    }

    if (numericQuantity > 1000000) {
      errors.push('Số lượng quá lớn');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateProductCode(code: string): ValidationResult {
    const errors: string[] = [];
    
    if (!code) {
      errors.push('Mã sản phẩm là bắt buộc');
      return { isValid: false, errors };
    }

    const sanitized = this.sanitizeInput(code).toUpperCase();
    
    if (!PRODUCT_CODE_PATTERN.test(sanitized)) {
      errors.push('Mã sản phẩm không hợp lệ (3-20 ký tự, chỉ chữ, số, dấu gạch)');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateBarcode(barcode: string): ValidationResult {
    const errors: string[] = [];
    
    if (!barcode) {
      return { isValid: true, errors }; // Barcode might be optional
    }

    const sanitized = barcode.replace(/\s+/g, '').replace(/[^\d]/g, '');
    
    if (!BARCODE_PATTERN.test(sanitized)) {
      errors.push('Mã vạch không hợp lệ (8-13 số)');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateSerialNumber(serial: string): ValidationResult {
    const errors: string[] = [];
    
    if (!serial) {
      return { isValid: true, errors }; // Serial might be optional
    }

    const sanitized = this.sanitizeInput(serial).toUpperCase();
    
    if (!SERIAL_NUMBER_PATTERN.test(sanitized)) {
      errors.push('Số serial không hợp lệ (8-25 ký tự, chỉ chữ và số)');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateSKU(sku: string): ValidationResult {
    const errors: string[] = [];
    
    if (!sku) {
      errors.push('SKU là bắt buộc');
      return { isValid: false, errors };
    }

    const sanitized = this.sanitizeInput(sku).toUpperCase();
    
    if (!SKU_PATTERN.test(sanitized)) {
      errors.push('SKU không hợp lệ (6-20 ký tự, chỉ chữ, số, dấu gạch)');
    }

    return { isValid: errors.length === 0, errors };
  }

  validatePassword(password: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!password) {
      errors.push('Mật khẩu là bắt buộc');
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }

    if (password.length > 128) {
      errors.push('Mật khẩu không được quá 128 ký tự');
    }

    if (!/[A-Z]/.test(password)) {
      warnings.push('Nên có ít nhất 1 chữ hoa');
    }

    if (!/[a-z]/.test(password)) {
      warnings.push('Nên có ít nhất 1 chữ thường');
    }

    if (!/\d/.test(password)) {
      warnings.push('Nên có ít nhất 1 chữ số');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      warnings.push('Nên có ít nhất 1 ký tự đặc biệt');
    }

    // Check for common weak passwords
    const weakPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'abc123', '123456789', 'password1', 'admin123'
    ];

    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Mật khẩu quá yếu, vui lòng chọn mật khẩu khác');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateDate(date: string): ValidationResult {
    const errors: string[] = [];
    
    if (!date) {
      return { isValid: true, errors }; // Date might be optional
    }

    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      errors.push('Ngày không hợp lệ');
      return { isValid: false, errors };
    }

    // Check if date is not in future (for birthdates, etc.)
    if (parsedDate > new Date()) {
      errors.push('Ngày không được trong tương lai');
    }

    // Check if date is not too old (reasonable limit)
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
    
    if (parsedDate < hundredYearsAgo) {
      errors.push('Ngày quá xa trong quá khứ');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Batch validation for forms
  validateCustomerForm(customerData: any): ValidationResult {
    const schema: ValidationSchema = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 50,
        pattern: VIETNAMESE_NAME_PATTERN,
        sanitize: true
      },
      email: {
        required: false,
        pattern: VIETNAMESE_EMAIL_PATTERN,
        sanitize: true
      },
      phone: {
        required: true,
        custom: (value) => this.validateVietnamesePhone(value).isValid || 'Số điện thoại không hợp lệ'
      },
      address: {
        required: false,
        minLength: 5,
        maxLength: 200,
        sanitize: true
      },
      taxCode: {
        required: false,
        pattern: VIETNAMESE_TAX_CODE_PATTERN
      }
    };

    return this.validateObject(customerData, schema);
  }

  validateProductForm(productData: any): ValidationResult {
    const schema: ValidationSchema = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        sanitize: true
      },
      sku: {
        required: true,
        pattern: SKU_PATTERN,
        sanitize: true
      },
      price: {
        required: true,
        min: 0,
        max: 10000000000
      },
      quantity: {
        required: true,
        min: 0,
        max: 1000000
      },
      barcode: {
        required: false,
        pattern: BARCODE_PATTERN
      },
      description: {
        required: false,
        maxLength: 1000,
        sanitize: true
      }
    };

    return this.validateObject(productData, schema);
  }

  validateUserForm(userData: any): ValidationResult {
    const schema: ValidationSchema = {
      username: {
        required: true,
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_]+$/,
        sanitize: true
      },
      email: {
        required: true,
        pattern: VIETNAMESE_EMAIL_PATTERN,
        sanitize: true
      },
      password: {
        required: true,
        minLength: 8,
        maxLength: 128,
        custom: (value) => this.validatePassword(value).isValid || 'Mật khẩu không đủ mạnh'
      },
      role: {
        required: true,
        custom: (value) => ['admin', 'manager', 'staff', 'user'].includes(value) || 'Vai trò không hợp lệ'
      }
    };

    return this.validateObject(userData, schema);
  }

  // SQL injection prevention
  sanitizeSQL(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '')
      .replace(/--/g, '')
      .replace(/\/\*/g, '')
      .replace(/\*\//g, '')
      .replace(/xp_/gi, '')
      .replace(/sp_/gi, '')
      .replace(/exec/gi, '')
      .replace(/execute/gi, '')
      .replace(/select/gi, '')
      .replace(/insert/gi, '')
      .replace(/update/gi, '')
      .replace(/delete/gi, '')
      .replace(/drop/gi, '')
      .replace(/create/gi, '')
      .replace(/alter/gi, '')
      .replace(/union/gi, '')
      .trim();
  }

  // Rate limiting helpers
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxRequests) {
      return false;
    }

    record.count++;
    return true;
  }

  clearRateLimit(key: string): void {
    this.rateLimitMap.delete(key);
  }
}

// Export singleton instance
export const validationService = ValidationService.getInstance();

// Export common validation rules
export const VALIDATION_RULES = {
  VIETNAMESE_NAME: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VIETNAMESE_NAME_PATTERN,
    sanitize: true
  },
  VIETNAMESE_PHONE: {
    required: true,
    custom: (value: string) => validationService.validateVietnamesePhone(value).isValid || 'Số điện thoại không hợp lệ'
  },
  VIETNAMESE_EMAIL: {
    required: false,
    pattern: VIETNAMESE_EMAIL_PATTERN,
    sanitize: true
  },
  PRICE: {
    required: true,
    min: 0,
    max: 10000000000
  },
  QUANTITY: {
    required: true,
    min: 0,
    max: 1000000
  },
  PRODUCT_CODE: {
    required: true,
    pattern: PRODUCT_CODE_PATTERN,
    sanitize: true
  },
  SKU: {
    required: true,
    pattern: SKU_PATTERN,
    sanitize: true
  },
  PASSWORD: {
    required: true,
    minLength: 8,
    maxLength: 128,
    custom: (value: string) => validationService.validatePassword(value).isValid || 'Mật khẩu không đủ mạnh'
  }
};

export default validationService;