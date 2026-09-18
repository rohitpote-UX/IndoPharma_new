# INDOPHARM — SECURITY OPERATIONS & INCIDENT RESPONSE PLAYBOOK
## Operational Procedures, Secret Rotation, Account Governance & Disaster Recovery

---

## 1. Staff Account Lifecycle Management

Privileged accounts (`ADMIN`, `SUPER_ADMIN`, `OPS_WAREHOUSE`, `CLINICAL_PHARMACIST`, `COMPLIANCE_ADMIN`, `SUPPORT_AGENT`) follow a strict lifecycle to prevent unauthorized access and orphaned credentials.

```text
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   Invite   │────►│  Activate  │────►│ MFA Setup  │────►│   Active   │────►│  Offboard  │
│ (One-Time) │     │ (Password) │     │ (RFC 6238) │     │ Operations │     │(Revocation)│
└────────────┘     └────────────┘     └────────────┘     └────────────┘     └────────────┘
```

### 1. Provisioning & Invitation
- Staff accounts are provisioned exclusively by a `SUPER_ADMIN`.
- Invitations use a cryptographically random, single-use token expiring in 24 hours.
- Default passwords or shared credentials are strictly prohibited.

### 2. Mandatory MFA Enrollment
- Privileged staff cannot access operational dashboards until an RFC 6238 TOTP hardware or authenticator app key is verified.
- 8 single-use emergency recovery codes are generated and securely acknowledged.

### 3. Account Suspension & Offboarding Protocol
When staff depart or an account is flagged for review:
1. Super Admin updates status to `UserStatus.SUSPENDED` via admin portal.
2. System immediately terminates all active sessions associated with the user across all devices.
3. API gateway rejects incoming requests with `HTTP 403 (ACCOUNT_SUSPENDED)`.
4. Role permissions are revoked in the database.
5. All offboarding actions are captured in the immutable audit log.

---

## 2. Break-Glass Privileged Access Procedure

In critical disaster scenarios (e.g., identity provider malfunction or database lockouts), emergency break-glass access can be activated without creating hidden backdoors.

### Non-Negotiable Rules
- **No Permanent Backdoor:** There are NO hardcoded master passwords, hidden query parameters, or secret bypass headers in IndoPharm.
- **Explicit & Time-Limited:** Break-glass access grants temporary credentials valid for a maximum window of 2 hours.
- **Multi-Party Authorization:** Activating the break-glass protocol requires authorization from at least two senior engineering leads.
- **Mandatory Audit Trail:** Every command executed during break-glass mode is recorded in audit logs and immediately streamed to external security observability sinks.

---

## 3. Secret Rotation Playbook

When cryptographic secrets are rotated or compromised, the following runbook must be executed:

### Secret Inventory & Impact
| Secret Identifier | Environment Variable | Affected Subsystem | Rotation Strategy |
| :--- | :--- | :--- | :--- |
| **Session Secret** | `SESSION_SECRET` | Active user sessions & cookies | Dual-secret transition; existing sessions re-authenticate upon expiry |
| **Storage Key** | `STORAGE_SECRET_KEY` | Signed prescription download URLs | Immediate rotation; outstanding 15-minute URLs expire naturally |
| **Database Credentials** | `DATABASE_URL` | PostgreSQL connection pool | Zero-downtime rolling restart with dual database user credentials |
| **Payment Provider Keys**| `RAZORPAY_KEY_SECRET`, `STRIPE_SECRET_KEY` | Webhook verification & charges | Configure secondary webhook secret in dashboard, update ENV, verify transition |

### Zero-Downtime Session Secret Rotation
1. Deploy application with updated `SESSION_SECRET`.
2. Existing active sessions will be rejected upon next request, triggering a graceful redirect to `/login`.
3. In-flight transactions are protected by database transaction atomicity.

---

## 4. Production Security Monitoring & Alert Thresholds

Security observability continuously monitors for anomaly patterns:

| Event Metric | Threshold | Severity | Automated Response |
| :--- | :--- | :---: | :--- |
| **Repeated Failed Logins** | $>5$ failures / 15 min per IP | Warning | Sliding-window IP rate limit triggered (HTTP 429) |
| **MFA Verification Failures** | $>3$ failures / 10 min per user | High | Temporary MFA lockout & security alert notification |
| **IDOR Access Violations** | $>3$ forbidden attempts / 1 hr | High | Account flagged for investigation; IP rate limited |
| **Prescription Access Spikes** | $>50$ downloads / 10 min per staff | Critical | Staff session revoked pending compliance supervisor review |
| **Role Escalation Attempt** | 1 unauthorized request | Critical | Immediate user suspension and security team page |

---

## 5. Database Backup & Disaster Recovery

### Production PostgreSQL Strategy
- **Continuous Archiving:** PostgreSQL Write-Ahead Logging (WAL) continuously streams to encrypted, geographically separate backup storage.
- **Daily Automated Snapshots:** Full database snapshots taken at 02:00 UTC daily, encrypted at rest using AES-256.
- **Snapshot Retention Policy:** 30 days of daily snapshots; 12 months of monthly historical archives for regulatory compliance.
- **Restoration Drills:** Restoration procedures are validated quarterly in an isolated staging environment to verify Recovery Time Objective (RTO < 1 hour) and Recovery Point Objective (RPO < 5 minutes).
