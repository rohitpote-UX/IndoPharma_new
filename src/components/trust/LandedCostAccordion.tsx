'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, DollarSign, Plane, ShieldCheck, FileCheck, ArrowRight } from 'lucide-react';
import { computeLandedCost } from '@/features/pricing/calculator';
import { formatCurrency } from '@/utils/formatters';

interface LandedCostAccordionProps {
  fobPriceUsd: number;
  usAverageCashPrice: number;
  productName: string;
}

export function LandedCostAccordion({
  fobPriceUsd,
  usAverageCashPrice,
  productName,
}: LandedCostAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cost = computeLandedCost({ fobPriceUsd, usAverageCashPrice });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-800 border border-teal-200/60">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              Landed-Cost Transparency Breakdown
            </div>
            <div className="text-xs text-slate-500">
              Patient Price: <strong className="text-teal-800">{formatCurrency(cost.totalPatientPriceUsd)}</strong> vs. U.S. Retail Cash {formatCurrency(cost.usRetailBenchmarkUsd)} ({cost.savingsPercentage}% savings)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span>{isOpen ? 'Hide breakdown' : 'View itemization'}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            We publish the exact itemized cost structure for <strong>{productName}</strong> (90-day supply). IndoPharm does not extract hidden PBM rebates or spread pricing markups.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <FileCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Factory Gate FOB (India)</span>
                  <span className="font-mono">{formatCurrency(cost.fobPriceUsd)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Direct acquisition from audited WHO-GMP manufacturing facility.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <Plane className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Bonded Air Cargo</span>
                  <span className="font-mono">{formatCurrency(cost.internationalAirFreightUsd)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Temperature-monitored international air courier to U.S. Port of Entry.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>U.S. Customs Brokerage</span>
                  <span className="font-mono">{formatCurrency(cost.customsHandlingUsd)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Section 321 / Personal Importation declaration & FDA filing.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3.5 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between font-semibold text-slate-900">
                  <span>Clinical Dispensing Fee</span>
                  <span className="font-mono">{formatCurrency(cost.pharmacistDispensingFeeUsd)}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Licensed pharmacist prescription verification & drug interaction audit.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-teal-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs text-teal-200">Total Patient Cost (90 Tablets)</div>
              <div className="text-xl font-bold font-mono text-white">
                {formatCurrency(cost.totalPatientPriceUsd)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-teal-100 bg-teal-800/80 px-3 py-1.5 rounded-md border border-teal-700">
              <span>You save {formatCurrency(cost.totalSavingsUsd)} ({cost.savingsPercentage}%) vs. U.S. cash retail</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
