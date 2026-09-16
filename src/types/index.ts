/**
 * ==============================================================================
 * INDOPHARM — CORE SHARED TYPES & DOMAIN INTERFACES
 * ==============================================================================
 */

export type UserRole =
  | 'PATIENT'
  | 'CLINICAL_PHARMACIST'
  | 'OPS_WAREHOUSE'
  | 'COMPLIANCE_ADMIN'
  | 'SUPPORT_AGENT';

export type PrescriptionStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'EXPIRED';

export type OrderStatus =
  | 'PENDING_PRESCRIPTION'
  | 'UNDER_CLINICAL_REVIEW'
  | 'CONFIRMED_PICKING'
  | 'EXPORT_CUSTOMS'
  | 'IN_TRANSIT_AIR'
  | 'US_CUSTOMS_CLEARANCE'
  | 'DOMESTIC_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type ShipmentStage =
  | 'INDIA_BONDED_HUB'
  | 'INDIA_EXPORT_CUSTOMS'
  | 'INTERNATIONAL_AIR_TRANSIT'
  | 'US_PORT_OF_ENTRY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface Manufacturer {
  id: string;
  name: string;
  cdscoLicenseNumber: string;
  usFdaRegistrationNumber?: string | null;
  facilityCity: string;
  facilityState: string;
  whoGmpCertified: boolean;
  verifiedAt: Date;
}

export interface BatchCertificate {
  id: string;
  productId: string;
  lotNumber: string;
  manufactureDate: string;
  expirationDate: string;
  purityPercentage: number;
  coaDocumentUrl: string;
  releasedByQcOfficer: string;
}

export interface Product {
  id: string;
  name: string;
  brandReferenceName: string;
  slug: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  packageSize: number;
  ndcEquivalent?: string | null;
  description: string;
  storageConditions: string;
  fobPriceUsd: number;
  retailPriceUsd: number;
  usAverageCashPrice: number;
  isControlledSubstance: boolean;
  requiresPrescription: boolean;
  manufacturer: Manufacturer;
  batch?: BatchCertificate;
}

export interface LandedCostBreakdown {
  fobPriceUsd: number;
  internationalAirFreightUsd: number;
  customsHandlingUsd: number;
  pharmacistDispensingFeeUsd: number;
  totalPatientPriceUsd: number;
  usRetailBenchmarkUsd: number;
  totalSavingsUsd: number;
  savingsPercentage: number;
}
