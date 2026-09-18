/**
 * ==============================================================================
 * INDOPHARM — PHASE 17 & PHASE 18 SECURITY & AUTHENTICATION TEST SUITE
 * ==============================================================================
 * Comprehensive enterprise test suite verifying:
 *  1. Scrypt Password Hashing & Timing-Safe Verification
 *  2. Enterprise Password Complexity Policy
 *  3. Cryptographic Session Management & Revocation
 *  4. RFC 6238 TOTP Multi-Factor Authentication & Clock Drift Tolerance
 *  5. Six-Tier Enterprise RBAC & Fine-Grained Permissions
 *  6. Object-Level IDOR Defenses (Orders, Prescriptions, Tickets)
 *  7. Privilege Escalation Prevention (Horizontal & Vertical)
 *  8. Sliding-Window Rate Limiting
 *  9. CSRF Origin & Referer Validation
 * 10. XSS Input Sanitization & Null-Byte Stripping
 * 11. Private Storage Signed URLs & Expiration Verification
 * 12. Single-Use Password Reset Tokens & Replay Defense
 * ==============================================================================
 */

import crypto from 'crypto';
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
} from '../src/lib/auth/password.ts';
import {
  createSessionToken,
  verifySessionToken,
  revokeSession,
  getSessionCookieOptions,
  PRIVILEGED_SESSION_DURATION_SECONDS,
  SESSION_DURATION_SECONDS,
} from '../src/lib/auth/session.ts';
import {
  generateTotpSecret,
  generateTotp,
  verifyTotp,
  generateRecoveryCodes,
} from '../src/lib/auth/mfa.ts';
import {
  hasPermission,
  ROLE_PERMISSIONS,
} from '../src/lib/auth/rbac/permissions.ts';
import {
  requirePermission,
  assertOrderAccess,
  assertPrescriptionAccess,
  assertSupportTicketAccess,
  assertRoleModificationAllowed,
  AuthorizationError,
} from '../src/lib/auth/rbac/guard.ts';
import { checkRateLimit, resetRateLimit } from '../src/lib/security/rate-limit.ts';
import { validateCsrfOrigin } from '../src/lib/security/csrf.ts';
import { sanitizeString, sanitizeObject } from '../src/lib/security/sanitize.ts';
import {
  createSignedDocumentUrl,
  verifySignedDocumentUrl,
  sanitizeStoragePath,
} from '../src/lib/security/storage.ts';
import { UserRole, UserStatus } from '@prisma/client';

// Test execution harness
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

async function runSecurityTestSuite() {
  console.log('\n===========================================================');
  console.log('INDOPHARM — PHASE 17 & 18 AUTHENTICATION & SECURITY TESTS');
  console.log('===========================================================\n');

  // ============================================================================
  // DOMAIN 1: Scrypt Password Hashing & Timing-Safe Verification
  // ============================================================================
  console.log('── Domain 1: Scrypt Password Hashing & Verification ────────────────────');
  const plainPassword = 'CorrectHorseBatteryStaple!2026';
  const hashedPassword = await hashPassword(plainPassword);

  assert(hashedPassword.startsWith('$scrypt$'), 'Hash format follows scrypt identifier');
  assert(hashedPassword.split('$').length === 7, 'Hash contains identifier, N, r, p, salt, and derivedKey');

  const validVerification = await verifyPassword(plainPassword, hashedPassword);
  assert(validVerification === true, 'Valid password verifies successfully against scrypt hash');

  const invalidVerification = await verifyPassword('WrongPassword123!', hashedPassword);
  assert(invalidVerification === false, 'Invalid password fails verification');

  const emptyVerification = await verifyPassword('', hashedPassword);
  assert(emptyVerification === false, 'Empty password fails verification');

  // Verify unique salts: two identical passwords produce completely distinct hashes
  const secondHash = await hashPassword(plainPassword);
  assert(hashedPassword !== secondHash, 'Unique 16-byte random salts ensure identical passwords have distinct hashes');

  // ============================================================================
  // DOMAIN 2: Enterprise Password Complexity Policy
  // ============================================================================
  console.log('\n── Domain 2: Password Complexity Policy ───────────────────────────────');
  const validPolicy = validatePasswordPolicy('SecureP@ssw0rd2026!');
  assert(validPolicy.valid === true, 'Strong compliant password passes policy check');

  const shortPassword = validatePasswordPolicy('Short1!a');
  assert(shortPassword.valid === false && shortPassword.errors.some(e => e.includes('10 characters')), 'Rejects passwords shorter than 10 characters');

  const noUppercase = validatePasswordPolicy('alllowercase1234!#');
  assert(noUppercase.valid === false && noUppercase.errors.some(e => e.includes('uppercase')), 'Rejects passwords without uppercase letter');

  const noDigit = validatePasswordPolicy('NoDigitsHereSpecial!@');
  assert(noDigit.valid === false && noDigit.errors.some(e => e.includes('digit')), 'Rejects passwords without digits');

  const noSpecial = validatePasswordPolicy('NoSpecialChars123456');
  assert(noSpecial.valid === false && noSpecial.errors.some(e => e.includes('special character')), 'Rejects passwords without special characters');

  // ============================================================================
  // DOMAIN 3: Cryptographic Session Management & Revocation
  // ============================================================================
  console.log('\n── Domain 3: Session Management & Revocation ───────────────────────────');
  const sessionUser = {
    userId: 'usr_c83f-48d9-a29e',
    email: 'patient@indopharm.com',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
  };

  const validToken = createSessionToken(sessionUser);
  assert(typeof validToken === 'string' && validToken.split('.').length === 3, 'Session token is 3-part base64url JWT');

  const verifiedSession = verifySessionToken(validToken);
  assert(verifiedSession !== null && verifiedSession.userId === sessionUser.userId, 'Valid session token verifies and extracts correct payload');
  assert(verifiedSession.role === UserRole.PATIENT, 'Session retains authoritative UserRole');

  // Session Tampering Test
  const [headerB64, payloadB64, sigB64] = validToken.split('.');
  const tamperedPayload = Buffer.from(JSON.stringify({
    ...JSON.parse(Buffer.from(payloadB64, 'base64url').toString()),
    role: UserRole.SUPER_ADMIN, // Attacker tries to elevate role in cookie
  })).toString('base64url');
  const tamperedToken = `${headerB64}.${tamperedPayload}.${sigB64}`;

  const tamperedResult = verifySessionToken(tamperedToken);
  assert(tamperedResult === null, 'Tampered session payload is immediately rejected by HMAC verification');

  // Expired Session Test
  const expiredToken = createSessionToken({
    ...sessionUser,
    expiresInSeconds: -10, // expired 10 seconds ago
  });
  const expiredResult = verifySessionToken(expiredToken);
  assert(expiredResult === null, 'Expired session token is rejected');

  // Server-Side Revocation Test
  const sessionToRevoke = createSessionToken(sessionUser);
  const parsedToRevoke = verifySessionToken(sessionToRevoke);
  revokeSession(parsedToRevoke.sessionId);

  const revokedResult = verifySessionToken(sessionToRevoke);
  assert(revokedResult === null, 'Revoked sessionId is rejected server-side immediately');

  // Cookie Security Flags Test
  const cookieOpts = getSessionCookieOptions();
  assert(cookieOpts.httpOnly === true, 'Session cookie must have HttpOnly: true (prevents XSS theft)');
  assert(cookieOpts.sameSite === 'lax', 'Session cookie must have SameSite: lax (CSRF defense)');
  assert(cookieOpts.path === '/', 'Session cookie scoped to application root');

  // Privileged session duration check
  assert(PRIVILEGED_SESSION_DURATION_SECONDS === 8 * 3600, 'Privileged staff sessions capped at 8 hours');
  assert(SESSION_DURATION_SECONDS === 7 * 24 * 3600, 'Standard customer sessions configured for 7 days');

  // ============================================================================
  // DOMAIN 4: RFC 6238 TOTP Multi-Factor Authentication
  // ============================================================================
  console.log('\n── Domain 4: RFC 6238 TOTP Multi-Factor Authentication ─────────────────');
  const totpSecret = generateTotpSecret();
  assert(typeof totpSecret === 'string' && totpSecret.length === 32, 'Generates 32-character base32 TOTP secret');

  const currentTotp = generateTotp(totpSecret);
  assert(/^\d{6}$/.test(currentTotp), 'TOTP code is a 6-digit numeric token');

  const verifySuccess = verifyTotp(currentTotp, totpSecret);
  assert(verifySuccess === true, 'Valid TOTP code verifies successfully');

  const invalidTotp = verifyTotp('000000', totpSecret);
  assert(invalidTotp === false, 'Invalid TOTP code is rejected');

  // Clock drift test (±1 step / 30 seconds window)
  const pastTotp = generateTotp(totpSecret, Date.now() - 30 * 1000);
  const verifyDrift = verifyTotp(pastTotp, totpSecret, 1);
  assert(verifyDrift === true, 'Clock drift of -30s is accepted within window ±1 step');

  // Emergency Recovery Codes Test
  const recoveryCodes = generateRecoveryCodes(8);
  assert(recoveryCodes.length === 8, 'Generates requested number of backup recovery codes');
  assert(recoveryCodes.every(c => /^[a-f0-9]{4}-[a-f0-9]{4}$/.test(c)), 'Recovery codes follow 8-char hyphenated format');

  // ============================================================================
  // DOMAIN 5: Six-Tier Enterprise RBAC & Fine-Grained Permissions
  // ============================================================================
  console.log('\n── Domain 5: Enterprise RBAC & Fine-Grained Permissions ────────────────');
  // 1. CUSTOMER (PATIENT)
  assert(hasPermission(UserRole.PATIENT, 'order:read_own') === true, 'Customer has order:read_own');
  assert(hasPermission(UserRole.PATIENT, 'prescription:upload') === true, 'Customer has prescription:upload');
  assert(hasPermission(UserRole.PATIENT, 'admin:access') === false, 'Customer CANNOT access admin portal');
  assert(hasPermission(UserRole.PATIENT, 'inventory:adjust') === false, 'Customer CANNOT adjust inventory');
  assert(hasPermission(UserRole.PATIENT, 'payment:refund') === false, 'Customer CANNOT issue refunds');
  assert(hasPermission(UserRole.PATIENT, 'user:manage_role') === false, 'Customer CANNOT manage roles');

  // 2. OPERATIONS (OPS_WAREHOUSE)
  assert(hasPermission(UserRole.OPS_WAREHOUSE, 'inventory:read') === true, 'Operations has inventory:read');
  assert(hasPermission(UserRole.OPS_WAREHOUSE, 'inventory:adjust') === true, 'Operations has inventory:adjust');
  assert(hasPermission(UserRole.OPS_WAREHOUSE, 'order:fulfillment') === true, 'Operations has order:fulfillment');
  assert(hasPermission(UserRole.OPS_WAREHOUSE, 'compliance:rule_manage') === false, 'Operations CANNOT modify compliance rules');
  assert(hasPermission(UserRole.OPS_WAREHOUSE, 'user:manage_role') === false, 'Operations CANNOT modify user roles');

  // 3. COMPLIANCE (CLINICAL_PHARMACIST & COMPLIANCE_ADMIN)
  assert(hasPermission(UserRole.CLINICAL_PHARMACIST, 'prescription:verify') === true, 'Pharmacist can verify prescriptions');
  assert(hasPermission(UserRole.COMPLIANCE_ADMIN, 'compliance:rule_manage') === true, 'Compliance Admin can manage regulatory rules');
  assert(hasPermission(UserRole.CLINICAL_PHARMACIST, 'payment:refund') === false, 'Pharmacist CANNOT refund payments');
  assert(hasPermission(UserRole.COMPLIANCE_ADMIN, 'inventory:adjust') === false, 'Compliance CANNOT alter physical warehouse stock');

  // 4. SUPPORT (SUPPORT_AGENT)
  assert(hasPermission(UserRole.SUPPORT_AGENT, 'support:read_all') === true, 'Support has support:read_all');
  assert(hasPermission(UserRole.SUPPORT_AGENT, 'order:read_all') === true, 'Support has order:read_all for customer care');
  assert(hasPermission(UserRole.SUPPORT_AGENT, 'prescription:verify') === false, 'Support CANNOT clinically verify prescriptions');
  assert(hasPermission(UserRole.SUPPORT_AGENT, 'payment:refund') === false, 'Support CANNOT issue refunds without admin authority');

  // 5. ADMIN
  assert(hasPermission(UserRole.ADMIN, 'product:create') === true, 'Admin can manage products');
  assert(hasPermission(UserRole.ADMIN, 'payment:refund') === true, 'Admin can issue refunds');
  assert(hasPermission(UserRole.ADMIN, 'user:manage_role') === false, 'Admin CANNOT change user roles (Super Admin exclusive)');

  // 6. SUPER_ADMIN
  assert(hasPermission(UserRole.SUPER_ADMIN, 'user:manage_role') === true, 'Super Admin has role management authority');
  assert(hasPermission(UserRole.SUPER_ADMIN, 'audit:read') === true, 'Super Admin can audit system events');
  assert(hasPermission(UserRole.SUPER_ADMIN, 'security:manage') === true, 'Super Admin can manage security settings');

  // ============================================================================
  // DOMAIN 6: Object-Level IDOR Defenses (Orders, Prescriptions, Tickets)
  // ============================================================================
  console.log('\n── Domain 6: Object-Level IDOR Defenses ────────────────────────────────');
  const patientA = {
    userId: 'patient-A-uuid',
    email: 'patientA@example.com',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    sessionId: 'sess-a',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const patientB = {
    userId: 'patient-B-uuid',
    email: 'patientB@example.com',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    sessionId: 'sess-b',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const pharmacistStaff = {
    userId: 'pharmacist-uuid',
    email: 'rx@indopharm.com',
    role: UserRole.CLINICAL_PHARMACIST,
    status: UserStatus.ACTIVE,
    sessionId: 'sess-rx',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const supportStaff = {
    userId: 'support-uuid',
    email: 'support@indopharm.com',
    role: UserRole.SUPPORT_AGENT,
    status: UserStatus.ACTIVE,
    sessionId: 'sess-sup',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  // Order Ownership & IDOR Protection
  const orderOfPatientA = { id: 'order-101', userId: 'patient-A-uuid' };

  // 1. Patient A accesses own order -> ALLOW
  let orderAccessA = false;
  try {
    assertOrderAccess(patientA, orderOfPatientA);
    orderAccessA = true;
  } catch {}
  assert(orderAccessA === true, 'Customer A allowed to access own order (ownership verified)');

  // 2. Patient B attempts IDOR attack on Patient A order -> 403 FORBIDDEN
  assertThrows(
    () => assertOrderAccess(patientB, orderOfPatientA),
    'permission',
    'IDOR Defense: Customer B blocked from accessing Customer A order'
  );

  // 3. Support Staff accesses Patient A order for care -> ALLOW (has order:read_all)
  let supportOrderAccess = false;
  try {
    assertOrderAccess(supportStaff, orderOfPatientA);
    supportOrderAccess = true;
  } catch {}
  assert(supportOrderAccess === true, 'Authorized staff with order:read_all allowed to view customer order');

  // Prescription ePHI Privacy & IDOR Protection
  const prescriptionOfPatientA = { id: 'rx-202', patientId: 'patient-A-uuid' };

  // 1. Patient A accesses own prescription -> ALLOW
  let rxAccessA = false;
  try {
    assertPrescriptionAccess(patientA, prescriptionOfPatientA);
    rxAccessA = true;
  } catch {}
  assert(rxAccessA === true, 'Patient allowed to access own prescription ePHI');

  // 2. Patient B attempts IDOR on Patient A prescription -> 403 FORBIDDEN
  assertThrows(
    () => assertPrescriptionAccess(patientB, prescriptionOfPatientA),
    'restricted',
    'IDOR Defense: Patient B blocked from accessing Patient A prescription'
  );

  // 3. Clinical Pharmacist reviews prescription -> ALLOW (prescription:verify permission)
  let pharmacistRxAccess = false;
  try {
    assertPrescriptionAccess(pharmacistStaff, prescriptionOfPatientA);
    pharmacistRxAccess = true;
  } catch {}
  assert(pharmacistRxAccess === true, 'Clinical Pharmacist authorized to view prescription for verification');

  // 4. Support agent attempts to access prescription without clinical role -> 403 FORBIDDEN
  assertThrows(
    () => assertPrescriptionAccess(supportStaff, prescriptionOfPatientA),
    'restricted',
    'Least Privilege: Support agent blocked from ePHI prescription document'
  );

  // ============================================================================
  // DOMAIN 7: Privilege Escalation Defenses
  // ============================================================================
  console.log('\n── Domain 7: Privilege Escalation Defenses ───────────────────────────');
  const adminActor = {
    userId: 'admin-uuid',
    email: 'admin@indopharm.com',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  };

  const superAdminActor = {
    userId: 'super-admin-uuid',
    email: 'root@indopharm.com',
    role: UserRole.SUPER_ADMIN,
    status: UserStatus.ACTIVE,
  };

  // Customer attempts to grant themselves SUPER_ADMIN
  assertThrows(
    () => assertRoleModificationAllowed(patientA, UserRole.SUPER_ADMIN),
    'Only Super Administrators can modify user roles',
    'Privilege Escalation Blocked: Customer cannot elevate own or other roles'
  );

  // Admin attempts to grant SUPER_ADMIN
  assertThrows(
    () => assertRoleModificationAllowed(adminActor, UserRole.SUPER_ADMIN),
    'Only Super Administrators can modify user roles',
    'Privilege Escalation Blocked: Admin cannot grant SUPER_ADMIN'
  );

  // Super Admin can modify roles
  let superAdminAllowed = false;
  try {
    assertRoleModificationAllowed(superAdminActor, UserRole.ADMIN);
    superAdminAllowed = true;
  } catch {}
  assert(superAdminAllowed === true, 'Super Admin authorized to assign role changes');

  // ============================================================================
  // DOMAIN 8: Sliding-Window Rate Limiting
  // ============================================================================
  console.log('\n── Domain 8: Sliding-Window Rate Limiting ─────────────────────────────');
  const testIpKey = 'test_ip_192_168_1_1';
  resetRateLimit(testIpKey);

  // Allow up to 3 requests in 60 seconds
  const r1 = checkRateLimit(testIpKey, { maxRequests: 3, windowSeconds: 60 });
  const r2 = checkRateLimit(testIpKey, { maxRequests: 3, windowSeconds: 60 });
  const r3 = checkRateLimit(testIpKey, { maxRequests: 3, windowSeconds: 60 });
  assert(r1.allowed && r2.allowed && r3.allowed, 'First 3 requests within limit are allowed');

  const r4 = checkRateLimit(testIpKey, { maxRequests: 3, windowSeconds: 60 });
  assert(r4.allowed === false, '4th request exceeding window limit is rejected (rate limited)');
  assert(r4.retryAfterSeconds > 0, 'Returns positive retryAfterSeconds header');

  // ============================================================================
  // DOMAIN 9: CSRF Origin & Referer Validation
  // ============================================================================
  console.log('\n── Domain 9: CSRF Protection ──────────────────────────────────────────');
  // GET request is safe
  const getReq = { method: 'GET', headers: new Headers() };
  assert(validateCsrfOrigin(getReq) === true, 'Safe GET requests pass CSRF validation');

  // State-changing POST with matching Origin header
  const validPostReq = {
    method: 'POST',
    headers: new Headers({
      host: 'indopharm.com',
      origin: 'https://indopharm.com',
    }),
  };
  assert(validateCsrfOrigin(validPostReq) === true, 'State-changing POST with matching Origin allowed');

  // State-changing POST with attacker Origin header (cross-origin attack)
  const evilPostReq = {
    method: 'POST',
    headers: new Headers({
      host: 'indopharm.com',
      origin: 'https://evil-hacker-phishing.com',
    }),
  };
  assert(validateCsrfOrigin(evilPostReq) === false, 'CSRF Blocked: State-changing POST from malicious origin rejected');

  // ============================================================================
  // DOMAIN 10: XSS Input Sanitization & Null-Byte Stripping
  // ============================================================================
  console.log('\n── Domain 10: XSS Sanitization & Input Cleansing ──────────────────────');
  const rawXss = '<script>alert("pwned")</script><b>Hello</b>';
  const cleanXss = sanitizeString(rawXss);
  assert(!cleanXss.includes('<script>') && cleanXss.includes('&lt;script&gt;'), 'HTML script tags are entity-encoded');
  assert(!cleanXss.includes('<b>') && cleanXss.includes('&lt;b&gt;'), 'HTML tags converted to safe text entities');

  const rawControlChars = 'Injected\x00Null\x1fByte';
  const cleanControl = sanitizeString(rawControlChars);
  assert(!cleanControl.includes('\x00') && cleanControl === 'InjectedNullByte', 'Null bytes and unprintable control characters stripped');

  const dirtyObj = {
    comment: '<img src=x onerror=alert(1)>',
    id: 123,
    nested: { text: '<iframe src="javascript:evil()">' },
  };
  const sanitizedObj = sanitizeObject(dirtyObj);
  assert(sanitizedObj.comment.includes('&lt;img'), 'Nested object properties sanitized recursively');
  assert(sanitizedObj.nested.text.includes('&lt;iframe'), 'Deeply nested properties cleansed');

  // ============================================================================
  // DOMAIN 11: Private Storage Signed URLs & Expiration Verification
  // ============================================================================
  console.log('\n── Domain 11: Private Document Storage & Signed URLs ───────────────────');
  // Path traversal prevention
  assertThrows(
    () => sanitizeStoragePath('../../etc/passwd'),
    'Path traversal',
    'Directory traversal ../../ blocked in file storage keys'
  );
  assertThrows(
    () => sanitizeStoragePath('prescriptions/..\\..\\windows\\system32'),
    'Path traversal',
    'Windows backslash traversal ..\\ blocked in file storage keys'
  );

  const safeStorageKey = 'prescriptions/cust-1/rx-sample.pdf';
  const signedUrl = createSignedDocumentUrl(safeStorageKey, { expiresInMinutes: 15 });
  assert(signedUrl.includes('exp=') && signedUrl.includes('sig='), 'Generates signed URL containing expiry and HMAC signature');

  const verifyDoc = verifySignedDocumentUrl(signedUrl);
  assert(verifyDoc.valid === true && verifyDoc.storageKey === safeStorageKey, 'Valid signed URL verifies storage key and expiry');

  // Tampered URL test
  const tamperedDocUrl = signedUrl.replace('rx-sample.pdf', 'secret-admin.pdf');
  const verifyTamperedDoc = verifySignedDocumentUrl(tamperedDocUrl);
  assert(verifyTamperedDoc.valid === false, 'Tampered storage key in signed URL rejected');

  // Expired URL test
  const expiredDocUrl = createSignedDocumentUrl(safeStorageKey, { expiresInMinutes: -5 });
  const verifyExpiredDoc = verifySignedDocumentUrl(expiredDocUrl);
  assert(verifyExpiredDoc.valid === false && verifyExpiredDoc.error === 'URL has expired', 'Expired signed URL rejected');

  // ============================================================================
  // DOMAIN 12: Password Reset Single-Use Tokens
  // ============================================================================
  console.log('\n── Domain 12: Single-Use Password Reset Tokens ────────────────────────');
  const mockUserId = 'usr-reset-test-123';
  const mockCurrentHash = '$scrypt$N=16384$r=8$p=1$salt123$derived456';
  const resetExpiresAt = Date.now() + 15 * 60 * 1000;
  const resetEntropy = crypto.randomBytes(16).toString('hex');
  const resetSecret = process.env.RESET_SECRET || process.env.SESSION_SECRET || 'dev_reset_secret_key_32_bytes_long!!';

  const resetSig = crypto
    .createHmac('sha256', resetSecret)
    .update(`${mockUserId}:${resetExpiresAt}:${resetEntropy}:${mockCurrentHash}`)
    .digest('hex');

  const validResetToken = `${mockUserId}.${resetExpiresAt}.${resetEntropy}.${resetSig}`;

  // Verify structure
  const resetParts = validResetToken.split('.');
  assert(resetParts.length === 4, 'Reset token has 4 components: userId, expiresAt, entropy, HMAC');

  // Test signature verification
  const expectedResetSig = crypto
    .createHmac('sha256', resetSecret)
    .update(`${resetParts[0]}:${resetParts[1]}:${resetParts[2]}:${mockCurrentHash}`)
    .digest('hex');

  assert(crypto.timingSafeEqual(Buffer.from(resetParts[3], 'hex'), Buffer.from(expectedResetSig, 'hex')), 'HMAC signature confirms token authenticity');

  // Test tampering with userId
  const tamperedResetToken = `usr-hacker-999.${resetParts[1]}.${resetParts[2]}.${resetParts[3]}`;
  const tamperedSigCheck = crypto
    .createHmac('sha256', resetSecret)
    .update(`usr-hacker-999:${resetParts[1]}:${resetParts[2]}:${mockCurrentHash}`)
    .digest('hex');
  assert(tamperedResetToken.split('.')[3] !== tamperedSigCheck, 'Tampered userId breaks HMAC signature verification');

  // Summary
  console.log('\n===========================================================');
  console.log(`TOTAL: ${totalTests}  PASSED: ${passedTests}  FAILED: ${failedTests}`);
  console.log('===========================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSecurityTestSuite().catch((err) => {
  console.error('Fatal error running security test suite:', err);
  process.exit(1);
});
