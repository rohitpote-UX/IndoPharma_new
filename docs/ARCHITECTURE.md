# IndoPharm — Technical Architecture & System Design

**Version:** 1.0.0  
**Target Platform:** Next.js 16 App Router (Node.js 24+ / Vercel Edge Runtime)  
**Database:** PostgreSQL 16+ via Prisma ORM  
**Style System:** Tailwind CSS v4 & GSAP  

---

## 1. High-Level Architectural Topology

IndoPharm is structured around a **domain-driven, modular monolith architecture** with clean boundary enforcement between frontend user experiences, secure API gateways, compliance workflows, and backend operational systems.

```
+-----------------------------------------------------------------------------------+
|                                CLIENT SURFACES                                    |
|  +---------------------------+  +--------------------+  +----------------------+  |
|  | (store) Patient Storefront|  | (account) Portal   |  | (admin) Operations   |  |
|  +---------------------------+  +--------------------+  +----------------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                           EDGE MIDDLEWARE & SECURITY                              |
|  - Geo-IP verification & currency resolution                                     |
|  - Rate-limiting (IP & Session bucket)                                           |
|  - Strict Security Headers (CSP, HSTS, X-Frame-Options)                          |
|  - Session authentication & Role-Based Access Control (RBAC)                      |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        NEXT.JS 16 APP ROUTER CORE                                  |
|  +-----------------------------------------------------------------------------+  |
|  | Server Components (RSC) -> SSR catalog, static SEO pages, caching headers   |  |
|  | Client Components -> GSAP animations, cart state, interactive forms         |  |
|  | Server Actions & Route Handlers (/api/*) -> Type-safe mutations & endpoints |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                DOMAIN FEATURES                                    |
|  [Products]  [Prescriptions]  [Cart & Checkout]  [Orders]  [Shipping]  [Payments] |
+-----------------------------------------------------------------------------------+
               |                                                   |
               v                                                   v
+-----------------------------+                     +-------------------------------+
|     INTEGRATION ADAPTERS    |                     |       DATA ACCESS LAYER       |
|  - Agnostic Payment Provider|                     |  - Prisma ORM Client          |
|  - S3-compatible Blob Store |                     |  - Connection pooling (PgBouncer)
|  - International Logistics  |                     |  - Read-replica routing       |
|  - Transactional Email/SMS  |                     |  - Immutable Audit Logger     |
+-----------------------------+                     +-------------------------------+
               |                                                   |
               v                                                   v
+-----------------------------+                     +-------------------------------+
|   EXTERNAL CLOUD SERVICES   |                     |     PERSISTENCE (POSTGRES)    |
|  - Payment Gateways         |                     |  - Master relational DB       |
|  - Prescriber NPI Registry  |                     |  - Encrypted ePHI columns     |
|  - Carrier APIs (DHL/FedEx) |                     |  - Point-in-time recovery     |
+-----------------------------+                     +-------------------------------+
```

---

## 2. Directory & Namespace Conventions

The codebase strictly organizes concerns into modular directories:

```
src/
├── app/                  # Next.js 16 App Router
│   ├── (store)/          # Route group: Patient-facing catalog, education, landing
│   ├── (account)/        # Route group: Patient dashboard, refills, orders
│   ├── (admin)/          # Route group: Pharmacist review, ops, compliance queue
│   ├── api/              # HTTP Route Handlers (health, webhooks, exports)
│   ├── globals.css       # Global styles & Tailwind entry
│   └── layout.tsx        # Base root layout
├── components/           # Reusable UI component library
│   ├── ui/               # Atom-level primitives (Button, Input, Badge, Dialog)
│   ├── layout/           # Organisms (Header, Footer, SubNav, Container)
│   ├── navigation/       # Navigation items, breadcrumbs, user menu
│   ├── commerce/         # Cart drawer, price breakdown, quantity pickers
│   ├── product/          # Product card, CoA drawer, batch inspect
│   ├── trust/            # Transparency cards, compliance notices, provenance
│   └── forms/            # Form controls, file dropzones, validation feedback
├── features/             # Business domain vertical slices
│   ├── products/         # Sourcing models, catalog search, batch metadata
│   ├── cart/             # Cart session management, pricing calculations
│   ├── checkout/         # Order creation state machine, shipping calculation
│   ├── orders/           # Lifecycle tracking, fulfillment milestones
│   ├── prescriptions/    # Secure document intake, NPI validation, status machine
│   ├── payments/         # Agnostic payment intent models & state orchestration
│   ├── shipping/         # Cross-border transit tracking, carrier adapters
│   ├── referrals/        # Viral referral loops, credit tracking
│   ├── pricing/          # Landed-cost formulas (FOB India + Air + Tariffs + Margin)
│   └── users/            # Customer profile, patient addresses, preferences
├── lib/                  # Shared infrastructure & utilities
│   ├── db/               # Prisma singleton client, transaction helpers
│   ├── auth/             # Session management, JWT verification, RBAC guards
│   ├── payments/         # PaymentProvider interface & adapters
│   ├── shipping/         # Logistics service contracts
│   ├── validation/       # Zod schemas for input validation
│   ├── security/         # Cryptography helpers, audit logging, sanitization
│   └── analytics/        # Privacy-compliant event telemetry
├── config/               # App configuration, navigation definitions, constants
├── types/                # Global TypeScript definitions & domain interfaces
├── hooks/                # React hooks (GSAP triggers, media queries, debounce)
└── utils/                # Pure formatting helpers (currency, date, strings)
```

---

## 3. Frontend Architecture

### 3.1 React Server Components (RSC) vs. Client Components
- **RSC by Default:** All product pages, catalog views, static educational content, and layout headers render as React Server Components. This minimizes client bundle size, enables streaming SSR via React Suspense, and ensures optimal Core Web Vitals (LCP < 1.2s).
- **Client Components ('use client'):** Confined strictly to dynamic boundaries:
  - GSAP micro-animations (batch provenance card tilt, milestone progress transitions).
  - Interactive cart drawer & quantity updates.
  - Multi-file prescription upload dropzones with local preview.
  - Multi-step checkout state machine.

### 3.2 Animation Architecture (GSAP)
- GSAP is utilized for purposeful, trust-reinforcing micro-interactions (e.g., smoothly revealing supply-chain milestones, expanding the Landed-Cost Breakdown accordion, and highlighting security badges).
- Standardized hook: `useGsapTimeline` and `useReducedMotion` to strictly respect user accessibility preferences (`prefers-reduced-motion: reduce`).

---

## 4. Backend & API Architecture

### 4.1 Request Pipeline & Middleware
```
Incoming Request
  │
  ├─► Security Header Injection (CSP, HSTS, X-Frame-Options: DENY)
  ├─► CORS Policy Enforcement (Restricted to verified origin)
  ├─► Distributed Rate Limiter (Token bucket per IP / user token)
  ├─► Session Authentication (Encrypted HTTP-only cookies)
  └─► Role Authorization Check (PATIENT | PHARMACIST | OPS_ADMIN | SUPERADMIN)
```

### 4.2 Type-Safe API Validation
- Every incoming payload is validated against strict Zod schemas in `lib/validation/`.
- No raw `req.json()` access without immediate schema parsing.
- Invalid requests immediately return standardized RFC 7807 Problem Details error responses.

---

## 5. Security Boundaries & ePHI Isolation

1. **Document Storage Isolation:** Patient prescriptions and medical notes are never stored directly in the relational database. Documents reside in encrypted S3-compatible private buckets with AES-256 server-side encryption. Access is mediated exclusively through time-bound (max 15-minute) presigned URLs generated after RBAC verification.
2. **Database Field-Level Encryption:** Sensitive patient identifying fields (e.g., date of birth, prescriber NPI, telephone) use application-level AES-GCM encryption before persistence in PostgreSQL.
3. **Audit Logging:** Every view, download, or modification of a prescription or order triggers an immutable `AuditLog` row containing the user ID, role, IP address, timestamp, and action signature.

---

## 6. Deployment Architecture

- **Platform:** Vercel (Edge Network + Serverless Node.js functions)
- **Database:** Managed PostgreSQL (e.g., Supabase / Neon / AWS RDS Aurora) with connection pooling via PgBouncer.
- **Static Assets:** Global CDN caching with immutable cache headers for hashed assets (`/_next/static/*`).
- **Continuous Integration / Continuous Deployment (CI/CD):**
  - Git push triggers GitHub Actions / Vercel preview environments.
  - Required checks: `npm run lint`, `tsc --noEmit`, `npm run build`, security vulnerability audit.
