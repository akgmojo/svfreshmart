'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, IndianRupee, Clock, AlertTriangle, XCircle, ArrowUpRight, History } from 'lucide-react';
import { Order, AuditLog } from '@/types';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalSales: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setAuditLogs(data.auditLogs);
        setInventoryAlerts(data.inventoryAlerts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <div className="text-sm text-gray-500">Loading SV Freshmart admin dashboard...</div>;
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Low Stock Items', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Out of Stock Items', value: stats.outOfStockCount, icon: XCircle, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Bangalore Store Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time inventory, sales, and order management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/excel"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            Manage Excel Price & Stock
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-gray-900 tracking-tight">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Split: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-black text-gray-900">Recent Customer Orders</h2>
              <p className="text-[11px] text-gray-500">Live order flow and delivery dispatch</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">No customer orders placed yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {recentOrders.map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-900 flex items-center space-x-2">
                      <span>{order.orderNumber}</span>
                      <span className="text-[10px] text-gray-400">
                        ({order.deliveryAddress.pincode})
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {order.customerName} (+91 {order.customerPhone}) • {order.items.length} items
                    </div>
                  </div>

                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <div className="font-black text-gray-900">₹{order.totalAmount}</div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock & Out of Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-gray-900">Critical Stock Alerts</h2>
            <Link href="/admin/excel" className="text-xs font-bold text-emerald-600 hover:underline">
              Fix via Excel
            </Link>
          </div>

          {inventoryAlerts.length === 0 ? (
            <div className="text-center py-8 text-xs text-emerald-700 bg-emerald-50 rounded-xl font-medium">
              ✅ All variations have healthy inventory levels!
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {inventoryAlerts.map(alert => (
                <div
                  key={alert.variantSku}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    alert.stock === 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div>
                    <div className="font-bold">{alert.productName}</div>
                    <div className="text-[10px] font-mono opacity-80">{alert.variantSku} ({alert.label})</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${alert.stock === 0 ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'}`}>
                    {alert.stock === 0 ? '0 Left' : `${alert.stock} units`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <History className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-black text-gray-900">System Audit Logs</h2>
        </div>
        <div className="divide-y divide-gray-100 text-xs text-gray-600">
          {auditLogs.map(log => (
            <div key={log.id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 mr-2">[{log.action}]</span>
                <span>{log.details}</span>
              </div>
              <div className="text-[10px] text-gray-400 whitespace-nowrap ml-4">
                {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {log.actor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
