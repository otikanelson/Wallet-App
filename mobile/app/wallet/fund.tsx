import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { Toast } from '@/components/common/Toast';
import { apiClient } from '@/api/client';

export default function FundWallet() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleFund = async () => {
    const amountNum = parseInt(amount);
    if (!amount || amountNum < 100) {
      showToast('Please enter an amount (minimum ₦100)', 'error');
      return;
    }

    setLoading(true);
    try {
      // Call API to initiate payment
      const response: any = await apiClient.post('/fund-wallet', {
        amount: amountNum,
        currency: 'NGN',
        redirectUrl: 'cfcwallet://payment-success', // Deep link for app
      });

      // Backend returns GlobalPay response directly
      // GlobalPay structure: { data: { data: { checkoutUrl } } }
      let paymentLink = null;
      
      if (response?.data?.data?.checkoutUrl) {
        paymentLink = response.data.data.checkoutUrl;
      } else if (response?.data?.checkoutUrl) {
        paymentLink = response.data.checkoutUrl;
      } else if (response?.checkoutUrl) {
        paymentLink = response.checkoutUrl;
      } else if (response?.paymentLink) {
        paymentLink = response.paymentLink;
      }
      
      if (paymentLink) {
        // Open payment link in browser
        const supported = await Linking.canOpenURL(paymentLink);
        if (supported) {
          await Linking.openURL(paymentLink);
          showToast('Redirecting to payment gateway...', 'info');
          // Navigate back after a delay
          setTimeout(() => {
            router.back();
          }, 2000);
        } else {
          showToast('Cannot open payment link', 'error');
        }
      } else {
        console.error('Payment response:', JSON.stringify(response, null, 2));
        showToast('Failed to get payment link. Please try again.', 'error');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast({ ...toast, visible: false })}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fund Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Add Money to Wallet</Text>
        <Text style={styles.subtitle}>
          Enter the amount you want to add to your wallet
        </Text>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₦</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.text.disabled}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.hint}>Minimum amount: ₦100</Text>
        </View>

        {/* Quick Amounts */}
        <View style={styles.section}>
          <Text style={styles.label}>Quick Select</Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickAmountButton,
                  amount === amt.toString() && styles.quickAmountButtonSelected,
                ]}
                onPress={() => setAmount(amt.toString())}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amount === amt.toString() && styles.quickAmountTextSelected,
                  ]}
                >
                  ₦{amt.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fund Button */}
        <Button onPress={handleFund} loading={loading} style={styles.fundButton}>
          Continue to Payment
        </Button>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.text.secondary}
          />
          <Text style={styles.infoText}>
            You will be redirected to a secure payment gateway to complete your transaction
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  currencySymbol: {
    ...typography.h2,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    ...typography.h2,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  hint: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmountButton: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  quickAmountTextSelected: {
    color: colors.surface,
  },
  fundButton: {
    marginTop: spacing.md,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    flex: 1,
  },
});
