/**
 * ==============================================================================
 * INDOPHARM — DATABASE SEED SCRIPT (PHASE 16 DATABASE ARCHITECTURE)
 * ==============================================================================
 * NOTICE:
 * All data in this file constitutes synthetic test fixtures for development
 * and local quality testing.
 *
 * NO CLINICAL CLAIMS, NO REAL PHARMACY CREDENTIALS, AND NO ACTUAL PATIENT
 * IDENTIFIERS ARE CONTAINED HEREIN.
 * ==============================================================================
 */

import { prisma } from '../src/lib/db/client';
import { UserRole, CustomerType, UserStatus } from '@prisma/client';

async function main() {
  console.log('🌱 Starting IndoPharm Phase 16 database seeding (MOCK FIXTURES)...');

  // 1. Seed Countries
  const us = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States',
      currency: 'USD',
      phoneCode: '+1',
      isActive: true,
    },
  });

  const india = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: {
      code: 'IN',
      name: 'India',
      currency: 'INR',
      phoneCode: '+91',
      isActive: true,
    },
  });

  await prisma.country.upsert({
    where: { code: 'GB' },
    update: {},
    create: {
      code: 'GB',
      name: 'United Kingdom',
      currency: 'GBP',
      phoneCode: '+44',
      isActive: true,
    },
  });

  // 2. Seed Verified Indian Pharmaceutical Manufacturers
  const manufacturer1 = await prisma.manufacturer.upsert({
    where: { name: 'Sun Pharma Industries Ltd' },
    update: {},
    create: {
      name: 'Sun Pharma Industries Ltd',
      slug: 'sun-pharma',
      description: 'Leading international generic specialty pharmaceutical company founded in India.',
      cdscoLicenseNumber: 'CDSCO-MH-2018-9941',
      usFdaRegistrationNumber: 'FDA-FEI-3002809112',
      facilityCity: 'Halol',
      facilityState: 'Gujarat',
      countryId: india.id,
      whoGmpCertified: true,
    },
  });

  const manufacturer2 = await prisma.manufacturer.upsert({
    where: { name: 'Cipla Ltd' },
    update: {},
    create: {
      name: 'Cipla Ltd',
      slug: 'cipla',
      description: 'Global pharmaceutical company focused on respiratory and cardiovascular health.',
      cdscoLicenseNumber: 'CDSCO-GA-2019-4812',
      usFdaRegistrationNumber: 'FDA-FEI-3004819001',
      facilityCity: 'Kurkumbh',
      facilityState: 'Maharashtra',
      countryId: india.id,
      whoGmpCertified: true,
    },
  });

  // 3. Seed Categories
  const catCardio = await prisma.category.upsert({
    where: { slug: 'cardiovascular' },
    update: {},
    create: {
      name: 'Cardiovascular',
      slug: 'cardiovascular',
      description: 'Cholesterol, blood pressure, and heart health maintenance medications.',
    },
  });

  const catEndo = await prisma.category.upsert({
    where: { slug: 'endocrinology-diabetes' },
    update: {},
    create: {
      name: 'Endocrinology & Diabetes',
      slug: 'endocrinology-diabetes',
      description: 'Glycemic control and chronic metabolic therapy.',
    },
  });

  // 4. Seed Products
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
      categoryId: catCardio.id,
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
      categoryId: catEndo.id,
    },
  });

  // 5. Seed ProductVariants
  const variant1 = await prisma.productVariant.upsert({
    where: { sku: 'SKU-IN-AT20-941' },
    update: {},
    create: {
      productId: product1.id,
      sku: 'SKU-IN-AT20-941',
      name: 'Atorvastatin 20mg - 90 Film-Coated Tablets',
      strength: '20mg',
      dosageForm: 'Oral Film-Coated Tablet',
      packSize: 90,
      unit: 'TABLET',
      priceMinorUnits: 2950,
      retailPriceUsd: 29.50,
      fobPriceUsd: 3.50,
      status: 'ACTIVE',
    },
  });

  const variant2 = await prisma.productVariant.upsert({
    where: { sku: 'SKU-IN-MF500-481' },
    update: {},
    create: {
      productId: product2.id,
      sku: 'SKU-IN-MF500-481',
      name: 'Metformin ER 500mg - 90 Extended-Release Tablets',
      strength: '500mg',
      dosageForm: 'Extended-Release Tablet',
      packSize: 90,
      unit: 'TABLET',
      priceMinorUnits: 2200,
      retailPriceUsd: 22.00,
      fobPriceUsd: 2.80,
      status: 'ACTIVE',
    },
  });

  // 6. Seed Batch Certificate & Batches
  const cert1 = await prisma.batchCertificate.upsert({
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

  const batch1 = await prisma.batch.upsert({
    where: {
      productId_batchNumber: {
        productId: product1.id,
        batchNumber: 'LOT-2026-AT20-01',
      },
    },
    update: {},
    create: {
      productId: product1.id,
      productVariantId: variant1.id,
      batchNumber: 'LOT-2026-AT20-01',
      manufactureDate: new Date('2026-01-15'),
      expiryDate: new Date('2028-01-14'),
      quantityManufactured: 5000,
      quantityRemaining: 4850,
      status: 'RELEASED',
      batchCertificateId: cert1.id,
    },
  });

  // 7. Seed Inventory
  await prisma.inventory.upsert({
    where: { id: `inv-${variant1.id}` },
    update: {},
    create: {
      id: `inv-${variant1.id}`,
      productId: product1.id,
      productVariantId: variant1.id,
      batchId: batch1.id,
      location: 'MUMBAI_CENTRAL_BONDED_HUB',
      quantityOnHand: 4850,
      quantityReserved: 50,
      quantityAvailable: 4800,
      reorderThreshold: 100,
    },
  });

  // 8. Seed Regulatory Profiles
  await prisma.regulatoryProfile.upsert({
    where: { productId: product1.id },
    update: {},
    create: {
      productId: product1.id,
      classification: 'PRESCRIPTION',
      prescriptionRequired: true,
      controlledSubstance: false,
      personalImportAllowed: true,
      maxSupplyDays: 90,
      fdaNdEquivalent: '00071-0156-23',
      cdscoScheduleClass: 'Schedule H',
    },
  });

  // 9. Seed Country Rule (US Personal Importation Policy)
  await prisma.countryRule.upsert({
    where: { id: 'rule-us-fda-cpg-110-300' },
    update: {},
    create: {
      id: 'rule-us-fda-cpg-110-300',
      countryId: us.id,
      scope: 'COUNTRY_WIDE',
      ruleCode: 'FDA_CPG_110_300_PERSONAL_USE',
      allowed: true,
      prescriptionRequired: true,
      shippingAllowed: true,
      paymentAllowed: true,
      maxSupplyDays: 90,
      rationale: 'US FDA Personal Importation Policy under Regulatory Procedures Manual Chapter 9-2.',
    },
  });

  // 10. Seed Marketing: Discounts & Coupons
  const discount10 = await prisma.discount.upsert({
    where: { id: 'disc-welcome-10' },
    update: {},
    create: {
      id: 'disc-welcome-10',
      name: 'Welcome Patient 10% Off',
      description: '10% discount on first maintenance order',
      type: 'PERCENTAGE',
      value: 10.0,
      currency: 'USD',
      maxDiscountAmount: 20.0,
      status: 'ACTIVE',
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      discountId: discount10.id,
      usageLimit: 1000,
      usageCount: 0,
      perCustomerLimit: 1,
      status: 'ACTIVE',
    },
  });

  // 11. Seed Users & Customer / Admin Profiles
  const pharmacistUser = await prisma.user.upsert({
    where: { email: 'clinical.pharmacist@indopharm.local' },
    update: {},
    create: {
      email: 'clinical.pharmacist@indopharm.local',
      role: UserRole.CLINICAL_PHARMACIST,
      status: UserStatus.ACTIVE,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      emailVerified: true,
      twoFactorEnabled: true,
    },
  });

  await prisma.admin.upsert({
    where: { userId: pharmacistUser.id },
    update: {},
    create: {
      userId: pharmacistUser.id,
      department: 'CLINICAL',
      accessLevel: 'STANDARD',
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: true,
    },
  });

  await prisma.customer.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      customerType: CustomerType.INDIVIDUAL,
      defaultCountryId: us.id,
      isVerified: true,
    },
  });

  // 12. Seed PaymentProviderConfig (Phase 15 Gateway Registry)
  await prisma.paymentProviderConfig.upsert({
    where: { code: 'mock' },
    update: {},
    create: {
      code: 'mock',
      name: 'Mock Healthcare Payment Gateway',
      environment: 'sandbox',
      enabled: true,
      supportsCards: true,
      supportsAuthorization: true,
      supportsCapture: true,
      supportsRefunds: true,
      supportsPartialRefunds: true,
      supportsWebhooks: true,
      supportsCrossBorder: true,
      supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP'],
      supportedCountries: ['US', 'IN', 'GB', 'CA'],
      pharmaCategoryApproved: true,
      captureMode: 'manual',
    },
  });

  console.log('✅ IndoPharm Phase 16 database seeding completed successfully.');
  console.log(`- Countries: US, IN, GB`);
  console.log(`- Manufacturers: 2 (${manufacturer1.name}, ${manufacturer2.name})`);
  console.log(`- Products: 2 with ProductVariants`);
  console.log(`- Inventory: Batch tracking & available stock initialized`);
  console.log(`- Staff user: ${pharmacistUser.email} (Admin profile)`);
  console.log(`- Patient user: ${patientUser.email} (Customer profile)`);
  console.log(`- Coupon: WELCOME10 (10% off, max $20)`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
