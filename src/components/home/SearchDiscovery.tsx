'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ProductSearch } from '@/components/pharmacy/ProductSearch';
import { Search } from 'lucide-react';

export function SearchDiscovery() {
  const router = useRouter();

  const quickCategories = [
    { label: 'Cardiovascular', query: 'Cardiovascular' },
    { label: 'Diabetes & Metabolic', query: 'Metabolic' },
    { label: 'Thyroid Care', query: 'Endocrine' },
    { label: 'Gastrointestinal', query: 'Gastrointestinal' },
  ];

  return (
    <section id="search-section" className="bg-white py-16 sm:py-20 border-b border-[#E6ECE7]">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2F5D3A]">
              MEDICINE SEARCH
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#111411]">
              Find your medicine.
            </h2>
            <p className="text-sm sm:text-base text-[#59605A]">
              Search by medicine, brand, manufacturer, strength or SKU.
            </p>
          </div>

          {/* ProductSearch Component with Suspense Boundary for useSearchParams */}
          <div className="max-w-2xl mx-auto text-left">
            <Suspense
              fallback={
                <div className="w-full h-14 rounded-xl border border-[#E6ECE7] bg-white flex items-center px-4 text-neutral-400 gap-3">
                  <Search className="w-5 h-5 text-[#2F5D3A]" />
                  <span className="text-sm">Loading catalogue search...</span>
                </div>
              }
            >
              <ProductSearch
                showHeadline={false}
                onSearchSubmit={(q) => {
                  if (q) {
                    router.push(`/search?q=${encodeURIComponent(q)}`);
                  } else {
                    router.push('/search');
                  }
                }}
              />
            </Suspense>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-[#59605A] mr-1">Popular categories:</span>
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => router.push(`/search?category=${encodeURIComponent(cat.query)}`)}
                className="px-3 py-1.5 rounded-full border border-[#E6ECE7] bg-white text-[#59605A] hover:border-[#2F5D3A]/50 hover:text-[#2F5D3A] hover:bg-[#F3F7F3] transition-colors cursor-pointer"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
