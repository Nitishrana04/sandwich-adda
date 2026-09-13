import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, Tag, Check, ShieldCheck, MapPin, Phone, User, FileText, QrCode, AlertTriangle, CreditCard, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';
import LocationPicker from '../components/LocationPicker';
import { openRazorpayCheckout } from '../utils/razorpay';

export default function CustomerCart() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    finalAmount,
    coupon,
    applyCoupon,
    removeCoupon,
    customerInfo,
    setCustomerInfo
  } = useCart();
  const { user } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState({ text: '', type: '' });
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // RAZORPAY, COD, or UPI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

  useEffect(() => {
    if (user) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        latitude: prev.latitude || user.latitude || null,
        longitude: prev.longitude || user.longitude || null,
      }));
    }
  }, [user]);

  useEffect(() => {
    let timer;
    if (showUpiModal && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showUpiModal, timeLeft]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('9897633716@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code) return;
    const res = await applyCoupon(code);
    if (res.success) {
      setCouponMsg({ text: res.message, type: 'success' });
      setCouponInput('');
    } else {
      setCouponMsg({ text: res.message, type: 'error' });
    }
    setTimeout(() => setCouponMsg({ text: '', type: '' }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));
  };

  const validateDetails = () => {
    if (!customerInfo.name.trim()) {
      setErrorMsg('Please enter your full name');
      return false;
    }
    if (!customerInfo.phone.trim() || customerInfo.phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!customerInfo.address.trim()) {
      setErrorMsg('Please enter your complete delivery address');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const executeOrderPlacement = async (confirmedUtr = '', paymentOverrides = {}) => {
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const activePaymentMethod = paymentOverrides.paymentMethod || paymentMethod;
      const orderPayload = {
        customerId: user?.id || null,
        customerName: customerInfo.name.trim(),
        customerPhone: customerInfo.phone.trim(),
        deliveryAddress: customerInfo.address.trim(),
        houseNo: customerInfo.houseNo || '',
        landmark: customerInfo.landmark || '',
        instructions: customerInfo.instructions || '',
        latitude: customerInfo.latitude || null,
        longitude: customerInfo.longitude || null,
        customerLocation: (customerInfo.latitude && customerInfo.longitude)
          ? { lat: customerInfo.latitude, lng: customerInfo.longitude }
          : null,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image
        })),
        subtotal,
        deliveryFee,
        discount,
        totalAmount: finalAmount,
        couponCode: coupon ? coupon.code : null,
        paymentMethod: activePaymentMethod,
        paymentStatus: paymentOverrides.paymentStatus || (activePaymentMethod === 'ONLINE' || activePaymentMethod === 'UPI' ? 'PAID' : 'PENDING'),
        razorpayOrderId: paymentOverrides.razorpayOrderId || null,
        razorpayPaymentId: paymentOverrides.razorpayPaymentId || null,
        razorpaySignature: paymentOverrides.razorpaySignature || null,
        utrNumber: confirmedUtr || utrNumber
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to place order. Store might be closed.');
        setIsSubmitting(false);
        setShowUpiModal(false);
        return;
      }

      // Record placed order ID so it shows in user's order history reliably
      try {
        const existing = JSON.parse(localStorage.getItem('sa_my_order_ids') || '[]');
        const updated = [data.id, data.orderNumber, ...existing.filter(x => x !== data.id && x !== data.orderNumber)];
        localStorage.setItem('sa_my_order_ids', JSON.stringify(updated));
      } catch (e) {}

      // Success
      sound.playSuccess();
      clearCart();
      setShowUpiModal(false);
      navigate(`/orders/${data.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setErrorMsg('Network error while placing order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!validateDetails()) return;

    if (paymentMethod === 'RAZORPAY') {
      setIsSubmitting(true);
      setErrorMsg('');

      // Open Razorpay Standard Checkout
      openRazorpayCheckout({
        amountInPaise: Math.max(100, Math.round(finalAmount * 100)),
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        prefill: {
          name: customerInfo.name.trim(),
          contact: customerInfo.phone.trim()
        },
        notes: {
          customerAddress: customerInfo.address.trim(),
          itemsCount: items.length
        },
        onSuccess: async (payData) => {
          // Payment successfully verified by /api/verify-payment on backend!
          await executeOrderPlacement('', {
            paymentMethod: 'ONLINE',
            paymentStatus: 'PAID',
            razorpayOrderId: payData.razorpay_order_id,
            razorpayPaymentId: payData.razorpay_payment_id,
            razorpaySignature: payData.razorpay_signature
          });
        },
        onError: (errMsg) => {
          setIsSubmitting(false);
          setErrorMsg(errMsg);
        },
        onDismiss: () => {
          setIsSubmitting(false);
          setErrorMsg('Payment modal closed. You can retry or choose another payment method.');
        }
      });
      return;
    }

    if (paymentMethod === 'UPI') {
      setTimeLeft(300);
      setShowUpiModal(true);
      return;
    }

    executeOrderPlacement();
  };

  const handleTestRazorpay = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    openRazorpayCheckout({
      amountInPaise: 100, // ₹1.00 test
      currency: 'INR',
      receipt: `test_rcpt_${Date.now()}`,
      prefill: {
        name: customerInfo.name || 'Test User',
        contact: customerInfo.phone || '9999999999'
      },
      onSuccess: (data) => {
        setIsSubmitting(false);
        setSuccessMsg(`Payment Verified! ID: ${data.razorpay_payment_id}`);
      },
      onError: (err) => {
        setIsSubmitting(false);
        setErrorMsg(err);
      },
      onDismiss: () => {
        setIsSubmitting(false);
        setErrorMsg('Test checkout was cancelled.');
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-4xl mb-4 animate-soft-pulse">
          🥪
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-sm text-gray-500 max-w-sm mt-2">
          Looks like you haven't added any cheesy, crispy grilled sandwiches to your cart yet!
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/25 transition-all hover:scale-105 active:scale-95"
        >
          Explore Sandwich Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
      
      {/* Back Button & Title */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Checkout & Order</h1>
          <p className="text-xs text-gray-500 font-medium">
            Review your sandwiches & delivery address
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-bold shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Cart Items & Delivery Details */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Items Summary Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <h2 className="font-extrabold text-gray-900 text-sm">
                Selected Sandwiches ({items.length})
              </h2>
              <Link to="/" className="text-xs font-bold text-orange-600 hover:underline">
                + Add more items
              </Link>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="veg-badge">
                          <span className="veg-badge-dot"></span>
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs font-extrabold text-gray-800 mt-0.5">
                        ₹{item.price}
                      </p>
                    </div>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId || item.id, -1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-900 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cartItemId || item.id, 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details Form Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h2 className="font-extrabold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              Delivery Address & Contact
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number (for OTP & delivery call) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Interactive Google Map Location Picker & GPS Detector */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Delivery Location on Map
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-md">
                    Accurate GPS
                  </span>
                </div>
                <LocationPicker
                  initialLat={customerInfo.latitude}
                  initialLng={customerInfo.longitude}
                  currentAddress={customerInfo.address}
                  onLocationSelect={({ address, lat, lng }) => {
                    setCustomerInfo((prev) => ({
                      ...prev,
                      address: address || prev.address,
                      latitude: lat,
                      longitude: lng
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Complete Address (Street, Area) *
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={customerInfo.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Rohta Road, Near Central Market, Meerut"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    House / Flat No.
                  </label>
                  <input
                    type="text"
                    name="houseNo"
                    value={customerInfo.houseNo}
                    onChange={handleInputChange}
                    placeholder="e.g. Flat 302, Tower B"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Nearby Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={customerInfo.landmark}
                    onChange={handleInputChange}
                    placeholder="e.g. Opposite Petrol Pump"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Special Delivery Instructions
                </label>
                <input
                  type="text"
                  name="instructions"
                  value={customerInfo.instructions}
                  onChange={handleInputChange}
                  placeholder="e.g. 'Call me when you reach the gate', 'Don't ring bell'"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Coupons, Payment & Bill */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Coupon Code Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h2 className="font-extrabold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-600" />
              Apply Coupon
            </h2>

            {coupon ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-emerald-800 tracking-wider">
                    {coupon.code}
                  </span>
                  <p className="text-[11px] text-emerald-600">
                    You saved ₹{discount}!
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {couponMsg.text && (
                  <p className={`text-xs mt-2 font-semibold ${
                    couponMsg.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {couponMsg.text}
                  </p>
                )}

                {/* Popular Coupons Suggestions */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleApplyCoupon('NEWUSER50')}
                    className="text-[10px] font-bold bg-orange-50 hover:bg-orange-100 text-orange-800 px-2 py-1 rounded-md border border-orange-200 transition-colors"
                  >
                    🎉 NEWUSER50 (₹50 OFF)
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('WEEKEND20')}
                    className="text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1 rounded-md border border-amber-200 transition-colors"
                  >
                    🔥 WEEKEND20 (20% OFF)
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('ADDAFREE')}
                    className="text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200 transition-colors"
                  >
                    🚚 ADDAFREE (Free Delivery)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-extrabold text-gray-900 text-sm">
                Payment Method
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Secure Checkout
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Razorpay Standard Web Checkout */}
              <label
                className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                    className="accent-orange-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-gray-900">Pay Online with Razorpay</p>
                      <span className="text-[9px] font-extrabold uppercase bg-orange-600 text-white px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                      UPI (GPay / PhonePe / Paytm), Cards, NetBanking, Wallets
                    </p>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              </label>

              {/* Option 2: Cash on Delivery */}
              <label
                className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="accent-orange-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Pay cash or scan rider's QR at doorstep</p>
                  </div>
                </div>
                <span className="text-lg flex-shrink-0">💵</span>
              </label>

              {/* Option 3: Direct Store UPI */}
              <label
                className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="accent-orange-600 mt-0.5 w-4 h-4"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Direct Store UPI QR</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Manual QR scan & 12-digit UTR input</p>
                  </div>
                </div>
                <span className="text-lg flex-shrink-0">📱</span>
              </label>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
            <h2 className="font-extrabold text-gray-900 text-sm mb-3">
              Bill Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Item Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">₹{deliveryFee}</span>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-gray-900">To Pay</span>
                  <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
                </div>
                <span className="text-xl font-black text-orange-600">
                  ₹{finalAmount}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full mt-5 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-98 text-white rounded-xl font-extrabold text-sm shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing with Razorpay...</span>
              ) : paymentMethod === 'RAZORPAY' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay with Razorpay</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-black">
                    ₹{finalAmount}
                  </span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-black">
                    ₹{finalAmount}
                  </span>
                </>
              )}
            </button>

            {/* Developer Sandbox Test Button */}
            <div className="mt-3 pt-3 border-t border-dashed border-gray-200 text-center">
              <button
                type="button"
                onClick={handleTestRazorpay}
                disabled={isSubmitting}
                className="text-[11px] text-gray-500 hover:text-orange-600 font-bold transition-colors inline-flex items-center gap-1 hover:underline"
              >
                <span>🧪 Test Razorpay Standard Checkout Modal (₹1.00)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ------------------- ADVANCED DYNAMIC UPI QR MODAL ------------------- */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 relative overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="text-center mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                Instant UPI Payment
              </span>
              <h3 className="text-xl font-black text-gray-900 mt-2">
                Scan & Pay ₹{finalAmount}
              </h3>
              <p className="text-xs text-gray-500">
                Scan with GPay, PhonePe, Paytm or any UPI App
              </p>
            </div>

            {/* Dynamic QR Box */}
            <div className="bg-orange-50/50 p-4 rounded-2xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center mb-4">
              <div className="w-44 h-44 bg-white p-2 rounded-xl shadow-md flex items-center justify-center relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    `upi://pay?pa=9897633716@upi&pn=Sandwich%20Adda&am=${finalAmount}&cu=INR&tn=Order_Payment`
                  )}`}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* UPI ID with Copy Button */}
              <div className="mt-3 flex items-center justify-between w-full bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs">
                <span className="font-bold text-gray-700">9897633716@upi</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-[11px] font-black text-orange-600 hover:text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg"
                >
                  {copiedUpi ? 'Copied! ✓' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Mobile Direct Pay Button */}
            <a
              href={`upi://pay?pa=9897633716@upi&pn=Sandwich%20Adda&am=${finalAmount}&cu=INR&tn=Sandwich%20Adda%20Order`}
              className="w-full py-2.5 mb-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2"
            >
              <span>Open in UPI App (GPay / PhonePe) 📱</span>
            </a>

            {/* Timer countdown */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3 px-1">
              <span>QR expires in:</span>
              <span className="font-black text-orange-600 font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* UTR Input (Optional) */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Enter 12-digit UTR / Ref ID (Optional):
              </label>
              <input
                type="text"
                maxLength={16}
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 423981290812"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-orange-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executeOrderPlacement(utrNumber)}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-black text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Confirming...' : 'I have Paid ✓'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
