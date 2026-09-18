# INDOPHARM — ORDER & SHIPMENT STATE MACHINE (PHASE 21)

## 1. Unified State Synchronization

IndoPharm synchronizes high-level commercial order status (`OrderStatus`) with physical logistics stages (`ShipmentStage`):

| ShipmentStage (Logistics) | OrderStatus (Commercial / Customer) | Clinical / Logistics Activity |
|---|---|---|
| *None* | `PENDING_PRESCRIPTION` | Order placed; awaiting patient prescription upload |
| *None* | `UNDER_CLINICAL_REVIEW` | Prescription uploaded; clinical pharmacist review in progress |
| *None* | `PAYMENT_PROCESSING` | Prescription approved; payment authorization initiated |
| `INDIA_BONDED_HUB` | `CONFIRMED_PICKING` | Payment captured; warehouse picking batch with COA |
| `INDIA_EXPORT_CUSTOMS` | `EXPORT_CUSTOMS` | Package presented to Indian CDSCO export customs |
| `INTERNATIONAL_AIR_TRANSIT` | `IN_TRANSIT_AIR` | In flight on international commercial air carrier |
| `US_PORT_OF_ENTRY` | `US_CUSTOMS_CLEARANCE` | Inspected by US CBP / FDA under 21 CFR § 1301.26 |
| `OUT_FOR_DELIVERY` | `DOMESTIC_DELIVERY` | Last-mile courier loaded for destination address |
| `DELIVERED` | `DELIVERED` | Delivered; actual delivery timestamp stamped |

---

## 2. Exception & Terminal States

- `CANCELLED`: Order voided before picking.
- `REFUND_PENDING` / `REFUNDED`: Financial refund executed through payment provider.
- `MORE_INFORMATION_REQUIRED`: Halts order progression until patient clarifies prescription scan.
- `DELIVERY_FAILED`: Courier attempted delivery but recipient unavailable; triggers alert for re-attempt.
