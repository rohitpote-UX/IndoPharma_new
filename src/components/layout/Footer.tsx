import React from 'react';
import Link from 'next/link';
import { Shield, Lock, AlertTriangle, Phone, Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 text-xs">
      {/* Primary Legal & Regulatory Warning */}
      <div className="border-b border-slate-800 bg-slate-950/60 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-6 text-amber-200/90">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-2 text-xs leading-relaxed">
              <div className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Statutory Regulatory & Clinical Disclosure
              </div>
              <p>{siteConfig.disclaimers.regulatoryNotice}</p>
              <p>{siteConfig.disclaimers.controlledSubstancesBan}</p>
              <p>{siteConfig.disclaimers.medicalAdvice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Footer Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-teal-400" />
              <span className="text-base font-bold tracking-tight">
                Indo<span className="text-teal-400">Pharm</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {siteConfig.shortDescription}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-300">
              <Lock className="h-3.5 w-3.5" />
              <span>TLS 1.3 256-bit Encrypted Platform</span>
            </div>
          </div>

          <div>
            <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px] mb-3">
              Platform Architecture
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/#catalog" className="hover:text-white transition-colors">
                  Generic Medication Directory
                </Link>
              </li>
              <li>
                <Link href="/#provenance" className="hover:text-white transition-colors">
                  Manufacturer Provenance
                </Link>
              </li>
              <li>
                <Link href="/#pricing-transparency" className="hover:text-white transition-colors">
                  Landed-Cost Model
                </Link>
              </li>
              <li>
                <Link href="/#regulatory-notice" className="hover:text-white transition-colors">
                  Regulatory Matrix
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px] mb-3">
              Clinical & Compliance
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/#prescriptions" className="hover:text-white transition-colors">
                  Prescription Intake Requirements
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Zero-Controlled-Substances Policy</span>
              </li>
              <li>
                <span className="text-slate-500">90-Day Supply Personal Import Limit</span>
              </li>
              <li>
                <span className="text-slate-500">Certificate of Analysis Traceability</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px] mb-3">
              Clinical Support & Inquiries
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">{siteConfig.support.pharmacistHotline}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-300">{siteConfig.support.email}</span>
              </li>
              <li className="text-[11px] text-slate-500">
                Support Hours: {siteConfig.support.hours}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} IndoPharm Platform. All rights reserved. Built for verifiable pharmaceutical commerce.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Personal Importation Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
