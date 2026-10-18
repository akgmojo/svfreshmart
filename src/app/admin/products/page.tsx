'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariation, VariationUnit } from '@/types';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Search, CheckCircle2 } from 'lucide-react';

const UNIT_OPTIONS: VariationUnit[] = ['g', 'kg', 'piece', 'pieces', 'ml', 'L', 'Pack', 'Box', 'Bundle'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [productSku, setProductSku] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setProductSku(`SVF-${Date.now().toString().slice(-4)}`);
    setCategory('Vegetables');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80');
    setIsActive(true);
    setVariations([
      {
        id: `var-${Date.now()}-1`,
        productId: '',
        variantSku: `SVF-SKU-${Math.floor(100 + Math.random() * 900)}`,
        quantity: 500,
        unit: 'g',
        label: '500g',
        price: 30,
        mrp: 40,
        stock: 50,
        isActive: true
      }
    ]);
    setIsModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setProductSku(prod.productSku);
    setCategory(prod.category);
    setDescription(prod.description);
    setImageUrl(prod.imageUrl);
    setIsActive(prod.isActive);
    setVariations(prod.variations);
    setIsModalOpen(true);
  };

  const handleAddVariation = () => {
    setVariations(prev => [
      ...prev,
      {
        id: `var-${Date.now()}-${prev.length + 1}`,
        productId: editingProduct?.id || '',
        variantSku: `${productSku || 'SVF'}-${prev.length + 1}`,
        quantity: 1,
        unit: 'kg',
        label: '1kg',
        price: 50,
        mrp: 65,
        stock: 100,
        isActive: true
      }
    ]);
  };

  const handleRemoveVariation = (idx: number) => {
    setVariations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editingProduct?.id,
      name,
      productSku,
      category,
      description,
      imageUrl,
      isActive,
      variations
    };

    const method = editingProduct ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.productSku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products & Variations</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage catalogue items, unit weights, pricing, and active statuses.
          </p>
        </div>
        <button
          onClick={openNewProductModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products by title, category, or product SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-gray-50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
            <tr>
              <th className="py-3 px-4">Product</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Variations Count</th>
              <th className="py-3 px-4">Price Range</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(prod => {
              const minPrice = Math.min(...prod.variations.map(v => v.price));
              const maxPrice = Math.max(...prod.variations.map(v => v.price));
              return (
                <tr key={prod.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={prod.imageUrl} alt={prod.name} className="w-10 h-10 object-cover rounded-xl bg-gray-50" />
                      <div>
                        <div className="font-bold text-gray-900">{prod.name}</div>
                        <div className="text-[10px] font-mono text-gray-400">{prod.productSku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-600">{prod.category}</td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-bold text-gray-800">
                      {prod.variations.length} sizes
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    ₹{minPrice} - ₹{maxPrice}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {prod.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEditProductModal(prod)}
                      className="p-1.5 hover:bg-gray-100 text-emerald-700 rounded-lg transition-colors"
                      title="Edit Product & Variations"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-gray-900 mb-4">
              {editingProduct ? `Edit ${editingProduct.name}` : 'Create New Product'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Product SKU</label>
                  <input
                    type="text"
                    required
                    value={productSku}
                    onChange={e => setProductSku(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Leafy Greens">Leafy Greens</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Staples">Staples</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Variations Sub-Editor */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-gray-900 uppercase tracking-wider text-[11px]">
                    Product Variations ({variations.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVariation}
                    className="text-emerald-700 font-bold hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Size / Weight</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {variations.map((v, idx) => (
                    <div key={v.id || idx} className="grid grid-cols-6 gap-2 p-2 bg-gray-50 rounded-xl items-center">
                      <input
                        type="text"
                        placeholder="SKU"
                        value={v.variantSku}
                        onChange={e => {
                          const val = e.target.value;
                          setVariations(prev => prev.map((item, i) => i === idx ? { ...item, variantSku: val } : item));
                        }}
                        className="px-2 py-1.5 border rounded-lg text-[11px] font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Label (e.g. 250g)"
                        value={v.label}
                        onChange={e => {
                          const val = e.target.value;
                          setVariations(prev => prev.map((item, i) => i === idx ? { ...item, label: val } : item));
                        }}
                        className="px-2 py-1.5 border rounded-lg text-[11px] font-bold"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        value={v.price}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setVariations(prev => prev.map((item, i) => i === idx ? { ...item, price: val } : item));
                        }}
                        className="px-2 py-1.5 border rounded-lg text-[11px]"
                      />
                      <input
                        type="number"
                        placeholder="MRP"
                        value={v.mrp}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setVariations(prev => prev.map((item, i) => i === idx ? { ...item, mrp: val } : item));
                        }}
                        className="px-2 py-1.5 border rounded-lg text-[11px]"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={v.stock}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setVariations(prev => prev.map((item, i) => i === idx ? { ...item, stock: val } : item));
                        }}
                        className="px-2 py-1.5 border rounded-lg text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(idx)}
                        className="text-red-500 hover:text-red-700 p-1 justify-self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
