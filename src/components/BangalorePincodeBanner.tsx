'use client';

import React from 'react';
import { Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const BangalorePincodeBanner: React.FC = () => {
  const { pincode, isDeliverable, subtotal, freeDeliveryThreshold, minOrderValue } = useCart();

  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const remainingForMin = Math.max(0, minOrderValue - subtotal);

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-y border-emerald-100 py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-emerald-900 font-medium">
          <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            {isDeliverable ? (
              <>
                Delivering to Bangalore <strong>{pincode}</strong>: <span className="text-emerald-700 font-semibold">Morning & Evening Slots Available</span>
              </>
            ) : (
              <span className="text-red-600 font-semibold">
                Delivery currently unavailable for {pincode}. Please enter a 560xxx Bangalore pincode.
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-4 text-gray-600">
          {subtotal > 0 && remainingForFree > 0 ? (
            <div className="flex items-center space-x-1 text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add ₹{remainingForFree} more for <strong>FREE Delivery</strong></span>
            </div>
          ) : subtotal >= freeDeliveryThreshold ? (
            <div className="flex items-center space-x-1 text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-full text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>🎉 You unlocked <strong>FREE Delivery!</strong></span>
            </div>
          ) : (
            <span className="text-gray-500 hidden sm:inline">
              Free delivery on orders over ₹{freeDeliveryThreshold} (Min order ₹{minOrderValue})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
