'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/layout/Footer';

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckout = pathname.startsWith('/checkout');

  return (
    <div className="flex min-h-screen flex-col">
      {!isCheckout && <Header />}
      <main className="flex-1">{children}</main>
      {!isCheckout && <Footer />}
    </div>
  );
}
