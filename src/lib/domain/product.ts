/**
 * ==============================================================================
 * INDOPHARM — DOMAIN MODEL & PHARMACEUTICAL ENTITY CONTRACTS
 * ==============================================================================
 * High-integrity TypeScript interfaces defining core product, manufacturing,
 * quality provenance, and search entities.
 * ==============================================================================
 */

export type ProductAvailabilityState =
  | 'AVAILABLE'
  | 'PRESCRIPTION_REQUIRED'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'REGULATORY_REVIEW'
  | 'NOT_ELIGIBLE'
  | 'DESTINATION_RESTRICTED';

export type ProductClassification =
  | 'OTC'
  | 'PRESCRIPTION'
  | 'SUPPLEMENT_OTHER'
  | 'RESTRICTED_NOT_ELIGIBLE'
  | 'UNVERIFIED';

export type DocumentType =
  | 'COA'
  | 'SPECIFICATION'
  | 'MANUFACTURER_LICENSE'
  | 'PACKAGING_INSERT'
  | 'REGULATORY';

export interface ProductDocument {
  id: string;
  productId: string;
  type: DocumentType;
  title: string;
  fileUrl: string;
  verificationStatus: 'VERIFIED' | 'PENDING_AUDIT' | 'UNVERIFIED';
  uploadedAt: string;
}

export interface ProductBatch {
  id: string;
  productId: string;
  lotNumber: string;
  manufactureDate: string;
  expirationDate: string;
  assayPurity: number; // e.g. 99.85
  qcOfficer: string;
  coaDownloadUrl?: string;
  status: 'RELEASED' | 'QUARANTINED' | 'DEPLETED';
}

export interface RegulatoryRecord {
  id: string;
  productId: string;
  jurisdiction: string; // e.g. "US_FDA", "IN_CDSCO", "UK_MHRA"
  status: string; // e.g. "CPG_110_300_PERSONAL_USE", "EXPORT_CLEARED"
  reference: string; // Statutory citation or license ID
  verifiedAt: string;
  expiresAt?: string;
}

export interface ShippingEligibility {
  id: string;
  productId: string;
  destination: string; // "US", "IN", "CA", etc.
  status: 'AVAILABLE' | 'RESTRICTED' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE';
  reason?: string;
}

export interface ProductFAQ {
  id: string;
  productId: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface Manufacturer {
  id: string;
  name: string;
  cdscoLicenseNumber: string;
  usFdaRegistrationNumber?: string;
  facilityCity: string;
  facilityState: string;
  whoGmpCertified: boolean;
  verifiedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brandReferenceName: string;
  slug: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  packageSize: number; // e.g. 90
  ndcEquivalent?: string;
  description: string;
  storageConditions: string;
  countryOfOrigin: string; // e.g. "India"
  stockStatus: ProductAvailabilityState;
  
  // Pricing
  fobPriceUsd: number;
  retailPriceUsd: number;
  usAverageCashPrice: number;

  // Regulatory flags
  isControlledSubstance: boolean;
  requiresPrescription: boolean;
  isActive: boolean;

  // Relations
  category: string;
  manufacturer: Manufacturer;
  batches: ProductBatch[];
  documents: ProductDocument[];
  regulatoryRecords: RegulatoryRecord[];
  shippingEligibilities: ShippingEligibility[];
  faqs: ProductFAQ[];
}

export interface SearchFilters {
  category?: string;
  manufacturer?: string;
  strength?: string;
  dosageForm?: string;
  prescriptionRequired?: boolean;
  availability?: ProductAvailabilityState;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchResult {
  items: Product[];
  total: number;
  query: string;
  filters: SearchFilters;
}

export interface SearchSuggestion {
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  type: 'product' | 'category' | 'generic';
}

/**
 * 9-Stage Product Passport Payload
 */
export interface ProductPassportData {
  product: {
    name: string;
    genericName: string;
    slug: string;
  };
  manufacturer: {
    name: string;
    facilityCity: string;
    facilityState: string;
    cdscoLicense: string;
    whoGmpStatus: string;
    usFdaFeiNumber: string | null;
  };
  origin: {
    country: string;
    exportHub: string;
  };
  specification: {
    strength: string;
    dosageForm: string;
    packageSize: number;
    ndcEquivalent: string | null;
    pharmacopeiaStandard: string;
  };
  batch: {
    lotNumber: string | null;
    manufactureDate: string | null;
    status: string | null;
  };
  expiry: {
    expirationDate: string | null;
    shelfLifeVerified: boolean;
  };
  quality: {
    hplcAssayPurity: number | null;
    qcOfficer: string | null;
    documentsAvailable: Array<{ title: string; type: string }>;
  };
  regulatory: {
    jurisdiction: string;
    status: string;
    reference: string;
    requiresPrescription: boolean;
  };
  shipping: {
    destination: string;
    status: string;
    transitMethod: string;
    personalImportationPolicy: string;
  };
}
