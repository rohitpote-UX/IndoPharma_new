import React from 'react';
import { ShieldCheck, Eye, DollarSign, Sparkles, Clock } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-20 sm:py-32 border-b border-[#E4E7DC]">
      <Container>
        {/* Editorial Section Intro */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
            03 • Core Product Principles
          </div>
          <h2 className="text-section-title text-[#171914]">
            Every order should feel understandable.
          </h2>
          <p className="text-editorial-lead text-[#52564C]">
            Healthcare decisions should be founded on calm certainty, not confusing PBM tiers,
            opaque pricing formulas, or surprise pharmacy counter copays.
          </p>
        </div>

        {/* Asymmetric 12-Column Editorial Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Block 1: Large 6-Column Anchor Block (Trust & Provenance) */}
          <div className="md:col-span-6 rounded-2xl border border-[#E4E7DC] bg-white p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-2xs">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF1E6] text-[#596B3A]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">01 • Trust</div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#171914] leading-snug">
                Verified laboratory provenance on every single batch.
              </h3>
              <p className="text-sm text-[#52564C] leading-relaxed">
                We eliminate counterfeit anxiety by sourcing exclusively from WHO-GMP audited
                pharmaceutical manufacturing sites in India. Every shipment is linked to a downloadable
                Certificate of Analysis (CoA) validating chemical identity and assay purity.
              </p>
            </div>

            <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-4 text-xs space-y-1.5">
              <div className="flex justify-between text-[#52564C]">
                <span>Sourcing Standard:</span>
                <span className="font-semibold text-[#171914]">Direct Manufacturer Contract</span>
              </div>
              <div className="flex justify-between text-[#52564C]">
                <span>Clinical Oversight:</span>
                <span className="font-semibold text-[#171914]">Licensed U.S. Pharmacist Review</span>
              </div>
            </div>
          </div>

          {/* Block 2: 3-Column Block (Transparency) */}
          <div className="md:col-span-3 rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF1E6] text-[#596B3A]">
                <Eye className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">02 • Transparency</div>
              <h3 className="text-lg font-bold text-[#171914]">Itemized landed cost.</h3>
              <p className="text-xs text-[#52564C] leading-relaxed">
                No secret PBM rebates or spread markups. We openly publish factory gate cost,
                bonded air freight, customs filing, and our dispensing fee.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-[#43522B] pt-4 border-t border-[#E4E7DC]">
              Zero hidden markups
            </div>
          </div>

          {/* Block 3: 3-Column Block (Value) */}
          <div className="md:col-span-3 rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xs">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF1E6] text-[#596B3A]">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">03 • Value</div>
              <h3 className="text-lg font-bold text-[#171914]">Direct factory economics.</h3>
              <p className="text-xs text-[#52564C] leading-relaxed">
                India produces over 40% of U.S. generic prescriptions. By sourcing directly,
                we deliver 65%–85% patient savings on 90-day maintenance supplies.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-[#3D7038] pt-4 border-t border-[#E4E7DC]">
              65%–85% Typical Savings
            </div>
          </div>

          {/* Block 4: 6-Column Block (Simplicity) */}
          <div className="md:col-span-6 rounded-2xl border border-[#E4E7DC] bg-[#FAFAF7] p-8 sm:p-10 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#596B3A] border border-[#E4E7DC]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">04 • Simplicity</div>
            <h3 className="text-xl font-bold text-[#171914]">
              Every core interaction reachable in 1–2 clicks.
            </h3>
            <p className="text-xs sm:text-sm text-[#52564C] leading-relaxed">
              We eliminate complex medical portals and opaque checkout hurdles. Upload your U.S.
              prescription once, select your 90-day maintenance quantity, and complete checkout
              in under two minutes.
            </p>
          </div>

          {/* Block 5: 6-Column Block (Reliability) */}
          <div className="md:col-span-6 rounded-2xl border border-[#E4E7DC] bg-[#FAFAF7] p-8 sm:p-10 space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#596B3A] border border-[#E4E7DC]">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">05 • Reliability</div>
            <h3 className="text-xl font-bold text-[#171914]">
              8-stage milestone tracking & automated refill cadence.
            </h3>
            <p className="text-xs sm:text-sm text-[#52564C] leading-relaxed">
              Never wonder where your medicine is. From Indian bonded export to U.S. customs entry
              and domestic delivery, receive proactive notifications with an automated 75-day refill
              cadence that guarantees uninterrupted care.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
