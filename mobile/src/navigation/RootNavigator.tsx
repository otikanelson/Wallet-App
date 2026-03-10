import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { getAccessToken } from '@/utils/storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

// Placeholder for AppNavigator (will be created in Phase 3)
const AppNavigator = () => {
  return (
    <View style={styles.placeholder}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, setAuthenticated } = useAuthStore();
  const { fetchUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        setAuthenticated(true);
        await fetchUser();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
