import React from 'react';
import { DestinationProvider } from '@/lib/context/DestinationContext';
import { StoreShell } from './StoreShell';

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DestinationProvider>
      <StoreShell>{children}</StoreShell>
    </DestinationProvider>
  );
}
