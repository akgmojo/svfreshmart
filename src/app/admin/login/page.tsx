'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage('');
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
      } else {
        localStorage.setItem('svf_admin_session', JSON.stringify(data.admin));
        router.push('/admin');
      }
    } catch {
      setErrorMessage('Network error during admin login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">SV Freshmart Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Bangalore Operations & Management Portal</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. admin or store_mgr"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Role Fill Presets for QA and Verification */}
        <div className="mt-8 pt-5 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Role-Based Demo Access
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin@SVFresh2026!')}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-left border border-slate-700 transition-colors"
            >
              <strong className="block text-emerald-400">Super Admin</strong>
              <span>admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('store_mgr', 'manager@SVFresh2026!')}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-left border border-slate-700 transition-colors"
            >
              <strong className="block text-emerald-400">Store Manager</strong>
              <span>store_mgr</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('inventory_mgr', 'inventory@SVFresh2026!')}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-left border border-slate-700 transition-colors"
            >
              <strong className="block text-emerald-400">Inventory Mgr</strong>
              <span>inventory_mgr</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('order_mgr', 'order@SVFresh2026!')}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-left border border-slate-700 transition-colors"
            >
              <strong className="block text-emerald-400">Order Mgr</strong>
              <span>order_mgr</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
