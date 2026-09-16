import React from 'react';
import Link from 'next/link';
import { Shield, PhoneCall, FileCheck, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top Clinical Utility Bar */}
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-1.5 text-xs text-slate-600">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">
              India → USA Pharmaceutical Corridor Active
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-500">
              Personal Importation Policy (FDA CPG Sec. 110.300)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${siteConfig.support.pharmacistHotline}`}
              className="flex items-center gap-1.5 font-semibold text-teal-800 hover:text-teal-900"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Pharmacist Consultation: {siteConfig.support.pharmacistHotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-white shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Indo<span className="text-teal-800">Pharm</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Direct Sourcing
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-teal-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#prescriptions"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <FileCheck className="h-4 w-4 text-teal-700" />
            <span>Upload Prescription</span>
          </Link>

          <Link
            href="/#catalog"
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-900 transition-colors"
          >
            <span>Browse Medications</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
