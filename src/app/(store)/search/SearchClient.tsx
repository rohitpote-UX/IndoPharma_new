'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { ProductSearch } from '@/components/pharmacy/ProductSearch';
import { SearchResults } from '@/components/pharmacy/SearchResults';
import { Product } from '@/lib/domain/product';
import { Filter, Check } from 'lucide-react';

const CATEGORIES = ['All', 'Cardiovascular', 'Metabolic', 'Endocrine', 'Gastrointestinal'];

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const rxParam = searchParams.get('rx');
  const destination = searchParams.get('destination') || 'US';

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch search results asynchronously inside effect
  useEffect(() => {
    let isMounted = true;

    async function runSearch() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
        if (rxParam) params.set('prescription', rxParam);
        if (destination) params.set('destination', destination);

        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Search service encountered a temporary error. Please try again.');
        }

        const json = await res.json();
        if (json.success && json.data?.items) {
          if (isMounted) {
            setProducts(json.data.items);
          }
        } else {
          throw new Error(json.error || 'Failed to retrieve matching products.');
        }
      } catch (err: unknown) {
        console.error('[SearchClient] Fetch error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unexpected error occurred while searching.');
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      isMounted = false;
    };
  }, [query, selectedCategory, rxParam, destination]);

  const handleCategorySelect = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat !== 'All') {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleRxToggle = (rxValue: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (rxValue) {
      params.set('rx', rxValue);
    } else {
      params.delete('rx');
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14 lg:py-16">
      <Container>
        {/* Search Header */}
        <div className="max-w-3xl space-y-3 pb-8 border-b border-[#E6ECE7]">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2F5D3A] block">
            PHARMACEUTICAL DISCOVERY ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-[#111411]">
            Find your medicine.
          </h1>
          <p className="text-sm sm:text-base text-[#59605A] leading-relaxed">
            Search our verified catalogue across generic molecules, U.S. reference brands, audited manufacturers, strength or SKU.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 space-y-5 max-w-4xl">
          <ProductSearch
            initialQuery={query}
            showHeadline={false}
            onSearchSubmit={(newQuery) => {
              const params = new URLSearchParams(searchParams.toString());
              if (newQuery) {
                params.set('q', newQuery);
              } else {
                params.delete('q');
              }
              router.push(`/search?${params.toString()}`);
            }}
          />

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#59605A] font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#2F5D3A]" />
                Category:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer text-xs ${
                    selectedCategory === cat
                      ? 'bg-[#2F5D3A] text-white shadow-xs'
                      : 'bg-white text-[#59605A] border border-[#E6ECE7] hover:bg-[#F3F7F3]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prescription Toggle */}
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleRxToggle(rxParam === 'true' ? null : 'true')}
                className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  rxParam === 'true'
                    ? 'bg-[#F3F7F3] border-[#2F5D3A] text-[#2F5D3A] font-semibold'
                    : 'bg-white border-[#E6ECE7] text-[#59605A] hover:bg-neutral-50'
                }`}
              >
                {rxParam === 'true' && <Check className="w-3.5 h-3.5" />}
                Prescription Only
              </button>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-10 pt-6 border-t border-[#E6ECE7]">
          <SearchResults
            products={products}
            isLoading={isLoading}
            error={error}
            query={query}
            onRetry={() => {
              // Trigger reload by re-navigating
              router.refresh();
            }}
          />
        </div>
      </Container>
    </div>
  );
}
