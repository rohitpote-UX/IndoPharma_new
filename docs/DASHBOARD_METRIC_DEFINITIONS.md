# INDOPHARM — DASHBOARD METRIC DEFINITIONS

This document establishes the **authoritative, non-ambiguous definitions** for every Key Performance Indicator (KPI) computed in the IndoPharm Admin Command Center. All engineering, financial, and operations teams must adhere strictly to these formulas.

---

## 1. Financial & Revenue Metrics

### 1.1 Qualifying Order Statuses
An order is considered "qualifying" for financial recognition ONLY when payment is successfully captured or the order is in active fulfillment / delivery:
- `CONFIRMED_PICKING`
- `EXPORT_CUSTOMS`
- `IN_TRANSIT_AIR`
- `US_CUSTOMS_CLEARANCE`
- `DOMESTIC_DELIVERY`
- `DELIVERED`
- `PARTIALLY_REFUNDED`
- `REFUNDED`

**Strictly Excluded**:
- `CANCELLED`
- `PAYMENT_FAILED`
- `PAYMENT_PROCESSING`
- `PENDING_PRESCRIPTION` (payment not yet captured)

### 1.2 Gross Sales
$$\text{Gross Sales} = \sum_{\text{qualifying orders}} \text{subtotalUsd}$$
*Represents total catalogue value of items purchased before promo codes or discount deductions.*

### 1.3 Discounts
$$\text{Discounts} = \sum_{\text{qualifying orders}} \text{discountTotalUsd}$$
*Represents promotional coupons, referral credits, and volume discounts applied to orders.*

### 1.4 Processed Refunds
$$\text{Refunds} = \sum (\text{Refund.amountMinorUnits} / 100) \quad \text{where } \text{Refund.status} = \text{'SUCCEEDED'}$$
*Refunds in `REQUESTED` or `PROCESSING` are tracked separately as pending liabilities, not deducted from recognized revenue until provider settlement.*

### 1.5 Net Revenue
$$\text{Net Revenue} = \text{Gross Sales} - \text{Discounts} - \text{Refunds} + \text{Shipping} + \text{Dispensing Fees} + \text{Taxes}$$
*Equivalently: Total funds received from captured orders minus processed refunds.*

### 1.6 Period-over-Period Growth Percentage
$$\text{Growth \%} = \frac{\text{Net Revenue}_{\text{current}} - \text{Net Revenue}_{\text{prior}}}{\text{Net Revenue}_{\text{prior}}} \times 100$$
*If $\text{Net Revenue}_{\text{prior}} \le 0$, the dashboard returns `null` to avoid misleading infinite or undefined growth metrics.*

---

## 2. Orders & Operations Metrics

### 2.1 Total Orders
$$\text{Total Orders} = \text{Count of all Order records created within the reporting window}$$

### 2.2 Average Order Value (AOV)
$$\text{AOV} = \frac{\sum \text{totalUsd of paid orders}}{\text{Count of paid orders}}$$
*Returns $0.00 if paid order count is 0.*

### 2.3 Fulfillment Funnel Stages
1. **Placed**: All incoming orders.
2. **Clinical Verified**: Orders where prescription verification is approved or OTC.
3. **Picking & Batch COA**: Orders in `CONFIRMED_PICKING`.
4. **Packed & Export Cleared**: Orders in `EXPORT_CUSTOMS` or `INDIA_BONDED_HUB`.
5. **Dispatched & In-Transit**: Orders in `IN_TRANSIT_AIR` or `INTERNATIONAL_AIR_TRANSIT`.
6. **Delivered**: Orders in `DELIVERED`.
7. **Cancelled**: Orders voided prior to picking.

---

## 3. Clinical Verification Workload & SLAs

### 3.1 Pending Verification Count
Count of prescriptions in active review states:
- `PENDING_REVIEW` / `UPLOADED`: Awaiting pharmacist assignment.
- `UNDER_REVIEW`: Currently open by a licensed pharmacist.
- `MORE_INFORMATION_REQUIRED`: Awaiting patient clarification.

### 3.2 Clinical Verification SLA Tiers
Measured from `Prescription.createdAt` to current time:
- **Within SLA**: $\text{elapsed} < 2\text{ hours}$
- **Approaching SLA**: $2\text{ hours} \le \text{elapsed} \le 4\text{ hours}$
- **Overdue SLA**: $\text{elapsed} > 4\text{ hours}$

---

## 4. Inventory Health & Safety Stock

### 4.1 Stock Status Thresholds
Computed from `Inventory.quantityAvailable` (i.e. $\text{quantityOnHand} - \text{quantityReserved}$):
- **Out of Stock**: $\text{quantityAvailable} \le 0$
- **Critical**: $\text{quantityAvailable} \le \text{safetyStock}$ (where $\text{safetyStock} = \lfloor\text{reorderThreshold} / 2\rfloor$)
- **Low Stock**: $\text{safetyStock} < \text{quantityAvailable} \le \text{reorderThreshold}$
- **Healthy**: $\text{quantityAvailable} > \text{reorderThreshold}$

### 4.2 Near-Expiry Batches
Count of active batches (`quantityRemaining > 0`) with `expiryDate <= now + 90 days`.

---

## 5. Customer Growth & Repeat Retention

### 5.1 Purchasing Customers
Distinct count of `customerId` values associated with $\ge 1$ qualifying order within the reporting period.

### 5.2 Repeat Customers
Count of distinct customers who have completed $\ge 2$ qualifying orders (all-time or within period).

### 5.3 Repeat Customer Rate
$$\text{Repeat Customer Rate} = \frac{\text{Repeat Customers}}{\text{Total Purchasing Customers}} \times 100\%$$
*Returns $0.0\%$ if purchasing customers count is 0.*
