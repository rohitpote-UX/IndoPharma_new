import React from 'react';
import Link from 'next/link';
import { Shield, Lock, AlertTriangle, Phone, Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-[#E4E7DC] bg-[#171914] text-[#8A9081] text-xs">
      {/* Primary Legal & Statutory Regulatory Warning Box */}
      <div className="border-b border-[#52564C]/30 bg-[#0F100D] px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex items-start gap-4 rounded-2xl border border-[#94681E]/30 bg-[#94681E]/10 p-5 sm:p-7 text-[#FDF7E7]">
            <AlertTriangle className="h-6 w-6 shrink-0 text-[#F2DEB0] mt-0.5" />
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="font-bold text-[#F2DEB0] uppercase tracking-wider text-[11px]">
                Statutory Regulatory & Clinical Disclosure
              </div>
              <p>{siteConfig.disclaimers.regulatoryNotice}</p>
              <p>{siteConfig.disclaimers.controlledSubstancesBan}</p>
              <p>{siteConfig.disclaimers.medicalAdvice}</p>
              <p className="text-[11px] text-[#FDF7E7]/80 pt-1">
                {siteConfig.disclaimers.deliveryTimeline}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured 5-Column Navigation */}
      <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#596B3A] text-white">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Indo<span className="text-[#596B3A]">Pharm</span>
              </span>
            </div>
            <p className="text-xs text-[#8A9081] leading-relaxed">
              Direct pharmaceutical commerce bridge from verified Indian manufacturing plants to U.S. maintenance patients.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#EEF1E6]">
              <Lock className="h-3.5 w-3.5 text-[#596B3A]" />
              <span>TLS 1.3 256-bit Encrypted Platform</span>
            </div>
          </div>

          {/* Col 2: Medicines */}
          <div>
            <div className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Medicines
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link href="#catalog" className="hover:text-white transition-colors">
                  Cardiovascular Therapies
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-white transition-colors">
                  Metabolic & Diabetes Care
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-white transition-colors">
                  Endocrine & Thyroid
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-white transition-colors">
                  Gastrointestinal Health
                </Link>
              </li>
              <li>
                <Link href="#catalog" className="hover:text-white transition-colors">
                  90-Day Standard Refills
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Provenance */}
          <div>
            <div className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Trust & Quality
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link href="#trust" className="hover:text-white transition-colors">
                  Verified Manufacturing Plants
                </Link>
              </li>
              <li>
                <Link href="#trust" className="hover:text-white transition-colors">
                  Certificate of Analysis (CoA)
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white transition-colors">
                  Transparent Landed-Cost Model
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  8-Stage Chain of Custody
                </Link>
              </li>
              <li>
                <span className="text-[#52564C]">Zero Controlled Substances</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <div className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Support
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#596B3A]" />
                <span className="text-white font-mono">{siteConfig.support.pharmacistHotline}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#596B3A]" />
                <span>{siteConfig.support.email}</span>
              </li>
              <li className="text-[11px] text-[#52564C]">
                {siteConfig.support.hours}
              </li>
              <li>
                <Link href="#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Legal & Regulatory */}
          <div>
            <div className="font-bold uppercase tracking-wider text-white text-[11px] mb-4">
              Legal & Compliance
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link href="#regulatory-notice" className="hover:text-white transition-colors">
                  Personal Importation Policy
                </Link>
              </li>
              <li>
                <Link href="#support" className="hover:text-white transition-colors">
                  Prescription Requirements
                </Link>
              </li>
              <li>
                <span className="text-[#52564C]">Privacy & HIPAA Safeguards</span>
              </li>
              <li>
                <span className="text-[#52564C]">Terms of Service</span>
              </li>
              <li>
                <span className="text-[#52564C]">Refund & Customs Guarantee</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution & Statutory Disclaimers */}
        <div className="mt-14 border-t border-[#52564C]/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#52564C]">
          <div>
            © {new Date().getFullYear()} IndoPharm Platform. Built for verifiable pharmaceutical commerce.
          </div>
          <div className="flex items-center gap-6">
            <span>U.S. FDA Personal Importation (CPG 110.300)</span>
            <span>CDSCO Registered Origin</span>
            <span>90-Day Supply Limit Enforced</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
