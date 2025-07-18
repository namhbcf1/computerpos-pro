// Tiện ích định dạng cho tiếng Việt

import { formatCurrency, formatNumber } from './currency';

// Re-export currency function for convenience
export { formatCurrency, formatNumber };

/**
 * Format phone number in Vietnamese format
 * @param phone - Phone number
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number
  if (cleaned.length < 9 || cleaned.length > 11) {
    return phone;
  }
  
  // Format as Vietnamese phone number
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
}

/**
 * Format a tax code (mã số thuế) in Vietnamese format
 * @param taxCode - Tax code
 * @returns Formatted tax code
 */
export function formatTaxCode(taxCode: string): string {
  // Remove all non-numeric characters
  const cleaned = taxCode.replace(/\D/g, '');
  
  // Check if it's a valid tax code
  if (cleaned.length !== 10 && cleaned.length !== 14) {
    return taxCode;
  }
  
  // Format based on length
  if (cleaned.length === 10) {
    return cleaned;
  } else {
    // For branch tax codes (14 digits)
    return `${cleaned.slice(0, 10)}-${cleaned.slice(10)}`;
  }
}

/**
 * Format a Vietnamese address
 * @param address - Address parts
 * @returns Formatted address
 */
export function formatAddress(address: {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
}): string {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.ward) parts.push(`Phường ${address.ward}`);
  if (address.district) parts.push(`Quận ${address.district}`);
  if (address.city) parts.push(address.city);
  
  return parts.join(', ');
}

/**
 * Format a string by capitalizing first letter
 * @param str - String to format
 * @returns Formatted string
 */
export function capitalizeFirstLetter(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Define type for order status mapping
interface StatusMapping {
  text: string;
  color: string;
  description: string;
}

// Define order status types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';

// Order status mapping
const orderStatusMap: Record<OrderStatus, StatusMapping> = {
  pending: { 
    text: 'Chờ xử lý', 
    color: 'bg-yellow-100 text-yellow-800', 
    description: 'Đơn hàng mới tạo, đang chờ xác nhận' 
  },
  processing: { 
    text: 'Đang xử lý', 
    color: 'bg-blue-100 text-blue-800', 
    description: 'Đơn hàng đã xác nhận, đang chuẩn bị hàng' 
  },
  shipped: { 
    text: 'Đang giao', 
    color: 'bg-indigo-100 text-indigo-800', 
    description: 'Đơn hàng đang được vận chuyển' 
  },
  delivered: { 
    text: 'Đã giao', 
    color: 'bg-green-100 text-green-800', 
    description: 'Đơn hàng đã giao thành công' 
  },
  cancelled: { 
    text: 'Đã hủy', 
    color: 'bg-red-100 text-red-800', 
    description: 'Đơn hàng đã bị hủy' 
  },
  completed: { 
    text: 'Hoàn thành', 
    color: 'bg-green-100 text-green-800', 
    description: 'Đơn hàng đã hoàn thành' 
  }
};

/**
 * Format order status
 * @param status - Order status
 * @returns Formatted status
 */
export function formatOrderStatus(status: string): string {
  return status in orderStatusMap ? orderStatusMap[status as OrderStatus].text : status;
}

// Payment method types
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'qr' | 'momo' | 'zalopay' | 'vnpay' | 'paypal';

// Payment method mapping
const paymentMethodMap: Record<PaymentMethod, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ ngân hàng',
  transfer: 'Chuyển khoản',
  qr: 'Quét mã QR',
  momo: 'Ví Momo',
  zalopay: 'ZaloPay',
  vnpay: 'VNPAY',
  paypal: 'PayPal'
};

/**
 * Format payment method
 * @param method - Payment method
 * @returns Formatted payment method
 */
export function formatPaymentMethod(method: string): string {
  return method in paymentMethodMap ? paymentMethodMap[method as PaymentMethod] : method;
}

// Customer type mapping
type CustomerType = 'individual' | 'business' | 'vip' | 'wholesale';

const customerTypeMap: Record<CustomerType, string> = {
  individual: 'Khách lẻ',
  business: 'Doanh nghiệp',
  vip: 'VIP',
  wholesale: 'Bán buôn'
};

/**
 * Format customer type
 * @param type - Customer type
 * @returns Formatted customer type
 */
export function formatCustomerType(type: string): string {
  return type in customerTypeMap ? customerTypeMap[type as CustomerType] : type;
}

// PC build type mapping
type BuildType = 'gaming' | 'office' | 'workstation' | 'server' | 'htpc' | 'budget';

const buildTypeMap: Record<BuildType, string> = {
  gaming: 'Máy tính chơi game',
  office: 'Máy tính văn phòng',
  workstation: 'Máy trạm',
  server: 'Máy chủ',
  htpc: 'PC giải trí',
  budget: 'Máy tính giá rẻ'
};

/**
 * Format PC build type
 * @param type - Build type
 * @returns Formatted build type
 */
export function formatBuildType(type: string): string {
  return type in buildTypeMap ? buildTypeMap[type as BuildType] : type;
}

// Component type mapping
type ComponentType = 'cpu' | 'motherboard' | 'ram' | 'gpu' | 'vga' | 'storage' | 'ssd' | 'hdd' | 
  'psu' | 'case' | 'cooling' | 'monitor' | 'keyboard' | 'mouse' | 'headset' | 'speaker';

const componentTypeMap: Record<ComponentType, string> = {
  cpu: 'CPU / Vi xử lý',
  motherboard: 'Bo mạch chủ',
  ram: 'Bộ nhớ RAM',
  gpu: 'Card đồ họa',
  vga: 'Card màn hình',
  storage: 'Ổ lưu trữ',
  ssd: 'Ổ cứng SSD',
  hdd: 'Ổ cứng HDD',
  psu: 'Nguồn máy tính',
  case: 'Vỏ case',
  cooling: 'Tản nhiệt',
  monitor: 'Màn hình',
  keyboard: 'Bàn phím',
  mouse: 'Chuột',
  headset: 'Tai nghe',
  speaker: 'Loa'
};

/**
 * Format component type
 * @param type - Component type
 * @returns Formatted component type
 */
export function formatComponentType(type: string): string {
  return type in componentTypeMap ? componentTypeMap[type as ComponentType] : capitalizeFirstLetter(type);
}

/**
 * Format object for display
 * @param obj - Object to format
 * @returns Formatted string
 */
export function formatObject(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (typeof value === 'number' && key.toLowerCase().includes('price')) {
        return `${key}: ${formatCurrency(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
}