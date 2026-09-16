import React from 'react';
import { Hero } from '@/components/home/Hero';
import { SearchDiscovery } from '@/components/home/SearchDiscovery';
import { TrustStatement } from '@/components/home/TrustStatement';
import { FeaturedMedicines } from '@/components/home/FeaturedMedicines';
import { HowItWorksPreview } from '@/components/home/HowItWorksPreview';
import { FinalCta } from '@/components/home/FinalCta';

export default function StorefrontHomePage() {
  return (
    <div className="flex flex-col bg-white">
      {/* 01 HERO */}
      <Hero />

      {/* 02 MEDICINE DISCOVERY */}
      <SearchDiscovery />

      {/* 03 TRUST STATEMENT */}
      <TrustStatement />

      {/* 04 FEATURED PRODUCTS */}
      <FeaturedMedicines />

      {/* 05 HOW IT WORKS — SHORT PREVIEW */}
      <HowItWorksPreview />

      {/* 06 FINAL CTA */}
      <FinalCta />
    </div>
  );
}
