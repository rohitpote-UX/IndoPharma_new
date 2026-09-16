'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Do I need a prescription from a U.S. licensed doctor?',
      answer:
        'Yes. An authentic, unexpired prescription issued by a licensed U.S. healthcare practitioner with an active National Provider Identifier (NPI) is strictly required for all prescription medications. Every prescription is scrutinized and verified by a licensed clinical pharmacist before any order is picked or dispatched.',
    },
    {
      question: 'How does personal importation from India work under U.S. law?',
      answer:
        'Under the FDA Personal Importation Policy (CPG Sec. 110.300), the FDA exercises regulatory discretion permitting individuals to import up to a 90-day supply of non-controlled maintenance medication for personal medical use. IndoPharm operates strictly within these quantitative and statutory personal use limits.',
    },
    {
      question: 'Does IndoPharm sell or ship controlled substances?',
      answer:
        'No. IndoPharm strictly prohibits the sale, transfer, or shipment of any DEA Schedule II, III, IV, or V controlled substances (such as opioids, stimulants, or benzodiazepines). Controlled substances cannot lawfully be imported by mail or courier and are categorically barred from our platform.',
    },
    {
      question: 'What is the standard delivery timeline for orders?',
      answer:
        'Orders dispatched from verified manufacturing consolidation hubs in India via bonded international express air transit typically arrive at U.S. residential addresses within 10 to 14 business days, subject to U.S. Customs & Border Protection inspection and domestic priority courier handoff.',
    },
    {
      question: 'How does payment authorization work?',
      answer:
        'When you place an order, your payment method is authorized on hold. Funds are not captured until your prescription has been reviewed and approved by our clinical pharmacist and your shipment has passed export customs clearance. If a prescription is declined, the hold is voided immediately.',
    },
    {
      question: 'How can I verify the quality and authenticity of my medication?',
      answer:
        'Every medication is sourced directly from manufacturing plants registered with the CDSCO and audited by international regulatory authorities. Every batch is serialized and linked to an official Certificate of Analysis (CoA) demonstrating chemical identity and laboratory assay purity.',
    },
    {
      question: 'What happens if a shipment experiences a customs delay?',
      answer:
        'All shipments travel under temperature-monitored bonded logistics with active milestone tracking. If any shipment experiences an unresolvable customs hold or delivery failure exceeding 21 calendar days, IndoPharm guarantees an immediate 100% refund or an expedited replacement shipment.',
    },
    {
      question: 'How do 90-day refills work?',
      answer:
        'To ensure patient care is never interrupted, our platform monitors your remaining tablet count and deploys proactive adherence notifications on Day 75 of your 90-day cycle. You can confirm your refill with a single click inside your patient portal.',
    },
  ];

  return (
    <section id="faq" className="py-20 sm:py-32 border-b border-[#E4E7DC] bg-[#FAFAF7]">
      <Container size="narrow">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold text-[#43522B] border border-[#D1D6C5]">
            <HelpCircle className="h-3.5 w-3.5 text-[#596B3A]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-section-title text-[#171914]">
            Answers to common questions.
          </h2>
          <p className="text-editorial-lead max-w-lg mx-auto text-[#52564C]">
            Detailed information regarding our clinical standards, statutory personal importation,
            international transit, and payment safeguards.
          </p>
        </div>

        {/* WAI-ARIA Accordion List */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const headingId = `faq-heading-${index}`;
            const panelId = `faq-panel-${index}`;

            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-[#E4E7DC] bg-white transition-all overflow-hidden"
              >
                <button
                  type="button"
                  id={headingId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full min-h-[56px] flex items-center justify-between p-5 sm:p-6 text-left hover:bg-[#FAFAF7] transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-[#171914] pr-4">
                    {faq.question}
                  </span>
                  <span className="text-[#596B3A] shrink-0">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headingId}
                    className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#52564C] leading-relaxed border-t border-[#E4E7DC]/60 pt-4"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
