'use strict';

import React from 'react';
import { Product } from '@/lib/domain/product';
import { Building2, Globe2, ShieldCheck } from 'lucide-react';

interface ProductHeaderProps {
  product: Product;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({ product }) => {
  const mfr = product.manufacturer;

  return (
    <div className="space-y-4">
      {/* Top Metadata Badges */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-[#59605A] bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
          SKU: {product.sku || 'Unavailable'}
        </span>
        {product.category && (
          <span className="font-medium text-[#2F5D3A] bg-[#F3F7F3] px-2.5 py-1 rounded border border-[#2F5D3A]/20">
            {product.category}
          </span>
        )}
        {mfr?.whoGmpCertified && (
          <span className="inline-flex items-center gap-1 text-[#2F5D3A] bg-[#F3F7F3] px-2.5 py-1 rounded border border-[#2F5D3A]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            WHO-GMP Verified Facility
          </span>
        )}
      </div>

      {/* Main Title */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#111411]">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-[#59605A]">
          <span className="font-mono text-[#111411]">
            Active: <strong>{product.activeIngredient}</strong>
          </span>
          {product.brandReferenceName && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="italic text-neutral-600">
                {product.brandReferenceName}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Core Clinical Spec Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-[#E6ECE7] text-xs">
        <div>
          <span className="text-[#59605A] block">Strength</span>
          <span className="font-semibold text-[#111411] text-sm">{product.strength || 'Not specified'}</span>
        </div>
        <div>
          <span className="text-[#59605A] block">Dosage Form</span>
          <span className="font-semibold text-[#111411] text-sm">{product.dosageForm || 'Not specified'}</span>
        </div>
        <div>
          <span className="text-[#59605A] block">Package Context</span>
          <span className="font-semibold text-[#111411] text-sm">{product.packageSize ? `${product.packageSize} Units` : 'Not specified'}</span>
        </div>
        <div>
          <span className="text-[#59605A] block">NDC Equivalent</span>
          <span className="font-mono font-semibold text-[#111411] text-sm">{product.ndcEquivalent || 'Not assigned'}</span>
        </div>
      </div>

      {/* Manufacturer & Provenance */}
      <div className="bg-[#F3F7F3]/60 rounded-xl p-4 border border-[#E6ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#59605A] uppercase tracking-wider font-mono">Manufacturer</div>
            <div className="font-semibold text-[#111411]">
              {mfr?.name || 'Manufacturer information unavailable'}
            </div>
            {mfr?.facilityCity && (
              <div className="text-neutral-500 text-[11px]">
                {mfr.facilityCity}, {mfr.facilityState}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E6ECE7]">
          <div className="w-8 h-8 rounded-lg bg-white border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] shrink-0">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-[#59605A] uppercase tracking-wider font-mono">Origin</div>
            <div className="font-semibold text-[#111411]">
              {product.countryOfOrigin || 'India'}
            </div>
            <div className="text-neutral-500 text-[11px]">
              Export via Audited Hub
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
