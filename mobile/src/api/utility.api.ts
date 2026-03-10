import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';

// Airtime
export interface AirtimePurchaseData {
  amountRecharge: number;
  pin: string;
  phoneNumber: string;
  network: string;
  service: string;
}

export const utilityAPI = {
  // Airtime
  purchaseAirtime: async (data: AirtimePurchaseData) => {
    return apiClient.post(API_ENDPOINTS.BUY_AIRTIME, data);
  },

  // Data
  getDataPlans: async (network: string) => {
    return apiClient.get(`${API_ENDPOINTS.GET_DATA_PLANS}?network=${network}`);
  },

  purchaseData: async (data: {
    amountRecharge: number;
    pin: string;
    phoneNumber: string;
    network: string;
    service: string;
    codeNetwork: string;
  }) => {
    return apiClient.post(API_ENDPOINTS.BUY_DATA, data);
  },

  // Electricity
  getElectricityProviders: async () => {
    return apiClient.get(API_ENDPOINTS.GET_ELECTRICITY_PROVIDERS);
  },

  verifyElectricityMeter: async (data: {
    billerCode: string;
    meterNumber: string;
  }) => {
    return apiClient.post(API_ENDPOINTS.VERIFY_ELECTRICITY, data);
  },

  purchaseElectricity: async (data: {
    amountRecharge: number;
    pin: string;
    phoneNumber: string;
    disco: string;
    meterNumber: string;
  }) => {
    return apiClient.post(API_ENDPOINTS.BUY_ELECTRICITY, data);
  },

  // Cable TV
  getTVProviders: async () => {
    return apiClient.get(API_ENDPOINTS.GET_TV_PROVIDERS);
  },

  getTVPackages: async (provider: string) => {
    return apiClient.get(`${API_ENDPOINTS.GET_TV_PACKAGES}/${provider}`);
  },

  verifySmartCard: async (data: {
    billerId: string;
    smartCardNo: string;
  }) => {
    return apiClient.post(API_ENDPOINTS.VERIFY_TV_BILLER, data);
  },

  purchaseTV: async (data: {
    amountRecharge: number;
    pin: string;
    code: string;
    tvType: string;
    meterNumber: string;
  }) => {
    return apiClient.post(API_ENDPOINTS.BUY_TV, data);
  },

  // Transactions
  getTransactions: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(`${API_ENDPOINTS.GET_TRANSACTIONS}?page=${page}&limit=${limit}`);
  },

  getTransactionDetails: async (transactionId: string) => {
    return apiClient.get(`${API_ENDPOINTS.GET_TRANSACTION_DETAILS}/${transactionId}`);
  },
};
