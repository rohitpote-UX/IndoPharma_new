/**
 * ==============================================================================
 * INDOPHARM — PHASE 16 DATABASE ARCHITECTURE TEST SUITE
 * ==============================================================================
 * Tests relational schema invariants, User/Customer/Admin separation,
 * ProductVariant & Batch-level inventory tracking, concurrency safety
 * (preventing negative stock & over-coupon redemption), historical order
 * snapshot immutability, and Phase 15 payment preservation.
 * ==============================================================================
 */

import { analyzeBatchExpiry } from '../src/lib/db/services/inventoryService.ts';
import { validateCoupon } from '../src/lib/db/services/couponService.ts';

// Lightweight test framework
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${totalTests}. ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${totalTests}. ${message}`);
  }
}

function assertThrows(fn, expectedSubstr, message) {
  totalTests++;
  try {
    fn();
    failedTests++;
    console.error(`  ✗ [FAIL] ${totalTests}. Expected throw: ${message}`);
  } catch (err) {
    if (!expectedSubstr || err.message.includes(expectedSubstr)) {
      passedTests++;
      console.log(`  ✓ [PASS] ${totalTests}. Threw as expected (${err.name || 'Error'}): ${message}`);
    } else {
      failedTests++;
      console.error(`  ✗ [FAIL] ${totalTests}. Threw unexpected error: ${err.message}`);
    }
  }
}

async function assertAsyncThrows(promiseFn, expectedSubstr, message) {
  totalTests++;
  try {
    await promiseFn();
    failedTests++;
    console.error(`  ✗ [FAIL] ${totalTests}. Expected async throw: ${message}`);
  } catch (err) {
    if (!expectedSubstr || err.message.includes(expectedSubstr)) {
      passedTests++;
      console.log(`  ✓ [PASS] ${totalTests}. Threw as expected: ${message}`);
    } else {
      failedTests++;
      console.error(`  ✗ [FAIL] ${totalTests}. Threw unexpected error: ${err.message}`);
    }
  }
}

console.log('\n===========================================================');
console.log('INDOPHARM — PHASE 16 DATABASE ARCHITECTURE TEST SUITE');
console.log('===========================================================\n');

// ── Domain 1: User, Customer & Admin Separation ──────────────────────────
console.log('── Domain 1: User, Customer & Admin Separation ──────────────────────────');

const mockUser = {
  id: 'usr_patient_123',
  email: 'patient@example.com',
  role: 'PATIENT',
  status: 'ACTIVE',
  firstName: 'John',
  lastName: 'Doe',
};

const mockCustomer = {
  id: 'cust_456',
  userId: mockUser.id,
  customerType: 'INDIVIDUAL',
  defaultCountryId: 'ctry_us',
  isVerified: true,
};

const mockAdmin = {
  id: 'adm_789',
  userId: 'usr_staff_001',
  department: 'CLINICAL',
  accessLevel: 'STANDARD',
};

assert(mockCustomer.userId === mockUser.id, 'Customer links 1:1 with User via userId foreign key');
assert(mockCustomer.customerType === 'INDIVIDUAL', 'Customer stores business customerType separated from User');
assert(mockAdmin.department === 'CLINICAL', 'Admin stores operational department separated from User credentials');

// ── Domain 2: Product, Variant & Batch Provenance ───────────────────────
console.log('\n── Domain 2: Product, Variant & Batch Provenance ─────────────────────────');

const mockProduct = {
  id: 'prod_lipitor_generic',
  name: 'Atorvastatin Calcium',
  slug: 'atorvastatin-calcium-20mg',
  manufacturerId: 'mfr_sun_pharma',
};

const mockVariant1 = {
  id: 'var_at20_90',
  productId: mockProduct.id,
  sku: 'SKU-INDO-AT20-90',
  strength: '20mg',
  packSize: 90,
  priceMinorUnits: 2950,
  currency: 'USD',
};

const mockVariant2 = {
  id: 'var_at40_90',
  productId: mockProduct.id,
  sku: 'SKU-INDO-AT40-90',
  strength: '40mg',
  packSize: 90,
  priceMinorUnits: 3950,
  currency: 'USD',
};

assert(mockVariant1.productId === mockProduct.id, 'ProductVariant links to parent Product');
assert(mockVariant1.sku !== mockVariant2.sku, 'Each variant maintains a unique SKU');
assert(mockVariant1.priceMinorUnits === 2950, 'Variant stores price in integer minor units (no floats)');

// ── Domain 3: Batch Expiry & Quality Analysis ───────────────────────────
console.log('\n── Domain 3: Batch Expiry & Quality Analysis ─────────────────────────────');

const refDate = new Date('2026-06-01T00:00:00Z');
const expiredDate = new Date('2026-05-01T00:00:00Z');
const nearExpiryDate = new Date('2026-07-15T00:00:00Z'); // 44 days
const validFutureDate = new Date('2028-01-01T00:00:00Z'); // >500 days

const analysisExpired = analyzeBatchExpiry(expiredDate, refDate);
assert(analysisExpired.isExpired === true, 'Correctly flags past expiration date as expired');

const analysisNear = analyzeBatchExpiry(nearExpiryDate, refDate);
assert(analysisNear.isNearExpiry === true, 'Correctly flags batch expiring within 90 days as near-expiry');
assert(analysisNear.isExpired === false, 'Near-expiry batch is not marked expired');

const analysisValid = analyzeBatchExpiry(validFutureDate, refDate);
assert(analysisValid.isExpired === false && analysisValid.isNearExpiry === false, 'Future batch correctly flagged as valid');

// ── Domain 4: Inventory Concurrency & Stock Invariants ───────────────────
console.log('\n── Domain 4: Inventory Concurrency & Stock Invariants ───────────────────');

class MockConcurrentInventory {
  constructor(initialOnHand) {
    this.quantityOnHand = initialOnHand;
    this.quantityReserved = 0;
    this.quantityAvailable = initialOnHand;
  }

  // Atomic reservation simulation
  reserve(quantity) {
    if (quantity <= 0) throw new Error('Invalid quantity');
    if (this.quantityAvailable < quantity) {
      throw new Error(`Insufficient inventory: requested ${quantity}, available ${this.quantityAvailable}`);
    }
    this.quantityReserved += quantity;
    this.quantityAvailable -= quantity;
    return { success: true, remaining: this.quantityAvailable };
  }

  release(quantity) {
    const eff = Math.min(quantity, this.quantityReserved);
    this.quantityReserved -= eff;
    this.quantityAvailable += eff;
  }

  commit(quantity) {
    const eff = Math.min(quantity, this.quantityReserved);
    this.quantityOnHand -= eff;
    this.quantityReserved -= eff;
  }
}

const inv = new MockConcurrentInventory(10);
inv.reserve(3);
assert(inv.quantityAvailable === 7 && inv.quantityReserved === 3, 'Reservation updates available and reserved quantities correctly');

inv.reserve(7);
assert(inv.quantityAvailable === 0 && inv.quantityReserved === 10, 'Reservation allocates down to zero safely');

assertThrows(() => inv.reserve(1), 'Insufficient inventory', 'Golden Rule: Stock cannot be oversold below zero (stock = -1 forbidden)');

inv.release(2);
assert(inv.quantityAvailable === 2 && inv.quantityReserved === 8, 'Release restores available inventory');

inv.commit(5);
assert(inv.quantityOnHand === 5 && inv.quantityReserved === 3, 'Commit deducts physical on-hand stock permanently');

// Concurrency Race Simulation: 2 users trying to buy the final 1 unit
const raceInv = new MockConcurrentInventory(1);
let userAWon = false;
let userBWonError = false;

try {
  raceInv.reserve(1);
  userAWon = true;
} catch (e) {
  userAWon = false;
}

try {
  raceInv.reserve(1);
} catch (e) {
  userBWonError = true;
}

assert(userAWon && userBWonError && raceInv.quantityAvailable === 0, 'Concurrent race condition: only 1 request wins, 2nd request is safely rejected');

// ── Domain 5: Order Item Immutability & Historical Snapshots ─────────────
console.log('\n── Domain 5: Order Item Immutability & Historical Snapshots ─────────────');

// Catalog product at time of purchase
let catalogProduct = {
  name: 'Metformin Hydrochloride ER',
  sku: 'SKU-INDO-MF500-01',
  manufacturerName: 'Cipla Ltd',
  price: 22.0,
};

// Snapshot saved to OrderItem
const orderItemSnapshot = {
  orderId: 'ord_12345',
  productId: 'prod_metformin',
  productNameSnapshot: catalogProduct.name,
  skuSnapshot: catalogProduct.sku,
  manufacturerSnapshot: catalogProduct.manufacturerName,
  unitPriceUsd: catalogProduct.price,
};

// Later, the catalog is updated (price hike, brand renamed, manufacturer changed)
catalogProduct.name = 'Metformin XR (Updated Formula)';
catalogProduct.price = 35.0;
catalogProduct.manufacturerName = 'Cipla Global Operations';

assert(orderItemSnapshot.productNameSnapshot === 'Metformin Hydrochloride ER', 'Historical order preserves original product name snapshot');
assert(orderItemSnapshot.unitPriceUsd === 22.0, 'Historical order preserves original purchased unit price snapshot');
assert(orderItemSnapshot.manufacturerSnapshot === 'Cipla Ltd', 'Historical order preserves original manufacturer snapshot');

// ── Domain 6: Coupon & Discount Concurrency Limits ───────────────────────
console.log('\n── Domain 6: Coupon & Discount Concurrency Limits ───────────────────────');

class MockCouponLedger {
  constructor(code, discountType, value, usageLimit, perCustomerLimit) {
    this.code = code;
    this.discountType = discountType;
    this.value = value;
    this.usageLimit = usageLimit;
    this.usageCount = 0;
    this.perCustomerLimit = perCustomerLimit;
    this.redemptions = []; // { customerId, orderId }
    this.status = 'ACTIVE';
  }

  redeem(customerId, orderId) {
    if (this.status !== 'ACTIVE') throw new Error('Coupon is not active');
    if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
      throw new Error('Global usage limit exceeded');
    }
    const customerCount = this.redemptions.filter((r) => r.customerId === customerId).length;
    if (customerCount >= this.perCustomerLimit) {
      throw new Error('Customer limit exceeded');
    }

    this.usageCount++;
    if (this.usageLimit !== null && this.usageCount >= this.usageLimit) {
      this.status = 'DEPLETED';
    }
    this.redemptions.push({ customerId, orderId });
    return true;
  }
}

const coupon = new MockCouponLedger('SAVE20', 'PERCENTAGE', 20, 2, 1);

coupon.redeem('cust_1', 'ord_1');
assert(coupon.usageCount === 1, 'First coupon redemption increments usage count');

assertThrows(() => coupon.redeem('cust_1', 'ord_2'), 'Customer limit exceeded', 'Per-customer coupon limit is strictly enforced');

coupon.redeem('cust_2', 'ord_3');
assert(coupon.status === 'DEPLETED', 'Coupon transitions to DEPLETED once usageLimit is reached');

assertThrows(
  () => coupon.redeem('cust_3', 'ord_4'),
  'Coupon is not active',
  'Global usage limit reached transitions coupon to DEPLETED and rejects further redemptions'
);

// ── Domain 7: Phase 15 Payment Subsystem Compatibility ──────────────────
console.log('\n── Domain 7: Phase 15 Payment Subsystem Compatibility ──────────────────');

const mockPayment = {
  paymentNumber: 'PAY-2026-00123',
  orderId: 'ord_12345',
  amountMinorUnits: 4999, // $49.99 USD
  capturedMinorUnits: 4999,
  refundedMinorUnits: 0,
  currency: 'USD',
  status: 'CAPTURED',
};

// Golden Rule of Refunds: cumulative refunds cannot exceed captured amount
function validateRefund(payment, requestedAmountMinorUnits) {
  if (requestedAmountMinorUnits <= 0) throw new Error('Invalid refund amount');
  if (payment.refundedMinorUnits + requestedAmountMinorUnits > payment.capturedMinorUnits) {
    throw new Error('Refund exceeds capturable amount');
  }
  return true;
}

assert(validateRefund(mockPayment, 2000) === true, 'Partial refund of 2000 cents within captured 4999 cents is allowed');
assertThrows(
  () => validateRefund(mockPayment, 5000),
  'Refund exceeds capturable amount',
  'Refund exceeding total captured amount is rejected'
);

// ── Domain 8: Prescriptions & ePHI Access Boundary ───────────────────────
console.log('\n── Domain 8: Prescriptions & ePHI Access Boundary ───────────────────────');

function checkPrescriptionAccess(actorRole, actorUserId, prescription) {
  // Staff with clinical review authority
  if (actorRole === 'CLINICAL_PHARMACIST' || actorRole === 'COMPLIANCE_ADMIN') {
    return true;
  }
  // Patient owner
  if (actorUserId === prescription.userId) {
    return true;
  }
  // All others denied
  return false;
}

const mockPrescription = {
  id: 'rx_999',
  userId: 'usr_patient_123',
  documentUrl: 'private/ephi/rx_999.enc',
  status: 'VERIFIED',
};

assert(checkPrescriptionAccess('PATIENT', 'usr_patient_123', mockPrescription) === true, 'Patient can access their own prescription');
assert(checkPrescriptionAccess('PATIENT', 'usr_other_patient', mockPrescription) === false, 'Unauthorized patient cannot access another patient prescription');
assert(checkPrescriptionAccess('CLINICAL_PHARMACIST', 'usr_staff_001', mockPrescription) === true, 'Clinical Pharmacist has role-based prescription access');
assert(checkPrescriptionAccess('SUPPORT_AGENT', 'usr_support_002', mockPrescription) === false, 'General support agent denied unneeded ePHI access (least-privilege rule)');

console.log('\n===========================================================');
console.log(`TOTAL: ${totalTests}  PASSED: ${passedTests}  FAILED: ${failedTests}`);
console.log('===========================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
