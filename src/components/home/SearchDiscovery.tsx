'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function SearchDiscovery() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const quickCategories = [
    { label: 'Cardiovascular', query: 'Cardiovascular' },
    { label: 'Diabetes & Metabolic', query: 'Metabolic' },
    { label: 'Thyroid Care', query: 'Endocrine' },
    { label: 'Gastrointestinal', query: 'Gastrointestinal' },
  ];

  return (
    <section className="bg-white py-16 sm:py-24 border-b border-[#E6ECE7]">
      <Container>
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold tracking-tight text-[#111411]">
              Find your medicine.
            </h2>
            <p className="text-base sm:text-lg text-[#59605A]">
              Search by product, brand or category.
            </p>
          </div>

          {/* Large Search Field with Search CTA */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-[#59605A]">
                <Search className="h-5 w-5 text-[#2F5D3A]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search generic molecule or brand name (e.g. Metformin)..."
                className="w-full h-14 sm:h-16 pl-13 pr-28 sm:pr-32 rounded-2xl border border-[#E6ECE7] bg-white text-base text-[#111411] placeholder:text-[#848D85] shadow-[0_2px_12px_rgba(0,0,0,0.02)] focus:border-[#2F5D3A] focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 sm:right-2.5 h-10 sm:h-11 px-5 sm:px-6 rounded-xl bg-[#2F5D3A] text-xs sm:text-sm font-semibold text-white hover:bg-[#24482D] transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Categories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
            <span className="text-[#848D85] mr-1">Popular categories:</span>
            {quickCategories.map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => router.push(`/search?category=${encodeURIComponent(cat.query)}`)}
                className="px-3.5 py-1.5 rounded-full border border-[#E6ECE7] bg-white text-[#59605A] hover:border-[#2F5D3A]/40 hover:text-[#2F5D3A] hover:bg-[#F3F7F3] transition-colors cursor-pointer"
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
