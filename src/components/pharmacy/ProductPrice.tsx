'use strict';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Info } from 'lucide-react';

interface ProductPriceProps {
  retailPriceUsd?: number | null;
  usAverageCashPrice?: number | null;
  packageSize?: number;
  unit?: string;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({
  retailPriceUsd,
  usAverageCashPrice,
  packageSize = 90,
  unit = 'tablets',
}) => {
  const hasPrice = retailPriceUsd !== undefined && retailPriceUsd !== null;
  const perUnit = hasPrice && packageSize ? (retailPriceUsd / packageSize).toFixed(2) : null;

  return (
    <div className="bg-white border border-[#E6ECE7] rounded-xl p-5 space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#59605A]">
            Landed Price (USD)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-[#111411]">
              {hasPrice ? `$${retailPriceUsd.toFixed(2)}` : 'Price unavailable'}
            </span>
            {perUnit && (
              <span className="text-xs text-[#59605A]">
                (${perUnit} / {unit ? unit.replace(/s$/, '') : 'unit'})
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500 block mt-0.5">
            Pack of {packageSize} {unit}
          </span>
        </div>

        {usAverageCashPrice && (
          <div className="text-right">
            <span className="text-xs text-neutral-400 block line-through">
              U.S. Cash: ${usAverageCashPrice.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-[#2F5D3A] bg-[#F3F7F3] px-2 py-0.5 rounded border border-[#2F5D3A]/10 inline-block mt-0.5">
              Direct Sourcing Advantage
            </span>
          </div>
        )}
      </div>

      {/* Transparent Pricing Explanation */}
      <div className="pt-3 border-t border-[#E6ECE7] text-xs text-[#59605A] space-y-2">
        <div className="flex items-start gap-2 bg-[#F3F7F3]/80 p-3 rounded-lg border border-[#E6ECE7]">
          <Info className="w-4 h-4 text-[#2F5D3A] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Transparent Landed Cost:</strong> Includes verified manufacturer price, cold-chain compliant handling, and statutory customs documentation. Standard tracked international shipping ($15.00 flat rate or free over $100) calculated at checkout.
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1">
          <span className="text-neutral-500">No hidden middleman markups</span>
          <Link
            href="/#why-our-price"
            className="text-[#2F5D3A] font-medium hover:underline inline-flex items-center gap-1"
          >
            How our pricing works
            <HelpCircle className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
