'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage('');
    const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to send OTP.');
        if (data.remainingSeconds) {
          setCooldown(data.remainingSeconds);
        }
      } else {
        setCooldown(60);
        setStep('otp');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMessage('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber.replace(/\D/g, '').slice(-10),
          otp: otp.trim(),
          name: fullName.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.message || 'OTP verification failed.');
      } else {
        login(data.customer, data.token);
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setPhoneNumber('9876543210');
    setFullName('Ramesh Gowda');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2 shadow-sm">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-gray-900">
            {step === 'phone' ? 'Login or Sign Up' : 'Verify Mobile OTP'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {step === 'phone'
              ? 'Enter your phone number for instant OTP access'
              : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
          </p>
        </div>

        {errorMessage && (
          <div className="p-2.5 mb-4 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded-xl text-center">
            {errorMessage}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Full Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Gowda"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Mobile Number</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="bg-gray-100 px-3 py-2.5 text-xs font-bold text-gray-600 flex items-center">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-bold text-gray-900 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || cooldown > 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-gray-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{isLoading ? 'Sending OTP...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Get OTP'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Quick Demo Fill button for instant testing */}
            <div className="pt-2 text-center border-t border-gray-100">
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
              >
                Use Demo Bangalore Customer (9876543210)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {phoneNumber.replace(/\D/g, '').slice(-10) === '9876543210' && (
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center text-xs text-emerald-900">
                <span>Demo Account Test OTP: </span>
                <strong className="text-sm font-black text-emerald-700 tracking-wider font-mono">123456</strong>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  className="block mx-auto mt-1 text-[10px] text-emerald-800 font-bold underline"
                >
                  Auto-fill 123456
                </button>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-center text-lg font-black tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:bg-gray-400 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-gray-500 hover:text-gray-800"
              >
                Change Number
              </button>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => handleSendOtp()}
                className={`font-bold ${cooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-emerald-700 hover:underline'}`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center space-x-1.5 text-[10px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>SV Freshmart Bangalore — Secure 256-bit Auth</span>
        </div>
      </div>
    </div>
  );
};
