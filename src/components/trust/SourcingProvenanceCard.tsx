import React from 'react';
import { Building2, CheckCircle2, FileCheck2, MapPin, Award } from 'lucide-react';
import { Manufacturer, BatchCertificate } from '@/types';

interface SourcingProvenanceCardProps {
  manufacturer: Manufacturer;
  batch?: BatchCertificate;
}

export function SourcingProvenanceCard({ manufacturer, batch }: SourcingProvenanceCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 border border-teal-200/50">
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
            Verified Origin Facility
          </span>
          <h3 className="mt-2 text-base font-bold text-slate-900">{manufacturer.name}</h3>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Building2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Facility Location:
          </span>
          <span className="font-medium text-slate-800">
            {manufacturer.facilityCity}, {manufacturer.facilityState}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" /> CDSCO License:
          </span>
          <span className="font-mono text-slate-700">{manufacturer.cdscoLicenseNumber}</span>
        </div>

        {manufacturer.usFdaRegistrationNumber && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">US-FDA Facility Identifier:</span>
            <span className="font-mono text-slate-700">{manufacturer.usFdaRegistrationNumber}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-slate-500">WHO-GMP Status:</span>
          <span className="font-medium text-teal-700">Audit Verified</span>
        </div>
      </div>

      {batch && (
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-600">
            <span>Lot: <strong className="text-slate-900">{batch.lotNumber}</strong></span>
            <span>Purity: <strong className="text-teal-700">{batch.purityPercentage}%</strong></span>
          </div>
          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
              Assayed by: {batch.releasedByQcOfficer}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-900 cursor-pointer">
              <FileCheck2 className="h-3.5 w-3.5" />
              View CoA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
