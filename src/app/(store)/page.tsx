import React from 'react';
import { Hero } from '@/components/home/Hero';
import { MedicineSearch } from '@/components/home/MedicineSearch';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { FeaturedMedicines } from '@/components/home/FeaturedMedicines';
import { HowItWorks } from '@/components/home/HowItWorks';
import { TrustQuality } from '@/components/home/TrustQuality';
import { TransparentPricing } from '@/components/home/TransparentPricing';
import { SupplyStory } from '@/components/home/SupplyStory';
import { CustomerSupport } from '@/components/home/CustomerSupport';
import { FaqSection } from '@/components/home/FaqSection';

export default function StorefrontHomePage() {
  return (
    <div className="flex flex-col">
      {/* 01 HERO */}
      <Hero />

      {/* 02 MEDICINE SEARCH */}
      <MedicineSearch />

      {/* 03 WHY CHOOSE US */}
      <WhyChooseUs />

      {/* 04 FEATURED MEDICINES */}
      <FeaturedMedicines />

      {/* 05 HOW IT WORKS */}
      <HowItWorks />

      {/* 06 TRUST / QUALITY */}
      <TrustQuality />

      {/* 07 TRANSPARENT PRICING */}
      <TransparentPricing />

      {/* 08 MANUFACTURER / SUPPLY STORY */}
      <SupplyStory />

      {/* 09 CUSTOMER SUPPORT */}
      <CustomerSupport />

      {/* 10 FAQ */}
      <FaqSection />
    </div>
  );
}
