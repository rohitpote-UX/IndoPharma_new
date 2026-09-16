/**
 * ==============================================================================
 * INDOPHARM — ORDERS DOMAIN SLICE
 * ==============================================================================
 */

import { OrderStatus } from '@/types';

export interface OrderSummary {
  orderNumber: string;
  placedAt: Date;
  status: OrderStatus;
  itemCount: number;
  totalUsd: number;
  trackingNumber?: string | null;
}
