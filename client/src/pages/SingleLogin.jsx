import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, User, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function SingleLogin() {
  const navigate = useNavigate();
  const { login, registerCustomer } = useAuth();

  // Mode: 'login' or 'create_account'
  const [isCreateAccount, setIsCreateAccount] = useState(false);

  // Login Form Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Create Account Form Fields
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Single Login Handler
  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Email or Mobile Number');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your Password or OTP');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      // Automatically redirect to the verified role dashboard
      navigate(res.redirectUrl, { replace: true });
    } else {
      setError(res.message);
    }
  };

  // 2. Create Account Handler (New Users)
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!registerForm.name.trim()) {
      setError('Please enter your Full Name');
      return;
    }
    if (!registerForm.phone.trim() && !registerForm.email.trim()) {
      setError('Please enter your Mobile Number or Email');
      return;
    }
    if (!registerForm.password.trim() || registerForm.password.length < 4) {
      setError('Password/PIN must be at least 4 characters');
      return;
    }

    setError('');
    setLoading(true);

    const res = await registerCustomer(registerForm);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate(res.redirectUrl || '/', { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden select-none">
      
      {/* Ambient background illumination */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-80 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-2xl shadow-orange-600/30 mb-3 animate-soft-pulse">
            🥪
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sandwich Adda
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {isCreateAccount ? 'Create an account to start ordering' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          {error && (
            <div className="mb-5 p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-center gap-2 text-red-200 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isCreateAccount ? (
            /* =================== SINGLE LOGIN FORM =================== */
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Field 1: Email / Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Email / Mobile Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or 10-digit mobile"
                    className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-xs font-medium text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password / OTP */}
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5">
                  Password / OTP
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password or OTP"
                    className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-xs font-medium text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{loading ? 'Verifying Account...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Create Account Link for New Users */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setIsCreateAccount(true); setError(''); }}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
                >
                  New to Sandwich Adda? Create an account →
                </button>
              </div>

            </form>
          ) : (
            /* =================== CREATE ACCOUNT FORM =================== */
            <form onSubmit={handleCreateAccount} className="space-y-3">
              
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
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
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    placeholder="e.g. Rohta Road, Near Central Market, Meerut"
                    className="w-full pl-9 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-1.5"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account & Start Ordering 🥪'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setIsCreateAccount(false); setError(''); }}
                  className="text-xs font-bold text-stone-400 hover:text-white transition-colors"
                >
                  Already have an account? Sign In
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
