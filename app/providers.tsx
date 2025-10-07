'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactQueryProvider } from '@/lib/react-query';
import { ToastProvider } from '@/components';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ReactQueryProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </ReactQueryProvider>
    </ToastProvider>
  );
}