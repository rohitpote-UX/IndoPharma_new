'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/domain/product';
import { ChevronDown, AlertTriangle, ShieldCheck, Thermometer, Pill } from 'lucide-react';

interface ProductInformationProps {
  product: Product;
}

export const ProductInformation: React.FC<ProductInformationProps> = ({ product }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    indication: true,
    composition: true,
    storage: false,
    warnings: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white border border-[#E6ECE7] rounded-xl overflow-hidden divide-y divide-[#E6ECE7]">
      {/* 1. Therapeutic Indication */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => toggleSection('indication')}
          className="w-full flex items-center justify-between text-left font-serif text-lg text-[#111411] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2F5D3A]" />
            Therapeutic Indication & Description
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              openSections.indication ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.indication && (
          <div className="mt-3 text-sm text-[#59605A] leading-relaxed animate-in fade-in duration-150">
            <p>{product.description || 'Product description provided upon clinical dispatch.'}</p>
            <p className="mt-2 text-xs italic text-neutral-400">
              * The information above reflects official pharmacopeial labeling. Always consult your prescribing healthcare professional for specific clinical advice.
            </p>
          </div>
        )}
      </div>

      {/* 2. Composition & Specification */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => toggleSection('composition')}
          className="w-full flex items-center justify-between text-left font-serif text-lg text-[#111411] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-[#2F5D3A]" />
            Active Molecule & Specification
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              openSections.composition ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.composition && (
          <div className="mt-3 text-sm text-[#59605A] space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-neutral-50 p-4 rounded-lg border border-neutral-100">
              <div>
                <span className="text-neutral-400 block">Active Pharmaceutical Ingredient:</span>
                <span className="font-semibold text-[#111411]">{product.activeIngredient}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Strength / Unit:</span>
                <span className="font-semibold text-[#111411]">{product.strength}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Dosage Form:</span>
                <span className="font-semibold text-[#111411]">{product.dosageForm}</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Pharmacopeia Standard:</span>
                <span className="font-semibold text-[#111411]">USP / IP Compendial Grade</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Storage & Stability */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => toggleSection('storage')}
          className="w-full flex items-center justify-between text-left font-serif text-lg text-[#111411] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-[#2F5D3A]" />
            Storage & Stability Guidelines
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              openSections.storage ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.storage && (
          <div className="mt-3 text-sm text-[#59605A] leading-relaxed animate-in fade-in duration-150">
            <div className="p-3.5 rounded-lg bg-[#F3F7F3] border border-[#2F5D3A]/20 text-xs text-[#111411]">
              <strong>Packaging Storage Conditions:</strong>{' '}
              {product.storageConditions || 'Store at 20°C to 25°C (68°F to 77°F); excursions permitted between 15°C and 30°C. Protect from moisture and excessive light.'}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              Shipped in temperature-monitored packaging with thermal insulation where indicated by transit profile.
            </p>
          </div>
        )}
      </div>

      {/* 4. Precautions & Clinical Disclaimers */}
      <div className="p-5">
        <button
          type="button"
          onClick={() => toggleSection('warnings')}
          className="w-full flex items-center justify-between text-left font-serif text-lg text-[#111411] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Precautions & Regulatory Disclaimers
          </span>
          <ChevronDown
            className={`w-4 h-4 text-neutral-400 transition-transform ${
              openSections.warnings ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openSections.warnings && (
          <div className="mt-3 text-xs text-[#59605A] leading-relaxed space-y-2 animate-in fade-in duration-150">
            <p>
              IndoPharm provides verifiable supply-chain facilitation and authentic pharmaceutical distribution under applicable personal importation frameworks (including FDA CPG Sec. 110.300).
            </p>
            <p>
              This platform does not manufacture medicines or provide independent medical consultation. Patients must maintain care under a licensed prescribing healthcare provider. Do not alter dosages or regimens without medical supervision.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
