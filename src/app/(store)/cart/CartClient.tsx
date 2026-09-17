'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { EnrichedCart, EnrichedCartItem } from '@/lib/services/cartService';
import { useDestination } from '@/lib/context/DestinationContext';
import { formatCurrency } from '@/utils/formatters';
import {
  Pill,
  Trash2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  Globe,
  Loader2,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

export function CartClient() {
  const router = useRouter();
  const { destination, setDestinationCountry, availableCountries } = useDestination();

  const [cart, setCart] = useState<EnrichedCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load cart for current destination
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cart?country=${destination.countryCode}`);
        if (!res.ok) throw new Error('Failed to load cart.');
        const json = await res.json();
        if (!cancelled) {
          if (json.success && json.data) {
            setCart(json.data);
          } else {
            throw new Error(json.error || 'Unable to retrieve cart items.');
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('[CartClient] Fetch error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load cart.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, [destination.countryCode, refreshKey]);

  // Update item quantity
  const handleQuantityChange = async (itemId: string, newQty: number) => {
    setUpdatingItemId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
      } else {
        alert(json.error || 'Failed to update quantity.');
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItemId(itemId);
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!cart || !cart.eligibility.isPurchasable) return;
    router.push('/checkout');
  };

  // 1. Loading Skeleton
  if (isLoading && !cart) {
    return (
      <div className="bg-white min-h-screen py-12 sm:py-16">
        <Container>
          <div className="max-w-3xl space-y-3 pb-8 border-b border-[#E6ECE7] animate-pulse">
            <div className="h-4 w-24 bg-neutral-100 rounded" />
            <div className="h-10 w-48 bg-neutral-200 rounded" />
            <div className="h-4 w-96 bg-neutral-100 rounded" />
          </div>
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-36 rounded-2xl border border-[#E6ECE7] bg-neutral-50 animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-5 h-64 rounded-2xl border border-[#E6ECE7] bg-neutral-50 animate-pulse" />
          </div>
        </Container>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="bg-white min-h-screen py-16 text-center">
        <Container>
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-rose-200 bg-white space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-serif text-[#111411]">We couldn&apos;t load your cart.</h2>
            <p className="text-xs text-[#59605A]">{error}</p>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F5D3A] text-white text-xs font-semibold hover:bg-[#3F704A] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </Container>
      </div>
    );
  }

  // 3. Empty State
  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white min-h-screen py-16 sm:py-24">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F3F7F3] text-[#2F5D3A] border border-[#E6ECE7] flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-serif tracking-tight text-[#111411]">Your Cart is Empty</h1>
              <p className="text-sm text-[#59605A]">
                You have not added any maintenance therapies to your order yet.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/medicines"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#2F5D3A] text-white text-sm font-semibold hover:bg-[#3F704A] transition-colors shadow-xs"
              >
                <span>Explore Medicines</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const isPurchasable = cart.eligibility.isPurchasable;
  const currency = cart.destination.currency;

  return (
    <div className="bg-white min-h-screen py-10 sm:py-16">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E6ECE7]">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2F5D3A] block">
              ORDER REVIEW & COMPLIANCE
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#111411] mt-1">
              Your Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-xs sm:text-sm text-[#59605A] mt-1">
              Standard 90-day personal maintenance supply directly sourced from verified manufacturers.
            </p>
          </div>

          {/* Active Destination Selector */}
          <div className="flex items-center gap-2 bg-[#F3F7F3] px-3 py-1.5 rounded-lg border border-[#E6ECE7] text-xs">
            <Globe className="w-4 h-4 text-[#2F5D3A]" />
            <span className="text-[#59605A]">Destination:</span>
            <select
              value={destination.countryCode}
              onChange={(e) => setDestinationCountry(e.target.value)}
              className="font-semibold text-[#111411] bg-transparent focus:outline-hidden cursor-pointer"
              aria-label="Change destination country"
            >
              {availableCountries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code === 'US' ? '🇺🇸 ' : c.code === 'IN' ? '🇮🇳 ' : c.code === 'GB' ? '🇬🇧 ' : '🇨🇦 '}
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Eligibility Warning / Blocker Banner */}
        {!isPurchasable && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">One or more items cannot be shipped to {cart.destination.countryName}:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5 text-rose-800">
                {cart.eligibility.blockers.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
              <p className="mt-2 text-rose-700">Please remove restricted items or select an eligible destination country before proceeding.</p>
            </div>
          </div>
        )}

        {isPurchasable && cart.eligibility.warnings.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-[#F3F7F3] border border-[#2F5D3A]/20 flex items-start gap-3 text-xs text-[#111411]">
            <FileCheck className="w-5 h-5 text-[#2F5D3A] shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold text-[#2F5D3A]">Prescription Verification Required at Checkout:</strong>
              <p className="text-[#59605A] mt-0.5">
                Your order contains prescription maintenance therapies. You will be prompted to securely upload or link your physician prescription during checkout.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Grid: Items (Left) vs Financial Summary (Right) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: Cart Items (7 Columns) */}
          <div className="lg:col-span-7 space-y-4">
            {cart.items.map((item: EnrichedCartItem) => {
              const itemEligibility = cart.eligibility.items.find((ei) => ei.productId === item.productId);
              const isItemBlocked = itemEligibility ? !itemEligibility.result.eligible : false;
              const isUpdating = updatingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-5 sm:p-6 bg-white transition-all space-y-4 ${
                    isItemBlocked
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-[#E6ECE7] hover:border-[#2F5D3A]/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Visual Icon */}
                    <div className="w-14 h-14 rounded-xl bg-[#F3F7F3] border border-[#E6ECE7] flex items-center justify-center text-[#2F5D3A] shrink-0">
                      <Pill className="w-7 h-7" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            href={`/medicines/${item.slug}`}
                            className="text-base font-serif font-bold text-[#111411] hover:text-[#2F5D3A] transition-colors"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs font-mono text-[#59605A]">
                            Active: {item.activeIngredient} • {item.strength}
                          </p>
                          <p className="text-xs text-neutral-400 italic">
                            {item.brandReferenceName}
                          </p>
                        </div>

                        {/* Price display */}
                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold font-mono text-[#111411]">
                            {formatCurrency(item.lineTotalUsd, currency)}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {formatCurrency(item.unitPriceUsd, currency)} / pack
                          </div>
                        </div>
                      </div>

                      {/* Item-level status tag */}
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                          Pack: {item.packageSize} Units
                        </span>
                        {item.requiresPrescription && (
                          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-[#2F5D3A] bg-[#F3F7F3] px-2 py-0.5 rounded border border-[#2F5D3A]/20">
                            <FileCheck className="w-3 h-3" />
                            Prescription Required
                          </span>
                        )}
                        {isItemBlocked && (
                          <span className="inline-flex items-center gap-1 font-medium text-[11px] text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            Ineligible for {cart.destination.countryName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity controls and Remove row */}
                  <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-[#59605A]">Quantity (Packs):</span>
                      <div className="flex items-center border border-[#E6ECE7] rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          disabled={item.quantity <= 1 || isUpdating}
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#111411] hover:bg-[#F3F7F3] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center font-mono font-bold text-xs text-[#111411]">
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin text-[#2F5D3A]" /> : item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= 3 || isUpdating}
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#111411] hover:bg-[#F3F7F3] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        ({item.quantity * 90} Days Supply)
                      </span>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#59605A] hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer p-1"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 flex items-center justify-between text-xs text-[#59605A]">
              <Link href="/medicines" className="text-[#2F5D3A] font-semibold hover:underline">
                ← Continue browsing catalogue
              </Link>
              <span>Limit: 90-day personal importation per prescription</span>
            </div>
          </div>

          {/* RIGHT: Financial Order Summary (5 Columns) */}
          <div className="lg:col-span-5 bg-[#F3F7F3] rounded-2xl border border-[#E6ECE7] p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-serif font-bold text-[#111411]">Order Summary</h2>

            {/* Price Line Items */}
            <div className="space-y-3 text-xs sm:text-sm text-[#59605A] border-b border-[#E6ECE7] pb-4">
              <div className="flex items-center justify-between">
                <span>Medication Subtotal:</span>
                <span className="font-mono font-bold text-[#111411]">
                  {formatCurrency(cart.subtotalUsd, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Bonded Air Cargo Delivery:</span>
                <span className="font-mono font-bold text-[#111411]">
                  {cart.shippingUsd === 0 ? (
                    <span className="text-[#2F5D3A]">FREE (Order &ge; $100)</span>
                  ) : (
                    formatCurrency(cart.shippingUsd, currency)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Clinical Pharmacist Review:</span>
                <span className="font-medium text-[#2F5D3A]">Included ($0.00)</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Customs Duties (Section 321):</span>
                <span className="font-medium text-[#111411]">Duty-Free ($0.00)</span>
              </div>

              {cart.usAverageCashTotalUsd > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 text-xs">
                  <span className="text-neutral-400">Estimated U.S. Cash Retail Price:</span>
                  <span className="line-through text-neutral-400">
                    {formatCurrency(cart.usAverageCashTotalUsd, currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Total Landed Cost */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-[#59605A] block">
                  Total Landed Price
                </span>
                <div className="text-2xl sm:text-3xl font-bold font-mono text-[#111411]">
                  {formatCurrency(cart.totalUsd, currency)}
                </div>
              </div>

              {cart.totalSavingsUsd > 0 && (
                <div className="text-right">
                  <span className="text-xs font-semibold text-[#2F5D3A] bg-white px-2 py-0.5 rounded border border-[#2F5D3A]/20 block">
                    Direct Savings {formatCurrency(cart.totalSavingsUsd, currency)}
                  </span>
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <div>
              <button
                type="button"
                disabled={!isPurchasable}
                onClick={handleProceedToCheckout}
                className={`w-full h-13 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isPurchasable
                    ? 'bg-[#2F5D3A] text-white hover:bg-[#3F704A] cursor-pointer'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isPurchasable && (
                <p className="text-[11px] text-rose-700 text-center mt-2">
                  Please resolve the item eligibility issues above before proceeding to checkout.
                </p>
              )}
            </div>

            {/* Reassurances */}
            <div className="pt-2 text-[11px] text-[#59605A] text-center space-y-1.5">
              <div className="flex items-center justify-center gap-1.5 text-[#2F5D3A]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Customs Seizure Guarantee Covered</span>
              </div>
              <p className="text-neutral-400 text-[10px]">
                Compliant with U.S. FDA Personal Importation Framework (CPG Sec. 110.300)
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
