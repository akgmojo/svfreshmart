'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { Search, Filter, CheckCircle2, Truck, Package, Clock, XCircle, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending Payment',
  'Confirmed',
  'Processing',
  'Packed',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Refunded'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/admin/orders', window.location.origin);
      if (statusFilter !== 'All') url.searchParams.set('status', statusFilter);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString());
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

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? data.order : o));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track Bangalore fulfillment, update delivery stages, and inspect order line items.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 flex items-center space-x-1.5 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Order ID (SVF-...), customer phone, name, or pincode..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-gray-50"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs font-semibold border border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 text-xs text-gray-500">
            No orders match the selected criteria.
          </div>
        ) : (
          orders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-gray-900 text-sm">{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Placed: {new Date(order.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-gray-500 font-bold">Change Status:</span>
                  <select
                    value={order.status}
                    disabled={updatingOrderId === order.id}
                    onChange={e => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {updatingOrderId === order.id && <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Customer & Address */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Customer & Delivery</span>
                  <div className="font-bold text-gray-900">{order.customerName}</div>
                  <div className="text-gray-600">Phone: +91 {order.customerPhone}</div>
                  <div className="text-gray-600 text-[11px] pt-1">
                    {order.deliveryAddress.addressLine1}, {order.deliveryAddress.addressLine2 && `${order.deliveryAddress.addressLine2}, `}
                    Bangalore - <strong>{order.deliveryAddress.pincode}</strong>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Payment Details</span>
                  <div className="font-bold text-gray-900">{order.paymentMethod}</div>
                  <div className="text-emerald-700 font-semibold text-[11px]">Status: {order.paymentStatus}</div>
                  <div className="text-gray-500 text-[11px]">
                    Subtotal: ₹{order.subtotal} | Delivery: ₹{order.deliveryCharge}
                  </div>
                  <div className="font-black text-gray-900 text-sm pt-1">
                    Total: ₹{order.totalAmount}
                  </div>
                </div>

                {/* Items Summary */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-1 md:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Ordered Variations ({order.items.length})
                  </span>
                  <div className="space-y-1 divide-y divide-gray-100 max-h-32 overflow-y-auto">
                    {order.items.map(item => (
                      <div key={item.id} className="pt-1 flex justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-gray-800">{item.productName}</span>
                          <span className="text-gray-500 ml-1">({item.unitLabel} × {item.quantity})</span>
                        </div>
                        <span className="font-bold text-gray-900">₹{item.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
