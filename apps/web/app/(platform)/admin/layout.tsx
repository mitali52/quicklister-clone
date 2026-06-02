import type { ReactNode } from 'react';
import { RoleGuard } from '../_components/RoleGuard';

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>;
}
