import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format currency amount
 */
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '₦0.00';
  
  return `₦${numAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: 0801 234 5678
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
};

/**
 * Mask phone number (show last 4 digits)
 */
export const maskPhoneNumber = (phone: string): string => {
  if (!phone || phone.length < 4) return phone;
  return `****${phone.slice(-4)}`;
};

/**
 * Format date
 */
export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    return '';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM dd, yyyy • hh:mm a');
  } catch (error) {
    return '';
  }
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return '';
  }
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format transaction reference
 */
export const formatReference = (ref: string): string => {
  if (!ref) return '';
  // Show first 4 and last 4 characters
  if (ref.length > 12) {
    return `${ref.slice(0, 4)}...${ref.slice(-4)}`;
  }
  return ref;
};

/**
 * Mask balance (show as asterisks)
 */
export const maskBalance = (): string => {
  return '₦****.**';
};

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (11 digits)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && cleaned.startsWith('0');
};

/**
 * Validate PIN (4 digits)
 */
export const isValidPIN = (pin: string): boolean => {
  return /^\d{4}$/.test(pin);
};
