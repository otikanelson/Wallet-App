import { z } from 'zod';

// Registration schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// OTP verification schema
export const otpSchema = z.object({
  otp: z.string().regex(/^\d{4}$/, 'OTP must be 4 digits'),
});

export type OTPFormData = z.infer<typeof otpSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Transaction PIN schema
export const transactionPINSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
  confirmPin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

export type TransactionPINFormData = z.infer<typeof transactionPINSchema>;

// Airtime purchase schema
export const airtimePurchaseSchema = z.object({
  network: z.enum(['MTN', 'AIRTEL', 'GLO', '9MOBILE'], {
    errorMap: () => ({ message: 'Please select a network' }),
  }),
  phoneNumber: z.string().regex(/^\d{11}$/, 'Invalid phone number'),
  amount: z.number().min(50, 'Minimum amount is ₦50'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

export type AirtimePurchaseFormData = z.infer<typeof airtimePurchaseSchema>;

// Data purchase schema
export const dataPurchaseSchema = z.object({
  network: z.enum(['MTN', 'AIRTEL', 'GLO', '9MOBILE']),
  phoneNumber: z.string().regex(/^\d{11}$/, 'Invalid phone number'),
  planCode: z.string().min(1, 'Please select a data plan'),
  amount: z.number().min(50, 'Minimum amount is ₦50'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

export type DataPurchaseFormData = z.infer<typeof dataPurchaseSchema>;

// Electricity purchase schema
export const electricityPurchaseSchema = z.object({
  disco: z.string().min(1, 'Please select a DISCO'),
  meterNumber: z.string().min(1, 'Meter number is required'),
  phoneNumber: z.string().regex(/^\d{11}$/, 'Invalid phone number'),
  amount: z.number().min(100, 'Minimum amount is ₦100'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

export type ElectricityPurchaseFormData = z.infer<typeof electricityPurchaseSchema>;

// Cable TV purchase schema
export const tvPurchaseSchema = z.object({
  provider: z.string().min(1, 'Please select a TV provider'),
  packageCode: z.string().min(1, 'Please select a package'),
  smartCardNumber: z.string().min(1, 'Smart card number is required'),
  amount: z.number().min(100, 'Minimum amount is ₦100'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
});

export type TVPurchaseFormData = z.infer<typeof tvPurchaseSchema>;

// Fund wallet schema
export const fundWalletSchema = z.object({
  amount: z.number().min(100, 'Minimum amount is ₦100'),
});

export type FundWalletFormData = z.infer<typeof fundWalletSchema>;

// Profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phoneNumber: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits').optional(),
  address: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
