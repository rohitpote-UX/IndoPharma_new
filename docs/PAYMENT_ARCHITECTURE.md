# IndoPharm — Payment Architecture (Phase 15)

**Document Classification:** Engineering Architecture  
**Scope:** Payment Infrastructure — Provider-Agnostic Design

---

## 1. Architecture Overview

```
Customer Browser
       │
       │  (1) POST /api/payments/intents  ← { checkoutSessionId }
       │      Amount: IGNORED from client. Retrieved from DB.
       ▼
  Next.js Route Handler
       │
       ▼
  PaymentService  ← src/lib/payments/service.ts
       │  Single authoritative payment orchestrator.
       │  Validates: state, amount, currency, ownership.
       │  Writes: Payment, PaymentAttempt, PaymentAuditEvent (DB)
       │
       ▼
  PaymentProviderAdapter  ← src/lib/payments/types.ts
       │  Provider-agnostic interface.
       │  Checkout NEVER imports adapters directly.
       │
       ▼
  MockPaymentAdapter  ← src/lib/payments/adapters/mock/
  (Future: CheckoutComAdapter, AdyenAdapter, etc.)

       │  Provider-specific response
       ▼
  Returns { providerClientToken }  →  Browser
  (Safe one-time UI token — NOT an API key)

  ─────────────────────────────────────────────────

  Provider Webhook
       │
       ▼
  POST /api/payments/webhooks/:provider
       │  1. Read raw body (BEFORE JSON parse)
       │  2. Verify HMAC signature
       │  3. Check idempotency
       │  4. Normalize event
       │  5. PaymentService.handleNormalizedEvent()
       │     - Verifies amount + currency match DB record
       │     - Updates Payment + Order atomically
       │     - Writes PaymentAuditEvent
       ▼
  200 OK (always, except on signature failure)
```

---

## 2. Payment Domain Model

### Models (Phase 15 Additions)

| Model | Purpose |
|---|---|
| `Payment` | Internal payment record (1:1 with Order initially) |
| `PaymentAttempt` | Individual provider attempt per payment |
| `Refund` | Per-refund record with amount enforcement |
| `WebhookEvent` | Idempotent event store — `@@unique([provider, providerEventId])` |
| `ReconciliationRecord` | Provider vs. internal discrepancy tracking |
| `PaymentAuditEvent` | Immutable financial audit trail |
| `PaymentProviderConfig` | Configuration-driven provider registry |

### Money Representation

> **CRITICAL: Never use floats for financial amounts.**

All monetary values in the payment domain use **integer minor units**:
- `$125.00 USD` → `12500` (minor unit = cents)
- `¥500 JPY` → `500` (zero-decimal currency)

Use `src/lib/payments/domain/money.ts` for all conversions.

---

## 3. Payment State Machine

```
CREATED
  ├─► REQUIRES_ACTION  ─► PENDING ─► AUTHORIZED
  ├─► PENDING ─► AUTHORIZED
  ├─► AUTHORIZED ─► CAPTURE_PENDING ─► CAPTURED ─► SUCCEEDED
  └─► FAILED (terminal)

AUTHORIZED
  └─► CANCELLED (terminal — Rx rejected before capture)

CAPTURED / SUCCEEDED
  ├─► PARTIALLY_REFUNDED ─► REFUNDED
  └─► DISPUTED ─► CHARGEBACK (terminal)

UNKNOWN (any state — after reconciliation resolves)
```

**State machine enforcement:** `src/lib/payments/domain/payment-status.ts`

Invalid transitions throw `PaymentStateError` — never silently accepted.

---

## 4. PaymentProviderAdapter Interface

```typescript
interface PaymentProviderAdapter {
  readonly providerId: string;
  readonly capabilities: PaymentProviderCapabilities;

  createPaymentIntent(req: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>;
  authorizePayment(req: AuthorizePaymentRequest): Promise<AuthorizePaymentResponse>;
  capturePayment(req: CapturePaymentRequest): Promise<CapturePaymentResponse>;
  getPaymentStatus(req: GetPaymentStatusRequest): Promise<GetPaymentStatusResponse>;
  refundPayment(req: RefundPaymentRequest): Promise<RefundPaymentResponse>;
  verifyWebhook(req: VerifyWebhookRequest): Promise<VerifiedWebhookEvent>;
  normalizeWebhookEvent(verified: VerifiedWebhookEvent): Promise<NormalizedPaymentEvent>;
}
```

**Architecture rules:**
- Checkout NEVER imports adapters directly
- Checkout NEVER imports provider SDKs
- Adapter selection: only via `getPaymentAdapter()` factory
- Only `PaymentService` calls `getPaymentAdapter()`

---

## 5. API Routes

| Route | Method | Auth Required | Purpose |
|---|---|---|---|
| `/api/payments/intents` | POST | User session | Create payment intent |
| `/api/payments/:id` | GET | Owner or staff | Get payment status |
| `/api/payments/:id/capture` | POST | COMPLIANCE_ADMIN, OPS_WAREHOUSE | Capture authorized payment |
| `/api/payments/:id/refund` | POST | Staff role | Initiate refund |
| `/api/payments/webhooks/:provider` | POST | None (signature verified) | Receive provider webhook |

---

## 6. Webhook Security

1. Raw body read via `req.arrayBuffer()` — before any JSON parsing
2. HMAC-SHA256 signature verification (provider-specific)
3. `@@unique([provider, providerEventId])` DB constraint → exactly-once processing
4. Duplicate events: 200 OK returned (not 409) to prevent provider retry storms
5. Failed signature: 401 Unauthorized — event not stored

---

## 7. Idempotency

- Payment creation: `idempotencyKey` field on `Payment` — `@unique`
- Refund creation: `idempotencyKey` field on `Refund` — `@unique`
- Webhook deduplication: `@@unique([provider, providerEventId])` on `WebhookEvent`

---

## 8. Amount Integrity

1. Client amount is NEVER used
2. Amount is read from `Order.totalUsd` in the database
3. Webhook amount verified against `Payment.amountMinorUnits` before state change
4. Refund total enforced: `refundedMinorUnits + newRefund ≤ capturedMinorUnits`
5. Any mismatch creates a `ReconciliationRecord` for investigation

---

## 9. Environment Variables

```bash
PAYMENT_PROVIDER=mock                           # Provider adapter code
PAYMENT_SECRET_KEY=""                           # Provider secret (never in code)
PAYMENT_PROVIDER_MOCK_WEBHOOK_SECRET=""         # Mock webhook HMAC secret
PAYMENT_WEBHOOK_SECRET=""                       # Fallback webhook secret
PAYMENT_CAPTURE_MODE=manual                     # "manual" | "automatic"
PAYMENT_INTENT_EXPIRY_SECONDS=1800              # 30 minutes
PAYMENT_MOCK_GUARD=true                         # Prevents mock in production
```
