'use client';

import React, { useState } from 'react';
import { Product, ProductVariation } from '@/types';
import { useCart } from '@/context/CartContext';
import { Plus, Minus, Check, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { items, addItem, updateQuantity } = useCart();
  
  // Default to the first active variation
  const activeVariations = product.variations.filter(v => v.isActive);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation>(
    activeVariations[0] || product.variations[0]
  );

  // Check if this specific variation is currently in the cart
  const cartItem = items.find(i => i.variation.variantSku === selectedVariation?.variantSku);
  const currentQuantityInCart = cartItem?.quantity || 0;

  if (!selectedVariation) return null;

  const isOutOfStock = selectedVariation.stock <= 0;
  const isLowStock = selectedVariation.stock > 0 && selectedVariation.stock <= 10;
  const discountPercent = Math.round(((selectedVariation.mrp - selectedVariation.price) / selectedVariation.mrp) * 100);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Product Image & Badges */}
      <div 
        className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer"
        onClick={() => onOpenDetails?.(product)}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {discountPercent}% OFF
          </div>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute bottom-2 left-2 right-2 bg-red-600/90 backdrop-blur-sm text-white text-[11px] font-bold py-1 text-center rounded-lg">
            Sold Out
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Only {selectedVariation.stock} left</span>
          </div>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            {product.category}
          </div>
          <h3 
            onClick={() => onOpenDetails?.(product)}
            className="font-bold text-gray-900 text-sm hover:text-emerald-700 cursor-pointer line-clamp-2 leading-snug mb-2"
          >
            {product.name}
          </h3>

          {/* Variation Selector (Dropdown) */}
          <div className="mb-3">
            <label className="text-[10px] text-gray-500 font-medium block mb-1">Select Unit / Weight:</label>
            <select
              value={selectedVariation.variantSku}
              onChange={e => {
                const found = product.variations.find(v => v.variantSku === e.target.value);
                if (found) setSelectedVariation(found);
              }}
              className="w-full text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {product.variations.map(v => (
                <option key={v.variantSku} value={v.variantSku} disabled={!v.isActive || v.stock <= 0}>
                  {v.label} — ₹{v.price} {v.stock <= 0 ? '(Out of Stock)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base font-black text-gray-900">₹{selectedVariation.price}</span>
              {selectedVariation.mrp > selectedVariation.price && (
                <span className="text-xs text-gray-400 line-through">₹{selectedVariation.mrp}</span>
              )}
            </div>
            <span className="text-[10px] text-gray-500 block">per {selectedVariation.label}</span>
          </div>

          {/* Add to Cart / Quantity Selector */}
          <div>
            {isOutOfStock ? (
              <button
                disabled
                className="px-3 py-1.5 bg-gray-100 text-gray-400 font-semibold text-xs rounded-xl cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : currentQuantityInCart > 0 ? (
              <div className="flex items-center space-x-1 bg-emerald-50 border border-emerald-600 rounded-xl p-0.5">
                <button
                  onClick={() => updateQuantity(selectedVariation.variantSku, -1)}
                  className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors font-bold text-sm"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-xs text-emerald-950">
                  {currentQuantityInCart}
                </span>
                <button
                  onClick={() => updateQuantity(selectedVariation.variantSku, 1)}
                  className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors font-bold text-sm"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addItem(product, selectedVariation, 1)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
