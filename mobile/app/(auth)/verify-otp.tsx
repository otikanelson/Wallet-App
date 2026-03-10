import { VerifyOTPScreen } from '@/screens/auth/VerifyOTPScreen';
import { useRouter } from 'expo-router';

export default function VerifyOTP() {
  const router = useRouter();
  return <VerifyOTPScreen navigation={router} />;
}
