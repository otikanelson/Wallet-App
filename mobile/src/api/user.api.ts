import apiClient from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { User, APIResponse } from './types';

export const userAPI = {
  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<APIResponse<User>>(
      API_ENDPOINTS.GET_CURRENT_USER
    );
    return response.data;
  },

  /**
   * Update user profile
   */
  updateUser: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.patch<APIResponse<User>>(
      API_ENDPOINTS.UPDATE_USER,
      data
    );
    return response.data;
  },

  /**
   * Check if user has transaction PIN set
   */
  checkTransactionPIN: async (): Promise<{ hasPIN: boolean }> => {
    const response = await apiClient.get<APIResponse<{ hasPIN: boolean }>>(
      API_ENDPOINTS.CHECK_TRANSACTION_PIN
    );
    return response.data;
  },

  /**
   * Set or change transaction PIN
   */
  setTransactionPIN: async (transactionPin: string, oldPin?: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.UPDATE_TRANSACTION_PIN, {
      transactionPin,
      ...(oldPin && { oldPin }),
    });
  },

  /**
   * Update push notification token
   */
  updatePushToken: async (pushToken: string): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.UPDATE_PUSH_TOKEN, { pushToken });
  },

  /**
   * Update profile picture
   */
  updateProfilePicture: async (profilePicture: string): Promise<any> => {
    const response = await apiClient.patch(API_ENDPOINTS.UPDATE_PROFILE_PICTURE, {
      profilePicture,
    });
    return response;
  },
};
