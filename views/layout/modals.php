<?php
if (!defined('APP_NAME')) exit;
?>

<!-- Slide-over Cart Drawer -->
<div id="cartDrawer" class="fixed inset-0 z-50 overflow-hidden pointer-events-none transition-opacity duration-300 opacity-0">
    <div id="cartBackdrop" onclick="toggleCartDrawer(false)" class="absolute inset-0 bg-gray-900 bg-opacity-50 transition-opacity"></div>
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col pointer-events-auto transform translate-x-full transition-transform duration-300" id="cartDrawerContent">
            
            <!-- Cart Header -->
            <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-emerald-50">
                <div class="flex items-center gap-2">
                    <i data-lucide="shopping-bag" class="w-5 h-5 text-emerald-700"></i>
                    <h3 class="font-bold text-gray-900 text-base">Your Fresh Basket (<span id="drawerCartCount">0</span>)</h3>
                </div>
                <button onclick="toggleCartDrawer(false)" class="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Free Delivery Progress Bar -->
            <div id="freeDeliveryProgressBox" class="p-3 bg-emerald-50/60 border-b border-emerald-100 text-xs">
                <div class="flex justify-between font-medium text-emerald-800 mb-1">
                    <span id="freeDeliveryStatusText">Add ₹399 for Free Delivery</span>
                    <span id="freeDeliveryPercent">0%</span>
                </div>
                <div class="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                    <div id="freeDeliveryBar" class="bg-emerald-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                </div>
            </div>

            <!-- Cart Items List -->
            <div id="cartItemsContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
                <!-- Injected via JavaScript -->
            </div>

            <!-- Cart Footer -->
            <div class="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                <div class="flex items-center justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span id="drawerSubtotal" class="font-bold text-gray-900 text-base">₹0</span>
                </div>
                <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>Bangalore Delivery:</span>
                    <span id="drawerDeliveryNotice" class="font-medium text-emerald-700">Calculated at checkout</span>
                </div>
                <a href="/checkout" id="checkoutBtn" class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all text-center">
                    <span>Proceed to Checkout</span>
                    <i data-lucide="arrow-right" class="w-4 h-4"></i>
                </a>
                <p class="text-[11px] text-center text-gray-400 flex items-center justify-center gap-1">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5 text-emerald-600"></i>
                    <span>Freshness Guaranteed • Contactless Delivery</span>
                </p>
            </div>
        </div>
    </div>
</div>

<!-- Customer OTP Login Modal -->
<div id="loginModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 opacity-0 pointer-events-none transition-opacity duration-200">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative transform scale-95 transition-transform duration-200" id="loginModalBox">
        <button onclick="closeLoginModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="text-center mb-6">
            <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-700">
                <i data-lucide="smartphone" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Customer Login</h3>
            <p class="text-xs text-gray-500 mt-1">Enter your mobile number to order fresh vegetables</p>
        </div>

        <!-- Step 1: Mobile Phone -->
        <div id="otpStepPhone">
            <div class="mb-4">
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                <div class="relative">
                    <span class="absolute left-3 top-2.5 text-gray-500 font-medium text-sm">+91</span>
                    <input type="tel" id="loginPhoneInput" maxlength="10" placeholder="9876543210" class="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500">
                </div>
                <p class="text-[11px] text-gray-400 mt-1">Demo test number: <strong>9876543210</strong></p>
            </div>
            <button onclick="handleSendOtp()" id="sendOtpBtn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200">
                Send OTP
            </button>
        </div>

        <!-- Step 2: OTP Verification -->
        <div id="otpStepVerify" class="hidden">
            <div class="mb-4">
                <div class="flex justify-between items-center mb-1.5">
                    <label class="block text-xs font-semibold text-gray-700">Enter 6-Digit OTP</label>
                    <button onclick="resetLoginToPhone()" class="text-xs text-emerald-600 hover:underline">Change Number</button>
                </div>
                <input type="text" id="loginOtpInput" maxlength="6" placeholder="123456" class="w-full text-center tracking-widest text-lg font-bold py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <p class="text-[11px] text-gray-400 mt-1 text-center">Demo OTP: <strong>123456</strong></p>
            </div>
            <button onclick="handleVerifyOtp()" id="verifyOtpBtn" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 mb-3">
                Verify & Continue
            </button>
            <div class="text-center text-xs text-gray-500">
                <span id="otpCooldownText">Resend OTP in <strong id="otpTimer">60</strong>s</span>
                <button onclick="handleResendOtp()" id="otpResendBtn" class="hidden font-semibold text-emerald-700 hover:underline">Resend OTP</button>
            </div>
        </div>
    </div>
</div>

<!-- Bangalore Pincode Modal -->
<div id="pincodeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50 opacity-0 pointer-events-none transition-opacity duration-200">
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative transform scale-95 transition-transform duration-200">
        <button onclick="closePincodeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="text-center mb-5">
            <div class="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-700">
                <i data-lucide="map-pin" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-900">Check Delivery Pincode</h3>
            <p class="text-xs text-gray-500 mt-1">We currently deliver exclusively across Bangalore (560xxx)</p>
        </div>

        <div class="mb-4">
            <input type="text" id="checkPincodeInput" maxlength="6" placeholder="Enter 6-digit PIN code (e.g. 560035)" class="w-full text-center text-base font-bold py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <div id="pincodeCheckResult" class="mt-2 text-xs text-center hidden"></div>
        </div>

        <button onclick="handleCheckPincode()" class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200">
            Check Availability
        </button>
    </div>
</div>

<!-- Global Toast Notification Banner -->
<div id="toastNotification" class="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-xl text-xs font-medium transform translate-y-24 opacity-0 transition-all duration-300">
    <i id="toastIcon" data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
    <span id="toastMessage">Item added to cart!</span>
</div>
