import React from 'react';
import { Building2, FileCheck2, MapPin, Award, ShieldAlert } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function TrustQuality() {
  const trustVectors = [
    {
      title: 'Audited Sourcing Facilities',
      icon: Building2,
      description:
        'Medications originate strictly from manufacturing sites registered with the CDSCO and audited by international regulatory bodies.',
      metric: '600+ US-FDA Registered Sites in India',
    },
    {
      title: 'Laboratory Assay Verification',
      icon: FileCheck2,
      description:
        'Every dispatched batch lot is backed by a physical Certificate of Analysis (CoA) demonstrating active chemical assay and purity percentage.',
      metric: 'Batch-Tied QC Verification',
    },
    {
      title: 'Geographic Provenance',
      icon: MapPin,
      description:
        'Exact manufacturing coordinates—such as Halol, Kurkumbh, and Hyderabad—are published openly on product listings and packing slips.',
      metric: '100% Origin Visibility',
    },
    {
      title: 'Licensed Pharmacist Audit',
      icon: Award,
      description:
        'Before order release, a licensed clinical pharmacist verifies the patient prescription, prescriber NPI credentials, and dosage safety.',
      metric: 'Mandatory Clinical Signoff',
    },
  ];

  return (
    <section id="trust" className="py-20 sm:py-32 border-b border-[#E4E7DC] bg-[#FAFAF7]">
      <Container>
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest text-[#596B3A]">
            06 • Clinical Governance & Quality
          </div>
          <h2 className="text-section-title text-[#171914]">
            Know more about what you order.
          </h2>
          <p className="text-editorial-lead text-[#52564C]">
            We do not manufacture trust through clip-art badges or vague marketing promises.
            We provide verifiable documentation, official registration numbers, and rigorous clinical oversight.
          </p>
        </div>

        {/* 4 Trust Vector Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustVectors.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.title}
                className="rounded-2xl border border-[#E4E7DC] bg-white p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF1E6] text-[#596B3A]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#171914]">{v.title}</h3>
                  <p className="text-xs text-[#52564C] leading-relaxed">{v.description}</p>
                </div>
                <div className="pt-4 border-t border-[#E4E7DC] text-xs font-semibold text-[#43522B]">
                  {v.metric}
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Regulatory Disclosure Box */}
        <div className="mt-10 rounded-2xl border border-[#D1D6C5] bg-[#EEF1E6] p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#596B3A] border border-[#D1D6C5]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-2 text-xs text-[#52564C] leading-relaxed">
            <div className="font-bold text-[#171914] text-sm">
              Compliance Standard & Regulatory Disclaimers
            </div>
            <p>
              IndoPharm facilitates the lawful personal importation of non-controlled chronic maintenance medications
              under FDA Personal Importation Policy (CPG Sec. 110.300). IndoPharm does not sell or transfer any DEA
              Schedule II–V controlled substances.
            </p>
            <p className="text-[11px] text-[#8A9081]">
              Information provided for reference. Requirements may vary based on destination and prescriber jurisdiction.
              Additional verification may be required by a licensed pharmacist before order release.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
