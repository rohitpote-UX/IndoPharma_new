# INDOPHARM — DASHBOARD API CONTRACTS & SCHEMAS

## 1. Endpoints Overview

| Method | Path | Required Permission | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard/overview` | `dashboard:read` | Primary BI & operations summary |
| `GET` | `/api/admin/dashboard/orders` | `dashboard:orders:read` | Server-side paginated orders drilldown |
| `GET` | `/api/admin/dashboard/inventory` | `dashboard:inventory:read` | Filtered stock deficit and batch expiration list |
| `GET` | `/api/admin/dashboard/search` | `dashboard:read` | Global admin search across orders, shipments, products, customers |

---

## 2. GET `/api/admin/dashboard/overview`

### Query Parameters
- `range` (string, optional): `'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | 'this_quarter' | 'this_year' | 'custom'`. Default: `'30d'`.
- `startDate` (ISO string, optional): Required if `range=custom`.
- `endDate` (ISO string, optional): Required if `range=custom`.
- `timezone` (string, optional): e.g. `'Asia/Kolkata'` or `'UTC'`. Default: `'Asia/Kolkata'`.

### Response Schema (200 OK)
```json
{
  "success": true,
  "overview": {
    "period": {
      "preset": "30d",
      "startDate": "2026-08-18T00:00:00.000Z",
      "endDate": "2026-09-18T00:00:00.000Z",
      "timezone": "Asia/Kolkata"
    },
    "revenue": {
      "grossSalesUsd": 12450.00,
      "discountsUsd": 450.00,
      "refundsUsd": 200.00,
      "shippingUsd": 850.00,
      "dispensingFeeUsd": 250.00,
      "taxesUsd": 320.00,
      "netRevenueUsd": 13220.00,
      "previousPeriodNetUsd": 11000.00,
      "growthPercentage": 20.2
    },
    "orders": {
      "totalOrders": 142,
      "placed": 142,
      "prescriptionVerified": 130,
      "processing": 18,
      "packed": 14,
      "dispatched": 25,
      "inTransit": 40,
      "delivered": 45,
      "cancelled": 5,
      "averageOrderValueUsd": 93.10
    },
    "verification": {
      "totalPending": 14,
      "underReview": 4,
      "pendingReview": 7,
      "moreInformationRequired": 3,
      "awaitingPrescriptionUpload": 6,
      "withinSlaCount": 9,
      "approachingSlaCount": 3,
      "overdueSlaCount": 2,
      "oldestPendingWaitMinutes": 310
    },
    "shipments": {
      "pendingShipmentsCount": 22,
      "readyToPack": 6,
      "bondedHub": 5,
      "exportCustoms": 4,
      "internationalTransit": 5,
      "customsClearance": 2,
      "outForDelivery": 0,
      "oldestPendingShipmentWaitHours": 28.5
    },
    "inventory": {
      "totalProducts": 65,
      "healthyCount": 54,
      "lowStockCount": 7,
      "criticalCount": 3,
      "outOfStockCount": 1,
      "nearExpiryBatchesCount": 4,
      "criticalItems": [
        {
          "productId": "p1",
          "productName": "Atorvastatin 20mg",
          "sku": "MED-ATV-020",
          "quantityOnHand": 12,
          "reorderPoint": 50,
          "safetyStock": 25,
          "status": "CRITICAL"
        }
      ]
    },
    "refunds": {
      "refundAmountUsd": 200.00,
      "refundCount": 2,
      "pendingRefundsCount": 1
    },
    "customers": {
      "totalRegisteredCustomers": 450,
      "newCustomersInPeriod": 38,
      "purchasingCustomersInPeriod": 84,
      "repeatCustomersCount": 42,
      "repeatCustomerRate": 50.0
    },
    "attentionItems": [],
    "recentOrders": [],
    "recentActivity": [],
    "dataFreshness": "Authoritative Real-Time PostgreSQL"
  }
}
```
