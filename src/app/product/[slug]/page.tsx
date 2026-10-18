'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Product, ProductVariation } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { useCart } from '@/context/CartContext';
import { 
  ArrowLeft, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Check, 
  Plus, 
  Minus, 
  ShoppingBag, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { items, addItem, updateQuantity } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          const activeVars = data.product.variations.filter((v: ProductVariation) => v.isActive);
          const firstInStock = activeVars.find((v: ProductVariation) => v.stock > 0) || activeVars[0] || data.product.variations[0];
          setSelectedVariation(firstInStock);
        } else {
          // If not found in API filter, try fetching all
          const allRes = await fetch('/api/products');
          const allData = await allRes.json();
          if (allData.success) {
            const found = allData.products.find((p: Product) => p.slug === slug || p.slug === slug.toLowerCase());
            if (found) {
              setProduct(found);
              const activeVars = found.variations.filter((v: ProductVariation) => v.isActive);
              const firstInStock = activeVars.find((v: ProductVariation) => v.stock > 0) || activeVars[0] || found.variations[0];
              setSelectedVariation(firstInStock);
            }
          }
        }
      } catch (e) {
        console.error('Failed loading product', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-pulse text-xs text-gray-500 font-bold">Loading product details...</div>
        </div>
      </div>
    );
  }

  if (!product || !selectedVariation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-sm border border-gray-100">
            <h2 className="text-base font-black text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-xs text-gray-500 mb-5">
              The requested grocery item may have been moved or removed from our Bangalore catalogue.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = selectedVariation.stock <= 0;
  const isLowStock = selectedVariation.stock > 0 && selectedVariation.stock <= 10;
  const discountPercent = Math.round(((selectedVariation.mrp - selectedVariation.price) / selectedVariation.mrp) * 100);

  // Cart item state for selected variation
  const existingCartItem = items.find(i => i.variation.variantSku === selectedVariation.variantSku);
  const cartQty = existingCartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, selectedVariation, quantity);
  };

  // Structured JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    sku: product.productSku,
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: selectedVariation.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `https://svfreshmart.com/product/${product.slug}`
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span>/</span>
          <Link href={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="hover:text-emerald-700 font-medium">
            {product.category}
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-900 truncate">{product.name}</span>
        </div>

        {/* Product Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Image Column */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white font-black text-sm px-4 py-2 rounded-xl shadow-lg">
                  OUT OF STOCK
                </span>
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  SKU: {selectedVariation.variantSku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                {product.description || 'Farm-fresh groceries harvested daily and delivered directly to your home in Bangalore.'}
              </p>

              {/* Price & MRP Block */}
              <div className="mt-5 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 flex items-baseline space-x-3">
                <span className="text-3xl font-black text-emerald-900">
                  ₹{selectedVariation.price}
                </span>
                {selectedVariation.mrp > selectedVariation.price && (
                  <span className="text-sm font-semibold text-gray-400 line-through">
                    MRP ₹{selectedVariation.mrp}
                  </span>
                )}
                <span className="text-xs text-emerald-700 font-bold ml-auto">
                  Per {selectedVariation.label}
                </span>
              </div>

              {/* Variation Selector Pills */}
              <div className="mt-6">
                <label className="text-xs font-bold text-gray-700 block mb-2.5">
                  Choose Quantity / Pack Size:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variations.map(v => {
                    const isSelected = selectedVariation.id === v.id;
                    const vOutOfStock = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariation(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 ring-2 ring-emerald-300'
                            : vOutOfStock
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'
                        }`}
                      >
                        <span>{v.label}</span>
                        <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                          ₹{v.price} {vOutOfStock ? '(Sold Out)' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Status Indicator */}
              <div className="mt-4 flex items-center space-x-2 text-xs">
                {isOutOfStock ? (
                  <span className="text-red-600 font-bold flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Currently out of stock</span>
                  </span>
                ) : isLowStock ? (
                  <span className="text-amber-600 font-bold flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Hurry! Only {selectedVariation.stock} left in stock</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>In Stock — Ready for Bangalore Delivery</span>
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Quantity Selector & Add to Cart */}
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center space-x-4">
                {/* Quantity picker */}
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-xs font-black text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    disabled={quantity >= selectedVariation.stock || isOutOfStock}
                    onClick={() => setQuantity(q => Math.min(selectedVariation.stock, q + 1))}
                    className="p-2.5 text-gray-600 hover:bg-gray-200 disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? 'Sold Out' : `Add ${quantity > 1 ? `${quantity} Packs ` : ''}to Cart — ₹${selectedVariation.price * quantity}`}</span>
                </button>
              </div>

              {cartQty > 0 && (
                <p className="text-center text-[11px] font-bold text-emerald-700">
                  ✓ {cartQty} of this variation already in your cart
                </p>
              )}
            </div>

            {/* Bangalore Delivery Highlights */}
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Express Bangalore Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AuthModal />
      <CartDrawer />
    </div>
  );
}
