/**
 * POST /api/orders/[id]/tracking/event
 * ==============================================================================
 * Ingests logistics tracking events, advances shipment stages, and synchronizes
 * order status. Restricted to Operations / Logistics personnel or authorized webhook.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAnyPermission } from '@/lib/auth/rbac/guard';
import { prisma } from '@/lib/db/client';
import { TrackingService } from '@/lib/services/trackingService';
import { ShipmentStage } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    requireAnyPermission(session, ['inventory:manage', 'order:fulfill', 'order:update', 'admin:access']);

    const { id } = await params;
    const body = await req.json();

    const { stage, location, description, eventTime } = body;

    if (!stage || !location || !description) {
      return NextResponse.json(
        { success: false, error: 'stage, location, and description are required.', code: 'INVALID_INPUT' },
        { status: 400 }
      );
    }

    if (!Object.values(ShipmentStage).includes(stage)) {
      return NextResponse.json(
        { success: false, error: `Invalid shipment stage: ${stage}`, code: 'INVALID_STAGE' },
        { status: 400 }
      );
    }

    // Find shipment for this order
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found.', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!order.shipment) {
      return NextResponse.json(
        { success: false, error: 'No shipment record initialized for this order.', code: 'NO_SHIPMENT' },
        { status: 400 }
      );
    }

    const result = await TrackingService.recordTrackingEvent({
      shipmentId: order.shipment.id,
      stage,
      location,
      description,
      eventTime: eventTime ? new Date(eventTime) : undefined,
    });

    return NextResponse.json({
      success: true,
      eventId: result.eventId,
      stage: result.stage,
      message: 'Tracking event recorded successfully.',
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'FORBIDDEN' ? 403 : 400);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record tracking event.', code: err.code || 'EVENT_ERROR' },
      { status }
    );
  }
}
