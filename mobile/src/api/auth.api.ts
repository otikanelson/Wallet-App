import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  LoginResponse,
  RegisterResponse,
  OTPResponse,
  APIResponse,
} from './types';

export const authAPI = {
  /**
   * Register a new user
   */
  register: async (data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }): Promise<RegisterResponse> => {
    const response = await apiClient.post<APIResponse<RegisterResponse>>(
      API_ENDPOINTS.REGISTER,
      data
    );
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    const response = await apiClient.post<APIResponse<LoginResponse>>(
      API_ENDPOINTS.LOGIN,
      data
    );
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiClient.post<APIResponse<{ token: string }>>(
      API_ENDPOINTS.REFRESH_TOKEN,
      { refreshToken }
    );
    return response.data;
  },

  /**
   * Send OTP to email
   */
  sendOTP: async (email: string): Promise<string> => {
    const response = await apiClient.post<APIResponse<string>>(
      API_ENDPOINTS.SEND_OTP,
      { email }
    );
    return response.data;
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (token: string, pin: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.VERIFY_OTP, { token, pin });
  },

  /**
   * Initiate forgot password - sends OTP
   */
  forgotPassword: async (email: string): Promise<OTPResponse> => {
    const response = await apiClient.post<APIResponse<OTPResponse>>(
      API_ENDPOINTS.FORGOT_PASSWORD,
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (data: {
    email: string;
    token: string;
    pin: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, data);
  },

  /**
   * Change password (when logged in)
   */
  changePassword: async (data: {
    email: string;
    password: string;
  }): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.CHANGE_PASSWORD, data);
  },
};
