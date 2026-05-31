import type { Metadata } from 'next';
import { RegisterScreen } from '../_components/auth/RegisterScreen';

export const metadata: Metadata = {
  title: 'Create Account',
};

export default function RegisterPage() {
  return <RegisterScreen />;
}
