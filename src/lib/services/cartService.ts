/**
 * ==============================================================================
 * INDOPHARM — SERVER-AUTHORITATIVE CART SERVICE
 * ==============================================================================
 * Manages cart lifecycle, session tokens, and authoritative server-side pricing.
 * Revalidates destination eligibility on every addition, modification, and query.
 * ==============================================================================
 */

import { evaluateProductEligibility, evaluateCartEligibility, getDestinationInfo } from './eligibilityService';
import { VERIFIED_PRODUCTS_STORE, getProductBySlug } from './searchService';
import { CartEligibilityResult } from '@/lib/domain/eligibility';

export interface CartItemRecord {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface StoredCart {
  id: string;
  sessionToken: string;
  destinationCountryCode: string;
  destinationJurisdictionCode?: string;
  items: CartItemRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedCartItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  brandReferenceName: string;
  slug: string;
  activeIngredient: string;
  strength: string;
  dosageForm: string;
  packageSize: number;
  quantity: number;
  unitPriceUsd: number;
  lineTotalUsd: number;
  usAverageCashPrice: number;
  requiresPrescription: boolean;
  stockStatus: string;
}

export interface EnrichedCart {
  id: string;
  sessionToken: string;
  destination: {
    countryCode: string;
    countryName: string;
    currency: string;
    jurisdictionCode?: string;
  };
  items: EnrichedCartItem[];
  itemCount: number;
  totalQuantity: number;
  subtotalUsd: number;
  shippingUsd: number;
  estimatedTaxUsd: number;
  totalUsd: number;
  usAverageCashTotalUsd: number;
  totalSavingsUsd: number;
  eligibility: CartEligibilityResult;
  updatedAt: string;
}

// In-memory session cart store for development & server runtime
const IN_MEMORY_CARTS = new Map<string, StoredCart>();

/**
 * Get or create stored cart for a session token
 */
export function getOrCreateCart(sessionToken: string, destinationCountry: string = 'US'): StoredCart {
  let cart = IN_MEMORY_CARTS.get(sessionToken);

  if (!cart) {
    const cartId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    cart = {
      id: cartId,
      sessionToken,
      destinationCountryCode: destinationCountry.toUpperCase(),
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    IN_MEMORY_CARTS.set(sessionToken, cart);
  }

  return cart;
}

/**
 * Add Item to Cart with Strict Server-Side Eligibility Gate
 */
export async function addItemToCart(
  sessionToken: string,
  productId: string,
  quantity: number = 1,
  destinationCountry?: string
): Promise<{ success: boolean; cart?: EnrichedCart; error?: string; code?: string }> {
  // 1. Resolve product
  const product =
    VERIFIED_PRODUCTS_STORE.find((p) => p.id === productId || p.slug === productId) ||
    (await getProductBySlug(productId));

  if (!product) {
    return {
      success: false,
      code: 'PRODUCT_NOT_FOUND',
      error: 'The requested pharmaceutical product was not found.',
    };
  }

  const cart = getOrCreateCart(sessionToken, destinationCountry);
  const targetCountry = (destinationCountry || cart.destinationCountryCode || 'US').toUpperCase();

  // 2. Validate quantity limits (e.g. 1 to 3 packs max / 90-day supply)
  if (quantity < 1 || quantity > 3) {
    return {
      success: false,
      code: 'LIMIT_EXCEEDED',
      error: 'Order quantity exceeds maximum permitted limit (maximum 3 packs / 90-day personal supply).',
    };
  }
  const safeQty = quantity;

  // 3. Server-side Eligibility Evaluation
  const eligibility = await evaluateProductEligibility({
    productId: product.id,
    destination: {
      countryCode: targetCountry,
      jurisdictionCode: cart.destinationJurisdictionCode,
    },
    quantity: safeQty,
  });

  if (!eligibility.eligible && eligibility.status !== 'PRESCRIPTION_REQUIRED') {
    return {
      success: false,
      code: eligibility.status,
      error: eligibility.reason || `This product is not eligible for delivery to ${targetCountry}.`,
    };
  }

  // 4. Update cart item
  const existingItemIndex = cart.items.findIndex((item) => item.productId === product.id);

  if (existingItemIndex >= 0) {
    const newQty = Math.min(3, cart.items[existingItemIndex].quantity + safeQty);
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      quantity: safeQty,
      addedAt: new Date().toISOString(),
    });
  }

  cart.destinationCountryCode = targetCountry;
  cart.updatedAt = new Date().toISOString();
  IN_MEMORY_CARTS.set(sessionToken, cart);

  const enriched = await getEnrichedCart(sessionToken, targetCountry);
  return { success: true, cart: enriched };
}

/**
 * Update Cart Item Quantity
 */
export async function updateCartItemQuantity(
  sessionToken: string,
  itemId: string,
  quantity: number
): Promise<{ success: boolean; cart?: EnrichedCart; error?: string }> {
  const cart = IN_MEMORY_CARTS.get(sessionToken);
  if (!cart) {
    return { success: false, error: 'Cart session not found.' };
  }

  const itemIndex = cart.items.findIndex((i) => i.id === itemId);
  if (itemIndex < 0) {
    return { success: false, error: 'Cart item not found.' };
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = Math.max(1, Math.min(3, quantity));
  }

  cart.updatedAt = new Date().toISOString();
  IN_MEMORY_CARTS.set(sessionToken, cart);

  const enriched = await getEnrichedCart(sessionToken, cart.destinationCountryCode);
  return { success: true, cart: enriched };
}

/**
 * Remove Cart Item
 */
export async function removeCartItem(
  sessionToken: string,
  itemId: string
): Promise<{ success: boolean; cart?: EnrichedCart; error?: string }> {
  const cart = IN_MEMORY_CARTS.get(sessionToken);
  if (!cart) {
    return { success: false, error: 'Cart session not found.' };
  }

  cart.items = cart.items.filter((i) => i.id !== itemId);
  cart.updatedAt = new Date().toISOString();
  IN_MEMORY_CARTS.set(sessionToken, cart);

  const enriched = await getEnrichedCart(sessionToken, cart.destinationCountryCode);
  return { success: true, cart: enriched };
}

/**
 * Set Cart Destination Country & Re-evaluate
 */
export async function setCartDestination(
  sessionToken: string,
  countryCode: string,
  jurisdictionCode?: string
): Promise<EnrichedCart> {
  const cart = getOrCreateCart(sessionToken, countryCode);
  cart.destinationCountryCode = countryCode.toUpperCase();
  cart.destinationJurisdictionCode = jurisdictionCode;
  cart.updatedAt = new Date().toISOString();
  IN_MEMORY_CARTS.set(sessionToken, cart);

  return getEnrichedCart(sessionToken, countryCode, jurisdictionCode);
}

/**
 * Get Authoritative Recalculated Enriched Cart
 */
export async function getEnrichedCart(
  sessionToken: string,
  overrideCountry?: string,
  overrideJurisdiction?: string
): Promise<EnrichedCart> {
  const cart = getOrCreateCart(sessionToken, overrideCountry);
  const countryCode = (overrideCountry || cart.destinationCountryCode || 'US').toUpperCase();
  const jurisdictionCode = overrideJurisdiction || cart.destinationJurisdictionCode;
  const destination = getDestinationInfo(countryCode, jurisdictionCode);

  const enrichedItems: EnrichedCartItem[] = [];
  let subtotal = 0;
  let usCashTotal = 0;
  let totalQuantity = 0;

  for (const item of cart.items) {
    const product = VERIFIED_PRODUCTS_STORE.find((p) => p.id === item.productId);
    if (!product) continue;

    const lineTotal = product.retailPriceUsd * item.quantity;
    const lineUsCash = (product.usAverageCashPrice || product.retailPriceUsd * 3) * item.quantity;

    subtotal += lineTotal;
    usCashTotal += lineUsCash;
    totalQuantity += item.quantity;

    enrichedItems.push({
      id: item.id,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      brandReferenceName: product.brandReferenceName,
      slug: product.slug,
      activeIngredient: product.activeIngredient,
      strength: product.strength,
      dosageForm: product.dosageForm,
      packageSize: product.packageSize,
      quantity: item.quantity,
      unitPriceUsd: product.retailPriceUsd,
      lineTotalUsd: lineTotal,
      usAverageCashPrice: product.usAverageCashPrice || 0,
      requiresPrescription: product.requiresPrescription,
      stockStatus: product.stockStatus,
    });
  }

  // Shipping calculation: $12.50 flat bonded air, or free over $100
  const shippingUsd = enrichedItems.length === 0 ? 0 : subtotal >= 100 ? 0.0 : 12.5;
  const estimatedTaxUsd = 0.0; // Duty-free under US FDA CPG 110.300 / Section 321
  const totalUsd = subtotal + shippingUsd + estimatedTaxUsd;
  const totalSavingsUsd = Math.max(0, usCashTotal - subtotal);

  // Multi-item eligibility evaluation
  const cartEligibilityItems = enrichedItems.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
  }));

  const eligibility = await evaluateCartEligibility(cartEligibilityItems, {
    countryCode: destination.countryCode,
    jurisdictionCode: destination.jurisdictionCode,
  });

  return {
    id: cart.id,
    sessionToken,
    destination,
    items: enrichedItems,
    itemCount: enrichedItems.length,
    totalQuantity,
    subtotalUsd: subtotal,
    shippingUsd,
    estimatedTaxUsd,
    totalUsd,
    usAverageCashTotalUsd: usCashTotal,
    totalSavingsUsd,
    eligibility,
    updatedAt: cart.updatedAt,
  };
}

/**
 * Clear all items from cart upon successful order placement
 */
export async function clearCart(sessionToken: string): Promise<void> {
  const cart = IN_MEMORY_CARTS.get(sessionToken);
  if (cart) {
    cart.items = [];
    cart.updatedAt = new Date().toISOString();
    IN_MEMORY_CARTS.set(sessionToken, cart);
  }
}
