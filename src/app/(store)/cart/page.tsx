import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight, ShieldCheck, Pill, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CATALOG } from '@/lib/mock/catalog';
import { formatCurrency } from '@/utils/formatters';

export const metadata: Metadata = {
  title: 'Shopping Cart | IndoPharm',
  description: 'Review your selected maintenance therapies, transparent landed costs, and shipping summary.',
};

export default function CartPage() {
  const sampleItem = MOCK_CATALOG[0]; // Atorvastatin Calcium 20mg

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Order Review
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Shopping Cart
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Review your maintenance medication supply, itemized landed costs, and prescription requirements.
          </p>
        </div>

        {/* Cart Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] shrink-0">
                  <Pill className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg font-bold text-[#111411]">
                      {sampleItem.name}
                    </h2>
                    <span className="font-mono font-bold text-base text-[#111411]">
                      {formatCurrency(sampleItem.retailPriceUsd)}
                    </span>
                  </div>
                  <p className="text-xs text-[#59605A]">{sampleItem.brandReferenceName}</p>
                  <p className="text-xs text-[#848D85]">{sampleItem.dosageForm} • 90 Tablets (3-Month Supply)</p>
                  <div className="pt-2 flex items-center gap-2">
                    <Badge variant="green" size="sm">
                      {sampleItem.strength}
                    </Badge>
                    <span className="text-[11px] text-[#848D85] font-mono">Lot: {sampleItem.batch.lotNumber}</span>
                  </div>
                </div>
              </div>

              {/* Prescription Reminder Alert */}
              <div className="rounded-xl border border-[#E6ECE7] bg-[#F3F7F3] p-4 flex items-start gap-3 text-xs text-[#59605A]">
                <CheckCircle2 className="h-4 w-4 text-[#2F5D3A] shrink-0 mt-0.5" />
                <span>
                  Valid U.S. physician prescription required. You will be prompted to upload your prescription scan during checkout.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <Link href="/medicines" className="text-[#2F5D3A] font-semibold hover:underline">
                ← Continue browsing medicines
              </Link>
              <span className="text-[#848D85]">Standard 90-day maintenance maximum</span>
            </div>
          </div>

          {/* Order Summary (5 Columns) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E6ECE7] bg-[#F3F7F3] p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-[#111411]">Order Summary</h3>

            <div className="space-y-3 text-xs sm:text-sm text-[#59605A] border-b border-[#E6ECE7] pb-4">
              <div className="flex items-center justify-between">
                <span>90-Day Medication Cost:</span>
                <span className="font-mono font-bold text-[#111411]">{formatCurrency(sampleItem.retailPriceUsd)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bonded Air Cargo Shipping:</span>
                <span className="font-mono text-[#111411]">$12.50</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Clinical Pharmacist Review:</span>
                <span className="text-[#2F5D3A] font-semibold">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated U.S. Retail Cash Price:</span>
                <span className="line-through text-[#848D85]">{formatCurrency(sampleItem.usAverageCashPrice)}</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#848D85] block">Total Landed Price</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#111411]">
                  {formatCurrency(sampleItem.retailPriceUsd + 12.50)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#2F5D3A]">
                  You Save {formatCurrency(sampleItem.usAverageCashPrice - sampleItem.retailPriceUsd)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="w-full h-12 rounded-xl bg-[#2F5D3A] text-sm font-semibold text-white hover:bg-[#24482D] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Proceed to Prescription Verification</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 text-[11px] text-[#848D85] text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2F5D3A]" />
              <span>Covered by 100% Customs Seizure Guarantee</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
