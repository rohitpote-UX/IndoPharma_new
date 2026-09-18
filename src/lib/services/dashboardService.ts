/**
 * ==============================================================================
 * INDOPHARM — ADMIN DASHBOARD & BUSINESS INTELLIGENCE SERVICE (PHASE 22)
 * ==============================================================================
 * Authoritative internal operations & analytics service.
 * Computes all metrics strictly on the server from PostgreSQL transactional tables.
 * Enforces role-based data scoping, financial reconciliation, and verification SLAs.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { UserRole, OrderStatus, PrescriptionStatus, ShipmentStage, PaymentStatus, RefundStatus } from '@prisma/client';
import { hasPermission } from '@/lib/auth/rbac/permissions';
import { SessionPayload } from '@/lib/auth/session';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'custom';

export interface DateRangeBounds {
  startDate: Date;
  endDate: Date;
  previousStartDate: Date;
  previousEndDate: Date;
  preset: DateRangePreset;
  timezone: string;
}

export interface RevenueBreakdown {
  grossSalesUsd: number;
  discountsUsd: number;
  refundsUsd: number;
  shippingUsd: number;
  dispensingFeeUsd: number;
  taxesUsd: number;
  netRevenueUsd: number;
  previousPeriodNetUsd: number;
  growthPercentage: number | null; // null if prior period is 0 or invalid
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  grossSalesUsd: number;
  netRevenueUsd: number;
  orderCount: number;
}

export interface OrderFunnelMetrics {
  totalOrders: number;
  placed: number;
  prescriptionVerified: number;
  processing: number;
  packed: number;
  dispatched: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
  averageOrderValueUsd: number;
}

export interface VerificationWorkloadMetrics {
  totalPending: number;
  underReview: number;
  pendingReview: number;
  moreInformationRequired: number;
  awaitingPrescriptionUpload: number;
  withinSlaCount: number; // < 2h
  approachingSlaCount: number; // 2h - 4h
  overdueSlaCount: number; // > 4h
  oldestPendingWaitMinutes: number;
}

export interface ShipmentWorkloadMetrics {
  pendingShipmentsCount: number;
  readyToPack: number;
  bondedHub: number;
  exportCustoms: number;
  internationalTransit: number;
  customsClearance: number;
  outForDelivery: number;
  oldestPendingShipmentWaitHours: number;
}

export interface InventoryHealthMetrics {
  totalProducts: number;
  healthyCount: number;
  lowStockCount: number;
  criticalCount: number;
  outOfStockCount: number;
  nearExpiryBatchesCount: number; // Expiry <= 90 days
  criticalItems: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantityOnHand: number;
    reorderPoint: number;
    safetyStock: number;
    status: 'CRITICAL' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  }>;
}

export interface RefundMetrics {
  refundAmountUsd: number;
  refundCount: number;
  pendingRefundsCount: number;
}

export interface CustomerRetentionMetrics {
  totalRegisteredCustomers: number;
  newCustomersInPeriod: number;
  purchasingCustomersInPeriod: number;
  repeatCustomersCount: number;
  repeatCustomerRate: number; // Percentage
}

export interface AttentionItem {
  id: string;
  type: 'VERIFICATION' | 'SHIPMENT' | 'INVENTORY' | 'REFUND' | 'CUSTOMS';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  count: number;
  actionUrl: string;
  actionLabel: string;
}

export interface DashboardOverview {
  period: {
    preset: DateRangePreset;
    startDate: string;
    endDate: string;
    timezone: string;
  };
  revenue: RevenueBreakdown | null;
  revenueTrends: RevenueTrendPoint[] | null;
  orders: OrderFunnelMetrics | null;
  verification: VerificationWorkloadMetrics | null;
  shipments: ShipmentWorkloadMetrics | null;
  inventory: InventoryHealthMetrics | null;
  refunds: RefundMetrics | null;
  customers: CustomerRetentionMetrics | null;
  attentionItems: AttentionItem[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerEmail: string;
    totalUsd: number;
    status: OrderStatus;
    paymentStatus: string;
    prescriptionStatus: string | null;
    createdAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    userRole: string | null;
    timestamp: string;
  }>;
  dataFreshness: string;
}

export class DashboardService {
  /**
   * Resolves date range bounds and matching historical comparison window
   */
  public static resolveDateBounds(
    preset: DateRangePreset = '30d',
    customStart?: string,
    customEnd?: string,
    timezone: string = 'Asia/Kolkata'
  ): DateRangeBounds {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (preset) {
      case 'today': {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'yesterday': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case '7d': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      }
      case '30d': {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      }
      case 'this_month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      }
      case 'last_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      case 'this_quarter': {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1, 0, 0, 0, 0);
        break;
      }
      case 'this_year': {
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        break;
      }
      case 'custom': {
        if (customStart && customEnd) {
          startDate = new Date(customStart);
          endDate = new Date(customEnd);
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            endDate = now;
          }
        } else {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        break;
      }
      default: {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    // Compute previous comparison window with exact same duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const previousEndDate = new Date(startDate.getTime());
    const previousStartDate = new Date(startDate.getTime() - durationMs);

    return {
      startDate,
      endDate,
      previousStartDate,
      previousEndDate,
      preset,
      timezone,
    };
  }

  /**
   * Primary operational & BI dashboard assembler with strict role-based scoping
   */
  public static async getOverview(
    bounds: DateRangeBounds,
    session: SessionPayload
  ): Promise<DashboardOverview> {
    const role = session.role;

    // RBAC Permissions check
    const canReadFinancial = hasPermission(role, 'dashboard:financial:read');
    const canReadOrders = hasPermission(role, 'dashboard:orders:read');
    const canReadPrescription = hasPermission(role, 'dashboard:prescription:read');
    const canReadInventory = hasPermission(role, 'dashboard:inventory:read');
    const canReadCustomer = hasPermission(role, 'dashboard:customer:read');
    const canReadRefund = hasPermission(role, 'dashboard:refund:read');

    // Run independent metric aggregations in parallel
    const [
      revenueResult,
      ordersResult,
      verificationResult,
      shipmentResult,
      inventoryResult,
      refundsResult,
      customersResult,
      recentOrdersResult,
      recentActivityResult,
    ] = await Promise.allSettled([
      canReadFinancial ? this.calculateRevenueMetrics(bounds) : Promise.resolve(null),
      canReadOrders ? this.calculateOrderFunnelMetrics(bounds) : Promise.resolve(null),
      canReadPrescription ? this.calculateVerificationMetrics() : Promise.resolve(null),
      canReadOrders ? this.calculateShipmentMetrics() : Promise.resolve(null),
      canReadInventory ? this.calculateInventoryMetrics() : Promise.resolve(null),
      canReadRefund ? this.calculateRefundMetrics(bounds) : Promise.resolve(null),
      canReadCustomer ? this.calculateCustomerRetentionMetrics(bounds) : Promise.resolve(null),
      canReadOrders ? this.getRecentOrders(10) : Promise.resolve([]),
      this.getRecentActivity(10),
    ]);

    const revenue = revenueResult.status === 'fulfilled' ? revenueResult.value : null;
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : null;
    const verification = verificationResult.status === 'fulfilled' ? verificationResult.value : null;
    const shipments = shipmentResult.status === 'fulfilled' ? shipmentResult.value : null;
    const inventory = inventoryResult.status === 'fulfilled' ? inventoryResult.value : null;
    const refunds = refundsResult.status === 'fulfilled' ? refundsResult.value : null;
    const customers = customersResult.status === 'fulfilled' ? customersResult.value : null;
    const recentOrders = recentOrdersResult.status === 'fulfilled' ? recentOrdersResult.value : [];
    const recentActivity = recentActivityResult.status === 'fulfilled' ? recentActivityResult.value : [];

    // Revenue Trends if financial access is permitted
    let revenueTrends: RevenueTrendPoint[] | null = null;
    if (canReadFinancial) {
      revenueTrends = await this.calculateRevenueTrends(bounds);
    }

    // Synthesize Attention Center actionable items
    const attentionItems = this.buildAttentionCenterItems({
      verification,
      shipments,
      inventory,
      refunds,
      canReadPrescription,
      canReadOrders,
      canReadInventory,
      canReadRefund,
    });

    return {
      period: {
        preset: bounds.preset,
        startDate: bounds.startDate.toISOString(),
        endDate: bounds.endDate.toISOString(),
        timezone: bounds.timezone,
      },
      revenue,
      revenueTrends,
      orders,
      verification,
      shipments,
      inventory,
      refunds,
      customers,
      attentionItems,
      recentOrders,
      recentActivity,
      dataFreshness: 'Authoritative Real-Time PostgreSQL',
    };
  }

  /**
   * 1. REVENUE METRICS ENGINE (Authoritative Financial Calculation)
   * Excludes CANCELLED, PAYMENT_FAILED, PENDING_PRESCRIPTION.
   * Net = Gross - Discounts - Refunds + Shipping + DispensingFees + Taxes.
   */
  public static async calculateRevenueMetrics(bounds: DateRangeBounds): Promise<RevenueBreakdown> {
    const qualifyingStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED_PICKING,
      OrderStatus.EXPORT_CUSTOMS,
      OrderStatus.IN_TRANSIT_AIR,
      OrderStatus.US_CUSTOMS_CLEARANCE,
      OrderStatus.DOMESTIC_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.PARTIALLY_REFUNDED,
      OrderStatus.REFUNDED,
    ];

    // Current period qualifying orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: bounds.startDate,
          lte: bounds.endDate,
        },
        status: { in: qualifyingStatuses },
      },
      select: {
        id: true,
        subtotalUsd: true,
        discountTotalUsd: true,
        shippingUsd: true,
        dispensingFeeUsd: true,
        taxTotalUsd: true,
        totalUsd: true,
      },
    });

    // Current period processed refunds
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: {
          gte: bounds.startDate,
          lte: bounds.endDate,
        },
        status: RefundStatus.SUCCEEDED,
      },
      select: {
        amountMinorUnits: true,
      },
    });

    let grossSalesUsd = 0;
    let discountsUsd = 0;
    let shippingUsd = 0;
    let dispensingFeeUsd = 0;
    let taxesUsd = 0;

    for (const ord of orders) {
      grossSalesUsd += Number(ord.subtotalUsd || 0);
      discountsUsd += Number(ord.discountTotalUsd || 0);
      shippingUsd += Number(ord.shippingUsd || 0);
      dispensingFeeUsd += Number(ord.dispensingFeeUsd || 0);
      taxesUsd += Number(ord.taxTotalUsd || 0);
    }

    let refundsUsd = 0;
    for (const ref of refunds) {
      refundsUsd += ref.amountMinorUnits / 100;
    }

    const netRevenueUsd = Number(
      (grossSalesUsd - discountsUsd - refundsUsd + shippingUsd + dispensingFeeUsd + taxesUsd).toFixed(2)
    );

    // Calculate previous period net revenue for comparison
    const previousOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: bounds.previousStartDate,
          lte: bounds.previousEndDate,
        },
        status: { in: qualifyingStatuses },
      },
      select: {
        subtotalUsd: true,
        discountTotalUsd: true,
        shippingUsd: true,
        dispensingFeeUsd: true,
        taxTotalUsd: true,
      },
    });

    const previousRefunds = await prisma.refund.findMany({
      where: {
        createdAt: {
          gte: bounds.previousStartDate,
          lte: bounds.previousEndDate,
        },
        status: RefundStatus.SUCCEEDED,
      },
      select: {
        amountMinorUnits: true,
      },
    });

    let prevGross = 0;
    let prevDisc = 0;
    let prevShip = 0;
    let prevFee = 0;
    let prevTax = 0;

    for (const po of previousOrders) {
      prevGross += Number(po.subtotalUsd || 0);
      prevDisc += Number(po.discountTotalUsd || 0);
      prevShip += Number(po.shippingUsd || 0);
      prevFee += Number(po.dispensingFeeUsd || 0);
      prevTax += Number(po.taxTotalUsd || 0);
    }

    let prevRef = 0;
    for (const pr of previousRefunds) {
      prevRef += pr.amountMinorUnits / 100;
    }

    const previousPeriodNetUsd = Number(
      (prevGross - prevDisc - prevRef + prevShip + prevFee + prevTax).toFixed(2)
    );

    // Guard: Only show growth % if prior period > 0
    let growthPercentage: number | null = null;
    if (previousPeriodNetUsd > 0) {
      growthPercentage = Number(
        (((netRevenueUsd - previousPeriodNetUsd) / previousPeriodNetUsd) * 100).toFixed(1)
      );
    }

    return {
      grossSalesUsd: Number(grossSalesUsd.toFixed(2)),
      discountsUsd: Number(discountsUsd.toFixed(2)),
      refundsUsd: Number(refundsUsd.toFixed(2)),
      shippingUsd: Number(shippingUsd.toFixed(2)),
      dispensingFeeUsd: Number(dispensingFeeUsd.toFixed(2)),
      taxesUsd: Number(taxesUsd.toFixed(2)),
      netRevenueUsd,
      previousPeriodNetUsd,
      growthPercentage,
    };
  }

  /**
   * Time-series revenue chart data points
   */
  public static async calculateRevenueTrends(bounds: DateRangeBounds): Promise<RevenueTrendPoint[]> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: bounds.startDate,
          lte: bounds.endDate,
        },
        status: {
          in: [
            OrderStatus.CONFIRMED_PICKING,
            OrderStatus.EXPORT_CUSTOMS,
            OrderStatus.IN_TRANSIT_AIR,
            OrderStatus.US_CUSTOMS_CLEARANCE,
            OrderStatus.DOMESTIC_DELIVERY,
            OrderStatus.DELIVERED,
            OrderStatus.PARTIALLY_REFUNDED,
          ],
        },
      },
      select: {
        subtotalUsd: true,
        totalUsd: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group into date buckets (YYYY-MM-DD)
    const pointsMap = new Map<string, { gross: number; net: number; count: number }>();

    for (const ord of orders) {
      const dateKey = ord.createdAt.toISOString().split('T')[0];
      const existing = pointsMap.get(dateKey) || { gross: 0, net: 0, count: 0 };
      existing.gross += Number(ord.subtotalUsd || 0);
      existing.net += Number(ord.totalUsd || 0);
      existing.count += 1;
      pointsMap.set(dateKey, existing);
    }

    const trends: RevenueTrendPoint[] = [];
    for (const [date, data] of pointsMap.entries()) {
      trends.push({
        date,
        label: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        grossSalesUsd: Number(data.gross.toFixed(2)),
        netRevenueUsd: Number(data.net.toFixed(2)),
        orderCount: data.count,
      });
    }

    return trends;
  }

  /**
   * 2. ORDER FUNNEL METRICS ENGINE
   */
  public static async calculateOrderFunnelMetrics(bounds: DateRangeBounds): Promise<OrderFunnelMetrics> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: bounds.startDate,
          lte: bounds.endDate,
        },
      },
      select: {
        id: true,
        status: true,
        totalUsd: true,
      },
    });

    const totalOrders = orders.length;
    let placed = totalOrders;
    let prescriptionVerified = 0;
    let processing = 0;
    let packed = 0;
    let dispatched = 0;
    let inTransit = 0;
    let delivered = 0;
    let cancelled = 0;
    let paidOrderTotalSum = 0;
    let paidOrderCount = 0;

    for (const o of orders) {
      if (o.status === OrderStatus.CANCELLED) {
        cancelled++;
      } else {
        if (o.status !== OrderStatus.PENDING_PRESCRIPTION && o.status !== OrderStatus.UNDER_CLINICAL_REVIEW) {
          prescriptionVerified++;
        }
        if (o.status === OrderStatus.CONFIRMED_PICKING) {
          processing++;
        }
        if (o.status === OrderStatus.EXPORT_CUSTOMS) {
          packed++;
        }
        if (o.status === OrderStatus.IN_TRANSIT_AIR) {
          dispatched++;
        }
        if (o.status === OrderStatus.US_CUSTOMS_CLEARANCE || o.status === OrderStatus.DOMESTIC_DELIVERY) {
          inTransit++;
        }
        if (o.status === OrderStatus.DELIVERED) {
          delivered++;
        }

        paidOrderTotalSum += Number(o.totalUsd || 0);
        paidOrderCount++;
      }
    }

    const averageOrderValueUsd =
      paidOrderCount > 0 ? Number((paidOrderTotalSum / paidOrderCount).toFixed(2)) : 0;

    return {
      totalOrders,
      placed,
      prescriptionVerified,
      processing,
      packed,
      dispatched,
      inTransit,
      delivered,
      cancelled,
      averageOrderValueUsd,
    };
  }

  /**
   * 3. VERIFICATION WORKLOAD & SLA METRICS ENGINE
   */
  public static async calculateVerificationMetrics(): Promise<VerificationWorkloadMetrics> {
    const activePrescriptions = await prisma.prescription.findMany({
      where: {
        status: {
          in: [
            PrescriptionStatus.PENDING_REVIEW,
            PrescriptionStatus.UNDER_REVIEW,
            PrescriptionStatus.MORE_INFORMATION_REQUIRED,
            PrescriptionStatus.UPLOADED,
          ],
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const awaitingPrescriptionOrders = await prisma.order.count({
      where: {
        status: OrderStatus.PENDING_PRESCRIPTION,
      },
    });

    let underReview = 0;
    let pendingReview = 0;
    let moreInformationRequired = 0;
    let withinSlaCount = 0;
    let approachingSlaCount = 0;
    let overdueSlaCount = 0;

    const now = Date.now();
    let oldestWaitMs = 0;

    for (const rx of activePrescriptions) {
      if (rx.status === PrescriptionStatus.UNDER_REVIEW) {
        underReview++;
      } else if (rx.status === PrescriptionStatus.MORE_INFORMATION_REQUIRED) {
        moreInformationRequired++;
      } else {
        pendingReview++;
      }

      const elapsedMs = now - rx.createdAt.getTime();
      if (elapsedMs > oldestWaitMs) oldestWaitMs = elapsedMs;

      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      if (elapsedHours < 2) {
        withinSlaCount++;
      } else if (elapsedHours <= 4) {
        approachingSlaCount++;
      } else {
        overdueSlaCount++;
      }
    }

    return {
      totalPending: activePrescriptions.length,
      underReview,
      pendingReview,
      moreInformationRequired,
      awaitingPrescriptionUpload: awaitingPrescriptionOrders,
      withinSlaCount,
      approachingSlaCount,
      overdueSlaCount,
      oldestPendingWaitMinutes: Math.floor(oldestWaitMs / (1000 * 60)),
    };
  }

  /**
   * 4. SHIPMENT WORKLOAD METRICS ENGINE
   */
  public static async calculateShipmentMetrics(): Promise<ShipmentWorkloadMetrics> {
    const activeShipments = await prisma.shipment.findMany({
      where: {
        actualDelivery: null,
      },
      include: {
        order: {
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
    });

    let readyToPack = 0;
    let bondedHub = 0;
    let exportCustoms = 0;
    let internationalTransit = 0;
    let customsClearance = 0;
    let outForDelivery = 0;

    const now = Date.now();
    let oldestOrderWaitMs = 0;

    for (const s of activeShipments) {
      const wait = now - s.order.createdAt.getTime();
      if (wait > oldestOrderWaitMs) oldestOrderWaitMs = wait;

      switch (s.currentStage) {
        case ShipmentStage.INDIA_BONDED_HUB:
          bondedHub++;
          break;
        case ShipmentStage.INDIA_EXPORT_CUSTOMS:
          exportCustoms++;
          break;
        case ShipmentStage.INTERNATIONAL_AIR_TRANSIT:
          internationalTransit++;
          break;
        case ShipmentStage.US_PORT_OF_ENTRY:
          customsClearance++;
          break;
        case ShipmentStage.OUT_FOR_DELIVERY:
          outForDelivery++;
          break;
        default:
          readyToPack++;
      }
    }

    return {
      pendingShipmentsCount: activeShipments.length,
      readyToPack,
      bondedHub,
      exportCustoms,
      internationalTransit,
      customsClearance,
      outForDelivery,
      oldestPendingShipmentWaitHours: Number((oldestOrderWaitMs / (1000 * 60 * 60)).toFixed(1)),
    };
  }

  /**
   * 5. INVENTORY HEALTH & BATCH METRICS ENGINE
   */
  public static async calculateInventoryMetrics(): Promise<InventoryHealthMetrics> {
    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
          },
        },
      },
    });

    // Batches expiring within 90 days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const nearExpiryBatchesCount = await prisma.batch.count({
      where: {
        expiryDate: {
          lte: ninetyDaysFromNow,
          gte: new Date(),
        },
        quantityRemaining: { gt: 0 },
      },
    });

    let healthyCount = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;

    const criticalItems: InventoryHealthMetrics['criticalItems'] = [];

    for (const inv of inventories) {
      const netAvailable = inv.quantityAvailable;
      const reorderPt = inv.reorderThreshold || 50;
      const safety = Math.floor(reorderPt / 2);

      if (netAvailable <= 0) {
        outOfStockCount++;
        criticalItems.push({
          productId: inv.product.id,
          productName: inv.product.name,
          sku: inv.product.sku,
          quantityOnHand: inv.quantityOnHand,
          reorderPoint: reorderPt,
          safetyStock: safety,
          status: 'OUT_OF_STOCK',
        });
      } else if (netAvailable <= safety) {
        criticalCount++;
        criticalItems.push({
          productId: inv.product.id,
          productName: inv.product.name,
          sku: inv.product.sku,
          quantityOnHand: inv.quantityOnHand,
          reorderPoint: reorderPt,
          safetyStock: safety,
          status: 'CRITICAL',
        });
      } else if (netAvailable <= reorderPt) {
        lowStockCount++;
        criticalItems.push({
          productId: inv.product.id,
          productName: inv.product.name,
          sku: inv.product.sku,
          quantityOnHand: inv.quantityOnHand,
          reorderPoint: reorderPt,
          safetyStock: safety,
          status: 'LOW_STOCK',
        });
      } else {
        healthyCount++;
      }
    }

    return {
      totalProducts: inventories.length,
      healthyCount,
      lowStockCount,
      criticalCount,
      outOfStockCount,
      nearExpiryBatchesCount,
      criticalItems: criticalItems.slice(0, 10), // Top 10 items requiring attention
    };
  }

  /**
   * 6. REFUND METRICS ENGINE
   */
  public static async calculateRefundMetrics(bounds: DateRangeBounds): Promise<RefundMetrics> {
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: {
          gte: bounds.startDate,
          lte: bounds.endDate,
        },
      },
      select: {
        amountMinorUnits: true,
        status: true,
      },
    });

    let refundAmountUsd = 0;
    let refundCount = 0;
    let pendingRefundsCount = 0;

    for (const r of refunds) {
      if (r.status === RefundStatus.SUCCEEDED) {
        refundAmountUsd += r.amountMinorUnits / 100;
        refundCount++;
      } else if (r.status === RefundStatus.REQUESTED || r.status === RefundStatus.PROCESSING) {
        pendingRefundsCount++;
      }
    }

    return {
      refundAmountUsd: Number(refundAmountUsd.toFixed(2)),
      refundCount,
      pendingRefundsCount,
    };
  }

  /**
   * 7. CUSTOMER GROWTH & RETENTION ENGINE
   */
  public static async calculateCustomerRetentionMetrics(
    bounds: DateRangeBounds
  ): Promise<CustomerRetentionMetrics> {
    const totalRegisteredCustomers = await prisma.user.count({
      where: { role: UserRole.PATIENT },
    });

    const newCustomersInPeriod = await prisma.user.count({
      where: {
        role: UserRole.PATIENT,
        createdAt: {
          gte: bounds.startDate,
          lte: bounds.endDate,
        },
      },
    });

    // Orders in period by customer
    const qualifyingStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED_PICKING,
      OrderStatus.EXPORT_CUSTOMS,
      OrderStatus.IN_TRANSIT_AIR,
      OrderStatus.US_CUSTOMS_CLEARANCE,
      OrderStatus.DOMESTIC_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.PARTIALLY_REFUNDED,
    ];

    const customerOrders = await prisma.order.findMany({
      where: {
        status: { in: qualifyingStatuses },
      },
      select: {
        customerId: true,
        createdAt: true,
      },
    });

    // Count purchases per customer
    const customerTotalOrderCounts = new Map<string, number>();
    const periodActiveCustomers = new Set<string>();

    for (const co of customerOrders) {
      if (!co.customerId) continue;
      const count = (customerTotalOrderCounts.get(co.customerId) || 0) + 1;
      customerTotalOrderCounts.set(co.customerId, count);

      if (co.createdAt >= bounds.startDate && co.createdAt <= bounds.endDate) {
        periodActiveCustomers.add(co.customerId);
      }
    }

    const purchasingCustomersInPeriod = periodActiveCustomers.size;

    // Repeat customers: customers with >= 2 total paid orders
    let repeatCustomersCount = 0;
    for (const [, count] of customerTotalOrderCounts.entries()) {
      if (count >= 2) repeatCustomersCount++;
    }

    const totalPurchasingCustomersAllTime = customerTotalOrderCounts.size;
    const repeatCustomerRate =
      totalPurchasingCustomersAllTime > 0
        ? Number(((repeatCustomersCount / totalPurchasingCustomersAllTime) * 100).toFixed(1))
        : 0;

    return {
      totalRegisteredCustomers,
      newCustomersInPeriod,
      purchasingCustomersInPeriod,
      repeatCustomersCount,
      repeatCustomerRate,
    };
  }

  /**
   * 8. ACTIONABLE ATTENTION CENTER ENGINE
   */
  public static buildAttentionCenterItems(params: {
    verification: VerificationWorkloadMetrics | null;
    shipments: ShipmentWorkloadMetrics | null;
    inventory: InventoryHealthMetrics | null;
    refunds: RefundMetrics | null;
    canReadPrescription: boolean;
    canReadOrders: boolean;
    canReadInventory: boolean;
    canReadRefund: boolean;
  }): AttentionItem[] {
    const items: AttentionItem[] = [];

    // Overdue verification SLA
    if (params.canReadPrescription && params.verification && params.verification.overdueSlaCount > 0) {
      items.push({
        id: 'ATTN_PRESCRIPTIONS_OVERDUE',
        type: 'VERIFICATION',
        severity: 'CRITICAL',
        title: 'Prescriptions Exceeding Review SLA',
        description: `${params.verification.overdueSlaCount} prescriptions have been waiting > 4 hours for clinical verification.`,
        count: params.verification.overdueSlaCount,
        actionUrl: '/account?tab=queue',
        actionLabel: 'Open Clinical Review Queue',
      });
    }

    // Critical inventory alerts
    if (params.canReadInventory && params.inventory && params.inventory.criticalCount > 0) {
      items.push({
        id: 'ATTN_INVENTORY_CRITICAL',
        type: 'INVENTORY',
        severity: 'CRITICAL',
        title: 'Formulations Critically Low',
        description: `${params.inventory.criticalCount} products are at or below emergency safety stock levels.`,
        count: params.inventory.criticalCount,
        actionUrl: '/admin?tab=inventory',
        actionLabel: 'Review Inventory Deficits',
      });
    }

    // Delayed shipments
    if (params.canReadOrders && params.shipments && params.shipments.oldestPendingShipmentWaitHours > 24) {
      items.push({
        id: 'ATTN_SHIPMENT_DELAY',
        type: 'SHIPMENT',
        severity: 'WARNING',
        title: 'Shipment Fulfillment Bottleneck',
        description: `Oldest paid order has been waiting ${params.shipments.oldestPendingShipmentWaitHours}h for bonded dispatch.`,
        count: params.shipments.pendingShipmentsCount,
        actionUrl: '/admin?tab=shipments',
        actionLabel: 'Inspect Fulfillment Queue',
      });
    }

    // Pending refund reviews
    if (params.canReadRefund && params.refunds && params.refunds.pendingRefundsCount > 0) {
      items.push({
        id: 'ATTN_PENDING_REFUNDS',
        type: 'REFUND',
        severity: 'WARNING',
        title: 'Unprocessed Refund Requests',
        description: `${params.refunds.pendingRefundsCount} customer refund requests await compliance review.`,
        count: params.refunds.pendingRefundsCount,
        actionUrl: '/admin?tab=refunds',
        actionLabel: 'Reconcile Refunds',
      });
    }

    return items;
  }

  /**
   * 9. RECENT ORDERS SANITIZED PROJECTION
   */
  public static async getRecentOrders(limit: number = 10) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        payment: { select: { status: true } },
        prescription: { select: { status: true } },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: o.user ? o.user.email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'Guest Patient',
      totalUsd: Number(o.totalUsd),
      status: o.status,
      paymentStatus: o.payment?.status || 'PENDING',
      prescriptionStatus: o.prescription?.status || null,
      createdAt: o.createdAt.toISOString(),
    }));
  }

  /**
   * 10. RECENT ACTIVITY AUDIT PROJECTION
   */
  public static async getRecentActivity(limit: number = 10) {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        userRole: true,
        timestamp: true,
      },
    });

    return logs.map((l) => ({
      id: l.id,
      action: l.action.replace(/_/g, ' '),
      resourceType: l.resourceType,
      resourceId: l.resourceId.substring(0, 8),
      userRole: l.userRole || 'SYSTEM',
      timestamp: l.timestamp.toISOString(),
    }));
  }
}
