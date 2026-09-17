/**
 * ==============================================================================
 * INDOPHARM — ELIGIBILITY DOMAIN ENTITIES & CONTRACTS
 * ==============================================================================
 * Defines the core types and result contracts for the destination-aware
 * regulatory and clinical eligibility engine.
 * ==============================================================================
 */

export type EligibilityStatus =
  | 'ELIGIBLE'
  | 'REVIEW_REQUIRED'
  | 'PRESCRIPTION_REQUIRED'
  | 'VERIFICATION_REQUIRED'
  | 'DESTINATION_RESTRICTED'
  | 'OUT_OF_STOCK'
  | 'FULFILLMENT_UNAVAILABLE'
  | 'NOT_AVAILABLE'
  | 'PAYMENT_RESTRICTED'
  | 'UNKNOWN';

export interface DestinationInfo {
  countryCode: string; // e.g. "US", "IN"
  countryName: string; // e.g. "United States", "India"
  currency: string;    // e.g. "USD", "INR"
  jurisdictionCode?: string; // e.g. "US-CA", "US-NY"
  jurisdictionName?: string; // e.g. "California", "New York"
  flagEmoji?: string;  // e.g. "🇺🇸"
}

export interface EvaluationRequest {
  productId: string;
  destination: {
    countryCode: string;
    jurisdictionCode?: string;
  };
  customerId?: string;
  quantity?: number;
}

export interface ProductEligibilityResult {
  eligible: boolean;
  status: EligibilityStatus;
  requiresPrescription: boolean;
  requiresVerification: boolean;
  maxSupplyDays: number;
  destination: DestinationInfo;
  reason: string | null;
  ruleId?: string;
  checkedAt: string;
}

export interface CartEligibilityItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  result: ProductEligibilityResult;
}

export interface CartEligibilityResult {
  overallStatus: 'READY' | 'ACTION_REQUIRED' | 'BLOCKED';
  isPurchasable: boolean;
  requiresPrescription: boolean;
  requiresVerification: boolean;
  destination: DestinationInfo;
  items: CartEligibilityItem[];
  blockers: string[];
  warnings: string[];
  blockersCount: number;
  warningsCount: number;
}
