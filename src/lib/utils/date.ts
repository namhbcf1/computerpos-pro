/**
 * Format a date to Vietnamese format
 * @param date - Date to format
 * @param options - Options for formatting
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | number, options: Intl.DateTimeFormatOptions = {}): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  return new Intl.DateTimeFormat('vi-VN', defaultOptions).format(dateObj);
}

/**
 * Format a date with time
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format a time only
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
}

/**
 * Format a date in a relative way (e.g., "2 days ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  // Define time units in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  // Return appropriate relative format based on the difference
  if (diffInSeconds < minute) {
    return 'Vừa xong';
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day);
    return `${days} ngày trước`;
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week);
    return `${weeks} tuần trước`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return `${years} năm trước`;
  }
}

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns Boolean indicating if the date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get the start and end of a date range
 * @param period - Period type ('today', 'yesterday', 'week', 'month', 'year')
 * @returns Object with start and end dates
 */
export function getDateRange(period: 'today' | 'yesterday' | 'week' | 'month' | 'year'): { start: Date, end: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  let start: Date;
  
  switch (period) {
    case 'today':
      start = today;
      break;
      
    case 'yesterday':
      start = new Date(today);
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
      
    case 'week':
      start = new Date(today);
      start.setDate(start.getDate() - start.getDay());
      break;
      
    case 'month':
      start = new Date(today);
      start.setDate(1);
      break;
      
    case 'year':
      start = new Date(today);
      start.setMonth(0, 1);
      break;
      
    default:
      start = today;
  }
  
  return { start, end };
}
