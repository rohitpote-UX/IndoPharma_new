'use client';

import React, { useEffect, useRef } from 'react';
import { Container } from '@/components/ui/Container';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.how-step-card', {
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 0.7,
        ease: 'power2.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Explore',
      desc: "Find the product you're looking for with transparent pricing and verified batch records.",
    },
    {
      num: '02',
      title: 'Order',
      desc: 'Complete the necessary steps securely and upload your valid U.S. physician prescription.',
    },
    {
      num: '03',
      title: 'Track',
      desc: 'Follow your order from temperature-controlled dispatch to verified delivery at your door.',
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="bg-white py-20 sm:py-28 lg:py-36 border-b border-[#E6ECE7]"
    >
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Process
          </span>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-[#111411]">
            How it works.
          </h2>
          <p className="text-base sm:text-lg text-[#59605A]">
            A simple, transparent 3-step ordering process.
          </p>
        </div>

        {/* 3 Steps with Giant Numbers */}
        <div ref={stepsRef} className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.num}
              className="how-step-card flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-8 sm:p-10 space-y-8"
            >
              {/* Giant Editorial Number */}
              <div className="font-mono text-5xl sm:text-6xl font-light text-[#2F5D3A]/30">
                {step.num}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight text-[#111411]">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-[#59605A] leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="h-1 w-8 bg-[#2F5D3A]/20 rounded-full" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
