// Vietnamese Formatting Utilities
// Tiện ích định dạng cho tiếng Việt

import { formatVND } from './currency';

// Re-export currency function for convenience
export { formatVND };

/**
 * Format Vietnamese full name properly
 * @param firstName - First name (tên)
 * @param lastName - Last name (họ)
 * @param middleName - Middle name (tên đệm)
 */
export function formatVietnameseName(
  firstName: string, 
  lastName: string, 
  middleName?: string
): string {
  const parts = [lastName.trim(), middleName?.trim(), firstName.trim()].filter(Boolean);
  return parts.join(' ');
}

/**
 * Format Vietnamese phone number
 * @param phone - Phone number string
 * @param format - Format type ('dots', 'dashes', 'spaces')
 */
export function formatVietnamesePhone(
  phone: string, 
  format: 'dots' | 'dashes' | 'spaces' = 'dots'
): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different length formats
  if (cleaned.length === 10) {
    // Mobile format: 0xxx.xxx.xxx
    const separator = format === 'dots' ? '.' : format === 'dashes' ? '-' : ' ';
    return `${cleaned.slice(0, 4)}${separator}${cleaned.slice(4, 7)}${separator}${cleaned.slice(7)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
    // International format: +84.xxx.xxx.xxx
    const separator = format === 'dots' ? '.' : format === 'dashes' ? '-' : ' ';
    return `+84${separator}${cleaned.slice(2, 5)}${separator}${cleaned.slice(5, 8)}${separator}${cleaned.slice(8)}`;
  }
  
  return phone; // Return original if format not recognized
}

/**
 * Format Vietnamese address
 * @param address - Address components
 */
export function formatVietnameseAddress(address: {
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
}): string {
  const parts = [
    address.street,
    address.ward && `Phường ${address.ward}`,
    address.district && `Quận ${address.district}`,
    address.city && `TP. ${address.city}`,
    address.country || 'Việt Nam'
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Format product specifications in Vietnamese
 * @param specs - Key-value specification pairs
 */
export function formatProductSpecs(specs: Record<string, any>): string {
  return Object.entries(specs)
    .map(([key, value]) => {
      if (typeof value === 'number' && key.toLowerCase().includes('price')) {
        return `${key}: ${formatVND(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join(' • ');
}

/**
 * Format inventory status in Vietnamese
 * @param quantity - Available quantity
 * @param reserved - Reserved quantity
 */
export function formatInventoryStatus(quantity: number, reserved: number = 0): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved';
  text: string;
  color: string;
} {
  const available = quantity - reserved;
  
  if (available <= 0) {
    return {
      status: 'out_of_stock',
      text: 'Hết hàng',
      color: 'red'
    };
  } else if (available <= 5) {
    return {
      status: 'low_stock',
      text: `Còn ${available} sản phẩm`,
      color: 'yellow'
    };
  } else if (reserved > 0) {
    return {
      status: 'reserved',
      text: `${available} có sẵn (${reserved} đã đặt)`,
      color: 'blue'
    };
  } else {
    return {
      status: 'in_stock',
      text: `${available} có sẵn`,
      color: 'green'
    };
  }
}

/**
 * Format file size in Vietnamese
 * @param bytes - File size in bytes
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format warranty period in Vietnamese
 * @param months - Warranty period in months
 */
export function formatWarrantyPeriod(months: number): string {
  if (months === 0) return 'Không bảo hành';
  if (months < 12) return `${months} tháng`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return `${years} năm`;
  } else {
    return `${years} năm ${remainingMonths} tháng`;
  }
}

/**
 * Format order status in Vietnamese
 * @param status - Order status
 */
export function formatOrderStatus(status: string): {
  text: string;
  color: string;
  description: string;
} {
  const statusMap = {
    pending: {
      text: 'Chờ xử lý',
      color: 'yellow',
      description: 'Đơn hàng đang chờ xác nhận'
    },
    processing: {
      text: 'Đang xử lý',
      color: 'blue',
      description: 'Đơn hàng đang được chuẩn bị'
    },
    shipped: {
      text: 'Đã gửi hàng',
      color: 'purple',
      description: 'Đơn hàng đang trên đường giao'
    },
    delivered: {
      text: 'Đã giao hàng',
      color: 'green',
      description: 'Đơn hàng đã được giao thành công'
    },
    cancelled: {
      text: 'Đã hủy',
      color: 'red',
      description: 'Đơn hàng đã bị hủy'
    },
    completed: {
      text: 'Hoàn thành',
      color: 'green',
      description: 'Đơn hàng đã hoàn thành'
    }
  };
  
  return statusMap[status] || {
    text: 'Không xác định',
    color: 'gray',
    description: 'Trạng thái không xác định'
  };
}

/**
 * Format payment method in Vietnamese
 * @param method - Payment method
 */
export function formatPaymentMethod(method: string): string {
  const methodMap = {
    cash: 'Tiền mặt',
    card: 'Thẻ tín dụng',
    transfer: 'Chuyển khoản',
    qr: 'QR Code',
    momo: 'MoMo',
    zalopay: 'ZaloPay',
    vnpay: 'VNPay',
    paypal: 'PayPal'
  };
  
  return methodMap[method] || method;
}

/**
 * Format customer type in Vietnamese
 * @param type - Customer type
 */
export function formatCustomerType(type: string): string {
  const typeMap = {
    individual: 'Cá nhân',
    business: 'Doanh nghiệp',
    vip: 'Khách VIP',
    wholesale: 'Khách sỉ'
  };
  
  return typeMap[type] || type;
}

/**
 * Format build type in Vietnamese
 * @param type - Build type
 */
export function formatBuildType(type: string): string {
  const typeMap = {
    gaming: 'Gaming',
    office: 'Văn phòng',
    workstation: 'Workstation',
    server: 'Server',
    htpc: 'HTPC',
    budget: 'Tiết kiệm'
  };
  
  return typeMap[type] || type;
}

/**
 * Format component category in Vietnamese
 * @param category - Component category
 */
export function formatComponentCategory(category: string): string {
  const categoryMap = {
    cpu: 'Bộ vi xử lý',
    motherboard: 'Bo mạch chủ',
    ram: 'Bộ nhớ RAM',
    gpu: 'Card đồ họa',
    vga: 'Card đồ họa',
    storage: 'Ổ cứng',
    ssd: 'Ổ cứng SSD',
    hdd: 'Ổ cứng HDD',
    psu: 'Nguồn máy tính',
    case: 'Vỏ máy tính',
    cooling: 'Tản nhiệt',
    monitor: 'Màn hình',
    keyboard: 'Bàn phím',
    mouse: 'Chuột máy tính',
    headset: 'Tai nghe',
    speaker: 'Loa máy tính'
  };
  
  return categoryMap[category.toLowerCase()] || category;
}

/**
 * Format percentage with Vietnamese style
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format rating stars in Vietnamese
 * @param rating - Rating value (0-5)
 * @param total - Total number of ratings
 */
export function formatRating(rating: number, total: number = 0): string {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  if (total > 0) {
    return `${stars} ${rating.toFixed(1)} (${total} đánh giá)`;
  }
  return `${stars} ${rating.toFixed(1)}`;
}

/**
 * Truncate text with Vietnamese ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis character
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Format list in Vietnamese with proper conjunctions
 * @param items - Array of items
 * @param conjunction - Conjunction ('và', 'hoặc')
 */
export function formatVietnameseList(items: string[], conjunction: string = 'và'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);
  return `${otherItems.join(', ')} ${conjunction} ${lastItem}`;
}