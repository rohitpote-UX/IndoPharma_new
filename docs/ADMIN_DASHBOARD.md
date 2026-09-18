# INDOPHARM — ADMIN DASHBOARD & BUSINESS INTELLIGENCE ARCHITECTURE (PHASE 22)

## 1. Executive Summary & Purpose

The IndoPharm Admin Dashboard is an **internal enterprise command center** providing real-time visibility into cross-border pharmaceutical operations, financial recognition, clinical verification workloads, inventory health, fulfillment bottlenecks, and customer repeat behavior.

### 1.1 Non-Negotiable Engineering Principles
1. **Server-Side Authoritative Computation**: Critical business metrics and financial numbers are never calculated on the client. The browser is purely a presentation layer; all aggregations execute in PostgreSQL through the `DashboardService`.
2. **Least Privilege & Role-Scoped Visibility**: Different staff roles receive tailored operational slices. Financial numbers and revenue are strictly shielded from operations and clinical staff; prescription ePHI is shielded from support and logistics staff.
3. **No Decorative Placeholders / No Mock Data in Production**: All metrics reflect real transactional tables (`Order`, `Payment`, `Refund`, `Prescription`, `Inventory`, `Batch`, `Customer`).
4. **Actionable Operational Prioritization**: The dashboard places the **Attention Required Center** at the top, directing staff immediately to bottlenecks exceeding SLAs.

---

## 2. System Architecture

```text
               Admin Browser / Staff Portal
                            │
               GET /api/admin/dashboard/overview
                            │
                ┌───────────▼───────────┐
                │ Authentication (JWT)  │
                │ RBAC Permission Check │
                └───────────┬───────────┘
                            │
               ┌────────────▼────────────┐
               │    DashboardService     │
               └────────────┬────────────┘
         ┌──────────────────┼──────────────────┐
         │                  │                  │
┌────────▼────────┐ ┌───────▼───────┐ ┌────────▼────────┐
│ Revenue Engine  │ │ Workload SLA  │ │ Inventory Engine│
│ & Reconciliation│ │ & Funnel Calc │ │ & Batch Auditing│
└────────┬────────┘ └───────┬───────┘ └────────┬────────┘
         └──────────────────┼──────────────────┘
                            │
                   PostgreSQL + Prisma
       (Order, Payment, Refund, Prescription, Inventory)
```

---

## 3. Core Information Flow

1. **Date & Timezone Normalization**:
   - Presets (`today`, `yesterday`, `7d`, `30d`, `this_month`, `last_month`, `this_quarter`, `this_year`, `custom`) are normalized into exact UTC query bounds based on the reporting timezone (`Asia/Kolkata` or configured).
   - An exact identical prior duration is computed to enable accurate period-over-period delta analysis.
2. **Permission-Scoped Execution**:
   - `dashboard:financial:read`: Authorizes gross/net revenue, discounts, refund amounts, and financial trends.
   - `dashboard:orders:read`: Authorizes order counts, AOV, funnel stages, and shipment metrics.
   - `dashboard:prescription:read`: Authorizes pending review queue counts, clinical SLA meters, and clarification statuses.
   - `dashboard:inventory:read`: Authorizes stock deficit counts, batch expiration warnings, and reorder tables.
   - `dashboard:customer:read`: Authorizes customer counts and repeat customer retention rates.
   - `dashboard:refund:read`: Authorizes refund counts, processed totals, and pending review alerts.
3. **Attention Center Dispatching**:
   - Flags overdue prescriptions ($> 4\text{ hours}$ without pharmacist verification).
   - Flags critical stock formulations ($\le \text{safetyStock}$).
   - Flags delayed shipments ($> 24\text{ hours}$ unfulfilled).
   - Flags pending refund requests awaiting authorization.

---

## 4. UI Layout & Visual Hierarchy

1. **Top Priority**: Attention Required Center (Actionable alert cards linking to respective workflow queues).
2. **Core KPIs**: 8 primary cards (Revenue, Orders, Pending Verification, Pending Shipments, Low Inventory, Refunds, Customers, Repeat Patients).
3. **Trends & Funnels**: Time-series revenue chart and step-by-step fulfillment pipeline funnel.
4. **Operational Queues**: Inventory deficits watchlist requiring reorders, live recent order feed, and operational audit stream.
