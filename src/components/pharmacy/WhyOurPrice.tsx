'use strict';

import React from 'react';
import { Building2, Layers, ShieldCheck, Plane, UserCheck, CheckCircle2 } from 'lucide-react';

export const WhyOurPrice: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Manufacturer Direct',
      desc: 'Sourced from accredited Indian WHO-GMP facilities.',
      icon: <Building2 className="w-5 h-5 text-[#2F5D3A]" />,
    },
    {
      num: '02',
      title: 'Audited Procurement',
      desc: 'Centralized sourcing eliminating multi-tiered wholesalers.',
      icon: <Layers className="w-5 h-5 text-[#2F5D3A]" />,
    },
    {
      num: '03',
      title: 'Independent QA & CoA',
      desc: 'Every batch validated with analytical certificates.',
      icon: <ShieldCheck className="w-5 h-5 text-[#2F5D3A]" />,
    },
    {
      num: '04',
      title: 'Bonded Air Courier',
      desc: 'Direct dispatch with thermal protection and U.S. clearance.',
      icon: <Plane className="w-5 h-5 text-[#2F5D3A]" />,
    },
    {
      num: '05',
      title: 'To Your Doorstep',
      desc: 'Legitimate personal importation under FDA guidelines.',
      icon: <UserCheck className="w-5 h-5 text-[#2F5D3A]" />,
    },
  ];

  return (
    <section id="why-our-price" className="py-20 bg-white border-y border-[#E6ECE7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Headline & Positioning Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono tracking-widest text-[#2F5D3A] uppercase font-semibold">
              VALUE & SOURCING TRANSPARENCY
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight text-[#111411] leading-[1.08]">
              Why can our prices be competitive?
            </h2>
            <div className="space-y-4 text-[#59605A] text-base leading-relaxed">
              <p>
                Our India-based pharmaceutical supply network allows us to operate efficiently and reduce unnecessary supply-chain costs. We aim to pass those efficiencies to customers while maintaining the required quality, regulatory and fulfillment processes.
              </p>
              <p className="text-sm">
                Traditional retail pharmacies rely on layers of pharmacy benefit managers, regional wholesalers, and domestic storage overhead. By consolidating fulfillment from origin to personal importation, we ensure transparent, predictable pricing without compromising quality.
              </p>
            </div>

            {/* Core commitments */}
            <div className="pt-4 border-t border-[#E6ECE7] space-y-2.5 text-xs text-[#111411]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F5D3A]" />
                <span>Competitive pricing through efficient sourcing.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F5D3A]" />
                <span>Transparent supply-chain information on every order.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2F5D3A]" />
                <span>Zero hidden markups: know what you pay before checkout.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Supply Chain Efficiency Visual & Price Formula */}
          <div className="lg:col-span-7 space-y-8">
            {/* Visual Step Timeline */}
            <div className="bg-[#F3F7F3]/60 rounded-2xl p-6 sm:p-8 border border-[#E6ECE7] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg text-[#111411]">
                  Direct Supply Chain Efficiency
                </h3>
                <span className="text-xs font-mono text-[#59605A] uppercase">
                  5-Node Traceability
                </span>
              </div>

              <div className="space-y-4">
                {steps.map((step) => (
                  <div
                    key={step.num}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-[#E6ECE7] shadow-xs"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F3F7F3] flex items-center justify-center shrink-0">
                      {step.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#111411]">
                          {step.title}
                        </span>
                        <span className="text-xs font-mono text-[#2F5D3A] font-bold">
                          {step.num}
                        </span>
                      </div>
                      <p className="text-xs text-[#59605A] mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Landed Price Formula Card */}
            <div className="bg-white border border-[#E6ECE7] rounded-xl p-6 space-y-4 shadow-xs">
              <div className="text-xs font-mono text-[#59605A] uppercase tracking-wider">
                Price Transparency Formula
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-xs text-neutral-400 block">Product Cost</span>
                  <span className="text-sm font-bold text-[#111411] mt-1 block">Authentic API</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-xs text-neutral-400 block">+ Shipping</span>
                  <span className="text-sm font-bold text-[#111411] mt-1 block">Bonded Air</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                  <span className="text-xs text-neutral-400 block">+ Clearance</span>
                  <span className="text-sm font-bold text-[#111411] mt-1 block">FDA CPG 110</span>
                </div>
                <div className="p-3 bg-[#F3F7F3] rounded-lg border border-[#2F5D3A]/20">
                  <span className="text-xs text-[#2F5D3A] block font-medium">= Total</span>
                  <span className="text-sm font-bold text-[#2F5D3A] mt-1 block">Landed Price</span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-400 text-center">
                No hidden pharmacy benefit manager fees or retail distribution markup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
