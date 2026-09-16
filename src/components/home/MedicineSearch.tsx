'use client';

import React, { useState } from 'react';
import { Search, ArrowRight, Pill, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface MedicineSearchProps {
  onSearchSelect?: (term: string) => void;
}

export function MedicineSearch({ onSearchSelect }: MedicineSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const quickPills = [
    'Atorvastatin (Lipitor)',
    'Metformin ER (Glucophage)',
    'Lisinopril (Prinivil)',
    'Amlodipine (Norvasc)',
    'Levothyroxine (Synthroid)',
    'Omeprazole (Prilosec)',
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSearchSelect && searchTerm) {
      onSearchSelect(searchTerm);
    }
  }

  return (
    <section id="search-section" className="bg-[#EEF1E6] py-16 sm:py-24 border-b border-[#E4E7DC]">
      <Container size="narrow">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#43522B] border border-[#D1D6C5]">
            <Pill className="h-3.5 w-3.5 text-[#596B3A]" />
            <span>Search Generic Directory</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#171914]">
            Find what you&apos;re looking for.
          </h2>

          <p className="text-xs sm:text-sm text-[#52564C] max-w-lg mx-auto">
            Search active generic compounds or reference brand names for chronic therapy.
            All products are verified for 90-day maintenance supply.
          </p>
        </div>

        {/* Large High-Contrast Search Input */}
        <form onSubmit={handleSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-xs rounded-2xl bg-white border border-[#D1D6C5] focus-within:border-[#596B3A] focus-within:ring-2 focus-within:ring-[#596B3A]/20 transition-all">
            <div className="pointer-events-none pl-5 sm:pl-6 text-[#596B3A]">
              <Search className="h-6 w-6" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by generic (e.g. Metformin) or brand (Glucophage)..."
              className="w-full h-14 sm:h-18 pl-4 pr-16 text-base sm:text-lg text-[#171914] placeholder:text-[#8A9081] bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Submit search"
              className="absolute right-3 flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl bg-[#596B3A] text-white hover:bg-[#43522B] transition-colors cursor-pointer"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Popular searches / pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-[#52564C] flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#596B3A]" /> Popular:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => {
                setSearchTerm(pill.split(' ')[0] ?? '');
                if (onSearchSelect) onSearchSelect(pill.split(' ')[0] ?? '');
              }}
              className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#43522B] border border-[#D1D6C5] hover:border-[#596B3A] hover:bg-[#FAFAF7] transition-all cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
