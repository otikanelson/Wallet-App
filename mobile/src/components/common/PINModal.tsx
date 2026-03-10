import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { CustomModal } from './CustomModal';
import { Button } from './Button';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';

interface PINModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => void;
  loading?: boolean;
}

export const PINModal: React.FC<PINModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handlePinChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const pinCode = pin.join('');
    if (pinCode.length === 4) {
      onSubmit(pinCode);
      setPin(['', '', '', '']);
    }
  };

  const handleClose = () => {
    setPin(['', '', '', '']);
    onClose();
  };

  return (
    <CustomModal visible={visible} onClose={handleClose} title="Enter PIN">
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Enter your 4-digit transaction PIN to continue
        </Text>

        <View style={styles.pinContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={styles.pinInput}
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
          onPress={handleSubmit}
          loading={loading}
          disabled={pin.join('').length !== 4 || loading}
        >
          Confirm
        </Button>

        <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  pinInput: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    ...typography.h2,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  cancelButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
