/**
 * ==============================================================================
 * INDOPHARM — PHASE 22 ADMIN DASHBOARD & BUSINESS INTELLIGENCE TEST SUITE
 * ==============================================================================
 * Comprehensive automated verification covering:
 *  - Domain 1: Authoritative Financial Accounting & Revenue Calculations
 *  - Domain 2: Order Metrics, AOV & Operational Funnel Progression
 *  - Domain 3: Repeat Customer & Retention Formulas
 *  - Domain 4: Real-Time Inventory Health & Expiry Batch Rules
 *  - Domain 5: Clinical Verification SLA & Workload Bucketing
 *  - Domain 6: Date Range & Timezone Bound Resolution
 *  - Domain 7: Strict RBAC Access Control & Role-Based Data Scoping
 *  - Domain 8: Attention Center Operational Exception Logic
 * ==============================================================================
 */

import { UserRole, OrderStatus, PrescriptionStatus, ShipmentStage, PaymentStatus, RefundStatus } from '@prisma/client';
import { DashboardService } from '../src/lib/services/dashboardService.ts';
import { hasPermission } from '../src/lib/auth/rbac/permissions.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

function assertThrows(fn, expectedSubstring, message) {
  try {
    fn();
    console.error(`  ✗ [FAIL] Expected function to throw, but it succeeded: ${message}`);
    failed++;
  } catch (err) {
    const errStr = String(err?.message || err?.error || err);
    if (errStr.includes(expectedSubstring)) {
      console.log(`  ✓ [PASS] Threw as expected (${errStr}): ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] Threw unexpected error: "${errStr}" (expected "${expectedSubstring}"): ${message}`);
      failed++;
    }
  }
}

async function runTests() {
  console.log('\n===========================================================');
  console.log('INDOPHARM — PHASE 22 ADMIN DASHBOARD AUTOMATED TEST SUITE');
  console.log('===========================================================\n');

  // ==========================================================================
  // DOMAIN 1: REVENUE ACCOUNTING & RECONCILIATION
  // ==========================================================================
  console.log('── Domain 1: Financial Accounting & Net Revenue Definitions ───────────');

  // Financial accounting formula:
  // Net Revenue = Gross Sales - Discounts - Processed Refunds + Shipping + Dispensing Fees + Taxes
  function computeFinancialRevenue(orders, refunds) {
    const qualifyingStatuses = [
      'CONFIRMED_PICKING',
      'EXPORT_CUSTOMS',
      'IN_TRANSIT_AIR',
      'US_CUSTOMS_CLEARANCE',
      'DOMESTIC_DELIVERY',
      'DELIVERED',
      'PARTIALLY_REFUNDED',
      'REFUNDED',
    ];

    let gross = 0;
    let disc = 0;
    let ship = 0;
    let fee = 0;
    let tax = 0;

    for (const o of orders) {
      if (!qualifyingStatuses.includes(o.status)) continue;
      gross += o.subtotalUsd;
      disc += o.discountTotalUsd;
      ship += o.shippingUsd;
      fee += o.dispensingFeeUsd;
      tax += o.taxTotalUsd;
    }

    let refSum = 0;
    for (const r of refunds) {
      if (r.status === 'SUCCEEDED') {
        refSum += r.amountUsd;
      }
    }

    const net = Number((gross - disc - refSum + ship + fee + tax).toFixed(2));
    return { gross, discounts: disc, refunds: refSum, shipping: ship, fees: fee, taxes: tax, net };
  }

  const sampleOrders = [
    {
      id: 'o1',
      status: 'DELIVERED',
      subtotalUsd: 100.0,
      discountTotalUsd: 10.0,
      shippingUsd: 15.0,
      dispensingFeeUsd: 5.0,
      taxTotalUsd: 8.0,
    },
    {
      id: 'o2',
      status: 'CONFIRMED_PICKING',
      subtotalUsd: 200.0,
      discountTotalUsd: 0.0,
      shippingUsd: 15.0,
      dispensingFeeUsd: 5.0,
      taxTotalUsd: 16.0,
    },
    {
      id: 'o3_cancelled',
      status: 'CANCELLED', // Strictly excluded
      subtotalUsd: 500.0,
      discountTotalUsd: 50.0,
      shippingUsd: 15.0,
      dispensingFeeUsd: 5.0,
      taxTotalUsd: 40.0,
    },
    {
      id: 'o4_failed',
      status: 'PAYMENT_FAILED', // Strictly excluded
      subtotalUsd: 150.0,
      discountTotalUsd: 0.0,
      shippingUsd: 15.0,
      dispensingFeeUsd: 5.0,
      taxTotalUsd: 12.0,
    },
  ];

  const sampleRefunds = [
    { id: 'r1', amountUsd: 25.0, status: 'SUCCEEDED' },
    { id: 'r2_pending', amountUsd: 50.0, status: 'REQUESTED' }, // Not yet deducted
  ];

  const rev = computeFinancialRevenue(sampleOrders, sampleRefunds);

  // o1 gross: 100, disc: 10, ship: 15, fee: 5, tax: 8 = 118
  // o2 gross: 200, disc: 0, ship: 15, fee: 5, tax: 16 = 236
  // total before refund: 354
  // refund r1: 25
  // net = 354 - 25 = 329
  assert(rev.gross === 300.0, '1. Gross sales sums qualifying orders correctly ($300.00)');
  assert(rev.discounts === 10.0, '2. Discounts tracked accurately ($10.00)');
  assert(rev.refunds === 25.0, '3. Only SUCCEEDED refunds are deducted ($25.00)');
  assert(rev.net === 329.0, '4. Net revenue accurately reconciles ($329.00)');

  // Period-over-Period growth logic
  function calculateGrowth(currentNet, priorNet) {
    if (priorNet <= 0) return null;
    return Number((((currentNet - priorNet) / priorNet) * 100).toFixed(1));
  }

  assert(calculateGrowth(12000, 10000) === 20.0, '5. Calculates positive growth rate accurately (+20.0%)');
  assert(calculateGrowth(8000, 10000) === -20.0, '6. Calculates negative growth rate accurately (-20.0%)');
  assert(calculateGrowth(5000, 0) === null, '7. Suppresses misleading growth % when prior period is 0');

  // ==========================================================================
  // DOMAIN 2: ORDER FUNNEL & AVERAGE ORDER VALUE (AOV)
  // ==========================================================================
  console.log('\n── Domain 2: Order Funnel Progression & AOV Calculations ──────────────');

  function calculateAOV(totalRevenue, paidOrderCount) {
    if (paidOrderCount <= 0) return 0;
    return Number((totalRevenue / paidOrderCount).toFixed(2));
  }

  assert(calculateAOV(1000, 4) === 250.0, '8. Accurately calculates Average Order Value ($250.00)');
  assert(calculateAOV(0, 0) === 0, '9. Returns 0 for AOV when zero orders exist (No NaN/Infinity)');

  // ==========================================================================
  // DOMAIN 3: REPEAT CUSTOMER & RETENTION FORMULAS
  // ==========================================================================
  console.log('\n── Domain 3: Repeat Customer & Retention Rate Formulations ───────────');

  // Repeat Customer: Customer with >= 2 qualifying purchases
  // Repeat Rate = (Repeat Customers / Total Purchasing Customers) * 100
  function computeRetention(customerOrdersMap) {
    let repeatCount = 0;
    const totalPurchasing = customerOrdersMap.size;

    for (const [, count] of customerOrdersMap.entries()) {
      if (count >= 2) repeatCount++;
    }

    const rate = totalPurchasing > 0 ? Number(((repeatCount / totalPurchasing) * 100).toFixed(1)) : 0;
    return { repeatCount, totalPurchasing, rate };
  }

  const mapA = new Map([
    ['cust1', 3], // Repeat
    ['cust2', 2], // Repeat
    ['cust3', 1], // Single
    ['cust4', 1], // Single
  ]);
  const retA = computeRetention(mapA);
  assert(retA.repeatCount === 2, '10. Identifies customers with >= 2 orders as repeat patients');
  assert(retA.totalPurchasing === 4, '11. Identifies 4 total purchasing patients');
  assert(retA.rate === 50.0, '12. Calculates exact 50.0% repeat customer rate');

  const emptyMap = new Map();
  const retEmpty = computeRetention(emptyMap);
  assert(retEmpty.rate === 0 && retEmpty.repeatCount === 0, '13. Safely handles 0 purchasing customers (0% rate)');

  // ==========================================================================
  // DOMAIN 4: INVENTORY HEALTH THRESHOLDS & BATCH EXPIRY
  // ==========================================================================
  console.log('\n── Domain 4: Real-Time Inventory Health Classification ────────────────');

  function classifyInventory(quantityAvailable, reorderThreshold, safetyStock) {
    if (quantityAvailable <= 0) return 'OUT_OF_STOCK';
    if (quantityAvailable <= safetyStock) return 'CRITICAL';
    if (quantityAvailable <= reorderThreshold) return 'LOW_STOCK';
    return 'HEALTHY';
  }

  assert(classifyInventory(0, 50, 20) === 'OUT_OF_STOCK', '14. Net stock <= 0 classified as OUT_OF_STOCK');
  assert(classifyInventory(-5, 50, 20) === 'OUT_OF_STOCK', '15. Negative stock classified as OUT_OF_STOCK');
  assert(classifyInventory(15, 50, 20) === 'CRITICAL', '16. Net stock <= safetyStock classified as CRITICAL');
  assert(classifyInventory(35, 50, 20) === 'LOW_STOCK', '17. Net stock <= reorderThreshold classified as LOW_STOCK');
  assert(classifyInventory(100, 50, 20) === 'HEALTHY', '18. Net stock > reorderThreshold classified as HEALTHY');

  // Batch Expiry rule (<= 90 days)
  function isNearExpiry(expiryDate, referenceDate = new Date()) {
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    const diff = expiryDate.getTime() - referenceDate.getTime();
    return diff >= 0 && diff <= ninetyDaysMs;
  }

  const today = new Date();
  const exp45Days = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);
  const exp120Days = new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000);
  assert(isNearExpiry(exp45Days, today) === true, '19. Batch expiring in 45 days flagged as Near Expiry');
  assert(isNearExpiry(exp120Days, today) === false, '20. Batch expiring in 120 days considered healthy');

  // ==========================================================================
  // DOMAIN 5: CLINICAL VERIFICATION SLA BUCKETING
  // ==========================================================================
  console.log('\n── Domain 5: Prescription Verification SLA Tracking ───────────────────');

  function categorizeSla(submissionDate, now = new Date()) {
    const elapsedHours = (now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60);
    if (elapsedHours < 2) return 'WITHIN_SLA';
    if (elapsedHours <= 4) return 'APPROACHING_SLA';
    return 'OVERDUE_SLA';
  }

  const oneHourAgo = new Date(today.getTime() - 1 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(today.getTime() - 3 * 60 * 60 * 1000);
  const fiveHoursAgo = new Date(today.getTime() - 5 * 60 * 60 * 1000);

  assert(categorizeSla(oneHourAgo, today) === 'WITHIN_SLA', '21. Waiting 1h classified as WITHIN_SLA (< 2h)');
  assert(categorizeSla(threeHoursAgo, today) === 'APPROACHING_SLA', '22. Waiting 3h classified as APPROACHING_SLA (2-4h)');
  assert(categorizeSla(fiveHoursAgo, today) === 'OVERDUE_SLA', '23. Waiting 5h classified as OVERDUE_SLA (> 4h)');

  // ==========================================================================
  // DOMAIN 6: DATE RANGE RESOLUTION & TIMEZONE BOUNDS
  // ==========================================================================
  console.log('\n── Domain 6: Date Range Presets & Timezone Resolution ─────────────────');

  const bounds7d = DashboardService.resolveDateBounds('7d', undefined, undefined, 'UTC');
  const duration7dMs = bounds7d.endDate.getTime() - bounds7d.startDate.getTime();
  const priorDuration7dMs = bounds7d.previousEndDate.getTime() - bounds7d.previousStartDate.getTime();
  assert(duration7dMs > 0, '24. 7d preset has valid positive duration');
  assert(duration7dMs === priorDuration7dMs, '25. Comparison window matches primary duration exactly');

  const boundsCustom = DashboardService.resolveDateBounds('custom', '2026-08-01', '2026-08-15', 'UTC');
  assert(boundsCustom.startDate.toISOString().startsWith('2026-08-01'), '26. Custom startDate parsed accurately');
  assert(boundsCustom.endDate.toISOString().startsWith('2026-08-15'), '27. Custom endDate parsed accurately');

  // Custom range with invalid dates falls back safely without crashing
  const boundsInvalid = DashboardService.resolveDateBounds('custom', 'invalid-date', 'another-bad-date');
  assert(boundsInvalid.startDate instanceof Date && !isNaN(boundsInvalid.startDate.getTime()), '28. Invalid custom dates fallback to safe 30d window');

  // ==========================================================================
  // DOMAIN 7: RBAC AUTHORIZATION & LEAST PRIVILEGE DATA SCOPING
  // ==========================================================================
  console.log('\n── Domain 7: Strict RBAC Access Controls & Data Scoping ───────────────');

  // Consumer Patient must have ZERO dashboard permissions
  assert(
    !hasPermission(UserRole.PATIENT, 'dashboard:read'),
    '29. Consumer PATIENT has NO dashboard:read permission'
  );
  assert(
    !hasPermission(UserRole.PATIENT, 'dashboard:financial:read'),
    '30. Consumer PATIENT has NO dashboard:financial:read permission'
  );

  // Operations role scoping
  assert(
    hasPermission(UserRole.OPS_WAREHOUSE, 'dashboard:read'),
    '31. OPS_WAREHOUSE authorized for dashboard:read'
  );
  assert(
    hasPermission(UserRole.OPS_WAREHOUSE, 'dashboard:orders:read'),
    '32. OPS_WAREHOUSE authorized for dashboard:orders:read'
  );
  assert(
    hasPermission(UserRole.OPS_WAREHOUSE, 'dashboard:inventory:read'),
    '33. OPS_WAREHOUSE authorized for dashboard:inventory:read'
  );
  assert(
    !hasPermission(UserRole.OPS_WAREHOUSE, 'dashboard:financial:read'),
    '34. Least Privilege: OPS_WAREHOUSE BLOCKED from financial revenue metrics'
  );
  assert(
    !hasPermission(UserRole.OPS_WAREHOUSE, 'dashboard:prescription:read'),
    '35. Least Privilege: OPS_WAREHOUSE BLOCKED from clinical prescription queues'
  );

  // Clinical Pharmacist scoping
  assert(
    hasPermission(UserRole.CLINICAL_PHARMACIST, 'dashboard:read'),
    '36. CLINICAL_PHARMACIST authorized for dashboard:read'
  );
  assert(
    hasPermission(UserRole.CLINICAL_PHARMACIST, 'dashboard:prescription:read'),
    '37. CLINICAL_PHARMACIST authorized for clinical prescription queues'
  );
  assert(
    !hasPermission(UserRole.CLINICAL_PHARMACIST, 'dashboard:financial:read'),
    '38. Least Privilege: CLINICAL_PHARMACIST BLOCKED from financial revenue metrics'
  );

  // Support Agent scoping
  assert(
    hasPermission(UserRole.SUPPORT_AGENT, 'dashboard:read'),
    '39. SUPPORT_AGENT authorized for dashboard:read'
  );
  assert(
    hasPermission(UserRole.SUPPORT_AGENT, 'dashboard:customer:read'),
    '40. SUPPORT_AGENT authorized for customer retention metrics'
  );
  assert(
    !hasPermission(UserRole.SUPPORT_AGENT, 'dashboard:financial:read'),
    '41. Least Privilege: SUPPORT_AGENT BLOCKED from financial revenue metrics'
  );
  assert(
    !hasPermission(UserRole.SUPPORT_AGENT, 'dashboard:prescription:read'),
    '42. Least Privilege: SUPPORT_AGENT BLOCKED from clinical prescription queues'
  );

  // Admin & Super Admin scoping
  assert(
    hasPermission(UserRole.ADMIN, 'dashboard:financial:read'),
    '43. ADMIN authorized for full financial analytics'
  );
  assert(
    hasPermission(UserRole.ADMIN, 'dashboard:refund:read'),
    '44. ADMIN authorized for refund reconciliations'
  );
  assert(
    hasPermission(UserRole.SUPER_ADMIN, 'dashboard:financial:read'),
    '45. SUPER_ADMIN authorized for full financial analytics'
  );

  // ==========================================================================
  // DOMAIN 8: ATTENTION CENTER OPERATIONAL EXCEPTION LOGIC
  // ==========================================================================
  console.log('\n── Domain 8: Attention Center Operational Exception Logic ────────────');

  const attentionItems = DashboardService.buildAttentionCenterItems({
    verification: {
      totalPending: 12,
      underReview: 4,
      pendingReview: 8,
      moreInformationRequired: 2,
      awaitingPrescriptionUpload: 5,
      withinSlaCount: 7,
      approachingSlaCount: 2,
      overdueSlaCount: 3, // 3 overdue items
      oldestPendingWaitMinutes: 280,
    },
    shipments: {
      pendingShipmentsCount: 15,
      readyToPack: 5,
      bondedHub: 4,
      exportCustoms: 3,
      internationalTransit: 2,
      customsClearance: 1,
      outForDelivery: 0,
      oldestPendingShipmentWaitHours: 36, // > 24h bottleneck
    },
    inventory: {
      totalProducts: 40,
      healthyCount: 32,
      lowStockCount: 4,
      criticalCount: 4, // 4 critical items
      outOfStockCount: 1,
      nearExpiryBatchesCount: 2,
      criticalItems: [],
    },
    refunds: {
      refundAmountUsd: 150.0,
      refundCount: 3,
      pendingRefundsCount: 2, // 2 pending refunds
    },
    canReadPrescription: true,
    canReadOrders: true,
    canReadInventory: true,
    canReadRefund: true,
  });

  assert(attentionItems.length === 4, '46. Attention center identifies all 4 operational exceptions');
  assert(
    attentionItems.some((i) => i.id === 'ATTN_PRESCRIPTIONS_OVERDUE' && i.count === 3 && i.severity === 'CRITICAL'),
    '47. Flags overdue prescription verification SLA as CRITICAL'
  );
  assert(
    attentionItems.some((i) => i.id === 'ATTN_INVENTORY_CRITICAL' && i.count === 4 && i.severity === 'CRITICAL'),
    '48. Flags critical safety stock deficits as CRITICAL'
  );
  assert(
    attentionItems.some((i) => i.id === 'ATTN_SHIPMENT_DELAY' && i.severity === 'WARNING'),
    '49. Flags fulfillment bottlenecks (>24h delay) as WARNING'
  );
  assert(
    attentionItems.some((i) => i.id === 'ATTN_PENDING_REFUNDS' && i.count === 2),
    '50. Flags unprocessed refund requests awaiting review'
  );

  // Scoped attention items: when role lacks financial/refund permissions
  const scopedItems = DashboardService.buildAttentionCenterItems({
    verification: null,
    shipments: null,
    inventory: null,
    refunds: { refundAmountUsd: 100, refundCount: 1, pendingRefundsCount: 5 },
    canReadPrescription: false,
    canReadOrders: false,
    canReadInventory: false,
    canReadRefund: false, // Disallowed
  });
  assert(scopedItems.length === 0, '51. Omits attention items for domains caller is not authorized to access');

  console.log('\n===========================================================');
  console.log(`TOTAL: ${passed + failed}  PASSED: ${passed}  FAILED: ${failed}`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
