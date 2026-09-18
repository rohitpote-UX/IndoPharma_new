# INDOPHARM — REORDER CENTER & REFILL ENGINE (PHASE 20)

## 1. Real-Time Validation Architecture

Unlike generic e-commerce platforms that blindly copy historical orders, IndoPharm enforces **rigorous real-time safety validation** before any repeat order can be processed.

### 1.1 Real-Time Inventory Checks
- The reorder engine queries live batch and inventory levels (`Inventory.quantityOnHand - Inventory.allocatedQuantity`).
- If an item is out of stock, the reorder button is disabled with a clear "Out of Stock" status.

### 1.2 Price Delta Transparency
- Drug prices fluctuate due to international currency rates and raw material indices.
- IndoPharm calculates the exact delta between the customer's previous purchase price and current catalog price:
  $$\Delta_{\text{price}} = \text{Price}_{\text{current}} - \text{Price}_{\text{previous}}$$
- If $\Delta_{\text{price}} \neq 0$, the patient UI prominently surfaces the change (e.g. `+$5.00` in red or `-$3.00` in green) to ensure complete billing transparency before order authorization.

### 1.3 Prescription Currency & Active Status Check
- If the medication requires a prescription:
  1. The engine checks for an approved prescription on file (`status === 'APPROVED' || status === 'VERIFIED'`).
  2. The prescription must not be expired (`expiresAt > now`).
  3. If no active prescription exists, the reorder button is blocked with an alert: `"New Prescription Required"`, prompting the patient to upload an updated document.

---

## 2. API Contract

### GET `/api/customer/reorder`
Returns candidate refill products from the patient's order history:
```json
{
  "success": true,
  "reorderItems": [
    {
      "productId": "prod-1",
      "productName": "Atorvastatin 20mg",
      "previousPriceUsd": 24.50,
      "currentPriceUsd": 29.50,
      "priceChanged": true,
      "priceDeltaUsd": 5.00,
      "stockAvailable": true,
      "requiresPrescription": true,
      "hasActivePrescription": true,
      "canReorder": true,
      "suggestedQuantity": 1
    }
  ]
}
```

### POST `/api/customer/reorder`
Executes an idempotent reorder transaction, generating a new order record with validated pricing, items, and address snapshots.
