import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Sparkles, Clock, AlertCircle, ShoppingBag, Plus, Minus, Check, Flame, Mic, MicOff, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';

export default function CustomerHome() {
  const { items: cartItems, addToCart, updateQuantity, subtotal, totalItemCount } = useCart();
  const { latestEvent } = useSocket();

  const [menu, setMenu] = useState([]);
  const [storeStatus, setStoreStatus] = useState({ isOpen: true, reason: '' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [smartFilter, setSmartFilter] = useState('ALL');
  const [isListening, setIsListening] = useState(false);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenu(data);
    } catch (err) {
      console.error('Failed to load menu', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStoreStatus(data);
    } catch (err) {
      console.error('Failed to load status', err);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchStatus();
  }, []);

  // Listen to live socket events (menu availability changes or store status)
  useEffect(() => {
    if (latestEvent?.type === 'MENU_UPDATED') {
      fetchMenu();
    } else if (latestEvent?.type === 'STORE_STATUS') {
      setStoreStatus(latestEvent.data);
    }
  }, [latestEvent]);

  // Voice Search Handler
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Categories list
  const categories = ['All', 'Grilled Sandwiches', 'Cheese Loaded', 'Special Adda Combos', 'Beverages & Sides'];

  // Filtered menu with category, search and smart filters
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesSmart = true;
    if (smartFilter === 'BESTSELLER') matchesSmart = item.isBestseller;
    if (smartFilter === 'UNDER_100') matchesSmart = item.price < 100;
    if (smartFilter === 'CHEESY') matchesSmart = item.name.toLowerCase().includes('cheese') || item.description?.toLowerCase().includes('cheese');
    if (smartFilter === 'SPICY') matchesSmart = item.name.toLowerCase().includes('tikka') || item.name.toLowerCase().includes('masala') || item.name.toLowerCase().includes('tandoori');

    return matchesCategory && matchesSearch && matchesSmart;
  });

  const bestsellers = menu.filter((item) => item.isBestseller);

  const getItemQuantityInCart = (id) => {
    const found = cartItems.find((i) => i.id === id || i.cartItemId === id || (i.cartItemId && i.cartItemId.startsWith(`${id}_`)));
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen pb-28">
      
      {/* Top Notification / Notice Bar */}
      {storeStatus.settings?.storeNotice && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 text-center shadow-inner flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{storeStatus.settings.storeNotice}</span>
        </div>
      )}

      {/* Store Status Warning if Closed */}
      {!storeStatus.isOpen && (
        <div className="bg-red-500 text-white p-4 text-center font-bold text-sm shadow-md flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0" />
          <span>
            {storeStatus.reason || 'Sandwich Adda is currently closed. Weekend Timings: Saturday & Sunday 5:00 PM – 10:00 PM.'}
          </span>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-orange-50/70 to-transparent pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl overflow-hidden relative border border-stone-700/50">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 text-orange-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                <Flame className="w-4 h-4 text-orange-400" />
                Hot Butter Grilled Sandwiches
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Sandwich Adda <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  Weekend Special Kitchen
                </span>
              </h1>
              <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
                Loaded paneer, oozing cheese, spicy Bombay masala, and jumbo club sandwiches grilled fresh on order. Delivered steaming hot to your doorstep!
              </p>
              
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-stone-300">
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>Sat & Sun: 5:00 PM – 10:00 PM</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>100% Pure Vegetarian 🟢</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-1.5 rounded-lg border border-stone-700">
                  <span>🚀 Express Local Delivery</span>
                </div>
              </div>
            </div>

            {/* Decorative background image */}
            <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 lg:opacity-35 pointer-events-none hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80"
                alt="Delicious Sandwich"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-stone-900"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Search and Category Filter Bar */}
        <div className="sticky top-16 sm:top-20 z-30 bg-[#FAFAF9]/95 backdrop-blur-md py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            
            {/* Search Box with Voice Recognition */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isListening ? "Listening... Speak now 🎙️" : "Search sandwiches, cheese burst, paneer..."}
                className={`w-full pl-11 pr-20 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-hidden focus:ring-2 shadow-xs transition-all ${
                  isListening
                    ? 'border-orange-500 ring-2 ring-orange-500/40 animate-pulse placeholder-orange-500 font-bold'
                    : 'border-gray-200 focus:ring-orange-500/30 focus:border-orange-500'
                }`}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  title="Search with Voice"
                  className={`p-1.5 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-bounce shadow-md'
                      : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category Pills (Horizontally Scrollable) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/25 scale-102'
                      : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Smart Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
              Quick Filter:
            </span>
            <button
              onClick={() => setSmartFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                smartFilter === 'ALL'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSmartFilter('BESTSELLER')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                smartFilter === 'BESTSELLER'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
              }`}
            >
              <span>🔥</span>
              <span>Bestsellers</span>
            </button>
            <button
              onClick={() => setSmartFilter('UNDER_100')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                smartFilter === 'UNDER_100'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50'
              }`}
            >
              <span>💰</span>
              <span>Under ₹100</span>
            </button>
            <button
              onClick={() => setSmartFilter('CHEESY')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                smartFilter === 'CHEESY'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-amber-50'
              }`}
            >
              <span>🧀</span>
              <span>Cheese Loaded</span>
            </button>
            <button
              onClick={() => setSmartFilter('SPICY')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                smartFilter === 'SPICY'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
              }`}
            >
              <span>🌶️</span>
              <span>Spicy Special</span>
            </button>
          </div>
        </div>

        {/* Bestseller Horizontal Highlights (if 'All' category and no search) */}
        {selectedCategory === 'All' && !searchQuery && bestsellers.length > 0 && (
          <section className="mt-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  Most Loved Bestsellers
                </h2>
              </div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Top Rated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestsellers.slice(0, 3).map((item) => {
                const qty = getItemQuantityInCart(item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-orange-200/80 shadow-xs hover:shadow-md transition-all flex gap-4 relative overflow-hidden"
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-amber-500 text-stone-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-stone-900" /> Bestseller
                      </span>
                    </div>

                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="veg-badge" title="Pure Veg">
                            <span className="veg-badge-dot"></span>
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-extrabold text-gray-900">
                            ₹{item.price}
                          </span>
                          {item.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.originalPrice}
                            </span>
                          )}
                        </div>

                        {/* Add / Qty Button */}
                        {item.isAvailable ? (
                          qty > 0 ? (
                            <div className="flex items-center bg-orange-50 border border-orange-500 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-100 active:bg-orange-200 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-black text-orange-700 min-w-[20px] text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-100 active:bg-orange-200 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all"
                            >
                              ADD +
                            </button>
                          )
                        ) : (
                          <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Menu Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
              {selectedCategory === 'All' ? 'All Sandwiches & Bites' : selectedCategory}
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {filteredMenu.length} items
            </span>
          </div>
        </div>

        {/* Menu Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 animate-pulse h-48 border border-gray-100"></div>
            ))}
          </div>
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-200/80 p-8 max-w-md mx-auto">
            <span className="text-5xl">🥪</span>
            <h3 className="mt-4 text-base font-bold text-gray-800">No items found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try searching for something else like "paneer" or "cheese".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 bg-orange-100 text-orange-700 text-xs font-bold rounded-xl hover:bg-orange-200 transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMenu.map((item) => {
              const qty = getItemQuantityInCart(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                    item.isAvailable
                      ? 'border-gray-200/80 hover:border-orange-300 hover:shadow-md'
                      : 'border-gray-200 opacity-60 bg-gray-50/70'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image with Tag */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {item.isBestseller && (
                        <div className="absolute top-1.5 left-1.5 bg-amber-500 text-stone-900 text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                          ⭐ BEST
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="veg-badge" title="Pure Vegetarian">
                          <span className="veg-badge-dot"></span>
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-gray-500">
                        <span>⏱️ {item.prepTime || '10 mins'}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          ★ {item.rating || 4.8}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-gray-900">
                        ₹{item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>

                    {item.isAvailable ? (
                      qty > 0 ? (
                        <div className="flex items-center bg-orange-50 border border-orange-500 rounded-lg overflow-hidden shadow-xs">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-100 active:bg-orange-200 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-black text-orange-700 min-w-[24px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="px-2.5 py-1 text-orange-600 font-bold hover:bg-orange-100 active:bg-orange-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> ADD
                        </button>
                      )
                    ) : (
                      <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Floating Bottom Cart Pill (Visible when items in cart) */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40 animate-bounce-short">
          <Link
            to="/cart"
            className="flex items-center justify-between bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-orange-600/30 hover:shadow-orange-600/50 transition-all hover:scale-102 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                {totalItemCount}
              </div>
              <div>
                <p className="text-xs font-medium text-orange-100">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} added
                </p>
                <p className="text-base font-extrabold">
                  ₹{subtotal}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-black tracking-wide">
              <span>View Cart</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

    </div>
  );
}
