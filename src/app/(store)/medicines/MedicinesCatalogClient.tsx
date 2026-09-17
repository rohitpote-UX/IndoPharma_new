'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { VERIFIED_PRODUCTS_STORE } from '@/lib/services/searchService';
import { Product } from '@/lib/domain/product';
import { getAvailabilityBadge } from '@/components/pharmacy/SearchResults';

export function MedicinesCatalogClient() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = ['All', 'Cardiovascular', 'Metabolic', 'Endocrine', 'Gastrointestinal'];

  const filteredProducts: Product[] = VERIFIED_PRODUCTS_STORE.filter((product) => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(term) ||
      product.brandReferenceName.toLowerCase().includes(term) ||
      product.activeIngredient.toLowerCase().includes(term) ||
      product.manufacturer.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2F5D3A] block">
            AUTHENTIC PHARMACEUTICAL CATALOGUE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-[#111411]">
            Medicines
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Explore verified pharmaceutical formulations. Standard 90-day maintenance supplies sourced directly
            from audited WHO-GMP manufacturing facilities with transparent landed pricing.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#E6ECE7]">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
              <Search className="h-4 w-4 text-[#2F5D3A]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by generic molecule, brand or SKU..."
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#E6ECE7] bg-white text-sm text-[#111411] placeholder:text-neutral-400 focus:border-[#2F5D3A] focus:outline-hidden transition-all shadow-xs"
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
                    ? 'bg-[#2F5D3A] text-white shadow-xs'
                    : 'bg-white text-[#59605A] border border-[#E6ECE7] hover:bg-[#F3F7F3] hover:text-[#111411]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const activeBatch = product.batches[0] || null;

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-6 transition-all duration-300 hover:border-[#2F5D3A]/40 hover:shadow-sm"
              >
                <div className="space-y-4">
                  {/* Status & SKU Header */}
                  <div className="flex items-center justify-between gap-2">
                    {getAvailabilityBadge(product.stockStatus, product.requiresPrescription)}
                    <span className="text-[10px] font-mono text-[#59605A] bg-neutral-100 px-2 py-0.5 rounded">
                      {product.sku}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#59605A]">
                      <span className="font-mono text-[#2F5D3A] font-semibold">{product.category}</span>
                      <span>•</span>
                      <span className="truncate italic">{product.brandReferenceName}</span>
                    </div>
                    <Link href={`/medicines/${product.slug}`}>
                      <h2 className="text-lg font-serif font-bold text-[#111411] group-hover:text-[#2F5D3A] transition-colors leading-snug">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="text-xs font-mono text-[#59605A]">
                      Active: {product.activeIngredient}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {product.strength} • {product.dosageForm} • {product.packageSize} Units
                    </p>
                  </div>

                  {/* Provenance Micro-Bar */}
                  <div className="p-3 bg-[#F3F7F3]/70 rounded-lg border border-[#E6ECE7] text-[11px] text-[#59605A] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Manufacturer:</span>
                      <span className="font-medium text-[#111411] truncate">{product.manufacturer.name}</span>
                    </div>
                    {activeBatch && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Assay Purity:</span>
                        <span className="font-mono font-medium text-[#2F5D3A]">{activeBatch.assayPurity}% HPLC</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="pt-4 mt-5 border-t border-[#E6ECE7] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#59605A] uppercase block font-mono">Landed Price</span>
                    <div className="text-xl font-bold font-mono text-[#111411]">
                      ${product.retailPriceUsd.toFixed(2)}
                    </div>
                    {product.usAverageCashPrice && (
                      <div className="text-[10px] text-neutral-400 line-through">
                        U.S. Cash: ${product.usAverageCashPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/medicines/${product.slug}`}
                    className="h-10 px-4 rounded-xl bg-[#2F5D3A] text-xs font-semibold text-white hover:bg-[#3F704A] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
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
        <div className="mt-16 pt-8 border-t border-[#E6ECE7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#59605A]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2F5D3A]" />
            <span>Prescription order verification required for all prescription-designated therapies.</span>
          </div>
          <div>FDA Personal Importation Policy (CPG Sec. 110.300)</div>
        </div>
      </Container>
    </div>
  );
}
