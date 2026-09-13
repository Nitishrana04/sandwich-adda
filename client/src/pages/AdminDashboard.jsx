import React, { useState, useEffect } from 'react';
import { 
  Store, ShoppingBag, Clock, Plus, Trash2, Edit, CheckCircle, XCircle, 
  Bike, AlertCircle, ChefHat, Package, Check, RefreshCw, DollarSign, Users, Flame, Tag, Power,
  Printer, Download, FileSpreadsheet, Target
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { sound } from '../utils/audio';

export default function AdminDashboard() {
  const { latestEvent } = useSocket();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', 'store', 'riders', 'reports', 'users'
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [riders, setRiders] = useState([]);
  const [storeStatus, setStoreStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status filter for orders
  const [orderFilter, setOrderFilter] = useState('ALL');

  // Modal states
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [showAssignRiderModal, setShowAssignRiderModal] = useState(null); // order object
  const [showAddRiderModal, setShowAddRiderModal] = useState(false);
  const [kotOrder, setKotOrder] = useState(null); // order for KOT print

  // Form states
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'Grilled Sandwiches',
    price: '',
    originalPrice: '',
    description: '',
    image: '',
    isVeg: true,
    isBestseller: false,
    prepTime: '10-12 mins'
  });

  const [riderForm, setRiderForm] = useState({
    name: '',
    phone: '',
    vehicle: 'Hero Splendor (UP-15-AB-1234)'
  });

  // Fetch all initial data
  const loadData = async () => {
    try {
      const [ordersRes, menuRes, ridersRes, statusRes, statsRes, usersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menu'),
        fetch('/api/riders'),
        fetch('/api/status'),
        fetch('/api/stats'),
        fetch('/api/admin/users')
      ]);

      const [ordersData, menuData, ridersData, statusData, statsData, usersData] = await Promise.all([
        ordersRes.json(),
        menuRes.json(),
        ridersRes.json(),
        statusRes.json(),
        statsRes.json(),
        usersRes.ok ? usersRes.json() : []
      ]);

      setOrders(ordersData);
      setMenu(menuData);
      setRiders(ridersData);
      setStoreStatus(statusData);
      setStats(statsData);
      setUsersList(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Listen to WebSocket events
  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.type === 'ORDER_NEW') {
      sound.playNewOrderChime();
      loadData();
    } else if (latestEvent.type === 'ORDER_UPDATED' || latestEvent.type === 'STORE_STATUS' || latestEvent.type === 'MENU_UPDATED') {
      loadData();
    }
  }, [latestEvent]);

  // --- ACTIONS ---

  const handleUpdateOrderStatus = async (orderId, newStatus, extra = {}) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...extra })
      });
      if (res.ok) {
        sound.playSuccess();
        loadData();
      }
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleToggleStoreMode = async (mode) => {
    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrideMode: mode })
      });
      const data = await res.json();
      setStoreStatus(data);
    } catch (err) {
      alert('Failed to update store mode');
    }
  };

  const handleToggleMenuAvailability = async (itemId) => {
    try {
      const res = await fetch(`/api/menu/${itemId}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Failed to toggle item availability');
    }
  };

  const handleDeleteMenuItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this sandwich from the menu?')) return;
    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    try {
      const url = editingMenuItem ? `/api/menu/${editingMenuItem.id}` : '/api/menu';
      const method = editingMenuItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuForm)
      });

      if (res.ok) {
        setShowAddMenuModal(false);
        setEditingMenuItem(null);
        setMenuForm({
          name: '',
          category: 'Grilled Sandwiches',
          price: '',
          originalPrice: '',
          description: '',
          image: '',
          isVeg: true,
          isBestseller: false,
          prepTime: '10-12 mins'
        });
        loadData();
      }
    } catch (err) {
      alert('Failed to save menu item');
    }
  };

  const handleAddRider = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riderForm)
      });
      if (res.ok) {
        setShowAddRiderModal(false);
        setRiderForm({ name: '', phone: '', vehicle: 'Hero Splendor (UP-15-AB-1234)' });
        loadData();
      }
    } catch (err) {
      alert('Failed to add rider');
    }
  };

  const handleAssignRiderSubmit = async (riderId) => {
    if (!showAssignRiderModal) return;
    await handleUpdateOrderStatus(showAssignRiderModal.id, 'RIDER_ASSIGNED', { riderId });
    setShowAssignRiderModal(null);
  };

  const exportToCsv = () => {
    if (!orders || orders.length === 0) {
      alert('No orders available to export.');
      return;
    }
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Address', 'Items', 'Subtotal', 'Delivery Fee', 'Discount', 'Total Amount', 'Payment Method', 'Payment Status', 'Status', 'Rider'];
    
    const rows = orders.map(o => [
      o.orderNumber,
      `"${new Date(o.createdAt).toLocaleString()}"`,
      `"${o.customerName || ''}"`,
      o.customerPhone,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${(o.items || []).map(i => `${i.name} x${i.quantity}`).join('; ')}"`,
      o.subtotal,
      o.deliveryFee,
      o.discount,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      `"${o.assignedRiderName || 'Unassigned'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sandwich_adda_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove user "${userName}"?`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        sound.playSuccess();
        loadData();
      } else {
        alert(data.message || 'Failed to remove user');
      }
    } catch (e) {
      alert('Network error while deleting user');
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'ACTIVE') return !['DELIVERED', 'CANCELLED'].includes(o.status);
    return o.status === orderFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        
        {/* Sleek Admin Operation Banner */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-gradient-to-tr from-stone-900 via-stone-800 to-orange-950 text-white rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-orange-500/30 shadow-sm">
                👨‍💼
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                    Sandwich Adda — Owner & Kitchen Operations
                  </h1>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  Rohta Road Kitchen Operations • Live Order Dispatch & Control Center
                </p>
              </div>
            </div>

            {/* Quick Store Open/Close Toggle */}
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-stone-500 px-2">
                Store Mode:
              </span>
              <button
                onClick={() => handleToggleStoreMode('OPEN')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  storeStatus?.overrideMode === 'OPEN'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                }`}
              >
                🟢 OPEN
              </button>
              <button
                onClick={() => handleToggleStoreMode('CLOSED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  storeStatus?.overrideMode === 'CLOSED'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                }`}
              >
                🔴 CLOSED
              </button>
              <button
                onClick={() => handleToggleStoreMode('AUTO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  storeStatus?.overrideMode === 'AUTO'
                    ? 'bg-amber-500 text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                }`}
                title="Follows Sat & Sun 5-10 PM schedule"
              >
                ⏰ AUTO (Sat-Sun)
              </button>
            </div>
          </div>
        </div>
        
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase mb-1">
                <span>Today's Sales</span>
                <span className="text-emerald-600">₹</span>
              </div>
              <p className="text-2xl font-black text-gray-900">
                ₹{stats.todaySales}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Total: ₹{stats.totalSales}
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase mb-1">
                <span>Active Orders</span>
                <ShoppingBag className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-2xl font-black text-orange-600">
                {stats.breakdown?.pending + stats.breakdown?.preparing + stats.breakdown?.ready + stats.breakdown?.outForDelivery}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Kitchen in motion
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase mb-1">
                <span>Delivered</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">
                {stats.breakdown?.delivered}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Completed orders
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase mb-1">
                <span>Total Customers</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {stats.totalCustomers}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Unique phone numbers
              </p>
            </div>

            {/* Weekend Target Revenue Gauge */}
            <div className="col-span-2 sm:col-span-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white p-4 sm:p-5 rounded-2xl border border-stone-700 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-base">
                    🎯
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                      <span>Weekend Revenue Target</span>
                      <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                        Sat & Sun (5 PM – 10 PM)
                      </span>
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Target Goal: ₹10,000 for this weekend kitchen window
                    </p>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 self-end sm:self-auto">
                  <span className="text-base sm:text-lg font-black text-white">
                    ₹{stats.todaySales || 0}
                  </span>
                  <span className="text-xs text-stone-400">/ ₹10,000</span>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                    {Math.min(100, Math.round(((stats.todaySales || 0) / 10000) * 100))}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-stone-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(6, Math.round(((stats.todaySales || 0) / 10000) * 100)))}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Live Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'menu'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🥪 Menu Management ({menu.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('riders')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'riders'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Riders & COD Settlement</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'store'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Store Schedule & Timing</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>📊 Sales & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>👥 Users Manage ({usersList.length})</span>
          </button>

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportToCsv}
              title="Export all orders to CSV / Excel spreadsheet"
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={loadData}
              title="Reload Data"
              className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors shadow-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ------------------- TAB 1: LIVE ORDERS ------------------- */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4">
              {[
                { id: 'ALL', label: 'All Orders' },
                { id: 'ACTIVE', label: 'Active Kitchen Orders' },
                { id: 'PLACED', label: 'New Placed' },
                { id: 'ACCEPTED', label: 'Accepted' },
                { id: 'PREPARING', label: 'Preparing 👨‍🍳' },
                { id: 'READY_FOR_PICKUP', label: 'Ready 🥪' },
                { id: 'OUT_FOR_DELIVERY', label: 'On Delivery 🛵' },
                { id: 'DELIVERED', label: 'Delivered ✅' },
                { id: 'CANCELLED', label: 'Cancelled ❌' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    orderFilter === f.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h3 className="font-bold text-gray-700">No orders match this filter</h3>
                <p className="text-xs text-gray-400 mt-1">New incoming customer orders will appear automatically with a sound chime.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      
                      {/* Order Identity & Customer */}
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-gray-900 tracking-tight">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            order.status === 'READY_FOR_PICKUP' ? 'bg-purple-100 text-purple-800 font-extrabold' :
                            order.status === 'PREPARING' ? 'bg-amber-100 text-amber-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>

                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                            {order.paymentMethod} ({order.paymentStatus})
                          </span>

                          {/* Customer Delivery OTP (visible to admin too) */}
                          <span className="text-xs font-black bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                            OTP: {order.deliveryOtp}
                          </span>
                        </div>

                        <p className="text-xs text-gray-600 mt-1">
                          Customer: <strong className="text-gray-900">{order.customerName}</strong> ({order.customerPhone}) • 
                          <span className="text-gray-500 ml-1">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          📍 {order.houseNo ? `${order.houseNo}, ` : ''}{order.deliveryAddress}
                          {order.landmark && ` (Landmark: ${order.landmark})`}
                        </p>
                        {order.instructions && (
                          <p className="text-xs text-orange-600 font-bold mt-1">
                            ⚠️ Instructions: "{order.instructions}"
                          </p>
                        )}
                      </div>

                      {/* Financial Amount */}
                      <div className="flex items-baseline lg:flex-col lg:items-end gap-2">
                        <span className="text-xl font-black text-gray-900">
                          ₹{order.totalAmount}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} items
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="py-3 flex flex-wrap gap-2 border-b border-gray-100">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5"
                        >
                          <span className="veg-badge">
                            <span className="veg-badge-dot"></span>
                          </span>
                          <span className="font-bold text-gray-800">{item.name}</span>
                          <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Assigned Rider Indicator */}
                    {order.assignedRiderName && (
                      <div className="py-2 flex items-center gap-2 text-xs text-blue-700 bg-blue-50/70 px-3 rounded-lg mt-2 font-medium">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Assigned Rider: <strong>{order.assignedRiderName}</strong></span>
                      </div>
                    )}

                    {/* Kitchen Status Actions */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {order.status === 'PLACED' && (
                          <>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'ACCEPTED')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Accept Order
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED', { cancelReason: 'Rejected by store' })}
                              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {order.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1"
                          >
                            <ChefHat className="w-3.5 h-3.5" /> Start Preparing 👨‍🍳
                          </button>
                        )}

                        {order.status === 'PREPARING' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Package className="w-3.5 h-3.5" /> Mark Ready for Pickup 🥪
                          </button>
                        )}

                        {['READY_FOR_PICKUP', 'ACCEPTED', 'PREPARING'].includes(order.status) && !order.assignedRiderId && (
                          <button
                            onClick={() => setShowAssignRiderModal(order)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Bike className="w-3.5 h-3.5" /> Assign Rider 🛵
                          </button>
                        )}

                        {order.status === 'RIDER_ASSIGNED' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'PICKED_UP')}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors"
                          >
                            Mark Picked Up by Rider
                          </button>
                        )}

                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <span className="text-xs text-orange-600 font-bold">
                            🛵 On route to customer
                          </span>
                        )}

                        {order.status === 'DELIVERED' && (
                          <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                            <Check className="w-4 h-4" /> Delivered with OTP
                          </span>
                        )}

                        {/* KOT Print Button */}
                        <button
                          type="button"
                          onClick={() => setKotOrder(order)}
                          className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                          title="Print Kitchen Order Ticket (KOT)"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          <span>KOT</span>
                        </button>
                      </div>

                      {/* Cancel button for any non-final order */}
                      {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                        <button
                          onClick={() => {
                            const reason = prompt('Cancellation reason:');
                            if (reason) handleUpdateOrderStatus(order.id, 'CANCELLED', { cancelReason: reason });
                          }}
                          className="text-xs text-gray-400 hover:text-red-600 font-semibold"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------- TAB 2: MENU MANAGEMENT ------------------- */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Sandwich Menu Items
                </h2>
                <p className="text-xs text-gray-500">
                  Manage sandwiches, prices, ingredients, and toggle instant availability
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingMenuItem(null);
                  setMenuForm({
                    name: '',
                    category: 'Grilled Sandwiches',
                    price: '',
                    originalPrice: '',
                    description: '',
                    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
                    isVeg: true,
                    isBestseller: false,
                    prepTime: '10 mins'
                  });
                  setShowAddMenuModal(true);
                }}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add New Sandwich
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menu.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition-all ${
                    item.isAvailable ? 'border-gray-200 shadow-xs' : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="veg-badge">
                          <span className="veg-badge-dot"></span>
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-black text-gray-900">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">₹{item.originalPrice}</span>
                        )}
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    
                    {/* Instant Stock Availability Toggle */}
                    <button
                      onClick={() => handleToggleMenuAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {item.isAvailable ? 'In Stock (Available)' : 'Out of Stock'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMenuItem(item);
                          setMenuForm({
                            name: item.name,
                            category: item.category,
                            price: item.price,
                            originalPrice: item.originalPrice || '',
                            description: item.description,
                            image: item.image,
                            isVeg: item.isVeg,
                            isBestseller: item.isBestseller,
                            prepTime: item.prepTime || '10 mins'
                          });
                          setShowAddMenuModal(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                        title="Edit Item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------- TAB 3: RIDERS & COD ------------------- */}
        {activeTab === 'riders' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-gray-900">
                  Delivery Fleet & Settlement
                </h2>
                <p className="text-xs text-gray-500">
                  Track delivery partners, deliveries completed, payouts (@ ₹40/order), and cash collected
                </p>
              </div>

              <button
                onClick={() => setShowAddRiderModal(true)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Delivery Partner
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Rider</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Completed Deliveries</th>
                      <th className="p-4">COD Cash in Hand</th>
                      <th className="p-4">Rider Earnings (₹40/order)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {stats?.riderStats?.map((rider) => (
                      <tr key={rider.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-black">
                            🛵
                          </div>
                          <span>{rider.name}</span>
                        </td>
                        <td className="p-4 text-gray-600">{rider.phone}</td>
                        <td className="p-4 text-gray-600">Two-Wheeler</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            rider.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                            rider.status === 'ON_DELIVERY' ? 'bg-orange-100 text-orange-800 animate-pulse' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {rider.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-gray-900">{rider.totalDeliveries}</td>
                        <td className="p-4 font-black text-orange-600">₹{rider.codCollected}</td>
                        <td className="p-4 font-black text-emerald-600">₹{rider.earnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------- TAB 4: STORE SCHEDULE ------------------- */}
        {activeTab === 'store' && (
          <div className="max-w-2xl bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-gray-900">
                Sandwich Adda Store Operations
              </h2>
              <p className="text-xs text-gray-500">
                Operating timings, weekend schedule, and manual emergency toggles
              </p>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <div className="flex items-center gap-2 font-black text-orange-900 text-sm">
                <Clock className="w-5 h-5 text-orange-600" />
                <span>Default Weekly Schedule</span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-orange-950 font-medium">
                <div className="flex justify-between py-1 border-b border-orange-100">
                  <span>Monday — Friday:</span>
                  <span className="font-bold text-red-600">Closed (Prep Days)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-orange-100">
                  <span>Saturday:</span>
                  <span className="font-bold text-emerald-700">5:00 PM – 10:00 PM 🟢</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sunday:</span>
                  <span className="font-bold text-emerald-700">5:00 PM – 10:00 PM 🟢</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">
                Store Notice Banner (Visible to customers on top)
              </label>
              <input
                type="text"
                defaultValue={storeStatus?.settings?.storeNotice || ''}
                onBlur={async (e) => {
                  await fetch('/api/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storeNotice: e.target.value })
                  });
                  loadData();
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20"
              />
              <p className="text-[11px] text-gray-400">
                Click outside the box to save changes automatically.
              </p>
            </div>
          </div>
        )}

        {/* ------------------- TAB 5: REPORTS & ANALYTICS ------------------- */}
        {activeTab === 'reports' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
              <h3 className="font-black text-gray-900 text-sm mb-3">
                ⭐ Most Sold Sandwiches
              </h3>
              <div className="space-y-2">
                {stats.popularItems?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-gray-100">
                    <span className="font-bold text-gray-800">
                      {i + 1}. {item.name}
                    </span>
                    <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                      {item.count} sold
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
              <h3 className="font-black text-gray-900 text-sm mb-3">
                📦 Order Status Breakdown
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Pending / Kitchen Queued:</span>
                  <span className="font-bold">{stats.breakdown?.pending}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Currently Preparing:</span>
                  <span className="font-bold">{stats.breakdown?.preparing}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Ready for Pickup:</span>
                  <span className="font-bold">{stats.breakdown?.ready}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span>Out with Rider:</span>
                  <span className="font-bold">{stats.breakdown?.outForDelivery}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 text-emerald-600 font-bold">
                  <span>Completed & Delivered:</span>
                  <span>{stats.breakdown?.delivered}</span>
                </div>
                <div className="flex justify-between py-1.5 text-red-600 font-bold">
                  <span>Cancelled:</span>
                  <span>{stats.breakdown?.cancelled}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------- TAB 6: USERS MANAGEMENT ------------------- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-gray-900 text-sm sm:text-base flex items-center gap-2">
                  <span>👥</span>
                  <span>Registered Users & Role Management</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Securely stored accounts with backend-verified roles (Admin, Delivery, User)
                </p>
              </div>
              <span className="self-start sm:self-auto text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Total: {usersList.length} Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-black tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Email / Mobile Number</th>
                    <th className="p-3.5">Verified Role</th>
                    <th className="p-3.5">Saved Delivery Address</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => {
                    const isAdmin = u.role === 'ADMIN';
                    const isRider = u.role === 'RIDER';

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                              isAdmin ? 'bg-orange-100 text-orange-700' :
                              isRider ? 'bg-blue-100 text-blue-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {isAdmin ? '👑' : isRider ? '🛵' : '👤'}
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900">{u.name}</p>
                              <p className="text-[10px] text-gray-400">ID: {u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-gray-800">{u.email || 'No email'}</p>
                          <p className="text-gray-500">{u.phone ? `+91 ${u.phone}` : 'No phone'}</p>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            isAdmin ? 'bg-red-100 text-red-800 border border-red-200' :
                            isRider ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {u.role === 'ADMIN' ? '👑 ADMIN' : u.role === 'RIDER' ? '🛵 DELIVERY' : '👤 USER'}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-600 max-w-xs truncate">
                          {u.address || <span className="text-gray-400 italic">No saved address</span>}
                        </td>
                        <td className="p-3.5 text-right">
                          {isAdmin || isRider ? (
                            <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-md">
                              Protected System Account
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors"
                            >
                              Remove User
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ------------------- MODAL: ADD / EDIT MENU ITEM ------------------- */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-black text-gray-900 mb-4">
              {editingMenuItem ? 'Edit Sandwich Item' : 'Add New Sandwich'}
            </h3>

            <form onSubmit={handleSaveMenuItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Sandwich Name *</label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  placeholder="e.g. Cheese Corn Supreme"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={menuForm.price}
                    onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
                    placeholder="119"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={menuForm.originalPrice}
                    onChange={(e) => setMenuForm({ ...menuForm, originalPrice: e.target.value })}
                    placeholder="139"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={menuForm.category}
                  onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                >
                  <option value="Grilled Sandwiches">Grilled Sandwiches</option>
                  <option value="Cheese Loaded">Cheese Loaded</option>
                  <option value="Special Adda Combos">Special Adda Combos</option>
                  <option value="Beverages & Sides">Beverages & Sides</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description / Ingredients</label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  placeholder="Fresh paneer, capsicum, melted cheese..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={menuForm.isBestseller}
                    onChange={(e) => setMenuForm({ ...menuForm, isBestseller: e.target.checked })}
                    className="accent-orange-600 rounded"
                  />
                  <span>Mark as Bestseller ⭐</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black shadow-md transition-colors"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ASSIGN RIDER ------------------- */}
      {showAssignRiderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-black text-gray-900 mb-1">
              Assign Delivery Partner
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Select available rider for order {showAssignRiderModal.orderNumber}
            </p>

            <div className="space-y-2 mb-4">
              {riders.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleAssignRiderSubmit(r.id)}
                  className="w-full p-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                      🛵
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-900 group-hover:text-blue-700">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-gray-500">{r.vehicle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {r.status}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAssignRiderModal(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: ADD RIDER ------------------- */}
      {showAddRiderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-base font-black text-gray-900 mb-4">
              Add New Delivery Partner
            </h3>

            <form onSubmit={handleAddRider} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={riderForm.name}
                  onChange={(e) => setRiderForm({ ...riderForm, name: e.target.value })}
                  placeholder="e.g. Vikas Yadav"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={riderForm.phone}
                  onChange={(e) => setRiderForm({ ...riderForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 11223"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Vehicle Name & Plate</label>
                <input
                  type="text"
                  value={riderForm.vehicle}
                  onChange={(e) => setRiderForm({ ...riderForm, vehicle: e.target.value })}
                  placeholder="e.g. Bajaj Pulsar (UP-15-XY-9999)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddRiderModal(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-stone-900 text-white rounded-xl font-black"
                >
                  Add Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------- MODAL: CHEF KOT (KITCHEN ORDER TICKET) ------------------- */}
      {kotOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 print:p-0 print:border-none print:shadow-none animate-in fade-in zoom-in duration-200">
            
            {/* Printable KOT Area */}
            <div className="font-mono text-xs text-gray-900 space-y-3 pb-3 border-b-2 border-dashed border-gray-400">
              
              <div className="text-center pb-2 border-b border-gray-300">
                <p className="text-lg font-black tracking-wider uppercase font-sans">
                  KITCHEN ORDER TICKET
                </p>
                <p className="text-[11px] font-bold text-gray-600 font-sans">
                  Sandwich Adda • Hot Grill Line
                </p>
              </div>

              <div className="flex justify-between text-[11px] font-bold">
                <span>KOT #{kotOrder.orderNumber}</span>
                <span>{new Date(kotOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="text-[11px] pb-1 border-b border-gray-200">
                <p>Customer: <strong>{kotOrder.customerName}</strong> ({kotOrder.customerPhone})</p>
                <p>Type: <strong className="uppercase">{kotOrder.addressType || 'Delivery'}</strong></p>
              </div>

              {/* Items checklist */}
              <div className="py-2 space-y-2">
                <p className="font-sans font-black text-xs uppercase tracking-wide text-gray-500">
                  Item Checklist (Pure Butter):
                </p>
                {kotOrder.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between text-xs font-bold py-1 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border border-gray-400 rounded-sm inline-block"></span>
                      <span>{item.name}</span>
                    </div>
                    <span className="text-sm font-black bg-black text-white px-2 py-0.5 rounded-md">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Special Cooking Instructions */}
              {kotOrder.instructions && (
                <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 font-sans text-xs font-bold">
                  ⚠️ CHEF NOTE: "{kotOrder.instructions}"
                </div>
              )}

              <div className="pt-2 text-center text-[10px] text-gray-500 font-sans">
                *** FRESH GRILL ON ORDER ***
              </div>

            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setKotOrder(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-black text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Ticket</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
