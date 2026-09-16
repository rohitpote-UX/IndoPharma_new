import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchClient } from './SearchClient';

export const metadata: Metadata = {
  title: 'Search Medicines | IndoPharm',
  description:
    'Search verified generic maintenance therapies by active pharmaceutical ingredient, brand reference name, or category.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white py-20 text-center text-xs text-[#59605A]">Loading discovery engine...</div>}>
      <SearchClient />
    </Suspense>
  );
}
