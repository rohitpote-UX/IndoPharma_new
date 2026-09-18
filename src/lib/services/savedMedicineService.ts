/**
 * ==============================================================================
 * INDOPHARM — SAVED MEDICINES SERVICE
 * ==============================================================================
 * Manages customer saved/favorite medications with real-time stock and price metadata.
 * ==============================================================================
 */

import { prisma } from '@/lib/db/client';

export async function toggleSavedMedicine(customerId: string, productId: string): Promise<{ saved: boolean }> {
  const existing = await prisma.savedMedicine.findUnique({
    where: {
      customerId_productId: {
        customerId,
        productId,
      },
    },
  });

  if (existing) {
    await prisma.savedMedicine.delete({
      where: { id: existing.id },
    });
    return { saved: false };
  }

  await prisma.savedMedicine.create({
    data: {
      customerId,
      productId,
    },
  });

  return { saved: true };
}

export async function getCustomerSavedMedicines(customerId: string) {
  const saved = await prisma.savedMedicine.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          brandReferenceName: true,
          slug: true,
          strength: true,
          dosageForm: true,
          packageSize: true,
          retailPriceUsd: true,
          stockStatus: true,
          requiresPrescription: true,
          isActive: true,
          manufacturer: {
            select: {
              name: true,
              country: true,
            },
          },
        },
      },
    },
  });

  return saved.map((item) => ({
    id: item.id,
    savedAt: item.createdAt,
    product: {
      ...item.product,
      retailPriceUsd: Number(item.product.retailPriceUsd),
      isAvailable: item.product.isActive && item.product.stockStatus === 'AVAILABLE',
    },
  }));
}
