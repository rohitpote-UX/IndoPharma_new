import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronRight, CreditCard, Lock, DollarSign, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Payment & Security | IndoPharm',
  description:
    'Learn about our transparent USD pricing, 256-bit encrypted checkout, zero hidden fees, and administrative authorization hold policy.',
};

export default function PaymentsHelpPage() {
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
          <span className="text-[#111411] font-medium">Payment & Security</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Billing Standards
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Payment & Security
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            All IndoPharm transactions are processed with bank-grade 256-bit encryption in U.S. Dollars (USD),
            with zero surprise foreign exchange fees.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
              <DollarSign className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111411]">Zero Foreign Transaction Fees</h2>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              Billed directly in USD. The price shown at checkout is the exact amount debited from your card.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111411]">PCI-DSS Level 1 Encryption</h2>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              End-to-end tokenized processing. Card numbers are never stored on IndoPharm servers.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
              <CreditCard className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-[#111411]">Authorization Hold Policy</h2>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              Funds are held on authorization and only captured once clinical prescription verification is cleared.
            </p>
          </div>
        </div>

        {/* Detailed Payment Breakdown */}
        <div className="mt-14 max-w-3xl space-y-8 text-sm sm:text-base text-[#59605A] leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411]">Accepted Payment Methods</h3>
            <p>
              We accept all major U.S. credit and debit cards (Visa, MasterCard, American Express, Discover),
              as well as Health Savings Account (HSA) and Flexible Spending Account (FSA) debit cards for
              eligible maintenance prescriptions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#111411]">Receipts for Insurance Reimbursement</h3>
            <p>
              While IndoPharm operates outside of domestic PBM insurance networks to provide wholesale cash pricing,
              every order receipt includes standard NDC codes, quantity, active ingredient, and physician details.
              Many patients successfully submit these itemized receipts to their health insurer or HSA administrator
              for out-of-network reimbursement.
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
