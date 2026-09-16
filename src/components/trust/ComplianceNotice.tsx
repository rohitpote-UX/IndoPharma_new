import React from 'react';
import { ShieldAlert, FileText, Ban, HelpCircle } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function ComplianceNotice() {
  return (
    <section
      id="regulatory-notice"
      aria-labelledby="compliance-heading"
      className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-800 text-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 id="compliance-heading" className="text-lg font-bold text-slate-900">
            Regulatory Compliance & Patient Safety Framework
          </h2>
          <p className="text-xs text-slate-600">
            Strict adherence to U.S. Federal Guidelines, CDSCO Export Standards, and Clinical Scrutiny
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Prescription Requirement */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-teal-800">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Valid U.S. Rx Required</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {siteConfig.disclaimers.regulatoryNotice}
          </p>
        </div>

        {/* Controlled Substances Prohibition */}
        <div className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700">
            <Ban className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Zero Controlled Substances</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {siteConfig.disclaimers.controlledSubstancesBan}
          </p>
        </div>

        {/* Medical Advice Disclaimer */}
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <HelpCircle className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Clinical Guidance</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-700">
            {siteConfig.disclaimers.medicalAdvice}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-teal-50 border border-teal-200/60 p-4 text-xs text-teal-900 leading-relaxed">
        <span className="font-bold text-teal-950">Notice of Inspection & Transit: </span>
        {siteConfig.disclaimers.deliveryTimeline}
      </div>
    </section>
  );
}
