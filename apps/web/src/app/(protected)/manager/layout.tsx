import React from 'react';
import { AuthGuard } from '../../../components/auth/AuthGuard';
import { AppShell } from '../../../components/layouts/AppShell';

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>
        {children}
      </AppShell>
    </AuthGuard>
  );
}
