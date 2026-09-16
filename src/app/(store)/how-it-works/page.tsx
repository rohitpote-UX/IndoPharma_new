import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Search,
  FileCheck,
  ClipboardCheck,
  CreditCard,
  Building2,
  Plane,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'How It Works | IndoPharm',
  description:
    'From discovery to delivery: explore our transparent 6-stage cross-border pharmaceutical ordering process for essential maintenance medications.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Find',
      label: 'Medication Discovery',
      icon: Search,
      description:
        'Search our verified catalog by generic molecule or U.S. brand reference. All listed products are limited strictly to chronic maintenance therapies with verified manufacturing provenance.',
    },
    {
      num: '02',
      title: 'Review',
      label: 'Batch & Pricing Transparency',
      icon: FileCheck,
      description:
        'Examine itemized landed pricing, active batch lot numbers, HPLC assay purity results, and WHO-GMP facility credentials before ordering. Total transparency at every step.',
    },
    {
      num: '03',
      title: 'Order',
      label: 'Prescription Verification',
      icon: ClipboardCheck,
      description:
        'Submit patient information and upload a clear copy of your valid, unexpired U.S. physician prescription. Every prescription is independently reviewed by licensed clinical pharmacists.',
    },
    {
      num: '04',
      title: 'Payment',
      label: 'Secure Transaction Hold',
      icon: CreditCard,
      description:
        'Complete payment using 256-bit encrypted checkout. Funds are placed on administrative authorization hold and are only charged once clinical and export verification is cleared.',
    },
    {
      num: '05',
      title: 'Fulfillment',
      label: 'WHO-GMP Packaging & CDSCO Export',
      icon: Building2,
      description:
        'Orders are packaged directly in accredited manufacturing facilities in Gujarat and Maharashtra, verified against batch records, and cleared for legal export by Indian CDSCO customs authorities.',
    },
    {
      num: '06',
      title: 'Tracking',
      label: 'Bonded Air Cargo to U.S. Doorstep',
      icon: Plane,
      description:
        'Dispatched via temperature-monitored international air transit. Cleared through U.S. customs under FDA Personal Importation guidelines (CPG 110.300) and delivered in tamper-evident packaging in 10–14 business days.',
    },
  ];

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Hero */}
        <div className="max-w-3xl space-y-4 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            The Ordering Journey
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411] leading-tight">
            From discovery to delivery.
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            A comprehensive, transparent explanation of how our cross-border pharmaceutical platform operates.
            Designed for patient clarity, regulatory compliance, and peace of mind.
          </p>
        </div>

        {/* 6-Stage Visual Narrative Grid */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-7 sm:p-8 space-y-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-[#2F5D3A]/40 transition-colors"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl sm:text-4xl font-light text-[#2F5D3A]/40">
                      {step.num}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-[#848D85] block">
                      {step.label}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-[#111411]">
                      {step.title}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="h-1 w-8 bg-[#2F5D3A]/20 rounded-full" />
              </div>
            );
          })}
        </div>

        {/* Regulatory & Safety Assurance Callout */}
        <div className="mt-16 rounded-3xl border border-[#E6ECE7] bg-[#F3F7F3] p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-2.5 text-[#2F5D3A]">
            <ShieldCheck className="h-6 w-6" />
            <h3 className="text-lg sm:text-xl font-bold text-[#111411]">
              Regulatory Guardrails & Compliance Standards
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs sm:text-sm text-[#59605A] leading-relaxed">
            <div>
              <strong className="text-[#111411] block mb-1">Prescription Prerequisite</strong>
              No prescription medication is ever dispensed without independent verification by a licensed U.S. clinical pharmacist.
            </div>
            <div>
              <strong className="text-[#111411] block mb-1">90-Day Supply Limitation</strong>
              All shipments strictly comply with FDA Personal Importation (CPG 110.300) limits for individual personal maintenance use.
            </div>
            <div>
              <strong className="text-[#111411] block mb-1">Zero Controlled Substances</strong>
              IndoPharm prohibits any scheduled or controlled medications. We specialize exclusively in non-controlled chronic maintenance therapies.
            </div>
          </div>
        </div>

        {/* Final Action Bar */}
        <div className="mt-16 pt-10 border-t border-[#E6ECE7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-[#111411]">Ready to explore available therapies?</h4>
            <p className="text-xs text-[#59605A]">Browse our transparent formulary with itemized landed pricing.</p>
          </div>
          <Link
            href="/medicines"
            className="group inline-flex h-12 px-6 rounded-xl bg-[#2F5D3A] text-xs font-semibold text-white hover:bg-[#24482D] transition-colors items-center gap-2"
          >
            <span>Explore Medicines</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
