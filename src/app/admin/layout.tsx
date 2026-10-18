'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, FileSpreadsheet, MapPin, Store, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: Package },
    { label: 'Products & Variations', href: '/admin/products', icon: ShoppingBag },
    { label: 'Excel Price & Stock', href: '/admin/excel', icon: FileSpreadsheet },
    { label: 'Bangalore Zones', href: '/admin/zones', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-900 text-sm">
                SV
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-tight text-white leading-tight">SV Freshmart</h1>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Admin Console V1</span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Back to Customer Storefront */}
        <div className="p-4 border-t border-slate-800">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
