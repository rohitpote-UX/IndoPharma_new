# IndoPharm — Security Architecture & Threat Modeling

**Version:** 1.0.0  
**Classification:** Institutional Healthcare Security & Privacy  
**Compliance Targets:** HIPAA Security Rule, HITECH Act, OWASP Top 10, SOC 2 Type II  

---

## 1. Threat Modeling & Security Principles

As a pharmaceutical commerce platform handling electronic Protected Health Information (ePHI), prescriber credentials, and cross-border financial transactions, IndoPharm adheres to the principle of **Defense in Depth**:
1. **Confidentiality:** Patient identities, medical histories, and prescription images are inaccessible to unauthorized staff and protected against external interception.
2. **Integrity:** Sourcing provenance, batch Certificates of Analysis (CoA), and order records are tamper-evident and digitally logged.
3. **Availability:** Redundant database failover, edge CDN caching, and automated backup routines ensure constant uptime for patients requiring urgent refill access.
4. **Least Privilege:** Internal roles (Customer Support, Warehouse Staff, Clinical Pharmacists) possess only the minimal data access necessary for their specific duty.

---

## 2. Authentication & Secure Session Management

### 2.1 Patient & Clinical Authentication
- **Multi-Factor Authentication (MFA):** Mandatory for all staff roles (Pharmacists, Admin, Support). Optional but strongly incentivized for patients via TOTP / SMS OTP.
- **Session Tokens:** Cryptographically signed, encrypted JSON Web Tokens (JWT) or opaque database sessions stored exclusively in `__Host-` prefixed, `HttpOnly`, `Secure`, `SameSite=Lax` cookies.
- **Session Expiration & Revocation:**
  - Patient sessions expire after 14 days of inactivity.
  - Clinical Pharmacist sessions expire after 1 hour of inactivity with forced re-authentication.
  - Global session invalidation on password change or security alert.

---

## 3. Authorization & Role-Based Access Control (RBAC)

The platform implements 5 strict roles:

```
[PATIENT] ─── Can read/write own cart, profile, own prescriptions, view own orders
    │
[SUPPORT_AGENT] ─── Can view order tracking, shipping addresses; CANNOT view clinical Rx notes
    │
[CLINICAL_PHARMACIST] ─── Can view & verify all prescriptions, approve/reject orders, view NPI
    │
[OPS_WAREHOUSE] ─── Can view picking slips, lot numbers, generate shipping labels, update milestones
    │
[COMPLIANCE_ADMIN] ─── Superadmin access, audit trail inspection, user role management, system settings
```

Every API route and Server Action executes an explicit `requireRole([...])` guard before querying the data access layer.

---

## 4. Prescription & Document Security (ePHI Protection)

Prescription files (photos, scanned PDFs) represent highly sensitive ePHI:
1. **Zero Public Cloud Exposure:** S3/GCS buckets storing prescription files are configured with block all public access, default AES-256 / KMS server-side encryption, and versioning enabled.
2. **Time-Limited Signed URLs:** When a patient views their prescription or a pharmacist opens the verification queue, the backend generates a short-lived (900 seconds / 15 minutes) cryptographically signed URL. Direct URLs expire immediately.
3. **Virus & Malware Scanning:** Uploaded files are quarantined and scanned asynchronously for malicious payloads before becoming visible in the clinical queue.
4. **File Signature Validation:** Strict MIME-type and magic-number validation (JPEG, PNG, WebP, PDF only; max 15MB). Executable file types (`.exe`, `.sh`, `.js`, etc.) are rejected at edge middleware.

---

## 5. Secrets Management & Environment Isolation

- **Zero Hardcoded Secrets:** Credentials, database connection strings, and encryption keys are strictly read from runtime environment variables.
- **Hierarchical Separation:**
  - Development / Staging / Production operate on isolated database instances and separate cloud projects.
  - `.env` files are strictly excluded from version control via `.gitignore`.
- **Secret Rotation:** API keys for payment gateways, email providers, and storage buckets undergo 90-day automated rotation.

---

## 6. Database Security & Field-Level Encryption

- **Network Isolation:** PostgreSQL instance is hosted in a private VPC with ingress restricted exclusively to the application serverless IP pool via secure SSL/TLS connections (`sslmode=require`).
- **Field-Level Encryption (FLE):** High-sensitivity fields (e.g., patient Date of Birth, prescriber NPI, insurance policy numbers) are encrypted at the application layer using AES-256-GCM prior to execution of SQL `INSERT`/`UPDATE` queries.
- **Automated Backups:** Daily automated full snapshots with 30-day retention and continuous WAL (Write-Ahead Logging) archiving for point-in-time recovery (PITR).

---

## 7. Rate Limiting, DDoS Mitigation & Edge Security

- **Edge Security Headers:**
  - `Content-Security-Policy (CSP)`: Strict whitelist of script and connect sources.
  - `Strict-Transport-Security (HSTS)`: `max-age=63072000; includeSubDomains; preload`
  - `X-Frame-Options: DENY` (prevents clickjacking attacks)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Rate Limiting Tiers (Sliding Window):**
  - Public catalog: 300 requests / minute per IP.
  - Authentication endpoints (login, OTP request): 5 requests / minute per IP.
  - Prescription upload endpoint: 10 uploads / hour per user.
  - Checkout & payment submission: 5 attempts / 10 minutes per IP.

---

## 8. Immutable Audit Logging

Every critical security and clinical action generates an append-only `AuditLog` entry containing:
- `id`: Unique UUIDv7
- `userId`: Acting user identifier
- `role`: Role at time of action
- `action`: e.g., `PRESCRIPTION_ACCESSED`, `PRESCRIPTION_VERIFIED`, `PAYMENT_CAPTURED`
- `resourceType`: e.g., `Prescription`, `Order`, `User`
- `resourceId`: Target identifier
- `ipAddress`: Client IP address
- `userAgent`: Client User Agent
- `metadata`: JSON payload of changed attributes (excluding raw secrets/ePHI)
- `timestamp`: UTC ISO timestamp
