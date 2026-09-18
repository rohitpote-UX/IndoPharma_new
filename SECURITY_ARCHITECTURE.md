# INDOPHARM — APPLICATION SECURITY ARCHITECTURE
## Phase 18 Engineering Standard & Multi-Layered Defense Model

---

## 1. Architectural Defense-in-Depth Model

IndoPharm implements a defense-in-depth security model where security controls operate at every boundary. Security is never assumed or delegated to the client browser.

```text
                                  PUBLIC INTERNET
                                         │
                                         ▼
                            HTTPS / TLS 1.3 Encryption
                                         │
                                         ▼
                         HTTP Security Headers & CORS Policy
                                         │
                                         ▼
                             Sliding-Window Rate Limiting
                                         │
                                         ▼
                                CSRF Origin Validation
                                         │
                                         ▼
                         Authentication & Session Verification
                                         │
                                         ▼
                         RBAC Role & Permission Verification
                                         │
                                         ▼
                       Object-Level IDOR Ownership Validation
                                         │
                                         ▼
                       Input Sanitization & Schema Validation
                                         │
                                         ▼
                         Authoritative Business Service Layer
                                         │
                  ┌──────────────────────┼──────────────────────┐
                  ▼                      ▼                      ▼
          PostgreSQL Database     Private File Store     Payment Providers
        (Parameterized Prisma)   (HMAC Signed URLs)     (Signed Webhooks)
                  │                      │                      │
                  └──────────────────────┴──────────────────────┘
                                         │
                                         ▼
                             Tamper-Evident Audit Ledger
```

---

## 2. HTTP Security Headers & Transport Security

In `src/lib/security/headers.ts`, IndoPharm configures strict HTTP security headers conforming to OWASP recommendations:

```typescript
{
  // Content Security Policy (CSP): Prevents XSS and unauthorized data exfiltration
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.razorpay.com https://api.stripe.com",
    "frame-src 'self' https://api.razorpay.com https://js.stripe.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Enforces HTTPS transport for 2 years with preloading
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Defeats MIME-type sniffing attacks
  'X-Content-Type-Options': 'nosniff',

  // Clickjacking defense: Blocks embedding in foreign iframes
  'X-Frame-Options': 'DENY',

  // Controls referrer leakage in outgoing requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Restricts unauthorized browser hardware APIs
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',

  // Legacy XSS filter configuration
  'X-XSS-Protection': '1; mode=block',
}
```

---

## 3. Cross-Site Request Forgery (CSRF) Protection

IndoPharm employs a multi-tiered CSRF defense strategy suited for modern web architectures:

1. **`SameSite=Lax` Cookie Policy:** Browser session cookies are restricted by default from being transmitted in cross-origin state-changing requests.
2. **Origin & Referer Header Inspection:** In `src/lib/security/csrf.ts`, all state-changing HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) require that the `Origin` or `Referer` header explicitly matches the authoritative application host (`hostHeader` or `NEXT_PUBLIC_APP_URL`).
3. **Webhook Signature Exemption:** External webhooks (`/api/payments/webhooks/*`) authenticate via HMAC-SHA256 signatures, bypassing browser cookie CSRF checks without compromising security.

---

## 4. Sliding-Window Rate Limiting

To defeat credential-stuffing, brute-force authentication, and API flooding, IndoPharm implements an in-memory sliding-window rate limiter (`src/lib/security/rate-limit.ts`).

### Rate Limit Configuration Matrix
| Endpoint Domain | Key Identifier | Window | Max Requests | Exceeded Response |
| :--- | :--- | :---: | :---: | :--- |
| **Authentication Login** | `login_<ip>` | 15 min (900s) | 5 attempts | `HTTP 429` + `Retry-After` |
| **MFA Verification** | `mfa_<ip>` | 10 min (600s) | 5 attempts | `HTTP 429` + `Retry-After` |
| **Customer Registration** | `reg_<ip>` | 1 hour (3600s) | 10 attempts | `HTTP 429` + `Retry-After` |
| **Password Reset** | `pwd_reset_<ip>` | 15 min (900s) | 5 attempts | `HTTP 429` + `Retry-After` |
| **Standard API Traffic** | `api_<ip>` | 1 min (60s) | 120 requests | `HTTP 429` + `Retry-After` |

### Automatic Garbage Collection
A background daemon runs every 5 minutes with unreferenced timer handles (`setInterval(...).unref()`), purging expired request timestamps to prevent memory leaks in production Node.js runtimes.

---

## 5. Input Validation & XSS Sanitization

IndoPharm purifies all user-supplied data before persistence or UI reflection (`src/lib/security/sanitize.ts`):

1. **HTML Entity Encoding:** Encodes dangerous characters (`<`, `>`, `&`, `"`, `'`, `/`, `` ` ``) into inert HTML entities.
2. **Null-Byte & Control Character Stripping:** Strips null bytes (`\x00`) and non-printable control characters that could induce path traversal or bypass regex validators.
3. **Recursive Object Cleansing:** `sanitizeObject<T>` traverses complex JSON payloads recursively, ensuring nested properties within support messages, addresses, and customer profiles are purified.

---

## 6. Private Document Storage & Short-Lived Signed URLs

Clinical prescription documents contain sensitive ePHI subject to stringent healthcare regulations.

### Storage Isolation Rules
- **No Public Buckets:** Prescriptions and compliance dossiers are NEVER stored in public object storage or static web directories.
- **Path Traversal Defenses:** Storage paths containing directory traversal tokens (`../`, `..\`, or leading `/`) are immediately rejected with an exception (`sanitizeStorageKey`).
- **Server-Controlled Key Generation:** File keys follow immutable, server-controlled identifiers:
  ```text
  prescriptions/<patient_uuid>/<unique_file_id>.<ext>
  ```

### Short-Lived Signed Download URLs
To allow authorized patients and clinical reviewers to download documents, the backend generates HMAC-SHA256 signed URLs (`createSignedDocumentUrl`):
- **Expiration:** Default 15 minutes (900 seconds).
- **HMAC Signature:** Calculated over `storageKey|userId|expiresAt` using `STORAGE_SECRET_KEY`.
- **Tampering Detection:** Modifying the expiration time, storage key, or user identifier breaks the cryptographic signature, resulting in immediate HTTP 403 rejection.

---

## 7. SQL Injection Prevention & ORM Hardening

IndoPharm utilizes Prisma ORM with the `@prisma/adapter-pg` driver adapter.
- **Strict Parameterization:** All database interactions execute via type-safe parameterized queries.
- **No Raw Concatenation:** String interpolation in SQL statements is strictly prohibited across the codebase.
- **Relational Integrity:** Foreign key constraints cascade or restrict deletes according to medical data retention regulations.

---

## 8. Payment Subsystem Security Integration

IndoPharm preserves all Phase 15 payment security guarantees:
- **Webhook HMAC Verification:** Webhook payloads received from payment providers (e.g. Razorpay, Stripe) must present valid HMAC signatures matching provider secrets before processing.
- **Payment Idempotency:** Duplicate checkout submissions and duplicate refund requests are rejected using database-enforced idempotency keys (`idempotencyKey`).
- **Zero Client Trust for Amounts:** Order prices, product totals, and taxes are recalculated authoritatively on the backend from database product records.

---

## 9. Immutable Security Audit Trail

All security, clinical, and administrative operations emit structured audit records to the persistent `AuditLog` table:

```typescript
export interface AuditLogEntry {
  userId?: string | null;
  userRole?: string | null;
  action:
    | 'PRESCRIPTION_UPLOADED' | 'PRESCRIPTION_VIEWED' | 'PRESCRIPTION_VERIFIED'
    | 'ORDER_PLACED' | 'ORDER_STATUS_UPDATED'
    | 'PAYMENT_INTENT_CREATED' | 'PAYMENT_AUTHORIZED' | 'PAYMENT_CAPTURED' | 'PAYMENT_REFUNDED'
    | 'USER_LOGIN' | 'USER_LOGOUT'
    | 'PASSWORD_RESET_REQUESTED' | 'PASSWORD_RESET_COMPLETED'
    | 'MFA_ENABLED' | 'MFA_DISABLED' | 'MFA_VERIFIED'
    | 'ROLE_CHANGED' | 'USER_SUSPENDED' | 'SECURITY_ALERT';
  resourceType: 'Prescription' | 'Order' | 'Payment' | 'User' | 'Shipment' | 'Security';
  resourceId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}
```

Audit entries are append-only. Standard administrative accounts cannot edit or purge audit records.
