# INDOPHARM — ROLE-BASED ACCESS CONTROL (RBAC) & OBJECT AUTHORIZATION
## Fine-Grained Permissions, Least Privilege & IDOR Defenses

---

## 1. Golden Rule of Authorization

> **NEVER IMPLEMENT `admin === user` OR `isAdmin = true`.**
> 
> Frontend UI state must NEVER determine privileges or grant application access. Server-side authorization is the sole security boundary.
> 
> The authorization pipeline must strictly enforce:
> ```text
> Authenticated Identity
>          ↓
> Authoritative Role
>          ↓
> Granular Permission
>          ↓
> Resource Ownership / Organization Scope
>          ↓
> Server-Side Decision (Allow / Deny)
>          ↓
> Immutable Audit Record
> ```

---

## 2. Primary Enterprise Roles

IndoPharm defines six distinct functional tiers mapped directly to database-backed `UserRole` enums:

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    CUSTOMER     │     │   OPERATIONS    │     │   COMPLIANCE    │
│    (PATIENT)    │     │ (OPS_WAREHOUSE) │     │(PHARMACIST/ADMIN│
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         │                                               │
┌────────┴────────┐                             ┌────────┴────────┐
│     SUPPORT     │                             │      ADMIN      │
│ (SUPPORT_AGENT) │                             │   SUPER_ADMIN   │
└─────────────────┘                             └─────────────────┘
```

### Role Scope & Boundaries

### 1. CUSTOMER (`PATIENT`)
- **Permitted Capabilities:** Browse approved products; manage personal cart; place orders; view personal orders; upload prescription documents; view personal prescriptions; open and track personal support tickets; update personal profile details.
- **Strictly Prohibited:** View another customer's orders or medical records; adjust inventory quantities; create or edit product catalog; alter pricing; issue refunds; modify compliance rules; access administrative APIs.

### 2. OPERATIONS (`OPS_WAREHOUSE`)
- **Permitted Capabilities:** View warehouse stock levels (`inventory:read`); perform inventory stock adjustments (`inventory:adjust`); track batch manufacturing dates and expiry (`batch:read`, `batch:manage`); review orders pending dispatch (`order:read_all`); pack and fulfill shipments (`order:fulfill`).
- **Strictly Prohibited:** Modify clinical compliance rules; alter customer prescription verification status; issue financial refunds; modify user accounts or roles; alter billing data.

### 3. COMPLIANCE (`CLINICAL_PHARMACIST` & `COMPLIANCE_ADMIN`)
- **Permitted Capabilities:** Review patient prescription documents (`prescription:read_all`, `prescription:review`); certify or reject prescriptions with digital signatures (`prescription:verify`); manage country-specific import/export schedules (`country_rule:manage`, `compliance:rule_manage`); review compliance audit ledgers (`audit:read`).
- **Strictly Prohibited:** Process customer refunds; modify warehouse physical inventory; adjust prices; manage employee roles.

### 4. SUPPORT (`SUPPORT_AGENT`)
- **Permitted Capabilities:** Read and respond to customer support inquiries (`support:read_all`, `support:update`); look up order dispatch statuses on behalf of a caller (`order:read_all`); verify payment settlement states (`payment:read_all`).
- **Strictly Prohibited:** Access clinical prescription attachments without medical authorization; issue financial refunds; modify system catalog; grant administrative permissions.

### 5. ADMIN
- **Permitted Capabilities:** Create and update product definitions (`product:create`, `product:update`); manage inventory allocations; review global orders; trigger authorized financial refunds (`payment:refund`); oversee operational queues.
- **Strictly Prohibited:** Grant or elevate user roles to `SUPER_ADMIN`; delete immutable audit history; alter core security key configurations.

### 6. SUPER_ADMIN
- **Permitted Capabilities:** Highest application privilege; user lifecycle and role governance (`user:manage_role`, `role:manage`); security settings management (`security:manage`); comprehensive audit oversight (`audit:read`).
- **Non-Negotiable Rule:** **SUPER_ADMIN DOES NOT MEAN UNAUDITED ACCESS.** Every privileged operation executed by a Super Admin emits an immutable audit log entry containing actor ID, IP address, timestamp, and target resource.

---

## 3. Granular Permission Matrix

The application evaluates permissions using a standardized `resource:action` syntax:

| Permission Identifier | Description | `PATIENT` | `OPS_WAREHOUSE` | `CLINICAL_PHARMACIST` | `COMPLIANCE_ADMIN` | `SUPPORT_AGENT` | `ADMIN` | `SUPER_ADMIN` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `product:read` | Browse approved medicines | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** |
| `product:create` | Add new pharmaceutical items | DENY | DENY | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `product:update` | Edit product descriptions/SKUs | DENY | DENY | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `inventory:read` | View stock quantities | DENY | **ALLOW** | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `inventory:adjust` | Modify batch & warehouse stock | DENY | **ALLOW** | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `order:read_own` | View customer's own orders | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| `order:read_all` | Lookup any customer order | DENY | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** | **ALLOW** |
| `order:fulfill` | Dispatch & track orders | DENY | **ALLOW** | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `payment:read_own` | View personal payment receipts | **ALLOW** | DENY | DENY | DENY | DENY | DENY | DENY |
| `payment:refund` | Execute partial/full refund | DENY | DENY | DENY | DENY | DENY | **ALLOW** | **ALLOW** |
| `prescription:upload`| Submit prescription file | **ALLOW** | DENY | DENY | DENY | DENY | DENY | **ALLOW** |
| `prescription:read_own`| View own clinical files | **ALLOW** | DENY | DENY | DENY | DENY | DENY | **ALLOW** |
| `prescription:verify`| Certify clinical validity | DENY | DENY | **ALLOW** | **ALLOW** | DENY | DENY | **ALLOW** |
| `support:create` | Open a customer inquiry | **ALLOW** | DENY | DENY | DENY | DENY | DENY | **ALLOW** |
| `support:read_all` | Manage customer helpdesk | DENY | **ALLOW** | DENY | DENY | **ALLOW** | **ALLOW** | **ALLOW** |
| `compliance:rule_manage`| Modify country export rules | DENY | DENY | **ALLOW** | **ALLOW** | DENY | **ALLOW** | **ALLOW** |
| `user:manage_role` | Assign or modify user roles | DENY | DENY | DENY | DENY | DENY | DENY | **ALLOW** |
| `audit:read` | Inspect compliance ledgers | DENY | DENY | **ALLOW** | **ALLOW** | DENY | **ALLOW** | **ALLOW** |
| `security:manage` | Manage security controls | DENY | DENY | DENY | DENY | DENY | DENY | **ALLOW** |

---

## 4. Object-Level Authorization & IDOR Defenses

Role checks alone are insufficient for secure healthcare commerce. A user with `order:read_own` must only be allowed to view orders that **they personally own**.

To prevent **Insecure Direct Object References (IDOR)**, IndoPharm combines role permissions with resource ownership validation:

```text
                  Incoming Request: GET /api/orders/order-101
                                       │
                                       ▼
                     Step 1: Authenticate Session Token
                                       │
                                       ▼
                     Step 2: Fetch Order from Database
                                       │
                                       ▼
                          Step 3: Evaluate Ownership
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     session.userId === order.userId              session.userId !== order.userId
                │                                             │
             [ALLOW]                                          ▼
                                                  Step 4: Check Elevated Scope
                                                  (hasPermission('order:read_all'))
                                                              │
                                                   ┌──────────┴──────────┐
                                                   ▼                     ▼
                                                [ALLOW]               [DENY]
                                              Staff Member      HTTP 403 Forbidden
                                                               (IDOR Attack Blocked)
```

### IDOR Enforcement Helpers
Located in `src/lib/auth/rbac/guard.ts`:
- `assertOrderAccess(session, order)`: Guarantees user owns the order OR has `order:read_all`.
- `assertPrescriptionAccess(session, prescription)`: Guarantees patient owns the document OR caller holds `prescription:verify` / `prescription:review`. Support agents and unprivileged staff are rejected with HTTP 403.
- `assertSupportTicketAccess(session, ticket)`: Confirms ticket ownership or `support:read_all` privilege.

---

## 5. Privilege Escalation Defenses

Privilege escalation occurs when an attacker attempts to promote their account (horizontal or vertical elevation) through tampered payloads or mass assignment.

### 1. Self-Role Modification Prohibited
A user cannot modify their own administrative role. An attempt by a user to alter their own role emits an immediate `AuthorizationError('SELF_ROLE_CHANGE_FORBIDDEN')`.

### 2. Exclusive Role Management Authority
Only users possessing the `role:manage` / `user:manage_role` permission (held exclusively by `SUPER_ADMIN`) are authorized to update user roles.

### 3. Super Admin Assignment Gate
Even an administrator with elevated rights cannot grant the `SUPER_ADMIN` role to another user. Only an active Super Admin may assign the `SUPER_ADMIN` role:
```typescript
if (newRole === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
  throw new AuthorizationError(
    'Only a Super Administrator can assign the Super Administrator role.',
    403,
    'ROLE_ESCALATION_FORBIDDEN'
  );
}
```

### 4. Mass Assignment Immunity
Profile update handlers explicitly reject model fields such as `role`, `status`, `emailVerified`, or `twoFactorEnabled` in client request bodies. Updates use strict allowlists (`firstName`, `lastName`, `phone`).
