'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { DeliveryAddress, Order } from '@/types';
import { X, MapPin, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { items, pincode, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const { customer, openAuthModal, refreshProfile } = useAuth();

  const [step, setStep] = useState<'address' | 'payment' | 'processing' | 'confirmed'>('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  // New address form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pin, setPin] = useState(pincode);
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Cash on Delivery (Simulated)'>('Razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Auto-select first address if customer has addresses
  useEffect(() => {
    if (customer) {
      setFullName(customer.name || '');
      setPhoneNumber(customer.phoneNumber || '');
      if (customer.addresses.length > 0) {
        const defaultAddr = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
        setSelectedAddressId(defaultAddr.id);
        setPin(defaultAddr.pincode);
      }
    }
  }, [customer]);

  if (!isOpen) return null;

  if (!customer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-gray-900 mb-1">Login Required for Checkout</h3>
          <p className="text-xs text-gray-500 mb-5">
            Please log in with your mobile OTP to select your delivery address and complete checkout.
          </p>
          <button
            onClick={() => {
              onClose();
              openAuthModal();
            }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
          >
            Login with Mobile OTP
          </button>
        </div>
      </div>
    );
  }

  const handleCreateOrderAndPay = async () => {
    setErrorMessage('');
    setIsSubmitting(true);

    let finalAddress: DeliveryAddress;
    const existing = customer.addresses.find(a => a.id === selectedAddressId);

    if (existing) {
      finalAddress = existing;
    } else {
      if (!fullName || !phoneNumber || !addressLine1 || !pin) {
        setErrorMessage('Please fill out all required address fields.');
        setIsSubmitting(false);
        return;
      }
      if (!/^560\d{3}$/.test(pin.trim())) {
        setErrorMessage('Only Bangalore pincodes (560xxx) are serviceable.');
        setIsSubmitting(false);
        return;
      }
      finalAddress = {
        id: `addr-${Date.now()}`,
        customerId: customer.id,
        fullName,
        phoneNumber,
        addressLine1,
        addressLine2,
        landmark,
        city: 'Bangalore',
        pincode: pin.trim(),
        isDefault: customer.addresses.length === 0
      };

      // Save address to customer profile
      try {
        await fetch('/api/auth/me', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: customer.phoneNumber, address: finalAddress })
        });
        await refreshProfile();
      } catch (e) {
        console.error(e);
      }
    }

    try {
      // 1. Create order on server (server performs final stock & price check)
      const orderPayload = {
        customerId: customer.id,
        customerPhone: customer.phoneNumber,
        customerName: finalAddress.fullName || customer.name || 'Customer',
        items: items.map(i => ({
          variantSku: i.variation.variantSku,
          quantity: i.quantity
        })),
        deliveryAddress: finalAddress,
        paymentMethod
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        setErrorMessage(orderData.error || 'Failed to place order.');
        setIsSubmitting(false);
        return;
      }

      const createdOrder: Order = orderData.order;

      // 2. Initialize Payment Gateway (Razorpay abstraction)
      const payRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrder.id })
      });
      const payData = await payRes.json();

      if (!payData.success) {
        setErrorMessage(payData.error || 'Payment gateway initialization failed.');
        setIsSubmitting(false);
        return;
      }

      setStep('processing');

      // 3. Confirm Payment (Simulated Razorpay success webhook/verification)
      // Simulating network delay for authentic user experience
      setTimeout(async () => {
        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: createdOrder.id,
            razorpayOrderId: payData.payment.gatewayOrderId,
            razorpayPaymentId: `pay_${Date.now()}`,
            razorpaySignature: 'simulated_test_signature'
          })
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          setConfirmedOrder(verifyData.order);
          clearCart();
          setStep('confirmed');
          onOrderSuccess(verifyData.order);
        } else {
          setErrorMessage(verifyData.error || 'Payment verification failed.');
          setStep('address');
        }
        setIsSubmitting(false);
      }, 1200);

    } catch (err) {
      setErrorMessage('An unexpected error occurred during checkout.');
      setIsSubmitting(false);
      setStep('address');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
        {step !== 'confirmed' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === 'processing' ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-lg font-black text-gray-900">Securing Payment with Razorpay...</h3>
            <p className="text-xs text-gray-500">
              Verifying payment authorization and locking inventory. Please do not refresh.
            </p>
          </div>
        ) : step === 'confirmed' && confirmedOrder ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Order Confirmed!</h3>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                Order ID: {confirmedOrder.orderNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your farm-fresh produce is scheduled for delivery to {confirmedOrder.deliveryAddress.pincode}, Bangalore.
              </p>
            </div>

            {/* Quick Order Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-xs border border-gray-100">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Items ({confirmedOrder.items.length})</span>
                <span>₹{confirmedOrder.totalAmount} (Paid via {confirmedOrder.paymentMethod})</span>
              </div>
              <div className="text-[11px] text-gray-500 divide-y divide-gray-100">
                {confirmedOrder.items.map(item => (
                  <div key={item.id} className="py-1 flex justify-between">
                    <span>{item.productName} ({item.unitLabel} × {item.quantity})</span>
                    <span className="font-semibold text-gray-800">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Link
                href="/account"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl text-center"
              >
                Track in My Orders
              </Link>
              <button
                onClick={onClose}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-emerald-700 mb-1">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-black text-gray-900">Bangalore Checkout</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Review your delivery address and choose payment method.
            </p>

            {errorMessage && (
              <div className="p-3 mb-4 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Saved Addresses Selector */}
            {customer.addresses.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-800 block mb-2">Saved Addresses:</label>
                <div className="space-y-2">
                  {customer.addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex items-start space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address_select"
                        checked={selectedAddressId === addr.id}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setPin(addr.pincode);
                        }}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-gray-900">{addr.fullName} ({addr.phoneNumber})</div>
                        <div className="text-gray-600 mt-0.5">
                          {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}{addr.landmark && `Near ${addr.landmark}, `}Bangalore - <strong>{addr.pincode}</strong>
                        </div>
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAddressId('')}
                    className="text-[11px] font-bold text-emerald-700 hover:underline pt-1 block"
                  >
                    + Deliver to a different address
                  </button>
                </div>
              </div>
            )}

            {/* New Address Form (if no saved address or user opted for new) */}
            {(!customer.addresses.length || selectedAddressId === '') && (
              <div className="space-y-2.5 mb-4 p-3.5 bg-gray-50 border border-gray-100 rounded-2xl">
                <h4 className="text-xs font-bold text-gray-800">Add Bangalore Delivery Address</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Recipient Full Name *"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit Phone Number *"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="House/Flat No., Building Name, Street *"
                  value={addressLine1}
                  onChange={e => setAddressLine1(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={landmark}
                    onChange={e => setLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Bangalore Pincode (560xxx) *"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Payment Gateway Selection */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-800 block mb-2">Payment Gateway:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Razorpay')}
                  className={`p-3 rounded-xl border flex items-center space-x-2 text-left font-bold transition-all ${
                    paymentMethod === 'Razorpay'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span>Razorpay UPI / Cards</span>
                    <span className="text-[10px] text-emerald-700 block font-normal">Test Gateway Active</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash on Delivery (Simulated)')}
                  className={`p-3 rounded-xl border flex items-center space-x-2 text-left font-bold transition-all ${
                    paymentMethod === 'Cash on Delivery (Simulated)'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-500'
                      : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span>Cash on Delivery</span>
                    <span className="text-[10px] text-gray-500 block font-normal">Pay upon arrival</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Order Summary & Final CTA */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Bangalore Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700 font-bold">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                <span>Total Amount Payable</span>
                <span className="text-base text-emerald-800">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handleCreateOrderAndPay}
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? 'Placing Order...' : `Pay ₹${totalAmount} & Confirm Order`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
