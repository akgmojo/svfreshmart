'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer } from '@/types';

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (customer: Customer, token: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('svf_customer_token');
    const savedCustomer = localStorage.getItem('svf_customer_data');

    if (savedToken && savedCustomer) {
      try {
        setToken(savedToken);
        setCustomer(JSON.parse(savedCustomer));
      } catch {
        localStorage.removeItem('svf_customer_token');
        localStorage.removeItem('svf_customer_data');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newCustomer: Customer, newToken: string) => {
    setCustomer(newCustomer);
    setToken(newToken);
    localStorage.setItem('svf_customer_token', newToken);
    localStorage.setItem('svf_customer_data', JSON.stringify(newCustomer));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setCustomer(null);
    setToken(null);
    localStorage.removeItem('svf_customer_token');
    localStorage.removeItem('svf_customer_data');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.customer) {
        setCustomer(data.customer);
        localStorage.setItem('svf_customer_data', JSON.stringify(data.customer));
      }
    } catch (err) {
      console.error('Failed refreshing customer profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
