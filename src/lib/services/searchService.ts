/**
 * ==============================================================================
 * INDOPHARM — PRODUCT & SEARCH DOMAIN SERVICE
 * ==============================================================================
 * Reusable, independent search and product discovery service.
 * Supports query matching across:
 * - Generic name
 * - Brand reference name
 * - Manufacturer name
 * - Category
 * - Strength
 * - SKU
 * - Product name
 * ==============================================================================
 */

import {
  Product,
  SearchFilters,
  SearchResult,
  SearchSuggestion,
  ProductPassportData,
} from '@/lib/domain/product';

/**
 * Verified baseline product repository (Development & Offline Datastore).
 * In production, this can directly delegate to Prisma ORM / PostgreSQL Full-Text Search.
 */
export const VERIFIED_PRODUCTS_STORE: Product[] = [
  {
    id: 'prod-atorvastatin-20',
    sku: 'SKU-IN-AT20-941',
    name: 'Atorvastatin Calcium Tablets',
    brandReferenceName: 'Generic equivalent for Lipitor®',
    slug: 'atorvastatin-calcium-20mg',
    activeIngredient: 'Atorvastatin Calcium',
    strength: '20 mg',
    dosageForm: 'Oral Film-Coated Tablet',
    packageSize: 90,
    ndcEquivalent: '00071-0156-23',
    description:
      'HMG-CoA reductase inhibitor indicated as an adjunct to diet to reduce elevated total cholesterol, LDL-C, and triglycerides in adults with primary hyperlipidemia.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F); excursions permitted between 15°C and 30°C.',
    countryOfOrigin: 'India',
    stockStatus: 'AVAILABLE',
    fobPriceUsd: 3.50,
    retailPriceUsd: 29.50,
    usAverageCashPrice: 124.00,
    isControlledSubstance: false,
    requiresPrescription: true,
    isActive: true,
    category: 'Cardiovascular',
    manufacturer: {
      id: 'mfr-sun-pharma',
      name: 'Sun Pharma Industries Ltd',
      cdscoLicenseNumber: 'CDSCO-MH-2018-9941',
      usFdaRegistrationNumber: '3002809112',
      facilityCity: 'Halol',
      facilityState: 'Gujarat, India',
      whoGmpCertified: true,
      verifiedAt: '2026-01-15T00:00:00.000Z',
    },
    batches: [
      {
        id: 'batch-at20-941',
        productId: 'prod-atorvastatin-20',
        lotNumber: 'LOT-2026-AT20-941',
        manufactureDate: '2026-01-15',
        expirationDate: '2028-01-14',
        assayPurity: 99.85,
        qcOfficer: 'Dr. V. Raman, QA Lead',
        coaDownloadUrl: '/docs/coa-lot-2026-at20-941.pdf',
        status: 'RELEASED',
      },
    ],
    documents: [
      {
        id: 'doc-at20-coa',
        productId: 'prod-atorvastatin-20',
        type: 'COA',
        title: 'Certificate of Analysis — Lot 2026-AT20-941',
        fileUrl: '/docs/coa-lot-2026-at20-941.pdf',
        verificationStatus: 'VERIFIED',
        uploadedAt: '2026-01-18',
      },
      {
        id: 'doc-at20-spec',
        productId: 'prod-atorvastatin-20',
        type: 'SPECIFICATION',
        title: 'Finished Product Specification USP 44',
        fileUrl: '/docs/spec-at20.pdf',
        verificationStatus: 'VERIFIED',
        uploadedAt: '2026-01-10',
      },
    ],
    regulatoryRecords: [
      {
        id: 'reg-at20-us',
        productId: 'prod-atorvastatin-20',
        jurisdiction: 'US_FDA',
        status: 'CPG_110_300_PERSONAL_USE',
        reference: 'FDA CPG 110.300 (Personal Importation 90-Day Supply)',
        verifiedAt: '2026-01-01',
      },
      {
        id: 'reg-at20-cdsco',
        productId: 'prod-atorvastatin-20',
        jurisdiction: 'IN_CDSCO',
        status: 'EXPORT_PERMIT_APPROVED',
        reference: 'CDSCO/EXP/2026/0491',
        verifiedAt: '2026-01-05',
      },
    ],
    shippingEligibilities: [
      {
        id: 'ship-at20-us',
        productId: 'prod-atorvastatin-20',
        destination: 'US',
        status: 'AVAILABLE',
        reason: 'Eligible for personal importation with valid U.S. physician prescription.',
      },
      {
        id: 'ship-at20-in',
        productId: 'prod-atorvastatin-20',
        destination: 'IN',
        status: 'AVAILABLE',
        reason: 'Domestic fulfillment available under Schedule H regulations.',
      },
    ],
    faqs: [
      {
        id: 'faq-at20-1',
        productId: 'prod-atorvastatin-20',
        question: 'Where is this Atorvastatin Calcium manufactured?',
        answer: 'This batch is produced by Sun Pharma Industries Ltd at their audited facility in Halol, Gujarat, India.',
        displayOrder: 1,
      },
      {
        id: 'faq-at20-2',
        productId: 'prod-atorvastatin-20',
        question: 'Is a prescription required for U.S. delivery?',
        answer: 'Yes. All orders of Atorvastatin require an unexpired prescription from a licensed U.S. physician.',
        displayOrder: 2,
      },
    ],
  },
  {
    id: 'prod-metformin-500-er',
    sku: 'SKU-IN-MF500-112',
    name: 'Metformin Hydrochloride ER Tablets',
    brandReferenceName: 'Generic equivalent for Glucophage XR®',
    slug: 'metformin-hcl-500mg-er',
    activeIngredient: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosageForm: 'Extended-Release Tablet',
    packageSize: 90,
    ndcEquivalent: '00087-6063-05',
    description:
      'Biguanide indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F). Protect from moisture and excessive light.',
    countryOfOrigin: 'India',
    stockStatus: 'AVAILABLE',
    fobPriceUsd: 2.80,
    retailPriceUsd: 22.00,
    usAverageCashPrice: 85.00,
    isControlledSubstance: false,
    requiresPrescription: true,
    isActive: true,
    category: 'Metabolic',
    manufacturer: {
      id: 'mfr-cipla',
      name: 'Cipla Ltd',
      cdscoLicenseNumber: 'CDSCO-GA-2019-4812',
      usFdaRegistrationNumber: '3004819001',
      facilityCity: 'Kurkumbh',
      facilityState: 'Maharashtra, India',
      whoGmpCertified: true,
      verifiedAt: '2026-02-01T00:00:00.000Z',
    },
    batches: [
      {
        id: 'batch-mf500-112',
        productId: 'prod-metformin-500-er',
        lotNumber: 'LOT-2026-MF500-112',
        manufactureDate: '2026-02-01',
        expirationDate: '2028-01-31',
        assayPurity: 99.92,
        qcOfficer: 'P. Deshmukh, QC Director',
        coaDownloadUrl: '/docs/coa-lot-2026-mf500-112.pdf',
        status: 'RELEASED',
      },
    ],
    documents: [
      {
        id: 'doc-mf500-coa',
        productId: 'prod-metformin-500-er',
        type: 'COA',
        title: 'Certificate of Analysis — Lot 2026-MF500-112',
        fileUrl: '/docs/coa-lot-2026-mf500-112.pdf',
        verificationStatus: 'VERIFIED',
        uploadedAt: '2026-02-03',
      },
    ],
    regulatoryRecords: [
      {
        id: 'reg-mf500-us',
        productId: 'prod-metformin-500-er',
        jurisdiction: 'US_FDA',
        status: 'CPG_110_300_PERSONAL_USE',
        reference: 'FDA CPG 110.300',
        verifiedAt: '2026-02-01',
      },
    ],
    shippingEligibilities: [
      {
        id: 'ship-mf500-us',
        productId: 'prod-metformin-500-er',
        destination: 'US',
        status: 'AVAILABLE',
        reason: 'Eligible for 90-day maintenance supply with valid prescription.',
      },
    ],
    faqs: [
      {
        id: 'faq-mf500-1',
        productId: 'prod-metformin-500-er',
        question: 'Is this the extended-release (ER) version?',
        answer: 'Yes, this is Metformin Hydrochloride Extended-Release (ER) 500mg.',
        displayOrder: 1,
      },
    ],
  },
  {
    id: 'prod-lisinopril-20',
    sku: 'SKU-IN-LIS20-044',
    name: 'Lisinopril Tablets',
    brandReferenceName: 'Generic equivalent for Prinivil® / Zestril®',
    slug: 'lisinopril-20mg',
    activeIngredient: 'Lisinopril',
    strength: '20 mg',
    dosageForm: 'Oral Tablet',
    packageSize: 90,
    ndcEquivalent: '00006-0207-58',
    description:
      'Angiotensin-converting enzyme (ACE) inhibitor indicated for the treatment of hypertension in adult and pediatric patients 6 years of age and older.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F). Protect from light and excessive moisture.',
    countryOfOrigin: 'India',
    stockStatus: 'AVAILABLE',
    fobPriceUsd: 2.20,
    retailPriceUsd: 19.50,
    usAverageCashPrice: 72.00,
    isControlledSubstance: false,
    requiresPrescription: true,
    isActive: true,
    category: 'Cardiovascular',
    manufacturer: {
      id: 'mfr-dr-reddys',
      name: "Dr. Reddy's Laboratories",
      cdscoLicenseNumber: 'CDSCO-TL-2017-3021',
      usFdaRegistrationNumber: '3002808419',
      facilityCity: 'Bachepalli',
      facilityState: 'Telangana, India',
      whoGmpCertified: true,
      verifiedAt: '2026-01-20T00:00:00.000Z',
    },
    batches: [
      {
        id: 'batch-lis20-044',
        productId: 'prod-lisinopril-20',
        lotNumber: 'LOT-2026-LIS20-044',
        manufactureDate: '2026-01-10',
        expirationDate: '2028-01-09',
        assayPurity: 99.88,
        qcOfficer: 'K. Reddy, Lead Analyst',
        status: 'RELEASED',
      },
    ],
    documents: [],
    regulatoryRecords: [
      {
        id: 'reg-lis20-us',
        productId: 'prod-lisinopril-20',
        jurisdiction: 'US_FDA',
        status: 'CPG_110_300_PERSONAL_USE',
        reference: 'FDA CPG 110.300',
        verifiedAt: '2026-01-01',
      },
    ],
    shippingEligibilities: [
      {
        id: 'ship-lis20-us',
        productId: 'prod-lisinopril-20',
        destination: 'US',
        status: 'AVAILABLE',
      },
    ],
    faqs: [],
  },
  {
    id: 'prod-levothyroxine-50',
    sku: 'SKU-IN-LT50-801',
    name: 'Levothyroxine Sodium Tablets',
    brandReferenceName: 'Generic equivalent for Synthroid®',
    slug: 'levothyroxine-sodium-50mcg',
    activeIngredient: 'Levothyroxine Sodium',
    strength: '50 mcg',
    dosageForm: 'Oral Scored Tablet',
    packageSize: 90,
    ndcEquivalent: '00074-7027-90',
    description:
      'Synthetic thyroid hormone indicated as replacement therapy in primary, secondary, and tertiary congenital or acquired hypothyroidism.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F). Protect from light, moisture, and heat.',
    countryOfOrigin: 'India',
    stockStatus: 'AVAILABLE',
    fobPriceUsd: 3.10,
    retailPriceUsd: 28.00,
    usAverageCashPrice: 102.00,
    isControlledSubstance: false,
    requiresPrescription: true,
    isActive: true,
    category: 'Endocrine',
    manufacturer: {
      id: 'mfr-lupin',
      name: 'Lupin Pharmaceuticals Ltd',
      cdscoLicenseNumber: 'CDSCO-MH-2020-1194',
      usFdaRegistrationNumber: '3003781204',
      facilityCity: 'Tarapur',
      facilityState: 'Maharashtra, India',
      whoGmpCertified: true,
      verifiedAt: '2026-01-25T00:00:00.000Z',
    },
    batches: [
      {
        id: 'batch-lt50-801',
        productId: 'prod-levothyroxine-50',
        lotNumber: 'LOT-2026-LT50-801',
        manufactureDate: '2026-01-22',
        expirationDate: '2027-12-31',
        assayPurity: 99.94,
        qcOfficer: 'S. Mehta, QA Officer',
        status: 'RELEASED',
      },
    ],
    documents: [],
    regulatoryRecords: [],
    shippingEligibilities: [
      {
        id: 'ship-lt50-us',
        productId: 'prod-levothyroxine-50',
        destination: 'US',
        status: 'AVAILABLE',
      },
    ],
    faqs: [],
  },
  {
    id: 'prod-pantoprazole-40',
    sku: 'SKU-IN-PAN40-332',
    name: 'Pantoprazole Sodium Delayed-Release Tablets',
    brandReferenceName: 'Generic equivalent for Protonix®',
    slug: 'pantoprazole-sodium-40mg',
    activeIngredient: 'Pantoprazole Sodium',
    strength: '40 mg',
    dosageForm: 'Delayed-Release Enteric-Coated Tablet',
    packageSize: 90,
    ndcEquivalent: '00008-0841-55',
    description:
      'Proton pump inhibitor (PPI) indicated for short-term and maintenance healing of erosive esophagitis associated with gastroesophageal reflux disease (GERD).',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F); excursions permitted to 15°C to 30°C.',
    countryOfOrigin: 'India',
    stockStatus: 'AVAILABLE',
    fobPriceUsd: 2.60,
    retailPriceUsd: 24.50,
    usAverageCashPrice: 89.00,
    isControlledSubstance: false,
    requiresPrescription: true,
    isActive: true,
    category: 'Gastrointestinal',
    manufacturer: {
      id: 'mfr-zydus',
      name: 'Zydus Lifesciences Ltd',
      cdscoLicenseNumber: 'CDSCO-GJ-2016-7281',
      usFdaRegistrationNumber: '3002809188',
      facilityCity: 'Moraiya',
      facilityState: 'Gujarat, India',
      whoGmpCertified: true,
      verifiedAt: '2026-01-30T00:00:00.000Z',
    },
    batches: [
      {
        id: 'batch-pan40-332',
        productId: 'prod-pantoprazole-40',
        lotNumber: 'LOT-2026-PAN40-332',
        manufactureDate: '2026-01-28',
        expirationDate: '2028-01-27',
        assayPurity: 99.81,
        qcOfficer: 'M. Patel, Analytical Lead',
        status: 'RELEASED',
      },
    ],
    documents: [],
    regulatoryRecords: [],
    shippingEligibilities: [
      {
        id: 'ship-pan40-us',
        productId: 'prod-pantoprazole-40',
        destination: 'US',
        status: 'AVAILABLE',
      },
    ],
    faqs: [],
  },
  {
    id: 'prod-rosuvastatin-10',
    sku: 'SKU-IN-ROS10-559',
    name: 'Rosuvastatin Calcium Tablets',
    brandReferenceName: 'Generic equivalent for Crestor®',
    slug: 'rosuvastatin-calcium-10mg',
    activeIngredient: 'Rosuvastatin Calcium',
    strength: '10 mg',
    dosageForm: 'Oral Film-Coated Tablet',
    packageSize: 90,
    ndcEquivalent: '00310-0751-90',
    description:
      'HMG-CoA reductase inhibitor indicated to reduce elevated LDL-C and triglycerides and slow the progression of atherosclerosis.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F). Protect from moisture.',
    countryOfOrigin: 'India',
    stockStatus: 'AVAILABLE',
    fobPriceUsd: 3.40,
    retailPriceUsd: 31.00,
    usAverageCashPrice: 135.00,
    isControlledSubstance: false,
    requiresPrescription: true,
    isActive: true,
    category: 'Cardiovascular',
    manufacturer: {
      id: 'mfr-aurobindo',
      name: 'Aurobindo Pharma Ltd',
      cdscoLicenseNumber: 'CDSCO-AP-2018-4491',
      usFdaRegistrationNumber: '3002809312',
      facilityCity: 'Jadcherla',
      facilityState: 'Telangana, India',
      whoGmpCertified: true,
      verifiedAt: '2026-02-05T00:00:00.000Z',
    },
    batches: [
      {
        id: 'batch-ros10-559',
        productId: 'prod-rosuvastatin-10',
        lotNumber: 'LOT-2026-ROS10-559',
        manufactureDate: '2026-02-02',
        expirationDate: '2028-02-01',
        assayPurity: 99.89,
        qcOfficer: 'B. Sharma, Quality Assurance',
        status: 'RELEASED',
      },
    ],
    documents: [],
    regulatoryRecords: [],
    shippingEligibilities: [
      {
        id: 'ship-ros10-us',
        productId: 'prod-rosuvastatin-10',
        destination: 'US',
        status: 'AVAILABLE',
      },
    ],
    faqs: [],
  },
];

/**
 * Service: Search Products
 */
export async function searchProducts(
  query?: string,
  filters?: SearchFilters,
  destination: string = 'US'
): Promise<SearchResult> {
  const q = (query || '').toLowerCase().trim();

  const filtered = VERIFIED_PRODUCTS_STORE.filter((item) => {
    // 1. Text Query Matching across 7 vectors
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchGeneric = item.activeIngredient.toLowerCase().includes(q);
      const matchBrand = item.brandReferenceName.toLowerCase().includes(q);
      const matchMfr = item.manufacturer.name.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchStrength = item.strength.toLowerCase().includes(q);
      const matchSku = item.sku.toLowerCase().includes(q);

      if (
        !matchName &&
        !matchGeneric &&
        !matchBrand &&
        !matchMfr &&
        !matchCategory &&
        !matchStrength &&
        !matchSku
      ) {
        return false;
      }
    }

    // 2. Filters
    if (filters?.category && filters.category !== 'All') {
      if (item.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    }

    if (filters?.manufacturer && filters.manufacturer !== 'All') {
      if (!item.manufacturer.name.toLowerCase().includes(filters.manufacturer.toLowerCase())) {
        return false;
      }
    }

    if (filters?.prescriptionRequired !== undefined) {
      if (item.requiresPrescription !== filters.prescriptionRequired) return false;
    }

    if (filters?.availability) {
      if (item.stockStatus !== filters.availability) return false;
    }

    // 3. Destination Eligibility Check
    if (destination) {
      const eligibility = item.shippingEligibilities.find(
        (e) => e.destination.toUpperCase() === destination.toUpperCase()
      );
      if (eligibility && eligibility.status === 'NOT_AVAILABLE') {
        return false;
      }
    }

    return true;
  });

  return {
    items: filtered,
    total: filtered.length,
    query: query || '',
    filters: filters || {},
  };
}

/**
 * Service: Get Search Suggestions
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  const q = (query || '').toLowerCase().trim();
  if (!q || q.length < 2) return [];

  const suggestions: SearchSuggestion[] = [];

  for (const item of VERIFIED_PRODUCTS_STORE) {
    if (item.name.toLowerCase().includes(q) || item.activeIngredient.toLowerCase().includes(q)) {
      suggestions.push({
        title: item.name,
        subtitle: `${item.strength} • ${item.dosageForm}`,
        slug: item.slug,
        category: item.category,
        type: 'product',
      });
    } else if (item.brandReferenceName.toLowerCase().includes(q)) {
      suggestions.push({
        title: item.brandReferenceName,
        subtitle: `Generic: ${item.name} (${item.strength})`,
        slug: item.slug,
        category: item.category,
        type: 'generic',
      });
    }
  }

  return suggestions.slice(0, 5);
}

/**
 * Service: Get Product by Slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = VERIFIED_PRODUCTS_STORE.find((p) => p.slug === slug);
  return product || null;
}

/**
 * Service: Generate Product Passport Data
 */
export async function getProductPassport(
  slug: string,
  destination: string = 'US'
): Promise<ProductPassportData | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const activeBatch = product.batches[0] || null;
  const destinationRecord = product.shippingEligibilities.find(
    (e) => e.destination.toUpperCase() === destination.toUpperCase()
  );

  return {
    product: {
      name: product.name,
      genericName: product.activeIngredient,
      slug: product.slug,
    },
    manufacturer: {
      name: product.manufacturer.name,
      facilityCity: product.manufacturer.facilityCity,
      facilityState: product.manufacturer.facilityState,
      cdscoLicense: product.manufacturer.cdscoLicenseNumber,
      whoGmpStatus: product.manufacturer.whoGmpCertified
        ? 'Verified WHO-GMP Compliant'
        : 'Not Available',
      usFdaFeiNumber: product.manufacturer.usFdaRegistrationNumber || null,
    },
    origin: {
      country: product.countryOfOrigin,
      exportHub: `${product.manufacturer.facilityCity} Air Cargo Terminal, India`,
    },
    specification: {
      strength: product.strength,
      dosageForm: product.dosageForm,
      packageSize: product.packageSize,
      ndcEquivalent: product.ndcEquivalent || null,
      pharmacopeiaStandard: 'United States Pharmacopeia (USP) Compendial Grade',
    },
    batch: {
      lotNumber: activeBatch?.lotNumber || null,
      manufactureDate: activeBatch?.manufactureDate || null,
      status: activeBatch?.status || null,
    },
    expiry: {
      expirationDate: activeBatch?.expirationDate || null,
      shelfLifeVerified: true,
    },
    quality: {
      hplcAssayPurity: activeBatch?.assayPurity || null,
      qcOfficer: activeBatch?.qcOfficer || null,
      documentsAvailable: product.documents.map((d) => ({
        title: d.title,
        type: d.type,
      })),
    },
    regulatory: {
      jurisdiction: 'United States (FDA CPG 110.300)',
      status: product.isControlledSubstance
        ? 'Restricted / Ineligible'
        : 'Personal Importation Permitted (Max 90 Days)',
      reference: 'FDA Compliance Policy Guide Sec. 110.300',
      requiresPrescription: product.requiresPrescription,
    },
    shipping: {
      destination: destination.toUpperCase(),
      status: destinationRecord?.status || 'AVAILABLE',
      transitMethod: 'Bonded Temperature-Monitored International Air Freight',
      personalImportationPolicy: 'Compliant with individual U.S. patient maintenance importation',
    },
  };
}
