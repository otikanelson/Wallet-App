import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  BALANCE_VISIBLE: 'balanceVisible',
};

// Token management
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken);
  } catch (error) {
    console.error('Error saving tokens:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

export const removeTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

// User data management
export const saveUserData = async (userData: any) => {
  try {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async (): Promise<any | null> => {
  try {
    const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await SecureStore.deleteItemAsync(KEYS.USER_DATA);
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

// Balance visibility preference
export const saveBalanceVisibility = async (visible: boolean) => {
  try {
    await SecureStore.setItemAsync(KEYS.BALANCE_VISIBLE, visible.toString());
  } catch (error) {
    console.error('Error saving balance visibility:', error);
  }
};

export const getBalanceVisibility = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(KEYS.BALANCE_VISIBLE);
    return value === 'true';
  } catch (error) {
    console.error('Error getting balance visibility:', error);
    return true; // Default to visible
  }
};

// Clear all data
export const clearAllData = async () => {
  try {
    await removeTokens();
    await removeUserData();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
