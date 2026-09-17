'use client';

import React from 'react';
import Link from 'next/link';
import { Product, ProductAvailabilityState } from '@/lib/domain/product';
import { ArrowRight, AlertCircle, RefreshCw, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SearchResultsProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  query: string;
  onRetry?: () => void;
}

export const getAvailabilityBadge = (status: ProductAvailabilityState, requiresPrescription: boolean) => {
  switch (status) {
    case 'AVAILABLE':
      if (requiresPrescription) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F7F3] text-[#2F5D3A] border border-[#2F5D3A]/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Prescription Required • In Stock
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F7F3] text-[#2F5D3A] border border-[#2F5D3A]/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Available for your destination
        </span>
      );
    case 'LOW_STOCK':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Limited availability
        </span>
      );
    case 'OUT_OF_STOCK':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
          Currently unavailable
        </span>
      );
    case 'REGULATORY_REVIEW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
          Availability is being reviewed
        </span>
      );
    case 'DESTINATION_RESTRICTED':
    case 'NOT_ELIGIBLE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3.5 h-3.5" />
          Not currently available for this destination
        </span>
      );
    default:
      return null;
  }
};

export const SearchResults: React.FC<SearchResultsProps> = ({
  products,
  isLoading,
  error,
  query,
  onRetry,
}) => {
  // 1. Loading State (Structured Skeletons)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label="Loading results">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E6ECE7] rounded-xl p-6 flex flex-col justify-between animate-pulse"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="h-5 w-24 bg-neutral-200 rounded-full" />
                <div className="h-4 w-16 bg-neutral-100 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-neutral-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-neutral-100 rounded mb-4" />
              <div className="space-y-2 py-3 border-y border-neutral-100">
                <div className="h-3.5 w-2/3 bg-neutral-100 rounded" />
                <div className="h-3.5 w-1/2 bg-neutral-100 rounded" />
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between pt-4 border-t border-neutral-100">
              <div className="h-6 w-20 bg-neutral-200 rounded" />
              <div className="h-9 w-24 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-[#111411] mb-2">
          Something went wrong while searching.
        </h3>
        <p className="text-sm text-[#59605A] mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2F5D3A] text-white text-sm font-medium hover:bg-[#3F704A] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
        )}
      </div>
    );
  }

  // 3. No Results State
  if (products.length === 0) {
    return (
      <div className="bg-white border border-[#E6ECE7] rounded-2xl p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-serif text-[#111411] mb-2">
          No medicines matched your search.
        </h3>
        <p className="text-sm text-[#59605A] mb-6 leading-relaxed">
          We couldn&apos;t find any pharmaceutical products matching &ldquo;<span className="font-semibold text-[#111411]">{query}</span>&rdquo;.
          Try searching by the generic chemical name, brand name, manufacturer, strength or SKU.
        </p>
        <div className="pt-6 border-t border-[#E6ECE7] text-xs text-[#59605A]">
          <span className="font-semibold text-[#111411]">Common searches:</span>{' '}
          <Link href="/search?q=Atorvastatin" className="text-[#2F5D3A] hover:underline mx-1">Atorvastatin</Link> •{' '}
          <Link href="/search?q=Metformin" className="text-[#2F5D3A] hover:underline mx-1">Metformin ER</Link> •{' '}
          <Link href="/search?q=Lisinopril" className="text-[#2F5D3A] hover:underline mx-1">Lisinopril</Link> •{' '}
          <Link href="/search?q=Sun+Pharma" className="text-[#2F5D3A] hover:underline mx-1">Sun Pharma</Link>
        </div>
      </div>
    );
  }

  // 4. Results Grid State
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[#59605A] px-1">
        <span>Showing <strong className="text-[#111411] font-semibold">{products.length}</strong> verified pharmaceutical {products.length === 1 ? 'product' : 'products'}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const mfrName = product.manufacturer?.name || 'Manufacturer information unavailable';
          const priceDisplay =
            product.retailPriceUsd !== undefined && product.retailPriceUsd !== null
              ? `$${product.retailPriceUsd.toFixed(2)}`
              : 'Price unavailable';

          return (
            <div
              key={product.id}
              className="group bg-white border border-[#E6ECE7] rounded-xl p-6 flex flex-col justify-between hover:border-[#2F5D3A]/40 hover:shadow-md transition-all duration-200"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  {getAvailabilityBadge(product.stockStatus, product.requiresPrescription)}
                  <span className="text-[11px] font-mono text-[#59605A] bg-neutral-100 px-2 py-0.5 rounded shrink-0">
                    {product.sku || 'SKU pending'}
                  </span>
                </div>

                {/* Title and Active Molecule */}
                <h3 className="text-lg font-semibold text-[#111411] group-hover:text-[#2F5D3A] transition-colors leading-snug">
                  <Link href={`/medicines/${product.slug}`} className="focus:outline-hidden">
                    {product.name}
                  </Link>
                </h3>

                <p className="text-xs font-mono text-[#59605A] mt-1">
                  Active: {product.activeIngredient}
                </p>

                {product.brandReferenceName && (
                  <p className="text-xs text-neutral-500 italic mt-0.5">
                    {product.brandReferenceName}
                  </p>
                )}

                {/* Clinical Specifications */}
                <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1 text-xs text-[#59605A]">
                  <div className="flex justify-between py-0.5">
                    <span className="text-neutral-400">Strength & Form:</span>
                    <span className="font-medium text-[#111411]">
                      {product.strength} • {product.dosageForm}
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-neutral-400">Pack Context:</span>
                    <span className="font-medium text-[#111411]">
                      {product.packageSize} Units
                    </span>
                  </div>
                  <div className="flex justify-between py-0.5 truncate">
                    <span className="text-neutral-400 shrink-0 mr-2">Manufacturer:</span>
                    <span className="font-medium text-[#111411] truncate">
                      {mfrName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer: Price & CTA */}
              <div className="mt-6 pt-4 border-t border-[#E6ECE7] flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-[#59605A]">Landed cost</div>
                  <div className="text-xl font-semibold text-[#111411]">
                    {priceDisplay}
                  </div>
                  {product.usAverageCashPrice && (
                    <div className="text-[11px] text-neutral-400">
                      U.S. Cash: ${product.usAverageCashPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <Link
                  href={`/medicines/${product.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2F5D3A] text-white text-xs font-medium hover:bg-[#3F704A] transition-colors focus:ring-2 focus:ring-[#2F5D3A]/20"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
