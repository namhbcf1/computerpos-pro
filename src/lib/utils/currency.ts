// Vietnamese Currency Utilities
// Tiện ích cho tiền tệ Việt Nam

/**
 * Format VND currency with proper Vietnamese formatting
 * @param amount - Amount in VND
 * @param options - Formatting options
 */
export function formatVND(amount: number, options?: {
  showSymbol?: boolean;
  showDecimals?: boolean;
  compact?: boolean;
}): string {
  const {
    showSymbol = true,
    showDecimals = false,
    compact = false
  } = options || {};

  if (compact && amount >= 1000000) {
    const millions = amount / 1000000;
    const formatted = millions % 1 === 0 ? millions.toString() : millions.toFixed(1);
    return showSymbol ? `${formatted} triệu₫` : `${formatted} triệu`;
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'VND',
    minimumFractionDigits: showDecimals ? 0 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });

  return formatter.format(amount);
}

/**
 * Parse VND string back to number
 * @param vndString - Vietnamese currency string
 */
export function parseVND(vndString: string): number {
  // Remove currency symbols and Vietnamese text
  const cleaned = vndString
    .replace(/[₫\s]/g, '')
    .replace(/triệu/g, '000000')
    .replace(/tỷ/g, '000000000')
    .replace(/[.,]/g, '');
  
  return parseInt(cleaned) || 0;
}

/**
 * Calculate VAT (Value Added Tax) for Vietnam (10%)
 * @param amount - Base amount in VND
 * @param vatRate - VAT rate (default 10%)
 */
export function calculateVAT(amount: number, vatRate: number = 0.1): {
  subtotal: number;
  vat: number;
  total: number;
} {
  const subtotal = amount;
  const vat = Math.round(amount * vatRate);
  const total = subtotal + vat;

  return { subtotal, vat, total };
}

/**
 * Apply discount to amount
 * @param amount - Original amount
 * @param discount - Discount percentage (0-100) or fixed amount
 * @param isPercentage - Whether discount is percentage or fixed amount
 */
export function applyDiscount(
  amount: number, 
  discount: number, 
  isPercentage: boolean = true
): {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
} {
  const originalAmount = amount;
  const discountAmount = isPercentage 
    ? Math.round(amount * (discount / 100))
    : discount;
  const finalAmount = originalAmount - discountAmount;

  return {
    originalAmount,
    discountAmount,
    finalAmount: Math.max(0, finalAmount)
  };
}

/**
 * Convert USD to VND using current exchange rate
 * @param usdAmount - Amount in USD
 * @param exchangeRate - USD to VND exchange rate (default ~24000)
 */
export function convertUSDToVND(usdAmount: number, exchangeRate: number = 24000): number {
  return Math.round(usdAmount * exchangeRate);
}

/**
 * Convert VND to USD
 * @param vndAmount - Amount in VND
 * @param exchangeRate - USD to VND exchange rate (default ~24000)
 */
export function convertVNDToUSD(vndAmount: number, exchangeRate: number = 24000): number {
  return Math.round((vndAmount / exchangeRate) * 100) / 100;
}

/**
 * Check if amount is valid Vietnamese currency amount
 * @param amount - Amount to validate
 */
export function isValidVNDAmount(amount: number): boolean {
  return amount >= 0 && amount <= 999999999999 && Number.isInteger(amount);
}

/**
 * Round to nearest thousand (common for Vietnamese pricing)
 * @param amount - Amount to round
 */
export function roundToThousand(amount: number): number {
  return Math.round(amount / 1000) * 1000;
}

/**
 * Format price range in Vietnamese
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatVND(minPrice);
  }
  
  const min = formatVND(minPrice, { compact: true });
  const max = formatVND(maxPrice, { compact: true });
  
  return `${min} - ${max}`;
}

/**
 * Vietnamese number to words (for invoices/contracts)
 * @param amount - Amount in VND
 */
export function numberToVietnameseWords(amount: number): string {
  if (amount === 0) return 'không đồng';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  
  function convertThreeDigits(num: number): string {
    let result = '';
    
    const hundreds = Math.floor(num / 100);
    const remainder = num % 100;
    const tensDigit = Math.floor(remainder / 10);
    const onesDigit = remainder % 10;
    
    if (hundreds > 0) {
      result += ones[hundreds] + ' trăm';
      if (remainder > 0) result += ' ';
    }
    
    if (tensDigit >= 2) {
      result += tens[tensDigit];
      if (onesDigit > 0) {
        result += ' ' + ones[onesDigit];
      }
    } else if (tensDigit === 1) {
      result += 'mười';
      if (onesDigit > 0) {
        result += ' ' + ones[onesDigit];
      }
    } else if (onesDigit > 0 && hundreds > 0) {
      result += 'lẻ ' + ones[onesDigit];
    } else if (onesDigit > 0) {
      result += ones[onesDigit];
    }
    
    return result;
  }
  
  // Simplified version for amounts up to billions
  if (amount >= 1000000000) {
    const billions = Math.floor(amount / 1000000000);
    const remainder = amount % 1000000000;
    let result = convertThreeDigits(billions) + ' tỷ';
    if (remainder > 0) {
      result += ' ' + numberToVietnameseWords(remainder);
    }
    return result + ' đồng';
  } else if (amount >= 1000000) {
    const millions = Math.floor(amount / 1000000);
    const remainder = amount % 1000000;
    let result = convertThreeDigits(millions) + ' triệu';
    if (remainder > 0) {
      result += ' ' + numberToVietnameseWords(remainder);
    }
    return result + ' đồng';
  } else if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    const remainder = amount % 1000;
    let result = convertThreeDigits(thousands) + ' nghìn';
    if (remainder > 0) {
      result += ' ' + convertThreeDigits(remainder);
    }
    return result + ' đồng';
  } else {
    return convertThreeDigits(amount) + ' đồng';
  }
}

/**
 * Calculate installment payment for Vietnamese consumers
 * @param totalAmount - Total amount to pay
 * @param months - Number of months (3, 6, 12, 18, 24)
 * @param interestRate - Monthly interest rate (default 0.8% for electronics)
 */
export function calculateInstallment(
  totalAmount: number, 
  months: number, 
  interestRate: number = 0.008
): {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
} {
  const monthlyInterest = interestRate;
  const monthlyPayment = Math.round(
    (totalAmount * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
    (Math.pow(1 + monthlyInterest, months) - 1)
  );
  
  let balance = totalAmount;
  const schedule = [];
  
  for (let month = 1; month <= months; month++) {
    const interestPayment = Math.round(balance * monthlyInterest);
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance)
    });
  }
  
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - totalAmount;
  
  return {
    monthlyPayment,
    totalInterest,
    totalPayment,
    schedule
  };
}