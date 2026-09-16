import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function TrustStatement() {
  const pillars = [
    {
      icon: FileText,
      title: 'Transparent information',
      description:
        'Complete facility provenance, lot purity assays, and honest landed costs.',
    },
    {
      icon: ShieldCheck,
      title: 'Responsible sourcing',
      description:
        'Audited WHO-GMP plants, serialized batches, and bonded temperature custody.',
    },
    {
      icon: HeartHandshake,
      title: 'Reliable support',
      description:
        'Licensed pharmacist consultations and transparent door-to-door tracking.',
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 lg:py-36 border-b border-[#E6ECE7]">
      <Container>
        <div className="space-y-16 sm:space-y-20">
          {/* Main Powerful Editorial Statement */}
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
              Core Principle
            </span>
            <h2 className="text-[clamp(2.25rem,4.5vw,3.75rem)] font-bold tracking-tight text-[#111411] leading-[1.12]">
              Pharmaceutical commerce should feel clear,
              <br />
              <span className="text-[#2F5D3A]">not complicated.</span>
            </h2>
          </div>

          {/* 3 Minimal Supporting Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 pt-8 border-t border-[#E6ECE7]">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="space-y-3.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F7F3] text-[#2F5D3A] border border-[#E6ECE7]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#111411]">
                    {pillar.title}
                  </h3>
                  <p className="text-sm sm:text-base text-[#59605A] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Direct CTA to /trust */}
          <div className="pt-4">
            <Link
              href="/trust"
              className="group inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#2F5D3A] hover:text-[#24482D] transition-colors"
            >
              <span>Explore our approach</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
