/**
 * ==============================================================================
 * INDOPHARM — ELIGIBILITY & REGULATORY RULES ENGINE
 * ==============================================================================
 * Evaluates destination-aware regulatory, prescription, verification, inventory,
 * and fulfillment constraints following strict 11-step priority order.
 * ==============================================================================
 */

import {
  EligibilityStatus,
  DestinationInfo,
  EvaluationRequest,
  ProductEligibilityResult,
  CartEligibilityResult,
  CartEligibilityItem,
} from '@/lib/domain/eligibility';
import { VERIFIED_PRODUCTS_STORE, getProductBySlug } from './searchService';

export interface CountryRecord {
  code: string;
  name: string;
  currency: string;
  phoneCode: string;
  isActive: boolean;
  jurisdictions: Array<{ code: string; name: string; type: string; isActive: boolean }>;
}

/**
 * Approved operational destination registry.
 * Can be loaded from Prisma database or cached in memory.
 */
export const APPROVED_COUNTRIES: CountryRecord[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    phoneCode: '+1',
    isActive: true,
    jurisdictions: [
      { code: 'US-CA', name: 'California', type: 'STATE', isActive: true },
      { code: 'US-NY', name: 'New York', type: 'STATE', isActive: true },
      { code: 'US-TX', name: 'Texas', type: 'STATE', isActive: true },
      { code: 'US-FL', name: 'Florida', type: 'STATE', isActive: true },
      { code: 'US-IL', name: 'Illinois', type: 'STATE', isActive: true },
    ],
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    phoneCode: '+91',
    isActive: true,
    jurisdictions: [
      { code: 'IN-MH', name: 'Maharashtra', type: 'STATE', isActive: true },
      { code: 'IN-DL', name: 'Delhi', type: 'STATE', isActive: true },
      { code: 'IN-KA', name: 'Karnataka', type: 'STATE', isActive: true },
      { code: 'IN-GJ', name: 'Gujarat', type: 'STATE', isActive: true },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    phoneCode: '+44',
    isActive: true,
    jurisdictions: [],
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    phoneCode: '+1',
    isActive: true,
    jurisdictions: [],
  },
];

export interface OperationalEligibilityRule {
  id: string;
  productId: string;
  countryCode: string;
  jurisdictionCode?: string;
  status: EligibilityStatus;
  prescriptionRequired: boolean;
  verificationRequired: boolean;
  shippingAllowed: boolean;
  fulfillmentAllowed: boolean;
  maxSupplyDays: number;
  reason: string;
}

/**
 * Approved operational rules store.
 * Reflects compliance officer sign-offs.
 */
export const APPROVED_ELIGIBILITY_RULES: OperationalEligibilityRule[] = [
  // US Rules for all verified maintenance catalog items
  {
    id: 'rule-us-at20',
    productId: 'prod-atorvastatin-20',
    countryCode: 'US',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Personal importation permitted under FDA CPG Sec. 110.300 with valid licensed U.S. physician prescription.',
  },
  {
    id: 'rule-us-mf500',
    productId: 'prod-metformin-500-er',
    countryCode: 'US',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Personal importation permitted for 90-day maintenance supply per FDA CPG Sec. 110.300.',
  },
  {
    id: 'rule-us-lis20',
    productId: 'prod-lisinopril-20',
    countryCode: 'US',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Personal importation permitted under FDA CPG Sec. 110.300 with valid U.S. physician prescription.',
  },
  {
    id: 'rule-us-lt50',
    productId: 'prod-levothyroxine-50',
    countryCode: 'US',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Personal importation permitted under FDA CPG Sec. 110.300.',
  },
  {
    id: 'rule-us-pan40',
    productId: 'prod-pantoprazole-40',
    countryCode: 'US',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Personal importation permitted under FDA CPG Sec. 110.300.',
  },
  {
    id: 'rule-us-ros10',
    productId: 'prod-rosuvastatin-10',
    countryCode: 'US',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Personal importation permitted for 90-day maintenance therapy.',
  },

  // India Domestic Rules
  {
    id: 'rule-in-at20',
    productId: 'prod-atorvastatin-20',
    countryCode: 'IN',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Domestic fulfillment available under Schedule H pharmacy dispensing regulations.',
  },
  {
    id: 'rule-in-mf500',
    productId: 'prod-metformin-500-er',
    countryCode: 'IN',
    status: 'ELIGIBLE',
    prescriptionRequired: true,
    verificationRequired: false,
    shippingAllowed: true,
    fulfillmentAllowed: true,
    maxSupplyDays: 90,
    reason: 'Domestic fulfillment available under Schedule H regulations.',
  },

  // UK Rules (Review required)
  {
    id: 'rule-gb-all',
    productId: 'prod-atorvastatin-20',
    countryCode: 'GB',
    status: 'REVIEW_REQUIRED',
    prescriptionRequired: true,
    verificationRequired: true,
    shippingAllowed: false,
    fulfillmentAllowed: false,
    maxSupplyDays: 30,
    reason: 'MHRA personal importation clearance required prior to dispatch.',
  },
];

/**
 * Resolve Destination Information
 */
export function getDestinationInfo(countryCode: string, jurisdictionCode?: string): DestinationInfo {
  const normalizedCountry = (countryCode || 'US').toUpperCase().trim();
  const country = APPROVED_COUNTRIES.find((c) => c.code === normalizedCountry) || {
    code: normalizedCountry,
    name: normalizedCountry === 'US' ? 'United States' : normalizedCountry === 'IN' ? 'India' : normalizedCountry,
    currency: normalizedCountry === 'IN' ? 'INR' : normalizedCountry === 'GB' ? 'GBP' : 'USD',
    phoneCode: '+1',
    isActive: true,
    jurisdictions: [],
  };

  let jurisdictionName: string | undefined;
  if (jurisdictionCode && country.jurisdictions) {
    const jur = country.jurisdictions.find((j) => j.code === jurisdictionCode);
    jurisdictionName = jur?.name;
  }

  const flagEmoji =
    country.code === 'US' ? '🇺🇸' : country.code === 'IN' ? '🇮🇳' : country.code === 'GB' ? '🇬🇧' : country.code === 'CA' ? '🇨🇦' : '🌐';

  return {
    countryCode: country.code,
    countryName: country.name,
    currency: country.currency,
    jurisdictionCode,
    jurisdictionName,
    flagEmoji,
  };
}

/**
 * 11-Step Deterministic Product Eligibility Evaluation Engine
 */
export async function evaluateProductEligibility(
  request: EvaluationRequest
): Promise<ProductEligibilityResult> {
  const destination = getDestinationInfo(
    request.destination.countryCode,
    request.destination.jurisdictionCode
  );
  const checkedAt = new Date().toISOString();

  // 1. Product exists
  const product =
    VERIFIED_PRODUCTS_STORE.find(
      (p) => p.id === request.productId || p.slug === request.productId
    ) || (await getProductBySlug(request.productId));

  if (!product) {
    return {
      eligible: false,
      status: 'NOT_AVAILABLE',
      requiresPrescription: false,
      requiresVerification: false,
      maxSupplyDays: 0,
      destination,
      reason: 'This product was not found in the verified pharmaceutical catalogue.',
      checkedAt,
    };
  }

  // 2. Product is active
  if (!product.isActive) {
    return {
      eligible: false,
      status: 'NOT_AVAILABLE',
      requiresPrescription: false,
      requiresVerification: false,
      maxSupplyDays: 0,
      destination,
      reason: 'This pharmaceutical formulation is currently deactivated.',
      checkedAt,
    };
  }

  // Controlled substance safeguard
  if (product.isControlledSubstance) {
    return {
      eligible: false,
      status: 'DESTINATION_RESTRICTED',
      requiresPrescription: true,
      requiresVerification: true,
      maxSupplyDays: 0,
      destination,
      reason: 'Controlled substances are strictly ineligible for cross-border personal importation.',
      checkedAt,
    };
  }

  // 3. Destination exists & active
  const country = APPROVED_COUNTRIES.find((c) => c.code === destination.countryCode);
  if (!country || !country.isActive) {
    return {
      eligible: false,
      status: 'DESTINATION_RESTRICTED',
      requiresPrescription: false,
      requiresVerification: false,
      maxSupplyDays: 0,
      destination,
      reason: `Shipping to ${destination.countryName} (${destination.countryCode}) is not currently supported.`,
      checkedAt,
    };
  }

  // 4. Product eligibility rule match (Jurisdiction-level override takes precedence over Country-level)
  let matchedRule = APPROVED_ELIGIBILITY_RULES.find(
    (r) =>
      r.productId === product.id &&
      r.countryCode === destination.countryCode &&
      r.jurisdictionCode &&
      r.jurisdictionCode === destination.jurisdictionCode
  );

  if (!matchedRule) {
    matchedRule = APPROVED_ELIGIBILITY_RULES.find(
      (r) => r.productId === product.id && r.countryCode === destination.countryCode
    );
  }

  // Fallback to product shippingEligibility table if no explicit rule configured
  if (!matchedRule) {
    const shippingRecord = product.shippingEligibilities?.find(
      (s) => s.destination.toUpperCase() === destination.countryCode
    );

    if (shippingRecord && shippingRecord.status === 'AVAILABLE') {
      // Permitted under generic product shipping policy
    } else {
      return {
        eligible: false,
        status: 'DESTINATION_RESTRICTED',
        requiresPrescription: product.requiresPrescription,
        requiresVerification: false,
        maxSupplyDays: 0,
        destination,
        reason: shippingRecord?.reason || `No approved cross-border dispensing route for ${destination.countryName}.`,
        checkedAt,
      };
    }
  }

  const status: EligibilityStatus = matchedRule?.status || 'ELIGIBLE';
  const requiresPrescription = matchedRule ? matchedRule.prescriptionRequired : product.requiresPrescription;
  const requiresVerification = matchedRule ? matchedRule.verificationRequired : false;
  const maxSupplyDays = matchedRule?.maxSupplyDays || 90;
  const reason = matchedRule?.reason || null;

  // 5. Regulatory/business restriction
  if (status === 'DESTINATION_RESTRICTED' || status === 'NOT_AVAILABLE') {
    return {
      eligible: false,
      status,
      requiresPrescription,
      requiresVerification,
      maxSupplyDays: 0,
      destination,
      reason: reason || `This product cannot be dispatched to ${destination.countryName}.`,
      ruleId: matchedRule?.id,
      checkedAt,
    };
  }

  if (status === 'REVIEW_REQUIRED') {
    return {
      eligible: false,
      status: 'REVIEW_REQUIRED',
      requiresPrescription,
      requiresVerification: true,
      maxSupplyDays,
      destination,
      reason: reason || `Regulatory review required prior to order authorization for ${destination.countryName}.`,
      ruleId: matchedRule?.id,
      checkedAt,
    };
  }

  // 6. Inventory & stock status
  if (product.stockStatus === 'OUT_OF_STOCK') {
    return {
      eligible: false,
      status: 'OUT_OF_STOCK',
      requiresPrescription,
      requiresVerification,
      maxSupplyDays: 0,
      destination,
      reason: 'Current manufacturing batch is depleted. Restock in progress.',
      ruleId: matchedRule?.id,
      checkedAt,
    };
  }

  // 7. Fulfillment capability
  if (matchedRule && (!matchedRule.shippingAllowed || !matchedRule.fulfillmentAllowed)) {
    return {
      eligible: false,
      status: 'FULFILLMENT_UNAVAILABLE',
      requiresPrescription,
      requiresVerification,
      maxSupplyDays: 0,
      destination,
      reason: 'Carrier fulfillment route temporarily suspended for this product corridor.',
      ruleId: matchedRule?.id,
      checkedAt,
    };
  }

  // 8. Supply limit check (e.g. max 90-day maintenance limit: quantity * packageSize <= maxSupplyDays)
  const quantity = request.quantity || 1;
  const totalDoses = quantity * product.packageSize;
  if (totalDoses > maxSupplyDays) {
    return {
      eligible: false,
      status: 'REVIEW_REQUIRED',
      requiresPrescription,
      requiresVerification,
      maxSupplyDays,
      destination,
      reason: `Quantity exceeds the maximum authorized personal importation limit of ${maxSupplyDays} days supply.`,
      ruleId: matchedRule?.id,
      checkedAt,
    };
  }

  // 9. Prescription status requirement
  if (requiresPrescription) {
    return {
      eligible: true, // Eligible to add to cart, but checkout will enforce prescription verification
      status: 'PRESCRIPTION_REQUIRED',
      requiresPrescription: true,
      requiresVerification,
      maxSupplyDays,
      destination,
      reason,
      ruleId: matchedRule?.id,
      checkedAt,
    };
  }

  // 10. Clean Eligible Result
  return {
    eligible: true,
    status: 'ELIGIBLE',
    requiresPrescription: false,
    requiresVerification,
    maxSupplyDays,
    destination,
    reason,
    ruleId: matchedRule?.id,
    checkedAt,
  };
}

/**
 * Multi-Product Cart Eligibility Aggregator
 */
export async function evaluateCartEligibility(
  cartItems: Array<{ productId: string; quantity: number }>,
  destinationInfo: { countryCode: string; jurisdictionCode?: string }
): Promise<CartEligibilityResult> {
  const destination = getDestinationInfo(destinationInfo.countryCode, destinationInfo.jurisdictionCode);
  const evaluatedItems: CartEligibilityItem[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const item of cartItems) {
    const product =
      VERIFIED_PRODUCTS_STORE.find(
        (p) => p.id === item.productId || p.slug === item.productId
      ) || (await getProductBySlug(item.productId));

    const result = await evaluateProductEligibility({
      productId: item.productId,
      destination: {
        countryCode: destination.countryCode,
        jurisdictionCode: destination.jurisdictionCode,
      },
      quantity: item.quantity,
    });

    const sku = product?.sku || 'SKU-PENDING';
    const name = product?.name || 'Unknown Medicine';

    evaluatedItems.push({
      productId: item.productId,
      sku,
      name,
      quantity: item.quantity,
      result,
    });

    if (!result.eligible) {
      blockers.push(`${name}: ${result.reason || result.status}`);
    } else if (result.requiresPrescription) {
      warnings.push(`${name} requires physician prescription verification.`);
    } else if (result.requiresVerification) {
      warnings.push(`${name} requires customer identity verification.`);
    }
  }

  const isPurchasable = blockers.length === 0;
  const overallStatus = !isPurchasable
    ? 'BLOCKED'
    : warnings.length > 0
    ? 'ACTION_REQUIRED'
    : 'READY';

  const requiresPrescription = evaluatedItems.some((i) => i.result.requiresPrescription);
  const requiresVerification = evaluatedItems.some((i) => i.result.requiresVerification);

  return {
    overallStatus,
    isPurchasable,
    requiresPrescription,
    requiresVerification,
    destination,
    items: evaluatedItems,
    blockers,
    warnings,
    blockersCount: blockers.length,
    warningsCount: warnings.length,
  };
}
