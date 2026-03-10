import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { Button } from '@/components/common/Button';
import { PINModal } from '@/components/common/PINModal';
import { Toast } from '@/components/common/Toast';
import { utilityAPI } from '@/api/utility.api';

type DISCO = string;

export default function Electricity() {
  const router = useRouter();
  const [disco, setDisco] = useState<DISCO>('');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showPINModal, setShowPINModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });
  const [discos, setDiscos] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingDiscos, setLoadingDiscos] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    fetchDiscos();
  }, []);

  const fetchDiscos = async () => {
    setLoadingDiscos(true);
    try {
      const response: any = await utilityAPI.getElectricityProviders();
      // Backend returns: { message, data: { data: [...providers] } }
      const providersData = response?.data?.data || response?.data || [];
      const providers = Array.isArray(providersData) ? providersData : [];
      
      if (providers.length > 0) {
        setDiscos(providers.map((p: any) => ({
          id: p.code || p.id || p.billerCode || p.disco,
          name: p.name || p.billerName || p.disco_name,
        })));
      } else {
        // Use default discos if no data
        setDiscos([
          { id: 'EKEDC', name: 'Eko Electric' },
          { id: 'IKEDC', name: 'Ikeja Electric' },
          { id: 'AEDC', name: 'Abuja Electric' },
          { id: 'PHED', name: 'Port Harcourt Electric' },
          { id: 'KEDCO', name: 'Kano Electric' },
          { id: 'PHEDC', name: 'Port Harcourt Electric' },
          { id: 'JED', name: 'Jos Electric' },
          { id: 'IBEDC', name: 'Ibadan Electric' },
          { id: 'KAEDCO', name: 'Kaduna Electric' },
          { id: 'EEDC', name: 'Enugu Electric' },
        ]);
      }
    } catch (error: any) {
      // Use default discos if API fails
      setDiscos([
        { id: 'EKEDC', name: 'Eko Electric' },
        { id: 'IKEDC', name: 'Ikeja Electric' },
        { id: 'AEDC', name: 'Abuja Electric' },
        { id: 'PHED', name: 'Port Harcourt Electric' },
        { id: 'KEDCO', name: 'Kano Electric' },
        { id: 'PHEDC', name: 'Port Harcourt Electric' },
        { id: 'JED', name: 'Jos Electric' },
        { id: 'IBEDC', name: 'Ibadan Electric' },
        { id: 'KAEDCO', name: 'Kaduna Electric' },
        { id: 'EEDC', name: 'Enugu Electric' },
      ]);
    } finally {
      setLoadingDiscos(false);
    }
  };

  const handleVerify = async () => {
    if (!disco) {
      showToast('Please select a DISCO', 'error');
      return;
    }
    if (!meterNumber || meterNumber.length < 10) {
      showToast('Please enter a valid meter number', 'error');
      return;
    }

    setVerifying(true);
    try {
      const response: any = await utilityAPI.verifyElectricityMeter({
        billerCode: disco,
        meterNumber,
      });
      // Backend returns: { message, data: { data: { customerName } } }
      const customerData = response?.data?.data || response?.data || {};
      const name = customerData.customerName || customerData.name || customerData.customer_name;
      
      if (name) {
        setCustomerName(name);
        showToast('Meter verified successfully', 'success');
      } else {
        showToast('Could not retrieve customer name', 'warning');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to verify meter', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    if (!customerName) {
      showToast('Please verify your meter number', 'error');
      return;
    }
    if (!amount || parseInt(amount) < 500) {
      showToast('Please enter an amount (minimum ₦500)', 'error');
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 11) {
      showToast('Please enter a valid 11-digit phone number', 'error');
      return;
    }

    setShowPINModal(true);
  };

  const handlePINSubmit = async (pin: string) => {
    setLoading(true);
    try {
      await utilityAPI.purchaseElectricity({
        amountRecharge: parseInt(amount),
        pin,
        phoneNumber,
        disco,
        meterNumber,
      });
      setShowPINModal(false);
      showToast('Electricity purchase successful!', 'success');
      setDisco('');
      setMeterNumber('');
      setAmount('');
      setPhoneNumber('');
      setCustomerName('');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Purchase failed. Please try again.', 'error');
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Electricity</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DISCO Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select DISCO</Text>
          {loadingDiscos ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading providers...</Text>
            </View>
          ) : (
            <View style={styles.discoGrid}>
              {discos.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[
                    styles.discoButton,
                    disco === d.id && styles.discoButtonSelected,
                  ]}
                  onPress={() => setDisco(d.id)}
                >
                  <Text
                    style={[
                      styles.discoButtonText,
                      disco === d.id && styles.discoButtonTextSelected,
                    ]}
                  >
                    {d.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Meter Number */}
        {disco && (
          <View style={styles.section}>
            <Text style={styles.label}>Meter Number</Text>
            <View style={styles.verifyContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter meter number"
                placeholderTextColor={colors.text.disabled}
                value={meterNumber}
                onChangeText={(text) => {
                  // Only allow numbers
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setMeterNumber(cleaned);
                }}
                keyboardType="numeric"
                maxLength={15}
              />
              <Button
                onPress={handleVerify}
                loading={verifying}
                style={styles.verifyButton}
                disabled={meterNumber.length < 10}
              >
                Verify
              </Button>
            </View>
            {customerName && (
              <View style={styles.customerInfo}>
                <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                <Text style={styles.customerName}>{customerName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Amount */}
        {customerName && (
          <View style={styles.section}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={colors.text.disabled}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
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
        )}

        {/* Phone Number */}
        {customerName && amount && (
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

        {/* Continue Button */}
        {customerName && amount && phoneNumber && (
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
  discoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  discoButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  discoButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  discoButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  discoButtonTextSelected: {
    color: colors.surface,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  verifyContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...typography.body,
    color: colors.text.primary,
  },
  verifyButton: {
    paddingHorizontal: spacing.lg,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.status.success + '10',
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  customerName: {
    ...typography.body,
    color: colors.status.success,
    fontWeight: '600',
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quickAmountButton: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickAmountButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickAmountText: {
    ...typography.caption,
    color: colors.text.primary,
    fontWeight: '600',
  },
  quickAmountTextSelected: {
    color: colors.surface,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
