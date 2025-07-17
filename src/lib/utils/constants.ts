// Application Constants for ComputerPOS Pro

// Company Information
export const COMPANY_INFO = {
  NAME: 'ComputerPOS Pro',
  DESCRIPTION: 'Phần Mềm Bán Máy Tính Để Bàn & Linh Kiện',
  ADDRESS: 'Việt Nam',
  PHONE: '1900-XXX-XXX',
  EMAIL: 'support@computerpos.com',
  WEBSITE: 'https://computerpos.com',
  TAX_CODE: '0123456789',
  LOGO_URL: '/images/logo.png',
  FAVICON_URL: '/favicon.ico'
} as const;

// Currency and Locale
export const CURRENCY = {
  CODE: 'VND',
  SYMBOL: '₫',
  NAME: 'Việt Nam Đồng',
  DECIMAL_PLACES: 0,
  THOUSAND_SEPARATOR: ',',
  DECIMAL_SEPARATOR: '.',
  FORMAT: 'suffix' // prefix or suffix
} as const;

export const LOCALE = {
  LANGUAGE: 'vi',
  COUNTRY: 'VN',
  TIMEZONE: 'Asia/Ho_Chi_Minh',
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm'
} as const;

// User Roles and Permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  STAFF: 'staff',
  USER: 'user'
} as const;

export const PERMISSIONS = {
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  USERS_DELETE: 'users.delete',
  INVENTORY_READ: 'inventory.read',
  INVENTORY_WRITE: 'inventory.write',
  INVENTORY_DELETE: 'inventory.delete',
  ORDERS_READ: 'orders.read',
  ORDERS_WRITE: 'orders.write',
  ORDERS_DELETE: 'orders.delete',
  REPORTS_READ: 'reports.read',
  REPORTS_WRITE: 'reports.write',
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',
  POS_READ: 'pos.read',
  POS_WRITE: 'pos.write',
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  CUSTOMERS_DELETE: 'customers.delete',
  STAFF_READ: 'staff.read',
  STAFF_WRITE: 'staff.write',
  STAFF_DELETE: 'staff.delete',
  BUILD_READ: 'build.read',
  BUILD_WRITE: 'build.write'
} as const;

// Product Categories (PC Components)
export const PRODUCT_CATEGORIES = {
  CPU: 'cpu',
  MOTHERBOARD: 'motherboard',
  RAM: 'ram',
  GPU: 'gpu',
  STORAGE: 'storage',
  PSU: 'psu',
  CASE: 'case',
  COOLING: 'cooling',
  PERIPHERALS: 'peripherals',
  NETWORKING: 'networking',
  AUDIO: 'audio',
  ACCESSORIES: 'accessories'
} as const;

export const CATEGORY_NAMES = {
  [PRODUCT_CATEGORIES.CPU]: 'CPU (Bộ vi xử lý)',
  [PRODUCT_CATEGORIES.MOTHERBOARD]: 'Mainboard (Bo mạch chủ)',
  [PRODUCT_CATEGORIES.RAM]: 'RAM (Bộ nhớ)',
  [PRODUCT_CATEGORIES.GPU]: 'GPU (Card đồ họa)',
  [PRODUCT_CATEGORIES.STORAGE]: 'Ổ cứng (SSD/HDD)',
  [PRODUCT_CATEGORIES.PSU]: 'PSU (Nguồn máy tính)',
  [PRODUCT_CATEGORIES.CASE]: 'Case (Vỏ máy tính)',
  [PRODUCT_CATEGORIES.COOLING]: 'Tản nhiệt',
  [PRODUCT_CATEGORIES.PERIPHERALS]: 'Thiết bị ngoại vi',
  [PRODUCT_CATEGORIES.NETWORKING]: 'Thiết bị mạng',
  [PRODUCT_CATEGORIES.AUDIO]: 'Thiết bị âm thanh',
  [PRODUCT_CATEGORIES.ACCESSORIES]: 'Phụ kiện'
} as const;

// Computer Brands
export const CPU_BRANDS = {
  INTEL: 'intel',
  AMD: 'amd'
} as const;

export const GPU_BRANDS = {
  NVIDIA: 'nvidia',
  AMD: 'amd',
  INTEL: 'intel'
} as const;

export const MOTHERBOARD_BRANDS = {
  ASUS: 'asus',
  MSI: 'msi',
  GIGABYTE: 'gigabyte',
  ASROCK: 'asrock',
  BIOSTAR: 'biostar'
} as const;

export const RAM_BRANDS = {
  CORSAIR: 'corsair',
  GSKILL: 'gskill',
  KINGSTON: 'kingston',
  CRUCIAL: 'crucial',
  TEAMGROUP: 'teamgroup',
  ADATA: 'adata'
} as const;

export const STORAGE_BRANDS = {
  SAMSUNG: 'samsung',
  WD: 'wd',
  SEAGATE: 'seagate',
  CRUCIAL: 'crucial',
  KINGSTON: 'kingston',
  ADATA: 'adata'
} as const;

// Build Types
export const BUILD_TYPES = {
  GAMING: 'gaming',
  OFFICE: 'office',
  WORKSTATION: 'workstation',
  SERVER: 'server',
  BUDGET: 'budget',
  HIGH_END: 'high_end'
} as const;

export const BUILD_TYPE_NAMES = {
  [BUILD_TYPES.GAMING]: 'Gaming',
  [BUILD_TYPES.OFFICE]: 'Văn phòng',
  [BUILD_TYPES.WORKSTATION]: 'Workstation',
  [BUILD_TYPES.SERVER]: 'Server',
  [BUILD_TYPES.BUDGET]: 'Tiết kiệm',
  [BUILD_TYPES.HIGH_END]: 'Cao cấp'
} as const;

// Order Status
export const ORDER_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded'
} as const;

export const ORDER_STATUS_NAMES = {
  [ORDER_STATUS.DRAFT]: 'Nháp',
  [ORDER_STATUS.PENDING]: 'Chờ xác nhận',
  [ORDER_STATUS.CONFIRMED]: 'Đã xác nhận',
  [ORDER_STATUS.PROCESSING]: 'Đang xử lý',
  [ORDER_STATUS.SHIPPED]: 'Đã gửi hàng',
  [ORDER_STATUS.DELIVERED]: 'Đã giao hàng',
  [ORDER_STATUS.CANCELLED]: 'Đã hủy',
  [ORDER_STATUS.RETURNED]: 'Đã trả hàng',
  [ORDER_STATUS.REFUNDED]: 'Đã hoàn tiền'
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.DRAFT]: 'gray',
  [ORDER_STATUS.PENDING]: 'yellow',
  [ORDER_STATUS.CONFIRMED]: 'blue',
  [ORDER_STATUS.PROCESSING]: 'orange',
  [ORDER_STATUS.SHIPPED]: 'purple',
  [ORDER_STATUS.DELIVERED]: 'green',
  [ORDER_STATUS.CANCELLED]: 'red',
  [ORDER_STATUS.RETURNED]: 'red',
  [ORDER_STATUS.REFUNDED]: 'gray'
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  QRCODE: 'qrcode',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  INSTALLMENT: 'installment'
} as const;

export const PAYMENT_METHOD_NAMES = {
  [PAYMENT_METHODS.CASH]: 'Tiền mặt',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Chuyển khoản',
  [PAYMENT_METHODS.CREDIT_CARD]: 'Thẻ tín dụng',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Thẻ ATM',
  [PAYMENT_METHODS.QRCODE]: 'QR Code',
  [PAYMENT_METHODS.MOMO]: 'MoMo',
  [PAYMENT_METHODS.ZALOPAY]: 'ZaloPay',
  [PAYMENT_METHODS.INSTALLMENT]: 'Trả góp'
} as const;

// Customer Types
export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
  VIP: 'vip',
  WHOLESALE: 'wholesale'
} as const;

export const CUSTOMER_TYPE_NAMES = {
  [CUSTOMER_TYPES.INDIVIDUAL]: 'Cá nhân',
  [CUSTOMER_TYPES.BUSINESS]: 'Doanh nghiệp',
  [CUSTOMER_TYPES.VIP]: 'VIP',
  [CUSTOMER_TYPES.WHOLESALE]: 'Khách sỉ'
} as const;

// Inventory Status
export const INVENTORY_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
  PRE_ORDER: 'pre_order'
} as const;

export const INVENTORY_STATUS_NAMES = {
  [INVENTORY_STATUS.IN_STOCK]: 'Còn hàng',
  [INVENTORY_STATUS.LOW_STOCK]: 'Sắp hết hàng',
  [INVENTORY_STATUS.OUT_OF_STOCK]: 'Hết hàng',
  [INVENTORY_STATUS.DISCONTINUED]: 'Ngừng kinh doanh',
  [INVENTORY_STATUS.PRE_ORDER]: 'Đặt hàng trước'
} as const;

// Tax Rates (Vietnam)
export const TAX_RATES = {
  VAT: 0.1, // 10% VAT
  LUXURY_TAX: 0.2, // 20% for luxury items
  NO_TAX: 0
} as const;

// System Settings
export const SYSTEM_SETTINGS = {
  ITEMS_PER_PAGE: 20,
  MAX_FILE_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  SESSION_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  AUTO_LOGOUT_WARNING: 5 * 60 * 1000, // 5 minutes before logout
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  LOW_STOCK_THRESHOLD: 10,
  CRITICAL_STOCK_THRESHOLD: 5
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  CUSTOMERS: '/api/customers',
  ORDERS: '/api/orders',
  INVENTORY: '/api/inventory',
  REPORTS: '/api/reports',
  SETTINGS: '/api/settings',
  UPLOAD: '/api/upload',
  BACKUP: '/api/backup'
} as const;

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  INVENTORY_UPDATED: 'inventory:updated',
  LOW_STOCK_ALERT: 'inventory:low_stock',
  USER_ONLINE: 'user:online',
  USER_OFFLINE: 'user:offline'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  FORBIDDEN: 'Truy cập bị từ chối',
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  SERVER_ERROR: 'Lỗi máy chủ',
  TIMEOUT: 'Quá thời gian chờ',
  FILE_TOO_LARGE: 'File quá lớn',
  INVALID_FILE_TYPE: 'Loại file không được hỗ trợ'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Tạo thành công',
  UPDATED: 'Cập nhật thành công',
  DELETED: 'Xóa thành công',
  SAVED: 'Lưu thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công',
  FILE_UPLOADED: 'Tải file thành công',
  BACKUP_CREATED: 'Sao lưu thành công'
} as const;

// Date Ranges
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_QUARTER: 'this_quarter',
  LAST_QUARTER: 'last_quarter',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom'
} as const;

export const DATE_RANGE_NAMES = {
  [DATE_RANGES.TODAY]: 'Hôm nay',
  [DATE_RANGES.YESTERDAY]: 'Hôm qua',
  [DATE_RANGES.THIS_WEEK]: 'Tuần này',
  [DATE_RANGES.LAST_WEEK]: 'Tuần trước',
  [DATE_RANGES.THIS_MONTH]: 'Tháng này',
  [DATE_RANGES.LAST_MONTH]: 'Tháng trước',
  [DATE_RANGES.THIS_QUARTER]: 'Quý này',
  [DATE_RANGES.LAST_QUARTER]: 'Quý trước',
  [DATE_RANGES.THIS_YEAR]: 'Năm này',
  [DATE_RANGES.LAST_YEAR]: 'Năm trước',
  [DATE_RANGES.CUSTOM]: 'Tùy chọn'
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6366F1',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#06B6D4',
  LIGHT: '#F3F4F6',
  DARK: '#1F2937'
} as const;

// Vietnamese Provinces/Cities
export const VIETNAMESE_PROVINCES = {
  HANOI: 'hanoi',
  HO_CHI_MINH: 'hcm',
  DA_NANG: 'danang',
  HAI_PHONG: 'haiphong',
  CAN_THO: 'cantho',
  AN_GIANG: 'angiang',
  BA_RIA_VUNG_TAU: 'bariavungtau',
  BAC_GIANG: 'bacgiang',
  BAC_KAN: 'backan',
  BAC_LIEU: 'baclieu',
  BAC_NINH: 'bacninh',
  BEN_TRE: 'bentre',
  BINH_DINH: 'binhdinh',
  BINH_DUONG: 'binhduong',
  BINH_PHUOC: 'binhphuoc',
  BINH_THUAN: 'binhthuan',
  CA_MAU: 'camau',
  CAO_BANG: 'caobang',
  DAK_LAK: 'daklak',
  DAK_NONG: 'daknong',
  DIEN_BIEN: 'dienbien',
  DONG_NAI: 'dongnai',
  DONG_THAP: 'dongthap',
  GIA_LAI: 'gialai',
  HA_GIANG: 'hagiang',
  HA_NAM: 'hanam',
  HA_TINH: 'hatinh',
  HAI_DUONG: 'haiduong',
  HAU_GIANG: 'haugiang',
  HOA_BINH: 'hoabinh',
  HUNG_YEN: 'hungyen',
  KHANH_HOA: 'khanhhoa',
  KIEN_GIANG: 'kiengiang',
  KON_TUM: 'kontum',
  LAI_CHAU: 'laichau',
  LAM_DONG: 'lamdong',
  LANG_SON: 'langson',
  LAO_CAI: 'laocai',
  LONG_AN: 'longan',
  NAM_DINH: 'namdinh',
  NGHE_AN: 'nghean',
  NINH_BINH: 'ninhbinh',
  NINH_THUAN: 'ninhthuan',
  PHU_THO: 'phutho',
  PHU_YEN: 'phuyen',
  QUANG_BINH: 'quangbinh',
  QUANG_NAM: 'quangnam',
  QUANG_NGAI: 'quangngai',
  QUANG_NINH: 'quangninh',
  QUANG_TRI: 'quangtri',
  SOC_TRANG: 'soctrang',
  SON_LA: 'sonla',
  TAY_NINH: 'tayninh',
  THAI_BINH: 'thaibinh',
  THAI_NGUYEN: 'thainguyen',
  THANH_HOA: 'thanhhoa',
  THUA_THIEN_HUE: 'thuathienhue',
  TIEN_GIANG: 'tiengiang',
  TRA_VINH: 'travinh',
  TUYEN_QUANG: 'tuyenquang',
  VINH_LONG: 'vinhlong',
  VINH_PHUC: 'vinhphuc',
  YEN_BAI: 'yenbai'
} as const;

export const PROVINCE_NAMES = {
  [VIETNAMESE_PROVINCES.HANOI]: 'Hà Nội',
  [VIETNAMESE_PROVINCES.HO_CHI_MINH]: 'TP. Hồ Chí Minh',
  [VIETNAMESE_PROVINCES.DA_NANG]: 'Đà Nẵng',
  [VIETNAMESE_PROVINCES.HAI_PHONG]: 'Hải Phòng',
  [VIETNAMESE_PROVINCES.CAN_THO]: 'Cần Thơ',
  [VIETNAMESE_PROVINCES.AN_GIANG]: 'An Giang',
  [VIETNAMESE_PROVINCES.BA_RIA_VUNG_TAU]: 'Bà Rịa - Vũng Tàu',
  [VIETNAMESE_PROVINCES.BAC_GIANG]: 'Bắc Giang',
  [VIETNAMESE_PROVINCES.BAC_KAN]: 'Bắc Kạn',
  [VIETNAMESE_PROVINCES.BAC_LIEU]: 'Bạc Liêu',
  [VIETNAMESE_PROVINCES.BAC_NINH]: 'Bắc Ninh',
  [VIETNAMESE_PROVINCES.BEN_TRE]: 'Bến Tre',
  [VIETNAMESE_PROVINCES.BINH_DINH]: 'Bình Định',
  [VIETNAMESE_PROVINCES.BINH_DUONG]: 'Bình Dương',
  [VIETNAMESE_PROVINCES.BINH_PHUOC]: 'Bình Phước',
  [VIETNAMESE_PROVINCES.BINH_THUAN]: 'Bình Thuận',
  [VIETNAMESE_PROVINCES.CA_MAU]: 'Cà Mau',
  [VIETNAMESE_PROVINCES.CAO_BANG]: 'Cao Bằng',
  [VIETNAMESE_PROVINCES.DAK_LAK]: 'Đắk Lắk',
  [VIETNAMESE_PROVINCES.DAK_NONG]: 'Đắk Nông',
  [VIETNAMESE_PROVINCES.DIEN_BIEN]: 'Điện Biên',
  [VIETNAMESE_PROVINCES.DONG_NAI]: 'Đồng Nai',
  [VIETNAMESE_PROVINCES.DONG_THAP]: 'Đồng Tháp',
  [VIETNAMESE_PROVINCES.GIA_LAI]: 'Gia Lai',
  [VIETNAMESE_PROVINCES.HA_GIANG]: 'Hà Giang',
  [VIETNAMESE_PROVINCES.HA_NAM]: 'Hà Nam',
  [VIETNAMESE_PROVINCES.HA_TINH]: 'Hà Tĩnh',
  [VIETNAMESE_PROVINCES.HAI_DUONG]: 'Hải Dương',
  [VIETNAMESE_PROVINCES.HAU_GIANG]: 'Hậu Giang',
  [VIETNAMESE_PROVINCES.HOA_BINH]: 'Hòa Bình',
  [VIETNAMESE_PROVINCES.HUNG_YEN]: 'Hưng Yên',
  [VIETNAMESE_PROVINCES.KHANH_HOA]: 'Khánh Hòa',
  [VIETNAMESE_PROVINCES.KIEN_GIANG]: 'Kiên Giang',
  [VIETNAMESE_PROVINCES.KON_TUM]: 'Kon Tum',
  [VIETNAMESE_PROVINCES.LAI_CHAU]: 'Lai Châu',
  [VIETNAMESE_PROVINCES.LAM_DONG]: 'Lâm Đồng',
  [VIETNAMESE_PROVINCES.LANG_SON]: 'Lạng Sơn',
  [VIETNAMESE_PROVINCES.LAO_CAI]: 'Lào Cai',
  [VIETNAMESE_PROVINCES.LONG_AN]: 'Long An',
  [VIETNAMESE_PROVINCES.NAM_DINH]: 'Nam Định',
  [VIETNAMESE_PROVINCES.NGHE_AN]: 'Nghệ An',
  [VIETNAMESE_PROVINCES.NINH_BINH]: 'Ninh Bình',
  [VIETNAMESE_PROVINCES.NINH_THUAN]: 'Ninh Thuận',
  [VIETNAMESE_PROVINCES.PHU_THO]: 'Phú Thọ',
  [VIETNAMESE_PROVINCES.PHU_YEN]: 'Phú Yên',
  [VIETNAMESE_PROVINCES.QUANG_BINH]: 'Quảng Bình',
  [VIETNAMESE_PROVINCES.QUANG_NAM]: 'Quảng Nam',
  [VIETNAMESE_PROVINCES.QUANG_NGAI]: 'Quảng Ngãi',
  [VIETNAMESE_PROVINCES.QUANG_NINH]: 'Quảng Ninh',
  [VIETNAMESE_PROVINCES.QUANG_TRI]: 'Quảng Trị',
  [VIETNAMESE_PROVINCES.SOC_TRANG]: 'Sóc Trăng',
  [VIETNAMESE_PROVINCES.SON_LA]: 'Sơn La',
  [VIETNAMESE_PROVINCES.TAY_NINH]: 'Tây Ninh',
  [VIETNAMESE_PROVINCES.THAI_BINH]: 'Thái Bình',
  [VIETNAMESE_PROVINCES.THAI_NGUYEN]: 'Thái Nguyên',
  [VIETNAMESE_PROVINCES.THANH_HOA]: 'Thanh Hóa',
  [VIETNAMESE_PROVINCES.THUA_THIEN_HUE]: 'Thừa Thiên Huế',
  [VIETNAMESE_PROVINCES.TIEN_GIANG]: 'Tiền Giang',
  [VIETNAMESE_PROVINCES.TRA_VINH]: 'Trà Vinh',
  [VIETNAMESE_PROVINCES.TUYEN_QUANG]: 'Tuyên Quang',
  [VIETNAMESE_PROVINCES.VINH_LONG]: 'Vĩnh Long',
  [VIETNAMESE_PROVINCES.VINH_PHUC]: 'Vĩnh Phúc',
  [VIETNAMESE_PROVINCES.YEN_BAI]: 'Yên Bái'
} as const;

// Storage Types
export const STORAGE_TYPES = {
  SSD_SATA: 'ssd_sata',
  SSD_NVME: 'ssd_nvme',
  HDD_SATA: 'hdd_sata',
  HDD_ENTERPRISE: 'hdd_enterprise'
} as const;

// Form Factors
export const MOTHERBOARD_FORM_FACTORS = {
  ATX: 'atx',
  MICRO_ATX: 'micro_atx',
  MINI_ITX: 'mini_itx',
  E_ATX: 'e_atx'
} as const;

export const RAM_TYPES = {
  DDR4: 'ddr4',
  DDR5: 'ddr5'
} as const;

// Export all constants as a single object for easier imports
export const CONSTANTS = {
  COMPANY_INFO,
  CURRENCY,
  LOCALE,
  USER_ROLES,
  PERMISSIONS,
  PRODUCT_CATEGORIES,
  CATEGORY_NAMES,
  CPU_BRANDS,
  GPU_BRANDS,
  MOTHERBOARD_BRANDS,
  RAM_BRANDS,
  STORAGE_BRANDS,
  BUILD_TYPES,
  BUILD_TYPE_NAMES,
  ORDER_STATUS,
  ORDER_STATUS_NAMES,
  ORDER_STATUS_COLORS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_NAMES,
  CUSTOMER_TYPES,
  CUSTOMER_TYPE_NAMES,
  INVENTORY_STATUS,
  INVENTORY_STATUS_NAMES,
  TAX_RATES,
  SYSTEM_SETTINGS,
  API_ENDPOINTS,
  SOCKET_EVENTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_RANGES,
  DATE_RANGE_NAMES,
  CHART_COLORS,
  VIETNAMESE_PROVINCES,
  PROVINCE_NAMES,
  STORAGE_TYPES,
  MOTHERBOARD_FORM_FACTORS,
  RAM_TYPES
} as const;

export default CONSTANTS;