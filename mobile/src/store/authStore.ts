import { create } from 'zustand';
import { authAPI } from '@/api/auth.api';
import { saveTokens, removeTokens, clearAllData } from '@/utils/storage';
import { handleAPIError } from '@/api/client';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (email: string) => Promise<string>;
  verifyOTP: (token: string, pin: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (data: {
    email: string;
    token: string;
    pin: string;
    newPassword: string;
  }) => Promise<void>;
  setAuthenticated: (value: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      await saveTokens(response.token, response.refreshToken);
      set({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(data);
      await saveTokens(response.token, response.refreshToken);
      set({ isAuthenticated: true, isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false, isAuthenticated: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await clearAllData();
      set({ isAuthenticated: false, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  sendOTP: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = await authAPI.sendOTP(email);
      set({ isLoading: false });
      return token;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  verifyOTP: async (token: string, pin: string) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.verifyOTP(token, pin);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.forgotPassword(email);
      set({ isLoading: false });
      return response.token;
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resetPassword: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.resetPassword(data);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = handleAPIError(error);
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },

  clearError: () => {
    set({ error: null });
  },
}));
