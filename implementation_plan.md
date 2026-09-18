# IMPLEMENTATION PLAN: PHASE 19 (PRESCRIPTION SYSTEM), PHASE 20 (CUSTOMER ACCOUNT) & PHASE 21 (ORDER TRACKING)

IndoPharm is a production-grade cross-border pharmaceutical commerce platform handling customer PII, Electronic Protected Health Information (ePHI / prescriptions), payment transactions, customs manifests, and order fulfillment.

This implementation plan details the end-to-end architecture, domain models, services, APIs, security defenses, UI components, and testing suite for:
- **Phase 19 — Prescription System**: Human-verified clinical workflows, private storage, short-lived signed URLs, multi-state machine, and versioning.
- **Phase 20 — Customer Account**: High-trust patient portal, prominent reorder center with real-time stock/price validation, saved medicines, address book, and security settings.
- **Phase 21 — Order Tracking**: Real-time multi-stage visual timeline, carrier tracking integration, prescription gating, GSAP micro-interactions with accessibility, and event-driven notifications.

---

## User Review Required

> [!IMPORTANT]
> **Human Verification as Non-Negotiable Source of Truth:**
> AI or automated tools may extract metadata (OCR, dosage, doctor name), but **NEVER independently approve prescriptions or authorize medicine dispensing**. All clinical determinations must be executed by an authorized `CLINICAL_PHARMACIST` or `COMPLIANCE_ADMIN`.

> [!IMPORTANT]
> **Reorder Safety Rule:**
> An old order is only a historical reference. Reordering **NEVER blindly duplicates an old order**. The reorder engine validates current pricing (highlighting deltas), real-time inventory, product availability, current destination rules, and prescription expiration before permitting checkout.

---

## Proposed Changes

### 1. Database Architecture & Schema Extensions

#### [MODIFY] [prisma/schema.prisma](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/prisma/schema.prisma)
- **`PrescriptionStatus` Enum**: Add `UPLOADED`, `MORE_INFORMATION_REQUIRED`, `APPROVED`, `REVOKED` while preserving existing `PENDING_REVIEW`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `EXPIRED`.
- **`Prescription` Model**:
  - Add `originalFileName String?`
  - Add `documentHash String?` (SHA-256 integrity digest)
  - Add `rejectionReasonCode String?` (standardized reason codes)
  - Add `customerMessage String? @db.Text` (customer-facing feedback, strictly separate from internal notes)
  - Add `version Int @default(1)` (audit-compliant document versioning)
  - Add `reviewedAt DateTime?` and `reviewedByUserId String?`
  - Add `customerId String?` linking to `Customer?`
- **`SavedMedicine` Model [NEW]**:
  - `id String @id @default(uuid())`
  - `customerId String` (foreign key to `Customer`)
  - `productId String` (foreign key to `Product`)
  - `createdAt DateTime @default(now())`
  - `@@unique([customerId, productId])`
- **Relations**:
  - `Customer.savedMedicines SavedMedicine[]`
  - `Product.savedBy SavedMedicine[]`

---

### 2. Core Domain Services (`src/lib/services/`)

#### [NEW] [prescriptionService.ts](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/lib/services/prescriptionService.ts)
- `createPrescriptionSubmission`: Validates file size, MIME type (PDF, JPEG, PNG), computes SHA-256 hash, generates safe storage key, persists record, logs audit event.
- `getPrescriptionById`: Verifies caller ownership or clinical review permissions (IDOR defense) and generates short-lived (15-min) HMAC-signed download URL.
- `getCustomerPrescriptions`: Retrieves paginated list of prescriptions belonging to the customer.
- `getPrescriptionReviewQueue`: Retrieves active review queue for `CLINICAL_PHARMACIST` and `COMPLIANCE_ADMIN` with status and date filters.
- `reviewPrescription`: Enforces valid state transitions (`APPROVE`, `REJECT`, `REQUEST_MORE_INFO`), records structured reason codes, maintains separate internal notes vs customer message, records audit log.
- `resubmitPrescription`: Increments version and resets review status without destroying historical documentation.

#### [NEW] [reorderService.ts](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/lib/services/reorderService.ts)
- `getCustomerReorderItems`: Aggregates previously purchased medicines, fetches current inventory, checks current pricing (calculating delta between original and current price), and checks prescription validity.
- `validateAndExecuteReorder`: Atomic validation preventing duplicate requests, confirming stock availability, and assembling cart/order. Safe wording prevents clinical advice overreach.

#### [NEW] [savedMedicineService.ts](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/lib/services/savedMedicineService.ts)
- `toggleSavedMedicine`: Adds or removes medicine from customer's saved list with uniqueness constraint.
- `getCustomerSavedMedicines`: Fetches saved medicines with real-time stock and price metadata.

#### [NEW] [trackingService.ts](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/lib/services/trackingService.ts)
- `getOrderTrackingDetails`: Maps internal order status and shipment stages to customer-friendly timeline milestones. Returns carrier name, tracking number, tracking link, ETA, and prescription gating banner.
- `recordTrackingEvent`: Validates state transitions (prevents invalid backward status jumps), records `TrackingEvent`, updates order/shipment status, triggers notification event with idempotency.

#### [NEW] [notificationService.ts](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/lib/services/notificationService.ts)
- Dispatches event-driven notifications (`ORDER_PLACED`, `PRESCRIPTION_MORE_INFO_REQUIRED`, `PRESCRIPTION_APPROVED`, `ORDER_DISPATCHED`, `ORDER_DELIVERED`) with deduplication keys.

---

### 3. API Routes (`src/app/api/`)

#### Prescription APIs
- `POST /api/prescriptions/upload`: Rate limited (10/hr), CSRF protected, validates file, records submission.
- `GET /api/prescriptions`: IDOR-protected list (customers see own; clinical reviewers see review queue).
- `GET /api/prescriptions/[id]`: IDOR-protected details with 15-minute signed document URL.
- `POST /api/prescriptions/[id]/review`: Restricted to `CLINICAL_PHARMACIST` & `COMPLIANCE_ADMIN`.
- `POST /api/prescriptions/[id]/resubmit`: Customer resubmission for more info / rejected cases.

#### Customer Account APIs
- `GET /api/customer/orders`: Returns customer's historical orders with snapshot items and statuses.
- `GET /api/customer/orders/[id]`: Returns detailed order information with immutable address snapshot.
- `GET /api/customer/saved-medicines` & `POST /api/customer/saved-medicines`: Toggle and view saved medicines.
- `GET /api/customer/reorder`: Fetches eligible reorder items with real-time price deltas and stock checks.
- `POST /api/customer/reorder`: Executes reorder preparation with idempotency safeguards.
- `GET /api/customer/addresses` & `POST /api/customer/addresses`: Address book management.
- `GET /api/customer/profile` & `PATCH /api/customer/profile`: Contact details and security preferences.

#### Order Tracking APIs
- `GET /api/orders/[id]/tracking`: Returns customer tracking timeline and shipment status.
- `POST /api/orders/[id]/tracking/event`: Staff/carrier tracking event creation with state machine validation.

---

### 4. UI Components & Pages

#### [MODIFY] [src/app/(store)/account/page.tsx](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/app/%28store%29/account/page.tsx)
- Replaces static mockup with production-grade interactive Patient Portal with sub-views:
  - **Overview**: Active order timeline preview, quick actions, summary cards.
  - **My Orders**: Order history cards with status badges, price, items, tracking link, and reorder trigger.
  - **Prescriptions**: Prescriptions on file, upload modal with drag-and-drop, format validation, signed URL viewer, resubmission banner.
  - **Reorder Center**: Previous medicines with price delta indicator, stock status, 1-click reorder.
  - **Saved Medicines**: Fast-access saved catalog items with live availability.
  - **Addresses**: Address card manager with default tag and edit modal.
  - **Support**: Support tickets list and new inquiry creator.
  - **Profile & Security**: Contact details, session overview, and MFA status.

#### [NEW] [src/app/(store)/orders/[orderNumber]/tracking/page.tsx](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/app/%28store%29/orders/%5BorderNumber%5D/tracking/page.tsx)
- Dedicated tracking page featuring:
  - Visual timeline (Order Placed $\rightarrow$ Verification $\rightarrow$ Processing $\rightarrow$ Packed $\rightarrow$ Dispatched $\rightarrow$ In Transit $\rightarrow$ Delivered).
  - GSAP entrance and pulse animations respecting `prefers-reduced-motion`.
  - Live carrier info, tracking ID, and direct carrier link.
  - Prescription gating banner ("Prescription verification in progress" / "Action required" / "Prescription verified").

#### [NEW] [src/components/prescriptions/PrescriptionUploadModal.tsx](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/components/prescriptions/PrescriptionUploadModal.tsx)
- Accessible, secure drag-and-drop file upload with client-side format/size validation, upload progress, and physician metadata fields.

#### [NEW] [src/components/prescriptions/PrescriptionReviewQueue.tsx](file:///c:/Users/Rohit%20Pote/Desktop/Personal%20Projects/IndoPharm/src/components/prescriptions/PrescriptionReviewQueue.tsx)
- Clinical review interface for pharmacists: document preview via signed URL, patient details, and structured review buttons (`Approve`, `Request More Info`, `Reject` with reason codes).

---

## Verification Plan

### Automated Test Suite (`tests/prescriptions_and_tracking.test.mjs`)
- **Prescription System (15 tests)**:
  - File upload validation (PDF, JPEG, PNG allowed; EXE/unsupported rejected; 10MB limit enforced).
  - Path traversal defense (`../../etc/passwd` blocked in storage keys).
  - IDOR protection: Patient A allowed to access own prescription; Patient B rejected with HTTP 403; Support agent rejected from ePHI; Pharmacist allowed.
  - State machine: `UPLOADED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `APPROVED` / `REJECTED` / `MORE_INFORMATION_REQUIRED`. Invalid jumps rejected.
  - Resubmission: Creates version 2 while keeping version 1 in history.
  - Signed URL generation: Valid 15-minute token; tampered signature rejected.
- **Customer Account & Reorder (15 tests)**:
  - Patient sees only own orders; cannot access Patient B's orders (IDOR).
  - Saved medicines: Add, duplicate prevention, delete.
  - Reorder validation: Detects out-of-stock, detects price increase/decrease, detects expired prescription.
  - Reorder idempotency: Repeated reorder requests prevented.
  - Address book: Creation, default assignment, immutable snapshot on order.
- **Order Tracking (15 tests)**:
  - Sequential timeline progression.
  - State machine: Invalid backward jump (`DELIVERED` $\rightarrow$ `PROCESSING`) rejected.
  - Carrier tracking metadata properly mapped without fabricating data.
  - Gated prescription banner displayed accurately.
  - Notification deduplication logic verified.

### Build & Full Regression Verification
- Run `npx -y tsx tests/prescriptions_and_tracking.test.mjs`
- Run `npx -y tsx tests/security.test.mjs` (84 tests)
- Run `npx -y tsx tests/database.test.mjs` (29 tests)
- Run `npx -y tsx tests/payment.test.mjs` (34 tests)
- Run `npm test` (18 tests)
- Run `npx tsc --noEmit`
- Run `npm run build`
