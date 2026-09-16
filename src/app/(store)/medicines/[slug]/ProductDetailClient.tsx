'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Pill,
  ShoppingBag,
  ShieldCheck,
  Building2,
  FileCheck,
  AlertCircle,
  Truck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { CatalogProduct, MOCK_CATALOG } from '@/lib/mock/catalog';
import { formatCurrency } from '@/utils/formatters';

interface ProductDetailClientProps {
  product: CatalogProduct;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Related products (other medicines from same or different category)
  const related = MOCK_CATALOG.filter((p) => p.id !== product.id).slice(0, 3);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  return (
    <div className="bg-white min-h-screen py-10 sm:py-14">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#59605A] pb-8">
          <Link href="/" className="hover:text-[#2F5D3A] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#848D85]" />
          <Link href="/medicines" className="hover:text-[#2F5D3A] transition-colors">
            Medicines
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#848D85]" />
          <span className="text-[#111411] font-medium truncate">{product.name}</span>
        </nav>

        {/* Top Split: Visual Packaging + Purchase Hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 border-b border-[#E6ECE7]">
          {/* LEFT: Product Visual Packaging Render (6 Columns) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#F3F7F3] border border-[#E6ECE7] flex flex-col items-center justify-center p-8 sm:p-12 overflow-hidden shadow-xs">
              <div className="flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-3xl bg-white border border-[#E6ECE7] text-[#2F5D3A] shadow-sm">
                <Pill className="h-14 w-14 sm:h-16 sm:w-16" />
              </div>
              <div className="mt-4 text-center space-y-1">
                <span className="text-xs font-mono font-bold text-[#2F5D3A]">
                  SERIAL LOT: {product.batch.lotNumber}
                </span>
                <div className="text-xs text-[#59605A]">{product.manufacturer.name}</div>
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant="green" size="md">
                  {product.strength}
                </Badge>
              </div>
            </div>

            {/* Assay & QC Micro-Badge */}
            <div className="rounded-xl border border-[#E6ECE7] bg-white p-4 flex items-center justify-between text-xs text-[#59605A]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2F5D3A]" />
                <span>HPLC Assayed Purity: <strong className="text-[#2F5D3A]">{product.batch.assayPurity}%</strong></span>
              </div>
              <span className="text-[#848D85]">Verified WHO-GMP Facility</span>
            </div>
          </div>

          {/* RIGHT: Product Information & Purchase Configurator (6 Columns) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="green" size="sm">
                  Available for Prescription Order
                </Badge>
                <span className="text-xs text-[#59605A]">• {product.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111411]">
                {product.name}
              </h1>
              <p className="text-sm font-medium text-[#59605A]">
                {product.brandReferenceName}
              </p>
            </div>

            {/* Price & Savings Callout */}
            <div className="rounded-2xl bg-[#F3F7F3] border border-[#E6ECE7] p-6 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2F5D3A] block">
                    Transparent Landed Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-[#111411] mt-1">
                    {formatCurrency(product.retailPriceUsd)}
                    <span className="text-sm font-normal text-[#59605A] ml-2">
                      / {product.packageSize} Tablets (3-Month Supply)
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6ECE7] flex items-center justify-between text-xs">
                <span className="text-[#848D85] line-through">
                  U.S. Cash Retail Price: {formatCurrency(product.usAverageCashPrice)}
                </span>
                <span className="font-bold text-[#2F5D3A]">
                  Save {formatCurrency(product.usAverageCashPrice - product.retailPriceUsd)} (
                  {Math.round(((product.usAverageCashPrice - product.retailPriceUsd) / product.usAverageCashPrice) * 100)}%)
                </span>
              </div>
            </div>

            {/* Purchase Conditions Alert */}
            <div className="rounded-xl border border-[#E6ECE7] bg-white p-4 space-y-2 text-xs text-[#59605A]">
              <div className="flex items-center gap-2 font-semibold text-[#111411]">
                <AlertCircle className="h-4 w-4 text-[#2F5D3A]" />
                <span>Required Purchase Conditions</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-[#59605A]">
                <li>Valid U.S. physician prescription strictly required prior to dispensing.</li>
                <li>Limited to standard 90-day personal maintenance supply (FDA CPG 110.300).</li>
                <li>Dispensed directly through verified international CDSCO-cleared air transit.</li>
              </ul>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E6ECE7] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-12 w-12 flex items-center justify-center text-[#111411] hover:bg-[#F3F7F3] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="h-12 w-12 flex items-center justify-center font-mono font-bold text-sm text-[#111411]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(3, q + 1))}
                    className="h-12 w-12 flex items-center justify-center text-[#111411] hover:bg-[#F3F7F3] cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 h-12 px-8 rounded-xl bg-[#2F5D3A] text-sm font-semibold text-white hover:bg-[#24482D] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{addedToCart ? 'Added to Cart ✓' : `Add 90-Day Supply (${formatCurrency(product.retailPriceUsd * quantity)})`}</span>
                </button>
              </div>

              {addedToCart && (
                <div className="flex items-center justify-between text-xs text-[#2F5D3A] bg-[#F3F7F3] p-3 rounded-xl border border-[#E6ECE7]">
                  <span>Item added to cart. Valid prescription verified at checkout.</span>
                  <Link href="/cart" className="font-semibold underline">
                    View Cart →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs / Accordion Content */}
        <div className="py-16 border-b border-[#E6ECE7] space-y-12">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2F5D3A] block">
              Clinical & Technical Provenance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111411]">
              Product & Manufacturing Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Box 1: Formulation & Indication */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-[#111411] flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#2F5D3A]" />
                <span>Formulation Information</span>
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-[#59605A] leading-relaxed">
                <div>
                  <strong className="text-[#111411] block">Generic Active Molecule:</strong>
                  <span>{product.activeIngredient}</span>
                </div>
                <div>
                  <strong className="text-[#111411] block">Dosage Form & Strength:</strong>
                  <span>{product.dosageForm} • {product.strength}</span>
                </div>
                <div>
                  <strong className="text-[#111411] block">Therapeutic Indication:</strong>
                  <span>{product.description}</span>
                </div>
                <div>
                  <strong className="text-[#111411] block">Storage Conditions:</strong>
                  <span>{product.storageConditions}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Origin & Audit Verification */}
            <div className="rounded-2xl border border-[#E6ECE7] bg-white p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-[#111411] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#2F5D3A]" />
                <span>Manufacturer & Laboratory Provenance</span>
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-[#59605A] leading-relaxed">
                <div>
                  <strong className="text-[#111411] block">Audited Manufacturing Plant:</strong>
                  <span>{product.manufacturer.name} • {product.manufacturer.facilityCity}, {product.manufacturer.facilityState}</span>
                </div>
                <div>
                  <strong className="text-[#111411] block">CDSCO Export License:</strong>
                  <span className="font-mono text-[#111411]">{product.manufacturer.cdscoLicense}</span>
                </div>
                {product.manufacturer.usFdaFeiNumber && (
                  <div>
                    <strong className="text-[#111411] block">US-FDA FEI Registry Identifier:</strong>
                    <span className="font-mono text-[#111411]">{product.manufacturer.usFdaFeiNumber}</span>
                  </div>
                )}
                <div>
                  <strong className="text-[#111411] block">Batch Quality Sign-Off:</strong>
                  <span>{product.batch.qcOfficer} • Lot Expiry: {product.batch.expirationDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Customs Guidance */}
          <div className="rounded-2xl border border-[#E6ECE7] bg-[#F3F7F3] p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 font-bold text-base text-[#111411]">
              <Truck className="h-5 w-5 text-[#2F5D3A]" />
              <span>International Delivery & Customs Assurance</span>
            </div>
            <p className="text-xs sm:text-sm text-[#59605A] leading-relaxed">
              Dispatched via temperature-monitored air transit from accredited Indian export hubs.
              Average transit time: 10–14 business days. All shipments include full parcel tracking and are
              covered by our complete Customs Clearance Guarantee.
            </p>
          </div>
        </div>

        {/* Related Maintenance Therapies */}
        <div className="pt-16 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111411]">
              Related Maintenance Therapies
            </h3>
            <Link href="/medicines" className="text-xs font-semibold text-[#2F5D3A] hover:underline">
              View All Medicines →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/medicines/${item.slug}`}
                className="group rounded-2xl border border-[#E6ECE7] bg-white p-5 space-y-4 hover:border-[#2F5D3A]/40 transition-colors shadow-[0_2px_12px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#59605A] truncate">{item.category}</span>
                  <Badge variant="green" size="sm">
                    {item.strength}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#111411] group-hover:text-[#2F5D3A] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-[#59605A] mt-0.5">{item.brandReferenceName}</p>
                </div>
                <div className="pt-3 border-t border-[#E6ECE7] flex items-center justify-between text-xs">
                  <span className="font-bold font-mono text-sm text-[#111411]">
                    {formatCurrency(item.retailPriceUsd)}
                  </span>
                  <span className="text-[#2F5D3A] font-semibold flex items-center gap-1">
                    <span>View</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
