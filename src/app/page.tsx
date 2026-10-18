'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { Navbar } from '@/components/Navbar';
import { BangalorePincodeBanner } from '@/components/BangalorePincodeBanner';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { AuthModal } from '@/components/AuthModal';
import { Sparkles, ShieldCheck, Leaf, Clock, Award, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async (cat = 'All', search = '') => {
    setIsLoading(true);
    try {
      const url = new URL('/api/products', window.location.origin);
      if (cat !== 'All') url.searchParams.set('category', cat);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        if (data.categories) setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onSearch={q => setSearchQuery(q)} />

      {/* Bangalore Delivery Info Strip */}
      <BangalorePincodeBanner />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white p-6 sm:p-10 shadow-lg shadow-emerald-900/10">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-emerald-900/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-200 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Bangalore’s Freshest Farm Mandi</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Farm Fresh Daily Groceries <br />
              <span className="text-emerald-200">Delivered Across Bangalore.</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-md">
              Order farm-fresh vegetables, organic greens, Nandini dairy, and pantry staples in exact weights with guaranteed same-day delivery.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-emerald-100">
              <div className="flex items-center space-x-1.5">
                <Leaf className="w-4 h-4 text-green-300" />
                <span>Zero Cold-Storage</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>Morning Dispatch</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span>Razorpay Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Catalogue Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-900">
              {selectedCategory === 'All' ? 'All Daily Essentials' : selectedCategory}
              <span className="text-xs font-semibold text-gray-500 ml-2">({products.length} items)</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse h-72">
                  <div className="bg-gray-200 h-40 rounded-xl mb-3" />
                  <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
                  <div className="bg-gray-200 h-4 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 text-base mb-1">No items found</h3>
              <p className="text-xs text-gray-500 mb-4">
                We couldn&apos;t find any products matching your search criteria.
              </p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={prod => setSelectedProduct(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
              SV
            </div>
            <span className="font-bold text-gray-900">SV Freshmart Bangalore</span>
            <span>— Serving Bangalore Pincodes 560001 to 560103</span>
          </div>
          <div className="flex items-center space-x-6 text-[11px] font-medium">
            <span>Customer Care: +91 98765 43210</span>
            <span>Razorpay Secure Payments</span>
            <span>100% Organic & Farm Fresh Sourced</span>
          </div>
        </div>
      </footer>

      {/* Overlays / Modals */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => setIsCheckoutOpen(false)}
      />

      <AuthModal />
    </div>
  );
}
