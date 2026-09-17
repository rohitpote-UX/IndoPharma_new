'use client';

import React from 'react';
import Link from 'next/link';
import { ProductPassportData } from '@/lib/domain/product';
import { PassportTimeline } from './PassportTimeline';
import { ShieldCheck, Printer, ExternalLink } from 'lucide-react';

interface ProductPassportProps {
  passport: ProductPassportData;
  isModal?: boolean;
  onClose?: () => void;
}

export const ProductPassport: React.FC<ProductPassportProps> = ({
  passport,
  isModal = false,
  onClose,
}) => {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6ECE7] overflow-hidden max-w-4xl mx-auto shadow-sm">
      {/* Header Banner */}
      <div className="bg-[#111411] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#2F5D3A] uppercase mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">AUTHENTIC PHARMACEUTICAL TRACEABILITY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-white">
            Product Passport™
          </h2>
          <p className="text-sm text-neutral-300 mt-1">
            End-to-end provenance for <span className="font-semibold text-white">{passport.product.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Record
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white text-[#111411] text-xs font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          )}

          {isModal && (
            <Link
              href={`/medicines/${passport.product.slug}/passport`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              title="Open full page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Trust & Data Integrity Notice */}
      <div className="bg-[#F3F7F3] p-4 sm:p-5 border-b border-[#E6ECE7] text-xs text-[#59605A] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2F5D3A] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#111411]">Data Integrity Guarantee:</strong> Every stage of this Product Passport™ corresponds directly to authenticated manufacturer batch certificates, CDSCO licenses, and customs export declarations. Where a specific parameter has not been independently verified, it is marked as &ldquo;Not Provided&rdquo;.
        </div>
      </div>

      {/* 9-Stage Timeline Content */}
      <div className="p-6 sm:p-10">
        <PassportTimeline passport={passport} />
      </div>

      {/* Footer */}
      <div className="bg-neutral-50 px-6 py-4 border-t border-[#E6ECE7] flex flex-col sm:flex-row items-center justify-between text-xs text-[#59605A] gap-2">
        <span>Passport Record ID: <code className="font-mono text-[#111411]">PSP-{passport.product.slug.toUpperCase().slice(0, 12)}</code></span>
        <span>Issued under IndoPharm Quality Assurance Protocol v2.4</span>
      </div>
    </div>
  );
};
