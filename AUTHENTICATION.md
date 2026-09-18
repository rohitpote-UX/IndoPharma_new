# INDOPHARM — ENTERPRISE IDENTITY & AUTHENTICATION ARCHITECTURE
## Phase 17 Engineering Standard & Implementation Guide

---

## 1. Executive Summary

IndoPharm operates as an international cross-border pharmaceutical commerce platform handling customer Personal Identifiable Information (PII), clinical prescriptions (ePHI), payment transactions, and regulatory export workflows. Security and identity management are designed as core architectural foundations rather than peripheral features.

This document details the identity architecture, cryptographic credential management, session lifecycle, multi-factor authentication (MFA), and enumeration-resistant account recovery flows implemented in Phase 17.

---

## 2. Identity Architecture & Domain Separation

In accordance with Phase 16 Database Architecture and enterprise separation-of-concerns principles, IndoPharm strictly bifurcates **Authentication Identity** from **Domain Business Profiles**:

```text
                        ┌───────────────────────────────┐
                        │             User              │
                        │ ───────────────────────────── │
                        │  id (UUID v4)                 │
                        │  email (unique, normalized)   │
                        │  passwordHash (scrypt)        │
                        │  role (UserRole enum)         │
                        │  status (UserStatus enum)     │
                        │  twoFactorEnabled (boolean)   │
                        │  lastLoginAt (DateTime)       │
                        └───────────────┬───────────────┘
                                        │ 1:1
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
  ┌──────────────────────────────┐              ┌──────────────────────────────┐
  │           Customer           │              │            Admin             │
  │ ──────────────────────────── │              │ ──────────────────────────── │
  │  userId (Foreign Key)        │              │  userId (Foreign Key)        │
  │  customerType (Individual,   │              │  department (Operations,     │
  │    Pharmacy, Healthcare)     │              │    Compliance, Support)      │
  │  defaultCountryId            │              │  employeeId                  │
  │  isVerified (KYC verification│              │  accessLevel                 │
  └──────────────────────────────┘              └──────────────────────────────┘
```

### Absolute Rules
1. **Never conflate role with account:** There is no duplicate `CustomerUser` or `AdminUser` table. Identity is centralized in `User`.
2. **Never trust client state:** Frontend UI state, local storage, or browser-provided headers (such as `x-user-id` or `x-role`) are untrusted and completely ignored.
3. **Status Gates:** Accounts with `status === 'SUSPENDED'` or `'INACTIVE'` are halted at the identity layer before any session or token is generated.

---

## 3. Cryptographic Credential Security

IndoPharm implements zero-external-dependency password hashing utilizing Node.js native `crypto.scrypt`. This guarantees enterprise security while eliminating native compilation hurdles (such as `node-gyp` or C++ compiler dependencies).

### Scrypt Parameters
- **CPU/Memory Cost ($N$):** 16,384 ($2^{14}$)
- **Block Size ($r$):** 8
- **Parallelization ($p$):** 1
- **Derived Key Length:** 64 bytes (512 bits)
- **Salt:** 16 cryptographically secure random bytes generated per password using `crypto.randomBytes(16)`.

### Stored Hash Format
Stored hashes follow the standard Modular Crypt Format:
```text
$scrypt$16384$8$1$<16_byte_hex_salt>$<64_byte_hex_derived_key>
```

### Side-Channel Timing Defense
Verification employs `crypto.timingSafeEqual`:
```typescript
const match = crypto.timingSafeEqual(originalHashBuffer, derivedKeyBuffer);
```
This guarantees execution time is invariant to whether or when character mismatches occur, defeating remote timing attacks.

### Enterprise Password Complexity Policy
All new passwords and password updates are evaluated against strict rules:
- Minimum length of **10 characters**
- At least one uppercase letter (`[A-Z]`)
- At least one lowercase letter (`[a-z]`)
- At least one decimal digit (`[0-9]`)
- At least one special symbol (`[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]`)

---

## 4. Cryptographic Session Management

IndoPharm issues signed, tamper-evident session tokens formatted as 3-part base64url JSON Web Tokens (JWT) using HMAC-SHA256.

```text
Session Token: <EncodedHeader>.<EncodedPayload>.<HMACSignature>
```

### Session Payload Structure
```typescript
export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  sessionId: string;
  mfaVerified?: boolean;
  iat: number; // Unix timestamp in seconds
  exp: number; // Unix timestamp in seconds
}
```

### Dual-Tier Session Lifetimes
| Account Tier | Role Classification | Maximum Session Duration |
| :--- | :--- | :--- |
| **Customer Tier** | `PATIENT` | 7 Days (604,800 seconds) |
| **Privileged Staff Tier** | `ADMIN`, `SUPER_ADMIN`, `OPS_WAREHOUSE`, `CLINICAL_PHARMACIST`, `COMPLIANCE_ADMIN`, `SUPPORT_AGENT` | 8 Hours (28,800 seconds) |

### Cookie Security Attributes
When issued to web browsers, tokens are set via `Set-Cookie` with hardened security attributes:
```typescript
{
  name: 'indopharm_session',
  httpOnly: true,                 // Prevents JavaScript access; immune to XSS token theft
  secure: process.env.NODE_ENV === 'production', // Transmitted exclusively over TLS/HTTPS
  sameSite: 'lax',                // Mitigates cross-site request forgery (CSRF)
  path: '/',                      // Scoped to application root
  maxAge: durationSeconds,
}
```

### Server-Side Session Revocation
A server-side revocation registry tracks invalidated `sessionId` references. Sessions are invalidated under the following conditions:
1. Explicit user logout (`/api/auth/logout`)
2. Password change or reset completion
3. Account suspension by an administrator
4. Role promotion / demotion

---

## 5. Multi-Factor Authentication (MFA / TOTP)

To protect administrative and clinical operations, privileged roles require Multi-Factor Authentication conforming to **RFC 6238 (Time-based One-Time Password)**.

### MFA Specifications
- **Algorithm:** HMAC-SHA1 dynamic truncation
- **Time Step ($T_X$):** 30 seconds
- **Token Length:** 6 decimal digits
- **Clock Drift Tolerance:** $\pm 1$ step (current step, $-30$s, $+30$s)
- **Secret Generation:** 20 random bytes encoded in Base32 alphabet (`A-Z`, `2-7`)

### Two-Step Privileged Login Flow
```text
Staff Member                      Login API                           Authenticator App
     │                                │                                       │
     │ 1. POST /api/auth/login        │                                       │
     │    (email, password)           │                                       │
     ├───────────────────────────────►│                                       │
     │                                │ 2. Verify scrypt credentials          │
     │                                │ 3. Detect privileged role             │
     │                                │ 4. Issue temporary MFA token (5 min)  │
     │ 5. Return { requiresMfa: true, │                                       │
     │            tempToken: "..." }  │                                       │
     │◄───────────────────────────────┤                                       │
     │                                                                        │
     │ 6. View current 6-digit TOTP code                                      │
     │───────────────────────────────────────────────────────────────────────►│
     │ 7. Receive TOTP code (e.g., "492104")                                  │
     │◄───────────────────────────────────────────────────────────────────────┤
     │                                │                                       │
     │ 8. POST /api/auth/mfa/verify   │                                       │
     │    (tempToken, "492104")       │                                       │
     ├───────────────────────────────►│                                       │
     │                                │ 9. Validate temporary token           │
     │                                │ 10. Verify TOTP code with drift       │
     │                                │ 11. Issue full 8-hr session cookie    │
     │                                │ 12. Record audit log: MFA_SUCCESS     │
     │ 13. Set-Cookie: indopharm_session                                      │
     │◄───────────────────────────────┤                                       │
```

### Emergency Backup Recovery Codes
Upon enrolling MFA, the system provisions 8 cryptographically unique recovery codes formatted as `xxxx-xxxx`. Each code is single-use and hashed before storage.

---

## 6. Enumeration-Resistant Password Reset

Password reset operations prevent account enumeration through the following mechanisms:

1. **Neutral API Responses:** Whether an email exists, is suspended, or does not exist, the API always returns HTTP 200 with the exact same response:
   ```json
   {
     "success": true,
     "message": "If an account exists with that email address, password reset instructions have been sent."
   }
   ```
2. **Single-Use Signed Tokens:** Reset tokens format:
   ```text
   <userId>.<expiresAt>.<randomEntropy>.<hmacSignature>
   ```
   where `hmacSignature` is calculated over:
   ```text
   userId + ":" + expiresAt + ":" + randomEntropy + ":" + user.passwordHash
   ```
3. **Automatic Cryptographic Invalidation:** Because the user's current `passwordHash` is a component of the HMAC signature, the moment the password is updated, all previously issued reset tokens for that user immediately and irreversibly become invalid.
4. **Strict Expiration:** Reset tokens expire exactly 15 minutes after issuance.
5. **Rate Limiting:** IP-based sliding window restricts reset requests to 5 attempts per 15 minutes.

---

## 7. Authentication API Endpoints Summary

| Endpoint | Method | Rate Limit | Protection | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | 5 / 15 min | CSRF, Rate Limit, Scrypt | Authenticates credentials; issues session cookie or requests MFA |
| `/api/auth/mfa/verify` | `POST` | 5 / 10 min | Rate Limit, RFC 6238 | Verifies 6-digit TOTP code and completes privileged login |
| `/api/auth/logout` | `POST` | Standard | CSRF, Auth Guard | Invalidates session server-side and clears session cookie |
| `/api/auth/register` | `POST` | 10 / 1 hr | CSRF, Rate Limit, Password Policy | Registers new Customer with transactional User and Customer profile |
| `/api/auth/password-reset` | `POST` | 5 / 15 min | CSRF, Rate Limit, Anti-Enumeration | Requests reset token or completes reset with verified token |
| `/api/auth/session` | `GET` | Standard | Auth Guard | Returns authenticated user profile, role, and authorized permissions |
