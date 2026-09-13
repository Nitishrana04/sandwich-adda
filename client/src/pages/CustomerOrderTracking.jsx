import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Phone, MapPin, Bike, ChefHat, Package, Check, ArrowLeft, RefreshCw, KeyRound, AlertCircle, FileText, Printer, Navigation, ShieldCheck } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useCart } from '../context/CartContext';
import LiveDeliveryMap from '../components/LiveDeliveryMap';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn('Map rendering caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-stone-900 text-white p-5 rounded-3xl mb-6 text-center border border-stone-800">
          <p className="text-sm font-bold text-orange-400">🛵 Live Express Delivery</p>
          <p className="text-xs text-stone-300 mt-1">Delivery Partner is on the way to your delivery address.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CustomerOrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, latestEvent } = useSocket();
  const { addToCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [liveRiderLocation, setLiveRiderLocation] = useState(null);

  const getMapProgress = (status) => {
    switch (status) {
      case 'PLACED':
      case 'ACCEPTED':
      case 'PREPARING':
        return 12;
      case 'READY_FOR_PICKUP':
        return 28;
      case 'RIDER_ASSIGNED':
        return 48;
      case 'PICKED_UP':
        return 68;
      case 'OUT_FOR_DELIVERY':
        return 88;
      case 'DELIVERED':
        return 100;
      default:
        return 10;
    }
  };

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Order not found');
      } else {
        setOrder(data);
      }
    } catch (err) {
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    if (socket) {
      socket.emit('join:order', id);
    }
  }, [id, socket]);

  // Handle live socket updates
  useEffect(() => {
    if (latestEvent?.type === 'ORDER_UPDATED' && (latestEvent.data.id === id || latestEvent.data.orderNumber === id)) {
      setOrder(latestEvent.data);
    }
  }, [latestEvent, id]);

  // Handle live real-time GPS coordinates streamed from rider
  useEffect(() => {
    if (!socket) return;
    const handleRiderLocation = (loc) => {
      if (loc && (loc.orderId === id || loc.orderId === order?.id || loc.orderId === order?.orderNumber)) {
        setLiveRiderLocation(loc);
      }
    };
    socket.on('order:rider_location', handleRiderLocation);
    return () => {
      socket.off('order:rider_location', handleRiderLocation);
    };
  }, [socket, id, order]);

  const stages = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'ACCEPTED', label: 'Order Accepted', icon: CheckCircle2 },
    { key: 'PREPARING', label: 'Preparing', icon: ChefHat },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: Package },
    { key: 'RIDER_ASSIGNED', label: 'Rider Assigned', icon: Bike },
    { key: 'PICKED_UP', label: 'Picked Up', icon: Bike },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike },
    { key: 'DELIVERED', label: 'Delivered', icon: Check }
  ];

  const getStageIndex = (status) => {
    const idx = stages.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const handleReorder = () => {
    if (!order) return;
    order.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: true
      });
    });
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl text-center border border-gray-200">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-black text-gray-900">Order Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">{error || 'Could not locate order details.'}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold">
          Go to Home
        </Link>
      </div>
    );
  }

  const currentStageIndex = getStageIndex(order.status);
  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                Order {order.orderNumber}
              </h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                isDelivered ? 'bg-emerald-100 text-emerald-800' :
                isCancelled ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800 animate-pulse'
              }`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold transition-colors shadow-xs"
            title="View & Print Official Bill"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span className="hidden sm:inline">Tax Invoice</span>
          </button>

          <button
            onClick={fetchOrder}
            title="Refresh Status"
            className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors shadow-xs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prominent OTP Delivery Box */}
      {!isDelivered && !isCancelled && (
        <div className="mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 rounded-2xl shadow-lg shadow-orange-500/20 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-100">
                <KeyRound className="w-4 h-4" />
                Delivery Confirmation OTP
              </div>
              <p className="text-xs text-orange-100 mt-1 max-w-sm">
                Please share this 4-digit code with the delivery partner when they arrive at your location:
              </p>
            </div>

            <div className="bg-white text-orange-600 px-6 py-2.5 rounded-xl font-black text-2xl sm:text-3xl tracking-widest shadow-md text-center border-2 border-orange-200">
              {order.deliveryOtp}
            </div>
          </div>
        </div>
      )}

      {/* ------------------- INTERACTIVE LIVE REAL-TIME MAP (ROHTA ROAD & GOOGLE MAPS) ------------------- */}
      {!isCancelled && (
        <MapErrorBoundary>
          <LiveDeliveryMap order={order} liveLocation={liveRiderLocation} />
        </MapErrorBoundary>
      )}

      {/* Live Order Progress Stepper */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs mb-6">
        <h2 className="font-extrabold text-gray-900 text-sm mb-6 flex items-center justify-between">
          <span>Live Order Tracking</span>
          <span className="text-xs font-bold text-orange-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
            Real-time Updates
          </span>
        </h2>

        {isCancelled ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold text-center">
            ❌ This order was cancelled.
          </div>
        ) : (
          <div className="relative">
            {/* Stepper items */}
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {stages.map((st, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const Icon = st.icon;

                return (
                  <div key={st.key} className="flex items-start gap-4 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 transition-all ${
                        isPassed
                          ? isCurrent
                            ? 'bg-orange-600 text-white ring-4 ring-orange-100 shadow-md scale-110'
                            : 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            isCurrent
                              ? 'text-orange-600'
                              : isPassed
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {st.label}
                        </h4>
                        {isCurrent && !isDelivered && (
                          <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                        {isPassed && !isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            ✓ Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Assigned Rider Card (if assigned) */}
      {order.assignedRiderName && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl text-blue-600">
              🛵
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Assigned Delivery Partner
              </p>
              <h3 className="text-sm font-extrabold text-gray-900">
                {order.assignedRiderName}
              </h3>
              <p className="text-xs text-gray-500">
                Fast & safe delivery to your doorstep
              </p>
            </div>
          </div>

          <a
            href={`tel:${order.assignedRiderPhone || '9897633716'}`}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors border border-blue-200"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        </div>
      )}

      {/* Order Activity Timeline */}
      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs mb-6">
          <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider mb-3">
            Activity Log
          </h3>
          <div className="space-y-2">
            {order.statusHistory.map((hist, i) => (
              <div key={i} className="flex items-start justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                <span className="text-gray-700 font-medium">{hist.note}</span>
                <span className="text-gray-400 font-bold ml-2 whitespace-nowrap">{hist.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details & Items Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs mb-6">
        <h3 className="font-extrabold text-gray-900 text-sm mb-3">
          Order Summary
        </h3>

        <div className="divide-y divide-gray-100 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="py-2.5 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="veg-badge">
                  <span className="veg-badge-dot"></span>
                </span>
                <span className="font-bold text-gray-900">
                  {item.name} <span className="text-gray-500">× {item.quantity}</span>
                </span>
              </div>
              <span className="font-extrabold text-gray-900">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Bill calculation */}
        <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3 text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-₹{order.discount}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm text-gray-900 pt-2 border-t border-gray-200">
            <span>Total Paid / Payable</span>
            <span className="text-orange-600">₹{order.totalAmount}</span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium pt-1">
            Payment Method: <strong className="text-gray-800">{order.paymentMethod}</strong> ({order.paymentStatus})
          </p>
        </div>

        {/* Delivery Address */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <p className="font-bold text-gray-900 mb-0.5">Delivery Destination:</p>
          <p>{order.customerName} ({order.customerPhone})</p>
          <p>{order.houseNo ? `${order.houseNo}, ` : ''}{order.deliveryAddress}</p>
          {order.landmark && <p className="text-gray-500">Landmark: {order.landmark}</p>}
          {order.instructions && <p className="text-orange-600 font-medium mt-1">Note: "{order.instructions}"</p>}
        </div>
      </div>

      {/* Quick Reorder CTA */}
      <div className="flex gap-3">
        <button
          onClick={handleReorder}
          className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reorder These Sandwiches 🔄</span>
        </button>
        <Link
          to="/"
          className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors"
        >
          Explore Menu
        </Link>
      </div>

      {/* ------------------- TAX INVOICE / DIGITAL BILL MODAL ------------------- */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 relative print:p-0 print:border-none print:shadow-none animate-in fade-in zoom-in duration-200">
            
            {/* Printable Area */}
            <div className="space-y-4 font-mono text-xs text-gray-800" id="tax-invoice-printable">
              
              {/* Header */}
              <div className="text-center pb-3 border-b-2 border-dashed border-gray-300">
                <span className="text-2xl">🥪</span>
                <h2 className="text-base font-black text-gray-900 tracking-tight font-sans mt-1">
                  SANDWICH ADDA
                </h2>
                <p className="text-[11px] text-gray-600 font-sans">
                  Good Food • Local Delivery • Always Fresh
                </p>
                <p className="text-[10px] text-gray-500 mt-1 font-sans">
                  Shop No. 4, Main Rohta Road, Near Central Market, Meerut
                </p>
                <p className="text-[10px] text-gray-500 font-sans">
                  FSSAI Lic. No: 22724921000341 • Ph: +91 98976 33716
                </p>
              </div>

              {/* Order & Customer Metadata */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pb-3 border-b border-gray-200">
                <div>
                  <p className="text-gray-500">Order ID:</p>
                  <p className="font-bold text-gray-900">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date & Time:</p>
                  <p className="font-bold text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Customer:</p>
                  <p className="font-bold text-gray-900">{order.customerName}</p>
                  <p className="text-gray-600">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Mode:</p>
                  <p className="font-bold text-emerald-700 uppercase">
                    {order.paymentMethod} ({order.paymentStatus})
                  </p>
                  {order.utrNumber && <p className="text-[10px] text-gray-500">UTR: {order.utrNumber}</p>}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-gray-300 pb-1 text-gray-500">
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 pr-2 font-medium">{item.name}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right font-bold">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary */}
              <div className="border-t-2 border-dashed border-gray-300 pt-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Packaging & Delivery:</span>
                  <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Coupon ({order.couponCode}):</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-gray-900 pt-2 border-t border-gray-300">
                  <span>GRAND TOTAL (INCL. TAXES):</span>
                  <span className="text-sm">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Barcode & Security Stamp */}
              <div className="pt-3 pb-1 text-center border-t border-gray-200">
                <div className="font-mono text-lg tracking-widest text-gray-400 select-none">
                  ||| | |||| || ||||| ||| ||||
                </div>
                <p className="text-[10px] text-gray-500 font-sans mt-1">
                  Thank you for dining with Sandwich Adda! ❤️
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified 100% Amul Butter Kitchen</span>
                </div>
              </div>

            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="mt-6 flex gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-black text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
