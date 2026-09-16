'use client';

import React, { useState } from 'react';
import { Pill, Building2, ShoppingBag, Info } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CATALOG, CatalogProduct } from '@/lib/mock/catalog';
import { formatCurrency } from '@/utils/formatters';

export function FeaturedMedicines() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);

  const categories = ['All', 'Cardiovascular', 'Metabolic', 'Endocrine', 'Gastrointestinal'];

  const filteredProducts =
    activeCategory === 'All'
      ? MOCK_CATALOG
      : MOCK_CATALOG.filter((p) => p.category === activeCategory);

  return (
    <section id="catalog" className="py-20 sm:py-32 border-b border-[#E4E7DC]">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E4E7DC]">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
              04 • Verified Catalog
            </div>
            <h2 className="text-section-title text-[#171914]">
              Chronic Generic Maintenance Therapies
            </h2>
            <p className="text-editorial-lead text-[#52564C]">
              Essential daily generic medications sourced from audited manufacturing facilities.
              All orders require a valid, unexpired U.S. physician prescription.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#596B3A] text-white shadow-2xs'
                    : 'bg-white text-[#52564C] border border-[#E4E7DC] hover:bg-[#EEF1E6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-7 shadow-2xs hover:border-[#D1D6C5] transition-all"
            >
              <div className="space-y-5">
                {/* Visual Packaging Placeholder Area (1:1 Aspect Ratio) */}
                <div className="relative aspect-square w-full rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] flex flex-col items-center justify-center p-6 text-center group">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#E4E7DC] text-[#596B3A] shadow-2xs">
                    <Pill className="h-8 w-8" />
                  </div>
                  <div className="mt-4 font-mono text-xs font-bold text-[#171914]">
                    {product.strength} • {product.packageSize} Tablets
                  </div>
                  <div className="text-[11px] text-[#8A9081] mt-0.5">
                    Standard 90-Day Maintenance Supply
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={product.regulatoryStatus === 'AVAILABLE' ? 'success' : 'warning'} size="sm">
                      {product.regulatoryStatus === 'AVAILABLE' ? 'Verified Admissible' : 'Review Required'}
                    </Badge>
                  </div>
                </div>

                {/* Product Title & Brand Equivalence */}
                <div>
                  <h3 className="text-lg font-bold text-[#171914] leading-snug">
                    {product.name}
                  </h3>
                  <div className="text-xs font-medium text-[#52564C] mt-0.5">
                    {product.brandReferenceName}
                  </div>
                </div>

                {/* Technical Metadata */}
                <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#8A9081]">Manufacturer:</span>
                    <span className="font-semibold text-[#171914] flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-[#596B3A]" />
                      {product.manufacturer.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9081]">Batch Serial:</span>
                    <span className="font-mono text-[#52564C]">{product.batch.lotNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9081]">Assayed Purity:</span>
                    <span className="font-bold text-[#3D7038]">{product.batch.assayPurity}%</span>
                  </div>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="mt-6 pt-5 border-t border-[#E4E7DC] space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-[#8A9081] uppercase tracking-wider block">
                      Direct Landed Cost (90 Days)
                    </span>
                    <span className="text-2xl font-black font-mono text-[#171914]">
                      {formatCurrency(product.retailPriceUsd)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#8A9081] line-through block">
                      U.S. Cash: {formatCurrency(product.usAverageCashPrice)}
                    </span>
                    <span className="text-xs font-bold text-[#3D7038]">
                      Save {formatCurrency(product.usAverageCashPrice - product.retailPriceUsd)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="min-h-[44px] flex items-center justify-center gap-1 rounded-xl border border-[#E4E7DC] bg-[#FAFAF7] text-xs font-semibold text-[#52564C] hover:bg-[#EEF1E6] transition-colors cursor-pointer"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>View Provenance</span>
                  </button>

                  <button
                    type="button"
                    className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#596B3A] text-xs font-bold text-white hover:bg-[#43522B] transition-colors cursor-pointer shadow-2xs"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Provenance Detail Modal (Progressive Disclosure) */}
        {selectedProduct && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171914]/60 p-4 backdrop-blur-xs animate-in fade-in"
          >
            <div className="w-full max-w-lg rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="olive" size="sm">
                    {selectedProduct.category}
                  </Badge>
                  <h3 className="text-lg font-bold text-[#171914] mt-2">
                    {selectedProduct.name}
                  </h3>
                  <div className="text-xs text-[#52564C]">{selectedProduct.brandReferenceName}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="rounded-lg p-1.5 text-[#8A9081] hover:bg-[#FAFAF7] hover:text-[#171914]"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-4 space-y-2.5 text-xs text-[#52564C]">
                <div className="flex justify-between">
                  <span className="font-medium">Active Compound:</span>
                  <span className="text-[#171914] font-semibold">{selectedProduct.activeIngredient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Origin Facility:</span>
                  <span className="text-[#171914]">
                    {selectedProduct.manufacturer.facilityCity}, {selectedProduct.manufacturer.facilityState}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">CDSCO Export License:</span>
                  <span className="font-mono text-[#171914]">{selectedProduct.manufacturer.cdscoLicense}</span>
                </div>
                {selectedProduct.manufacturer.usFdaFeiNumber && (
                  <div className="flex justify-between">
                    <span className="font-medium">US-FDA FEI Registry:</span>
                    <span className="font-mono text-[#171914]">{selectedProduct.manufacturer.usFdaFeiNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Batch Lot Number:</span>
                  <span className="font-mono font-bold text-[#171914]">{selectedProduct.batch.lotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Lab Assayed Purity:</span>
                  <span className="font-bold text-[#3D7038]">{selectedProduct.batch.assayPurity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">QC Signoff:</span>
                  <span className="text-[#171914]">{selectedProduct.batch.qcOfficer}</span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-[#8A9081]">
                Information provided for reference. Dispensing requires a valid U.S. physician prescription
                and clinical pharmacist verification under FDA Personal Importation guidelines.
              </p>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-full h-11 rounded-xl bg-[#596B3A] text-xs font-bold text-white hover:bg-[#43522B] transition-colors"
              >
                Close Provenance Viewer
              </button>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
