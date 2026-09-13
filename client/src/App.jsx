import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

import SingleLogin from './pages/SingleLogin';
import CustomerHome from './pages/CustomerHome';
import CustomerCart from './pages/CustomerCart';
import CustomerOrderTracking from './pages/CustomerOrderTracking';
import CustomerOrders from './pages/CustomerOrders';

import AdminDashboard from './pages/AdminDashboard';
import RiderPortal from './pages/RiderPortal';
import CustomerProfile from './pages/CustomerProfile';

function AppContent() {
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // 1. First: Show Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // 2. If user is NOT logged in: Show Single Login
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-gray-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Show Navbar only if user is logged in */}
      {user && <Navbar />}

      <div className="flex-1">
        <Routes>
          {/* Single Unified Login Flow */}
          <Route
            path="/login"
            element={
              user ? (
                user.role === 'ADMIN' ? <Navigate to="/admin" replace /> :
                user.role === 'RIDER' ? <Navigate to="/rider" replace /> :
                <Navigate to="/" replace />
              ) : (
                <SingleLogin />
              )
            }
          />

          {/* Admin Login Alias */}
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/rider/login" element={<Navigate to="/login" replace />} />

          {/* 1. 👤 Customer App Routes (Protected or Redirect to Login if not authenticated) */}
          <Route
            path="/"
            element={
              user ? (
                user.role === 'ADMIN' ? <Navigate to="/admin" replace /> :
                user.role === 'RIDER' ? <Navigate to="/rider" replace /> :
                <CustomerHome />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/cart"
            element={
              user ? <CustomerCart /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/orders"
            element={
              user ? <CustomerOrders /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/orders/:id"
            element={
              user ? <CustomerOrderTracking /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/profile"
            element={
              user ? <CustomerProfile /> : <Navigate to="/login" replace />
            }
          />

          {/* 2. 👨‍💼 Admin / Owner Dashboard (Strictly Protected for ADMIN) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 3. 🛵 Delivery Partner Portal (Strictly Protected for RIDER) */}
          <Route
            path="/rider"
            element={
              <ProtectedRoute requiredRole="RIDER">
                <RiderPortal />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
