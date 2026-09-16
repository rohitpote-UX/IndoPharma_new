'use client';

import React, { useState } from 'react';
import { Search, FileText, CheckCircle, PackageCheck, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Explore',
      subtitle: 'Identify your maintenance therapy',
      description:
        'Search by generic active ingredient or U.S. brand reference. Browse verified 90-day maintenance supplies with transparent landed cost breakdowns.',
      icon: Search,
      badge: 'Step 1 • Discovery',
    },
    {
      number: '02',
      title: 'Understand',
      subtitle: 'Review batch provenance & pricing',
      description:
        'Inspect the exact manufacturing plant location in India, CDSCO registration, and laboratory Certificate of Analysis (CoA) assay purity for the active batch.',
      icon: FileText,
      badge: 'Step 2 • Transparency',
    },
    {
      number: '03',
      title: 'Order',
      subtitle: 'Upload prescription & authorize hold',
      description:
        'Upload your valid, unexpired U.S. physician prescription. Payment is authorized on hold and only captured after clinical pharmacist approval.',
      icon: CheckCircle,
      badge: 'Step 3 • Clinical Review',
    },
    {
      number: '04',
      title: 'Track',
      subtitle: '8-stage international bonded transit',
      description:
        'Follow your order across 8 transparent milestones from Indian bonded export to U.S. customs entry and priority domestic delivery to your front door.',
      icon: PackageCheck,
      badge: 'Step 4 • Fulfillment',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-32 border-b border-[#E4E7DC]">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
            05 • The Customer Journey
          </div>
          <h2 className="text-section-title text-[#171914]">
            How IndoPharm Works
          </h2>
          <p className="text-editorial-lead text-[#52564C]">
            A seamless four-step bridge connecting verified pharmaceutical production with your daily health routine.
          </p>
        </div>

        {/* 4-Step Interactive Layout */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Step Selector (Desktop / Tablet) */}
          <div className="md:col-span-5 space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isActive
                      ? 'bg-white border-[#596B3A] shadow-xs'
                      : 'bg-[#FAFAF7] border-[#E4E7DC] hover:border-[#D1D6C5]'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold transition-colors ${
                      isActive ? 'bg-[#596B3A] text-white' : 'bg-white text-[#52564C] border border-[#E4E7DC]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-bold text-[#171914]">
                        {step.title}
                      </span>
                      {isActive && <ArrowRight className="h-4 w-4 text-[#596B3A]" />}
                    </div>
                    <p className="text-xs text-[#52564C] mt-0.5">{step.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Stage Showcase Box */}
          <div className="md:col-span-7">
            <div className="rounded-2xl border border-[#E4E7DC] bg-white p-8 sm:p-12 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF1E6] px-3.5 py-1 text-xs font-semibold text-[#43522B] border border-[#D1D6C5]">
                <span>{steps[activeStep]?.badge}</span>
              </div>

              <div className="text-display font-mono text-[#596B3A]/20 select-none">
                {steps[activeStep]?.number}
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#171914] -mt-6">
                {steps[activeStep]?.title}: {steps[activeStep]?.subtitle}
              </h3>

              <p className="text-sm sm:text-base text-[#52564C] leading-relaxed">
                {steps[activeStep]?.description}
              </p>

              <div className="pt-6 border-t border-[#E4E7DC] grid grid-cols-2 gap-4 text-xs text-[#52564C]">
                <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-4">
                  <div className="font-bold text-[#171914]">Personal Importation Cap</div>
                  <div className="text-[#8A9081] mt-0.5">Maximum 90-day maintenance supply</div>
                </div>
                <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-4">
                  <div className="font-bold text-[#171914]">Clinical Pharmacist Review</div>
                  <div className="text-[#8A9081] mt-0.5">SLA under 4 business hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
