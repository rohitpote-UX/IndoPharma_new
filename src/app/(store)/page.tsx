import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { MOCK_PRODUCTS } from '@/features/products/mock-catalog';
import { CROSS_BORDER_STAGES } from '@/features/shipping/stages';
import { SourcingProvenanceCard } from '@/components/trust/SourcingProvenanceCard';
import { LandedCostAccordion } from '@/components/trust/LandedCostAccordion';
import { ComplianceNotice } from '@/components/trust/ComplianceNotice';
import { formatCurrency } from '@/utils/formatters';

export default function StorefrontHomePage() {
  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* 1. HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-teal-50/20 p-8 sm:p-14 shadow-sm">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-1.5 text-xs font-semibold text-teal-800">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Direct India → USA Pharmaceutical Commerce Bridge</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Direct Generic Sourcing.{' '}
              <span className="text-teal-800">Radical Price Transparency.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-slate-600">
              We connect chronic maintenance patients in the United States directly with validated,
              WHO-GMP and US-FDA audited pharmaceutical manufacturing plants in India. 
              No PBM spreads. No wholesaler markups. Full batch traceability.
            </p>

            {/* Quick Sourcing Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="text-2xl font-black text-teal-800">65–85%</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Average Patient Savings</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="text-2xl font-black text-slate-900">10–14 d</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Express Air Delivery</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="text-2xl font-black text-teal-800">100%</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Batch CoA Traceability</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="text-2xl font-black text-slate-900">U.S. Rx</div>
                <div className="text-xs text-slate-500 font-medium mt-1">Licensed Clinical Audit</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="#catalog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-teal-900 transition-all active:scale-[0.99]"
              >
                <span>Browse Maintenance Medications</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#pricing-transparency"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <span>Explore Landed-Cost Formula</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE PILLARS OF PLATFORM INTEGRITY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Audited Manufacturer Sourcing</h2>
            <p className="text-xs leading-relaxed text-slate-600">
              We contract directly with leading Indian pharmaceutical manufacturers operating WHO-GMP 
              certified and US-FDA registered production facilities, bypassing secondary brokers.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
              <DollarSign className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Itemized Cost-Plus Pricing</h2>
            <p className="text-xs leading-relaxed text-slate-600">
              Every dollar is accounted for: FOB manufacturing price + international bonded air cargo + 
              U.S. customs entry + clinical pharmacist review fee. Zero hidden pharmacy benefit manager rebates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-800 border border-teal-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Lawful Personal Importation</h2>
            <p className="text-xs leading-relaxed text-slate-600">
              Operating strictly within FDA Personal Importation guidelines (CPG Sec. 110.300).
              Prescription verification by licensed clinical pharmacists with absolute exclusion of controlled substances.
            </p>
          </div>
        </div>
      </section>

      {/* 3. CATALOG & VERIFIED DIRECTORY */}
      <section id="catalog" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Phase 0 Foundation Catalog
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Chronic Generic Maintenance Therapies
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sample 90-day supplies for chronic cardiovascular and metabolic care. Requires valid U.S. prescription.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <AlertCircle className="h-4 w-4 text-slate-600" />
            <span>Non-Controlled Medications Only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {product.dosageForm}
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/50">
                    {product.packageSize} Tablets (90-Day Supply)
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{product.name}</h3>
                  <div className="text-xs font-medium text-slate-500">{product.brandReferenceName}</div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Ingredient:</span>
                    <span className="font-semibold text-slate-800">{product.activeIngredient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Strength:</span>
                    <span className="font-semibold text-slate-800">{product.strength}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">NDC Equivalent:</span>
                    <span className="font-mono text-slate-700">{product.ndcEquivalent}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <SourcingProvenanceCard
                    manufacturer={product.manufacturer}
                    batch={product.batch}
                  />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">IndoPharm Direct Price:</span>
                    <span className="text-2xl font-black font-mono text-teal-900">
                      {formatCurrency(product.retailPriceUsd)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block line-through">
                      U.S. Cash: {formatCurrency(product.usAverageCashPrice)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Save {formatCurrency(product.usAverageCashPrice - product.retailPriceUsd)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-900 transition-colors shadow-2xs"
                >
                  <FileText className="h-4 w-4" />
                  <span>Select & Upload Prescription</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LANDED-COST MODEL DEEP-DIVE */}
      <section id="pricing-transparency" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              The Anti-PBM Architecture
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              How Our Landed-Cost Breakdown Works
            </h2>
            <p className="text-xs leading-relaxed text-slate-600">
              In the traditional U.S. pharmaceutical supply chain, pharmacy benefit managers (PBMs) and 
              wholesalers pocket substantial spreads on generic tablets that cost pennies to synthesize. 
              Below is our exact transparent fee structure applied to our catalog.
            </p>
          </div>

          <div className="space-y-4">
            {MOCK_PRODUCTS.map((prod) => (
              <LandedCostAccordion
                key={prod.id}
                fobPriceUsd={prod.fobPriceUsd}
                usAverageCashPrice={prod.usAverageCashPrice}
                productName={prod.name}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. 8-STAGE CROSS-BORDER MILESTONE TRACKING */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Chain of Custody
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            8-Stage International Fulfillment Journey
          </h2>
          <p className="text-xs text-slate-600">
            From licensed Indian factory dispatch to U.S. residential delivery, every milestone is logged and verifiable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CROSS_BORDER_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-50 text-[11px] font-bold text-teal-800 border border-teal-200">
                  {stage.id}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {stage.locationScope}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900">{stage.title}</h3>
              <p className="text-[11px] leading-relaxed text-slate-500">{stage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. STATUTORY COMPLIANCE & SAFETY NOTICE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <ComplianceNotice />
      </section>
    </div>
  );
}
