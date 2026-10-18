'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  onProceedCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedCheckout }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    minOrderValue,
    totalAmount,
    totalSavings,
    pincode,
    isDeliverable
  } = useCart();

  if (!isOpen) return null;

  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  const minOrderRemaining = Math.max(0, minOrderValue - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-900 text-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-300" />
              <div>
                <h2 className="text-base font-bold">Your Fresh Basket</h2>
                <p className="text-[11px] text-emerald-200">Delivering to Bangalore {pincode}</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Delivery Bar */}
          {items.length > 0 && (
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {freeDeliveryRemaining > 0
                      ? `Add ₹${freeDeliveryRemaining} more for FREE Delivery`
                      : '🎉 You unlocked FREE Delivery!'}
                  </span>
                </div>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Add fresh vegetables, fruits, dairy, or staples to get started.
                </p>
                <button
                  onClick={closeCart}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => {
                const lineTotal = item.variation.price * item.quantity;
                return (
                  <div
                    key={item.variation.variantSku}
                    className="flex items-center space-x-3 p-3 bg-gray-50/70 border border-gray-100 rounded-2xl hover:border-emerald-200 transition-colors"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-xl bg-white shadow-xs"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs truncate">
                        {item.product.name}
                      </h4>
                      {/* Exact variation display */}
                      <p className="text-[11px] font-semibold text-emerald-800">
                        {item.variation.label} × {item.quantity}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ₹{item.variation.price} each = <strong className="text-gray-900 font-bold">₹{lineTotal}</strong>
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-lg p-0.5 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.variation.variantSku, -1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded"
                        aria-label="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variation.variantSku, 1)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-emerald-700 hover:bg-gray-100 rounded"
                        aria-label="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.variation.variantSku)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout button */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
              {/* Bill Details */}
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-bold text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bangalore Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <strong className="text-emerald-700 uppercase font-black text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">
                        FREE
                      </strong>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                    <span>Total MRP Savings</span>
                    <span>-₹{totalSavings}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                  <span>To Pay</span>
                  <span className="text-base text-emerald-800">₹{totalAmount}</span>
                </div>
              </div>

              {/* Minimum order check */}
              {minOrderRemaining > 0 && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-[11px] text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Add ₹{minOrderRemaining} more to reach minimum order value of ₹{minOrderValue}.</span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                disabled={minOrderRemaining > 0 || !isDeliverable}
                onClick={() => {
                  closeCart();
                  if (onProceedCheckout) {
                    onProceedCheckout();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-between transition-all ${
                  minOrderRemaining > 0 || !isDeliverable
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/30'
                }`}
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center space-x-1">
                  <span>₹{totalAmount}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
