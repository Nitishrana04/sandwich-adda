import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bike, Lock, Phone, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function RiderLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginRider } = useAuth();

  const [identifier, setIdentifier] = useState('9876543210'); // Default phone or rider name
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/rider';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginRider(identifier, pin);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (phoneOrId, riderPin = '1234') => {
    setIdentifier(phoneOrId);
    setPin(riderPin);
    setError('');
    setLoading(true);

    const res = await loginRider(phoneOrId, riderPin);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center px-4 py-12">
      
      {/* Back button */}
      <div className="w-full max-w-sm mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer Store
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-blue-500/30 mb-3">
            🛵
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">
            Delivery Partner Login
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sandwich Adda Rider Dispatch & OTP Verification
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Rider Phone or Name
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              4-Digit Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 tracking-widest focus:bg-white focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 mt-1"
          >
            {loading ? 'Logging in...' : 'Sign In as Delivery Partner'}
          </button>
        </form>

        {/* 1-Click Quick Select Rider */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 text-center mb-2.5">
            Quick 1-Click Login:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleQuickLogin('9876543210', '1234')}
              type="button"
              className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>🛵</span>
                <span>Amit Kumar (Hero Splendor)</span>
              </div>
              <span className="text-[10px] font-black text-blue-600">PIN: 1234</span>
            </button>

            <button
              onClick={() => handleQuickLogin('9876598765', '1234')}
              type="button"
              className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>🛵</span>
                <span>Rahul Verma (Honda Activa)</span>
              </div>
              <span className="text-[10px] font-black text-gray-500">PIN: 1234</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
