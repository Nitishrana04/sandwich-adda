import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerInfo, setCustomerInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_customer_info');
      return saved ? JSON.parse(saved) : {
        name: '',
        phone: '',
        address: '',
        houseNo: '',
        landmark: '',
        instructions: ''
      };
    } catch {
      return { name: '', phone: '', address: '', houseNo: '', landmark: '', instructions: '' };
    }
  });

  useEffect(() => {
    localStorage.setItem('sa_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('sa_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('sa_coupon');
    }
  }, [coupon]);

  useEffect(() => {
    localStorage.setItem('sa_customer_info', JSON.stringify(customerInfo));
  }, [customerInfo]);

  const addToCart = (product) => {
    const extrasKey = (product.selectedExtras || []).map(e => e.id).sort().join('_');
    const breadKey = product.selectedBread || 'white';
    const cartItemId = `${product.id}_${breadKey}_${extrasKey}`;
    const itemPrice = product.customizedPrice || product.price;
    const qtyToAdd = product.quantity || 1;

    setItems((prev) => {
      const existing = prev.find((i) => (i.cartItemId || i.id) === cartItemId);
      if (existing) {
        return prev.map((i) =>
          (i.cartItemId || i.id) === cartItemId
            ? { ...i, quantity: i.quantity + qtyToAdd }
            : i
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartItemId,
          price: itemPrice,
          quantity: qtyToAdd,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    setItems((prev) => {
      return prev
        .map((i) => {
          const itemId = i.cartItemId || i.id;
          if (itemId === id) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => (i.cartItemId || i.id) !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  // Pricing calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Delivery fee rules: ₹30, free above ₹249 or if coupon gives free delivery
  let deliveryFee = subtotal > 0 ? 30 : 0;
  if (subtotal >= 249) {
    deliveryFee = 0;
  }

  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'FLAT') {
      discount = coupon.discountValue;
    } else if (coupon.discountType === 'PERCENT') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
    } else if (coupon.discountType === 'DELIVERY') {
      deliveryFee = 0;
    }
    discount = Math.min(discount, subtotal);
  }

  const finalAmount = Math.max(0, subtotal + deliveryFee - discount);

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a coupon code' };
    }
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), amount: subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || 'Invalid coupon' };
      }
      setCoupon(data);
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: 'Error checking coupon' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemCount,
        subtotal,
        deliveryFee,
        discount,
        finalAmount,
        coupon,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        customerInfo,
        setCustomerInfo
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
