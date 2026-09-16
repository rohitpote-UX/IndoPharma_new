'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Pill, ArrowRight, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CATALOG, CatalogProduct } from '@/lib/mock/catalog';
import { formatCurrency } from '@/utils/formatters';

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const [searchTerm, setSearchTerm] = useState(query);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    } else {
      params.delete('q');
    }
    router.replace(`/search?${params.toString()}`);
  };

  const handleCategorySelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat !== 'All') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.replace(`/search?${params.toString()}`);
  };

  const categories = ['All', 'Cardiovascular', 'Metabolic', 'Endocrine', 'Gastrointestinal'];

  const results: CatalogProduct[] = MOCK_CATALOG.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesQuery =
      item.name.toLowerCase().includes(q) ||
      item.brandReferenceName.toLowerCase().includes(q) ||
      item.activeIngredient.toLowerCase().includes(q) ||
      item.manufacturer.name.toLowerCase().includes(q);

    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Discovery Engine
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Search Medicines
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Search our verified database by active chemical ingredient, U.S. reference brand, or therapeutic category.
          </p>
        </div>

        {/* Search Field & Categories */}
        <div className="mt-8 space-y-4 max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#59605A]">
              <Search className="h-5 w-5 text-[#2F5D3A]" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type generic active compound (e.g. Atorvastatin) or brand (Lipitor)..."
              className="w-full h-14 pl-12 pr-24 rounded-2xl border border-[#E6ECE7] bg-white text-base text-[#111411] placeholder:text-[#848D85] shadow-xs focus:border-[#2F5D3A] focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete('q');
                  router.replace(`/search?${params.toString()}`);
                }}
                className="absolute inset-y-0 right-20 flex items-center pr-2 text-[#848D85] hover:text-[#111411] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-2 h-10 px-4 rounded-xl bg-[#2F5D3A] text-xs font-semibold text-white hover:bg-[#24482D] transition-colors cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[#848D85] mr-1">Filter category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2F5D3A] text-white'
                    : 'bg-white text-[#59605A] border border-[#E6ECE7] hover:bg-[#F3F7F3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Metadata */}
        <div className="mt-12 pb-4 border-b border-[#E6ECE7] flex items-center justify-between text-xs text-[#59605A]">
          <div>
            Showing <strong className="text-[#111411]">{results.length}</strong> {results.length === 1 ? 'product' : 'products'}
            {query && (
              <span>
                {' '}for &ldquo;<strong className="text-[#111411]">{query}</strong>&rdquo;
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span> in <strong className="text-[#111411]">{selectedCategory}</strong></span>
            )}
          </div>
          <Link href="/medicines" className="text-[#2F5D3A] font-semibold hover:underline">
            View full catalogue →
          </Link>
        </div>

        {/* Results Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-4 hover:border-[#2F5D3A]/40 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#59605A]">{product.category}</span>
                  <Badge variant="green" size="sm">
                    {product.strength}
                  </Badge>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/medicines/${product.slug}`}>
                      <h2 className="text-lg font-bold tracking-tight text-[#111411] group-hover:text-[#2F5D3A] transition-colors">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="text-xs text-[#59605A] mt-1">{product.brandReferenceName}</p>
                    <p className="text-xs text-[#848D85] mt-1 font-mono">Lot: {product.batch.lotNumber}</p>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
                    <Pill className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E6ECE7] flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold font-mono text-[#111411]">
                    {formatCurrency(product.retailPriceUsd)}
                  </div>
                  <div className="text-[10px] text-[#848D85] line-through">
                    U.S. Cash: {formatCurrency(product.usAverageCashPrice)}
                  </div>
                </div>

                <Link
                  href={`/medicines/${product.slug}`}
                  className="h-10 px-4 rounded-xl bg-[#2F5D3A] text-xs font-semibold text-white hover:bg-[#24482D] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {results.length === 0 && (
          <div className="py-24 text-center space-y-3">
            <p className="text-lg font-bold text-[#111411]">
              No products found matching &ldquo;{query}&rdquo;
            </p>
            <p className="text-sm text-[#59605A] max-w-md mx-auto">
              IndoPharm provides essential chronic maintenance generic therapies. Try searching for generic active
              molecules such as Atorvastatin, Metformin, Lisinopril, or Levothyroxine.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                const params = new URLSearchParams(searchParams.toString());
                params.delete('q');
                params.delete('category');
                router.replace('/search');
              }}
              className="mt-2 inline-block text-xs font-semibold text-[#2F5D3A] hover:underline cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        )}
      </Container>
    </div>
  );
}
