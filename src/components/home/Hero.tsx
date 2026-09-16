'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import gsap from 'gsap';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.8 } });

      tl.from('.hero-anim-eyebrow', { opacity: 0, y: 14, delay: 0.1 })
        .from('.hero-anim-h1', { opacity: 0, y: 22 }, '-=0.6')
        .from('.hero-anim-desc', { opacity: 0, y: 16 }, '-=0.6')
        .from('.hero-anim-cta', { opacity: 0, y: 16 }, '-=0.5')
        .from(visualRef.current, { opacity: 0, y: 28, scale: 0.98 }, '-=0.6');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[80vh] lg:min-h-[88vh] flex items-center bg-white border-b border-[#E6ECE7] overflow-hidden pt-8 pb-16 lg:py-0"
    >
      <Container className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: 6 Columns (Editorial Typography & Action) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            {/* Small Eyebrow */}
            <div className="hero-anim-eyebrow inline-flex items-center gap-2 rounded-full border border-[#E6ECE7] bg-[#F3F7F3] px-3.5 py-1.5 text-xs font-semibold text-[#2F5D3A]">
              <Sparkles className="h-3.5 w-3.5 text-[#2F5D3A]" />
              <span>PHARMACEUTICAL COMMERCE, MADE CLEAR.</span>
            </div>

            {/* H1 Display Headline */}
            <h1 className="hero-anim-h1 text-[clamp(2.75rem,5.5vw,5.5rem)] font-bold tracking-tight text-[#111411] leading-[1.06]">
              Better value.
              <br />
              <span className="text-[#2F5D3A]">Clearer at every step.</span>
            </h1>

            {/* Short Supporting Statement */}
            <p className="hero-anim-desc text-base sm:text-lg lg:text-xl text-[#59605A] max-w-xl font-normal leading-relaxed">
              Explore pharmaceutical products with transparent information,
              competitive value and a simpler ordering experience.
            </p>

            {/* Primary & Secondary Action */}
            <div className="hero-anim-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              {/* Dominant Primary CTA */}
              <Link
                href="/medicines"
                className="group inline-flex h-[52px] sm:h-[54px] items-center justify-center gap-2.5 rounded-xl bg-[#2F5D3A] px-7 sm:px-8 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-[#24482D] hover:shadow-md cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#2F5D3A]"
              >
                <span>Explore Medicines</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/how-it-works"
                className="inline-flex h-[52px] sm:h-[54px] items-center justify-center rounded-xl border border-[#E6ECE7] bg-white px-6 text-sm sm:text-base font-medium text-[#111411] hover:border-[#D3DDD5] hover:bg-[#F3F7F3] transition-colors"
              >
                <span>How It Works</span>
              </Link>
            </div>

            {/* Minimal Reassurance Micro-Points */}
            <div className="pt-4 border-t border-[#E6ECE7] flex flex-wrap items-center gap-6 text-xs text-[#59605A]">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#2F5D3A]" />
                <span>Audited WHO-GMP Facilities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#2F5D3A]" />
                <span>Serialized Batch Testing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-[#2F5D3A]" />
                <span>Valid U.S. Prescription Required</span>
              </div>
            </div>
          </div>

          {/* RIGHT: 6 Columns (Architectural Visual Composition) */}
          <div ref={visualRef} className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-xl lg:max-w-none rounded-3xl border border-[#E6ECE7] bg-[#F3F7F3] p-6 sm:p-10 lg:p-12 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              {/* Subtle Architectural Lattice Pattern */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#2F5D3A 0.75px, transparent 0.75px)`,
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative space-y-6">
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#E6ECE7] px-2.5 py-1 text-[11px] font-semibold text-[#2F5D3A]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#2F5D3A]" />
                    <span>VERIFIED PHARMACEUTICAL BATCH</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#848D85]">LOT-2026-AT20-941</span>
                </div>

                {/* Architectural Product Package Card */}
                <div className="relative rounded-2xl bg-white border border-[#E6ECE7] p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#2F5D3A]" />
                      <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A]">
                        IndoPharm Specimen
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-[#59605A]">USP Grade</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#848D85]">
                      Active Generic Formulation
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111411] mt-0.5">
                      Atorvastatin Calcium
                    </h2>
                    <p className="text-sm font-medium text-[#59605A] mt-1">
                      20 mg • Film-Coated Maintenance Tablets
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-[#E6ECE7] text-xs">
                    <div>
                      <span className="text-[11px] text-[#848D85] block">HPLC Purity</span>
                      <span className="font-bold text-[#2F5D3A]">99.85% Assay</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#848D85] block">Facility Origin</span>
                      <span className="font-medium text-[#111411]">Halol, Gujarat</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#848D85] block">Standard Supply</span>
                      <span className="font-medium text-[#111411]">90 Tabs (90 Days)</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block">
                        Direct Landed Price
                      </span>
                      <div className="text-2xl font-bold font-mono text-[#111411] mt-0.5">
                        $29.50
                        <span className="text-xs font-normal text-[#59605A] ml-1">/ 90 tabs</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#848D85] line-through block">U.S. Cash: $124.00</span>
                      <span className="text-xs font-bold text-[#2F5D3A]">Save $94.50 (76%)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#59605A] px-1">
                  <span>Audited WHO-GMP facility export</span>
                  <Link href="/trust" className="font-medium text-[#2F5D3A] hover:underline">
                    View Trust & Quality →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
