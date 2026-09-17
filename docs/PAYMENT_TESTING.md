# IndoPharm — Payment Testing Strategy & Verification Guide

**Document Classification:** Engineering & QA Guide  
**Scope:** Payment Infrastructure Test Automation, Simulation Harnesses, and CI/CD Verification  
**Audience:** Full-Stack Engineers, QA Automation Engineers, DevOps

---

## 1. Overview & Verification Philosophy

Testing payment systems requires higher verification rigor than standard CRUD operations. In IndoPharm, financial correctness is verified through **defense-in-depth automated testing**:

1. **Pure Domain Logic Testing** (zero DB, zero network): Money value objects, integer math invariants, currency compatibility, state transitions.
2. **Adapter Contract & Mock Lifecycle Testing**: Intent creation, authorization, capture, multi-stage partial refund, full refund, webhook HMAC validation, event normalization.
3. **Security Invariant Verification**: Tamper rejection, over-refund prevention, terminal state monotonicity, error message sanitization.
4. **End-to-End Cart & Checkout Integration**: Verification that order placement interacts safely with the payment layer under both normal and network failure conditions.

---

## 2. Test Suites Directory & Commands

IndoPharm provides two complementary automated test suites:

### Suite 1: Phase 15 Payment Architecture Test Suite (`tests/payment.test.mjs`)
Covers the entire payment subsystem across 34 granular scenarios.

```bash
# Run payment test suite via tsx
npx -y tsx tests/payment.test.mjs
```

### Suite 2: Core Eligibility & Checkout Test Suite (`tests/eligibility_and_checkout.test.mjs`)
Verifies cart calculations, destination restrictions, prescription gatekeeping, and checkout order placement.

```bash
# Run core eligibility & checkout suite
npm test
```

### Full Verification Checklist
```bash
# 1. Strict TypeScript compilation (0 errors)
npx tsc --noEmit

# 2. Eligibility & Checkout scenarios (18 scenarios)
npm test

# 3. Payment domain, lifecycle, refund, webhook scenarios (34 scenarios)
npx -y tsx tests/payment.test.mjs

# 4. Production Next.js build validation
npm run build
```

---

## 3. Scenarios Covered in `tests/payment.test.mjs`

### A. Money Value Object (`src/lib/payments/domain/money.ts`)
- `toMinorUnits`: USD conversion from dollar strings (`$125.00` → `12500` cents).
- `toMinorUnits`: Floating-point safety and deterministic rounding for fractional inputs.
- `toMinorUnits`: Currency whitelist check; rejects invalid or unsupported currency codes.
- `createMoney`: Disallows floating-point minor units (`125.5` cents throws an invariant error).
- `addMoney`: Enforces currency homogeneity; throws on currency mismatch.
- `wouldExceed`: Validates proposed refund amounts against remaining capturable balances.

### B. State Machine Transitions (`src/lib/payments/domain/payment-status.ts`)
- Forward lifecycle: `CREATED` → `AUTHORIZED` → `CAPTURED`.
- Post-capture transitions: `CAPTURED` → `PARTIALLY_REFUNDED` → `REFUNDED`.
- Backward transition rejection: Disallows `CAPTURED` → `AUTHORIZED`.
- Terminal state monotonicity: Terminal states (`FAILED`, `REFUNDED`, `CANCELLED`) cannot transition backwards.
- Webhook event normalization to internal payment status mappings.

### C. Mock Payment Adapter Full Lifecycle (`src/lib/payments/adapters/mock/adapter.ts`)
- `createPaymentIntent`: Returns client tokens (`mock_cs_...`) without performing financial capture.
- `authorizePayment`: Transitions payment to `AUTHORIZED` and returns authorization code.
- `capturePayment`: Successfully captures previously authorized payments.
- `getPaymentStatus`: Reads and reflects real-time status.
- State enforcement: Capturing non-authorized payments is rejected.

### D. Multi-Stage Refunds & Over-Refund Guard
- Partial refund 1: Successfully refunds partial amount and transitions to `PARTIALLY_REFUNDED`.
- Partial refund 2: Allows subsequent partial refund if within remaining captured balance.
- **The Golden Rule Violation**: Rejects refund requests that would cause total refunds to exceed total captured amount.
- Full refund completion: Transitions to `REFUNDED` once cumulative refunded amount equals captured amount.

### E. Webhook Signature & Normalization
- Missing signature header rejection.
- Valid HMAC-SHA256 signature verification.
- Tampered signature rejection.
- Event payload normalization to `NormalizedPaymentEvent`.

### F. Security Invariant Assertions
- `getSafePaymentErrorMessage`: Never leaks database errors, stack traces, or gateway secret tokens to client.
- `AmountMismatchError`: Captures discrepancies between requested and authoritative amounts.
- `RefundExceedsCapturableError`: Enforces safety boundaries on financial reversals.
- Capturable and refundable status whitelists are restricted strictly to safe domain states.

---

## 4. Simulating Provider Webhooks in Development

During local development, webhooks can be simulated using `curl` or Postman targeting `/api/payments/webhooks/mock`.

### Generating a Valid Mock Webhook
The mock webhook endpoint verifies HMAC-SHA256 signatures using `PAYMENT_PROVIDER_MOCK_WEBHOOK_SECRET` (default: `whsec_mock_dev_secret`).

#### Example Payload (`webhook-payload.json`):
```json
{
  "eventId": "evt_mock_test_12345",
  "eventType": "payment.captured",
  "timestamp": 1726617600000,
  "paymentId": "pay_test_abc123",
  "amount": 4999,
  "currency": "USD",
  "status": "CAPTURED"
}
```

#### Computing HMAC-SHA256 Signature (Node.js snippet):
```javascript
const crypto = require('crypto');
const secret = process.env.PAYMENT_PROVIDER_MOCK_WEBHOOK_SECRET || 'whsec_mock_dev_secret';
const payload = JSON.stringify(data);
const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
console.log('x-mock-signature:', signature);
```

#### Sending Request:
```bash
curl -X POST http://localhost:3000/api/payments/webhooks/mock \
  -H "Content-Type: application/json" \
  -H "x-mock-signature: <computed_signature>" \
  --data-binary @webhook-payload.json
```

---

## 5. Adding Tests for a New Payment Provider

When onboarding a new provider adapter (e.g. Stripe, Adyen), follow these testing guidelines:

1. **Unit Test the Adapter**:
   - Create `tests/adapters/<provider>.test.mjs`.
   - Mock external HTTP requests to the provider API using standard fixtures.
   - Verify that all methods in `PaymentProviderAdapter` produce standardized responses matching domain types.
2. **Webhook Verification Tests**:
   - Test against real provider sample webhook fixtures.
   - Test valid signatures, invalid signatures, expired timestamp headers, and replay attacks.
3. **Error Normalization Tests**:
   - Test mapping of provider-specific decline codes (e.g., `card_declined`, `insufficient_funds`, `expired_card`) to standardized IndoPharm error classes.
