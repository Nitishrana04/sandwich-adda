import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Shield, Bike, Lock, Phone, MapPin, CheckCircle2, 
  AlertCircle, ArrowRight, Sparkles, KeyRound 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function AuthGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin, loginRider, registerCustomer, loginCustomer } = useAuth();

  // Active Role Tab: 'customer' | 'admin' | 'rider'
  const [activeRole, setActiveRole] = useState('customer');

  // Customer sub-tab: 'signup' (Create Account) or 'signin' (Login)
  const [customerMode, setCustomerMode] = useState('signup'); // Default to create account as user requested!

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    password: '',
    address: ''
  });

  const [customerLoginPhone, setCustomerLoginPhone] = useState('');
  const [customerLoginPassword, setCustomerLoginPassword] = useState('');

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [riderIdentifier, setRiderIdentifier] = useState('');
  const [riderPin, setRiderPin] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Customer Create Account (Sign Up)
  const handleCustomerSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await registerCustomer(customerForm);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate('/', { replace: true }); // Opens Customer Dashboard / Menu
    } else {
      setError(res.message);
    }
  };

  // 2. Customer Sign In
  const handleCustomerSignin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginCustomer(customerLoginPhone, customerLoginPassword);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate('/', { replace: true });
    } else {
      setError(res.message);
    }
  };

  // 3. Admin Login
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(adminUsername, adminPassword);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate('/admin', { replace: true }); // Opens Admin Dashboard
    } else {
      setError(res.message);
    }
  };

  // 4. Rider Login
  const handleRiderSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginRider(riderIdentifier, riderPin);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate('/rider', { replace: true }); // Opens Rider Dashboard
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-orange-600/20 to-transparent blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-xl shadow-orange-600/30 mb-3 animate-soft-pulse">
            🥪
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sandwich Adda
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Choose your portal & sign in to continue
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-stone-900 p-1.5 rounded-2xl border border-stone-800 mb-6 shadow-inner">
          <button
            onClick={() => { setActiveRole('customer'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'customer'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => { setActiveRole('admin'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'admin'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          <button
            onClick={() => { setActiveRole('rider'); setError(''); }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'rider'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Rider</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
          
          {error && (
            <div className="mb-4 p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-center gap-2 text-red-200 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* =================== ROLE 1: CUSTOMER =================== */}
          {activeRole === 'customer' && (
            <div>
              {/* Customer sub-tabs: Create Account vs Sign In */}
              <div className="flex border-b border-stone-800 mb-5">
                <button
                  onClick={() => { setCustomerMode('signup'); setError(''); }}
                  className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition-all ${
                    customerMode === 'signup'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-stone-500 hover:text-stone-300'
                  }`}
                >
                  Create Account (New User)
                </button>
                <button
                  onClick={() => { setCustomerMode('signin'); setError(''); }}
                  className={`flex-1 pb-2.5 text-xs font-black border-b-2 transition-all ${
                    customerMode === 'signin'
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-stone-500 hover:text-stone-300'
                  }`}
                >
                  Sign In (Existing User)
                </button>
              </div>

              {customerMode === 'signup' ? (
                /* Customer Sign Up (Create Account) */
                <form onSubmit={handleCustomerSignup} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Password or PIN *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={customerForm.password}
                        onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                        placeholder="e.g. Rohta Road, Near Central Market, Meerut"
                        className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? 'Creating Account...' : 'Create Account & Open Store 🥪'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* Customer Sign In */
                <form onSubmit={handleCustomerSignin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={customerLoginPhone}
                        onChange={(e) => setCustomerLoginPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">
                      Password / PIN
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={customerLoginPassword}
                        onChange={(e) => setCustomerLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In & View Menu 🥪'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* =================== ROLE 2: ADMIN =================== */}
          {activeRole === 'admin' && (
            <div>
              <div className="mb-4 text-center">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">
                  Admin & Kitchen Management
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Full control over live orders, store schedule & menu
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Admin ID / Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Enter admin username"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Authenticating...' : 'Open Admin Dashboard 👨‍💼'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* =================== ROLE 3: RIDER =================== */}
          {activeRole === 'rider' && (
            <div>
              <div className="mb-4 text-center">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                  Delivery Partner App
                </span>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Order notifications, Google Maps navigation & OTP delivery
                </p>
              </div>

              <form onSubmit={handleRiderSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    Rider Mobile or Name
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={riderIdentifier}
                      onChange={(e) => setRiderIdentifier(e.target.value)}
                      placeholder="Enter mobile or name"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    4-Digit PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={riderPin}
                      onChange={(e) => setRiderPin(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 tracking-widest focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{loading ? 'Logging In...' : 'Open Delivery App 🛵'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
