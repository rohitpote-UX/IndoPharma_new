'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, ShoppingBag, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CATALOG } from '@/lib/mock/catalog';
import { formatCurrency } from '@/utils/formatters';

export function FeaturedMedicines() {
  const primaryProduct = MOCK_CATALOG[0]; // Atorvastatin Calcium 20mg
  const supportingProducts = [
    MOCK_CATALOG[1], // Metformin HCl ER 500mg
    MOCK_CATALOG[2], // Levothyroxine Sodium 50mcg
    MOCK_CATALOG[4], // Pantoprazole Sodium 40mg
  ];

  return (
    <section className="bg-white py-20 sm:py-28 lg:py-36 border-b border-[#E6ECE7]">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
              Curated Therapies
            </span>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-[#111411] leading-tight">
              Featured maintenance medicines.
            </h2>
            <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
              Standard 90-day supplies directly from verified manufacturing facilities.
            </p>
          </div>

          <div className="text-xs text-[#848D85]">
            Requires valid U.S. physician prescription
          </div>
        </div>

        {/* Editorial Product Presentation: 1 Large + 3 Stacked/Supporting Cards */}
        <div className="mt-12 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* LEFT: 1 Large Featured Product (6-7 Columns) */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-7 sm:p-10 transition-all duration-300 hover:border-[#2F5D3A]/40 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="space-y-8">
              {/* Product Visual Presentation Area */}
              <Link
                href={`/medicines/${primaryProduct.slug}`}
                className="group relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex flex-col items-center justify-center p-8 overflow-hidden block"
              >
                <div className="relative z-10 flex flex-col items-center text-center space-y-3 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-[#E6ECE7] text-[#2F5D3A] shadow-xs">
                    <Pill className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F5D3A] font-semibold">
                      {primaryProduct.batch.lotNumber}
                    </span>
                    <div className="text-sm font-semibold text-[#111411]">
                      {primaryProduct.manufacturer.name}
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="green" size="sm">
                    {primaryProduct.strength}
                  </Badge>
                </div>
              </Link>

              {/* Information Hierarchy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#59605A]">
                  <span className="text-[#2F5D3A] font-semibold">In Stock</span>
                  <span>•</span>
                  <span>{primaryProduct.category}</span>
                  <span>•</span>
                  <span>{primaryProduct.brandReferenceName}</span>
                </div>
                <Link href={`/medicines/${primaryProduct.slug}`}>
                  <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111411] hover:text-[#2F5D3A] transition-colors">
                    {primaryProduct.name}
                  </h3>
                </Link>
                <p className="text-sm sm:text-base text-[#59605A] leading-relaxed max-w-xl">
                  {primaryProduct.dosageForm} • 90 Tablets (3-Month Maintenance Supply)
                </p>
              </div>
            </div>

            {/* Price & Action Row */}
            <div className="pt-8 mt-8 border-t border-[#E6ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#848D85] block">
                  Transparent Landed Price
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-3xl font-bold font-mono text-[#111411]">
                    {formatCurrency(primaryProduct.retailPriceUsd)}
                  </span>
                  <span className="text-sm text-[#848D85] line-through">
                    U.S. Cash: {formatCurrency(primaryProduct.usAverageCashPrice)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/medicines/${primaryProduct.slug}`}
                  className="group h-12 px-6 rounded-xl bg-[#2F5D3A] text-xs font-semibold text-white hover:bg-[#24482D] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: 3 Supporting Products Stack (6 Columns) */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {supportingProducts.map((product) => (
              <div
                key={product.id}
                className="flex-1 flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-5 sm:p-6 transition-all duration-300 hover:border-[#2F5D3A]/40 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#59605A]">
                      <span className="text-[#2F5D3A] font-medium">Available</span>
                      <span>•</span>
                      <span>{product.brandReferenceName}</span>
                    </div>
                    <Link href={`/medicines/${product.slug}`}>
                      <h3 className="text-lg font-bold tracking-tight text-[#111411] hover:text-[#2F5D3A] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#59605A]">
                      {product.dosageForm} • 90 Tablets (3-Month Supply)
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Badge variant="green" size="sm">
                      {product.strength}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E6ECE7] flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold font-mono text-[#111411]">
                      {formatCurrency(product.retailPriceUsd)}
                    </span>
                    <span className="text-xs text-[#848D85] line-through ml-2">
                      {formatCurrency(product.usAverageCashPrice)}
                    </span>
                  </div>
                  <Link
                    href={`/medicines/${product.slug}`}
                    className="h-9 px-4 rounded-xl border border-[#E6ECE7] bg-white text-xs font-semibold text-[#111411] hover:bg-[#F3F7F3] hover:border-[#2F5D3A]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA to /medicines */}
        <div className="mt-14 pt-8 border-t border-[#E6ECE7] flex items-center justify-between">
          <p className="text-xs sm:text-sm text-[#59605A]">
            Showing 4 curated chronic maintenance generic therapies.
          </p>
          <Link
            href="/medicines"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#2F5D3A] hover:text-[#24482D] transition-colors"
          >
            <span>View all medicines</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
