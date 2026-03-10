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

type Provider = string;

interface Package {
  code: string;
  name: string;
  price: number;
}

export default function Cable() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider>('');
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [showPINModal, setShowPINModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const providers = [
    { id: 'DSTV', name: 'DSTV' },
    { id: 'GOTV', name: 'GOTV' },
    { id: 'STARTIMES', name: 'Startimes' },
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  useEffect(() => {
    if (provider) {
      setSmartCardNumber('');
      setCustomerName('');
      setSelectedPackage(null);
      fetchPackages();
    }
  }, [provider]);

  const fetchPackages = async () => {
    setLoadingPackages(true);
    setPackages([]);
    try {
      // API expects lowercase provider names
      const providerLower = provider.toLowerCase();
      const response: any = await utilityAPI.getTVPackages(providerLower);
      
      // Backend returns: { message, data: { data: [...packages] } }
      const packagesData = response?.data?.data || response?.data || [];
      const pkgs = Array.isArray(packagesData) ? packagesData : [];
      
      if (pkgs.length === 0) {
        showToast('No packages available for this provider', 'warning');
      }
      
      const mappedPackages: Package[] = pkgs.map((pkg: any) => ({
        code: pkg.code || pkg.id || pkg.billerCode,
        name: pkg.name || pkg.description || pkg.packageName,
        price: parseFloat(pkg.price || pkg.amount || 0),
      }));
      setPackages(mappedPackages);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load packages';
      showToast(errorMessage, 'error');
      setPackages([]);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleVerify = async () => {
    if (!smartCardNumber || smartCardNumber.length < 10) {
      showToast('Please enter a valid smart card number', 'error');
      return;
    }

    setVerifying(true);
    try {
      const response: any = await utilityAPI.verifySmartCard({
        billerId: provider,
        smartCardNo: smartCardNumber,
      });
      // Backend returns: { message, data: { data: { customerName } } }
      const customerData = response?.data?.data || response?.data || {};
      const name = customerData.customerName || customerData.name || customerData.customer_name;
      
      if (name) {
        setCustomerName(name);
        showToast('Smart card verified successfully', 'success');
      } else {
        showToast('Could not retrieve customer name', 'warning');
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to verify smart card', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleContinue = () => {
    if (!provider) {
      showToast('Please select a provider', 'error');
      return;
    }
    if (!selectedPackage) {
      showToast('Please select a package', 'error');
      return;
    }
    if (!customerName) {
      showToast('Please verify your smart card number', 'error');
      return;
    }

    setShowPINModal(true);
  };

  const handlePINSubmit = async (pin: string) => {
    setLoading(true);
    try {
      await utilityAPI.purchaseTV({
        amountRecharge: selectedPackage!.price,
        pin,
        code: selectedPackage!.code,
        tvType: provider,
        meterNumber: smartCardNumber,
      });
      setShowPINModal(false);
      showToast('Cable subscription successful!', 'success');
      setProvider('');
      setSmartCardNumber('');
      setSelectedPackage(null);
      setCustomerName('');
      setPackages([]);
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
        <Text style={styles.headerTitle}>Cable TV</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Provider Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Select Provider</Text>
          <View style={styles.providerGrid}>
            {providers.map((prov) => (
              <TouchableOpacity
                key={prov.id}
                style={[
                  styles.providerButton,
                  provider === prov.id && styles.providerButtonSelected,
                ]}
                onPress={() => setProvider(prov.id)}
              >
                <Text
                  style={[
                    styles.providerButtonText,
                    provider === prov.id && styles.providerButtonTextSelected,
                  ]}
                >
                  {prov.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Smart Card Number */}
        {provider && (
          <View style={styles.section}>
            <Text style={styles.label}>Smart Card Number</Text>
            <View style={styles.verifyContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter smart card number"
                placeholderTextColor={colors.text.disabled}
                value={smartCardNumber}
                onChangeText={(text) => {
                  // Only allow numbers
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setSmartCardNumber(cleaned);
                }}
                keyboardType="numeric"
                maxLength={15}
              />
              <Button
                onPress={handleVerify}
                loading={verifying}
                style={styles.verifyButton}
                disabled={smartCardNumber.length < 10}
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

        {/* Packages */}
        {provider && customerName && (
          <View style={styles.section}>
            <Text style={styles.label}>Select Package</Text>
            {loadingPackages ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading packages...</Text>
              </View>
            ) : (
              <View style={styles.packagesList}>
                {packages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.code}
                    style={[
                      styles.packageCard,
                      selectedPackage?.code === pkg.code && styles.packageCardSelected,
                    ]}
                    onPress={() => setSelectedPackage(pkg)}
                  >
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageName}>{pkg.name}</Text>
                    </View>
                    <Text style={styles.packagePrice}>₦{pkg.price.toLocaleString()}</Text>
                    {selectedPackage?.code === pkg.code && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Continue Button */}
        {selectedPackage && customerName && (
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
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  providerButton: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  providerButtonText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  providerButtonTextSelected: {
    color: colors.surface,
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
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  packagesList: {
    gap: spacing.sm,
  },
  packageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packageCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  packageInfo: {
    flex: 1,
  },
  packageName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  packagePrice: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
