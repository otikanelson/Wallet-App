import Constants from 'expo-constants';

export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 
  process.env.EXPO_PUBLIC_API_URL || 
  'http://localhost:3000/api/v1';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/user',
  LOGIN: '/login',
  REFRESH_TOKEN: '/refresh-token',
  SEND_OTP: '/send-otp',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  CHANGE_PASSWORD: '/change-password',
  
  // User
  GET_CURRENT_USER: '/user',
  UPDATE_USER: '/user',
  UPDATE_TRANSACTION_PIN: '/transaction-pin',
  CHECK_TRANSACTION_PIN: '/transaction-pin/check',
  UPDATE_PUSH_TOKEN: '/push-token',
  UPDATE_PROFILE_PICTURE: '/profile-picture',
  
  // Utility Services
  BUY_AIRTIME: '/buy-airtime',
  BUY_DATA: '/buy-data',
  GET_DATA_PLANS: '/get-data-available',
  
  // Electricity
  VERIFY_ELECTRICITY: '/verify-electricity-bill',
  BUY_ELECTRICITY: '/buy-electricity-bill',
  GET_ELECTRICITY_PROVIDERS: '/get-eletricity-available',
  
  // Cable TV
  VERIFY_TV_BILLER: '/verify-tv-biller',
  BUY_TV: '/buy-tv-bill',
  GET_TV_PROVIDERS: '/get-tv-available',
  GET_TV_PACKAGES: '/get-tv-available-one',
  
  // Transactions
  GET_TRANSACTIONS: '/transactions',
  GET_TRANSACTIONS_FILTERED: '/transactions-filtered',
  GET_TRANSACTION_DETAILS: '/transaction',
  GET_RECENT_BENEFICIARIES: '/recent-beneficiaries',
  
  // Payment
  FUND_WALLET: '/fund-wallet',
  FUND_WALLET_MANUAL: '/fund-wallet-manual', // For testing only
};

export const NETWORKS = {
  MTN: 'MTN',
  AIRTEL: 'AIRTEL',
  GLO: 'GLO',
  '9MOBILE': '9MOBILE',
} as const;

export const SERVICES = {
  AIRTIME: {
    MTN: 'MTNVTU',
    AIRTEL: 'AIRTELVTU',
    GLO: 'GLOVTU',
    '9MOBILE': '9MOBILEVTU',
  },
  DATA: {
    MTN: 'MTNDATA',
    AIRTEL: 'AIRTELDATA',
    GLO: 'GLODATA',
    '9MOBILE': '9MOBILEDATA',
  },
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export const TRANSACTION_TYPES = {
  AIRTIME: 'AIRTIME',
  DATA: 'DATA',
  ELECTRICITY: 'ELECTRICITY',
  TV: 'TV',
  WALLET_FUNDING: 'WALLET_FUNDING',
} as const;
