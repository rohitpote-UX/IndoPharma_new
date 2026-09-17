# IndoPharm — Payment Provider Onboarding Checklist

> Complete ALL steps before deploying a new payment provider to production.

---

## Pre-Implementation: Business & Compliance Requirements

Before writing a single line of code:

- [ ] **Step 1** — Business eligibility verified: Provider supports **MCC 5122** (Drugs, Drug Proprietaries & Druggists' Sundries) or **MCC 5912** (Drug Stores & Pharmacies) for cross-border pharmaceutical transactions.
- [ ] **Step 2** — India→US settlement corridor approved: Provider's underwriting team has confirmed India-to-US cross-border settlement is supported under your business registration.
- [ ] **Step 3** — Underwriting letter/approval received and stored in compliance records.
- [ ] **Step 4** — Legal review: Legal team confirms the provider's Terms of Service are compatible with IndoPharma's pharmaceutical model.
- [ ] **Step 5** — PCI scope assessed: Confirm whether integration is hosted-fields (preferred), redirected, or custom form. Update PCI compliance posture accordingly.
- [ ] **Step 6** — Webhook endpoint IP allowlist: Obtain provider's published webhook IP ranges and configure at WAF/CDN level.

---

## Implementation Steps

- [ ] **Step 7** — Create `src/lib/payments/adapters/<provider>/adapter.ts`
  - Implement `PaymentProviderAdapter` interface completely
  - Do NOT import any IndoPharm business logic inside the adapter
  - All amounts: receive from requests as minor units, return as minor units

- [ ] **Step 8** — Create `src/lib/payments/adapters/<provider>/webhook.ts`
  - Implement provider's documented signature verification algorithm exactly
  - Use constant-time string comparison (see mock implementation)
  - Document the header name that contains the signature

- [ ] **Step 9** — Create `src/lib/payments/adapters/<provider>/mapper.ts`
  - Map ALL provider event types to `NormalizedPaymentEvent`
  - Include a `default` case that returns `PAYMENT_STATUS_UNKNOWN`
  - Document which provider event strings correspond to which normalized types

- [ ] **Step 10** — Register in `src/lib/payments/provider.ts`
  - Add a new `case` to the `getPaymentAdapter()` switch statement
  - Guard: check `NODE_ENV` and `PAYMENT_MOCK_GUARD` if applicable

- [ ] **Step 11** — Add `PaymentProviderConfig` record to the database
  - Set `pharmaCategoryApproved = true` (post business verification)
  - Set `crossBorderNotes` with reference to underwriting approval date
  - Set correct `supportedCurrencies`, `supportedCountries`, `captureMode`

- [ ] **Step 12** — Add environment variables to `.env.example` and secrets store
  - `PAYMENT_PROVIDER=<provider-code>`
  - `PAYMENT_SECRET_KEY=<secret>` (never commit)
  - `PAYMENT_WEBHOOK_SECRET=<signing-secret>` (never commit)

---

## Verification Steps

- [ ] **Step 13** — Write adapter-specific test file: `tests/payment.<provider>.test.mjs`
  - Test: createPaymentIntent → providerPaymentId returned
  - Test: authorize → capture flow
  - Test: full refund
  - Test: partial refund
  - Test: webhook signature verification with test vector from provider docs
  - Test: duplicate webhook idempotency

- [ ] **Step 14** — Run existing test suites; confirm 0 regressions
  ```bash
  npm run test
  npx tsx tests/payment.test.mjs
  ```

- [ ] **Step 15** — Sandbox end-to-end test using provider's sandbox environment
  - Complete checkout → payment intent → provider UI → webhook → order confirmed
  - Test capture via admin API
  - Test refund via admin API

- [ ] **Step 16** — Security review
  - Confirm no provider SDK imported outside adapter directory
  - Confirm no provider-specific status strings leak outside mapper.ts
  - Confirm webhook secret is not logged anywhere

- [ ] **Step 17** — Deploy to staging, run smoke tests, get security sign-off before production
