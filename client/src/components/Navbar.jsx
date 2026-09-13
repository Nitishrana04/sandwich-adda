import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, Shield, Bike, User, LogOut, LogIn, MapPin, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItemCount } = useCart();
  const { user, logout } = useAuth();
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, reason: '' });

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStoreStatus(data);
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform text-white font-black">
              🥪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  Sandwich Adda
                </span>
                {storeStatus?.isOpen ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Open Now
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest bg-stone-800 text-stone-400 border border-stone-700 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
                    Closed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                Good Food • Local Delivery • Always Fresh
              </p>
            </div>
          </Link>

          {/* Center: Location Badge */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-stone-800/80 border border-stone-700/80 rounded-full text-xs font-semibold text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            <span>Rohta Road, Meerut</span>
          </div>

          {/* Right Section: Role Switcher, User Badge, Cart */}
          {/* Right Section: Context-Aware Navigation, Role Access, Profile, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* If on Admin or Rider panel, show clean Storefront return button */}
            {(currentPath.startsWith('/admin') || currentPath.startsWith('/rider')) ? (
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-stone-700"
                title="Back to Customer Storefront"
              >
                <Store className="w-3.5 h-3.5 text-orange-400" />
                <span>Store</span>
              </Link>
            ) : (
              /* On Customer Screens: Show "My Orders" link */
              <Link
                to="/orders"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  currentPath.startsWith('/orders')
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <span>My Orders</span>
              </Link>
            )}

            {/* Privileged Shortcut: Only show Admin button if logged-in user is ADMIN and NOT currently on /admin */}
            {user?.role === 'ADMIN' && !currentPath.startsWith('/admin') && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/40 rounded-xl text-xs font-extrabold transition-all"
                title="Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Privileged Shortcut: Only show Delivery button if logged-in user is RIDER and NOT currently on /rider */}
            {user?.role === 'RIDER' && !currentPath.startsWith('/rider') && (
              <Link
                to="/rider"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 border border-orange-500/40 rounded-xl text-xs font-extrabold transition-all"
                title="Delivery Partner Portal"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider</span>
              </Link>
            )}

            {/* User Profile / Logout */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-stone-800 border border-stone-700 px-2.5 py-1.5 rounded-xl">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 text-xs font-bold text-stone-200 hover:text-orange-400 transition-colors"
                  title="My Profile & Saved Addresses"
                >
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px] font-black">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="font-bold">
                    {user.name ? user.name.replace(/\s*\([^)]*\)/g, '').trim() : 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1 text-stone-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-xl transition-colors border border-stone-700"
              >
                <LogIn className="w-3.5 h-3.5 text-orange-400" />
                <span>Login</span>
              </Link>
            )}

            {/* Cart Button (Only on Customer Screens) */}
            {!currentPath.startsWith('/rider') && !currentPath.startsWith('/admin') && (
              <Link
                to="/cart"
                className="relative flex items-center justify-center p-2.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl font-black shadow-md shadow-orange-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline text-xs">Cart</span>
                {totalItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-2 bg-white text-stone-950 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                    {totalItemCount}
                  </span>
                )}
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
