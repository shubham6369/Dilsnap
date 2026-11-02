'use client';

import React from 'react';
import { ToastProvider } from '@/components/Toast';
import { ConfirmProvider } from '@/components/ConfirmModal';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
