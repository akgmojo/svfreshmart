'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { Package, MapPin, User, LogOut, ChevronRight, Clock, CheckCircle2, ArrowLeft, Truck } from 'lucide-react';

export default function AccountPage() {
  const { customer, logout, openAuthModal } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');

  useEffect(() => {
    if (customer) {
      fetchCustomerOrders();
    } else {
      setIsLoading(false);
    }
  }, [customer]);

  const fetchCustomerOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${customer?.phoneNumber}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      case 'Confirmed':
      case 'Processing':
      case 'Packed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center shadow-xl border border-gray-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">Customer Account</h2>
            <p className="text-xs text-gray-500 mb-6">
              Sign in with your registered mobile OTP to access your Bangalore delivery addresses and order history.
            </p>
            <button
              onClick={openAuthModal}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30"
            >
              Sign In with Mobile OTP
            </button>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-emerald-700 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-900">My Account</span>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white font-black text-xl flex items-center justify-center shadow-md">
              {customer.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-snug">
                {customer.name || 'SV Freshmart Customer'}
              </h1>
              <p className="text-xs text-gray-500">+91 {customer.phoneNumber}</p>
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Mobile Customer
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-4 py-2 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 text-xs font-black border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-3 px-4 text-xs font-black border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'addresses'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({customer.addresses.length})</span>
          </button>
        </div>

        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 text-sm mb-1">No orders yet</h3>
                <p className="text-xs text-gray-500 mb-4">
                  You haven&apos;t placed any grocery orders yet.
                </p>
                <Link
                  href="/"
                  className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow"
                >
                  Explore Farm Fresh Catalogue
                </Link>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4 hover:border-emerald-200 transition-all"
                >
                  {/* Order header row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 text-xs">
                    <div>
                      <span className="font-black text-gray-900 text-sm">{order.orderNumber}</span>
                      <span className="text-gray-400 ml-2">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="font-black text-emerald-900 text-sm">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-50 text-xs">
                    {order.items.map(item => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded-xl bg-gray-50"
                          />
                          <div>
                            <div className="font-bold text-gray-900">{item.productName}</div>
                            <div className="text-[11px] text-gray-500">
                              {item.unitLabel} × {item.quantity} units @ ₹{item.unitPrice} each
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery address info */}
                  <div className="bg-gray-50 rounded-2xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>
                        Delivering to: <strong>{order.deliveryAddress.addressLine1}</strong>, Bangalore ({order.deliveryAddress.pincode})
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      Payment: {order.paymentMethod} ({order.paymentStatus})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customer.addresses.length === 0 ? (
              <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm text-xs text-gray-500">
                No delivery addresses saved. Addresses will be automatically saved when placing your first order.
              </div>
            ) : (
              customer.addresses.map(addr => (
                <div
                  key={addr.id}
                  className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative space-y-2 text-xs"
                >
                  {addr.isDefault && (
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">
                      Default Delivery Address
                    </span>
                  )}
                  <h4 className="font-black text-gray-900 text-sm">{addr.fullName}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                    {addr.landmark && `, Near ${addr.landmark}`}
                    <br />
                    Bangalore, Karnataka - <strong>{addr.pincode}</strong>
                  </p>
                  <p className="text-gray-500 font-semibold pt-1">Phone: +91 {addr.phoneNumber}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <CartDrawer onProceedCheckout={() => {}} />
      <AuthModal />
    </div>
  );
}
