'use strict';

import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/domain/product';
import { ArrowRight } from 'lucide-react';

interface RelatedProductsProps {
  currentProduct: Product;
  allProducts: Product[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProduct,
  allProducts,
}) => {
  // Find related products by category or manufacturer, excluding the current one
  const related = allProducts
    .filter((p) => p.id !== currentProduct.id)
    .filter(
      (p) =>
        p.category === currentProduct.category ||
        p.manufacturer.id === currentProduct.manufacturer.id
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="bg-white border border-[#E6ECE7] rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-[#111411]">
            Explore Related Medicines
          </h3>
          <p className="text-xs text-[#59605A]">
            Verified formulations in the same therapeutic category ({currentProduct.category}).
          </p>
        </div>
        <Link
          href={`/search?category=${encodeURIComponent(currentProduct.category)}`}
          className="text-xs font-medium text-[#2F5D3A] hover:underline flex items-center gap-1"
        >
          View all in {currentProduct.category}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {related.map((item) => (
          <Link
            key={item.id}
            href={`/medicines/${item.slug}`}
            className="group block p-4 rounded-xl border border-[#E6ECE7] hover:border-[#2F5D3A]/50 transition-all bg-white hover:shadow-xs"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#2F5D3A] bg-[#F3F7F3] px-2 py-0.5 rounded">
                {item.category}
              </span>
              <span className="text-xs font-bold text-[#111411]">
                ${item.retailPriceUsd.toFixed(2)}
              </span>
            </div>

            <h4 className="text-sm font-semibold text-[#111411] group-hover:text-[#2F5D3A] transition-colors line-clamp-1">
              {item.name}
            </h4>
            <p className="text-xs text-[#59605A] mt-0.5">
              {item.strength} • {item.dosageForm}
            </p>
            <p className="text-[11px] text-neutral-400 mt-2 truncate">
              By {item.manufacturer.name}
            </p>
          </Link>
        ))}
      </div>

      <div className="text-[10px] text-neutral-400 italic pt-2">
        * Listing indicates therapeutic category relationship only. IndoPharm does not imply automatic therapeutic substitutability without clinical prescriber evaluation.
      </div>
    </div>
  );
};
