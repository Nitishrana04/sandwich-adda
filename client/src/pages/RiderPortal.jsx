import React, { useState, useEffect } from 'react';
import { 
  Bike, Phone, MessageSquare, MapPin, CheckCircle2, ShieldCheck, 
  DollarSign, Package, AlertCircle, RefreshCw, KeyRound, ExternalLink, ArrowRight, Navigation
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { sound } from '../utils/audio';

export default function RiderPortal() {
  const { latestEvent, socket } = useSocket();

  const [riders, setRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState('rider_1');
  const [riderOrders, setRiderOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // OTP Modal
  const [otpOrder, setOtpOrder] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [simulatingOrderId, setSimulatingOrderId] = useState(null);

  const startDriveSimulation = (orderId) => {
    if (simulatingOrderId === orderId) {
      setSimulatingOrderId(null);
      return;
    }
    setSimulatingOrderId(orderId);

    const ROUTE_COORDS = [
      [28.9875, 77.6720], // Kitchen
      [28.9890, 77.6742], // Market
      [28.9918, 77.6778], // Bypass Chowk
      [28.9942, 77.6810], // Shivalik
      [28.9965, 77.6840]  // Customer
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step >= ROUTE_COORDS.length) {
        clearInterval(interval);
        setSimulatingOrderId(null);
        return;
      }
      const [lat, lng] = ROUTE_COORDS[step];
      if (socket) {
        socket.emit('rider:location_update', {
          orderId,
          riderId: selectedRiderId,
          riderName: currentRider?.name || 'Rana Bhai',
          lat,
          lng,
          speed: 32,
          eta: `${Math.max(1, 6 - step)} mins`
        });
      }
      step++;
    }, 2500);
  };

  // Fetch riders & assigned orders
  const loadRiderData = async () => {
    try {
      const ridersRes = await fetch('/api/riders');
      const ridersData = await ridersRes.json();
      setRiders(ridersData);

      const targetRiderId = selectedRiderId || ridersData[0]?.id;
      if (targetRiderId) {
        const ordersRes = await fetch(`/api/riders/${targetRiderId}/orders`);
        const ordersData = await ordersRes.json();
        setRiderOrders(ordersData);
      }
    } catch (err) {
      console.error('Failed to load rider data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiderData();
  }, [selectedRiderId]);

  // Join rider room via socket
  useEffect(() => {
    if (socket && selectedRiderId) {
      socket.emit('join:rider', selectedRiderId);
    }
  }, [socket, selectedRiderId]);

  // Listen to socket events
  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.type === 'RIDER_ASSIGNED' && latestEvent.data.assignedRiderId === selectedRiderId) {
      sound.playRiderBuzzer();
      loadRiderData();
    } else if (latestEvent.type === 'ORDER_UPDATED') {
      loadRiderData();
    }
  }, [latestEvent, selectedRiderId]);

  const currentRider = riders.find((r) => r.id === selectedRiderId) || riders[0];

  // Actions
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        sound.playSuccess();
        loadRiderData();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim() || otpInput.trim().length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP provided by customer');
      return;
    }

    setOtpError('');
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/orders/${otpOrder.id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || 'Incorrect OTP code');
        setIsVerifying(false);
        return;
      }

      // Success
      sound.playSuccess();
      setOtpOrder(null);
      setOtpInput('');
      setIsVerifying(false);
      loadRiderData();
    } catch (err) {
      setOtpError('Verification failed. Check network.');
      setIsVerifying(false);
    }
  };

  // Deliveries classification
  const activeOrders = riderOrders.filter((o) => ['RIDER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status));
  const completedOrders = riderOrders.filter((o) => o.status === 'DELIVERED');

  const todayCompletedCount = completedOrders.length;
  const todayEarnings = todayCompletedCount * 40; // ₹40 per delivery
  const codCollectedTotal = completedOrders
    .filter((o) => o.paymentMethod === 'COD')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-stone-100 pb-24">
      
      {/* Main Container */}
      <main className="max-w-xl mx-auto p-4 space-y-4 pt-5">
        
        {/* Rider Profile Card & Earnings Summary */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm relative overflow-hidden">
          {/* Subtle top accent gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>

          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-3.5">
              {/* Professional Delivery Partner Badge */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-800 to-orange-950 text-white flex flex-col items-center justify-center border-2 border-orange-500/30 shadow-md">
                  <span className="text-2xl leading-none">🛵</span>
                  <span className="text-[10px] font-black tracking-wider text-orange-400 uppercase mt-0.5">RB</span>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Online & Ready"></span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-stone-900">
                    Rana Bhai
                  </h2>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-extrabold rounded-md">
                    RIDER
                  </span>
                </div>
                <p className="text-xs text-stone-600 font-medium mt-0.5 flex items-center gap-1.5">
                  <span>{currentRider?.vehicle || 'Hero Splendor Plus (UP-15-AB-3371)'}</span>
                </p>
                <p className="text-[11px] text-stone-500 font-semibold mt-0.5 flex items-center gap-2">
                  <span className="text-amber-600 font-bold">★ {currentRider?.rating || 4.9}</span>
                  <span>•</span>
                  <span>📞 +91 98976 33716</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
              <button
                onClick={loadRiderData}
                title="Refresh Orders"
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-all border border-stone-200 flex items-center gap-1 text-xs font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Fallback selector if more than 1 rider ever exists */}
          {riders.length > 1 && (
            <div className="py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl my-3 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-600">Active Rider Account:</span>
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="bg-white text-stone-800 text-xs font-bold px-3 py-1 rounded-lg border border-stone-300 focus:outline-hidden"
              >
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Earnings Stats */}
          <div className="grid grid-cols-3 gap-2.5 text-center pt-3.5">
            <div className="bg-orange-50/70 p-3 rounded-2xl border border-orange-100 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-orange-700 block">
                Completed
              </span>
              <span className="text-xl font-black text-orange-950">
                {todayCompletedCount}
              </span>
              <span className="text-[9px] text-orange-600/80 font-medium block mt-0.5">Orders Today</span>
            </div>

            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Today Earning
              </span>
              <span className="text-xl font-black text-emerald-900">
                ₹{todayEarnings}
              </span>
              <span className="text-[9px] text-emerald-600/80 font-medium block mt-0.5">₹40 / delivery</span>
            </div>

            <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">
                Cash in Hand
              </span>
              <span className="text-xl font-black text-amber-950">
                ₹{codCollectedTotal}
              </span>
              <span className="text-[9px] text-amber-600/80 font-medium block mt-0.5">COD to Deposit</span>
            </div>
          </div>
        </div>

        {/* Section: Active Assigned Deliveries */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>Active Assigned Orders</span>
              <span className="bg-orange-600 text-white text-[10px] px-2 py-0.2 rounded-full font-black">
                {activeOrders.length}
              </span>
            </h3>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <Bike className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">No active delivery right now</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Orders assigned by Sandwich Adda kitchen will ring here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => {
                const isPickedUp = ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border-2 border-orange-500 shadow-md relative overflow-hidden"
                  >
                    {/* Top alert pill */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                      <div>
                        <span className="text-base font-black text-gray-900">
                          {order.orderNumber}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-orange-600 block">
                          ₹{order.totalAmount}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          order.paymentMethod === 'COD' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.paymentMethod === 'COD' ? '💰 COD (Collect Cash)' : '💳 UPI Paid'}
                        </span>
                      </div>
                    </div>

                    {/* Step 1: Pickup from Kitchen Location */}
                    <div className="p-3 bg-gray-50 rounded-xl mb-3 border border-gray-100">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">
                            Pickup Point
                          </p>
                          <p className="text-xs font-black text-gray-900">
                            Sandwich Adda Kitchen
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Shop 4, Rohta Road, Meerut (Hot Pack Ready)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Deliver to Customer Location */}
                    <div className="p-3 bg-orange-50/50 rounded-xl mb-4 border border-orange-100">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
                          2
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-orange-800 uppercase">
                            Deliver To Customer
                          </p>
                          <p className="text-xs font-black text-gray-900">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-gray-700 font-medium">
                            {order.houseNo ? `${order.houseNo}, ` : ''}{order.deliveryAddress}
                          </p>
                          {order.landmark && (
                            <p className="text-[11px] text-gray-500">
                              Landmark: {order.landmark}
                            </p>
                          )}
                          {order.instructions && (
                            <p className="text-xs text-orange-600 font-bold mt-1 bg-white p-1.5 rounded-lg border border-orange-200">
                              ⚠️ Note: "{order.instructions}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Communication & Navigation Buttons */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-orange-200/60">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center justify-center gap-1 py-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${order.customerPhone}?text=Hello%20${order.customerName},%20I%20am%20your%20Sandwich%20Adda%20delivery%20partner.%20I%20am%20reaching%20your%20location.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 py-2 bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress + ' Meerut')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-1 py-2 bg-white text-orange-800 hover:bg-orange-50 border border-orange-200 rounded-xl text-xs font-bold transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5 text-orange-600" />
                          <span>Map</span>
                        </a>
                      </div>
                    </div>

                    {/* Rider Action Flow: Assigned -> Picked Up -> Out for Delivery -> Delivered */}
                    {order.status === 'RIDER_ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'PICKED_UP')}
                        className="w-full py-3 bg-stone-900 hover:bg-stone-800 active:scale-98 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        <span>Confirm Pickup from Kitchen 🥪</span>
                      </button>
                    )}

                    {isPickedUp && (
                      <div className="space-y-2 mb-3">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=Shop+No+4+Rohta+Road+Meerut&destination=${encodeURIComponent(order.deliveryAddress + ' Meerut')}&travelmode=two_wheeler`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Start Google Maps Driving Navigation 🗺️</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => startDriveSimulation(order.id)}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                            simulatingOrderId === order.id
                              ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse'
                              : 'bg-stone-800 text-stone-200 hover:bg-stone-700 border-stone-700'
                          }`}
                        >
                          <Bike className="w-3.5 h-3.5 text-orange-400" />
                          <span>{simulatingOrderId === order.id ? '📡 Broadcasting Live GPS (Bike Moving)...' : '🛵 Broadcast Live GPS to Customer Map'}</span>
                        </button>
                      </div>
                    )}

                    {order.status === 'PICKED_UP' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                        className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-md shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Bike className="w-4 h-4" />
                        <span>Start Delivery (Out for Delivery 🛵)</span>
                      </button>
                    )}

                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => {
                          setOtpOrder(order);
                          setOtpInput('');
                          setOtpError('');
                        }}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Enter Customer OTP & Deliver 🔐</span>
                      </button>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Completed Deliveries History */}
        <div>
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2 px-1">
            Completed Today ({completedOrders.length})
          </h3>

          {completedOrders.length === 0 ? (
            <p className="text-xs text-gray-400 italic px-1">No completed deliveries yet today.</p>
          ) : (
            <div className="space-y-2">
              {completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-xl p-3.5 border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">{ord.orderNumber}</span>
                      <p className="text-[11px] text-gray-500">
                        {ord.customerName} • {ord.paymentMethod === 'COD' ? `COD ₹${ord.totalAmount}` : 'UPI Paid'}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +₹40 Earned
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ------------------- MODAL: OTP VERIFICATION & COD CONFIRMATION ------------------- */}
      {otpOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                🔐
              </div>
              <h3 className="text-base font-black text-gray-900">
                Customer Delivery OTP
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ask customer {otpOrder.customerName} for their 4-digit code
              </p>
            </div>

            {/* COD Reminder if applicable */}
            {otpOrder.paymentMethod === 'COD' && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Cash to Collect:
                </span>
                <span className="text-2xl font-black text-amber-950">
                  ₹{otpOrder.totalAmount}
                </span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="w-full text-center text-3xl font-black tracking-widest py-3 border-2 border-orange-500 rounded-2xl bg-orange-50/30 focus:outline-hidden focus:ring-4 focus:ring-orange-500/20"
                />
              </div>

              {otpError && (
                <p className="text-xs font-bold text-red-600 text-center">
                  {otpError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpOrder(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || otpInput.length !== 4}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl font-black text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm Delivery ✅'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
