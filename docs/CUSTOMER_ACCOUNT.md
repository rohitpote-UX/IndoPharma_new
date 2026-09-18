# INDOPHARM — CUSTOMER ACCOUNT & PATIENT PORTAL (PHASE 20)

## 1. Overview & Architectural Goals

The IndoPharm Patient Portal (`/account`) is an enterprise healthcare management interface designed for chronic maintenance patients requiring repeat pharmaceutical supplies across international borders.

Key modules:
1. **Overview**: Account summary, approved prescriptions count, active delivery progress.
2. **Orders**: Full order history, line item pricing, live tracking links, invoice downloads.
3. **Prescriptions**: Managed clinical records on file, status indicators, 15-minute signed document downloads, upload/resubmit modals.
4. **Reorder Center**: Automated refill suggestions with live inventory and real-time price delta transparency.
5. **Saved Medicines**: Patient bookmarked maintenance therapies with live stock status.
6. **Addresses**: Verified international delivery destinations with immutable order address snapshot decoupling.
7. **Profile & Security**: Identity management with mass-assignment defense and multi-device session revocation.

---

## 2. Address Book Immutability & Decoupling

In e-commerce, mutating an address in a customer's address book often corrupts past order receipts. 
IndoPharm strictly decouples address management:
- **`Address`**: Represents the customer's current address book entry. Can be edited, replaced, or set as default at any time.
- **`OrderAddressSnapshot`**: An immutable snapshot captured at the exact moment of order placement. Contains `shippingRecipientName`, `shippingPhone`, `shippingLine1`, `shippingLine2`, `shippingCity`, `shippingState`, `shippingPostalCode`, `shippingCountry`.
- Updating the customer's address book NEVER mutates previously placed orders or legal customs declarations.

---

## 3. Mass-Assignment & Parameter Tampering Defenses

The profile update endpoint (`PATCH /api/customer/profile`) implements strict field whitelisting:
- Allowed update fields: `firstName`, `lastName`, `phone`, `medicalNotes`.
- Blocked / rejected fields: `role`, `status`, `isEmailVerified`, `id`, `createdAt`, `passwordHash`.
- Attempted injections of privileged attributes are stripped silently or rejected, preventing privilege escalation.
