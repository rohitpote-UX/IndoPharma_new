'use client';

import React from 'react';
import Link from 'next/link';
import { Pill, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { VERIFIED_PRODUCTS_STORE } from '@/lib/services/searchService';

export function FeaturedMedicines() {
  const primaryProduct = VERIFIED_PRODUCTS_STORE[0]; // Atorvastatin Calcium 20mg
  const supportingProducts = [
    VERIFIED_PRODUCTS_STORE[1], // Metformin HCl ER 500mg
    VERIFIED_PRODUCTS_STORE[3], // Levothyroxine Sodium 50mcg
    VERIFIED_PRODUCTS_STORE[4], // Pantoprazole Sodium 40mg
  ];

  return (
    <section className="bg-white py-18 sm:py-24 border-b border-[#E6ECE7]">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E6ECE7]">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2F5D3A] block">
              FEATURED PHARMACEUTICAL THERAPIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#111411]">
              Featured maintenance medicines.
            </h2>
            <p className="text-base text-[#59605A] leading-relaxed">
              Standard 90-day maintenance supplies sourced directly from verified manufacturing facilities.
            </p>
          </div>

          <div className="text-xs text-[#59605A] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2F5D3A]" />
            <span>Prescription verified before dispatch</span>
          </div>
        </div>

        {/* Editorial Product Presentation: 1 Large + 3 Stacked/Supporting Cards */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* LEFT: 1 Large Featured Product (6 Columns) */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-7 sm:p-8 transition-all duration-300 hover:border-[#2F5D3A]/40 shadow-xs">
            <div className="space-y-6">
              {/* Product Visual Presentation Area */}
              <Link
                href={`/medicines/${primaryProduct.slug}`}
                className="group relative aspect-[16/10] w-full rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex flex-col items-center justify-center p-8 overflow-hidden block"
              >
                <div className="relative z-10 flex flex-col items-center text-center space-y-3 transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-[#E6ECE7] text-[#2F5D3A] shadow-xs">
                    <Pill className="h-10 w-10" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F5D3A] font-semibold">
                      {primaryProduct.batches[0]?.lotNumber || 'SERIAL BATCH'}
                    </span>
                    <div className="text-sm font-semibold text-[#111411]">
                      {primaryProduct.manufacturer.name}
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white border border-[#E6ECE7] text-[#111411]">
                    {primaryProduct.strength}
                  </span>
                </div>
              </Link>

              {/* Information Hierarchy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-[#59605A]">
                  <span className="text-[#2F5D3A] font-semibold font-mono">{primaryProduct.category}</span>
                  <span>•</span>
                  <span>{primaryProduct.brandReferenceName}</span>
                </div>
                <Link href={`/medicines/${primaryProduct.slug}`}>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#111411] hover:text-[#2F5D3A] transition-colors">
                    {primaryProduct.name}
                  </h3>
                </Link>
                <p className="text-xs font-mono text-[#59605A]">
                  Active: {primaryProduct.activeIngredient} • {primaryProduct.dosageForm}
                </p>
                <p className="text-sm text-[#59605A] leading-relaxed line-clamp-2">
                  {primaryProduct.description}
                </p>
              </div>
            </div>

            {/* Price & Action Row */}
            <div className="pt-6 mt-6 border-t border-[#E6ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#59605A] block font-mono">
                  Transparent Landed Price
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-[#111411]">
                    ${primaryProduct.retailPriceUsd.toFixed(2)}
                  </span>
                  {primaryProduct.usAverageCashPrice && (
                    <span className="text-xs text-neutral-400 line-through">
                      U.S. Cash: ${primaryProduct.usAverageCashPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/medicines/${primaryProduct.slug}`}
                  className="h-11 px-5 rounded-xl bg-[#2F5D3A] text-xs font-semibold text-white hover:bg-[#3F704A] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT: 3 Supporting Products Stack (6 Columns) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {supportingProducts.map((product) => (
              <div
                key={product.id}
                className="flex-1 flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-5 transition-all duration-300 hover:border-[#2F5D3A]/40 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#59605A]">
                      <span className="text-[#2F5D3A] font-medium font-mono">{product.category}</span>
                      <span>•</span>
                      <span className="italic">{product.brandReferenceName}</span>
                    </div>
                    <Link href={`/medicines/${product.slug}`}>
                      <h3 className="text-base font-serif font-bold text-[#111411] hover:text-[#2F5D3A] transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#59605A]">
                      {product.dosageForm} • {product.packageSize} Units ({product.strength})
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-neutral-100 text-neutral-700">
                      {product.strength}
                    </span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E6ECE7] flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold font-mono text-[#111411]">
                      ${product.retailPriceUsd.toFixed(2)}
                    </span>
                    {product.usAverageCashPrice && (
                      <span className="text-xs text-neutral-400 line-through ml-2">
                        ${product.usAverageCashPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/medicines/${product.slug}`}
                    className="h-8 px-3.5 rounded-lg border border-[#E6ECE7] bg-white text-xs font-medium text-[#111411] hover:bg-[#F3F7F3] hover:border-[#2F5D3A]/40 transition-colors flex items-center gap-1 cursor-pointer"
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
        <div className="mt-10 pt-6 border-t border-[#E6ECE7] flex items-center justify-between text-xs">
          <p className="text-[#59605A]">
            Showing 4 verified maintenance therapies with transparent landed pricing.
          </p>
          <Link
            href="/medicines"
            className="group inline-flex items-center gap-1.5 font-semibold text-[#2F5D3A] hover:underline"
          >
            <span>View all medicines</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
