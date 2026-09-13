import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import * as db from './db.js';

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
