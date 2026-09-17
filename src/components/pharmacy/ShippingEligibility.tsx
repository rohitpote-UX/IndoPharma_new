'use strict';

import React from 'react';
import { ShippingEligibility as ShippingEligibilityType } from '@/lib/domain/product';
import { Plane, CheckCircle2, ShieldCheck, MapPin, Clock } from 'lucide-react';

interface ShippingEligibilityProps {
  eligibilities: ShippingEligibilityType[];
  currentDestination?: string;
  onDestinationChange?: (dest: string) => void;
}

export const ShippingEligibility: React.FC<ShippingEligibilityProps> = ({
  eligibilities,
  currentDestination = 'US',
  onDestinationChange,
}) => {
  const currentRecord = eligibilities.find(
    (e) => e.destination.toUpperCase() === currentDestination.toUpperCase()
  );

  const isEligible = currentRecord ? currentRecord.status === 'AVAILABLE' : true;

  return (
    <div className="bg-white border border-[#E6ECE7] rounded-xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg text-[#111411]">
            Shipping & Importation Eligibility
          </h3>
          <p className="text-xs text-[#59605A]">
            Verified destination logistics and statutory customs clearance.
          </p>
        </div>

        {/* Destination selector */}
        <div className="flex items-center gap-2 bg-[#F3F7F3] p-1.5 rounded-lg border border-[#E6ECE7] self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-[#2F5D3A]" />
          <span className="text-xs text-[#59605A]">Destination:</span>
          <select
            value={currentDestination}
            onChange={(e) => onDestinationChange && onDestinationChange(e.target.value)}
            className="bg-white text-xs font-semibold text-[#111411] rounded px-2 py-1 border border-[#E6ECE7] focus:outline-hidden cursor-pointer"
            aria-label="Select destination country"
          >
            <option value="US">United States (US)</option>
            <option value="IN">India (Domestic IN)</option>
          </select>
        </div>
      </div>

      {/* Destination Status Badge */}
      <div className="p-4 rounded-lg bg-neutral-50 border border-[#E6ECE7] space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#59605A]">Regulatory Status for {currentDestination}:</span>
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-full ${
              isEligible
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                : 'bg-rose-100 text-rose-900 border border-rose-200'
            }`}
          >
            {isEligible ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Eligible for Personal Importation
              </>
            ) : (
              'Restricted / Ineligible'
            )}
          </span>
        </div>

        {currentRecord?.reason && (
          <p className="text-[#59605A] leading-relaxed pt-1 border-t border-neutral-200">
            {currentRecord.reason}
          </p>
        )}
      </div>

      {/* Transit Logistics Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-lg border border-[#E6ECE7] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center shrink-0">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[#111411] block">Transit Method</span>
            <span className="text-[#59605A]">
              Bonded temperature-monitored international air courier.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-[#E6ECE7] flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-[#111411] block">Estimated Delivery</span>
            <span className="text-[#59605A]">
              Typically 8–12 business days following clinical prescription verification.
            </span>
          </div>
        </div>
      </div>

      {/* FDA Importation Policy Note */}
      <div className="p-3.5 rounded-lg bg-[#F3F7F3]/70 border border-[#2F5D3A]/15 flex items-start gap-2.5 text-[11px] text-[#59605A]">
        <ShieldCheck className="w-4 h-4 text-[#2F5D3A] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#111411]">U.S. FDA Personal Importation Framework (CPG Sec. 110.300):</strong> Orders destined for the United States are limited to an authentic 90-day personal maintenance supply and require a valid U.S. physician prescription. All shipments clear U.S. Customs and Border Protection with explicit regulatory manifests.
        </div>
      </div>
    </div>
  );
};
