import { SetTransactionPINScreen } from '@/screens/auth/SetTransactionPINScreen';
import { useRouter } from 'expo-router';

export default function SetPin() {
  const router = useRouter();
  return <SetTransactionPINScreen navigation={router} />;
}
