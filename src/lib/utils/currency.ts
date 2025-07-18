// Vietnamese Currency Utilities
// Tiện ích cho tiền tệ Việt Nam

/**
 * Format a number as Vietnamese currency (VND)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, options: Intl.NumberFormatOptions = {}): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
    ...options
  };

  return new Intl.NumberFormat('vi-VN', defaultOptions).format(amount);
}

/**
 * Format a number as a simple number with thousand separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

/**
 * Convert a string to a number, handling formatted input
 * @param value - The string to convert
 * @returns Converted number or null if invalid
 */
export function parseFormattedNumber(value: string): number | null {
  // Remove currency symbols, dots, commas and spaces
  const cleanValue = value.replace(/[₫,.'\s]/g, '');
  
  // Convert to number
  const number = Number(cleanValue);
  
  // Return null if NaN
  return isNaN(number) ? null : number;
}

/**
 * Calculate VAT amount based on price and rate
 * @param price - Base price
 * @param vatRate - VAT rate in percentage (default: 10)
 * @returns VAT amount
 */
export function calculateVAT(price: number, vatRate: number = 10): number {
  return (price * vatRate) / 100;
}

/**
 * Calculate price with VAT included
 * @param price - Base price
 * @param vatRate - VAT rate in percentage (default: 10)
 * @returns Price with VAT
 */
export function calculatePriceWithVAT(price: number, vatRate: number = 10): number {
  return price + calculateVAT(price, vatRate);
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
 * Format a price range
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice);
  }
  
  // For price ranges, use a compact notation
  let min: string, max: string;
  
  if (minPrice >= 1000000) {
    min = `${(minPrice / 1000000).toFixed(1)} triệu₫`;
  } else {
    min = formatCurrency(minPrice);
  }
  
  if (maxPrice >= 1000000) {
    max = `${(maxPrice / 1000000).toFixed(1)} triệu₫`;
  } else {
    max = formatCurrency(maxPrice);
  }
  
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