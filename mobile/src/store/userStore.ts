import { create } from 'zustand';
import { User } from '@/api/types';
import { userAPI } from '@/api/user.api';
import { handleAPIError } from '@/api/client';
import { saveUserData, removeUserData } from '@/utils/storage';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  balanceVisible: boolean;
  
  // Actions
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setTransactionPIN: (pin: string, oldPin?: string) => Promise<void>;
  checkTransactionPIN: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
  toggleBalanceVisibility: () => void;
  clearUser: () => void;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  balanceVisible: true,

  fetchUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await userAPI.getCurrentUser();
      await saveUserData(user);
      set({ user, isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await userAPI.updateUser(data);
      await saveUserData(updatedUser);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setTransactionPIN: async (pin: string, oldPin?: string) => {
    set({ isLoading: true, error: null });
    try {
      await userAPI.setTransactionPIN(pin, oldPin);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  checkTransactionPIN: async (): Promise<boolean> => {
    try {
      const result = await userAPI.checkTransactionPIN();
      return result.hasPIN;
    } catch (error) {
      console.error('Failed to check transaction PIN:', error);
      return false;
    }
  },

  refreshBalance: async () => {
    try {
      const user = await userAPI.getCurrentUser();
      set({ user });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  },

  toggleBalanceVisibility: () => {
    set((state) => ({ balanceVisible: !state.balanceVisible }));
  },

  clearUser: () => {
    removeUserData();
    set({ user: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
