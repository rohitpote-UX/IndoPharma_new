/**
 * ==============================================================================
 * INDOPHARM — DATABASE SEED SCRIPT (MOCK / DEVELOPMENT ONLY)
 * ==============================================================================
 * NOTICE:
 * All data in this file constitutes synthetic test fixtures for development
 * and local quality testing.
 *
 * NO CLINICAL CLAIMS, NO REAL PHARMACY CREDENTIALS, AND NO ACTUAL PATIENT
 * IDENTIFIERS ARE CONTAINED HEREIN.
 * ==============================================================================
 */

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting IndoPharm database seeding (MOCK DEVELOPMENT FIXTURES)...');

  // 1. Seed Verified Indian Pharmaceutical Manufacturers (Placeholder / Development)
  const manufacturer1 = await prisma.manufacturer.upsert({
    where: { name: 'Sun Pharma Industries Ltd' },
    update: {},
    create: {
      name: 'Sun Pharma Industries Ltd',
      cdscoLicenseNumber: 'CDSCO-MH-2018-9941',
      usFdaRegistrationNumber: 'FDA-FEI-3002809112',
      facilityCity: 'Halol',
      facilityState: 'Gujarat',
      whoGmpCertified: true,
    },
  });

  const manufacturer2 = await prisma.manufacturer.upsert({
    where: { name: 'Cipla Ltd' },
    update: {},
    create: {
      name: 'Cipla Ltd',
      cdscoLicenseNumber: 'CDSCO-GA-2019-4812',
      usFdaRegistrationNumber: 'FDA-FEI-3004819001',
      facilityCity: 'Kurkumbh',
      facilityState: 'Maharashtra',
      whoGmpCertified: true,
    },
  });

  // 2. Seed Non-Controlled Chronic Maintenance Generic Products (MOCK DATA)
  const product1 = await prisma.product.upsert({
    where: { slug: 'atorvastatin-calcium-20mg' },
    update: {},
    create: {
      name: 'Atorvastatin Calcium',
      brandReferenceName: 'Generic equivalent for Lipitor®',
      slug: 'atorvastatin-calcium-20mg',
      activeIngredient: 'Atorvastatin',
      strength: '20mg',
      dosageForm: 'Oral Film-Coated Tablet',
      packageSize: 90,
      ndcEquivalent: '00071-0156-23',
      description:
        'HMG-CoA reductase inhibitor indicated as an adjunct to diet for the reduction of elevated total cholesterol, LDL-C, and triglycerides in adults.',
      storageConditions: 'Store at 20°C to 25°C (68°F to 77°F)',
      fobPriceUsd: 3.50,
      retailPriceUsd: 29.50,
      usAverageCashPrice: 124.00,
      isControlledSubstance: false,
      requiresPrescription: true,
      manufacturerId: manufacturer1.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'metformin-hcl-500mg' },
    update: {},
    create: {
      name: 'Metformin Hydrochloride ER',
      brandReferenceName: 'Generic equivalent for Glucophage XR®',
      slug: 'metformin-hcl-500mg',
      activeIngredient: 'Metformin HCl',
      strength: '500mg',
      dosageForm: 'Extended-Release Tablet',
      packageSize: 90,
      ndcEquivalent: '00087-6063-05',
      description:
        'Biguanide indicated as an adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes mellitus.',
      storageConditions: 'Store at 20°C to 25°C (68°F to 77°F)',
      fobPriceUsd: 2.80,
      retailPriceUsd: 22.00,
      usAverageCashPrice: 85.00,
      isControlledSubstance: false,
      requiresPrescription: true,
      manufacturerId: manufacturer2.id,
    },
  });

  // 3. Seed Batch Certificate of Analysis (MOCK FIXTURE)
  await prisma.batchCertificate.upsert({
    where: { lotNumber: 'MOCK-LOT-2026-AT20-01' },
    update: {},
    create: {
      productId: product1.id,
      lotNumber: 'MOCK-LOT-2026-AT20-01',
      manufactureDate: new Date('2026-01-15'),
      expirationDate: new Date('2028-01-14'),
      purityPercentage: 99.85,
      coaDocumentUrl: 'mock/coa/mock-lot-2026-at20-01.pdf',
      releasedByQcOfficer: 'Dr. V. Raman, Quality Assurance Lead',
    },
  });

  // 4. Seed Clinical Pharmacist & Test Patient (MOCK ACCOUNTS)
  const pharmacist = await prisma.user.upsert({
    where: { email: 'clinical.pharmacist@indopharm.local' },
    update: {},
    create: {
      email: 'clinical.pharmacist@indopharm.local',
      role: UserRole.CLINICAL_PHARMACIST,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      emailVerified: true,
      twoFactorEnabled: true,
    },
  });

  const patient = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      role: UserRole.PATIENT,
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: true,
    },
  });

  console.log('✅ IndoPharm development fixtures seeded successfully.');
  console.log(`- Manufacturers seeded: 2`);
  console.log(`- Products seeded: 2 (${product1.name}, ${product2.name})`);
  console.log(`- Staff user: ${pharmacist.email}`);
  console.log(`- Patient user: ${patient.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
