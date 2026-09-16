'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is it legal to order personal maintenance medication from India into the United States?',
      a: 'Yes, under the U.S. FDA Personal Importation Policy (Compliance Policy Guide 7132.30, now CPG 110.300), individuals may import non-controlled, personal-use prescription medications for serious or chronic health maintenance. Conditions include: the drug is for personal use, does not represent an unreasonable commercial risk, is limited to a maximum 90-day supply, and is backed by an unexpired prescription from a licensed U.S. physician.',
    },
    {
      q: 'Do I need a valid U.S. prescription?',
      a: 'Yes, strictly. IndoPharm requires an unexpired prescription written by a licensed U.S. physician for all prescription medications. During checkout or through your account portal, you will upload a clear scan or photograph of your prescription label. Our clinical pharmacy team verifies each prescription before fulfillment.',
    },
    {
      q: 'Are the medications genuine and identical to U.S. pharmacy generics?',
      a: 'Yes. India manufactures over 40% of the generic drugs consumed in the United States. The medications on IndoPharm are manufactured in the exact same WHO-GMP certified facilities that supply major U.S. pharmacy chains. Every batch includes a verified HPLC purity assay on file.',
    },
    {
      q: 'How long does international air delivery take?',
      a: 'Average delivery takes 10 to 14 business days from the date of clinical prescription verification. Every shipment travels via international bonded air cargo with end-to-end tracking provided immediately upon dispatch.',
    },
    {
      q: 'What happens if a parcel is delayed or inspected by U.S. Customs?',
      a: 'All shipments comply with FDA CPG 110.300 and include standard customs declarations, packaging inserts, and physician prescription documentation. In the rare event of a customs delay or seizure, IndoPharm automatically reships your order at zero cost or issues a 100% full refund.',
    },
    {
      q: 'Why are prices 60–85% lower than U.S. cash retail prices?',
      a: 'We eliminate domestic pharmacy benefit managers (PBMs), wholesale middlemen spreads, and retail markups. By sourcing directly from verified Indian manufacturers under personal importation, patients access direct wholesale factory rates.',
    },
    {
      q: 'Can I order controlled substances or opioids on IndoPharm?',
      a: 'No. IndoPharm strictly prohibits controlled substances, opioids, benzodiazepines, stimulants, and scheduled narcotics. We specialize exclusively in non-controlled chronic maintenance therapies (e.g. cholesterol, blood pressure, thyroid, diabetes, and gastrointestinal care).',
    },
  ];

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
          <span className="text-[#111411] font-medium">FAQ</span>
        </nav>

        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-8 sm:pb-12 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Questions & Answers
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411]">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Essential information regarding our legal framework, prescription verification,
            and shipping procedures.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-10 max-w-3xl divide-y divide-[#E6ECE7]">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={faq.q} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-start justify-between gap-4 text-left cursor-pointer group"
                >
                  <span className="text-base sm:text-lg font-bold text-[#111411] group-hover:text-[#2F5D3A] transition-colors">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#2F5D3A] mt-1 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="mt-3 text-sm sm:text-base text-[#59605A] leading-relaxed pr-8 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
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
