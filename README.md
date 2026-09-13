# 🥪 Sandwich Adda — Complete 3-in-1 Food Ordering Platform

Sandwich Adda is a modern, real-time food ordering ecosystem built specifically for cloud kitchens, cafes, and weekend restaurant operations (Saturday & Sunday, 5:00 PM – 10:00 PM).

---

## 📱 The 3 Connected Portals

| Portal | URL | Device Target | Description |
| :--- | :--- | :--- | :--- |
| **👤 Customer App** | `http://localhost:5000/` | Mobile / Desktop | Browse menu, customize sandwiches, apply coupons, select COD/UPI, and track live order progress with secret 4-digit OTP. |
| **👨‍💼 Admin Dashboard** | `http://localhost:5000/admin` | Desktop / Tablet | Real-time kitchen control center, audio chime alerts, 1-click status changers, menu manager, weekend schedule toggles, rider assignment, and sales analytics. |
| **🛵 Delivery Partner App** | `http://localhost:5000/rider` | Mobile (PWA) | Driver interface for order alerts, 1-click Google Maps navigation, phone/WhatsApp customer contact, OTP verification to complete deliveries, and COD cash tracker. |

---

## 🚀 How to Run

### Quick Start (Single Server — Port 5000)
The backend serves both the API, real-time WebSockets, and the bundled frontend on a single port:
```bash
# Navigate to server
cd server
node server.js
```
Open **`http://localhost:5000`** in your browser!

### Development Mode (with Hot Reloading)
To edit frontend code live with instant hot module replacement:
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend (Vite)
cd client
npm run dev
```
Vite will open at `http://localhost:3000` and automatically proxy all requests and WebSockets to `http://localhost:5000`.

---

## 🌟 Key Features Implemented

### 1. 👤 Customer Experience
* **Weekend Store Schedule Engine**:
  - Automatically adheres to Saturday & Sunday (5:00 PM – 10:00 PM).
  - Admin manual override toggle (`OPEN`, `CLOSED`, `AUTO`).
  - Clear banner indicating store status and next opening time.
* **Mouth-watering Menu**:
  - High-res sandwich photos, pure vegetarian badges (🟢), bestseller badges (⭐), and detailed ingredients.
  - Live search & category filters (*Grilled Sandwiches, Cheese Loaded, Special Adda Combos, Beverages & Sides*).
  - Dynamic Add to Cart with `- Qty +` counters.
* **Smart Checkout & Coupons**:
  - Preloaded coupon codes: `NEWUSER50` (₹50 OFF), `WEEKEND20` (20% OFF), `ADDAFREE` (Free delivery above ₹149).
  - Delivery details: Complete address, flat/house no., landmark, and custom notes (*"Call me when you reach gate"*).
  - Payment options: Cash on Delivery (COD) and Instant UPI.
* **Live 8-Stage Order Stepper & OTP**:
  - `Order Placed` → `Accepted` → `Preparing 👨‍🍳` → `Ready for Pickup 🥪` → `Rider Assigned 🛵` → `Picked Up` → `Out for Delivery` → `Delivered ✅`
  - Customer gets a prominent 4-digit OTP to show to the delivery boy upon arrival.
  - Reorder button to immediately re-add past favorites to cart.

### 2. 👨‍💼 Admin & Kitchen Dashboard
* **Audio Alerts**:
  - Real-time synthesized chime when new orders are placed (no external audio files needed).
* **Live Order Actions**:
  - `Accept Order`, `Reject`, `Start Preparing`, `Mark Ready for Pickup`, `Assign Rider`, `Cancel`.
* **Instant Menu Manager**:
  - Add/Edit sandwiches with photo URL, description, category, and price.
  - **1-Click Availability Toggle** (🟢 In Stock / 🔴 Out of Stock) that syncs instantly to customer devices.
* **Rider Settlement & COD**:
  - Tracks deliveries completed per rider, commissions earned (@ ₹40/order), and total COD cash in hand.
* **Sales Analytics**:
  - Today's revenue, active kitchen queue count, completed orders count, and top 5 bestsellers.

### 3. 🛵 Delivery Partner Portal
* **Smartphone-Optimized Interface**:
  - Buzzer notification when a delivery is assigned.
  - Pickup location details (Sandwich Adda kitchen).
  - Customer destination with 1-click **Call Customer**, **WhatsApp**, and **Google Maps Navigation**.
* **Pickup & Transit**:
  - Rider marks *"I've Picked Up from Kitchen 🥪"* to trigger the *Out for Delivery* status.
* **OTP Delivery Verification**:
  - Rider asks customer for their 4-digit code.
  - Enters OTP in modal — verified securely on server to prevent fraudulent delivery claims.
  - Displays COD collection prompt (*"Collect Cash: ₹258"*).
* **Daily Earnings Summary**:
  - Automatically calculates daily payout (@ ₹40/order) and COD cash balance.

---

## 🛠️ Tech Stack & Architecture
* **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, Web Audio API.
* **Backend**: Node.js, Express, Socket.io (real-time events).
* **Database**: Persistent JSON document store in `server/data/store.json` with automatic fallback and seed data.
