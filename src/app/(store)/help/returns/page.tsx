import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, RotateCcw, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Refunds & Returns Policy | IndoPharm',
  description:
    'IndoPharm Returns & Refund Policy: Complete Customs Seizure Guarantee, damaged parcel replacement, and cancellation guidelines.',
};

export default function ReturnsHelpPage() {
  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#59605A] pb-8">
          <Link href="/" className="hover:text-[#2F5D3A] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#848D85]" />
          <Link href="/help" className="hover:text-[#2F5D3A] transition-colors">
            Help Center
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#848D85]" />
          <span className="text-[#111411] font-medium">Refunds & Returns</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Patient Protection
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Refunds & Guarantee
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Our goal is complete patient confidence. Learn about our 100% Customs Delivery Guarantee
            and pharmaceutical safety return standards.
          </p>
        </div>

        {/* 100% Customs Guarantee Banner */}
        <div className="mt-12 rounded-3xl border border-[#E6ECE7] bg-[#F3F7F3] p-8 sm:p-10 space-y-4">
          <div className="flex items-center gap-2.5 text-[#2F5D3A]">
            <ShieldCheck className="h-6 w-6" />
            <h2 className="text-xl font-bold text-[#111411]">
              100% Customs Delivery & Seizure Guarantee
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed max-w-2xl">
            If your parcel is lost in transit, damaged, or delayed/detained by U.S. Customs beyond 21 business days,
            we will automatically offer your choice of:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm font-semibold text-[#111411]">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2F5D3A]" />
              <span>Immediate free expedited reshipment</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2F5D3A]" />
              <span>Full 100% refund to your original payment method</span>
            </li>
          </ul>
        </div>

        {/* Pharmaceutical Return Standards */}
        <div className="mt-14 max-w-3xl space-y-8 text-sm sm:text-base text-[#59605A] leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#2F5D3A]" />
              <span>Pharmaceutical Safety Standards</span>
            </h3>
            <p>
              In accordance with international pharmaceutical safety regulations and FDA guidelines, medications
              that have left temperature-controlled custody cannot be returned to stock or resold once delivered.
              Therefore, we cannot accept physical returns of opened or intact prescription medication.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411] flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-[#2F5D3A]" />
              <span>Damaged or Discrepant Deliveries</span>
            </h3>
            <p>
              If your parcel arrives with physical packaging damage or an incorrect product count, notify our patient
              support team within 7 days of delivery with a photo of the exterior parcel label. We will immediately
              dispatch a replacement order with zero fees.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411]">Order Cancellations</h3>
            <p>
              Orders may be cancelled free of charge at any time prior to clinical prescription review and facility
              packaging. Once an order has been cleared by our pharmacists and transferred to bonded air dispatch,
              the shipment cannot be recalled.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-16 pt-8 border-t border-[#E6ECE7]">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#2F5D3A] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Help Center</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
