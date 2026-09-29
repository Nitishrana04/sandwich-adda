import React, { useState } from 'react';
import { X, Check, ChefHat, Sparkles, Plus, ArrowRight, ArrowLeft, Flame } from 'lucide-react';
import { sound } from '../utils/audio';

const BREAD_OPTIONS = [
  { id: 'white', name: 'Classic White Bread', price: 0, desc: 'Soft, golden & light toast', badge: 'Popular' },
  { id: 'brown', name: 'Whole Wheat Brown Bread', price: 10, desc: 'High fiber & wholesome health', badge: 'Healthy' },
  { id: 'garlic', name: 'Garlic & Herb Bread', price: 15, desc: 'Infused with roasted garlic butter', badge: 'Chef Special' },
  { id: 'multigrain', name: 'Artisan Multi-Grain', price: 15, desc: 'Loaded with toasted seeds & grains', badge: 'Premium' }
];

const FILLING_OPTIONS = [
  { id: 'corn', name: 'Juicy Sweet Corn', price: 0, desc: 'Crisp & sweet kernels' },
  { id: 'capsicum', name: 'Green Bell Capsicum', price: 0, desc: 'Diced & crunchy fresh' },
  { id: 'onion', name: 'Crisp Red Onion', price: 0, desc: 'Finely sliced crunch' },
  { id: 'tomato', name: 'Ripe Red Tomatoes', price: 0, desc: 'Juicy tangy slices' },
  { id: 'paneer_tikka', name: 'Tandoori Paneer Tikka', price: 30, desc: 'Marinated cottage cheese cubes', isPremium: true },
  { id: 'olives_jalapenos', name: 'Black Olives & Jalapeños', price: 20, desc: 'Zesty Mexican punch', isPremium: true }
];

const CHEESE_OPTIONS = [
  { id: 'regular', name: 'Classic Amul Cheese Slice', price: 0, desc: 'Creamy melting goodness' },
  { id: 'burst', name: 'Double Mozzarella Cheese Burst', price: 35, desc: 'Epic stretchy cheese pull', badge: 'Must Try 🔥' },
  { id: 'cheddar', name: 'Smoked Cheddar Melt', price: 25, desc: 'Sharp & rich aroma' },
  { id: 'light', name: 'Mild / Light Cheese', price: 0, desc: 'Subtle taste for fitness lovers' }
];

const SAUCE_OPTIONS = [
  { id: 'tandoori', name: 'Spicy Tandoori Mayo', price: 0, desc: 'Smoky North-Indian kick' },
  { id: 'mint', name: 'Desi Mint & Coriander Chutney', price: 0, desc: 'Traditional spiced chutney' },
  { id: 'chipotle', name: 'Smoky Chipotle Dressing', price: 10, desc: 'Deep Mexican smokiness' },
  { id: 'thousand', name: 'Creamy Thousand Island', price: 0, desc: 'Mild sweet & tangy herb spread' },
  { id: 'peri', name: 'Peri-Peri Chilli Drizzle', price: 10, desc: 'Fiery Portuguese chili kick' }
];

const GRILL_OPTIONS = [
  { id: 'golden', name: 'Golden Medium Crisp', price: 0, desc: 'Balanced crisp exterior, tender inside' },
  { id: 'extra_crunch', name: 'Extra Dark Crunch', price: 0, desc: 'Well-toasted for extra crunch' },
  { id: 'butter', name: 'Extra Amul Butter Brushed', price: 10, desc: 'Rich golden butter glaze', badge: 'Indulgent' }
];

export default function SandwichBuilderModal({ isOpen, onClose, onAddToCart }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBread, setSelectedBread] = useState(BREAD_OPTIONS[0]);
  const [selectedFillings, setSelectedFillings] = useState([FILLING_OPTIONS[0], FILLING_OPTIONS[1]]);
  const [selectedCheese, setSelectedCheese] = useState(CHEESE_OPTIONS[0]);
  const [selectedSauces, setSelectedSauces] = useState([SAUCE_OPTIONS[0], SAUCE_OPTIONS[1]]);
  const [selectedGrill, setSelectedGrill] = useState(GRILL_OPTIONS[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isOpen) return null;

  // Base price
  const BASE_PRICE = 99;

  // Calculate total price
  const fillingsAddon = selectedFillings.reduce((sum, f) => sum + (f.price || 0), 0);
  const saucesAddon = selectedSauces.reduce((sum, s) => sum + (s.price || 0), 0);
  const totalPrice = BASE_PRICE + selectedBread.price + fillingsAddon + selectedCheese.price + saucesAddon + selectedGrill.price;

  const toggleFilling = (filling) => {
    const exists = selectedFillings.some((f) => f.id === filling.id);
    if (exists) {
      if (selectedFillings.length === 1) return; // Keep at least 1
      setSelectedFillings(selectedFillings.filter((f) => f.id !== filling.id));
    } else {
      if (selectedFillings.length >= 4) {
        alert('You can select up to 4 fillings for the perfect grill!');
        return;
      }
      setSelectedFillings([...selectedFillings, filling]);
    }
  };

  const toggleSauce = (sauce) => {
    const exists = selectedSauces.some((s) => s.id === sauce.id);
    if (exists) {
      if (selectedSauces.length === 1) return; // Keep at least 1
      setSelectedSauces(selectedSauces.filter((s) => s.id !== sauce.id));
    } else {
      if (selectedSauces.length >= 2) {
        // Replace oldest or limit
        setSelectedSauces([selectedSauces[1], sauce]);
      } else {
        setSelectedSauces([...selectedSauces, sauce]);
      }
    }
  };

  const handleFinishAndAdd = () => {
    sound.playSuccess();
    const customItem = {
      id: `custom_${Date.now()}`,
      name: `Custom Chef Grilled Sandwich`,
      price: totalPrice,
      category: 'Grilled Sandwiches',
      isCustom: true,
      customDetails: {
        bread: selectedBread.name,
        fillings: selectedFillings.map((f) => f.name).join(', '),
        cheese: selectedCheese.name,
        sauces: selectedSauces.map((s) => s.name).join(', '),
        grill: selectedGrill.name,
        notes: specialInstructions
      },
      description: `${selectedBread.name} • ${selectedFillings.map((f) => f.name).join(', ')} • ${selectedCheese.name} • ${selectedSauces.map((s) => s.name).join(', ')}`,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
      isBestseller: true,
      prepTime: '12-15 mins'
    };

    onAddToCart(customItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              🧑‍🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/25 px-2 py-0.5 rounded-full">
                  Sandwich Studio
                </span>
                <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Step {currentStep} of 5
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                Make Your Own Sandwich
              </h2>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20 text-xs font-bold">
            {['Bread', 'Fillings', 'Cheese', 'Sauces', 'Grill'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setCurrentStep(idx + 1)}
                className={`flex items-center gap-1.5 transition-all ${
                  currentStep === idx + 1
                    ? 'text-white scale-105'
                    : currentStep > idx + 1
                    ? 'text-amber-200'
                    : 'text-white/50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === idx + 1
                      ? 'bg-white text-orange-600'
                      : currentStep > idx + 1
                      ? 'bg-amber-300 text-orange-950'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {currentStep > idx + 1 ? '✓' : idx + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body (Step specific) */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: BREAD */}
          {currentStep === 1 && (
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-black text-gray-900">Step 1: Choose Your Bread Base</h3>
                <p className="text-xs text-gray-500">Select freshly baked artisan bread for your sandwich.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BREAD_OPTIONS.map((bread) => {
                  const isSelected = selectedBread.id === bread.id;
                  return (
                    <div
                      key={bread.id}
                      onClick={() => setSelectedBread(bread)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/60 shadow-md shadow-orange-600/10'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900">{bread.name}</span>
                        {bread.price > 0 ? (
                          <span className="text-[11px] font-extrabold text-orange-600">+₹{bread.price}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Included</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{bread.desc}</p>
                      {bread.badge && (
                        <span className="inline-block mt-2 text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                          {bread.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: FILLINGS */}
          {currentStep === 2 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Step 2: Veggie & Protein Fillings</h3>
                  <p className="text-xs text-gray-500">Pick 1 to 4 fillings. First 2 basic veggies are free!</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  {selectedFillings.length}/4 Selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FILLING_OPTIONS.map((filling) => {
                  const isSelected = selectedFillings.some((f) => f.id === filling.id);
                  return (
                    <div
                      key={filling.id}
                      onClick={() => toggleFilling(filling)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/60 shadow-md shadow-orange-600/10'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-900">{filling.name}</span>
                          {filling.isPremium && (
                            <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md">
                              Chef Pick
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{filling.desc}</p>
                      </div>
                      <div className="text-right">
                        {filling.price > 0 ? (
                          <span className="text-[11px] font-extrabold text-orange-600 block">+₹{filling.price}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full block">Free</span>
                        )}
                        <span
                          className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mt-1.5 ${
                            isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHEESE LEVEL */}
          {currentStep === 3 && (
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-black text-gray-900">Step 3: Choose Cheese Level 🧀</h3>
                <p className="text-xs text-gray-500">How cheesy do you like your sandwich?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHEESE_OPTIONS.map((cheese) => {
                  const isSelected = selectedCheese.id === cheese.id;
                  return (
                    <div
                      key={cheese.id}
                      onClick={() => setSelectedCheese(cheese)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/60 shadow-md shadow-orange-600/10'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900">{cheese.name}</span>
                        {cheese.price > 0 ? (
                          <span className="text-[11px] font-extrabold text-orange-600">+₹{cheese.price}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Included</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{cheese.desc}</p>
                      {cheese.badge && (
                        <span className="inline-block mt-2 text-[9px] font-black uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                          {cheese.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SAUCES */}
          {currentStep === 4 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-900">Step 4: Signature Sauces & Spreads</h3>
                  <p className="text-xs text-gray-500">Choose up to 2 sauces for mouth-watering flavor.</p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  {selectedSauces.length}/2 Selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAUCE_OPTIONS.map((sauce) => {
                  const isSelected = selectedSauces.some((s) => s.id === sauce.id);
                  return (
                    <div
                      key={sauce.id}
                      onClick={() => toggleSauce(sauce)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/60 shadow-md shadow-orange-600/10'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-black text-gray-900">{sauce.name}</span>
                        <p className="text-[11px] text-gray-500 mt-0.5">{sauce.desc}</p>
                      </div>
                      <div className="text-right">
                        {sauce.price > 0 ? (
                          <span className="text-[11px] font-extrabold text-orange-600 block">+₹{sauce.price}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full block">Free</span>
                        )}
                        <span
                          className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs mt-1.5 ${
                            isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isSelected ? '✓' : '+'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: GRILL & FINISH */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-gray-900">Step 5: Toast & Grilling Preference</h3>
                <p className="text-xs text-gray-500">How should our chef press and grill your sandwich?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {GRILL_OPTIONS.map((grill) => {
                  const isSelected = selectedGrill.id === grill.id;
                  return (
                    <div
                      key={grill.id}
                      onClick={() => setSelectedGrill(grill)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/60 shadow-md shadow-orange-600/10'
                          : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-900">{grill.name}</span>
                        {grill.price > 0 ? (
                          <span className="text-[11px] font-extrabold text-orange-600">+₹{grill.price}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Free</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">{grill.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Special Note */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Cooking Note / Special Request (Optional)
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Cut in 4 pieces, extra oregano sprinkle, less spicy"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Summary Preview Box */}
              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs">
                <span className="font-extrabold text-amber-900 block mb-1">🥪 Your Custom Creation:</span>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  <span className="font-bold">Bread:</span> {selectedBread.name} • <span className="font-bold">Fillings:</span> {selectedFillings.map(f => f.name).join(', ')} • <span className="font-bold">Cheese:</span> {selectedCheese.name} • <span className="font-bold">Sauces:</span> {selectedSauces.map(s => s.name).join(', ')} • <span className="font-bold">Grill:</span> {selectedGrill.name}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer with Price & Nav Buttons */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">Total Price</span>
            <span className="text-xl font-black text-gray-900">₹{totalPrice}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3.5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/20 transition-all flex items-center gap-1"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishAndAdd}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <ChefHat className="w-4 h-4" /> Add to Cart (₹{totalPrice})
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
