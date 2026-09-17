'use client';

import React from 'react';
import { EligibilityStatus, DestinationInfo } from '@/lib/domain/eligibility';
import { CheckCircle2, AlertTriangle, FileCheck, ShieldAlert, Globe, ChevronDown } from 'lucide-react';
import { useDestination } from '@/lib/context/DestinationContext';

interface ProductEligibilityBadgeProps {
  status: EligibilityStatus;
  destination: DestinationInfo;
  reason?: string | null;
  showSelector?: boolean;
  onDestinationChange?: (countryCode: string) => void;
}

export const ProductEligibilityBadge: React.FC<ProductEligibilityBadgeProps> = ({
  status,
  destination,
  reason,
  showSelector = true,
  onDestinationChange,
}) => {
  const { availableCountries, setDestinationCountry } = useDestination();

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    if (onDestinationChange) {
      onDestinationChange(code);
    } else {
      setDestinationCountry(code);
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'ELIGIBLE':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-[#2F5D3A]" />,
          text: 'Available for your destination',
          badgeClass: 'bg-[#F3F7F3] text-[#2F5D3A] border-[#2F5D3A]/20',
          badgeText: 'Eligible',
        };
      case 'PRESCRIPTION_REQUIRED':
        return {
          icon: <FileCheck className="w-4 h-4 text-[#2F5D3A]" />,
          text: 'Prescription required for this destination',
          badgeClass: 'bg-[#F3F7F3] text-[#2F5D3A] border-[#2F5D3A]/20',
          badgeText: 'Prescription Required',
        };
      case 'REVIEW_REQUIRED':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
          text: 'Regulatory review required before purchase',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          badgeText: 'Review Required',
        };
      case 'VERIFICATION_REQUIRED':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-blue-700" />,
          text: 'Customer identity verification required',
          badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
          badgeText: 'Verification Required',
        };
      case 'OUT_OF_STOCK':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-neutral-600" />,
          text: 'Currently unavailable (Batch depleted)',
          badgeClass: 'bg-neutral-100 text-neutral-700 border-neutral-200',
          badgeText: 'Out of Stock',
        };
      case 'DESTINATION_RESTRICTED':
      case 'NOT_AVAILABLE':
      case 'FULFILLMENT_UNAVAILABLE':
      default:
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-700" />,
          text: 'Not currently available for this destination',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          badgeText: 'Restricted',
        };
    }
  };

  const config = getStatusDisplay();

  return (
    <div className="bg-white rounded-xl border border-[#E6ECE7] p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Destination Picker */}
        <div className="flex items-center gap-2 text-xs text-[#59605A]">
          <Globe className="w-3.5 h-3.5 text-[#2F5D3A]" />
          <span>Shipping to:</span>
          {showSelector ? (
            <div className="relative inline-block">
              <select
                value={destination.countryCode}
                onChange={handleCountryChange}
                aria-label="Select shipping destination"
                className="appearance-none font-semibold text-[#111411] bg-[#F3F7F3] pl-2.5 pr-7 py-1 rounded-md border border-[#E6ECE7] text-xs cursor-pointer focus:outline-hidden focus:border-[#2F5D3A]"
              >
                {availableCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code === 'US' ? '🇺🇸 ' : c.code === 'IN' ? '🇮🇳 ' : c.code === 'GB' ? '🇬🇧 ' : '🇨🇦 '}
                    {c.name} ({c.currency})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#59605A] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          ) : (
            <span className="font-semibold text-[#111411]">
              {destination.countryName} ({destination.currency})
            </span>
          )}
        </div>

        {/* Semantic Status Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.badgeClass}`}
        >
          {config.icon}
          {config.badgeText}
        </span>
      </div>

      {/* Main Status Text & Statutory Rationale */}
      <div className="text-xs text-[#59605A] leading-relaxed pt-2 border-t border-neutral-100">
        <p className="font-medium text-[#111411]">{config.text}</p>
        {reason && <p className="mt-1 text-[11px] text-[#59605A]">{reason}</p>}
      </div>
    </div>
  );
};
