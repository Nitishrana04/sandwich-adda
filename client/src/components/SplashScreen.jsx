import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen({ onFinish }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 6;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col items-center justify-between p-6 sm:p-8 select-none overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Tagline */}
      <div className="pt-6 relative z-10 text-center">
        <p className="text-xl sm:text-2xl font-serif italic text-stone-200 tracking-wide">
          Good Food <br />
          <span className="font-sans font-bold text-white not-italic text-2xl sm:text-3xl">Better Days</span>
        </p>
      </div>

      {/* Center Hero Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        
        {/* Sandwich Hero Visual */}
        <div className="relative mb-6">
          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-2xl shadow-orange-950/60 border border-orange-500/30 relative group">
            <img 
              src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80" 
              alt="Crispy Sandwich"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          
          {/* Chef Hat / Logo Badge */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-stone-900 border border-orange-500/40 text-orange-400 px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
            <span className="text-sm">👨‍🍳</span>
            <span>Sandwich Adda</span>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
          Sandwich Adda
        </h1>

        {/* Taglines */}
        <p className="text-xs sm:text-sm font-semibold text-orange-400 mt-1">
          Good Food • Local Delivery • Always Fresh
        </p>

        <p className="text-xs text-stone-400 mt-1">
          Fresh Sandwiches Delivered to You
        </p>

        {/* Rohta Road Delivery Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900/90 border border-orange-500/30 rounded-2xl text-stone-300 text-xs font-medium shadow-inner">
          <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span>Currently delivering only in <strong className="text-white">Rohta Road, Meerut</strong></span>
        </div>

        {user && (
          <div className="mt-3 text-xs text-orange-300 font-semibold">
            Logged in as {user.name} ({user.role})
          </div>
        )}

      </div>

      {/* Bottom CTA Button */}
      <div className="w-full max-w-xs relative z-10 flex flex-col items-center gap-4 pb-4">
        
        {/* Animated Progress */}
        <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-98 text-white font-black text-sm rounded-full shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>

        <p className="text-[11px] text-stone-500 font-medium">
          Sandwiches Made for Your Cravings ♡
        </p>
      </div>

    </div>
  );
}
