import { ResetPasswordScreen } from '@/screens/auth/ResetPasswordScreen';
import { useRouter } from 'expo-router';

export default function ResetPassword() {
  const router = useRouter();
  return <ResetPasswordScreen navigation={router} />;
}
