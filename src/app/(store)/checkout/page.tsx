import { Metadata } from 'next';
import { Suspense } from 'react';
import { CheckoutClient } from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout — IndoPharm Direct',
  description: 'Complete your direct pharmaceutical order with bonded cold-chain shipping.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-16 px-4">
          <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
            <div className="h-10 bg-[#E6ECE7] rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 h-80 bg-[#F3F7F3] rounded-xl" />
              <div className="lg:col-span-4 h-80 bg-[#F3F7F3] rounded-xl" />
            </div>
          </div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
