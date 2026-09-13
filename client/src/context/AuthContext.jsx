import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('sa_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sa_auth_user');
    }
  }, [user]);

  // Single Unified Login (Admin, Delivery, Customer)
  const login = async (identifier, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Login failed' };
      }
      setUser(data.user);
      return { success: true, user: data.user, redirectUrl: data.redirectUrl };
    } catch (err) {
      return { success: false, message: 'Network error during login' };
    }
  };

  // Customer Register (Create Account for New Users)
  const registerCustomer = async ({ name, email, phone, password, address }) => {
    try {
      const res = await fetch('/api/auth/customer-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, address })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, message: data.message || 'Registration failed' };
      }
      setUser(data.user);
      return { success: true, user: data.user, redirectUrl: data.redirectUrl || '/' };
    } catch (err) {
      return { success: false, message: 'Network error during registration' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isRider = user?.role === 'RIDER';
  const isCustomer = user?.role === 'CUSTOMER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isRider,
        isCustomer,
        isAuthenticated,
        login,
        registerCustomer,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
