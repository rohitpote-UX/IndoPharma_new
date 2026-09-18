/**
 * ==============================================================================
 * INDOPHARM — REORDER DOMAIN SERVICE
 * ==============================================================================
 * Manages customer repeat-purchases with non-manipulative, safe workflows:
 *  - NEVER blindly repeats old orders.
 *  - Evaluates current product status, current pricing, and price deltas.
 *  - Verifies real-time inventory and current stock availability.
 *  - Re-evaluates active clinical prescription status.
 *  - Prevents race conditions and duplicate submissions via idempotency.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { PrescriptionStatus } from '@prisma/client';

export class ReorderError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string = 'REORDER_ERROR', status: number = 400) {
    super(message);
    this.name = 'ReorderError';
    this.code = code;
    this.status = status;
  }
}

// In-memory idempotency registry for reorder submissions (1-minute window)
const REORDER_IDEMPOTENCY_STORE = new Map<string, { timestamp: number; result: any }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of REORDER_IDEMPOTENCY_STORE.entries()) {
    if (now - value.timestamp > 60 * 1000) {
      REORDER_IDEMPOTENCY_STORE.delete(key);
    }
  }
}, 60 * 1000).unref();

export interface ReorderItemCandidate {
  productId: string;
  productName: string;
  brandReferenceName: string;
  slug: string;
  strength: string;
  dosageForm: string;
  packageSize: number;
  lastOrderedDate: Date;
  lastOrderedOrderNumber: string;
  lastOrderedQuantity: number;
  previousPriceUsd: number;
  currentPriceUsd: number;
  priceChanged: boolean;
  priceDeltaUsd: number;
  stockStatus: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  isPurchasable: boolean;
  requiresPrescription: boolean;
  prescriptionStatus: 'VALID' | 'REQUIRED' | 'EXPIRED' | 'NOT_REQUIRED';
}

/**
 * Retrieves previously purchased medicines with current pricing, live inventory,
 * and current prescription verification states.
 */
export async function getCustomerReorderItems(userId: string): Promise<ReorderItemCandidate[]> {
  // 1. Fetch historical purchased items for this user
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        userId,
        status: {
          notIn: ['CANCELLED', 'PAYMENT_FAILED'],
        },
      },
    },
    orderBy: {
      order: {
        createdAt: 'desc',
      },
    },
    include: {
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
        },
      },
      product: {
        include: {
          inventories: {
            select: {
              quantityAvailable: true,
            },
          },
        },
      },
    },
  });

  if (orderItems.length === 0) {
    return [];
  }

  // 2. Check for active verified prescriptions on file for this user
  const activePrescriptions = await prisma.prescription.findMany({
    where: {
      userId,
      status: {
        in: [PrescriptionStatus.VERIFIED, PrescriptionStatus.APPROVED],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const now = new Date();
  const validPrescription = activePrescriptions.find(
    (p) => !p.expiresAt || new Date(p.expiresAt) > now
  );
  const expiredPrescription = activePrescriptions.find(
    (p) => p.expiresAt && new Date(p.expiresAt) <= now
  );

  // 3. Deduplicate by productId to get the most recent purchase of each item
  const productMap = new Map<string, typeof orderItems[0]>();
  for (const item of orderItems) {
    if (!productMap.has(item.productId)) {
      productMap.set(item.productId, item);
    }
  }

  const results: ReorderItemCandidate[] = [];

  for (const item of productMap.values()) {
    const product = item.product;
    const previousPriceUsd = Number(item.unitPriceUsd);
    const currentPriceUsd = Number(product.retailPriceUsd);
    const priceDeltaUsd = Number((currentPriceUsd - previousPriceUsd).toFixed(2));
    const priceChanged = Math.abs(priceDeltaUsd) >= 0.01;

    // Calculate total available stock across warehouse inventories
    const totalAvailableStock = product.inventories.reduce(
      (sum, inv) => sum + inv.quantityAvailable,
      0
    );

    let stockStatus: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'AVAILABLE';
    if (!product.isActive || totalAvailableStock <= 0) {
      stockStatus = 'OUT_OF_STOCK';
    } else if (totalAvailableStock < 10) {
      stockStatus = 'LOW_STOCK';
    }

    let rxStatus: 'VALID' | 'REQUIRED' | 'EXPIRED' | 'NOT_REQUIRED' = 'NOT_REQUIRED';
    if (product.requiresPrescription) {
      if (validPrescription) {
        rxStatus = 'VALID';
      } else if (expiredPrescription) {
        rxStatus = 'EXPIRED';
      } else {
        rxStatus = 'REQUIRED';
      }
    }

    const isPurchasable = stockStatus !== 'OUT_OF_STOCK' && product.isActive;

    results.push({
      productId: product.id,
      productName: product.name,
      brandReferenceName: product.brandReferenceName,
      slug: product.slug,
      strength: product.strength,
      dosageForm: product.dosageForm,
      packageSize: product.packageSize,
      lastOrderedDate: item.order.createdAt,
      lastOrderedOrderNumber: item.order.orderNumber,
      lastOrderedQuantity: item.quantity,
      previousPriceUsd,
      currentPriceUsd,
      priceChanged,
      priceDeltaUsd,
      stockStatus,
      isPurchasable,
      requiresPrescription: product.requiresPrescription,
      prescriptionStatus: rxStatus,
    });
  }

  return results;
}

export interface ReorderExecutionInput {
  productId: string;
  quantity?: number;
  idempotencyKey?: string;
}

/**
 * Validates reorder request against current product availability, stock, and prescription rules.
 * Prevents race condition / duplicate reorder requests.
 */
export async function validateAndExecuteReorder(
  userId: string,
  input: ReorderExecutionInput
) {
  // Idempotency check
  if (input.idempotencyKey) {
    const cached = REORDER_IDEMPOTENCY_STORE.get(input.idempotencyKey);
    if (cached) {
      return cached.result;
    }
  }

  const requestedQuantity = Math.max(1, Math.min(3, input.quantity || 1)); // Max 3 for 90-day personal import limit

  // 1. Fetch current authoritative product record
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    include: {
      inventories: {
        select: {
          quantityAvailable: true,
        },
      },
    },
  });

  if (!product || !product.isActive) {
    throw new ReorderError('This medication is currently discontinued or unavailable.', 'PRODUCT_UNAVAILABLE');
  }

  // 2. Validate current stock
  const totalStock = product.inventories.reduce((sum, inv) => sum + inv.quantityAvailable, 0);
  if (totalStock < requestedQuantity) {
    throw new ReorderError(
      `Insufficient warehouse inventory for reorder. Only ${totalStock} package(s) currently available.`,
      'INSUFFICIENT_STOCK'
    );
  }

  // 3. Check prescription status if required
  let prescriptionId: string | undefined;
  if (product.requiresPrescription) {
    const now = new Date();
    const activeRx = await prisma.prescription.findFirst({
      where: {
        userId,
        status: { in: [PrescriptionStatus.VERIFIED, PrescriptionStatus.APPROVED] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeRx) {
      throw new ReorderError(
        'A valid, approved prescription is required to reorder this medication.',
        'PRESCRIPTION_REQUIRED'
      );
    }
    prescriptionId = activeRx.id;
  }

  const currentPriceUsd = Number(product.retailPriceUsd);
  const totalUsd = Number((currentPriceUsd * requestedQuantity).toFixed(2));

  const result = {
    success: true,
    message: 'Reorder verified and prepared for checkout.',
    reorderItem: {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      quantity: requestedQuantity,
      unitPriceUsd: currentPriceUsd,
      totalUsd,
      prescriptionId,
      requiresPrescription: product.requiresPrescription,
    },
  };

  if (input.idempotencyKey) {
    REORDER_IDEMPOTENCY_STORE.set(input.idempotencyKey, {
      timestamp: Date.now(),
      result,
    });
  }

  return result;
}
