'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { BangalorePincodeBanner } from '@/components/BangalorePincodeBanner';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const decodedCategory = decodeURIComponent(slug).toLowerCase();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          const filtered = data.products.filter(
            (p: Product) => p.category.toLowerCase() === decodedCategory
          );
          setProducts(filtered);
        }
      } catch (e) {
        console.error('Failed fetching category products', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [decodedCategory]);

  const displayCategoryTitle = products[0]?.category || 
    decodedCategory.charAt(0).toUpperCase() + decodedCategory.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 space-y-6">
        <BangalorePincodeBanner />

        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Groceries</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-900">{displayCategoryTitle}</span>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-full">
              Category
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              Fresh {displayCategoryTitle}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Locally sourced daily produce delivering across Bangalore city zones.
            </p>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {categories.filter(c => c !== 'All').map(c => {
              const isCurrent = c.toLowerCase() === decodedCategory;
              return (
                <Link
                  key={c}
                  href={`/category/${encodeURIComponent(c.toLowerCase())}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {c}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-gray-400">Loading {displayCategoryTitle}...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-gray-900 mb-1">No products in this category</h2>
            <p className="text-xs text-gray-500 mb-5">Check back soon as new seasonal items arrive daily.</p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={p => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <AuthModal />
      <CartDrawer />
    </div>
  );
}
