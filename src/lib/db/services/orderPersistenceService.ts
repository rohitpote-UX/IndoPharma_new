/**
 * ==============================================================================
 * INDOPHARM — TRANSACTIONAL ORDER PERSISTENCE SERVICE
 * ==============================================================================
 * Enforces historical immutability, server-authoritative pricing, and
 * snapshot preservation (Golden Database Rules 8, 21, 22, 23).
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';
import { reserveInventory } from './inventoryService';
import { redeemCoupon } from './couponService';

export interface OrderItemInput {
  productId: string;
  productVariantId?: string;
  quantity: number;
  batchCertificateId?: string;
}

export interface AddressSnapshotInput {
  recipientName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderInput {
  userId: string;
  customerId?: string;
  shippingAddressId: string;
  prescriptionId?: string;
  items: OrderItemInput[];
  shippingAddressSnapshot: AddressSnapshotInput;
  billingAddressSnapshot?: AddressSnapshotInput;
  couponCode?: string;
  dispensingFeeUsd?: number;
  shippingUsd?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreatedOrderResult {
  orderId: string;
  orderNumber: string;
  totalUsd: number;
  subtotalUsd: number;
  discountTotalUsd: number;
  itemCount: number;
  status: string;
}

/**
 * Creates an authoritative order transaction with historical snapshots.
 */
export async function persistOrderTransaction(
  input: CreateOrderInput,
  client: typeof prisma = prisma
): Promise<CreatedOrderResult> {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `INDO-ORD-${Date.now().toString().slice(-6)}-${randomCode}`;

  return await client.$transaction(async (tx) => {
    // 1. Fetch authoritative product information for snapshots & pricing (Zero Client Trust)
    let calculatedSubtotal = 0;
    const itemsToCreate = [];

    for (const item of input.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        include: {
          manufacturer: true,
          variants: item.productVariantId ? { where: { id: item.productVariantId } } : undefined,
        },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found in catalog.`);
      }

      // Determine authoritative price
      const variant = item.productVariantId && product.variants?.length ? product.variants[0] : null;
      const unitPrice = variant ? Number(variant.retailPriceUsd) : Number(product.retailPriceUsd);
      const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      calculatedSubtotal += lineTotal;

      // Reserve stock atomically if variant exists
      if (variant) {
        await reserveInventory(variant.id, item.quantity, { client: tx as unknown as typeof prisma });
      }

      itemsToCreate.push({
        productId: product.id,
        productVariantId: variant?.id,
        batchCertificateId: item.batchCertificateId,
        // Immutable Snapshots
        productNameSnapshot: product.name,
        skuSnapshot: variant?.sku || product.sku,
        manufacturerSnapshot: product.manufacturer.name,
        quantity: item.quantity,
        unitPriceUsd: unitPrice,
        unitPriceMinorUnits: Math.round(unitPrice * 100),
        totalPriceUsd: lineTotal,
      });
    }

    // 2. Handle Coupon Discount Calculation
    let discountTotal = 0;
    let appliedCouponId: string | undefined = undefined;

    if (input.couponCode && input.customerId) {
      const normalizedCode = input.couponCode.trim().toUpperCase();
      const coupon = await tx.coupon.findUnique({
        where: { code: normalizedCode },
        include: { discount: true },
      });

      if (coupon && coupon.status === 'ACTIVE') {
        const discountVal = Number(coupon.discount.value);
        if (coupon.discount.type === 'PERCENTAGE') {
          discountTotal = (calculatedSubtotal * discountVal) / 100;
          if (coupon.discount.maxDiscountAmount) {
            discountTotal = Math.min(discountTotal, Number(coupon.discount.maxDiscountAmount));
          }
        } else {
          discountTotal = Math.min(discountVal, calculatedSubtotal);
        }
        discountTotal = Math.round(discountTotal * 100) / 100;
        appliedCouponId = coupon.id;
      }
    }

    const shippingFee = input.shippingUsd ?? 15.0;
    const dispensingFee = input.dispensingFeeUsd ?? 5.0;
    const finalTotal = Math.max(0, Math.round((calculatedSubtotal + shippingFee + dispensingFee - discountTotal) * 100) / 100);

    // 3. Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        customerId: input.customerId,
        status: 'PENDING_PRESCRIPTION',
        subtotalUsd: calculatedSubtotal,
        shippingUsd: shippingFee,
        dispensingFeeUsd: dispensingFee,
        discountTotalUsd: discountTotal,
        totalUsd: finalTotal,
        shippingAddressId: input.shippingAddressId,
        prescriptionId: input.prescriptionId,
        couponId: appliedCouponId,
        items: {
          create: itemsToCreate,
        },
      },
    });

    // 4. Create Immutable Order Address Snapshot
    await tx.orderAddressSnapshot.create({
      data: {
        orderId: order.id,
        shippingRecipientName: input.shippingAddressSnapshot.recipientName,
        shippingPhone: input.shippingAddressSnapshot.phone,
        shippingLine1: input.shippingAddressSnapshot.line1,
        shippingLine2: input.shippingAddressSnapshot.line2,
        shippingCity: input.shippingAddressSnapshot.city,
        shippingState: input.shippingAddressSnapshot.state,
        shippingPostalCode: input.shippingAddressSnapshot.postalCode,
        shippingCountry: input.shippingAddressSnapshot.country,
        billingRecipientName: input.billingAddressSnapshot?.recipientName,
        billingPhone: input.billingAddressSnapshot?.phone,
        billingLine1: input.billingAddressSnapshot?.line1,
        billingLine2: input.billingAddressSnapshot?.line2,
        billingCity: input.billingAddressSnapshot?.city,
        billingState: input.billingAddressSnapshot?.state,
        billingPostalCode: input.billingAddressSnapshot?.postalCode,
        billingCountry: input.billingAddressSnapshot?.country,
      },
    });

    // 5. Redeem coupon record atomically
    if (appliedCouponId && input.customerId) {
      await redeemCoupon(appliedCouponId, input.customerId, order.id, discountTotal, tx as unknown as typeof prisma);
    }

    // 6. Append-Only Audit Logging
    await tx.auditLog.create({
      data: {
        userId: input.userId,
        actorUserId: input.userId,
        userRole: 'PATIENT',
        action: 'ORDER_CREATED',
        resourceType: 'Order',
        resourceId: order.id,
        newState: {
          orderNumber: order.orderNumber,
          totalUsd: finalTotal,
          itemsCount: itemsToCreate.length,
          status: order.status,
        },
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalUsd: finalTotal,
      subtotalUsd: calculatedSubtotal,
      discountTotalUsd: discountTotal,
      itemCount: itemsToCreate.length,
      status: order.status,
    };
  });
}
