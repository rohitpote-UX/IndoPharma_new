'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Building2, Globe2, Layers, CheckCircle2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import gsap from 'gsap';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.7 } });

      tl.from('.hero-anim-eyebrow', { opacity: 0, y: 12, delay: 0.1 })
        .from('.hero-anim-h1-line1', { opacity: 0, y: 20 }, '-=0.5')
        .from('.hero-anim-h1-line2', { opacity: 0, y: 20 }, '-=0.5')
        .from('.hero-anim-desc', { opacity: 0, y: 14 }, '-=0.5')
        .from('.hero-anim-cta', { opacity: 0, y: 14 }, '-=0.4')
        .from(visualRef.current, { opacity: 0, y: 24, scale: 0.98 }, '-=0.5');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[82vh] lg:min-h-[88vh] flex items-center bg-white border-b border-[#E6ECE7] overflow-hidden pt-10 pb-16 lg:py-0"
    >
      <Container className="w-full">
        {/* 12-Column Grid: Left 7 Columns / Right 5 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* LEFT: 7 Columns (Editorial Typography & Primary Action) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 max-w-[780px]">
            {/* Eyebrow */}
            <div className="hero-anim-eyebrow inline-flex items-center gap-2 rounded-full border border-[#E6ECE7] bg-[#F3F7F3] px-3.5 py-1.5 text-xs font-semibold text-[#2F5D3A]">
              <span className="w-2 h-2 rounded-full bg-[#2F5D3A] animate-pulse" />
              <span className="tracking-wide">TRANSPARENT PHARMACEUTICAL SUPPLY CHAIN</span>
            </div>

            {/* Editorial Headline with clamp sizing */}
            <h1
              className="text-[#111411] font-serif font-medium tracking-tight leading-[1.02]"
              style={{ fontSize: 'clamp(42px, 5.2vw, 72px)' }}
            >
              <span className="hero-anim-h1-line1 block">Better value in medicines.</span>
              <span className="hero-anim-h1-line2 block text-[#2F5D3A]">
                Greater clarity in every order.
              </span>
            </h1>

            {/* Subtext */}
            <p className="hero-anim-desc text-base sm:text-lg lg:text-[19px] text-[#59605A] max-w-[640px] font-normal leading-relaxed">
              Discover pharmaceutical products through a transparent supply chain with clear information, secure ordering and reliable delivery.
            </p>

            {/* Primary Action Area */}
            <div className="hero-anim-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/medicines"
                className="group inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-[#2F5D3A] px-8 text-base font-semibold text-white transition-all duration-200 hover:bg-[#3F704A] hover:shadow-md cursor-pointer active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-[#2F5D3A]"
              >
                <span>Explore Medicines</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/#search-section"
                className="inline-flex h-14 items-center justify-center rounded-xl border border-[#E6ECE7] bg-white px-6 text-sm sm:text-base font-medium text-[#111411] hover:border-[#D3DDD5] hover:bg-[#F3F7F3] transition-colors"
              >
                <span>Search Catalogue</span>
              </Link>
            </div>

            {/* Reassurance Micro-Points */}
            <div className="pt-4 border-t border-[#E6ECE7] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#59605A]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2F5D3A]" />
                <span>CDSCO Audited Facilities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2F5D3A]" />
                <span>Product Passport™ Serialization</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2F5D3A]" />
                <span>Prescription Verification Protected</span>
              </div>
            </div>
          </div>

          {/* RIGHT: 5 Columns (Precision Data/Product Composition) */}
          <div ref={visualRef} className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl border border-[#E6ECE7] bg-[#F3F7F3]/70 p-6 sm:p-8 overflow-hidden shadow-xs">
              {/* Architectural Dot Grid */}
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#2F5D3A 0.75px, transparent 0.75px)`,
                  backgroundSize: '20px 20px',
                }}
              />

              <div className="relative space-y-5">
                {/* Header Specimen Tag */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#E6ECE7] px-2.5 py-1 text-[11px] font-semibold text-[#2F5D3A]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#2F5D3A]" />
                    <span>AUTHENTIC SPECIMEN</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#59605A]">
                    SERIALIZED BATCH
                  </span>
                </div>

                {/* Floating Architectural Card */}
                <div className="relative rounded-2xl bg-white border border-[#E6ECE7] p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E6ECE7] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#2F5D3A]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#2F5D3A]">
                        SPECIFICATION RECORD
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#59605A]">USP Grade</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-mono text-[#59605A]">
                      Oral Solid Dosage
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif text-[#111411] mt-0.5">
                      Atorvastatin Calcium
                    </h2>
                    <p className="text-xs font-mono text-[#59605A] mt-0.5">
                      20 mg • Film-Coated Maintenance Tablets
                    </p>
                  </div>

                  {/* 4 Clean Visual Data Lines: Manufacturer, Origin, Quality, Availability */}
                  <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-[#59605A]">
                    <div className="flex items-center justify-between py-1 border-b border-neutral-50">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Building2 className="w-3.5 h-3.5 text-[#2F5D3A]" />
                        Manufacturer:
                      </span>
                      <span className="font-medium text-[#111411]">Sun Pharma Ltd</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-neutral-50">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Globe2 className="w-3.5 h-3.5 text-[#2F5D3A]" />
                        Origin:
                      </span>
                      <span className="font-medium text-[#111411]">Halol, Gujarat, India</span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-neutral-50">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <Layers className="w-3.5 h-3.5 text-[#2F5D3A]" />
                        Quality Assay:
                      </span>
                      <span className="font-medium text-[#2F5D3A] font-mono">99.85% HPLC Purity</span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F5D3A]" />
                        Availability:
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F7F3] text-[#2F5D3A]">
                        Verified for U.S. Dispatch
                      </span>
                    </div>
                  </div>

                  {/* Landed Price Context */}
                  <div className="rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F5D3A] block">
                        Transparent Landed Price
                      </span>
                      <div className="text-xl font-bold font-mono text-[#111411] mt-0.5">
                        $29.50
                        <span className="text-xs font-normal text-[#59605A] ml-1">/ 90 tabs</span>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-neutral-400 block line-through">U.S. Cash: $124.00</span>
                      <span className="text-[11px] font-medium text-[#2F5D3A]">Direct Sourcing</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#59605A] px-1">
                  <span>Audited supply chain node</span>
                  <Link href="/trust" className="font-medium text-[#2F5D3A] hover:underline">
                    Explore Traceability →
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
