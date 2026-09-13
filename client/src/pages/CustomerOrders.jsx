import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Clock, RefreshCw, CheckCircle, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        if (isAdmin) {
          setOrders(data);
        } else {
          const userPhone = (user?.phone || '').trim();
          const userId = user?.id;
          let placedIds = [];
          try {
            placedIds = JSON.parse(localStorage.getItem('sa_my_order_ids') || '[]');
          } catch (e) {}

          const myOrders = data.filter(
            (o) => (userPhone && o.customerPhone === userPhone) ||
                   (userId && o.customerId === userId) ||
                   placedIds.includes(o.id) ||
                   placedIds.includes(o.orderNumber)
          );
          setOrders(myOrders);
        }
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleReorder = (order) => {
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Your Orders</h1>
          <p className="text-xs text-gray-500 font-medium">
            Track active deliveries & reorder past favorites
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-5 h-32 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200/80 max-w-md mx-auto">
          <span className="text-5xl">🥪</span>
          <h3 className="mt-4 text-base font-bold text-gray-900">No past orders yet</h3>
          <p className="text-xs text-gray-500 mt-1">
            Order your first hot & crispy sandwich from Sandwich Adda today!
          </p>
          <Link
            to="/"
            className="mt-5 inline-block px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                <div>
                  <span className="text-sm font-black text-gray-900">
                    {order.orderNumber}
                  </span>
                  <p className="text-[11px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-gray-900 block">
                    ₹{order.totalAmount}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="py-2 text-xs text-gray-600 space-y-1">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <Link
                  to={`/orders/${order.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
                >
                  <span>Track Live Order</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => handleReorder(order)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reorder</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
