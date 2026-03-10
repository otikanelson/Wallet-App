import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { useRouter } from 'expo-router';

export default function Register() {
  const router = useRouter();
  return <RegisterScreen navigation={router} />;
}
