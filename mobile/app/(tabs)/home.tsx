import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

export default function Home() {
  const router = useRouter();
  const { user, fetchUser } = useUserStore();
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  // Refresh balance when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance || '0');
    return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const quickAccessItems = [
    {
      id: 'airtime',
      title: 'Buy airtime',
      icon: 'call' as const,
      color: '#10B981',
      route: '/services/airtime',
    },
    {
      id: 'data',
      title: 'Buy internet',
      icon: 'globe' as const,
      color: '#F59E0B',
      route: '/services/data',
    },
    {
      id: 'tv',
      title: 'TV Bill',
      icon: 'tv' as const,
      color: '#8B5CF6',
      route: '/services/cable',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.avatar}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>CFC APP</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceLabel}>
              <Text style={styles.balanceLabelText}>Available Balance</Text>
              <TouchableOpacity
                onPress={() => setBalanceVisible(!balanceVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.transactionHistoryLink}>
                Transaction History
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            {balanceVisible ? formatBalance(user?.totalFund || '0') : '₦****'}
          </Text>

          <TouchableOpacity
            style={styles.addFundButton}
            onPress={() => router.push('/wallet/fund')}
          >
            <Ionicons name="add-circle" size={20} color={colors.surface} />
            <Text style={styles.addFundButtonText}>Add Fund</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickAccessGrid}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessItem}
                onPress={() => router.push(item.route as any)}
              >
                <View
                  style={[
                    styles.quickAccessIcon,
                    { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.quickAccessText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>

          {/* Empty State */}
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={colors.text.disabled} />
            <Text style={styles.emptyStateText}>No transactions found</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  profileButton: {
    padding: spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.status.error,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  balanceLabelText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  transactionHistoryLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  addFundButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  addFundButtonText: {
    ...typography.button,
    color: colors.surface,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAccessItem: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAccessIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickAccessText: {
    ...typography.caption,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});
