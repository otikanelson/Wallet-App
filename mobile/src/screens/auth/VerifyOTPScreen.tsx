import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common/Button';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useAuthStore } from '@/store/authStore';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface VerifyOTPScreenProps {
  navigation: any; // expo-router's router object
  route: {
    params: {
      email: string;
      token: string;
      type: 'verify' | 'reset';
    };
  };
}

export const VerifyOTPScreen: React.FC<VerifyOTPScreenProps> = ({
  navigation: router,
  route,
}) => {
  const { email, token, type } = route.params;
  const { verifyOTP, sendOTP, forgotPassword, isLoading, error, clearError } =
    useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 4) {
      return;
    }

    try {
      clearError();
      await verifyOTP(token, otpCode);

      if (type === 'reset') {
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email, token, pin: otpCode },
        });
      } else {
        // Handle email verification success
        router.push('/(auth)/login');
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      clearError();
      if (type === 'reset') {
        await forgotPassword(email);
      } else {
        await sendOTP(email);
      }
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      // Error is handled by the store
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 4-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onDismiss={clearError} />}

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <Button
          onPress={handleVerify}
          loading={isLoading}
          disabled={otp.join('').length !== 4}
          style={styles.verifyButton}
        >
          Verify
        </Button>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Sending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
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
  email: {
    color: colors.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpInput: {
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
  otpInputFilled: {
    borderColor: colors.primary,
  },
  otpInputError: {
    borderColor: colors.status.error,
  },
  verifyButton: {
    marginTop: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  resendLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
