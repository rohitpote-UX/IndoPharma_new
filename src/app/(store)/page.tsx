import React from 'react';
import { Hero } from '@/components/home/Hero';
import { SearchDiscovery } from '@/components/home/SearchDiscovery';
import { TrustStatement } from '@/components/home/TrustStatement';
import { FeaturedMedicines } from '@/components/home/FeaturedMedicines';
import { WhyOurPrice } from '@/components/pharmacy/WhyOurPrice';
import { HowItWorksPreview } from '@/components/home/HowItWorksPreview';
import { FinalCta } from '@/components/home/FinalCta';

export default function StorefrontHomePage() {
  return (
    <div className="flex flex-col bg-white">
      {/* 01 HERO (Phase 7) */}
      <Hero />

      {/* 02 MEDICINE DISCOVERY & SEARCH GATEWAY (Phase 8) */}
      <SearchDiscovery />

      {/* 03 TRUST & PROVENANCE STATEMENT */}
      <TrustStatement />

      {/* 04 FEATURED PHARMACEUTICAL CATALOGUE */}
      <FeaturedMedicines />

      {/* 05 WHY OUR PRICE? (Phase 11) */}
      <WhyOurPrice />

      {/* 06 HOW IT WORKS — AUDITED FULFILLMENT PREVIEW */}
      <HowItWorksPreview />

      {/* 07 FINAL VERIFICATION CTA */}
      <FinalCta />
    </div>
  );
}
