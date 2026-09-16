'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Pill, ArrowRight, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CATALOG, CatalogProduct } from '@/lib/mock/catalog';
import { formatCurrency } from '@/utils/formatters';

export function MedicinesCatalogClient() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['All', 'Cardiovascular', 'Metabolic', 'Endocrine', 'Gastrointestinal'];

  const filteredProducts: CatalogProduct[] = MOCK_CATALOG.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.brandReferenceName.toLowerCase().includes(term) ||
      product.activeIngredient.toLowerCase().includes(term) ||
      product.manufacturer.name.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Direct Formulary
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Medicines
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Explore our available pharmaceutical products. Standard 90-day supplies sourced directly
            from verified WHO-GMP manufacturing facilities in India.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E6ECE7]">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#59605A]">
              <Search className="h-4 w-4 text-[#2F5D3A]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by generic molecule or brand name..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E6ECE7] bg-white text-sm text-[#111411] placeholder:text-[#848D85] focus:border-[#2F5D3A] focus:outline-none transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#2F5D3A] text-white'
                    : 'bg-white text-[#59605A] border border-[#E6ECE7] hover:bg-[#F3F7F3] hover:text-[#111411]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-5 transition-all duration-300 hover:border-[#2F5D3A]/40 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div className="space-y-4">
                {/* Visual Packaging Render Area */}
                <Link
                  href={`/medicines/${product.slug}`}
                  className="relative aspect-square w-full rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex flex-col items-center justify-center p-6 text-center overflow-hidden block"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white border border-[#E6ECE7] text-[#2F5D3A] shadow-xs transition-transform duration-500 group-hover:scale-105">
                    <Pill className="h-7 w-7" />
                  </div>
                  <span className="text-[10px] font-mono text-[#848D85] mt-2">
                    {product.batch.lotNumber}
                  </span>
                  <div className="absolute top-3 right-3">
                    <Badge variant="green" size="sm">
                      {product.strength}
                    </Badge>
                  </div>
                </Link>

                {/* Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#59605A]">
                    <span className="text-[#2F5D3A] font-medium">Verified</span>
                    <span>•</span>
                    <span className="truncate">{product.brandReferenceName}</span>
                  </div>
                  <Link href={`/medicines/${product.slug}`}>
                    <h2 className="text-base font-bold text-[#111411] group-hover:text-[#2F5D3A] transition-colors leading-snug">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="text-xs text-[#59605A]">
                    {product.dosageForm} • 90 Tablets
                  </p>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-4 mt-5 border-t border-[#E6ECE7] flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold font-mono text-[#111411]">
                    {formatCurrency(product.retailPriceUsd)}
                  </div>
                  <div className="text-[10px] text-[#848D85] line-through">
                    U.S. Cash: {formatCurrency(product.usAverageCashPrice)}
                  </div>
                </div>

                <Link
                  href={`/medicines/${product.slug}`}
                  className="h-9 px-3.5 rounded-xl border border-[#E6ECE7] bg-white text-xs font-semibold text-[#111411] group-hover:bg-[#2F5D3A] group-hover:text-white group-hover:border-transparent transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <p className="text-base font-semibold text-[#111411]">
              No medicines found matching &ldquo;{searchTerm}&rdquo;
            </p>
            <p className="text-sm text-[#59605A]">
              Try searching by generic active ingredient or select another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All');
                setSearchTerm('');
              }}
              className="mt-2 text-xs font-semibold text-[#2F5D3A] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Statutory Clinical Footer */}
        <div className="mt-16 pt-8 border-t border-[#E6ECE7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#848D85]">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#2F5D3A]" />
            <span>All dispensing requires valid U.S. physician prescription verification.</span>
          </div>
          <div>FDA Personal Importation Policy (CPG 110.300)</div>
        </div>
      </Container>
    </div>
  );
}
