'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { CartDrawer } from '@/components/CartDrawer';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  ShieldAlert,
  Loader2
} from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { customer, token, isLoading: isAuthLoading, openAuthModal } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isAuthLoading) return;

    if (!customer) {
      setIsLoading(false);
      setErrorStatus(401);
      return;
    }

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setErrorStatus(res.status);
          setErrorMessage(data.error || 'You do not have permission to view this order.');
        } else {
          setOrder(data.order);
        }
      } catch {
        setErrorStatus(500);
        setErrorMessage('Failed to connect to SV Freshmart servers.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, customer, token, isAuthLoading]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href="/account" className="hover:text-emerald-700 flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Account</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-900">Order Details</span>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Verifying customer order authorization...</p>
          </div>
        ) : errorStatus ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-red-100">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-base font-black text-gray-900 mb-1">
              {errorStatus === 401 ? 'Sign In Required' : 'Order Not Accessible'}
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
              {errorStatus === 401
                ? 'Please log in with your registered mobile OTP to access this order.'
                : errorMessage || 'This order does not exist or belongs to another registered customer account.'}
            </p>
            {errorStatus === 401 ? (
              <button
                onClick={openAuthModal}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Sign In with Mobile OTP
              </button>
            ) : (
              <Link
                href="/account"
                className="inline-block px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md"
              >
                Back to My Orders
              </Link>
            )}
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">SV Freshmart Order</span>
                <h1 className="text-xl font-black text-gray-900">{order.orderNumber}</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-1 ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
                <div className="text-xs text-gray-500">
                  Payment: <strong className="text-gray-900">{order.paymentStatus}</strong> ({order.paymentMethod})
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-sm font-black text-gray-900 mb-4 flex items-center space-x-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Ordered Items ({order.items.length})</span>
              </h2>

              <div className="divide-y divide-gray-100">
                {order.items.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100"
                      />
                      <div>
                        <div className="font-bold text-xs text-gray-900">{item.productName}</div>
                        <div className="text-[11px] text-gray-500">
                          Variation: <span className="font-semibold text-gray-700">{item.unitLabel}</span> | SKU: {item.variantSku}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          ₹{item.unitPrice} × {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-black text-xs text-gray-900">
                      ₹{item.subtotal}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bangalore Delivery Charge</span>
                  <span className="font-semibold text-emerald-700">
                    {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-black text-gray-900">
                  <span>Total Amount Paid</span>
                  <span className="text-emerald-700">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address & Notes Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivery Address</span>
                </h3>
                <div className="text-xs text-gray-700 space-y-0.5">
                  <p className="font-bold text-gray-900">{order.deliveryAddress.fullName}</p>
                  <p>{order.deliveryAddress.phoneNumber}</p>
                  <p>{order.deliveryAddress.addressLine1}</p>
                  {order.deliveryAddress.addressLine2 && <p>{order.deliveryAddress.addressLine2}</p>}
                  {order.deliveryAddress.landmark && <p className="text-gray-500">Landmark: {order.deliveryAddress.landmark}</p>}
                  <p className="font-semibold text-emerald-800">
                    {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment & Tracking</span>
                </h3>
                <div className="text-xs text-gray-700 space-y-1">
                  <p>Method: <strong className="text-gray-900">{order.paymentMethod}</strong></p>
                  <p>Payment Status: <span className="font-bold text-emerald-700">{order.paymentStatus}</span></p>
                  {order.razorpayPaymentId && (
                    <p className="text-[11px] text-gray-500 font-mono">
                      Ref: {order.razorpayPaymentId}
                    </p>
                  )}
                  {order.deliveryNotes && (
                    <div className="mt-2 p-2 bg-amber-50 rounded-lg text-[11px] text-amber-900">
                      <strong>Delivery instructions:</strong> {order.deliveryNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <AuthModal />
      <CartDrawer />
    </div>
  );
}
