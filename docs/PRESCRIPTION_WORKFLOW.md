# INDOPHARM — CLINICAL PRESCRIPTION WORKFLOW SPECIFICATION

## 1. End-to-End Operational Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient / Customer
    participant Portal as IndoPharm Web App
    participant Storage as Private Document Store
    participant DB as PostgreSQL (Prisma)
    actor Pharmacist as Licensed Clinical Pharmacist
    participant Bus as Notification Bus

    Patient->>Portal: Upload prescription scan (PDF/JPG)
    Portal->>Portal: Compute SHA-256 hash & sanitize filename
    Portal->>Storage: Store in private bucket (AES-256)
    Portal->>DB: Record Prescription (status=PENDING_REVIEW, version=1)
    Portal->>Bus: Dispatch PRESCRIPTION_SUBMITTED alert
    
    Pharmacist->>Portal: Open Clinical Review Queue
    Portal->>Storage: Generate 15-min HMAC signed URL
    Pharmacist->>Portal: Review physician credentials, dosage, expiration
    
    alt Clinical Approval
        Pharmacist->>Portal: Approve Prescription + Enter Clinical Notes
        Portal->>DB: Set status=APPROVED, reviewedBy=pharmacistId, reviewedAt=now
        Portal->>Bus: Dispatch PRESCRIPTION_VERIFIED
        Portal->>DB: Advance Order to CONFIRMED_PICKING
    else Clarification Required
        Pharmacist->>Portal: Request Info + Enter Patient Message
        Portal->>DB: Set status=MORE_INFORMATION_REQUIRED
        Portal->>Bus: Dispatch PRESCRIPTION_INFO_REQUESTED
        Patient->>Portal: Resubmit clearer scan (version=2)
        Portal->>DB: Increment version, status=PENDING_REVIEW
    else Clinical Rejection
        Pharmacist->>Portal: Reject (Reason: EXPIRED_PRESCRIPTION)
        Portal->>DB: Set status=REJECTED
        Portal->>Bus: Dispatch PRESCRIPTION_REJECTED
    end
```

## 2. Regulatory Compliance Summary

1. **CDSCO Drug Rules 1945**: Requires validation of Registered Medical Practitioner (RMP) credentials on all Schedule H/H1 drugs.
2. **FDA 21 CFR § 1301.26**: Restricts personal importation to a maximum 90-day supply for personal use only under valid doctor's care.
3. **HIPAA / ePHI Security**: Zero direct public access to document blobs; temporary signed URLs expire automatically after 15 minutes.
