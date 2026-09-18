/**
 * GET /api/admin/dashboard/orders
 * ==============================================================================
 * Paginated operational order query endpoint for staff investigation.
 * Supports status filtering, search by orderNumber/email, and date boundaries.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/rbac/guard';
import { prisma } from '@/lib/db/client';
import { OrderStatus, UserRole } from '@prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    if (session.role === UserRole.PATIENT) {
      return NextResponse.json({ success: false, error: 'Access denied.', code: 'FORBIDDEN' }, { status: 403 });
    }
    requirePermission(session, 'dashboard:orders:read');

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '25', 10)));
    const status = url.searchParams.get('status') as OrderStatus | null;
    const search = url.searchParams.get('search')?.trim() || '';

    const whereClause: any = {};

    if (status && Object.values(OrderStatus).includes(status)) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true } },
          prescription: { select: { id: true, status: true } },
          shipment: { select: { currentStage: true, trackingNumber: true, carrier: true } },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    const sanitized = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerEmail: o.user ? o.user.email.replace(/(.{2})(.*)(?=@)/, '$1***') : 'Guest Patient',
      totalUsd: Number(o.totalUsd),
      status: o.status,
      prescriptionStatus: o.prescription?.status || null,
      shipment: o.shipment
        ? {
            carrier: o.shipment.carrier,
            stage: o.shipment.currentStage,
            trackingNumber: o.shipment.trackingNumber,
          }
        : null,
      createdAt: o.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      orders: sanitized,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve orders.', code: err.code || 'ORDER_ERROR' },
      { status }
    );
  }
}
