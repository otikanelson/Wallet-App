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

type Network = string;

interface DataPlan {
  code: string;
  name: string;
  price: number;
  validity: string;
}

export default function Data() {
  const router = useRouter();
  const [network, setNetwork] = useState<Network>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPINModal, setShowPINModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const networks = [
    { id: 'MTNDATA', name: 'MTN' },
    { id: 'AIRTELDATA', name: 'Airtel' },
    { id: 'GLODATA', name: 'Glo' },
    { id: '9MOBILEDATA', name: '9mobile' },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (network) {
      fetchDataPlans();
    }
  }, [network]);

  const fetchDataPlans = async () => {
    setLoadingPlans(true);
    setDataPlans([]);
    try {
      const response: any = await utilityAPI.getDataPlans(network);
      // Backend returns: { message, data: { data: [...plans] } }
      const plansData = response?.data?.data || response?.data || [];
      const plans = Array.isArray(plansData) ? plansData : [];
      
      if (plans.length === 0) {
        showToast('No data plans available for this network', 'warning');
      }
      
      const mappedPlans: DataPlan[] = plans.map((plan: any) => ({
        code: plan.code || plan.id || plan.planId,
        name: plan.name || plan.description || plan.planName,
        price: parseFloat(plan.price || plan.amount || 0),
        validity: plan.validity || plan.duration || '30 days',
      }));
      setDataPlans(mappedPlans);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load data plans';
      showToast(errorMessage, 'error');
      setDataPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleContinue = () => {
    if (!network) {
      showToast('Please select a network', 'error');
      return;
    }
    if (!selectedPlan) {
      showToast('Please select a data plan', 'error');
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
      if (!selectedPlan) return;

      await utilityAPI.purchaseData({
        amountRecharge: selectedPlan.price,
        pin,
        phoneNumber,
        network,
        service: network,
        codeNetwork: selectedPlan.code,
      });

      setShowPINModal(false);
      showToast('Data purchase successful!', 'success');
      setNetwork('');
      setPhoneNumber('');
      setSelectedPlan(null);
      setDataPlans([]);
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data</Text>
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

        {/* Data Plans */}
        {network && (
          <View style={styles.section}>
            <Text style={styles.label}>Select Data Plan</Text>
            {loadingPlans ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading plans...</Text>
              </View>
            ) : (
              <View style={styles.plansList}>
                {dataPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.code}
                    style={[
                      styles.planCard,
                      selectedPlan?.code === plan.code && styles.planCardSelected,
                    ]}
                    onPress={() => setSelectedPlan(plan)}
                  >
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planValidity}>{plan.validity}</Text>
                    </View>
                    <Text style={styles.planPrice}>₦{plan.price}</Text>
                    {selectedPlan?.code === plan.code && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Phone Number */}
        {selectedPlan && (
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
        {selectedPlan && (
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
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  plansList: {
    gap: spacing.sm,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  planValidity: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  planPrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    marginRight: spacing.sm,
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
  continueButton: {
    marginTop: spacing.md,
  },
});
