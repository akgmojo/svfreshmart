'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  FileSpreadsheet, 
  MapPin, 
  ArrowLeft, 
  LogOut, 
  UserCheck, 
  Loader2 
} from 'lucide-react';
import { AdminRole } from '@/types';

interface SafeAdmin {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<SafeAdmin | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsChecking(false);
      return;
    }

    const checkAdminAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/me');
        const data = await res.json();

        if (res.ok && data.success && data.admin) {
          setAdmin(data.admin);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAuth();
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/me', { method: 'POST' });
      localStorage.removeItem('svf_admin_session');
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const allNavItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard, roles: ['Super Admin', 'Store Manager', 'Inventory Manager', 'Order Manager', 'Support'] },
    { label: 'Orders', href: '/admin/orders', icon: Package, roles: ['Super Admin', 'Store Manager', 'Order Manager', 'Support'] },
    { label: 'Products & Variations', href: '/admin/products', icon: ShoppingBag, roles: ['Super Admin', 'Store Manager', 'Inventory Manager', 'Order Manager', 'Support'] },
    { label: 'Excel Price & Stock', href: '/admin/excel', icon: FileSpreadsheet, roles: ['Super Admin', 'Store Manager', 'Inventory Manager'] },
    { label: 'Bangalore Zones', href: '/admin/zones', icon: MapPin, roles: ['Super Admin', 'Store Manager'] },
  ];

  const userRole = admin?.role || 'Support';
  const visibleNavItems = allNavItems.filter(item => 
    userRole === 'Super Admin' || item.roles.includes(userRole)
  );

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
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          {/* Current Admin Badge */}
          {admin && (
            <div className="m-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-2 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-bold text-white truncate">{admin.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  {admin.role}
                </span>
                <span className="text-[10px] text-slate-400">@{admin.username}</span>
              </div>
            </div>
          )}

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            {visibleNavItems.map(item => {
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <Link
            href="/"
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Storefront</span>
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
