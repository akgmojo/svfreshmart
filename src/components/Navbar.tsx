'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, Search, User, ShieldCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onSearch?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch }) => {
  const { totalItemCount, openCart, pincode, setPincode, subtotal } = useCart();
  const { customer, openAuthModal } = useAuth();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [tempPin, setTempPin] = useState(pincode);
  const [searchInput, setSearchInput] = useState('');

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^560\d{3}$/.test(tempPin.trim())) {
      setPincode(tempPin.trim());
      setIsPinModalOpen(false);
    } else {
      alert('Please enter a valid 6-digit Bangalore pincode (560xxx)');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-emerald-100 shadow-sm">
        {/* Top Info Strip */}
        <div className="bg-emerald-800 text-white text-xs py-1.5 px-4 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Bangalore Only</span>
              <span>Farm harvested at dawn, delivered to your doorstep by noon</span>
            </div>
            <div className="flex items-center space-x-4 text-emerald-100 text-[11px]">
              <span>Customer Care: 080-4567-8900 (6AM - 9PM)</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Pincode Selector */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20">
                SV
              </div>
              <div>
                <span className="text-xl font-black text-gray-900 tracking-tight leading-none block">
                  SV Fresh<span className="text-emerald-600">mart</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                  Bangalore Daily Groceries
                </span>
              </div>
            </Link>

            {/* Bangalore Pincode selector button */}
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Deliver to: <strong>{pincode}</strong></span>
              <ChevronDown className="w-3 h-3 text-emerald-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search fresh chillies, onions, milk, sona masoori..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            </div>
          </div>

          {/* Account & Cart Actions */}
          <div className="flex items-center space-x-3">
            {customer ? (
              <Link
                href="/account"
                className="flex items-center space-x-1.5 px-3 py-2 text-gray-700 hover:text-emerald-700 font-medium text-sm rounded-lg hover:bg-gray-50"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  {customer.name?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:inline text-xs">{customer.name || customer.phoneNumber}</span>
              </Link>
            ) : (
              <button
                onClick={openAuthModal}
                className="flex items-center space-x-1.5 px-3.5 py-2 text-gray-700 hover:text-emerald-700 font-medium text-xs rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="flex items-center space-x-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalItemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold">
                {subtotal > 0 ? `₹${subtotal}` : 'Cart'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vegetables, fruits, staples..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </header>

      {/* Pincode Selector Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-emerald-600 mb-2">
              <MapPin className="w-5 h-5" />
              <h3 className="font-bold text-gray-900 text-base">Select Bangalore Delivery Area</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              SV Freshmart provides farm-fresh deliveries exclusively within Bangalore. Enter your 6-digit Bangalore pincode (560xxx).
            </p>

            <form onSubmit={handlePincodeSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560034, 560038, 560102"
                  value={tempPin}
                  onChange={e => setTempPin(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Quick Bangalore Zones Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { pin: '560034', name: 'Koramangala' },
                  { pin: '560038', name: 'Indiranagar' },
                  { pin: '560102', name: 'HSR Layout' },
                  { pin: '560041', name: 'Jayanagar' },
                  { pin: '560066', name: 'Whitefield' },
                ].map(item => (
                  <button
                    key={item.pin}
                    type="button"
                    onClick={() => setTempPin(item.pin)}
                    className={`px-2.5 py-1 rounded-md border text-left transition-colors ${
                      tempPin === item.pin ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.name} ({item.pin})
                  </button>
                ))}
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20"
                >
                  Confirm Area
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
