# IndoPharm — Payment Security Architecture & Compliance

**Document Classification:** Security & Compliance Policy  
**Scope:** Payment Infrastructure, PCI DSS Scope Minimization, and Data Governance  
**Audience:** Platform Architects, Compliance Auditors, Security Engineers, and Developers

---

## 1. Executive Summary & PCI DSS Scope Strategy

IndoPharm operates as an international telepharmacy platform handling cross-border pharmaceutical transactions. Under **PCI DSS (Payment Card Industry Data Security Standard) v4.0**, our core engineering objective is **complete elimination of cardholder data environment (CDE) footprint** from IndoPharm's primary infrastructure.

### The Golden Rule of PCI Scope
> **IndoPharm systems NEVER receive, process, store, log, or transmit Primary Account Numbers (PAN), cardholder PINs, or Card Verification Values (CVV / CVC).**

By delegating card data collection exclusively to client-side tokenization (hosted fields, mobile SDKs, or drop-in payment elements supplied directly by PCI DSS Level 1 certified payment service providers), IndoPharm qualifies for **PCI DSS SAQ A** (Self-Assessment Questionnaire A), the lowest possible compliance burden.

---

## 2. Card Data Isolation & Tokenization Model

```
Customer Browser
      │
      │ 1. Collects Card Details into iframe directly hosted by Payment Provider
      ▼
Payment Provider Hosted Field (PCI Level 1)
      │
      │ 2. Returns Opaque Provider Client Token (e.g., tok_123, pi_123_secret)
      ▼
Customer Browser
      │
      │ 3. Submits only opaque token to IndoPharm API
      ▼
IndoPharm Application Server (Zero CDE Scope — SAQ A)
      │
      │ 4. Authorizes/Captures using token via server-to-server TLS 1.3
      ▼
Payment Provider Gateway
```

### Data Storage Boundaries: What We Store vs. What We NEVER Store

| Data Field | Stored in IndoPharm DB? | Handling & Storage Policy |
|---|---|---|
| **Full 16-digit PAN** | ❌ **NEVER** | Never enters backend memory; rejected at edge if detected in payload |
| **CVV / CVC / CID** | ❌ **NEVER** | Strict regex scanning rejects payloads containing potential card CVVs |
| **PIN / PIN Blocks** | ❌ **NEVER** | Strict zero-tolerance; unsupported |
| **Card Expiry Date** | ⚠️ *Optional Metadata Only* | Only month/year if returned by tokenization receipt (for UX reminder) |
| **Card Last 4 Digits** | ✅ Yes | Stored in `PaymentAttempt.cardLast4` for customer order history display |
| **Card Brand (Visa, etc.)** | ✅ Yes | Stored in `PaymentAttempt.cardBrand` for receipt rendering |
| **Payment Provider Token** | ✅ Yes | Stored in `PaymentAttempt.providerTransactionId` (opaque string reference) |
| **Customer ID** | ✅ Yes | Pseudonymized reference; separated from ePHI |
| **Order Total** | ✅ Yes | Integer minor units (cents) in `Payment.amountMinorUnits` |

---

## 3. Server-Authoritative Financial Integrity

A common attack vector against commerce applications is **client-side amount tampering** (intercepting HTTP requests to change the transaction amount before submitting to payment gateways).

### Defensive Controls in IndoPharm:
1. **Zero Client Trust on Amounts:**
   - The `/api/payments/intents` route **never accepts an `amount` parameter** from the client.
   - The route accepts only `{ checkoutSessionId }` or an order reference.
   - The backend recalculates the authoritative price by re-evaluating product catalog unit pricing, destination corridor taxes, shipping fees, and active quantity tiers directly from the database/cart state.
2. **Double-Rounding Prevention via Minor Units:**
   - All financial amounts are stored, manipulated, and transmitted using the `Money` domain object (`src/lib/payments/domain/money.ts`).
   - All amounts are strictly integer minor units (e.g., `$49.99 USD` = `4999` cents). Floating point arithmetic (`0.1 + 0.2 === 0.30000000000000004`) is forbidden in all financial code paths.
3. **Currency Invariant Checks:**
   - Every multi-amount operation (adding fees, applying partial refunds) verifies that both operands share the same ISO 4217 currency code before executing.

---

## 4. Webhook Security Architecture

Webhooks represent incoming, unauthenticated HTTP requests from external providers. They are protected by defense-in-depth:

### 1. Cryptographic Signature Verification
- Every provider adapter must implement `verifyWebhook(req: VerifyWebhookRequest): Promise<VerifiedWebhookEvent>`.
- Signatures use HMAC-SHA256 (or provider-specific Ed25519/RSA signatures) computed over the **unparsed raw HTTP request body**.
- Next.js route handlers access `req.text()` or raw buffers before any JSON parsing occurs to prevent JSON serialization discrepancies from invalidating signatures.
- Replay attacks are mitigated by validating the signature timestamp against a maximum clock drift window (typically 300 seconds / 5 minutes).

### 2. Idempotent Processing Store
- Each webhook payload has a provider-assigned unique ID (e.g., `evt_1N...`).
- The `WebhookEvent` table enforces a database-level unique constraint on `(provider, providerEventId)`.
- If an event arrives that has already been recorded with `status = "PROCESSED"`, IndoPharm immediately returns `200 OK` without re-executing state transitions.

### 3. Asynchronous Safe Ack
- If an unknown event or an event with an invalid payload structure is received, IndoPharm logs the event with `status = "FAILED"`, records an audit event, and returns HTTP 200 or 400 according to provider documentation to prevent infinite retry storms.

---

## 5. Defense Against Race Conditions & Double-Spend

Financial state mutations must be atomic and protected against concurrency bugs (e.g., rapid double-clicks on "Pay Now" or concurrent webhook retries).

1. **Idempotency Keys:**
   - Every mutating request (`createPaymentIntent`, `capturePayment`, `refundPayment`) requires or generates a cryptographically random `idempotencyKey` (UUIDv4).
   - In-flight operations acquire a concurrency lock or unique DB record. If a second identical request is received within the idempotency window, the cached previous response is returned.
2. **Strict State Machine:**
   - Payment states follow `PAYMENT_STATUS_TRANSITIONS` (`src/lib/payments/domain/payment-status.ts`).
   - Terminal states (`CAPTURED`, `REFUNDED`, `FAILED`, `CANCELLED`) cannot be transitioned back to pending or authorized states.
   - Backward transitions (e.g., `CAPTURED` → `AUTHORIZED`) are rejected with typed `PaymentStateError`.
3. **Refund Over-Limit Prevention (The Golden Invariant):**
   - In `PaymentService.processRefund()`, the sum of `payment.amountRefundedMinorUnits + requestedRefundAmount` is checked against `payment.amountCapturedMinorUnits`.
   - If the sum exceeds the captured amount, the transaction is aborted with `RefundExceedsCapturableError`.

---

## 6. ePHI Segregation (HIPAA & Pharmaceutical Privacy)

IndoPharm handles both medical prescriptions (ePHI) and financial transactions.

- **Strict Boundary Separation:**
  - Payment processors (Stripe, Adyen, banks) must **NEVER** receive medication names, dosages, active pharmaceutical ingredients (APIs), or prescribing doctor information in order metadata or descriptor fields.
  - Line items sent to payment providers must be anonymized or aggregated:
    - ❌ *Disallowed Descriptor:* `"Order #1234: 1x Atorvastatin 20mg, 1x Finasteride 1mg"`
    - ✅ *Allowed Descriptor:* `"IndoPharm Health Order #INDO-ORD-1234"`
- **Audit Logging Isolation:**
  - `PaymentAuditEvent` records financial identifiers (`paymentId`, `orderId`, `amount`, `provider`).
  - Clinical records (`Prescription`, `MedicalProfile`) reside in segregated schemas with dedicated access controls.

---

## 7. Secrets Management & Environment Isolation

1. **Hierarchy of Secrets:**
   - Public keys (`NEXT_PUBLIC_PAYMENT_PUBLIC_KEY`) are safe for client-side bundle embedding.
   - Secret API keys (`PAYMENT_SECRET_KEY`) and Webhook Secrets (`PAYMENT_WEBHOOK_SECRET`) reside strictly in server runtime environment variables and are never bundled in client code.
2. **Production Mock Guard:**
   - The `MockPaymentAdapter` contains hard assertions that throw fatal exceptions if instantiated when `NODE_ENV === 'production'`.
   - In production, missing real provider credentials cause fail-closed startup behavior.
3. **Key Rotation Readiness:**
   - Webhook verification supports dual-secret verification during key rotation cycles to ensure zero downtime when updating signing secrets.
