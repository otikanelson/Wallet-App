import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { PINModal } from '@/components/common/PINModal';
import { Toast } from '@/components/common/Toast';
import { utilityAPI } from '@/api/utility.api';

type Network = string;

export default function Airtime() {
  const router = useRouter();
  const [network, setNetwork] = useState<Network>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [showPINModal, setShowPINModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const networks = [
    { id: 'MTN', name: 'MTN' },
    { id: 'AIRTEL', name: 'Airtel' },
    { id: 'GLO', name: 'Glo' },
    { id: '9MOBILE', name: '9mobile' },
  ];

  const quickAmounts = [
    100, 200, 400, 500,
    1000, 2000, 3000, 4000,
    5000, 10000, 15000, 20000,
    25000, 30000, 35000, 40000,
    45000, 50000, 55000, 60000,
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleContinue = () => {
    if (!network) {
      showToast('Please select a network', 'error');
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 11) {
      showToast('Please enter a valid 11-digit phone number', 'error');
      return;
    }
    if (!amount || parseInt(amount) < 50) {
      showToast('Please enter an amount (minimum ₦50)', 'error');
      return;
    }

    setShowPINModal(true);
  };

  const handlePINSubmit = async (pin: string) => {
    setLoading(true);
    try {
      const serviceMap: Record<string, string> = {
        'MTN': 'MTNVTU',
        'AIRTEL': 'AIRTELVTU',
        'GLO': 'GLOVTU',
        '9MOBILE': '9MOBILEVTU',
      };

      await utilityAPI.purchaseAirtime({
        amountRecharge: parseInt(amount),
        pin,
        phoneNumber,
        network,
        service: serviceMap[network] || 'MTNVTU',
      });

      setShowPINModal(false);
      showToast('Airtime purchase successful!', 'success');
      setNetwork('');
      setPhoneNumber('');
      setAmount('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Purchase failed. Please try again.';
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
        <Text style={styles.headerTitle}>Airtime</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Network Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Network</Text>
          <View style={styles.networkGrid}>
            {networks.map((net) => (
              <TouchableOpacity
                key={net.id}
                style={[
                  styles.networkButton,
                  network === net.id && styles.networkButtonSelected,
                ]}
                onPress={() => setNetwork(net.id)}
              >
                <Text
                  style={[
                    styles.networkButtonText,
                    network === net.id && styles.networkButtonTextSelected,
                  ]}
                >
                  {net.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Phone Number */}
        {network && (
          <View style={styles.section}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="08012345678"
              placeholderTextColor={colors.text.disabled}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>
        )}

        {/* Amount Selection */}
        {network && phoneNumber && (
          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountGrid}>
              {quickAmounts.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.amountButton,
                    amount === amt.toString() && styles.amountButtonSelected,
                  ]}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text
                    style={[
                      styles.amountButtonAmount,
                      amount === amt.toString() && styles.amountButtonAmountSelected,
                    ]}
                  >
                    #{amt}
                  </Text>
                  <Text
                    style={[
                      styles.amountButtonPay,
                      amount === amt.toString() && styles.amountButtonPaySelected,
                    ]}
                  >
                    Pay #{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Continue Button */}
        {amount && (
          <Button onPress={handleContinue} style={styles.continueButton}>
            Continue
          </Button>
        )}
      </ScrollView>

      <PINModal
        visible={showPINModal}
        onClose={() => setShowPINModal(false)}
        onSubmit={handlePINSubmit}
        loading={loading}
      />
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
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  networkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  networkButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  networkButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  networkButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  networkButtonTextSelected: {
    color: colors.surface,
  },
  input: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.text.primary,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amountButton: {
    width: '23%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 60,
  },
  amountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  amountButtonAmount: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  amountButtonAmountSelected: {
    color: colors.surface,
  },
  amountButtonPay: {
    fontSize: 10,
    color: colors.status.error,
  },
  amountButtonPaySelected: {
    color: colors.surface,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
