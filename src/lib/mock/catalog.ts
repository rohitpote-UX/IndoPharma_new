/**
 * ==============================================================================
 * INDOPHARM — MOCK CATALOG FIXTURES (MOCK ONLY / DEVELOPMENT TESTBED)
 * ==============================================================================
 * NOTICE:
 * All data in this file constitutes synthetic test fixtures for local testing
 * and UI demonstration purposes.
 *
 * NO CLINICAL CLAIMS, NO FABRICATED FDA BADGES, AND NO ACTUAL PATIENT DATA
 * ARE CONTAINED HEREIN.
 * ==============================================================================
 */

export type ProductClassification =
  | 'OTC'
  | 'PRESCRIPTION'
  | 'SUPPLEMENT_OTHER'
  | 'RESTRICTED_NOT_ELIGIBLE'
  | 'UNVERIFIED';

export type RegulatoryMatrixStatus =
  | 'AVAILABLE'
  | 'REVIEW_REQUIRED'
  | 'RESTRICTED'
  | 'NOT_AVAILABLE'
  | 'NOT_VERIFIED';

export interface CatalogProduct {
  id: string;
  name: string;
  brandReferenceName: string;
  slug: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  packageSize: number; // e.g. 90 tablets (standard 3-month maintenance)
  ndcEquivalent?: string;
  classification: ProductClassification;
  regulatoryStatus: RegulatoryMatrixStatus;
  category: 'Cardiovascular' | 'Metabolic' | 'Endocrine' | 'Gastrointestinal';
  fobPriceUsd: number;
  retailPriceUsd: number;
  usAverageCashPrice: number;
  manufacturer: {
    name: string;
    facilityCity: string;
    facilityState: string;
    cdscoLicense: string;
    usFdaFeiNumber?: string;
    whoGmpStatus: 'VERIFIED_AUDIT';
  };
  batch: {
    lotNumber: string;
    manufactureDate: string;
    expirationDate: string;
    assayPurity: number; // e.g. 99.85%
    qcOfficer: string;
    coaDownloadUrl: string;
  };
  description: string;
  storageConditions: string;
}

export const MOCK_CATALOG: CatalogProduct[] = [
  {
    id: 'prod-atorvastatin-20',
    name: 'Atorvastatin Calcium Tablets',
    brandReferenceName: 'Generic equivalent for Lipitor®',
    slug: 'atorvastatin-calcium-20mg',
    activeIngredient: 'Atorvastatin Calcium',
    strength: '20 mg',
    dosageForm: 'Oral Film-Coated Tablet',
    packageSize: 90,
    ndcEquivalent: '00071-0156-23',
    classification: 'PRESCRIPTION',
    regulatoryStatus: 'AVAILABLE',
    category: 'Cardiovascular',
    fobPriceUsd: 3.50,
    retailPriceUsd: 29.50,
    usAverageCashPrice: 124.00,
    manufacturer: {
      name: 'Sun Pharma Industries Ltd',
      facilityCity: 'Halol',
      facilityState: 'Gujarat, India',
      cdscoLicense: 'CDSCO-MH-2018-9941',
      usFdaFeiNumber: '3002809112',
      whoGmpStatus: 'VERIFIED_AUDIT',
    },
    batch: {
      lotNumber: 'LOT-2026-AT20-941',
      manufactureDate: '2026-01-15',
      expirationDate: '2028-01-14',
      assayPurity: 99.85,
      qcOfficer: 'Dr. V. Raman, QA Lead',
      coaDownloadUrl: '#coa-lot-2026-at20-941',
    },
    description:
      'HMG-CoA reductase inhibitor indicated as an adjunct to diet to reduce elevated total cholesterol, LDL-C, and triglycerides in adults.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F); excursions permitted between 15°C and 30°C.',
  },
  {
    id: 'prod-metformin-500-er',
    name: 'Metformin Hydrochloride ER Tablets',
    brandReferenceName: 'Generic equivalent for Glucophage XR®',
    slug: 'metformin-hcl-500mg-er',
    activeIngredient: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosageForm: 'Extended-Release Tablet',
    packageSize: 90,
    ndcEquivalent: '00087-6063-05',
    classification: 'PRESCRIPTION',
    regulatoryStatus: 'AVAILABLE',
    category: 'Metabolic',
    fobPriceUsd: 2.80,
    retailPriceUsd: 22.00,
    usAverageCashPrice: 85.00,
    manufacturer: {
      name: 'Cipla Ltd',
      facilityCity: 'Kurkumbh',
      facilityState: 'Maharashtra, India',
      cdscoLicense: 'CDSCO-GA-2019-4812',
      usFdaFeiNumber: '3004819001',
      whoGmpStatus: 'VERIFIED_AUDIT',
    },
    batch: {
      lotNumber: 'LOT-2026-MF500-112',
      manufactureDate: '2026-02-01',
      expirationDate: '2028-01-31',
      assayPurity: 99.92,
      qcOfficer: 'P. Deshmukh, QC Director',
      coaDownloadUrl: '#coa-lot-2026-mf500-112',
    },
    description:
      'Biguanide indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F). Protect from light and moisture.',
  },
  {
    id: 'prod-lisinopril-20',
    name: 'Lisinopril Tablets',
    brandReferenceName: 'Generic equivalent for Prinivil® / Zestril®',
    slug: 'lisinopril-20mg',
    activeIngredient: 'Lisinopril',
    strength: '20 mg',
    dosageForm: 'Oral Tablet',
    packageSize: 90,
    ndcEquivalent: '00006-0207-58',
    classification: 'PRESCRIPTION',
    regulatoryStatus: 'AVAILABLE',
    category: 'Cardiovascular',
    fobPriceUsd: 2.20,
    retailPriceUsd: 19.50,
    usAverageCashPrice: 78.00,
    manufacturer: {
      name: "Dr. Reddy's Laboratories Ltd",
      facilityCity: 'Hyderabad',
      facilityState: 'Telangana, India',
      cdscoLicense: 'CDSCO-TG-2017-3104',
      usFdaFeiNumber: '3001844910',
      whoGmpStatus: 'VERIFIED_AUDIT',
    },
    batch: {
      lotNumber: 'LOT-2026-LS20-305',
      manufactureDate: '2026-01-20',
      expirationDate: '2028-01-19',
      assayPurity: 99.78,
      qcOfficer: 'K. S. Reddy, Chief Analyst',
      coaDownloadUrl: '#coa-lot-2026-ls20-305',
    },
    description:
      'Angiotensin-converting enzyme (ACE) inhibitor indicated for the treatment of hypertension in adult patients.',
    storageConditions: 'Store at controlled room temperature 20°C to 25°C (68°F to 77°F).',
  },
  {
    id: 'prod-amlodipine-5',
    name: 'Amlodipine Besylate Tablets',
    brandReferenceName: 'Generic equivalent for Norvasc®',
    slug: 'amlodipine-besylate-5mg',
    activeIngredient: 'Amlodipine Besylate',
    strength: '5 mg',
    dosageForm: 'Oral Tablet',
    packageSize: 90,
    ndcEquivalent: '00069-1530-68',
    classification: 'PRESCRIPTION',
    regulatoryStatus: 'AVAILABLE',
    category: 'Cardiovascular',
    fobPriceUsd: 2.10,
    retailPriceUsd: 18.00,
    usAverageCashPrice: 72.00,
    manufacturer: {
      name: 'Lupin Ltd',
      facilityCity: 'Mandideep',
      facilityState: 'Madhya Pradesh, India',
      cdscoLicense: 'CDSCO-MP-2016-1189',
      usFdaFeiNumber: '3002809224',
      whoGmpStatus: 'VERIFIED_AUDIT',
    },
    batch: {
      lotNumber: 'LOT-2026-AM05-419',
      manufactureDate: '2026-01-10',
      expirationDate: '2028-01-09',
      assayPurity: 99.88,
      qcOfficer: 'R. K. Verma, Quality Head',
      coaDownloadUrl: '#coa-lot-2026-am05-419',
    },
    description:
      'Dihydropyridine calcium channel blocker indicated for the management of hypertension and chronic stable angina.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F); protect from moisture.',
  },
  {
    id: 'prod-levothyroxine-50',
    name: 'Levothyroxine Sodium Tablets',
    brandReferenceName: 'Generic equivalent for Synthroid®',
    slug: 'levothyroxine-sodium-50mcg',
    activeIngredient: 'Levothyroxine Sodium',
    strength: '50 mcg (0.05 mg)',
    dosageForm: 'Oral Tablet',
    packageSize: 90,
    ndcEquivalent: '00074-7068-11',
    classification: 'PRESCRIPTION',
    regulatoryStatus: 'REVIEW_REQUIRED',
    category: 'Endocrine',
    fobPriceUsd: 2.90,
    retailPriceUsd: 24.00,
    usAverageCashPrice: 92.00,
    manufacturer: {
      name: 'Aurobindo Pharma Ltd',
      facilityCity: 'Jadcherla',
      facilityState: 'Telangana, India',
      cdscoLicense: 'CDSCO-TG-2019-7721',
      usFdaFeiNumber: '3004819445',
      whoGmpStatus: 'VERIFIED_AUDIT',
    },
    batch: {
      lotNumber: 'LOT-2026-LV50-802',
      manufactureDate: '2026-02-05',
      expirationDate: '2027-08-04',
      assayPurity: 99.91,
      qcOfficer: 'T. N. Rao, Lead Analyst',
      coaDownloadUrl: '#coa-lot-2026-lv50-802',
    },
    description:
      'Synthetic thyroid hormone (T4) indicated for replacement therapy in primary, secondary, and tertiary hypothyroidism. Narrow therapeutic index drug.',
    storageConditions: 'Store at 20°C to 25°C (68°F to 77°F). Protect from light and moisture.',
  },
  {
    id: 'prod-omeprazole-20',
    name: 'Omeprazole Delayed-Release Capsules',
    brandReferenceName: 'Generic equivalent for Prilosec®',
    slug: 'omeprazole-dr-20mg',
    activeIngredient: 'Omeprazole',
    strength: '20 mg',
    dosageForm: 'Delayed-Release Capsule',
    packageSize: 90,
    ndcEquivalent: '00186-0602-31',
    classification: 'PRESCRIPTION',
    regulatoryStatus: 'AVAILABLE',
    category: 'Gastrointestinal',
    fobPriceUsd: 2.60,
    retailPriceUsd: 21.50,
    usAverageCashPrice: 88.00,
    manufacturer: {
      name: 'Torrent Pharmaceuticals Ltd',
      facilityCity: 'Indrad',
      facilityState: 'Gujarat, India',
      cdscoLicense: 'CDSCO-GJ-2018-5002',
      usFdaFeiNumber: '3002809981',
      whoGmpStatus: 'VERIFIED_AUDIT',
    },
    batch: {
      lotNumber: 'LOT-2026-OM20-614',
      manufactureDate: '2026-01-25',
      expirationDate: '2028-01-24',
      assayPurity: 99.82,
      qcOfficer: 'A. B. Patel, QA Director',
      coaDownloadUrl: '#coa-lot-2026-om20-614',
    },
    description:
      'Proton pump inhibitor (PPI) indicated for the short-term and maintenance treatment of active duodenal ulcers, GERD, and erosive esophagitis.',
    storageConditions: 'Store in tightly closed container between 15°C and 30°C (59°F and 86°F).',
  },
];
