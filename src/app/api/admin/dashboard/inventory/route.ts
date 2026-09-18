/**
 * GET /api/admin/dashboard/inventory
 * ==============================================================================
 * Inventory status drilldown endpoint for warehouse & operations staff.
 * Filters products by health status (CRITICAL, LOW_STOCK, OUT_OF_STOCK, EXPIRING).
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/rbac/guard';
import { prisma } from '@/lib/db/client';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    if (session.role === UserRole.PATIENT) {
      return NextResponse.json({ success: false, error: 'Access denied.', code: 'FORBIDDEN' }, { status: 403 });
    }
    requirePermission(session, 'dashboard:inventory:read');

    const url = new URL(req.url);
    const filter = url.searchParams.get('filter')?.toUpperCase() || 'ALL';

    const inventories = await prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            brandReferenceName: true,
            dosageForm: true,
            strength: true,
          },
        },
        batch: {
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            quantityRemaining: true,
            status: true,
          },
        },
      },
      orderBy: { quantityAvailable: 'asc' },
    });

    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    const items = inventories
      .map((inv) => {
        const netAvailable = inv.quantityAvailable;
        const reorderPt = inv.reorderThreshold || 50;
        const safety = Math.floor(reorderPt / 2);

        let status: 'CRITICAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'HEALTHY' = 'HEALTHY';
        if (netAvailable <= 0) status = 'OUT_OF_STOCK';
        else if (netAvailable <= safety) status = 'CRITICAL';
        else if (netAvailable <= reorderPt) status = 'LOW_STOCK';

        const isExpiring = inv.batch && inv.batch.expiryDate <= ninetyDays;

        return {
          id: inv.id,
          productId: inv.product.id,
          productName: inv.product.name,
          sku: inv.product.sku,
          brandReference: inv.product.brandReferenceName,
          strength: inv.product.strength,
          dosageForm: inv.product.dosageForm,
          quantityOnHand: inv.quantityOnHand,
          quantityReserved: inv.quantityReserved,
          quantityAvailable: inv.quantityAvailable,
          reorderThreshold: reorderPt,
          safetyStock: safety,
          status,
          batchNumber: inv.batch?.batchNumber || null,
          batchExpiry: inv.batch?.expiryDate?.toISOString() || null,
          isExpiringSoon: !!isExpiring,
        };
      })
      .filter((item) => {
        if (filter === 'CRITICAL') return item.status === 'CRITICAL';
        if (filter === 'LOW_STOCK') return item.status === 'LOW_STOCK';
        if (filter === 'OUT_OF_STOCK') return item.status === 'OUT_OF_STOCK';
        if (filter === 'EXPIRING') return item.isExpiringSoon;
        return true;
      });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve inventory.', code: err.code || 'INVENTORY_ERROR' },
      { status }
    );
  }
}
