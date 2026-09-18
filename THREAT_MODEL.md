# INDOPHARM — THREAT MODEL & RISK ARCHITECTURE
## STRIDE Evaluation, Attacker Personas & OWASP Top 10 Alignment

---

## 1. Threat Actor Personas & Motivations

```text
┌──────────────────────────────┬───────────────────────────────────────────────────────────┐
│ Actor Persona                │ Description & Motivation                                  │
├──────────────────────────────┼───────────────────────────────────────────────────────────┤
│ External Opportunistic Bot   │ Mass credential-stuffing, vulnerability scanning, DoS.    │
│ Malicious Customer           │ IDOR attacks to steal other patients' ePHI/prescriptions; │
│                              │ coupon abuse; cart price tampering; self-role elevation.  │
│ Compromised Staff Account    │ Rogue/compromised Support or Warehouse employee attempting│
│                              │ unauthorized ePHI exfiltration or illegal inventory shift.│
│ Compromised Admin Account    │ Attacker attempting to seize Super Admin control, alter   │
│                              │ payment flows, or purge audit records.                    │
│ Man-in-the-Middle (MITM)     │ Sniffing unencrypted tokens or tampering with API requests│
│ Fake Payment Webhook Sender  │ Forging provider notifications to mark unpaid orders paid.│
│ Malicious Document Uploader  │ Path traversal or polyglot payload via prescription file. │
└──────────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Threat Analysis Matrix

| Asset at Risk | Threat Description | Attack Vector | Security Control Implemented | Residual Risk & Governance |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Passwords** | Offline dictionary attack if DB leaked | Leaked SQL dump | Scrypt ($N=16384, r=8, p=1$) + 16-byte random salt per user | Low; governed by 10-char complexity policy |
| **Session Cookies** | Session hijacking via script injection | XSS vulnerability | Cookies configured with `HttpOnly: true`, `Secure: true`, `SameSite: Lax` | Low; tokens inaccessible to JavaScript |
| **Patient Prescriptions** | Unauthorized viewing of ePHI files | IDOR (`/api/prescriptions/:id`) | Server-side `assertPrescriptionAccess` checks patient ownership or clinical license | Low; audited per view event |
| **Prescription Files** | Public directory traversal & data leak | `GET ../../prescriptions/` | Private storage + 15-minute HMAC signed URLs; traversal tokens stripped | Low; signed URLs expire in 900 seconds |
| **User Roles** | Horizontal / Vertical privilege escalation | Manipulating `role: 'SUPER_ADMIN'` in PATCH payload | Server-side role guard (`assertRoleModificationAllowed`); mass assignment blocked | Negligible; only Super Admin can alter roles |
| **Warehouse Inventory** | Stock tampering & illegal depletion | Race condition / negative stock | Database transactional balance checks (`availableQuantity >= quantity`) | Negligible; zero-stock barrier enforced |
| **Financial Transactions** | Duplicate chargebacks or refund abuse | Replay of refund API call | Idempotency keys (`idempotencyKey`) + status state machine guards | Low; maximum refund capped at captured amount |
| **Payment Webhooks** | Unauthorized order status advancement | Forged POST to webhook URL | HMAC-SHA256 signature verification against provider secret key | Negligible; forged events rejected with 400 |
| **Administrative Actions**| Repudiation of privileged operations | Rogue admin denies changes | Immutable append-only `AuditLog` table capturing actor, IP, timestamp | Negligible; admins cannot purge logs |

---

## 3. OWASP Top 10 (2021) Verification & Alignment

### A01: Broken Access Control
- **Mitigation:** Server-authoritative RBAC matrix; object-level IDOR validation on orders, prescriptions, and tickets; strict prohibition of frontend-only authorization.
- **Verification:** 84/84 automated security tests verify customer-to-customer and customer-to-admin boundaries.

### A02: Cryptographic Failures
- **Mitigation:** Sensitive data encrypted in transit via TLS 1.3; passwords hashed using scrypt; session tokens and signed file URLs signed via HMAC-SHA256; constant-time comparison (`timingSafeEqual`) prevents side-channel timing attacks.
- **Verification:** Verified via test suite Domain 1, Domain 3, and Domain 11.

### A03: Injection (SQL / NoSQL / Command)
- **Mitigation:** Prisma ORM parameterized queries; raw SQL concatenation strictly eliminated; input sanitization removes unprintable control characters and HTML entities.
- **Verification:** Database tests verify SQL injection resilience on queries.

### A04: Insecure Design
- **Mitigation:** Explicit threat modeling; separate identity model (`User`) from profile models (`Customer`, `Admin`); least-privilege role boundaries; enumeration-resistant password reset.
- **Verification:** Validated by architectural design and unit/integration tests.

### A05: Security Misconfiguration
- **Mitigation:** Strict HTTP security headers configured (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy); error messages sanitize internal stack traces.
- **Verification:** Headers suite verified in API responses.

### A06: Vulnerable and Outdated Components
- **Mitigation:** Minimal external dependency footprint; zero external dependencies for scrypt, TOTP, and session crypto; latest Next.js 16 and Prisma 7 stack.
- **Verification:** Dependency audit clean with `package-lock.json` integrity preserved.

### A07: Identification and Authentication Failures
- **Mitigation:** 10-character password complexity; sliding-window rate limiting on login, registration, and reset; RFC 6238 TOTP Multi-Factor Authentication for staff; single-use reset tokens.
- **Verification:** Test suite Domains 1, 2, 4, 8, and 12 verify full authentication lifecycle.

### A08: Software and Data Integrity Failures
- **Mitigation:** Webhook HMAC-SHA256 signature validation ensures payloads originate exclusively from trusted payment gateways; signed session tokens reject tampering.
- **Verification:** Payment test suite Domain: Webhooks and Security test suite Domain 3 pass 100%.

### A09: Security Logging and Monitoring Failures
- **Mitigation:** Structured JSON audit logger emitting immutable records to database `AuditLog`; tracks authentication, clinical document access, role adjustments, and financial refunds.
- **Verification:** Security audit logging verified across login, logout, password reset, and MFA events.

### A10: Server-Side Request Forgery (SSRF)
- **Mitigation:** System does not perform arbitrary outbound URL fetching based on untrusted user input; payment and webhook URLs are restricted to static provider endpoints.
- **Verification:** Confirmed via code review.
