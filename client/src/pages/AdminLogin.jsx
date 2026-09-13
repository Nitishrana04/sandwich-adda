import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAdmin } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const res = await loginAdmin(username, password);
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = async () => {
    setUsername('admin');
    setPassword('admin123');
    setError('');
    setLoading(true);

    const res = await loginAdmin('admin', 'admin123');
    setLoading(false);

    if (res.success) {
      sound.playSuccess();
      navigate(from, { replace: true });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-center items-center px-4 py-12">
      
      {/* Back button */}
      <div className="w-full max-w-md mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customer Store
        </Link>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-black/80">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-orange-600/30 mb-4">
            👨‍💼
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Admin & Kitchen Login
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Sandwich Adda Owner & Kitchen Management Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/80 border border-red-800/80 rounded-xl flex items-center gap-2.5 text-red-200 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-xs font-medium text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-xs font-medium text-white placeholder-stone-500 focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-orange-600/30 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        {/* 1-Click Quick Demo Login */}
        <div className="mt-6 pt-6 border-t border-stone-800 text-center">
          <p className="text-[11px] font-bold text-stone-400 mb-3">
            Quick Testing / Demo Mode:
          </p>
          <button
            onClick={handleDemoLogin}
            type="button"
            className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5 text-orange-400" />
            <span>1-Click Login (admin / admin123)</span>
          </button>
        </div>

      </div>

    </div>
  );
}
