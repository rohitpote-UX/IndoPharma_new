'use strict';

import React from 'react';
import { ProductPassportData } from '@/lib/domain/product';
import {
  CheckCircle2,
  Building2,
  Globe2,
  FileCheck2,
  Calendar,
  Layers,
  ShieldAlert,
  Plane,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface PassportTimelineProps {
  passport: ProductPassportData;
}

export const PassportTimeline: React.FC<PassportTimelineProps> = ({ passport }) => {
  const steps = [
    {
      num: '01',
      title: 'PRODUCT IDENTIFIER',
      icon: <Layers className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.product.name,
      sub: `Generic Active: ${passport.product.genericName}`,
      verified: true,
      notes: 'Matched to pharmacopeial monograph reference.',
    },
    {
      num: '02',
      title: 'MANUFACTURING SITE',
      icon: <Building2 className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.manufacturer.name,
      sub: `${passport.manufacturer.facilityCity}, ${passport.manufacturer.facilityState}`,
      verified: Boolean(passport.manufacturer.cdscoLicense),
      badge: passport.manufacturer.whoGmpStatus,
      license: passport.manufacturer.cdscoLicense
        ? `CDSCO Lic: ${passport.manufacturer.cdscoLicense}`
        : 'CDSCO License: Not provided',
    },
    {
      num: '03',
      title: 'ORIGIN & EXPORT CORRIDOR',
      icon: <Globe2 className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.origin.country,
      sub: `Dispatch Hub: ${passport.origin.exportHub}`,
      verified: true,
      notes: 'Origin verified through bonded customs manifest.',
    },
    {
      num: '04',
      title: 'FINISHED SPECIFICATION',
      icon: <FileCheck2 className="w-4 h-4 text-[#2F5D3A]" />,
      main: `${passport.specification.strength} • ${passport.specification.dosageForm}`,
      sub: `Pack Context: ${passport.specification.packageSize} Units | Std: ${passport.specification.pharmacopeiaStandard}`,
      verified: true,
      ndc: passport.specification.ndcEquivalent
        ? `U.S. NDC Reference: ${passport.specification.ndcEquivalent}`
        : 'U.S. NDC Reference: Not applicable',
    },
    {
      num: '05',
      title: 'BATCH SERIALIZATION',
      icon: <Layers className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.batch.lotNumber ? `Lot ${passport.batch.lotNumber}` : 'Batch not assigned',
      sub: passport.batch.manufactureDate
        ? `Manufacture Date: ${passport.batch.manufactureDate}`
        : 'Manufacture Date: Not provided',
      verified: Boolean(passport.batch.lotNumber),
      badge: passport.batch.status ? `Status: ${passport.batch.status}` : undefined,
    },
    {
      num: '06',
      title: 'STABILITY & EXPIRY',
      icon: <Calendar className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.expiry.expirationDate
        ? `Valid Through: ${passport.expiry.expirationDate}`
        : 'Expiry: Not provided',
      sub: passport.expiry.shelfLifeVerified
        ? 'Accelerated & long-term stability testing verified per ICH Q1A guidelines.'
        : 'Stability testing verification pending.',
      verified: Boolean(passport.expiry.expirationDate),
    },
    {
      num: '07',
      title: 'QUALITY & LAB ASSAY',
      icon: <FileText className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.quality.hplcAssayPurity
        ? `HPLC Assay Purity: ${passport.quality.hplcAssayPurity}%`
        : 'Purity Assay: Document pending',
      sub: passport.quality.qcOfficer
        ? `Authorized Release QA Officer: ${passport.quality.qcOfficer}`
        : 'QA Officer: On file with manufacturer',
      verified: Boolean(passport.quality.hplcAssayPurity),
      docsCount: passport.quality.documentsAvailable.length,
    },
    {
      num: '08',
      title: 'STATUTORY REGULATION',
      icon: <ShieldAlert className="w-4 h-4 text-[#2F5D3A]" />,
      main: passport.regulatory.status,
      sub: `Citation: ${passport.regulatory.reference}`,
      verified: true,
      rx: passport.regulatory.requiresPrescription
        ? 'Mandatory licensed physician prescription required prior to export'
        : 'Non-prescription product',
    },
    {
      num: '09',
      title: 'SHIPPING & JURISDICTION',
      icon: <Plane className="w-4 h-4 text-[#2F5D3A]" />,
      main: `Destination: ${passport.shipping.destination} — ${passport.shipping.status}`,
      sub: passport.shipping.transitMethod,
      verified: passport.shipping.status === 'AVAILABLE',
      notes: passport.shipping.personalImportationPolicy,
    },
  ];

  return (
    <div className="relative border-l-2 border-[#E6ECE7] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8 my-6">
      {steps.map((step) => {
        return (
          <div key={step.num} className="relative group">
            {/* Step Number Dot / Icon */}
            <div className="absolute -left-[35px] sm:-left-[43px] top-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border-2 border-[#2F5D3A] flex items-center justify-center text-[11px] font-mono font-bold text-[#2F5D3A] shadow-xs">
              {step.num}
            </div>

            {/* Step Content Card */}
            <div className="bg-white border border-[#E6ECE7] rounded-xl p-5 hover:border-[#2F5D3A]/40 transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono tracking-wider text-[#59605A] uppercase flex items-center gap-1.5">
                  {step.icon}
                  {step.title}
                </span>

                {step.verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2F5D3A] bg-[#F3F7F3] px-2 py-0.5 rounded border border-[#2F5D3A]/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Data
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3" />
                    Not Provided
                  </span>
                )}
              </div>

              {/* Main Headline */}
              <div className="text-base font-semibold text-[#111411]">
                {step.main}
              </div>

              {/* Subtext */}
              <div className="text-xs text-[#59605A] leading-relaxed">
                {step.sub}
              </div>

              {/* Extra details if available */}
              {(step.badge || step.license || step.ndc || step.rx || step.notes) && (
                <div className="pt-2 mt-2 border-t border-neutral-100 text-[11px] text-[#59605A] space-y-1">
                  {step.badge && (
                    <span className="inline-block bg-[#F3F7F3] text-[#2F5D3A] px-2 py-0.5 rounded mr-2">
                      {step.badge}
                    </span>
                  )}
                  {step.license && <div>{step.license}</div>}
                  {step.ndc && <div>{step.ndc}</div>}
                  {step.rx && <div className="text-amber-800 font-medium">{step.rx}</div>}
                  {step.notes && <div className="text-neutral-500 italic">{step.notes}</div>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
