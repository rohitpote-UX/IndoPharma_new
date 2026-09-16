/**
 * ==============================================================================
 * INDOPHARM — CART DOMAIN SLICE
 * ==============================================================================
 */

export interface CartItem {
  productId: string;
  quantity: number;
  packageCount: number; // e.g. 90 tablets
  unitPriceUsd: number;
}

export interface CartSession {
  id: string;
  items: CartItem[];
  subtotalUsd: number;
  estimatedShippingUsd: number;
  estimatedCustomsUsd: number;
  estimatedDispensingUsd: number;
  estimatedTotalUsd: number;
}
