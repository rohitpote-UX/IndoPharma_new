/**
 * GET /api/admin/dashboard/overview
 * ==============================================================================
 * Centralized BI & Operations command center metrics endpoint.
 * Enforces strict role-based data scoping:
 *  - PATIENT: Blocked with HTTP 403
 *  - OPS_WAREHOUSE: Orders, fulfillment, inventory (financials redacted)
 *  - CLINICAL_PHARMACIST: Prescriptions, queues, SLAs (financials redacted)
 *  - SUPPORT_AGENT: Orders, customer tickets (financials redacted)
 *  - ADMIN & SUPER_ADMIN: Full business intelligence & financial analytics
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/rbac/guard';
import { UserRole } from '@prisma/client';
import { DashboardService, DateRangePreset } from '@/lib/services/dashboardService';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);

    // Reject consumer patients immediately
    if (session.role === UserRole.PATIENT) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Administrative privilege required.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    requirePermission(session, 'dashboard:read');

    const url = new URL(req.url);
    const preset = (url.searchParams.get('range') || '30d') as DateRangePreset;
    const customStart = url.searchParams.get('startDate') || undefined;
    const customEnd = url.searchParams.get('endDate') || undefined;
    const timezone = url.searchParams.get('timezone') || 'Asia/Kolkata';

    const bounds = DashboardService.resolveDateBounds(preset, customStart, customEnd, timezone);
    const overview = await DashboardService.getOverview(bounds, session);

    return NextResponse.json({
      success: true,
      overview,
    });
  } catch (err: any) {
    const status = err.status || (err.code === 'UNAUTHENTICATED' ? 401 : err.code === 'INSUFFICIENT_PERMISSIONS' ? 403 : 500);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate dashboard overview.', code: err.code || 'DASHBOARD_ERROR' },
      { status }
    );
  }
}
