import type { Metadata } from 'next';
import { LoginScreen } from '../_components/auth/LoginScreen';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return <LoginScreen />;
}
