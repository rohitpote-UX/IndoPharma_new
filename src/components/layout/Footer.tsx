import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[#E6ECE7] text-[#59605A] text-xs py-14 sm:py-18">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 space-y-12">
        {/* Compact 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand Statement */}
          <div className="space-y-3 lg:col-span-2 lg:pr-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-[#2F5D3A] text-white flex items-center justify-center text-xs font-bold font-serif">
                I
              </div>
              <span className="text-base font-bold tracking-tight text-[#111411]">
                Indo<span className="text-[#2F5D3A]">Pharm</span>
              </span>
            </Link>
            <p className="text-xs text-[#59605A] leading-relaxed max-w-sm">
              Direct India → USA pharmaceutical commerce platform for chronic maintenance care.
              Transparent landed costs, WHO-GMP factory provenance, and verified batch testing.
            </p>
            <div className="text-[11px] text-[#848D85] pt-1">
              Personal Importation compliance under FDA CPG 110.300.
            </div>
          </div>

          {/* Col 2: SHOP */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-[#111411] text-[11px]">
              Shop
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/medicines" className="hover:text-[#2F5D3A] transition-colors">
                  Medicines Catalogue
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#2F5D3A] transition-colors">
                  Search & Discovery
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#2F5D3A] transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[#2F5D3A] transition-colors">
                  Account Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: COMPANY */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-[#111411] text-[11px]">
              Company
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/how-it-works" className="hover:text-[#2F5D3A] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-[#2F5D3A] transition-colors">
                  Trust & Sourcing
                </Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-[#2F5D3A] transition-colors">
                  Batch Quality Assays
                </Link>
              </li>
              <li>
                <Link href="/trust" className="hover:text-[#2F5D3A] transition-colors">
                  Supply Chain Custody
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: SUPPORT & LEGAL */}
          <div className="space-y-3">
            <div className="font-semibold uppercase tracking-wider text-[#111411] text-[11px]">
              Support & Legal
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/help" className="hover:text-[#2F5D3A] transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help/faq" className="hover:text-[#2F5D3A] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/help/shipping" className="hover:text-[#2F5D3A] transition-colors">
                  Shipping & Customs
                </Link>
              </li>
              <li>
                <Link href="/help/payments" className="hover:text-[#2F5D3A] transition-colors">
                  Payment Security
                </Link>
              </li>
              <li>
                <Link href="/help/returns" className="hover:text-[#2F5D3A] transition-colors">
                  Refund & Return Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Statement & Copyright */}
        <div className="pt-8 border-t border-[#E6ECE7] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-[#848D85]">
          <div>
            © {new Date().getFullYear()} IndoPharm Platform. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>Valid U.S. Prescription Strictly Required</span>
            <span>•</span>
            <span>No Controlled Substances</span>
            <span>•</span>
            <span>WHO-GMP Origin Plants</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
