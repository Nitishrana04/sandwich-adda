import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto pt-10 pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥪</span>
              <span className="text-lg font-black text-white tracking-tight">Sandwich Adda</span>
            </div>
            <p className="text-xs text-stone-400 mt-1 max-w-sm">
              Cheesy, crispy, freshly grilled sandwiches delivered straight to your doorstep across Rohta Road, Meerut.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-800/80 px-3.5 py-2 rounded-2xl border border-stone-700/60 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-stone-300 font-semibold">100% Secure Payments via Razorpay</span>
          </div>
        </div>

        <div className="py-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-stone-400">
            <Link to="/policies" className="hover:text-orange-400 transition-colors">Terms & Conditions</Link>
            <span>•</span>
            <Link to="/policies" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/policies" className="hover:text-orange-400 transition-colors">Refund & Cancellation</Link>
            <span>•</span>
            <Link to="/policies" className="hover:text-orange-400 transition-colors">Shipping & Delivery</Link>
            <span>•</span>
            <Link to="/policies" className="hover:text-orange-400 transition-colors">Contact Us</Link>
          </div>

          <div className="text-[11px] text-stone-500">
            Shop No. 4, Rohta Road, Meerut, UP 250002
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 border-t border-stone-800/60">
          <p>© {new Date().getFullYear()} Sandwich Adda. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for sandwich lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
