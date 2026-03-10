import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const router = useRouter();
  return <WelcomeScreen navigation={router} />;
}
