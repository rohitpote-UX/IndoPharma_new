/**
 * GET /api/customer/orders/[id]
 * ==============================================================================
 * Retrieves detailed single order information with immutable address snapshot.
 * Enforces strict object-level IDOR validation:
 *  - Customers can only view their own order.
 *  - Staff with order:read_all can view for operations.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, assertOrderAccess } from '@/lib/auth/rbac/guard';
import { prisma } from '@/lib/db/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                brandReferenceName: true,
                strength: true,
                dosageForm: true,
              },
            },
          },
        },
        addressSnapshot: true,
        prescription: {
          select: {
            id: true,
            status: true,
            prescriberName: true,
            originalFileName: true,
            verifiedAt: true,
          },
        },
        shipment: {
          include: {
            events: {
              orderBy: { eventTime: 'asc' },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            provider: true,
            amountMinorUnits: true,
            currency: true,
            capturedAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // IDOR Check
    assertOrderAccess(session, order.userId);

    const sanitized = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalUsd: Number(order.totalUsd),
      subtotalUsd: Number(order.subtotalUsd),
      shippingUsd: Number(order.shippingUsd),
      dispensingFeeUsd: Number(order.dispensingFeeUsd),
      discountTotalUsd: Number(order.discountTotalUsd),
      taxTotalUsd: Number(order.taxTotalUsd),
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productNameSnapshot,
        sku: i.skuSnapshot,
        manufacturer: i.manufacturerSnapshot,
        quantity: i.quantity,
        unitPriceUsd: Number(i.unitPriceUsd),
        totalPriceUsd: Number(i.totalPriceUsd),
        slug: i.product.slug,
        strength: i.product.strength,
        dosageForm: i.product.dosageForm,
      })),
      shippingAddress: order.addressSnapshot
        ? {
            recipientName: order.addressSnapshot.shippingRecipientName,
            phone: order.addressSnapshot.shippingPhone,
            line1: order.addressSnapshot.shippingLine1,
            line2: order.addressSnapshot.shippingLine2,
            city: order.addressSnapshot.shippingCity,
            state: order.addressSnapshot.shippingState,
            postalCode: order.addressSnapshot.shippingPostalCode,
            country: order.addressSnapshot.shippingCountry,
          }
        : null,
      prescription: order.prescription,
      shipment: order.shipment
        ? {
            id: order.shipment.id,
            carrier: order.shipment.carrier,
            service: order.shipment.service,
            trackingNumber: order.shipment.trackingNumber,
            currentStage: order.shipment.currentStage,
            shippedAt: order.shipment.shippedAt,
            estimatedDelivery: order.shipment.estimatedDelivery,
            actualDelivery: order.shipment.actualDelivery,
            events: order.shipment.events,
          }
        : null,
      payment: order.payment
        ? {
            status: order.payment.status,
            provider: order.payment.provider,
            amountUsd: Number((order.payment.amountMinorUnits / 100).toFixed(2)),
            currency: order.payment.currency,
            capturedAt: order.payment.capturedAt,
          }
        : null,
    };

    return NextResponse.json({ success: true, order: sanitized });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'IDOR_REJECTED' ? 403 : 404);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve order.', code: err.code || 'ORDER_ERROR' },
      { status }
    );
  }
}
