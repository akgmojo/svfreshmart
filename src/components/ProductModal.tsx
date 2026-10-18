'use client';

import React, { useState } from 'react';
import { Product, ProductVariation } from '@/types';
import { useCart } from '@/context/CartContext';
import { X, CheckCircle2, ShieldCheck, Truck, Plus, Minus } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { items, addItem, updateQuantity } = useCart();

  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product?.variations.find(v => v.isActive) || product?.variations[0] || null
  );

  if (!product || !selectedVariation) return null;

  const cartItem = items.find(i => i.variation.variantSku === selectedVariation.variantSku);
  const currentQuantityInCart = cartItem?.quantity || 0;
  const isOutOfStock = selectedVariation.stock <= 0;
  const discount = Math.round(((selectedVariation.mrp - selectedVariation.price) / selectedVariation.mrp) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 flex items-center justify-center p-6 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 md:h-full object-cover rounded-2xl shadow-sm"
          />
          {discount > 0 && (
            <div className="absolute top-8 left-8 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-full shadow">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              {product.category}
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">
              {product.name}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Quality & Delivery Highlights */}
            <div className="bg-emerald-50/60 rounded-xl p-3 mb-4 space-y-1.5 text-xs text-emerald-900">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Quality Checked before morning dispatch</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Same day delivery across Bangalore city</span>
              </div>
            </div>

            {/* Select Variation Pills */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-800 block mb-2">
                Choose Pack / Weight Size:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.variations.map(v => {
                  const isSelected = v.variantSku === selectedVariation.variantSku;
                  const isVarOut = v.stock <= 0;
                  return (
                    <button
                      key={v.variantSku}
                      type="button"
                      disabled={isVarOut}
                      onClick={() => setSelectedVariation(v)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/30'
                          : isVarOut
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                          : 'border-gray-200 hover:border-emerald-300 bg-white'
                      }`}
                    >
                      <div className="font-bold text-xs text-gray-900 flex justify-between items-center">
                        <span>{v.label}</span>
                        <span>₹{v.price}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 flex justify-between items-center mt-0.5">
                        <span className="line-through">₹{v.mrp}</span>
                        <span className={v.stock <= 10 && v.stock > 0 ? 'text-amber-600 font-semibold' : ''}>
                          {isVarOut ? 'Out of stock' : v.stock <= 10 ? `Only ${v.stock} left` : 'In stock'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-gray-900">₹{selectedVariation.price}</span>
                {selectedVariation.mrp > selectedVariation.price && (
                  <span className="text-sm text-gray-400 line-through">₹{selectedVariation.mrp}</span>
                )}
              </div>
              <span className="text-[11px] text-gray-500">Unit: {selectedVariation.label}</span>
            </div>

            <div>
              {isOutOfStock ? (
                <button
                  disabled
                  className="px-4 py-2.5 bg-gray-200 text-gray-400 rounded-xl font-bold text-xs cursor-not-allowed"
                >
                  Out of Stock
                </button>
              ) : currentQuantityInCart > 0 ? (
                <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-600 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(selectedVariation.variantSku, -1)}
                    className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-black text-sm text-emerald-950">
                    {currentQuantityInCart}
                  </span>
                  <button
                    onClick={() => updateQuantity(selectedVariation.variantSku, 1)}
                    className="w-8 h-8 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addItem(product, selectedVariation, 1)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
