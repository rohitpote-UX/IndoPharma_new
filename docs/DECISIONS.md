# IndoPharm — Architectural Decision Records (ADRs)

**Format:** Michael Nygard ADR Template  
**Status Key:** PROPOSED, ACCEPTED, REJECTED, SUPERSEDED  

---

## ADR-001: Adoption of Next.js 16 App Router & React Server Components

### Context
IndoPharm requires extreme performance (LCP < 1.2s for high SEO rankings on drug terms), dynamic SEO for thousands of generic drug names, and bank-grade security where database credentials and sensitive compliance logic are shielded from client bundles.

### Decision
We adopt **Next.js 16 App Router** with React Server Components (RSC) as the foundational full-stack framework.

### Rationale & Consequences
- **Positive:**
  - Zero-bundle-size server components reduce JavaScript payload sent to low-bandwidth or mobile patients.
  - Native streaming SSR via React Suspense provides immediate visual reassurance.
  - Server Actions and Route Handlers allow type-safe mutations without exposing internal API mechanics.
  - Vercel edge deployment ensures low-latency global delivery.
- **Negative:**
  - Requires strict mental model separation between Server Components and Client Components (`'use client'`).
  - GSAP animations must be encapsulated within targeted client-side wrappers.

**Status:** ACCEPTED

---

## ADR-002: Provider-Agnostic Payment Abstraction Layer

### Context
Online pharmaceutical sales represent a specialized merchant category code (MCC 5122 / 5912). Generic payment processors (e.g., standard Stripe/PayPal) frequently alter acceptable-use policies or freeze funds for cross-border generic medications.

### Decision
We strictly isolate payment processing behind a gateway-agnostic `PaymentProvider` interface. Direct calls to vendor SDKs in application checkout code are strictly prohibited.

### Rationale & Consequences
- **Positive:**
  - Freedom to swap acquirers (e.g., specialized high-volume healthcare merchants, international multi-currency gateways) with zero modifications to order or checkout logic.
  - Multi-homing and automatic fallback routing become possible.
  - Enables two-step authorization-hold workflows (funds held at order placement, captured post-pharmacist review).
- **Negative:**
  - Requires maintaining adapter classes and standardized webhook normalization.

**Status:** ACCEPTED

---

## ADR-003: Relational Persistence with PostgreSQL & Prisma ORM

### Context
The platform requires strict transactional consistency for order states, financial ledgers, batch lot numbers, prescription verifications, and audit logging. Document databases (NoSQL) risk integrity drift and lack foreign-key constraints.

### Decision
We standardize on **PostgreSQL 16+** managed via **Prisma ORM**.

### Rationale & Consequences
- **Positive:**
  - Enforces strict foreign-key integrity between Orders, Batches, Prescriptions, and Audit Logs.
  - Type-safe query generation through Prisma Client prevents runtime SQL type mismatches.
  - Rich support for JSONB indexing for flexible carrier tracking payloads alongside relational structures.
- **Negative:**
  - Requires managed connection pooling (e.g., PgBouncer / Prisma Accelerate) for serverless execution environments.

**Status:** ACCEPTED

---

## ADR-004: Strict Separation of Regulatory Documentation vs. Unsupported Claims

### Context
E-commerce sites often use generic "FDA Approved" or "100% Certified" badges to manufacture trust. In cross-border pharmaceutical commerce, making unsupported claims is not only unethical, it violates federal law (21 U.S.C. § 352 - Misbranding).

### Decision
We institute a strict rule across code and documentation:
1. No unverified badges (e.g., no generic "FDA Certified" icons).
2. All regulatory questions and processes are classified under standardized tags: `[CONFIRMED]`, `[TO BE VERIFIED]`, `[REQUIRES LEGAL/REGULATORY REVIEW]`, `[NOT IMPLEMENTED]`.
3. The platform provides verifiable factual provenance (e.g., WHO-GMP certificate numbers, manufacturer facility inspection history, and downloadable batch CoAs) rather than generic marketing claims.

### Rationale & Consequences
- **Positive:**
  - Establishes unquestioned regulatory integrity.
  - Protects the platform from civil and criminal liability under U.S. and Indian law.
  - Generates authentic patient trust among knowledgeable consumers and healthcare professionals.
- **Negative:**
  - Requires extra effort to source verifiable batch data and clear disclosures instead of simple marketing shortcuts.

**Status:** ACCEPTED

---

## ADR-005: Use of GSAP for Purposeful Micro-Interactions

### Context
A healthcare commerce site must feel reliable and calm. Heavy, gratuitous 3D libraries (e.g., Three.js) inflate bundle size and distract patients. However, static flat pages feel lifeless.

### Decision
We use **GSAP (GreenSock Animation Platform)** strictly for purposeful micro-interactions (e.g., supply chain milestone reveals, landed-cost breakdowns, and smooth modal transitions), combined with Tailwind CSS for utility transitions.

### Rationale & Consequences
- **Positive:**
  - Unrivaled timeline control and performance.
  - Smooth 60fps animations without layout jank.
  - Lightweight compared to 3D runtimes.
  - Easy integration with `prefers-reduced-motion` for accessibility.
- **Negative:**
  - Requires client component wrappers when used in Next.js App Router.

**Status:** ACCEPTED
