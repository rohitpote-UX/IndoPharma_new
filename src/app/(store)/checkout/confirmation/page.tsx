import { Metadata } from 'next';
import { Suspense } from 'react';
import { ConfirmationClient } from './ConfirmationClient';

export const metadata: Metadata = {
  title: 'Order Confirmed — IndoPharm Direct',
  description: 'Your pharmaceutical import order is confirmed and scheduled for bonded dispatch.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-16 px-4">
          <div className="max-w-xl mx-auto space-y-4 animate-pulse">
            <div className="h-12 w-12 bg-[#F3F7F3] rounded-full mx-auto" />
            <div className="h-8 bg-[#E6ECE7] rounded w-1/2 mx-auto" />
            <div className="h-4 bg-[#E6ECE7] rounded w-3/4 mx-auto" />
          </div>
        </div>
      }
    >
      <ConfirmationClient />
    </Suspense>
  );
}
