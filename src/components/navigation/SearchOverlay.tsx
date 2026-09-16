'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Building2, CheckCircle2 } from 'lucide-react';
import { MOCK_CATALOG, CatalogProduct } from '@/lib/mock/catalog';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter products based on search term and category
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

  const categories = ['All', 'Cardiovascular', 'Metabolic', 'Endocrine', 'Gastrointestinal'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-dialog-title"
      className="fixed inset-0 z-50 flex flex-col bg-[#171914]/60 backdrop-blur-xs p-4 sm:p-6 md:p-12 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="mx-auto w-full max-w-3xl rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center justify-between border-b border-[#E4E7DC] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">
              Product Search
            </span>
            <span className="text-xs text-[#52564C]">• Generic & Brand Mapping</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search dialog"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#52564C] hover:bg-[#EEF1E6] hover:text-[#171914] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative mt-4">
          <label htmlFor="search-input" id="search-dialog-title" className="sr-only">
            What medication are you looking for?
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#52564C]">
            <Search className="h-5 w-5" />
          </div>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by generic name (e.g. Atorvastatin) or brand (Lipitor)..."
            className="w-full h-14 sm:h-16 pl-12 pr-12 rounded-xl border border-[#E4E7DC] bg-[#FAFAF7] text-base sm:text-lg text-[#171914] placeholder:text-[#8A9081] focus:bg-white focus:border-[#596B3A] focus:outline-none transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#8A9081] hover:text-[#171914] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#52564C] mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#596B3A] text-white'
                  : 'bg-[#FAFAF7] text-[#52564C] border border-[#E4E7DC] hover:bg-[#EEF1E6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="mt-6 divide-y divide-[#E4E7DC] max-h-[360px] overflow-y-auto">
          {results.length > 0 ? (
            results.map((product) => (
              <div
                key={product.id}
                className="group py-3.5 px-3 -mx-3 rounded-xl hover:bg-[#FAFAF7] transition-colors flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm sm:text-base text-[#171914] group-hover:text-[#43522B] transition-colors">
                      {product.name}
                    </span>
                    <Badge variant="olive" size="sm">
                      {product.strength}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#52564C]">
                    <span>{product.brandReferenceName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {product.manufacturer.name}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm sm:text-base font-bold font-mono text-[#43522B]">
                    {formatCurrency(product.retailPriceUsd)}
                  </div>
                  <div className="text-[11px] text-[#8A9081]">
                    90 Tablets (3-mo supply)
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#52564C] space-y-2">
              <p className="text-sm font-medium text-[#171914]">No products match &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[#8A9081]">
                IndoPharm focuses strictly on verified chronic generic maintenance therapies.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-[#E4E7DC] flex items-center justify-between text-xs text-[#8A9081]">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#596B3A]" />
            <span>All catalog products require a valid U.S. physician prescription.</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded border border-[#E4E7DC] bg-[#FAFAF7] font-mono">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
}
