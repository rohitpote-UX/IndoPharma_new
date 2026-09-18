# INDOPHARM — CROSS-BORDER ORDER TRACKING ARCHITECTURE (PHASE 21)

## 1. Overview & Customer Experience

Cross-border pharmaceutical delivery requires maximum transparency to build trust with patients awaiting life-essential maintenance medications.

IndoPharm's Order Tracking Engine (`/orders/[orderNumber]/tracking`) maps complex internal warehouse stages and cross-border customs checkpoints into an intuitive, 8-milestone visual journey:

1. **Order Placed & Verified**: Transaction confirmed, cryptographic invoice recorded.
2. **Prescription Verification**: Human clinical review by licensed Indian pharmacist (or marked "Over-The-Counter" if not required).
3. **Dispensing & Cold-Chain Packing**: Batch COA verified, packaged in tamper-evident temperature-controlled containers.
4. **Indian Export Customs**: CDSCO drug controller export customs clearance at Mumbai Air Cargo Complex (BOM).
5. **International Air Cargo**: Secured transit in pressurized, temperature-monitored international cargo flight.
6. **US Customs & FDA Clearance**: Formally cleared under US CBP and FDA 21 CFR § 1301.26 Personal Importation guidelines at Port of Entry (e.g. JFK).
7. **Out for Local Delivery**: Handed over to regional last-mile priority courier vehicle.
8. **Delivered to Patient**: Delivered to customer doorstep with recipient signature.

---

## 2. Direct Carrier Integrations

IndoPharm supports direct deep-linking into international logistics carrier systems:
- **DHL Express**: `https://www.dhl.com/en/express/tracking.html?AWB={trackingNumber}`
- **FedEx Cross-Border**: `https://www.fedex.com/fedextrack/?trknbr={trackingNumber}`
- **USPS**: `https://tools.usps.com/go/TrackConfirmAction?tLabels={trackingNumber}`
- **India Post**: `https://www.indiapost.gov.in/...`
- **Aramex**: `https://www.aramex.com/track/results?shipmentNumber={trackingNumber}`
- **UPS**: `https://www.ups.com/track?tracknum={trackingNumber}`

---

## 3. Notification Deduplication Architecture

Carrier webhooks frequently fire duplicate event payloads due to network retries or re-scans at the same sorting facility.
To prevent sending repetitive SMS or email notifications:
- **Composite Deduplication Key**:
  $$\text{DedupKey} = \text{userId} : \text{NotificationType} : \text{OrderId} : \text{Stage}$$
- **1-Hour Cooldown Window**: Events matching an active key within 60 minutes are suppressed while the event is safely logged for auditing.
