import React from 'react';
import { ArrowDown, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function TransparentPricing() {
  const narrativeSteps = [
    {
      stage: '01',
      title: 'Indian Manufacturing Network',
      description:
        'India produces ~40% of generic prescriptions consumed in the U.S., operating massive chemical synthesis economies of scale at world-class facility standards.',
    },
    {
      stage: '02',
      title: 'Direct Sourcing Efficiency',
      description:
        'By contracting directly with verified manufacturing plants, we eliminate 3 to 4 layers of domestic wholesale brokers and distributors.',
    },
    {
      stage: '03',
      title: 'Responsible Operations',
      description:
        'Temperature-monitored bonded air cargo, automated customs declaration filing, and dedicated clinical pharmacist verification ensure total safety.',
    },
    {
      stage: '04',
      title: 'Competitive Customer Pricing',
      description:
        'Without PBM spread markups or physical retail overhead, patients receive essential maintenance therapies at sustainable, permanent 65%–85% savings.',
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-32 border-b border-[#E4E7DC]">
      <Container>
        {/* Section Intro */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
            07 • The Economic Architecture
          </div>
          <h2 className="text-section-title text-[#171914]">
            Efficient sourcing can create better value.
          </h2>
          <p className="text-editorial-lead text-[#52564C]">
            Low prices do not require compromised manufacturing. By eliminating the multi-layered
            PBM rebate complex and secondary domestic brokers, we deliver authentic generic medications
            at true landed cost.
          </p>
        </div>

        {/* 4-Stage Supply Flow Narrative */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {narrativeSteps.map((step, idx) => (
            <div
              key={step.stage}
              className="relative rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-2xs"
            >
              <div className="space-y-3">
                <span className="font-mono text-xs font-bold text-[#596B3A] bg-[#EEF1E6] px-2.5 py-1 rounded-md">
                  Step {step.stage}
                </span>
                <h3 className="text-base font-bold text-[#171914]">{step.title}</h3>
                <p className="text-xs text-[#52564C] leading-relaxed">{step.description}</p>
              </div>

              {idx < narrativeSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 border border-[#E4E7DC] text-[#596B3A]">
                  <ArrowDown className="h-3 w-3 -rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Real Itemized Landed Cost vs PBM Comparison Table */}
        <div className="mt-12 rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-10 shadow-xs overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E7DC]">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#596B3A]">
                Representative 90-Day Cost Model
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#171914] mt-0.5">
                Atorvastatin 20mg (90 Tablets) • Where Every Dollar Goes
              </h3>
            </div>
            <div className="text-xs font-mono font-bold text-[#3D7038] bg-[#F0F7EE] px-3 py-1.5 rounded-lg border border-[#CBE2C6]">
              $94.50 Patient Savings (76%)
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* IndoPharm Itemized Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="font-bold text-sm text-[#171914] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#596B3A]" />
                <span>IndoPharm Direct Landed Price: $29.50</span>
              </div>

              <div className="space-y-2 border-t border-[#E4E7DC] pt-3 text-[#52564C]">
                <div className="flex justify-between py-1 border-b border-[#E4E7DC]/60">
                  <span>Factory Gate FOB (Indian Manufacturer)</span>
                  <span className="font-mono font-semibold text-[#171914]">$3.50</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E4E7DC]/60">
                  <span>Bonded Air Express Freight (Temperature Controlled)</span>
                  <span className="font-mono font-semibold text-[#171914]">$6.50</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E4E7DC]/60">
                  <span>U.S. Customs Filing & Import Entry Handling</span>
                  <span className="font-mono font-semibold text-[#171914]">$2.50</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E4E7DC]/60">
                  <span>Clinical Pharmacist Verification & Dispensing Fee</span>
                  <span className="font-mono font-semibold text-[#171914]">$4.50</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E4E7DC]/60">
                  <span>Domestic Final-Mile Delivery</span>
                  <span className="font-mono font-semibold text-[#171914]">$4.50</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-sm text-[#43522B]">
                  <span>Total Transparent Patient Price</span>
                  <span className="font-mono font-black">$29.50</span>
                </div>
              </div>
            </div>

            {/* Traditional U.S. Cash Retail Comparison */}
            <div className="rounded-xl bg-[#FAFAF7] border border-[#E4E7DC] p-6 space-y-4 text-xs">
              <div className="font-bold text-sm text-[#171914]">
                Traditional U.S. Cash Retail: $124.00
              </div>
              <p className="text-[#52564C] leading-relaxed">
                Traditional retail pharmacies and pharmacy benefit managers (PBMs) introduce
                compounding spread markups ($75+) and physical store overhead ($29+), inflating
                the out-of-pocket cost for uninsured or high-deductible patients.
              </p>
              <div className="pt-2 border-t border-[#E4E7DC] flex items-center justify-between text-xs font-semibold text-[#3D7038]">
                <span>IndoPharm Patient Advantage:</span>
                <span className="font-mono text-base font-black">76% Lower Out-of-Pocket</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
