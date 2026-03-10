import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useUserStore } from '@/store/userStore';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface SetTransactionPINScreenProps {
  navigation: any; // expo-router's router object
}

export const SetTransactionPINScreen: React.FC<
  SetTransactionPINScreenProps
> = ({ navigation: router }) => {
  const { setTransactionPIN, checkTransactionPIN, isLoading, error, clearError } = useUserStore();

  const [checkingPIN, setCheckingPIN] = useState(true);
  const [hasPIN, setHasPIN] = useState(false);
  const [step, setStep] = useState<'old' | 'enter' | 'confirm'>('enter');
  const [oldPin, setOldPin] = useState(['', '', '', '']);
  const [pin, setPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    checkExistingPIN();
  }, []);

  const checkExistingPIN = async () => {
    try {
      const hasPINSet = await checkTransactionPIN();
      setHasPIN(hasPINSet);
      if (hasPINSet) {
        setStep('old');
      }
    } catch (error) {
      console.error('Error checking PIN:', error);
    } finally {
      setCheckingPIN(false);
    }
  };

  const getCurrentPin = () => {
    if (step === 'old') return oldPin;
    if (step === 'enter') return pin;
    return confirmPin;
  };

  const setCurrentPin = (newPin: string[]) => {
    if (step === 'old') setOldPin(newPin);
    else if (step === 'enter') setPin(newPin);
    else setConfirmPin(newPin);
  };

  const currentPin = getCurrentPin();

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newPin = [...currentPin];
    newPin[index] = value;
    setCurrentPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !currentPin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const pinCode = currentPin.join('');
    if (pinCode.length !== 4) {
      return;
    }

    if (step === 'old') {
      setStep('enter');
      setPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else if (step === 'enter') {
      setStep('confirm');
      setConfirmPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const pinCode = pin.join('');
    const confirmPinCode = confirmPin.join('');

    if (pinCode !== confirmPinCode) {
      Alert.alert('Error', "PINs don't match. Please try again.");
      setStep(hasPIN ? 'old' : 'enter');
      setOldPin(['', '', '', '']);
      setPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return;
    }

    try {
      clearError();
      const oldPinCode = hasPIN ? oldPin.join('') : undefined;
      await setTransactionPIN(pinCode, oldPinCode);
      
      const message = hasPIN 
        ? 'Transaction PIN changed successfully!' 
        : 'Transaction PIN set successfully!';
      
      Alert.alert('Success', message, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      // Check if error is about incorrect old PIN
      if (err.response?.data?.message?.includes('Incorrect old PIN')) {
        Alert.alert('Error', 'Incorrect old PIN. Please try again.');
        setStep('old');
        setOldPin(['', '', '', '']);
        setPin(['', '', '', '']);
        setConfirmPin(['', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
      // Error is handled by the store
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setConfirmPin(['', '', '', '']);
    } else if (step === 'enter' && hasPIN) {
      setStep('old');
      setPin(['', '', '', '']);
    } else {
      router.back();
    }
  };

  const getTitle = () => {
    if (step === 'old') return 'Enter Current PIN';
    if (step === 'enter') return hasPIN ? 'Enter New PIN' : 'Set Transaction PIN';
    return 'Confirm New PIN';
  };

  const getSubtitle = () => {
    if (step === 'old') return 'Enter your current 4-digit PIN';
    if (step === 'enter') return hasPIN ? 'Enter your new 4-digit PIN' : 'Enter a 4-digit PIN to secure your transactions';
    return 'Re-enter your new PIN to confirm';
  };

  if (checkingPIN) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking PIN status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="keypad" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {/* PIN Input */}
        <View style={styles.pinContainer}>
          {currentPin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.pinInput,
                digit && styles.pinInputFilled,
                error && styles.pinInputError,
              ]}
              value={digit}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          onPress={handleContinue}
          loading={isLoading}
          disabled={currentPin.join('').length !== 4}
          style={styles.continueButton}
        >
          {step === 'confirm' ? (hasPIN ? 'Change PIN' : 'Set PIN') : 'Continue'}
        </Button>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.text.secondary}
          />
          <Text style={styles.infoText}>
            {hasPIN 
              ? "You're changing your transaction PIN" 
              : "You'll need this PIN to authorize all transactions"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  backButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  pinInput: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    ...typography.h2,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  pinInputFilled: {
    borderColor: colors.primary,
  },
  pinInputError: {
    borderColor: colors.status.error,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  infoText: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
});
