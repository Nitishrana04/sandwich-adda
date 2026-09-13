import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Phone, User, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { sound } from '../utils/audio';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendCustomerOtp, verifyCustomerOtp } = useAuth();
  const { setCustomerInfo } = useCart();

  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const res = await sendCustomerOtp(phone);
    setLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpNotice(res.message);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const res = await verifyCustomerOtp(phone, otp, name);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      // Also update customer info in cart context
      setCustomerInfo((prev) => ({
        ...prev,
        name: res.user.name,
        phone: res.user.phone
      }));
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col justify-center items-center px-4 py-12">
      
      {/* Back button */}
      <div className="w-full max-w-sm mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store Menu
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-orange-500/30 mb-3">
            🥪
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">
            Welcome to Sandwich Adda
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sign in with your mobile number to order & track
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {otpNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{otpNotice}</span>
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                10-Digit Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Sending OTP...' : 'Send 4-Digit OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 text-center">
                Enter 4-Digit OTP sent to +91 {phone}
              </label>
              <input
                type="text"
                maxLength={4}
                autoFocus
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center text-3xl font-black tracking-widest py-3 border-2 border-orange-500 rounded-2xl bg-orange-50/30 focus:outline-hidden focus:ring-4 focus:ring-orange-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP & Continue'}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs text-gray-500 hover:text-orange-600 font-bold"
            >
              Change phone number
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
