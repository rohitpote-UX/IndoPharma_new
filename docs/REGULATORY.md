# IndoPharm — Regulatory Framework & Compliance Matrix

**Document Classification:** Legal, Clinical & Regulatory Governance  
**Scope:** Cross-Border Pharmaceutical Sourcing (India) & Importation/Dispensing (United States)  
**Standard:** Truth-in-Healthcare Communications; Non-Binary Regulatory Classification  

---

## 1. Regulatory Communications & UX Principles

### 1.1 Forbidden Claims & Phrases
Under federal consumer protection standards and FDA misbranding laws (21 U.S.C. § 352), IndoPharm strictly forbids the use of any deceptive or unverified blanket claims across all web, mobile, and documentation interfaces.

**EXPLICITLY PROHIBITED:**
- ❌ "FDA Approved" (unless referring strictly to an official U.S. ANDA/NDA referenced by exact number for an active reference drug)
- ❌ "100% Legal"
- ❌ "FDA Certified" (The FDA does not issue certificates to foreign pharmacies or websites)
- ❌ "Safe for Everyone"
- ❌ "Prescription Not Required"

### 1.2 Approved Nuanced Language
All customer-facing and clinical communications must utilize verified, factual disclosures:
- ✅ *"Information provided for reference"*
- ✅ *"Requirements may vary based on destination and prescriber jurisdiction"*
- ✅ *"Additional verification may be required by clinical pharmacist before dispensing"*
- ✅ *"Facilitated under FDA Personal Importation policy guidelines (CPG Sec. 110.300)"*

---

## 2. Five-Tier Product Classification Framework

No product is ever assigned an assumed regulatory classification. Every entry must be verified through authoritative regulatory databases (FDA Orange Book, NDC Directory, CDSCO approvals) and documented by compliance officers.

| Classification Tier | Operational Definition | Clinical Requirements | Order Eligibility |
| :--- | :--- | :--- | :--- |
| **`OTC` (Over-The-Counter)** | Medications authorized for direct consumer purchase without practitioner supervision under applicable monographs. | Age verification; standard consumer warnings. | Eligible for direct purchase and personal importation. |
| **`PRESCRIPTION`** | Legend drugs requiring medical diagnosis and authorization by a licensed U.S. healthcare practitioner. | Valid, unexpired U.S. prescription; Prescriber NPI check; 90-day personal supply limit. | Eligible upon clinical pharmacist review & approval. |
| **`SUPPLEMENT / OTHER`** | Nutritional supplements, botanicals, and vitamins governed under DSHEA regulations. | Labeling review; facility registration verification. | Eligible subject to customs personal use limits. |
| **`RESTRICTED / NOT ELIGIBLE`** | Strictly barred items: DEA Schedule II–V controlled substances, narrow therapeutic index (NTI) drugs requiring acute titration, temperature-unstable biologics, and recall-listed drugs. | Automatic block; referral to domestic emergency healthcare. | **Completely barred from platform.** |
| **`UNVERIFIED`** | Products undergoing sourcing audit, lab CoA assay evaluation, or pending legal verification. | Pending compliance officer audit. | **Hidden from catalog; not purchasable.** |

---

## 3. U.S. Regulatory Matrix Architecture

The platform rejects binary `available = true / false` logic. Regulatory admissibility is evaluated as a multi-stage data pipeline:

```
[Product]
    │
    ▼
[Destination Jurisdiction] (U.S. Federal + Recipient State Board of Pharmacy)
    │
    ▼
[Regulatory Status] ──► (AVAILABLE | REVIEW REQUIRED | RESTRICTED | NOT AVAILABLE | NOT VERIFIED)
    │
    ▼
[Prescription Requirement] ──► (Valid U.S. Rx Mandatory | OTC Exemption)
    │
    ▼
[Importer Entity] ──► (Patient as Importer of Record / Licensed Pharmacy Partner)
    │
    ▼
[Fulfillment Route] ──► (Bonded Express Consignment Courier | Licensed Non-Resident Mail)
    │
    ▼
[Allowed Purchase Workflow] ──► (Instant Checkout | Pharmacist Review Queue | Blocked Flow)
```

### 3.1 Non-Binary Status Definitions

1. **`AVAILABLE`**: Verified generic maintenance medication; active U.S. prescription required; meets all personal importation criteria.
2. **`REVIEW REQUIRED`**: Medication requires secondary clinical pharmacist scrutiny (e.g., potential drug-drug interaction flag, high-dosage review, or state-specific tele-prescribing rule).
3. **`RESTRICTED`**: Medication cannot be imported into specific U.S. states due to non-resident pharmacy licensure boundaries or specific packaging regulations.
4. **`NOT AVAILABLE`**: Product currently out of verified batch inventory, under supply disruption, or undergoing lot inspection.
5. **`NOT VERIFIED`**: Manufacturing facility or batch CoA is awaiting documentation confirmation. Cannot be ordered.

---

## 4. Statutory Legal Authorities & Verification Matrix

### 4.1 United States Legal Matrix
- **FDA Personal Importation Policy (CPG Sec. 110.300):** Enforcement discretion permitting personal imports for non-controlled maintenance therapy (max 90 days). `[CONFIRMED]`
- **Controlled Substances Act (21 U.S.C. § 801):** Absolute ban on mail-order importation of Schedule II–V substances. `[CONFIRMED]`
- **Section 321 / De Minimis Entry (19 U.S.C. § 1321):** Customs entry procedures for low-value personal shipments. `[TO BE VERIFIED with CBP Broker]`
- **State Non-Resident Pharmacy Licensure:** State-by-state mail-order dispensing permit requirements. `[REQUIRES LEGAL/REGULATORY REVIEW]`

### 4.2 Indian Export Legal Matrix
- **Drugs and Cosmetics Act, 1940 & Rules 1945:** Licensing requirements for export manufacturing and wholesale distribution. `[CONFIRMED]`
- **Certificate of Analysis (CoA) Verification:** Requirement for batch testing and active ingredient assay before dispatch. `[CONFIRMED]`
- **CDSCO Export No Objection Certificate (NOC):** Documentation protocol for international shipment release. `[TO BE VERIFIED]`
