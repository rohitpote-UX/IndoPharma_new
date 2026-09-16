'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function HowItWorksPreview() {
  const steps = [
    {
      num: '01',
      title: 'Explore',
      desc: "Find your maintenance medication with transparent landed pricing.",
    },
    {
      num: '02',
      title: 'Order',
      desc: 'Complete payment and upload your valid U.S. physician prescription.',
    },
    {
      num: '03',
      title: 'Track',
      desc: 'Follow your temperature-monitored parcel directly to your door.',
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 lg:py-36 border-b border-[#E6ECE7]">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl space-y-3 pb-12 sm:pb-16 border-b border-[#E6ECE7]">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
            Ordering Flow
          </span>
          <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-[#111411]">
            How it works.
          </h2>
          <p className="text-base sm:text-lg text-[#59605A]">
            A simple 3-step bridge from verified production to your door.
          </p>
        </div>

        {/* 3 Short Steps */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col justify-between rounded-2xl border border-[#E6ECE7] bg-white p-8 sm:p-10 space-y-6"
            >
              <div className="font-mono text-4xl sm:text-5xl font-light text-[#2F5D3A]/40">
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

        {/* Action Link to /how-it-works */}
        <div className="mt-14 pt-8 border-t border-[#E6ECE7]">
          <Link
            href="/how-it-works"
            className="group inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[#2F5D3A] hover:text-[#24482D] transition-colors"
          >
            <span>Learn how it works</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
