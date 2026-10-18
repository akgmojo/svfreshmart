'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Order, DeliveryAddress } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { 
  Package, 
  MapPin, 
  User, 
  LogOut, 
  ChevronRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

export default function AccountPage() {
  const { customer, token, logout, openAuthModal, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');

  // New Address Modal state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPin, setNewPin] = useState('560102');
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    if (customer && token) {
      fetchCustomerOrders();
    } else {
      setIsLoading(false);
    }
  }, [customer, token]);

  const fetchCustomerOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!newLine1 || !newPin || !newPhone) {
      setAddressError('Please fill in Address, Phone, and Pincode.');
      return;
    }

    if (!/^560\d{3}$/.test(newPin.trim())) {
      setAddressError('SV Freshmart delivers only to Bangalore pincodes (560xxx).');
      return;
    }

    setIsSavingAddress(true);
    try {
      const newAddr: Omit<DeliveryAddress, 'id' | 'customerId'> = {
        fullName: newFullName || customer?.name || 'Customer',
        phoneNumber: newPhone,
        addressLine1: newLine1,
        addressLine2: newLine2,
        landmark: newLandmark,
        city: 'Bangalore',
        pincode: newPin.trim(),
        isDefault: (customer?.addresses.length || 0) === 0
      };

      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ address: newAddr })
      });

      const data = await res.json();
      if (data.success) {
        await refreshProfile();
        setIsAddAddressOpen(false);
        setNewLine1('');
        setNewLine2('');
        setNewLandmark('');
      } else {
        setAddressError(data.error || 'Failed to save address.');
      }
    } catch {
      setAddressError('Network error while saving address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'delete', addressId })
      });
      const data = await res.json();
      if (data.success) {
        await refreshProfile();
      }
    } catch (e) {
      console.error('Failed to delete address', e);
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
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Bangalore Mobile Customer</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-4 py-2 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Account Tabs */}
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
            <span>Saved Addresses ({customer.addresses?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: Orders List */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400 text-xs flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Loading your orders securely...</span>
              </div>
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

                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="font-black text-emerald-900 text-sm">
                        ₹{order.totalAmount}
                      </span>
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Snapshot */}
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
                        <div className="font-bold text-gray-900">
                          ₹{item.subtotal}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>Delivering to: {order.deliveryAddress.addressLine1}, {order.deliveryAddress.pincode}</span>
                    </div>
                    <div>
                      Payment: <strong className="text-gray-700">{order.paymentStatus}</strong> ({order.paymentMethod})
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Bangalore Delivery Addresses
              </h2>
              <button
                onClick={() => {
                  setNewFullName(customer.name || '');
                  setNewPhone(customer.phoneNumber);
                  setIsAddAddressOpen(true);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {(!customer.addresses || customer.addresses.length === 0) ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No saved addresses found. Add an address for express Bangalore checkout.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customer.addresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-3xl p-5 border shadow-sm relative flex flex-col justify-between ${
                      addr.isDefault ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-gray-900">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                        {addr.landmark && ` (Near ${addr.landmark})`}
                      </p>
                      <p className="text-xs font-semibold text-emerald-800 mt-1">
                        Bangalore — {addr.pincode}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">Phone: {addr.phoneNumber}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Add Address Modal */}
      {isAddAddressOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-black text-gray-900 mb-1">Add Bangalore Delivery Address</h3>
            <p className="text-xs text-gray-500 mb-4">Express same-day delivery requires a valid 6-digit Bangalore pincode (560xxx).</p>

            {addressError && (
              <div className="p-2 mb-3 bg-red-50 text-red-700 text-xs rounded-xl font-semibold">
                {addressError}
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">House / Flat / Street (Address Line 1)</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 301, Brigade Orchards"
                  value={newLine1}
                  onChange={e => setNewLine1(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Forum Mall"
                  value={newLandmark}
                  onChange={e => setNewLandmark(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    disabled
                    value="Bangalore"
                    className="w-full px-3 py-2 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">Pincode (560xxx)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl outline-none font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddAddressOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-1/2 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md"
                >
                  {isSavingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal />
      <CartDrawer />
    </div>
  );
}
