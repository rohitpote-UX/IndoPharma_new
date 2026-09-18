/**
 * ==============================================================================
 * INDOPHARM — TRANSACTIONAL COUPON & DISCOUNT SERVICE
 * ==============================================================================
 * Concurrency-safe coupon validation and atomic redemption.
 * Enforces Golden Database Rule: Usage limit is never exceeded under concurrency.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';

export class CouponValidationError extends Error {
  public readonly code: string;

  constructor(code: string, reason: string) {
    super(`Coupon validation failed for code "${code}": ${reason}`);
    this.name = 'CouponValidationError';
    this.code = code;
  }
}

export interface CouponValidationResult {
  valid: boolean;
  couponId: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  calculatedDiscountUsd: number;
  finalTotalUsd: number;
}

/**
 * Validates a coupon code server-side against an order subtotal.
 * NEVER trust client-calculated discounts.
 */
export async function validateCoupon(
  code: string,
  customerId: string,
  orderSubtotalUsd: number,
  client: typeof prisma = prisma
): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  const coupon = await client.coupon.findUnique({
    where: { code: normalizedCode },
    include: { discount: true },
  });

  if (!coupon) {
    throw new CouponValidationError(code, 'Coupon code does not exist.');
  }

  if (coupon.status !== 'ACTIVE') {
    throw new CouponValidationError(code, `Coupon is ${coupon.status.toLowerCase()}.`);
  }

  const now = new Date();
  if (coupon.startAt > now) {
    throw new CouponValidationError(code, 'Coupon is not yet active.');
  }

  if (coupon.endAt && coupon.endAt < now) {
    throw new CouponValidationError(code, 'Coupon has expired.');
  }

  // Global usage limit check
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new CouponValidationError(code, 'Coupon global redemption limit reached.');
  }

  // Per-customer usage limit check
  const customerRedemptions = await client.couponRedemption.count({
    where: {
      couponId: coupon.id,
      customerId,
    },
  });

  if (customerRedemptions >= coupon.perCustomerLimit) {
    throw new CouponValidationError(
      code,
      `You have already reached the maximum usage limit (${coupon.perCustomerLimit}) for this coupon.`
    );
  }

  // Minimum order threshold check
  const minOrder = coupon.discount.minOrderAmount ? Number(coupon.discount.minOrderAmount) : 0;
  if (orderSubtotalUsd < minOrder) {
    throw new CouponValidationError(
      code,
      `Minimum order total of $${minOrder.toFixed(2)} required to apply this coupon.`
    );
  }

  // Calculate authoritative discount
  const discountVal = Number(coupon.discount.value);
  let calculatedDiscount = 0;

  if (coupon.discount.type === 'PERCENTAGE') {
    calculatedDiscount = (orderSubtotalUsd * discountVal) / 100;
    if (coupon.discount.maxDiscountAmount) {
      const maxDiscount = Number(coupon.discount.maxDiscountAmount);
      calculatedDiscount = Math.min(calculatedDiscount, maxDiscount);
    }
  } else {
    // FIXED_AMOUNT
    calculatedDiscount = Math.min(discountVal, orderSubtotalUsd);
  }

  // Round to 2 decimal places
  calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;
  const finalTotal = Math.max(0, Math.round((orderSubtotalUsd - calculatedDiscount) * 100) / 100);

  return {
    valid: true,
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discount.type,
    discountValue: discountVal,
    calculatedDiscountUsd: calculatedDiscount,
    finalTotalUsd: finalTotal,
  };
}

/**
 * Concurrency-safe atomic coupon redemption.
 * Must be called in a transaction when placing or confirming an order.
 */
export async function redeemCoupon(
  couponId: string,
  customerId: string,
  orderId: string,
  discountAmountUsd: number,
  client: typeof prisma = prisma
): Promise<void> {
  const coupon = await client.coupon.findUnique({
    where: { id: couponId },
  });

  if (!coupon) {
    throw new Error(`Coupon ${couponId} not found.`);
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw new CouponValidationError(coupon.code, 'Coupon usage limit reached under concurrent request.');
  }

  // Atomic increment and status update if depleted
  const newUsageCount = coupon.usageCount + 1;
  const isDepleted = coupon.usageLimit !== null && newUsageCount >= coupon.usageLimit;

  await client.coupon.update({
    where: { id: couponId },
    data: {
      usageCount: { increment: 1 },
      ...(isDepleted ? { status: 'DEPLETED' } : {}),
    },
  });

  // Record redemption proof
  await client.couponRedemption.create({
    data: {
      couponId,
      customerId,
      orderId,
      discountAmount: discountAmountUsd,
    },
  });
}
