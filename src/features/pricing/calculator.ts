/**
 * ==============================================================================
 * INDOPHARM — TRANSPARENT LANDED-COST CALCULATOR
 * ==============================================================================
 * Calculates the exact components of a pharmaceutical product's landed cost:
 * Factory FOB (India) + International Air Cargo + Customs Clearance + Pharmacist Dispensing Fee.
 * ==============================================================================
 */

import { LandedCostBreakdown } from '@/types';
import { calculateSavings } from '@/utils/formatters';

export interface PricingFactors {
  fobPriceUsd: number;
  usAverageCashPrice: number;
  packageCount?: number;
}

// Standardized transparent fee schedules for 90-day maintenance supplies
const FIXED_INTERNATIONAL_AIR_FREIGHT = 6.50; // Express bonded air cargo
const FIXED_CUSTOMS_HANDLING = 2.50;         // Section 321 / PIP import filing
const FIXED_PHARMACIST_DISPENSING_FEE = 4.50; // Licensed clinical pharmacist review

export function computeLandedCost(factors: PricingFactors): LandedCostBreakdown {
  const fob = factors.fobPriceUsd;
  const airFreight = FIXED_INTERNATIONAL_AIR_FREIGHT;
  const customs = FIXED_CUSTOMS_HANDLING;
  const dispensing = FIXED_PHARMACIST_DISPENSING_FEE;

  const totalPatientPriceUsd = Number((fob + airFreight + customs + dispensing).toFixed(2));
  const { savingsUsd, percentage } = calculateSavings(
    factors.usAverageCashPrice,
    totalPatientPriceUsd
  );

  return {
    fobPriceUsd: fob,
    internationalAirFreightUsd: airFreight,
    customsHandlingUsd: customs,
    pharmacistDispensingFeeUsd: dispensing,
    totalPatientPriceUsd,
    usRetailBenchmarkUsd: factors.usAverageCashPrice,
    totalSavingsUsd: savingsUsd,
    savingsPercentage: percentage,
  };
}
