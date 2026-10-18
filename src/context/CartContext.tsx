'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariation } from '@/types';

export interface CartItem {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  pincode: string;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrderValue: number;
  isDeliverable: boolean;
  totalAmount: number;
  totalSavings: number;
  totalItemCount: number;
  setPincode: (pin: string) => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variation: ProductVariation, quantity?: number) => void;
  updateQuantity: (variantSku: string, delta: number) => void;
  removeItem: (variantSku: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState('560034'); // Koramangala default
  const [deliveryFee, setDeliveryFee] = useState(30);
  const [freeDeliveryThreshold] = useState(399);
  const [minOrderValue] = useState(149);
  const [isDeliverable, setIsDeliverable] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('svf_cart');
      const savedPin = localStorage.getItem('svf_pincode');
      if (savedCart) setItems(JSON.parse(savedCart));
      if (savedPin) setPincode(savedPin);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('svf_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('svf_pincode', pincode);
    checkDeliveryRules(pincode);
  }, [pincode]);

  const checkDeliveryRules = async (pin: string) => {
    try {
      const res = await fetch('/api/delivery-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setIsDeliverable(data.isServiceable);
        setDeliveryFee(data.deliveryFee ?? 30);
      }
    } catch {
      // fallback
    }
  };

  const addItem = (product: Product, variation: ProductVariation, qtyToAdd = 1) => {
    setItems(prev => {
      const existingIdx = prev.findIndex(item => item.variation.variantSku === variation.variantSku);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qtyToAdd;
        // Check stock
        if (newQty > variation.stock) {
          alert(`Cannot add more than ${variation.stock} units of ${variation.label}.`);
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        if (qtyToAdd > variation.stock) {
          alert(`Only ${variation.stock} units available in stock.`);
          return prev;
        }
        return [...prev, { product, variation, quantity: qtyToAdd }];
      }
    });
    setIsOpen(true);
  };

  const updateQuantity = (variantSku: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(item => {
          if (item.variation.variantSku === variantSku) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.variation.stock) {
              alert(`Only ${item.variation.stock} units available.`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  const removeItem = (variantSku: string) => {
    setItems(prev => prev.filter(item => item.variation.variantSku !== variantSku));
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.variation.price * item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.variation.mrp * item.quantity, 0);
  const totalSavings = Math.max(0, totalMrp - subtotal);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const effectiveDeliveryFee = items.length === 0 ? 0 : (subtotal >= freeDeliveryThreshold ? 0 : deliveryFee);
  const totalAmount = subtotal + effectiveDeliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        pincode,
        subtotal,
        deliveryFee: effectiveDeliveryFee,
        freeDeliveryThreshold,
        minOrderValue,
        isDeliverable,
        totalAmount,
        totalSavings,
        totalItemCount,
        setPincode,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateQuantity,
        removeItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
