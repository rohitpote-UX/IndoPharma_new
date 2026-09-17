'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, ProductPassportData } from '@/lib/domain/product';
import { ProductEligibilityResult, EligibilityStatus } from '@/lib/domain/eligibility';
import { Container } from '@/components/ui/Container';
import { ProductHeader } from '@/components/pharmacy/ProductHeader';
import { ProductPrice } from '@/components/pharmacy/ProductPrice';
import { ProductAvailability } from '@/components/pharmacy/ProductAvailability';
import { ProductEligibilityBadge } from '@/components/pharmacy/ProductEligibilityBadge';
import { ProductInformation } from '@/components/pharmacy/ProductInformation';
import { ProductDocuments } from '@/components/pharmacy/ProductDocuments';
import { ShippingEligibility } from '@/components/pharmacy/ShippingEligibility';
import { ProductFAQ } from '@/components/pharmacy/ProductFAQ';
import { RelatedProducts } from '@/components/pharmacy/RelatedProducts';
import { ProductPassport } from '@/components/pharmacy/ProductPassport';
import { useDestination } from '@/lib/context/DestinationContext';
import {
  ChevronRight,
  Pill,
  ShieldCheck,
  Layers,
  X,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ProductDetailClientProps {
  product: Product;
  allProducts: Product[];
}

export function ProductDetailClient({ product, allProducts }: ProductDetailClientProps) {
  const { destination, setDestinationCountry } = useDestination();

  const [eligibility, setEligibility] = useState<ProductEligibilityResult | null>(null);
  const [passportData, setPassportData] = useState<ProductPassportData | null>(null);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [isPassportLoading, setIsPassportLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);

  // Evaluate product eligibility whenever destination changes
  useEffect(() => {
    let cancelled = false;

    async function runEligibilityCheck() {
      try {
        const res = await fetch('/api/eligibility/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            destination: {
              countryCode: destination.countryCode,
              jurisdictionCode: destination.jurisdictionCode,
            },
          }),
        });
        if (res.ok) {
          const json = await res.json();
          if (!cancelled && json.success && json.data) {
            setEligibility(json.data);
          }
        }
      } catch (err) {
        console.error('Eligibility check error:', err);
      }
    }

    void runEligibilityCheck();

    return () => {
      cancelled = true;
    };
  }, [product.id, destination.countryCode, destination.jurisdictionCode]);

  // Load Passport data on demand or modal open
  const loadPassport = async () => {
    if (passportData) {
      setIsPassportModalOpen(true);
      return;
    }
    setIsPassportLoading(true);
    try {
      const res = await fetch(`/api/products/${product.slug}/passport?destination=${destination.countryCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setPassportData(json.data);
          setIsPassportModalOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to load Product Passport:', err);
    } finally {
      setIsPassportLoading(false);
    }
  };

  // Add to cart with server-side validation
  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setCartSuccessMessage(null);
    setCartErrorMessage(null);

    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          destinationCountry: destination.countryCode,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCartSuccessMessage('Product added to your cart.');
        setTimeout(() => setCartSuccessMessage(null), 5000);
      } else {
        setCartErrorMessage(json.error || 'This product cannot be added to your cart.');
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      setCartErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const activeBatch = product.batches[0] || null;
  const currentStatus: EligibilityStatus = eligibility?.status || (product.stockStatus as EligibilityStatus);

  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <Container>
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#59605A] pb-6 sm:pb-8">
          <Link href="/" className="hover:text-[#2F5D3A] transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
          <Link href="/medicines" className="hover:text-[#2F5D3A] transition-colors">
            Medicines
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
          <span className="text-[#111411] font-medium truncate">{product.name}</span>
        </nav>

        {/* 2-Column Opening: Visual Packaging Render (Left) + Purchase Hierarchy (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start pb-14 border-b border-[#E6ECE7]">
          {/* LEFT: 6 Columns Visual Presentation */}
          <div className="lg:col-span-6 space-y-4">
            {/* Visual Packaging Box */}
            <div className="relative aspect-[4/3] w-full rounded-2xl bg-[#F3F7F3] border border-[#E6ECE7] flex flex-col items-center justify-center p-8 overflow-hidden shadow-xs">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] shadow-sm">
                <Pill className="w-12 h-12 sm:w-14 sm:h-14" />
              </div>

              <div className="mt-5 text-center space-y-1">
                <span className="text-xs font-mono font-bold text-[#2F5D3A] block">
                  {activeBatch ? `SERIAL LOT: ${activeBatch.lotNumber}` : 'BATCH SERIALIZATION PENDING'}
                </span>
                <span className="text-xs text-[#59605A] block">
                  {product.manufacturer.name}
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-white border border-[#E6ECE7] text-[#111411]">
                  {product.strength}
                </span>
              </div>
            </div>

            {/* Assay and Trust Bar */}
            <div className="bg-white border border-[#E6ECE7] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#2F5D3A]">
                <ShieldCheck className="w-4 h-4 text-[#2F5D3A]" />
                <span>
                  HPLC Purity Assay:{' '}
                  <strong>{activeBatch?.assayPurity ? `${activeBatch.assayPurity}%` : 'On file'}</strong>
                </span>
              </div>
              <span className="text-[#59605A]">
                {product.manufacturer.whoGmpCertified ? 'WHO-GMP Audited' : 'Verified Facility'}
              </span>
            </div>

            {/* Product Passport™ Direct Teaser Card */}
            <div className="bg-[#F3F7F3]/70 rounded-xl border border-[#2F5D3A]/20 p-4.5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#2F5D3A] text-white flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold tracking-wider text-[#2F5D3A] uppercase">
                    PROVENANCE ARCHITECTURE
                  </div>
                  <div className="text-sm font-semibold text-[#111411]">
                    Product Passport™
                  </div>
                  <div className="text-xs text-[#59605A]">
                    Trace this batch across 9 verified supply-chain milestones.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPassport}
                disabled={isPassportLoading}
                className="px-3.5 py-2 rounded-lg bg-white border border-[#2F5D3A]/30 text-xs font-semibold text-[#2F5D3A] hover:bg-[#2F5D3A] hover:text-white transition-all shrink-0 cursor-pointer shadow-xs"
              >
                {isPassportLoading ? 'Loading...' : 'View Passport™'}
              </button>
            </div>
          </div>

          {/* RIGHT: 6 Columns Product Header, Eligibility, Pricing & Add to Cart */}
          <div className="lg:col-span-6 space-y-5">
            <ProductHeader product={product} />

            {/* Destination-Aware Eligibility Engine Badge */}
            <ProductEligibilityBadge
              status={currentStatus}
              destination={destination}
              reason={eligibility?.reason}
              onDestinationChange={(c) => setDestinationCountry(c)}
            />

            <ProductPrice
              retailPriceUsd={product.retailPriceUsd}
              usAverageCashPrice={product.usAverageCashPrice}
              packageSize={product.packageSize}
              unit={product.dosageForm}
            />

            <ProductAvailability
              status={currentStatus === 'DESTINATION_RESTRICTED' || currentStatus === 'NOT_AVAILABLE' ? 'NOT_ELIGIBLE' : product.stockStatus}
              requiresPrescription={product.requiresPrescription}
              destination={destination.countryName}
              onAddToCart={handleAddToCart}
            />

            {/* Cart Status Feedback Alerts */}
            {cartSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-[#F3F7F3] border border-[#2F5D3A]/30 flex items-center justify-between gap-3 text-xs text-[#2F5D3A] animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2F5D3A] shrink-0" />
                  <span>{cartSuccessMessage}</span>
                </div>
                <Link
                  href="/cart"
                  className="font-semibold underline hover:text-[#3F704A] shrink-0"
                >
                  View Cart &rarr;
                </Link>
              </div>
            )}

            {cartErrorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{cartErrorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Sections: Information, Documents, Shipping, FAQs */}
        <div className="py-14 space-y-10 border-b border-[#E6ECE7]">
          <div className="max-w-3xl space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2F5D3A]">
              CLINICAL & COMPLIANCE DOSSIER
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#111411]">
              Specifications, Quality Records & Delivery
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Product Information */}
            <div className="space-y-6">
              <ProductInformation product={product} />
              <ProductDocuments documents={product.documents} />
            </div>

            {/* Right Column: Shipping Eligibility & FAQ */}
            <div className="space-y-6">
              <ShippingEligibility
                eligibilities={product.shippingEligibilities}
                currentDestination={destination.countryCode}
                onDestinationChange={(dest) => setDestinationCountry(dest)}
              />
              <ProductFAQ product={product} />
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="pt-14">
          <RelatedProducts currentProduct={product} allProducts={allProducts} />
        </div>
      </Container>

      {/* Product Passport Modal */}
      {isPassportModalOpen && passportData && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Product Passport"
        >
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setIsPassportModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors cursor-pointer"
              aria-label="Close passport modal"
            >
              <X className="w-5 h-5" />
            </button>
            <ProductPassport
              passport={passportData}
              isModal={true}
              onClose={() => setIsPassportModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sticky Mobile CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E6ECE7] p-4 shadow-lg flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#59605A] uppercase tracking-wider block">Landed Price</span>
          <span className="text-lg font-bold text-[#111411]">
            ${product.retailPriceUsd.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          disabled={isAddingToCart || currentStatus === 'DESTINATION_RESTRICTED' || currentStatus === 'NOT_AVAILABLE'}
          onClick={handleAddToCart}
          className="flex-1 max-w-[240px] h-11 px-5 rounded-xl bg-[#2F5D3A] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#3F704A] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isAddingToCart ? 'Adding...' : product.requiresPrescription ? 'Prescription Order' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
