'use client';

import React, { useEffect, useRef } from 'react';
import { Container } from '@/components/ui/Container';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function SupplyTransparency() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.supply-stage-node', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 24,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stages = [
    {
      code: '01',
      title: 'India',
      label: 'Origin Node',
      desc: 'WHO-GMP certified manufacturing facilities in Gujarat and Maharashtra.',
    },
    {
      code: '02',
      title: 'Source',
      label: 'Batch Purity',
      desc: 'Finished formulation serialized with HPLC purity certificate of analysis.',
    },
    {
      code: '03',
      title: 'Export',
      label: 'Transit',
      desc: 'Temperature-monitored bonded international air cargo with CDSCO clearance.',
    },
    {
      code: '04',
      title: 'U.S.',
      label: 'Port Entry',
      desc: 'Customs review under FDA Personal Importation Policy (CPG 110.300).',
    },
    {
      code: '05',
      title: 'Customer',
      label: 'Delivery',
      desc: 'Tamper-evident, sealed parcel delivered directly to your doorstep.',
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-[#F3F7F3] py-20 sm:py-28 lg:py-36 border-b border-[#E6ECE7]"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Custody Story
          </span>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-[#111411]">
            Where does your medication come from?
          </h2>
          <p className="text-base sm:text-lg text-[#59605A]">
            A transparent chain of custody from origin to delivery.
          </p>
        </div>

        {/* Minimal Horizontal Story on Desktop / Vertical Sequence on Mobile */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-6 relative">
          {stages.map((stage, idx) => (
            <div
              key={stage.code}
              className="supply-stage-node relative flex flex-col justify-between space-y-6"
            >
              {/* Top Code & Thin Connector Line */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#2F5D3A]">
                  {stage.code}
                </span>
                <div className="h-px flex-1 bg-[#E6ECE7]" />
              </div>

              {/* Large Editorial Stage Title */}
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[#848D85] block">
                  {stage.label}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111411]">
                  {stage.title}
                </h3>
              </div>

              {/* Short Descriptive Sentence */}
              <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
                {stage.desc}
              </p>

              {idx < stages.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1 text-[#848D85] text-xs font-mono">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
