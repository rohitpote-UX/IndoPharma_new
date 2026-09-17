'use client';

import React, { useState } from 'react';
import { ProductAvailabilityState } from '@/lib/domain/product';
import {
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Ban,
  Clock,
  ShoppingCart,
  Bell,
  Check,
} from 'lucide-react';

interface ProductAvailabilityProps {
  status: ProductAvailabilityState;
  requiresPrescription: boolean;
  destination?: string;
  onAddToCart?: () => void;
}

export const ProductAvailability: React.FC<ProductAvailabilityProps> = ({
  status,
  requiresPrescription,
  destination = 'United States',
  onAddToCart,
}) => {
  const [isAdded, setIsAdded] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  const handleAction = () => {
    if (status === 'OUT_OF_STOCK') {
      setIsNotified(true);
      return;
    }
    if (onAddToCart) {
      onAddToCart();
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2500);
    }
  };

  // Status visual mapping
  const renderStatusInfo = () => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <div className="flex items-start gap-3 bg-[#F3F7F3] p-3.5 rounded-xl border border-[#2F5D3A]/20">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D3A] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#111411]">
                Available for delivery to {destination}
              </div>
              <p className="text-xs text-[#59605A] mt-0.5">
                Batch released & verified. Ready for expedited temperature-controlled international dispatch.
              </p>
            </div>
          </div>
        );
      case 'LOW_STOCK':
        return (
          <div className="flex items-start gap-3 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-900">
                Limited availability for {destination}
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Low batch inventory remaining at central packaging warehouse.
              </p>
            </div>
          </div>
        );
      case 'OUT_OF_STOCK':
        return (
          <div className="flex items-start gap-3 bg-neutral-100 p-3.5 rounded-xl border border-neutral-200">
            <Clock className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-neutral-800">
                Currently unavailable
              </div>
              <p className="text-xs text-neutral-600 mt-0.5">
                Next manufacturing batch undergoing release testing. Enter your email to be notified upon restock.
              </p>
            </div>
          </div>
        );
      case 'REGULATORY_REVIEW':
        return (
          <div className="flex items-start gap-3 bg-blue-50 p-3.5 rounded-xl border border-blue-200">
            <Clock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-blue-900">
                Availability is being reviewed
              </div>
              <p className="text-xs text-blue-700 mt-0.5">
                Importation statutory compliance review underway for destination jurisdiction.
              </p>
            </div>
          </div>
        );
      case 'DESTINATION_RESTRICTED':
      case 'NOT_ELIGIBLE':
      default:
        return (
          <div className="flex items-start gap-3 bg-rose-50 p-3.5 rounded-xl border border-rose-200">
            <Ban className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-rose-900">
                Not currently available for this destination
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Cross-border regulations or carrier restrictions prohibit dispatching this product to {destination}.
              </p>
            </div>
          </div>
        );
    }
  };

  const isPurchasable = status === 'AVAILABLE' || status === 'LOW_STOCK';

  return (
    <div className="space-y-4">
      {/* Availability Banner */}
      {renderStatusInfo()}

      {/* Prescription Requirement Flag */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-[#E6ECE7] text-xs">
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#2F5D3A]" />
          <span className="text-[#59605A]">Prescription Status:</span>
        </div>
        <span
          className={`font-semibold px-2 py-0.5 rounded ${
            requiresPrescription
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
          }`}
        >
          {requiresPrescription ? 'Required from licensed physician' : 'Not required (OTC)'}
        </span>
      </div>

      {/* Dynamic Action Button */}
      <div>
        {isPurchasable ? (
          <button
            type="button"
            onClick={handleAction}
            className="w-full h-13 px-6 rounded-xl bg-[#2F5D3A] text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-[#3F704A] transition-all shadow-sm focus:ring-4 focus:ring-[#2F5D3A]/20 cursor-pointer"
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {requiresPrescription
                  ? 'Add to Cart — Prescription Required'
                  : 'Add to Cart'}
              </>
            )}
          </button>
        ) : status === 'OUT_OF_STOCK' ? (
          <button
            type="button"
            onClick={handleAction}
            disabled={isNotified}
            className={`w-full h-13 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              isNotified
                ? 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                : 'bg-neutral-800 text-white hover:bg-neutral-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            {isNotified ? 'Notification Registered' : 'Notify Me When Available'}
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full h-13 px-6 rounded-xl bg-neutral-100 text-neutral-400 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-neutral-200"
          >
            <Ban className="w-4 h-4" />
            Unavailable for Destination
          </button>
        )}

        {requiresPrescription && isPurchasable && (
          <p className="text-[11px] text-[#59605A] text-center mt-2">
            You will be prompted to securely upload or link your physician prescription before order fulfillment.
          </p>
        )}
      </div>
    </div>
  );
};
