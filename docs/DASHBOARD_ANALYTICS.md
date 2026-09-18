# INDOPHARM — DASHBOARD ANALYTICS & SCALABILITY ARCHITECTURE

## 1. High-Performance Query Architecture

As IndoPharm scales to hundreds of thousands of orders and inventory allocations, executing un-indexed full-table scans would degrade database responsiveness.

### 1.1 Optimized Indexing Strategy
The Prisma database schema implements targeted indexes designed explicitly for the dashboard queries:
- `Order(createdAt, status)`: Fast time-bounded status filtering.
- `Order(customerId)`: Rapid customer purchase aggregation for repeat customer calculation.
- `Payment(status, createdAt)`: Financial reconciliation.
- `Refund(status, createdAt)`: Rapid refund deductions.
- `Prescription(status, createdAt)`: Clinical queue sorting and SLA measurement.
- `Inventory(productId, location)`: Stock level aggregation.
- `Batch(expiryDate, status)`: Near-expiry batch detection.

---

## 2. Server-Side Aggregations & Query Isolation

Each metric module in `DashboardService` executes independently:
- Wrapped in `Promise.allSettled` to guarantee that a temporary failure in one domain (e.g. carrier tracking sync) NEVER breaks the entire dashboard.
- Safe fallbacks: If a query fails, the metric returns `null` (rendered in the UI as `"Unavailable — retry"`), preventing false zeroes.

---

## 3. Future Scalability (100K+ to 1M+ Orders)

For massive transaction volumes, the architecture supports:
1. **Materialized Summary Views / Projections**: Periodic (e.g. hourly/daily) rollups of `DailyRevenueSummary` and `CustomerCohortSummary`.
2. **Read Replica Routing**: Directing heavy analytics queries to read replicas while transactional order processing runs on the primary node.
3. **Cache Coherence**: Short-lived Redis caching (60s) keyed by `userId:role:preset:dateBounds`.
