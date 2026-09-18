/**
 * GET /api/customer/orders
 * ==============================================================================
 * Retrieves authenticated customer's order history with items, pricing,
 * prescription status, and shipment status. Enforces strict IDOR protection.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/rbac/guard';
import { prisma } from '@/lib/db/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  brandReferenceName: true,
                },
              },
            },
          },
          prescription: {
            select: {
              id: true,
              status: true,
              prescriberName: true,
            },
          },
          shipment: {
            select: {
              id: true,
              trackingNumber: true,
              carrier: true,
              currentStage: true,
              estimatedDelivery: true,
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              provider: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId: session.userId } }),
    ]);

    const sanitizedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalUsd: Number(o.totalUsd),
      subtotalUsd: Number(o.subtotalUsd),
      shippingUsd: Number(o.shippingUsd),
      discountTotalUsd: Number(o.discountTotalUsd),
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productNameSnapshot,
        sku: i.skuSnapshot,
        quantity: i.quantity,
        unitPriceUsd: Number(i.unitPriceUsd),
        totalPriceUsd: Number(i.totalPriceUsd),
        slug: i.product.slug,
      })),
      prescription: o.prescription
        ? {
            id: o.prescription.id,
            status: o.prescription.status,
            prescriberName: o.prescription.prescriberName,
          }
        : null,
      shipment: o.shipment
        ? {
            id: o.shipment.id,
            trackingNumber: o.shipment.trackingNumber,
            carrier: o.shipment.carrier,
            currentStage: o.shipment.currentStage,
            estimatedDelivery: o.shipment.estimatedDelivery,
          }
        : null,
      payment: o.payment
        ? {
            status: o.payment.status,
            provider: o.payment.provider,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      orders: sanitizedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve orders.', code: err.code || 'ORDER_ERROR' },
      { status }
    );
  }
}
