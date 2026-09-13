import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, ShoppingBag, Award, ArrowLeft, LogOut, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [savedAddress, setSavedAddress] = useState(user?.address || '');
  const [orders, setOrders] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        if (Array.isArray(data)) {
          const myOrders = data.filter(
            (o) => o.customerPhone === user?.phone || o.customerId === user?.id
          );
          setOrders(myOrders.length > 0 ? myOrders : data.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load user orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  const handleSaveAddress = () => {
    if (user) {
      const updatedUser = { ...user, address: savedAddress };
      localStorage.setItem('sa_auth_user', JSON.stringify(updatedUser));
      setIsSaved(true);
      sound.playSuccess();
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const loyaltyCoins = Math.round(totalSpent * 0.1);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Your Account</h1>
            <p className="text-xs text-gray-500 font-medium">
              Profile, loyalty coins, and delivery addresses
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors border border-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-600/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  {user?.name || 'Sandwich Connoisseur'}
                </h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  {user?.role || 'Customer'}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>+91 {user?.phone || '9897633716'}</span>
              </p>
              {user?.email && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{user.email}</span>
                </p>
              )}
            </div>
          </div>

          {/* Loyalty Coins Badge */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3.5 rounded-2xl shadow-md flex items-center gap-3">
            <Award className="w-8 h-8 text-yellow-200 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                Adda Rewards Coins
              </p>
              <p className="text-xl font-black leading-tight">
                {loyaltyCoins} Coins
              </p>
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100 text-center">
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Orders Placed</p>
            <p className="text-lg font-black text-gray-900 mt-0.5">{orders.length}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Spent</p>
            <p className="text-lg font-black text-orange-600 mt-0.5">₹{totalSpent}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Preferred Zone</p>
            <p className="text-sm font-black text-gray-900 mt-1">Rohta Road, Meerut</p>
          </div>
        </div>
      </div>

      {/* Address Book Manager */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-black text-gray-900">
              Default Delivery Address
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-400">
            Used for automatic checkout
          </span>
        </div>

        <div className="space-y-3">
          <textarea
            rows={3}
            value={savedAddress}
            onChange={(e) => setSavedAddress(e.target.value)}
            placeholder="Enter your flat/house no, street, landmark, Rohta Road Meerut..."
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />

          <button
            onClick={handleSaveAddress}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Address</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          to="/orders"
          className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-800 shadow-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-black text-gray-900">Your Orders</p>
              <p className="text-[11px] text-gray-500">Track orders & reorder past meals</p>
            </div>
          </div>
          <span>→</span>
        </Link>

        <Link
          to="/"
          className="p-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs font-bold text-gray-800 shadow-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🥪</span>
            <div>
              <p className="text-sm font-black text-gray-900">Browse Menu</p>
              <p className="text-[11px] text-gray-500">Order crispy butter grilled sandwiches</p>
            </div>
          </div>
          <span>→</span>
        </Link>
      </div>

    </div>
  );
}
