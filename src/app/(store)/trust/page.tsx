import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Building2,
  FileCheck2,
  ThermometerSnowflake,
  Scale,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Trust & Transparency | IndoPharm',
  description:
    'Explore our verifiable pharmaceutical standards: audited WHO-GMP manufacturing facilities, batch lot HPLC purity assays, and FDA Personal Importation compliance.',
};

export default function TrustPage() {
  const qualityPillars = [
    {
      icon: Building2,
      title: 'Audited WHO-GMP Facilities',
      subtitle: 'Facility Accreditation',
      description:
        'Every product is manufactured in state-of-the-art facilities located in Gujarat and Maharashtra, India. Facilities hold active CDSCO manufacturing licenses, participate in international regulatory audits, and adhere to current Good Manufacturing Practices (cGMP).',
    },
    {
      icon: FileCheck2,
      title: 'Batch Lot Purity Assays',
      subtitle: 'Analytical Verification',
      description:
        'We do not rely on generalized manufacturer claims. Every production lot is assayed via High-Performance Liquid Chromatography (HPLC) for active ingredient purity (standard: 99.5%+). Each lot includes a downloadable Certificate of Analysis (CoA) signed by a certified QC director.',
    },
    {
      icon: ThermometerSnowflake,
      title: 'Monitored Chain of Custody',
      subtitle: 'Thermal Telemetry',
      description:
        'Pharmaceutical compounds require controlled environments. Our shipments utilize temperature-logged packaging and bonded international air cargo to prevent heat and moisture degradation between origin export and U.S. doorstep delivery.',
    },
    {
      icon: Scale,
      title: 'Regulatory Compliance Framework',
      subtitle: 'Legal Governance',
      description:
        'Our operations strictly align with FDA Personal Importation Policy (CPG 110.300). Orders are restricted to unexpired U.S. physician prescriptions for 90-day maintenance supplies. Controlled substances, narcotics, and biologics requiring continuous cold-chain are strictly excluded.',
    },
  ];

  return (
    <div className="bg-white min-h-screen py-12 sm:py-16 lg:py-20">
      <Container>
        {/* Header */}
        <div className="max-w-3xl space-y-4 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Quality & Transparency
          </span>
          <h1 className="text-[clamp(2.5rem,4.5vw,4rem)] font-bold tracking-tight text-[#111411] leading-tight">
            Trust built on verification, not slogans.
          </h1>
          <p className="text-base sm:text-lg text-[#59605A] leading-relaxed">
            We believe pharmaceutical commerce should be completely transparent. That means publishing
            manufacturer facility names, CDSCO licenses, batch serial lots, and true landed economics.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {qualityPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl border border-[#E6ECE7] bg-white p-8 sm:p-10 space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F7F3] text-[#2F5D3A] border border-[#E6ECE7]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#2F5D3A] font-semibold">
                    {pillar.subtitle}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-[#111411]">
                    {pillar.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Pricing Economics Section */}
        <div className="mt-16 rounded-3xl border border-[#E6ECE7] bg-[#F3F7F3] p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
              Economic Model
            </span>
            <h3 className="text-2xl font-bold text-[#111411]">
              How we provide 60–80% lower prescription costs.
            </h3>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              In traditional U.S. distribution, a generic pill passes through Pharmacy Benefit Managers (PBMs),
              wholesalers, rebate brokers, and retail margins. By bridging verified Indian manufacturers directly
              with individual U.S. patients under FDA Personal Importation, we eliminate unnecessary middlemen markups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#E6ECE7] text-xs sm:text-sm">
            <div>
              <strong className="text-[#111411] block mb-1">Direct Factory Pricing</strong>
              Sourced at factory cost directly from accredited generic manufacturers.
            </div>
            <div>
              <strong className="text-[#111411] block mb-1">Transparent Landed Markup</strong>
              Clear handling, clinical review, and bonded air transit costs with no hidden fees.
            </div>
            <div>
              <strong className="text-[#111411] block mb-1">Zero PBM Spread Pricing</strong>
              No rebate clawbacks, no tier formulary manipulation, and no surprise copays.
            </div>
          </div>
        </div>

        {/* Clinical Disclaimer & Consultation Hotline */}
        <div className="mt-16 pt-10 border-t border-[#E6ECE7] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-[#111411] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#2F5D3A]" />
              <span>Questions about your medication?</span>
            </h4>
            <p className="text-xs text-[#59605A]">
              Speak directly with our licensed clinical pharmacist team at <strong className="text-[#111411]">1-800-555-INDO</strong> (Mon–Fri 8am–8pm EST).
            </p>
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
