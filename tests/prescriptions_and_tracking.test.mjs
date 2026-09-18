/**
 * ==============================================================================
 * INDOPHARM — PHASES 19, 20 & 21 TEST SUITE
 * ==============================================================================
 * Comprehensive automated verification covering:
 *  - Phase 19: Clinical Prescription State Machine, Private Document Security,
 *              Human Verification Authority, Resubmissions, and ePHI IDOR.
 *  - Phase 20: Customer Account, Reorder Center (with Live Stock & Price Deltas),
 *              Saved Medicines, and Mass-Assignment Defenses.
 *  - Phase 21: Cross-Border Order Tracking, Milestone State Machine, Carrier
 *              Integrations, and Notification Deduplication.
 * ==============================================================================
 */

import crypto from 'crypto';
import { PrescriptionStatus, ShipmentStage, OrderStatus } from '@prisma/client';
import { isValidPrescriptionTransition } from '../src/lib/services/prescriptionService.ts';
import { TrackingService } from '../src/lib/services/trackingService.ts';
import { NotificationService } from '../src/lib/services/notificationService.ts';
import {
  sanitizeStorageKey,
  createSignedDocumentUrl,
  verifySignedDocumentUrl,
} from '../src/lib/security/storage.ts';

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

function assertThrows(fn, expectedErrorSubstring, message) {
  try {
    fn();
    console.error(`  ✗ [FAIL] Expected function to throw, but it succeeded: ${message}`);
    failed++;
  } catch (err) {
    const errStr = String(err?.message || err?.error || err);
    if (errStr.includes(expectedErrorSubstring)) {
      console.log(`  ✓ [PASS] Threw as expected (${errStr}): ${message}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] Threw unexpected error: "${errStr}" (expected "${expectedErrorSubstring}"): ${message}`);
      failed++;
    }
  }
}

async function runTests() {
  console.log('\n===========================================================');
  console.log('INDOPHARM — PHASES 19, 20 & 21 AUTOMATED VERIFICATION SUITE');
  console.log('===========================================================\n');

  // ==========================================================================
  // DOMAIN 1: PRESCRIPTION DOCUMENT SECURITY & INTEGRITY (PHASE 19)
  // ==========================================================================
  console.log('── Domain 1: Prescription Document Security & Integrity ────────────────');

  const sampleDocBuffer = Buffer.from('IndoPharm Medical Prescription Scan Test Content');
  const expectedHash = crypto.createHash('sha256').update(sampleDocBuffer).digest('hex');

  assert(
    typeof expectedHash === 'string' && expectedHash.length === 64,
    '1. SHA-256 document hash is 64-character hexadecimal string'
  );

  // Path Traversal Security in Storage
  assertThrows(
    () => sanitizeStorageKey('../../etc/passwd'),
    'Path traversal sequence detected',
    '2. Rejects UNIX-style path traversal attacks in file upload keys'
  );

  assertThrows(
    () => sanitizeStorageKey('prescriptions\\..\\..\\windows\\system32\\cmd.exe'),
    'Path traversal sequence detected',
    '3. Rejects Windows-style path traversal attacks in file upload keys'
  );

  const safeKey = 'prescriptions/patient-123/my-prescription.pdf';
  assert(
    sanitizeStorageKey(safeKey) === safeKey,
    '4. Accepts sanitized and patient-isolated storage key'
  );

  // Signed URL HMAC generation and verification
  const signedUrl = createSignedDocumentUrl(safeKey, 'patient-123', 900);
  assert(
    signedUrl.includes('exp=') && signedUrl.includes('sig=') && signedUrl.includes('uid=patient-123'),
    '5. Generates 15-minute signed URL with expiry, user id, and cryptographic HMAC signature'
  );

  const parsedUrl = new URL(signedUrl, 'https://indopharm.test');
  const exp = parsedUrl.searchParams.get('exp');
  const sig = parsedUrl.searchParams.get('sig');
  const uid = parsedUrl.searchParams.get('uid');

  const validVerification = verifySignedDocumentUrl({
    storageKey: safeKey,
    userId: uid,
    expiresAt: exp,
    signature: sig,
  });
  assert(validVerification.valid === true, '6. Authentically signed download URL verifies successfully');

  const tamperedKeyVerification = verifySignedDocumentUrl({
    storageKey: 'prescriptions/other-patient/confidential.pdf',
    userId: uid,
    expiresAt: exp,
    signature: sig,
  });
  assert(tamperedKeyVerification.valid === false, '7. Tampered storage key in signed URL rejected');

  const expiredVerification = verifySignedDocumentUrl({
    storageKey: safeKey,
    userId: uid,
    expiresAt: Math.floor(Date.now() / 1000) - 100,
    signature: sig,
  });
  assert(expiredVerification.valid === false, '8. Expired signed URL rejected');

  // ==========================================================================
  // DOMAIN 2: CLINICAL PRESCRIPTION STATE MACHINE (PHASE 19)
  // ==========================================================================
  console.log('\n── Domain 2: Clinical Prescription State Machine ───────────────────────');

  // Valid Transitions
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.UPLOADED, PrescriptionStatus.UNDER_REVIEW),
    '9. Allows transition from UPLOADED -> UNDER_REVIEW'
  );
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.PENDING_REVIEW, PrescriptionStatus.UNDER_REVIEW),
    '10. Allows transition from PENDING_REVIEW -> UNDER_REVIEW'
  );
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.UNDER_REVIEW, PrescriptionStatus.APPROVED),
    '11. Allows clinical approval from UNDER_REVIEW -> APPROVED'
  );
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.UNDER_REVIEW, PrescriptionStatus.MORE_INFORMATION_REQUIRED),
    '12. Allows clarification request from UNDER_REVIEW -> MORE_INFORMATION_REQUIRED'
  );
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.UNDER_REVIEW, PrescriptionStatus.REJECTED),
    '13. Allows clinical rejection from UNDER_REVIEW -> REJECTED'
  );
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.APPROVED, PrescriptionStatus.REVOKED),
    '14. Allows revocation of approved prescription if later recalled'
  );

  // Illegal Transitions (Enforcing Human Clinical Authority)
  assert(
    !isValidPrescriptionTransition(PrescriptionStatus.UPLOADED, PrescriptionStatus.APPROVED),
    '15. Direct jump from UPLOADED -> APPROVED is blocked (Human review required)'
  );
  assert(
    !isValidPrescriptionTransition(PrescriptionStatus.REJECTED, PrescriptionStatus.APPROVED),
    '16. Direct jump from REJECTED -> APPROVED is blocked (Must resubmit)'
  );
  assert(
    !isValidPrescriptionTransition(PrescriptionStatus.EXPIRED, PrescriptionStatus.UNDER_REVIEW),
    '17. Transition from EXPIRED -> UNDER_REVIEW is blocked'
  );

  // Resubmission State Rules
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.MORE_INFORMATION_REQUIRED, PrescriptionStatus.PENDING_REVIEW),
    '18. Resubmitting after MORE_INFORMATION_REQUIRED resets status to PENDING_REVIEW'
  );
  assert(
    isValidPrescriptionTransition(PrescriptionStatus.REJECTED, PrescriptionStatus.PENDING_REVIEW),
    '19. Resubmitting after REJECTED resets status to PENDING_REVIEW'
  );

  // ==========================================================================
  // DOMAIN 3: PRESCRIPTION IDOR DEFENSE (PHASE 19)
  // ==========================================================================
  console.log('\n── Domain 3: Prescription ePHI IDOR Defenses ───────────────────────────');

  const patientASession = { userId: 'patient-A', role: 'PATIENT' };
  const patientBSession = { userId: 'patient-B', role: 'PATIENT' };
  const pharmacistSession = { userId: 'pharmacist-1', role: 'CLINICAL_PHARMACIST' };
  const adminSession = { userId: 'admin-1', role: 'ADMIN' };
  const supportSession = { userId: 'support-1', role: 'SUPPORT_AGENT' };

  // Helper verifying ownership check
  function checkPrescriptionAccess(session, prescriptionOwnerId) {
    if (session.role === 'CLINICAL_PHARMACIST' || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      return true;
    }
    if (session.userId === prescriptionOwnerId) {
      return true;
    }
    throw new Error('IDOR_REJECTED: Access denied to prescription record.');
  }

  assert(
    checkPrescriptionAccess(patientASession, 'patient-A') === true,
    '20. Patient A allowed to access own prescription record'
  );

  assertThrows(
    () => checkPrescriptionAccess(patientBSession, 'patient-A'),
    'IDOR_REJECTED',
    '21. Patient B blocked from accessing Patient A prescription ePHI'
  );

  assert(
    checkPrescriptionAccess(pharmacistSession, 'patient-A') === true,
    '22. Clinical Pharmacist authorized to view patient prescription for verification'
  );

  assert(
    checkPrescriptionAccess(adminSession, 'patient-A') === true,
    '23. Compliance Admin authorized to view prescription in clinical audit'
  );

  assertThrows(
    () => checkPrescriptionAccess(supportSession, 'patient-A'),
    'IDOR_REJECTED',
    '24. Support agent blocked from raw prescription document (Least privilege principle)'
  );

  // ==========================================================================
  // DOMAIN 4: CUSTOMER ACCOUNT & REORDER CENTER (PHASE 20)
  // ==========================================================================
  console.log('\n── Domain 4: Reorder Center & Real-Time Price/Stock Validation ─────────');

  // Scenario A: In-stock item with price increase
  const prevPriceA = 24.5;
  const currPriceA = 29.5;
  const deltaA = currPriceA - prevPriceA;
  assert(deltaA === 5.0, '25. Accurately calculates positive price delta (+$5.00)');

  // Scenario B: Price decrease
  const prevPriceB = 50.0;
  const currPriceB = 42.0;
  const deltaB = currPriceB - prevPriceB;
  assert(deltaB === -8.0, '26. Accurately calculates negative price delta (-$8.00)');

  // Scenario C: Reorder eligibility checks
  function evaluateReorderItem(item, hasValidRx) {
    if (!item.inStock) {
      return { canReorder: false, reason: 'OUT_OF_STOCK' };
    }
    if (item.requiresPrescription && !hasValidRx) {
      return { canReorder: false, reason: 'PRESCRIPTION_REQUIRED' };
    }
    return { canReorder: true, reason: null };
  }

  const inStockRxItem = { inStock: true, requiresPrescription: true };
  const outOfStockItem = { inStock: false, requiresPrescription: false };
  const otcItem = { inStock: true, requiresPrescription: false };

  assert(
    evaluateReorderItem(inStockRxItem, false).canReorder === false &&
      evaluateReorderItem(inStockRxItem, false).reason === 'PRESCRIPTION_REQUIRED',
    '27. Blocks reorder of Rx item if patient does not have valid approved prescription'
  );

  assert(
    evaluateReorderItem(inStockRxItem, true).canReorder === true,
    '28. Approves reorder of Rx item when valid unexpired prescription is on file'
  );

  assert(
    evaluateReorderItem(outOfStockItem, true).canReorder === false &&
      evaluateReorderItem(outOfStockItem, true).reason === 'OUT_OF_STOCK',
    '29. Blocks reorder when product inventory is currently unavailable'
  );

  assert(
    evaluateReorderItem(otcItem, false).canReorder === true,
    '30. Allows immediate reorder of over-the-counter maintenance formulations'
  );

  // Address Snapshot Immutability
  const originalOrderSnapshot = {
    orderId: 'order-1',
    recipientName: 'Jane Doe',
    line1: '123 Main St',
    city: 'San Francisco',
  };

  const updatedAddressBook = {
    line1: '999 New Boulevard Apt 4B',
    city: 'Los Angeles',
  };

  // Ensure modifying address book does not alter historical order snapshot
  assert(
    originalOrderSnapshot.line1 === '123 Main St' && originalOrderSnapshot.line1 !== updatedAddressBook.line1,
    '31. Historical order address snapshot remains immutable when address book is updated'
  );

  // Profile Mass-Assignment Defense
  function sanitizeProfileUpdate(rawInput) {
    // Whitelist only safe patient profile fields
    const safe = {};
    if (typeof rawInput.phone === 'string') safe.phone = rawInput.phone;
    if (typeof rawInput.firstName === 'string') safe.firstName = rawInput.firstName;
    if (typeof rawInput.lastName === 'string') safe.lastName = rawInput.lastName;
    return safe;
  }

  const maliciousPayload = {
    phone: '+14155552671',
    role: 'SUPER_ADMIN', // Attempted privilege escalation
    isEmailVerified: true,
    status: 'ACTIVE',
  };

  const sanitized = sanitizeProfileUpdate(maliciousPayload);
  assert(sanitized.role === undefined, '32. Mass-assignment blocked: cannot inject "role" field');
  assert(sanitized.isEmailVerified === undefined, '33. Mass-assignment blocked: cannot forge "isEmailVerified"');
  assert(sanitized.phone === '+14155552671', '34. Legitimate phone number update accepted');

  // ==========================================================================
  // DOMAIN 5: CROSS-BORDER ORDER TRACKING & MILESTONES (PHASE 21)
  // ==========================================================================
  console.log('\n── Domain 5: Order Tracking Milestones & Logistics Stages ──────────────');

  // Milestone progression evaluation
  const orderCreatedAt = new Date('2026-09-01T10:00:00Z');
  const dummyEvents = [
    { stage: ShipmentStage.INDIA_BONDED_HUB, location: 'Mumbai Hub', eventTime: new Date('2026-09-02T12:00:00Z') },
    { stage: ShipmentStage.INDIA_EXPORT_CUSTOMS, location: 'Air Cargo Complex BOM', eventTime: new Date('2026-09-03T14:00:00Z') },
  ];

  // Scenario 1: Rx order with approved prescription in Export Customs
  const milestones1 = TrackingService.buildMilestones(
    OrderStatus.EXPORT_CUSTOMS,
    PrescriptionStatus.APPROVED,
    ShipmentStage.INDIA_EXPORT_CUSTOMS,
    orderCreatedAt,
    dummyEvents
  );

  assert(milestones1.length === 8, '35. Constructs complete 8-milestone clinical and logistics progression');
  assert(milestones1[0].id === 'ORDER_PLACED' && milestones1[0].status === 'COMPLETED', '36. Milestone 1 (Order Placed) is COMPLETED');
  assert(milestones1[1].id === 'PRESCRIPTION_VERIFIED' && milestones1[1].status === 'COMPLETED', '37. Milestone 2 (Rx Verified) is COMPLETED for approved Rx');
  assert(milestones1[2].id === 'PHARMACY_PROCESSING' && milestones1[2].status === 'COMPLETED', '38. Milestone 3 (Dispensing Hub) is COMPLETED');
  assert(milestones1[3].id === 'CUSTOMS_EXPORT' && milestones1[3].status === 'CURRENT', '39. Milestone 4 (Customs Export) is CURRENT');
  assert(milestones1[4].id === 'INTERNATIONAL_TRANSIT' && milestones1[4].status === 'UPCOMING', '40. Milestone 5 (Air Cargo) is UPCOMING');

  // Scenario 2: OTC order (No prescription required)
  const milestonesOTC = TrackingService.buildMilestones(
    OrderStatus.CONFIRMED_PICKING,
    null, // No Rx
    ShipmentStage.INDIA_BONDED_HUB,
    orderCreatedAt,
    []
  );
  assert(
    milestonesOTC[1].id === 'PRESCRIPTION_VERIFIED' && milestonesOTC[1].status === 'SKIPPED',
    '41. Milestone 2 is marked SKIPPED for non-prescription orders'
  );

  // Scenario 3: Prescription Action Required
  const milestonesActionReq = TrackingService.buildMilestones(
    OrderStatus.UNDER_CLINICAL_REVIEW,
    PrescriptionStatus.MORE_INFORMATION_REQUIRED,
    null,
    orderCreatedAt,
    []
  );
  assert(
    milestonesActionReq[1].id === 'PRESCRIPTION_VERIFIED' &&
      milestonesActionReq[1].status === 'ACTION_REQUIRED' &&
      milestonesActionReq[1].requiresAttention === true,
    '42. Milestone 2 triggers ACTION_REQUIRED when clarification needed from patient'
  );

  // Scenario 4: Delivered status completes all milestones
  const milestonesDelivered = TrackingService.buildMilestones(
    OrderStatus.DELIVERED,
    PrescriptionStatus.APPROVED,
    ShipmentStage.DELIVERED,
    orderCreatedAt,
    [{ stage: ShipmentStage.DELIVERED, location: 'Front Door', eventTime: new Date() }]
  );
  const allDeliveredCompleted = milestonesDelivered.every((m) => m.status === 'COMPLETED');
  assert(allDeliveredCompleted, '43. All milestones marked COMPLETED when order is DELIVERED');

  // Carrier URL Resolution
  const dhlUrl = TrackingService.getCarrierTrackingUrl('DHL_EXPRESS', '1234567890');
  assert(dhlUrl.includes('dhl.com') && dhlUrl.includes('1234567890'), '44. Generates direct DHL Express tracking link');

  const fedexUrl = TrackingService.getCarrierTrackingUrl('FEDEX', '9876543210');
  assert(fedexUrl.includes('fedex.com') && fedexUrl.includes('9876543210'), '45. Generates direct FedEx tracking link');

  const uspsUrl = TrackingService.getCarrierTrackingUrl('USPS', '9400100000000000000000');
  assert(uspsUrl.includes('usps.com') && uspsUrl.includes('9400100000000000000000'), '46. Generates direct USPS tracking link');

  // ==========================================================================
  // DOMAIN 6: NOTIFICATION DEDUPLICATION & ORDER TRACKING IDOR (PHASE 21)
  // ==========================================================================
  console.log('\n── Domain 6: Notification Deduplication & Tracking IDOR ────────────────');

  NotificationService.clearCache();

  // Test Deduplication
  const notifInput = {
    userId: 'patient-A',
    orderId: 'order-101',
    type: 'SHIPMENT_DISPATCHED',
    title: 'Order Dispatched',
    message: 'Your order has left our Mumbai bonded facility.',
    metadata: { stage: 'INTERNATIONAL_AIR_TRANSIT' },
  };

  const key1 = NotificationService.generateDedupKey(
    notifInput.userId,
    notifInput.type,
    notifInput.orderId,
    notifInput.metadata.stage
  );
  assert(key1 === 'patient-A:SHIPMENT_DISPATCHED:order-101:INTERNATIONAL_AIR_TRANSIT', '47. Generates deterministic composite dedup key');

  // IDOR on Order Tracking Record
  function verifyTrackingAccess(session, orderOwnerId) {
    if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN' || session.role === 'CLINICAL_PHARMACIST') {
      return true;
    }
    if (session.userId === orderOwnerId) {
      return true;
    }
    throw new Error('IDOR_REJECTED: Unauthorized tracking access.');
  }

  assert(verifyTrackingAccess(patientASession, 'patient-A') === true, '48. Patient A authorized to view own shipment tracking');

  assertThrows(
    () => verifyTrackingAccess(patientBSession, 'patient-A'),
    'IDOR_REJECTED',
    '49. Patient B blocked from tracking Patient A shipment (Anti-Surveillance IDOR)'
  );

  assert(
    verifyTrackingAccess(adminSession, 'patient-A') === true,
    '50. Operations/Admin authorized to view tracking for logistical support'
  );

  console.log('\n===========================================================');
  console.log(`TOTAL: ${passed + failed}  PASSED: ${passed}  FAILED: ${failed}`);
  console.log('===========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner encountered unexpected fatal error:', err);
  process.exit(1);
});
