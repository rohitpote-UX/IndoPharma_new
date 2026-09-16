import React from 'react';
import { Building, TestTubes, Plane, ShieldCheck, Truck, Home } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function SupplyStory() {
  const supplyNodes = [
    {
      step: '01',
      title: 'India Manufacturing',
      icon: Building,
      detail: 'WHO-GMP & US-FDA audited facility synthesis and lot packaging.',
      location: 'Origin Hub (India)',
    },
    {
      step: '02',
      title: 'Quality Verification',
      icon: TestTubes,
      detail: 'Assay purity testing and Certificate of Analysis (CoA) release.',
      location: 'QC Laboratory',
    },
    {
      step: '03',
      title: 'Bonded Air Export',
      icon: Plane,
      detail: 'Temperature-monitored international air freight to U.S. Port of Entry.',
      location: 'Express Air Transit',
    },
    {
      step: '04',
      title: 'U.S. Import Clearance',
      icon: ShieldCheck,
      detail: 'CBP & FDA Personal Importation inspection filing (CPG 110.300).',
      location: 'Port of Entry (JFK/ORD)',
    },
    {
      step: '05',
      title: 'Clinical Audit & Dispensing',
      icon: Truck,
      detail: 'Licensed U.S. clinical pharmacist prescription validation and packing.',
      location: 'Dispensing Partner',
    },
    {
      step: '06',
      title: 'Patient Delivery',
      icon: Home,
      detail: 'Priority domestic carrier handoff to patient doorstep with tracking.',
      location: 'Patient Home (USA)',
    },
  ];

  return (
    <section id="supply-story" className="py-20 sm:py-32 border-b border-[#E4E7DC] bg-[#FAFAF7]">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
            08 • Chain of Custody
          </div>
          <h2 className="text-section-title text-[#171914]">
            From manufacturing plant to your front door.
          </h2>
          <p className="text-editorial-lead text-[#52564C]">
            Every tablet follows an unbroken, verified chain of custody. We provide complete
            visibility into the international logistics corridor that brings life-saving maintenance
            medications to American families.
          </p>
        </div>

        {/* Horizontal Desktop Timeline / Vertical Mobile Timeline */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {supplyNodes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.step}
                className="relative rounded-2xl border border-[#E4E7DC] bg-white p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#D1D6C5] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#596B3A] bg-[#EEF1E6] px-2 py-0.5 rounded">
                      {node.step}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAFAF7] border border-[#E4E7DC] text-[#596B3A]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-[#171914]">{node.title}</h3>
                  <p className="text-[11px] text-[#52564C] leading-relaxed">{node.detail}</p>
                </div>

                <div className="pt-3 border-t border-[#E4E7DC] text-[10px] font-semibold text-[#8A9081] uppercase tracking-wider">
                  {node.location}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl bg-white border border-[#E4E7DC] p-4 text-xs text-[#52564C] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#596B3A]" />
            <span>Average cross-border transit time: <strong>10 to 14 business days</strong></span>
          </div>
          <span className="text-[11px] text-[#8A9081]">
            Subject to U.S. Customs & Border Protection inspection and carrier processing.
          </span>
        </div>
      </Container>
    </section>
  );
}
