# INDOPHARM — DASHBOARD AUTHORIZATION & DATA SCOPING (RBAC)

## 1. Principles of Least-Privilege Scoping

IndoPharm strictly enforces role-based access control (RBAC). No staff member is given unrestricted visibility by default:

```text
Authentication Session (JWT)
          ↓
     UserRole
          ↓
  Permission Check
          ↓
Field-Level Data Scoping
```

---

## 2. Role-to-Permission Matrix

| Role | `dashboard:read` | `dashboard:financial:read` | `dashboard:orders:read` | `dashboard:prescription:read` | `dashboard:inventory:read` | `dashboard:customer:read` | `dashboard:refund:read` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `PATIENT` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `OPS_WAREHOUSE` | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `CLINICAL_PHARMACIST` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `COMPLIANCE_ADMIN` | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `SUPPORT_AGENT` | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `SUPER_ADMIN` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 3. Data Redaction Rules

1. **Consumer Patients**:
   - Immediate rejection with HTTP 403 Forbidden (`FORBIDDEN`). Zero dashboard data is returned.
2. **Operations Staff (`OPS_WAREHOUSE`)**:
   - `revenue`: Redacted (`null`).
   - `revenueTrends`: Redacted (`null`).
   - `refunds`: Redacted (`null`).
   - `customers`: Redacted (`null`).
   - `verification`: Redacted (`null`).
   - Receives: `orders`, `shipments`, `inventory`, `attentionItems` (inventory/fulfillment only).
3. **Clinical Pharmacists (`CLINICAL_PHARMACIST`)**:
   - `revenue`: Redacted (`null`).
   - `inventory`: Redacted (`null`).
   - `refunds`: Redacted (`null`).
   - Receives: `verification` queues, SLA meters, prescription attention items.
4. **Support Agents (`SUPPORT_AGENT`)**:
   - `revenue`: Redacted (`null`).
   - `verification`: Redacted (`null`).
   - Receives: `orders`, `shipments`, `customers`.
