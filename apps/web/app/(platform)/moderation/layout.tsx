import type { ReactNode } from 'react';
import { RoleGuard } from '../_components/RoleGuard';

export default function ModerationLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RoleGuard allowedRoles={['moderator', 'admin']}>{children}</RoleGuard>;
}
