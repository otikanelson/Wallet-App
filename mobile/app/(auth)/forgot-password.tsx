import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const router = useRouter();
  return <ForgotPasswordScreen navigation={router} />;
}
