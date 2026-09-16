# IndoPharm — Strategic Product & Engineering Roadmap

**Version:** 1.0.0  
**Planning Horizon:** 2026 – 2028  
**Governance:** Phased Capability Gating with Regulatory Pre-Flight Milestones  

---

## 1. Phase Progression Overview

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
Foundations  Storefront  Rx & Agnostic Cross-Border Retention &  Operations  Global Multi-
& Compliance MVP         Payments     Fulfillment  Loyalty      & Compliance Corridor
```

---

## 2. Phase Breakdown

### Phase 0: Foundation, Architecture & Regulatory Pre-Flight
- **Objective:** Establish the production-ready Next.js 16 + TypeScript + Tailwind design system foundation, document all compliance boundaries, design database schemas, and create gateway-agnostic abstractions.
- **Key Deliverables:**
  - Next.js 16 App Router configuration with strict TypeScript (`noImplicitAny`).
  - Institutional Design System & UI primitive components.
  - Complete documentation suite across product, architecture, compliance, payments, and security.
  - Prisma database schema and relational seed data.
  - Agnostic Payment Provider abstraction (`PaymentProvider`, `PaymentIntent`, `PaymentStatus`).
  - Zero-unsupported-claims compliance posture audit.
- **Exit Gate:** Clean production build, 0 lint warnings, validated schema, legal & regulatory review questions documented.

### Phase 1: Verified Sourcing Catalog & Storefront MVP
- **Objective:** Deliver a consumer storefront showcasing transparent pricing, manufacturer provenance, and drug information.
- **Key Deliverables:**
  - Initial catalog of 50 non-controlled chronic generic maintenance therapies (Cardiovascular, Endocrine, Gastrointestinal, Neurological).
  - Search by brand reference name, generic API, or therapeutic category.
  - Interactive Batch Provenance Viewer (Manufacturer plant location, inspection history, sample CoA download).
  - Transparent Landed-Cost Calculator (Comparing U.S. retail cash vs. IndoPharm itemized price).
  - Patient education on FDA Personal Importation rules and delivery expectations (10–14 days).
- **Exit Gate:** Patient can browse catalog, compare transparent costs, and review manufacturer provenance.

### Phase 2: Secure Prescription Intake & Agnostic Payment Processing
- **Objective:** Implement end-to-end prescription ingestion, clinical pharmacist review workflows, and decoupled payment authorizations.
- **Key Deliverables:**
  - Secure prescription dropzone with instant client preview and ePHI metadata extraction.
  - Prescriber lookup via National Provider Identifier (NPI) registry integration.
  - Licensed Pharmacist Review Queue (Approve, Request Clarification, Reject).
  - Payment intent authorization-hold flow (funds held at checkout, captured upon pharmacist approval and dispatch).
  - Automated transactional notification engine (Email/SMS updates on prescription review status).
- **Exit Gate:** Complete end-to-end checkout with mock payment provider and pharmacist approval state transitions.

### Phase 3: Cross-Border Fulfillment & Live Logistics Traceability
- **Objective:** Connect Indian bonded warehouse fulfillment with international air express and domestic U.S. carriers.
- **Key Deliverables:**
  - Warehouse picking and packing slip generation with mandatory batch lot barcode scanning.
  - Automated generation of U.S. Customs declarations, commercial invoices, and Section 321 / PIP documentation.
  - International bonded air courier API synchronization (DHL Express / FedEx Cross-Border).
  - Real-time 8-stage visual shipment tracker for patient accounts.
  - Automated customs hold alert triggers and customer service escalation workflows.
- **Exit Gate:** Orders can transition through all 8 cross-border stages with live status updates.

### Phase 4: Retention, Adherence & Referral Flywheel
- **Objective:** Drive long-term chronic patient retention and lower customer acquisition costs (CAC).
- **Key Deliverables:**
  - 90-day auto-refill subscription cadence with automatic day-75 replenishment triggers.
  - Two-sided referral reward system with unique tracking links and patient credit ledger.
  - Family medicine cabinet grouping (managing prescriptions for multiple family members under a single patient portal).
  - Adherence reminder notifications via SMS/email.
- **Exit Gate:** Patients can manage auto-refills and share referral links with credited account balances.

### Phase 5: Operations, Compliance & Audit Portal
- **Objective:** Provide internal clinical, operational, and regulatory teams with full governance visibility.
- **Key Deliverables:**
  - Role-Based Access Control (RBAC) administrative dashboard for Pharmacists, Warehouse Ops, and Compliance Auditors.
  - Immutable audit trail explorer with cryptographic verification.
  - Adverse Drug Event (ADE) intake and reporting module.
  - Financial reconciliation report (gross margins, carrier fees, exchange rate tracking).
- **Exit Gate:** Internal operators can manage orders, verify compliance logs, and export reporting data.

### Phase 6: Global Multi-Corridor Expansion
- **Objective:** Scale the verified sourcing platform to additional receiving countries.
- **Key Deliverables:**
  - Multi-currency and localized tax engine (GBP, CAD, EUR).
  - Country-specific regulatory compliance engines (e.g., UK MHRA Personal Import, Health Canada personal importation).
  - Multi-origin sourcing nodes (expanding to vetted European and Japanese generic manufacturers).
- **Exit Gate:** Successfully processing compliant orders into secondary corridors (e.g., India → UK, India → Canada).
