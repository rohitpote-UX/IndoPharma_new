'use strict';

import React, { useState } from 'react';
import { Product } from '@/lib/domain/product';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface ProductFAQProps {
  product: Product;
}

export const ProductFAQ: React.FC<ProductFAQProps> = ({ product }) => {
  // Combine custom faqs from product with verified baseline FAQs
  const defaultFaqs: Array<{ question: string; answer: string }> = [
    {
      question: `Where is this ${product.name} manufactured?`,
      answer: `This batch is formulated and manufactured by ${product.manufacturer?.name || 'an audited Indian pharmaceutical manufacturer'} at their audited facility in ${product.manufacturer?.facilityCity || 'India'}. The manufacturing site holds current WHO-GMP compliance certification.`,
    },
    {
      question: `Is a prescription required for delivery to the United States?`,
      answer: product.requiresPrescription
        ? 'Yes. In compliance with U.S. FDA Personal Importation guidelines (CPG Sec. 110.300), all orders of this product require a valid, unexpired prescription from a licensed healthcare practitioner.'
        : 'No prescription is required for this product as it is classified for over-the-counter or non-controlled availability.',
    },
    {
      question: `What is the pack size and supply duration?`,
      answer: `This product comes packaged as ${product.packageSize || 90} units (${product.dosageForm || 'tablets'}). For once-daily regimens, this represents a standard 90-day maintenance supply.`,
    },
    {
      question: `What documentation accompanies my order?`,
      answer: `Every order includes a verified manufacturer Certificate of Analysis (CoA) reference, clear pharmaceutical batch serialization, storage instructions, and a full U.S. Customs commercial declaration.`,
    },
  ];

  const faqs = product.faqs && product.faqs.length > 0 ? product.faqs : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="bg-white border border-[#E6ECE7] rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-[#2F5D3A]" />
        <div>
          <h3 className="font-serif text-lg text-[#111411]">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-[#59605A]">
            Verified product, regulatory, and fulfillment details.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#E6ECE7] pt-2">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between text-left font-medium text-sm text-[#111411] hover:text-[#2F5D3A] transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ml-4 ${
                    isOpen ? 'rotate-180 text-[#2F5D3A]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2 text-xs text-[#59605A] leading-relaxed animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
