/**
 * GET /api/orders/[id]/tracking
 * ==============================================================================
 * Retrieves patient-friendly cross-border tracking milestones, carrier link,
 * cold-chain verification, and raw event history for an order.
 * Enforces IDOR security: Only the ordering patient or authorized staff can access.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, hasPermission } from '@/lib/auth/rbac/guard';
import { TrackingService } from '@/lib/services/trackingService';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    const { id } = await params;

    const isStaff = hasPermission(session.role, 'order:read_all') || session.role === 'ADMIN' || session.role === 'SUPER_ADMIN';

    const tracking = await TrackingService.getOrderTracking(id, session.userId, isStaff);

    return NextResponse.json({
      success: true,
      tracking,
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'IDOR_REJECTED' ? 403 : 404);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to retrieve order tracking.',
        code: err.code || 'TRACKING_ERROR',
      },
      { status }
    );
  }
}
