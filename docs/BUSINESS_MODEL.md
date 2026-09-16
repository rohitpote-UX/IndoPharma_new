# IndoPharm — Business Model & Supply Chain Governance

**Version:** 2.0.0  
**Status:** Canonical Foundation Specification  
**Classification:** Business Architecture & Strategic Operations  

---

## 1. Executive Summary & Core Business Arbitrage

IndoPharm operates an institutional cross-border pharmaceutical commerce corridor connecting audited Indian pharmaceutical manufacturing infrastructure directly with U.S. chronic maintenance patients.

By removing unnecessary intermediaries—such as Pharmacy Benefit Manager (PBM) spread pricing, secondary domestic brokers, and physical retail overhead—the platform delivers **sustainable 60%–85% patient savings** while maintaining a solid gross margin structure (25%–35%) and full regulatory audibility.

---

## 2. Six-Tier Configurable Responsibility Matrix

The legal, operational, and commercial obligations across the India → USA corridor are decoupled into 6 distinct, configurable tiers. This decoupling ensures IndoPharm can dynamically adapt its operating model (e.g., direct-to-patient personal importation, 503B compounding distribution, or wholesale licensed importer partnerships) as regulatory jurisdictions evolve.

```
+-----------------------------------------------------------------------------------------+
|                                1. THE PLATFORM COMPANY                                  |
|  - Technology core, patient portal, identity verification, and financial escrow ledger. |
|  - Brand governance, transparent pricing engine, and clinical verification software.    |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                              2. MANUFACTURER / SUPPLIER                                 |
|  - WHO-GMP certified & US-FDA audited manufacturing facilities in India.                 |
|  - Production of active pharmaceutical ingredients (APIs) and finished generic dosage.   |
|  - Release of batch Certificate of Analysis (CoA) and tamper-evident lot sealing.        |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                              3. INDIAN OPERATIONS / WAREHOUSE                            |
|  - CDSCO-licensed export consolidation hub (proximity to BOM/DEL air hubs).             |
|  - Climate-controlled storage (USP controlled room temperature: 20°C to 25°C).           |
|  - Barcode scanning, lot-to-order serialization, and international packing.             |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                      4. EXPORT NODE                                     |
|  - Indian Customs clearance, DGCX filing, and export shipping manifest documentation.   |
|  - Bonded international air cargo dispatch (DHL Express / FedEx Cross-Border).           |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                         5. U.S. IMPORTER / FULFILLMENT STRUCTURE                        |
|  - Port of Entry clearance (JFK, ORD, LAX) under FDA Personal Importation (CPG 110.300) |
|    or licensed U.S. Non-Resident Dispensing Pharmacy partner.                           |
|  - Final-mile carrier handoff (USPS Priority / FedEx Home Delivery).                    |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                  6. THE U.S. CUSTOMER                                   |
|  - Submission of authentic, unexpired U.S. prescription from licensed physician (NPI).  |
|  - Personal importation declaration for personal maintenance therapy (max 90-day cap).  |
|  - Doorstep reception with delivery confirmation and clinical pharmacist access line.   |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Tier Responsibility Breakdown

| Operating Tier | Primary Entities | Legal & Regulatory Responsibilities | Configurable Modes |
| :--- | :--- | :--- | :--- |
| **1. Company** | IndoPharm Global Inc. | Software platform, data encryption (HIPAA), customer service, price transparency, escrow ledger. | Direct Platform vs. Managed Marketplace. |
| **2. Manufacturer** | Audited Indian Pharma (e.g., Sun Pharma, Cipla, Dr. Reddy's) | Batch testing, assay purity, stability documentation, active lot serialization. | Direct Supply Contract vs. Authorized Wholesale Consolidator. |
| **3. Warehouse** | Bonded Logistics Hub (Mumbai/Delhi) | Good Distribution Practices (GDP), temperature monitoring, picking validation against prescription lines. | Proprietary Facility vs. Dedicated 3PL Bonded Space. |
| **4. Export** | Licensed Exporter of Record | Compliance with Indian Drugs & Cosmetics Act 1940, Form 29 / NOC export clearance, Air Waybill generation. | Express Consignment vs. Commercial Bonded Freight. |
| **5. U.S. Importer / Fulfillment** | Customs Broker / Licensed Dispensing Partner | FDA Section 801(a) admissibility filing, CBP Form 7501/Section 321 de minimis entry, domestic carrier tracking. | Personal Importation Courier vs. Licensed Non-Resident Pharmacy Partner. |
| **6. Customer** | U.S. Patient / Family Caregiver | Valid U.S. prescriber NPI, adherence to 90-day personal supply limitation, non-resale certification. | Cash-Pay Patient vs. Self-Insured Employer Carve-out. |

---

## 4. Transparent Landed-Cost Breakdown

Rather than hiding distributor rebates or compounding markups, IndoPharm itemizes costs on every order:

```
Total Patient Cost = FOB Factory Gate (India)
                   + Bonded International Air Cargo
                   + U.S. Customs Brokerage & Entry Filing
                   + Clinical Pharmacist Review & Dispensing Fee
                   + Domestic Delivery (Last Mile)
```

### Representative Cost Model (90-Day Supply Example)
- **FOB Manufacturing Cost:** $3.50
- **International Air Express (Temperature Monitored):** $6.50
- **U.S. Customs Filing & Regulatory Processing:** $2.50
- **Clinical Pharmacist Verification Fee:** $4.50
- **Domestic Carrier Priority Shipping:** $4.50
- **Total Patient Landed Price:** **$21.50**
- **Comparable U.S. Retail Cash Benchmark:** $124.00
- **Patient Savings:** **$102.50 (82.6%)**

---

## 5. Retention, Refills & Referral Flywheel

1. **Chronic Maintenance Alignment:** Focus exclusively on 90-day maintenance therapies (Cardiovascular, Diabetes, Endocrine, Gastrointestinal) where patients reorder 4 times annually.
2. **Predictive Refill Triggers:** Proactive SMS/email refill alerts deployed on Day 75 of a 90-day cycle to ensure zero missed doses during international transit.
3. **Two-Sided Patient Advocacy:** "$20 toward next refill for both referrer and referred patient upon valid prescription approval."
4. **Employer Health Plan Integration (Future Horizon):** Providing self-insured U.S. employers carve-out generic maintenance coverage with direct savings reports.
