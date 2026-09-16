import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, Plane, ShieldCheck, ArrowLeft, Clock } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | IndoPharm',
  description:
    'Complete details on our 10–14 business day international air cargo shipping, temperature telemetry, U.S. customs clearance, and delivery guarantee.',
};

export default function ShippingHelpPage() {
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
          <span className="text-[#111411] font-medium">Shipping & Delivery</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Logistics & Customs
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Shipping & Delivery
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            All IndoPharm medications travel via temperature-monitored international bonded air transit,
            clearing U.S. customs under established personal importation guidelines.
          </p>
        </div>

        {/* Key Specifications Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
              <Clock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111411]">10–14 Business Days</h2>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              Standard transit from our audited Indian origin facilities to any residential U.S. address.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
              <Plane className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111411]">Bonded Air Cargo</h2>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              Expedited commercial air freight with thermal insulation preventing temperature excursions.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111411]">Customs Guarantee</h2>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              In the unlikely event of customs detention or damage, we reship free or issue a 100% full refund.
            </p>
          </div>
        </div>

        {/* Detailed Shipping Breakdown */}
        <div className="mt-14 max-w-3xl space-y-8 text-sm sm:text-base text-[#59605A] leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411]">1. Dispatch & Tracking Updates</h3>
            <p>
              Once your clinical prescription review is completed by our pharmacists (typically within 4–6 business hours),
              your order is packaged at the origin facility and assigned a universal international tracking number.
              Tracking updates are sent via email and SMS at dispatch, international customs departure, U.S. port of entry,
              and out-for-delivery stages.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411]">2. U.S. Customs Clearance (CPG 110.300)</h3>
            <p>
              Every parcel includes an official packaging invoice, CDSCO export clearance certification, and a copy of your
              U.S. prescription label. Shipments conform strictly with FDA Personal Importation guidelines for up to a 90-day
              maintenance supply.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411]">3. Flat-Rate Transparent Shipping</h3>
            <p>
              We charge a flat landed shipping rate of $12.50 for standard bonded international air delivery.
              Orders of $75 or more include complimentary free shipping. There are zero customs broker charges or surprise
              import duties billed to the patient.
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
