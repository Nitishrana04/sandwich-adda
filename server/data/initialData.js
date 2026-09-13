export const initialData = {
  settings: {
    storeName: "Sandwich Adda",
    tagline: "Good Food • Local Delivery • Always Fresh",
    subTagline: "Sandwiches Made for Your Cravings",
    phone: "+91 98976 33716",
    email: "nitishranajaat@gmail.com",
    address: "Shop No. 4, Main Rohta Road, Near Central Market, Meerut, UP 250002",
    upiId: "9897633716@upi",
    overrideMode: "OPEN", // "OPEN", "CLOSED", "AUTO"
    schedule: {
      days: ["Saturday", "Sunday"],
      openTime: "17:00",
      closeTime: "22:00",
      label: "Saturday & Sunday: 5:00 PM – 10:00 PM"
    },
    storeNotice: "📍 Currently delivering only in Rohta Road, Meerut • Pure Butter Grilling 🧈",
    deliveryAreaNotice: "We deliver only in Rohta Road, Meerut. Orders outside this area will not be accepted.",
    deliveryFee: 30,
    freeDeliveryAbove: 249,
    minOrderAmount: 79,
    riderFeePerOrder: 40
  },
  menu: [
    {
      id: "menu_1",
      name: "Veg Grilled Sandwich",
      category: "Veg",
      price: 79,
      originalPrice: 89,
      description: "Fresh veggies, cheese & special sauce grilled to golden perfection in fresh butter.",
      image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "8-10 mins",
      rating: 4.7,
      ratingCount: 180
    },
    {
      id: "menu_2",
      name: "Cheese Veg Sandwich",
      category: "Cheese",
      price: 99,
      originalPrice: 119,
      description: "Loaded with cheese & fresh veggies with secret chatpata spice blend.",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "8-10 mins",
      rating: 4.8,
      ratingCount: 290
    },
    {
      id: "menu_3",
      name: "Paneer Sandwich",
      category: "Paneer",
      price: 109,
      originalPrice: 129,
      description: "Soft paneer, fresh vegetables, cheese and special sauce grilled to perfection.",
      image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "10-12 mins",
      rating: 4.8,
      ratingCount: 120
    },
    {
      id: "menu_4",
      name: "Cheese Paneer Sandwich",
      category: "Paneer",
      price: 129,
      originalPrice: 149,
      description: "Double cheese, double taste. Loaded malai paneer with overflowing gooey mozzarella.",
      image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "10-12 mins",
      rating: 4.9,
      ratingCount: 340
    },
    {
      id: "menu_5",
      name: "Corn & Cheese Burst Sandwich",
      category: "Cheese",
      price: 119,
      originalPrice: 139,
      description: "Sweet American golden corn tossed in creamy cheese mayo, sprinkled with oregano & chilli flakes, bursting with gooey mozzarella in every single bite.",
      image: "https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "10-12 mins",
      rating: 4.9,
      ratingCount: 285
    },
    {
      id: "menu_4",
      name: "Tandoori Paneer Supreme Sandwich",
      category: "Grilled Sandwiches",
      price: 129,
      originalPrice: 149,
      description: "Smoky tandoori paneer slices with bell peppers, spicy schezwan touch, sliced jalapenos and chipotle mayo dressing.",
      image: "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "12-15 mins",
      rating: 4.9,
      ratingCount: 240
    },
    {
      id: "menu_5",
      name: "Bombay Masala Aloo Toast",
      category: "Grilled Sandwiches",
      price: 79,
      originalPrice: 89,
      description: "Traditional spicy potato masala stuffed with sliced beetroot, onions, tomatoes, and generous nylon sev & fresh coriander with garlic dip.",
      image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "8-10 mins",
      rating: 4.7,
      ratingCount: 165
    },
    {
      id: "menu_6",
      name: "Triple Decker Club Sandwich",
      category: "Cheese Loaded",
      price: 149,
      originalPrice: 179,
      description: "Three layers of toasted buttered jumbo bread filled with layered cheese slices, paneer tikka, fresh veggies, potato crisps & special garlic mayo dip.",
      image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "12-15 mins",
      rating: 4.9,
      ratingCount: 310
    },
    {
      id: "menu_7",
      name: "Italian Pizza Grilled Sandwich",
      category: "Cheese Loaded",
      price: 129,
      originalPrice: 149,
      description: "Authentic marinara sauce, mozzarella cheese, black olives, sweet corn, jalapenos, and bell peppers grilled crisp like a pocket pizza.",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "10-12 mins",
      rating: 4.8,
      ratingCount: 198
    },
    {
      id: "menu_8",
      name: "Nutella Chocolate Hazelnut Toast",
      category: "Cheese Loaded",
      price: 99,
      originalPrice: 119,
      description: "Warm grilled bread stuffed with thick premium Nutella, roasted hazelnuts, dark chocolate chips & crushed almonds.",
      image: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: false,
      isAvailable: true,
      prepTime: "6-8 mins",
      rating: 4.9,
      ratingCount: 220
    },
    {
      id: "menu_9",
      name: "Adda Combo 1: Veg Grilled + Chilled Thums Up",
      category: "Special Adda Combos",
      price: 129,
      originalPrice: 159,
      description: "1x Crisp Veg Grilled Sandwich served with 1x Thums Up / Coke (250ml can) & fresh mint coriander dip.",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "10 mins",
      rating: 4.9,
      ratingCount: 450
    },
    {
      id: "menu_10",
      name: "Adda Combo 2: Paneer Grilled + Cheese Corn Sandwich",
      category: "Special Adda Combos",
      price: 199,
      originalPrice: 249,
      description: "Our top 2 bestselling sandwiches in one unbeatable party box! Serves 2 hungry sandwich lovers.",
      image: "https://images.unsplash.com/photo-1621800043295-a73fe2f76e2c?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "15 mins",
      rating: 5.0,
      ratingCount: 520
    },
    {
      id: "menu_11",
      name: "Peri Peri Crispy French Fries",
      category: "Beverages & Sides",
      price: 79,
      originalPrice: 99,
      description: "Golden crispy potato fries tossed in fiery African peri-peri spice blend, served hot with creamy garlic dip.",
      image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "8 mins",
      rating: 4.8,
      ratingCount: 310
    },
    {
      id: "menu_12",
      name: "Thick Chocolate Cold Coffee",
      category: "Beverages & Sides",
      price: 89,
      originalPrice: 109,
      description: "Rich espresso blend, chilled full-cream milk, vanilla ice-cream scoop and dark chocolate fudge drizzle.",
      image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80",
      isVeg: true,
      isBestseller: true,
      isAvailable: true,
      prepTime: "5 mins",
      rating: 4.9,
      ratingCount: 390
    }
  ],
  riders: [
    {
      id: "rider_1",
      name: "Rana Bhai (Nitish Rana)",
      phone: "9897633716",
      vehicle: "Hero Splendor Plus (UP-15-AB-3371)",
      status: "AVAILABLE",
      avatar: "",
      totalDeliveries: 142,
      rating: 4.9,
      activeOrderId: null,
      todayEarnings: 480
    }
  ],
  coupons: [
    {
      code: "WEEKEND20",
      discountType: "PERCENT",
      discountValue: 20,
      minOrder: 199,
      description: "20% instant discount on weekend orders above ₹199"
    },
    {
      code: "FIRSTADDA",
      discountType: "FLAT",
      discountValue: 50,
      minOrder: 199,
      description: "Flat ₹50 OFF on your first order"
    },
    {
      code: "FREEDEL",
      discountType: "DELIVERY",
      discountValue: 30,
      minOrder: 149,
      description: "Free Delivery on orders above ₹149"
    },
    {
      code: "CHEESE50",
      discountType: "FLAT",
      discountValue: 50,
      minOrder: 299,
      description: "Flat ₹50 OFF on orders above ₹299"
    }
  ],
  users: [
    {
      id: "usr_admin",
      email: "nitishranajaat@gmail.com",
      phone: "9897633716",
      username: "admin",
      password: "admin123",
      name: "Nitish Rana (Admin)",
      role: "ADMIN"
    },
    {
      id: "usr_rider_1",
      riderId: "rider_1",
      email: "ranabhainr@gmail.com",
      phone: "9897633716",
      password: "rider123",
      pin: "1234",
      name: "Rana Bhai (Delivery Partner)",
      role: "RIDER"
    },
    {
      id: "usr_rider_2",
      riderId: "rider_2",
      phone: "9876543210",
      password: "rider123",
      pin: "1234",
      name: "Amit Kumar",
      role: "RIDER"
    },
    {
      id: "usr_cust_1",
      phone: "9897633716",
      name: "Mohit Choudhary",
      password: "1234",
      address: "Flat 204, Ganga Heights, Rohta Road, Meerut",
      role: "CUSTOMER",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "usr_cust_2",
      phone: "9811122233",
      name: "Priya Singh",
      password: "priya123",
      address: "House 12, Near Subhash Nagar, Rohta Road, Meerut",
      role: "CUSTOMER",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  orders: [
    {
      id: "ord_real_1027",
      orderNumber: "#SA1027",
      customerId: "usr_cust_1",
      customerName: "Mohit Choudhary",
      customerPhone: "9897633716",
      deliveryAddress: "Flat 204, Ganga Heights, Rohta Road, Meerut",
      houseNo: "Flat 204",
      landmark: "Near Shiv Temple",
      instructions: "Please send extra green chutney and napkins.",
      items: [
        {
          id: "menu_1",
          name: "Paneer Tikka Grilled Sandwich",
          price: 109,
          quantity: 2,
          image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "menu_11",
          name: "Peri Peri Crispy French Fries",
          price: 79,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80"
        }
      ],
      subtotal: 297,
      deliveryFee: 0,
      discount: 50,
      totalAmount: 247,
      couponCode: "FIRSTADDA",
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "PREPARING",
      deliveryOtp: "5914",
      assignedRiderId: "rider_1",
      assignedRiderName: "Rana Bhai (Lead Delivery)",
      createdAt: new Date(Date.now() - 600000).toISOString(),
      statusHistory: [
        { status: "PLACED", time: new Date(Date.now() - 600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Order placed successfully via Cash on Delivery" },
        { status: "ACCEPTED", time: new Date(Date.now() - 480000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Sandwich Adda kitchen accepted order" },
        { status: "PREPARING", time: new Date(Date.now() - 240000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Chef grilling fresh sandwiches in Amul butter 👨‍🍳" }
      ]
    },
    {
      id: "ord_real_1026",
      orderNumber: "#SA1026",
      customerId: "usr_cust_2",
      customerName: "Priya Singh",
      customerPhone: "9811122233",
      deliveryAddress: "House 12, Near Subhash Nagar, Rohta Road, Meerut",
      houseNo: "House 12",
      landmark: "Opposite Mother Dairy",
      instructions: "Call when you reach gate.",
      items: [
        {
          id: "menu_3",
          name: "Corn & Cheese Burst Sandwich",
          price: 119,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=600&auto=format&fit=crop&q=80"
        },
        {
          id: "menu_12",
          name: "Thick Chocolate Cold Coffee",
          price: 89,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80"
        }
      ],
      subtotal: 208,
      deliveryFee: 30,
      discount: 41,
      totalAmount: 197,
      couponCode: "WEEKEND20",
      paymentMethod: "UPI",
      paymentStatus: "PAID",
      status: "DELIVERED",
      deliveryOtp: "8312",
      assignedRiderId: "rider_1",
      assignedRiderName: "Rana Bhai (Lead Delivery)",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      deliveredAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      statusHistory: [
        { status: "PLACED", time: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Order placed with Instant UPI payment" },
        { status: "ACCEPTED", time: new Date(Date.now() - 3600000 * 1.8).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Kitchen accepted order" },
        { status: "PREPARING", time: new Date(Date.now() - 3600000 * 1.6).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Chef grilled fresh cheese corn sandwich" },
        { status: "READY_FOR_PICKUP", time: new Date(Date.now() - 3600000 * 1.5).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Order packed hot in foil box" },
        { status: "RIDER_ASSIGNED", time: new Date(Date.now() - 3600000 * 1.4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Assigned to Rana Bhai" },
        { status: "PICKED_UP", time: new Date(Date.now() - 3600000 * 1.3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Rider picked up from kitchen" },
        { status: "OUT_FOR_DELIVERY", time: new Date(Date.now() - 3600000 * 1.25).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Rider en route to delivery address" },
        { status: "DELIVERED", time: new Date(Date.now() - 3600000 * 1.2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Delivered safely! OTP 8312 verified." }
      ]
    },
    {
      id: "ord_real_1025",
      orderNumber: "#SA1025",
      customerId: "usr_cust_3",
      customerName: "Aman Varma",
      customerPhone: "9822334455",
      deliveryAddress: "Flat 102, Shivalik Residency, Rohta Road, Meerut",
      houseNo: "Flat 102",
      landmark: "Near Kalka Dental College Bypass",
      instructions: "Ring bell once.",
      items: [
        {
          id: "menu_10",
          name: "Adda Combo 2: Paneer Grilled + Cheese Corn Sandwich",
          price: 199,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1621800043295-a73fe2f76e2c?w=600&auto=format&fit=crop&q=80"
        }
      ],
      subtotal: 199,
      deliveryFee: 30,
      discount: 0,
      totalAmount: 229,
      couponCode: null,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      status: "DELIVERED",
      deliveryOtp: "4190",
      assignedRiderId: "rider_2",
      assignedRiderName: "Amit Kumar",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      deliveredAt: new Date(Date.now() - 3600000 * 3.3).toISOString(),
      statusHistory: [
        { status: "PLACED", time: new Date(Date.now() - 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Order placed via COD" },
        { status: "ACCEPTED", time: new Date(Date.now() - 3600000 * 3.8).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Kitchen accepted order" },
        { status: "DELIVERED", time: new Date(Date.now() - 3600000 * 3.3).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: "Delivered safely! OTP 4190 verified. ₹229 cash collected." }
      ]
    }
  ]
};
