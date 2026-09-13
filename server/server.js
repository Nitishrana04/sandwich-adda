import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import * as db from './db.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Attach io to request for route handlers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join room for specific order (customer tracking)
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`Socket ${socket.id} joined order room: order:${orderId}`);
  });

  // Join room for rider
  socket.on('join:rider', (riderId) => {
    socket.join(`rider:${riderId}`);
    console.log(`Socket ${socket.id} joined rider room: rider:${riderId}`);
  });

  // Join admin room
  socket.on('join:admin', () => {
    socket.join('admin_room');
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  // Real-time Rider GPS location streaming
  socket.on('rider:location_update', (data) => {
    if (data?.orderId) {
      io.to(`order:${data.orderId}`).emit('order:rider_location', data);
      io.emit('order:rider_location', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ------------------- API ROUTES -------------------

// 0. Authentication

// Single Unified Login (Admin, Delivery, or Customer)
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const result = db.unifiedLogin(identifier, password);
  if (!result.success) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  const result = db.authenticateAdmin(username, password);
  if (!result.success) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.post('/api/auth/rider-login', (req, res) => {
  const { identifier, pin } = req.body;
  const result = db.authenticateRider(identifier, pin);
  if (!result.success) {
    return res.status(401).json(result);
  }
  res.json(result);
});

app.post('/api/auth/customer-send-otp', (req, res) => {
  const { phone } = req.body;
  const result = db.sendCustomerOtp(phone);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/auth/customer-verify-otp', (req, res) => {
  const { phone, otp, name } = req.body;
  const result = db.verifyCustomerOtp(phone, otp, name);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/auth/customer-register', (req, res) => {
  const result = db.registerCustomer(req.body);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/auth/customer-login', (req, res) => {
  const { phone, password } = req.body;
  const result = db.authenticateCustomer(phone, password);
  if (!result.success) {
    return res.status(401).json(result);
  }
  res.json(result);
});

// 1. Store Status & Settings
app.get('/api/debug/db-status', async (req, res) => {
  if (req.query.retry === 'true') {
    await db.connectMongo();
  }
  res.json(db.getDbConnectionStatus());
});

app.get('/api/status', (req, res) => {
  try {
    const status = db.getStoreStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/status', (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    io.emit('store:status_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Menu Items
app.get('/api/menu', (req, res) => {
  try {
    const menu = db.getMenu();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', (req, res) => {
  try {
    const newItem = db.addMenuItem(req.body);
    io.emit('menu:updated', db.getMenu());
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/menu/:id', (req, res) => {
  try {
    const updated = db.updateMenuItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    io.emit('menu:updated', db.getMenu());
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  try {
    const success = db.deleteMenuItem(req.params.id);
    if (!success) return res.status(404).json({ error: 'Item not found' });
    io.emit('menu:updated', db.getMenu());
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/menu/:id/toggle', (req, res) => {
  try {
    const updated = db.toggleMenuAvailability(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    io.emit('menu:updated', db.getMenu());
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Orders
app.get('/api/orders', (req, res) => {
  try {
    const { status } = req.query;
    const orders = db.getOrders(status);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = db.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    // Check if store is open
    const status = db.getStoreStatus();
    if (!status.isOpen && req.body.force !== true) {
      return res.status(400).json({ 
        error: 'STORE_CLOSED', 
        message: 'Sandwich Adda is currently closed. ' + status.reason 
      });
    }

    const order = db.createOrder(req.body);
    
    // Broadcast real-time events
    io.emit('order:new', order);
    io.to('admin_room').emit('notification:new_order', {
      title: 'New Order Received! 🥪',
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      customerName: order.customerName,
      itemsCount: order.items.length
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  try {
    const { status, riderId, note, cancelReason } = req.body;
    const updatedOrder = db.updateOrderStatus(req.params.id, status, { riderId, note, cancelReason });
    
    if (!updatedOrder) return res.status(404).json({ error: 'Order not found' });

    // Emit live events to everyone and specifically to rooms
    io.emit('order:updated', updatedOrder);
    io.to(`order:${updatedOrder.id}`).emit('order:live_status', updatedOrder);

    if (riderId) {
      io.to(`rider:${riderId}`).emit('rider:order_assigned', updatedOrder);
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:id/verify-otp', (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required' });

    const result = db.verifyDeliveryOtp(req.params.id, otp);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    // Broadcast delivery completion
    io.emit('order:updated', result.order);
    io.to(`order:${result.order.id}`).emit('order:live_status', result.order);

    res.json({
      success: true,
      message: 'Order successfully verified and marked Delivered! ✅',
      order: result.order
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- RAZORPAY PAYMENT GATEWAY -------------------

// Helper to initialize Razorpay instance dynamically with env vars
function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    const error = new Error('Razorpay credentials missing in environment variables');
    error.statusCode = 500;
    throw error;
  }
  return new Razorpay({ key_id, key_secret });
}

// Get Razorpay Public Key ID (safe for frontend)
app.get('/api/razorpay/key', (req, res) => {
  res.json({
    success: true,
    key_id: process.env.RAZORPAY_KEY_ID || ''
  });
});

// STEP 1: Backend - Create Order
// Endpoint: POST /api/create-order
const handleCreateRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    const numericAmount = Number(amount);
    // Validate amount >= 100 paise
    if (!numericAmount || isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount. Minimum amount is 100 paise (₹1.00).'
      });
    }

    const rzp = getRazorpayClient();
    const options = {
      amount: Math.round(numericAmount),
      currency: currency || 'INR',
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      notes: notes || {}
    };

    const order = await rzp.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);

    // Handle auth failures (return 401)
    if (
      err.statusCode === 401 ||
      err.status === 401 ||
      (err?.error?.code === 'BAD_REQUEST_ERROR' && err?.error?.description?.toLowerCase().includes('auth'))
    ) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay authentication failed. Please check your API keys.'
      });
    }

    // Handle Razorpay API errors (return 500)
    return res.status(err.statusCode || 500).json({
      success: false,
      error: err.error?.description || err.message || 'Failed to create Razorpay order'
    });
  }
};

app.post('/api/create-order', handleCreateRazorpayOrder);
app.post('/api/razorpay/create-order', handleCreateRazorpayOrder);

// STEP 3: Backend - Verify Signature
// Endpoint: POST /api/verify-payment
const handleVerifyRazorpayPayment = (req, res) => {
  try {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.order_id;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;

    // Missing fields: return 400
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required payment verification fields: razorpay_order_id, razorpay_payment_id, razorpay_signature'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        verified: false,
        error: 'RAZORPAY_KEY_SECRET is not configured on the server'
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare generated signature with razorpay_signature
    if (generated_signature !== razorpay_signature) {
      // Signature mismatch: return 400, do NOT mark as paid
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed: Invalid signature mismatch'
      });
    }

    // Return success only if signatures match
    if (req.body.storeOrderId) {
      db.updateOrderPaymentStatus(req.body.storeOrderId, 'PAID', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (err) {
    console.error('Razorpay Signature Verification Error:', err);
    return res.status(500).json({
      success: false,
      verified: false,
      error: err.message || 'Payment verification failed due to internal error'
    });
  }
};

app.post('/api/verify-payment', handleVerifyRazorpayPayment);
app.post('/api/razorpay/verify-payment', handleVerifyRazorpayPayment);

// 4. Riders
app.get('/api/riders', (req, res) => {
  try {
    const riders = db.getRiders();
    res.json(riders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/riders/:id/orders', (req, res) => {
  try {
    const orders = db.getRiderOrders(req.params.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/riders', (req, res) => {
  try {
    const rider = db.addRider(req.body);
    io.emit('riders:updated', db.getRiders());
    res.status(201).json(rider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Coupons
app.get('/api/coupons', (req, res) => {
  try {
    const coupons = db.getCoupons();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/coupons/validate', (req, res) => {
  try {
    const { code, amount } = req.body;
    const result = db.validateCoupon(code, Number(amount) || 0);
    if (!result.valid) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Admin Analytics Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Users Management (Admin)
app.get('/api/admin/users', (req, res) => {
  try {
    const users = db.getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', (req, res) => {
  try {
    const result = db.deleteUser(req.params.id);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static frontend build in production if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexHtml = path.join(clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.status(404).send('Sandwich Adda Backend running. Start Vite client or run npm run build.');
  }
});

const PORT = process.env.PORT || 5000;
async function startServer() {
  await db.connectMongo();
  server.listen(PORT, () => {
    console.log(`🚀 Sandwich Adda Server running on http://localhost:${PORT}`);
    console.log(`🥪 Weekend Schedule: Saturday & Sunday, 5:00 PM – 10:00 PM IST`);
  });
}
startServer();
