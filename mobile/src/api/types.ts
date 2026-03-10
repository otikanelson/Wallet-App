// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender?: 'male' | 'female';
  address?: string;
  role: 'admin' | 'user' | 'basic-admin' | 'standard-admin';
  status: 'verified' | 'unverified' | 'active' | 'inactive';
  profilePicture: string;
  totalFund: string;
  pushToken?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginResponse {
  token: string;
  refreshToken: string;
  role: string;
}

export interface RegisterResponse {
  token: string;
  refreshToken: string;
}

export interface OTPResponse {
  token: string;
}

// Transaction types
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type TransactionType = 'AIRTIME' | 'DATA' | 'ELECTRICITY' | 'TV' | 'WALLET_FUNDING';
export type Network = 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';

export interface Transaction {
  id: string;
  userId: string;
  amount: string;
  type: TransactionType;
  status: TransactionStatus;
  network?: Network;
  phoneNumber?: string;
  reference?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TransactionListResponse {
  message: string;
  data: {
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Data plan types
export interface DataPlan {
  code: string;
  name: string;
  amount: string;
  validity: string;
  network: string;
}

// Electricity types
export interface ElectricityProvider {
  code: string;
  name: string;
}

export interface ElectricityValidation {
  customerName: string;
  address?: string;
  meterNumber: string;
}

// TV types
export interface TVProvider {
  code: string;
  name: string;
}

export interface TVPackage {
  code: string;
  name: string;
  amount: string;
  validity: string;
}

export interface TVValidation {
  customerName: string;
  smartCardNumber: string;
}

// Purchase types
export interface PurchaseRequest {
  amountRecharge: number;
  pin: string;
  phoneNumber: string;
  network: string;
  service: string;
  codeNetwork?: string;
}

export interface PurchaseResponse {
  message: string;
  data: {
    userId: string;
    amount: number;
    newBalance: number;
    phoneNumber: string;
    network: string;
    service: string;
    timestamp: string;
  };
}

// Payment types
export interface FundWalletRequest {
  amount: number;
  currency?: string;
  redirectUrl?: string;
}

export interface FundWalletResponse {
  paymentLink: string;
  reference: string;
}

// Beneficiary types
export interface Beneficiary {
  phoneNumber: string;
  network: Network;
  type: TransactionType;
  lastUsed: string;
}

// API Response wrapper
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Error response
export interface APIError {
  message: string;
  statusCode: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
