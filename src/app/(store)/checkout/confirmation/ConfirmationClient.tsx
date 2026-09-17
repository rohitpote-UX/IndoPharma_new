'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  FileCheck2,
  ThermometerSnowflake,
  PlaneTakeoff,
  ShieldCheck,
  Printer,
  ArrowRight,
} from 'lucide-react';
import { useDestination } from '@/lib/context/DestinationContext';

export function ConfirmationClient() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'INDO-ORD-839201-9412';
  const orderId = searchParams.get('orderId') || 'order_latest';
  const { destination } = useDestination();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Focused Top Header Bar */}
      <header className="border-b border-[#E6ECE7] bg-white sticky top-0 z-30 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#2F5D3A]">IndoPharm</span>
            <span className="text-[10px] uppercase tracking-wider bg-[#F3F7F3] text-[#2F5D3A] px-2 py-0.5 rounded font-mono font-medium">
              Verified Direct
            </span>
          </Link>
          <a
            href="tel:+18005554636"
            className="flex items-center gap-1.5 text-xs text-[#59605A] hover:text-[#111411] transition-colors"
          >
            <span>Pharmacy Care: 1-800-555-INDO</span>
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Confirmation Hero */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F3F7F3] text-[#2F5D3A] flex items-center justify-center mx-auto ring-8 ring-[#F3F7F3]/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono tracking-widest text-[#2F5D3A] font-semibold">
              Order Confirmed & Authorized
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#111411]">
              Thank You for Your Order
            </h1>
          </div>
          <p className="text-sm text-[#59605A] max-w-lg mx-auto">
            Your pharmaceutical order is now logged in our secure batch dispatch system and has entered clinical import verification.
          </p>

          <div className="inline-flex items-center gap-3 bg-[#F3F7F3] border border-[#E6ECE7] rounded-xl px-5 py-3 text-sm">
            <span className="text-[#59605A]">Order Reference:</span>
            <span className="font-mono font-bold text-[#111411] tracking-wider">{orderNumber}</span>
            <span className="text-neutral-300">|</span>
            <span className="font-mono text-xs text-[#59605A]">ID: {orderId}</span>
          </div>
        </div>

        {/* 4-Step Fulfillment Pipeline Card */}
        <div className="border border-[#E6ECE7] rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E6ECE7]">
            <h2 className="text-base font-serif font-bold text-[#111411]">Fulfillment & Dispatch Timeline</h2>
            <span className="text-xs font-mono text-[#2F5D3A] bg-[#F3F7F3] px-2.5 py-1 rounded-full font-medium">
              Estimated Delivery: 8–12 Business Days
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#2F5D3A] bg-[#F3F7F3]/60 relative space-y-2">
              <div className="flex items-center gap-2 text-[#2F5D3A]">
                <FileCheck2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Step 1</span>
              </div>
              <p className="text-xs font-semibold text-[#111411]">Clinical Review</p>
              <p className="text-[11px] text-[#59605A]">
                Prescription matched against export manifest regulations (12–24h).
              </p>
              <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                In Progress
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#E6ECE7] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#59605A]">
                <ThermometerSnowflake className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Step 2</span>
              </div>
              <p className="text-xs font-semibold text-[#111411]">Cold Packing</p>
              <p className="text-[11px] text-[#59605A]">
                Batch retrieval with continuous digital temperature loggers.
              </p>
              <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                Upcoming
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#E6ECE7] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#59605A]">
                <PlaneTakeoff className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Step 3</span>
              </div>
              <p className="text-xs font-semibold text-[#111411]">Bonded Transit</p>
              <p className="text-[11px] text-[#59605A]">
                Direct air express clearance through bonded customs terminal.
              </p>
              <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                Upcoming
              </span>
            </div>

            <div className="p-4 rounded-xl border border-[#E6ECE7] bg-white space-y-2">
              <div className="flex items-center gap-2 text-[#59605A]">
                <Package className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Step 4</span>
              </div>
              <p className="text-xs font-semibold text-[#111411]">Final Delivery</p>
              <p className="text-[11px] text-[#59605A]">
                Secure delivery to your destination in {destination.countryName}.
              </p>
              <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600">
                Upcoming
              </span>
            </div>
          </div>
        </div>

        {/* Regulatory & Safety Compliance Notice */}
        <div className="p-5 rounded-2xl border border-[#E6ECE7] bg-[#F3F7F3]/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2F5D3A]">
            <ShieldCheck className="w-4 h-4" />
            <span>Personal Importation Compliance Record</span>
          </div>
          <p className="text-xs text-[#59605A] leading-relaxed">
            This shipment is governed by FDA personal importation policy guidance (CPG 110.300) and equivalent destination jurisdiction guidelines. Your shipment documentation includes an authenticated invoice, batch certificate of analysis (CoA), and export manifest.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-[#E6ECE7] bg-white text-xs font-medium text-[#111411] hover:bg-neutral-50 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#59605A]" />
            <span>Print Order Receipt</span>
          </button>

          <Link
            href="/medicines"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2F5D3A] text-white text-xs font-medium hover:bg-[#3F704A] transition-colors shadow-sm"
          >
            <span>Continue to Verified Medicines</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
