'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Building2, FileCheck, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import gsap from 'gsap';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });

      tl.from(eyebrowRef.current, { opacity: 0, y: 16, delay: 0.1 })
        .from(headlineRef.current, { opacity: 0, y: 24 }, '-=0.6')
        .from(leadRef.current, { opacity: 0, y: 20 }, '-=0.6')
        .from(ctaRef.current, { opacity: 0, y: 16 }, '-=0.5')
        .from(cardRef.current, { opacity: 0, y: 30, scale: 0.98 }, '-=0.6');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[75vh] lg:min-h-[85vh] flex items-center pt-8 pb-16 sm:pb-24 border-b border-[#E4E7DC] overflow-hidden"
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: 7 Columns Editorial Story */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Eyebrow */}
            <div ref={eyebrowRef} className="inline-flex items-center gap-2 rounded-full border border-[#D1D6C5] bg-[#EEF1E6] px-3.5 py-1.5 text-xs font-semibold text-[#43522B]">
              <Sparkles className="h-3.5 w-3.5 text-[#596B3A]" />
              <span>Direct India → USA Pharmaceutical Commerce</span>
            </div>

            {/* Main Headline */}
            <h1
              ref={headlineRef}
              className="text-hero-headline text-[#171914] tracking-tight"
            >
              Better pharmaceutical value.{' '}
              <span className="text-[#596B3A] block sm:inline">Clearer at every step.</span>
            </h1>

            {/* Supporting Copy */}
            <p
              ref={leadRef}
              className="text-editorial-lead max-w-2xl text-base sm:text-lg text-[#52564C] leading-relaxed"
            >
              Discover products through a transparent supply chain, with clear information,
              secure ordering and reliable delivery. Sourced directly from audited WHO-GMP
              manufacturing facilities for chronic maintenance therapy.
            </p>

            {/* CTA Group */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="#catalog" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  <span>Explore Medicines</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <span>How It Works</span>
                </Button>
              </Link>
            </div>

            {/* Stat Line */}
            <div className="pt-6 border-t border-[#E4E7DC] grid grid-cols-3 gap-6 text-xs text-[#52564C]">
              <div>
                <div className="font-bold text-base sm:text-xl text-[#171914]">65–85%</div>
                <div className="text-[#8A9081] mt-0.5">Average Savings</div>
              </div>
              <div>
                <div className="font-bold text-base sm:text-xl text-[#171914]">10–14 d</div>
                <div className="text-[#8A9081] mt-0.5">Bonded Air Transit</div>
              </div>
              <div>
                <div className="font-bold text-base sm:text-xl text-[#171914]">100%</div>
                <div className="text-[#8A9081] mt-0.5">Batch Traceability</div>
              </div>
            </div>
          </div>

          {/* RIGHT: 5 Columns Premium Supply-Chain Composition */}
          <div ref={cardRef} className="lg:col-span-5">
            <div className="relative rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-8 shadow-sm space-y-6">
              {/* Badge & Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EEF1E6] px-2.5 py-1 text-xs font-semibold text-[#43522B] border border-[#D1D6C5]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#596B3A]" />
                    <span>Verified Sourcing Node</span>
                  </span>
                  <h2 className="text-base font-bold text-[#171914] mt-2">
                    Halol Manufacturing Facility
                  </h2>
                  <p className="text-xs text-[#52564C]">Sun Pharma Industries Ltd • Gujarat, India</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] text-[#596B3A]">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>

              {/* Physical Batch Certificate Data Card */}
              <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E7DC]">
                  <span className="text-[#52564C]">Active Generic Formulation</span>
                  <span className="font-bold text-[#171914]">Atorvastatin Calcium 20mg</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-[#8A9081] block">Batch Lot Serial</span>
                    <span className="font-mono font-bold text-[#171914]">LOT-2026-AT20-941</span>
                  </div>
                  <div>
                    <span className="text-[#8A9081] block">HPLC Assay Purity</span>
                    <span className="font-bold text-[#3D7038]">99.85% Purity</span>
                  </div>
                  <div>
                    <span className="text-[#8A9081] block">CDSCO Export License</span>
                    <span className="font-mono text-[#52564C]">CDSCO-MH-2018</span>
                  </div>
                  <div>
                    <span className="text-[#8A9081] block">Standard Packaging</span>
                    <span className="font-semibold text-[#171914]">90 Tablets (3 Months)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E7DC] flex items-center justify-between text-[11px] text-[#52564C]">
                  <span className="flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-[#596B3A]" />
                    <span>Lab Certificate on File</span>
                  </span>
                  <span className="font-medium text-[#596B3A]">Verified Lot</span>
                </div>
              </div>

              {/* Price Transparency Highlight */}
              <div className="rounded-xl bg-[#EEF1E6] border border-[#D1D6C5] p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[#43522B]">
                    Transparent Landed Cost
                  </div>
                  <div className="text-2xl font-black font-mono text-[#171914] mt-0.5">
                    $29.50 <span className="text-xs font-normal text-[#52564C]">/ 90 tabs</span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-[#8A9081] line-through">U.S. Cash: $124.00</div>
                  <div className="font-bold text-[#3D7038] mt-0.5">Save 76% ($94.50)</div>
                </div>
              </div>

              {/* Statutory Note */}
              <div className="flex items-center gap-2 text-[11px] text-[#8A9081]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#596B3A] shrink-0" />
                <span>Information provided for reference. Valid U.S. prescription strictly required.</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
