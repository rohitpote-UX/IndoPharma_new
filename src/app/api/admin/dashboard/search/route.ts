/**
 * GET /api/admin/dashboard/search
 * ==============================================================================
 * Global administrative command-center search endpoint.
 * Searches across Orders, Shipments, Products, Customers, and Prescriptions.
 * Enforces field-level RBAC: Only roles with permitted scopes see corresponding entities.
 * ==============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/auth/rbac/guard';
import { hasPermission } from '@/lib/auth/rbac/permissions';
import { prisma } from '@/lib/db/client';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = requireAuth(req);
    if (session.role === UserRole.PATIENT) {
      return NextResponse.json({ success: false, error: 'Access denied.', code: 'FORBIDDEN' }, { status: 403 });
    }
    requirePermission(session, 'dashboard:read');

    const url = new URL(req.url);
    const query = url.searchParams.get('q')?.trim() || '';

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        results: { orders: [], shipments: [], products: [], customers: [] },
      });
    }

    const canReadOrders = hasPermission(session.role, 'dashboard:orders:read');
    const canReadCustomer = hasPermission(session.role, 'dashboard:customer:read');
    const canReadInventory = hasPermission(session.role, 'dashboard:inventory:read');

    const [orders, shipments, products, customers] = await Promise.all([
      // 1. Orders search
      canReadOrders
        ? prisma.order.findMany({
            where: {
              orderNumber: { contains: query, mode: 'insensitive' },
            },
            take: 5,
            select: {
              id: true,
              orderNumber: true,
              status: true,
              totalUsd: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),

      // 2. Shipments search by trackingNumber
      canReadOrders
        ? prisma.shipment.findMany({
            where: {
              trackingNumber: { contains: query, mode: 'insensitive' },
            },
            take: 5,
            select: {
              id: true,
              trackingNumber: true,
              carrier: true,
              currentStage: true,
              orderId: true,
            },
          })
        : Promise.resolve([]),

      // 3. Products search by name or SKU
      canReadInventory
        ? prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { sku: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              retailPriceUsd: true,
            },
          })
        : Promise.resolve([]),

      // 4. Customers search by email
      canReadCustomer
        ? prisma.user.findMany({
            where: {
              email: { contains: query, mode: 'insensitive' },
              role: UserRole.PATIENT,
            },
            take: 5,
            select: {
              id: true,
              email: true,
              role: true,
              status: true,
              createdAt: true,
            },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      query,
      results: {
        orders: orders.map((o) => ({
          id: o.id,
          title: `Order #${o.orderNumber}`,
          subtitle: `${o.status.replace(/_/g, ' ')} • $${Number(o.totalUsd).toFixed(2)}`,
          url: `/admin?tab=orders&search=${o.orderNumber}`,
        })),
        shipments: shipments.map((s) => ({
          id: s.id,
          title: `${s.carrier} Tracking #${s.trackingNumber}`,
          subtitle: `Stage: ${s.currentStage.replace(/_/g, ' ')}`,
          url: `/orders/${s.orderId}/tracking`,
        })),
        products: products.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `SKU: ${p.sku} • $${Number(p.retailPriceUsd).toFixed(2)}`,
          url: `/medicines/${p.slug}`,
        })),
        customers: customers.map((c) => ({
          id: c.id,
          title: c.email.replace(/(.{2})(.*)(?=@)/, '$1***'),
          subtitle: `Status: ${c.status} • Joined ${new Date(c.createdAt).toLocaleDateString()}`,
          url: `/admin?tab=customers&search=${c.id}`,
        })),
      },
    });
  } catch (err: any) {
    const status = err.status || 500;
    return NextResponse.json(
      { success: false, error: err.message || 'Search failed.', code: err.code || 'SEARCH_ERROR' },
      { status }
    );
  }
}
