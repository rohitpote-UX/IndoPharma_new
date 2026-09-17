import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { CartClient } from './CartClient';

export const metadata: Metadata = {
  title: 'Your Cart | IndoPharm',
  description: 'Review your selected maintenance therapies, transparent landed costs, and destination eligibility.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-20 text-center text-xs text-[#59605A]">
          Loading your cart...
        </div>
      }
    >
      <CartClient />
    </Suspense>
  );
}
