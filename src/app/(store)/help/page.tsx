import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  HelpCircle,
  Truck,
  CreditCard,
  RotateCcw,
  User,
  FileCheck,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Help Center | IndoPharm',
  description:
    'IndoPharm Help Center: Find answers about prescription verification, international bonded shipping, payment security, and order tracking.',
};

export default function HelpPage() {
  const categories = [
    {
      icon: HelpCircle,
      title: 'Frequently Asked Questions',
      desc: 'Quick answers regarding ordering, legality, and maintenance refills.',
      href: '/help/faq',
    },
    {
      icon: Truck,
      title: 'Shipping & Delivery',
      desc: '10–14 business day air transit, customs clearance, and tracking.',
      href: '/help/shipping',
    },
    {
      icon: CreditCard,
      title: 'Payment & Pricing',
      desc: 'Transparent pricing, accepted cards, and currency protection.',
      href: '/help/payments',
    },
    {
      icon: RotateCcw,
      title: 'Returns & Guarantee',
      desc: 'Customs seizure guarantee, damaged goods, and refund policies.',
      href: '/help/returns',
    },
    {
      icon: FileCheck,
      title: 'Prescription Verification',
      desc: 'How to upload your U.S. physician prescription and pharmacist review.',
      href: '/help/faq',
    },
    {
      icon: User,
      title: 'Account & Refills',
      desc: 'Manage your profile, automated refill alerts, and order history.',
      href: '/account',
    },
  ];

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Hero */}
        <div className="max-w-3xl space-y-4 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Support Hub
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411] leading-tight">
            How can we help?
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            Find immediate answers regarding prescription requirements, shipping timelines,
            payment security, and order management.
          </p>
        </div>

        {/* Quick Category Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-7 space-y-6 hover:border-[#2F5D3A]/40 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] group-hover:bg-[#2F5D3A] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-[#111411] group-hover:text-[#2F5D3A] transition-colors">
                    {cat.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2F5D3A]">
                  <span>Explore guidance</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Direct Pharmacist Support Box */}
        <div className="mt-16 rounded-3xl border border-[#E6ECE7] bg-[#F3F7F3] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-[#2F5D3A] font-semibold text-xs uppercase tracking-wider">
              <PhoneCall className="h-4 w-4" />
              <span>Licensed Pharmacist Hotline</span>
            </div>
            <h3 className="text-2xl font-bold text-[#111411]">
              Need clinical consultation regarding your medication?
            </h3>
            <p className="text-xs sm:text-sm text-[#59605A]">
              Our U.S.-licensed clinical pharmacy team is available Monday through Friday from 8:00 AM to 8:00 PM EST
              to answer questions about drug interactions, dosage forms, and refill timing.
            </p>
          </div>

          <div className="space-y-2 shrink-0">
            <a
              href="tel:1-800-555-4636"
              className="inline-flex h-12 px-6 rounded-xl bg-[#2F5D3A] text-sm font-semibold text-white hover:bg-[#24482D] transition-colors items-center justify-center shadow-xs"
            >
              Call 1-800-555-INDO
            </a>
            <div className="text-[11px] text-[#848D85] text-center">Toll-free across all 50 U.S. states</div>
          </div>
        </div>
      </Container>
    </div>
  );
}
