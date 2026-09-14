import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, RefreshCcw, Truck, Phone, Mail, MapPin } from 'lucide-react';

export default function LegalPolicies() {
  const [activeTab, setActiveTab] = useState('terms');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Sandwich Adda Policies & Contact</h1>
          <p className="text-xs text-gray-500 font-medium">
            Official business, legal, refund and delivery policies
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('terms')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'terms'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Terms & Conditions
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'privacy'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          Privacy Policy
        </button>

        <button
          onClick={() => setActiveTab('refund')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'refund'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Refund & Cancellation
        </button>

        <button
          onClick={() => setActiveTab('delivery')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'delivery'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Shipping & Delivery
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'contact'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          Contact Us
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs text-sm text-gray-700 leading-relaxed space-y-4">
        {activeTab === 'terms' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Terms & Conditions</h2>
            <p className="text-xs text-gray-400 mb-4">Last updated: September 2026</p>
            <div className="space-y-3">
              <p>Welcome to <strong>Sandwich Adda</strong> (accessible via <code>sandwichadda.site.je</code>). By placing an order or using our online food ordering platform, you agree to comply with and be bound by the following terms.</p>
              <h3 className="font-bold text-gray-900 pt-2">1. Order Placement & Acceptance</h3>
              <p>All orders placed via our website are subject to availability and kitchen operating hours. We reserve the right to decline or cancel an order in case of unforeseen circumstances such as item unavailability or operational issues.</p>
              <h3 className="font-bold text-gray-900 pt-2">2. Pricing and Payment</h3>
              <p>Prices for menu items are quoted in Indian Rupees (INR) and are inclusive of applicable taxes. Online payments are processed securely via authorized third-party payment gateways including Razorpay. We do not store any card or banking credentials on our servers.</p>
              <h3 className="font-bold text-gray-900 pt-2">3. User Information</h3>
              <p>Customers must provide accurate contact and delivery information (Name, Phone Number, Doorstep Address) to ensure prompt delivery.</p>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Privacy Policy</h2>
            <p className="text-xs text-gray-400 mb-4">Last updated: September 2026</p>
            <div className="space-y-3">
              <p>At <strong>Sandwich Adda</strong>, your privacy is of paramount importance to us. This policy outlines the types of personal data we collect and how we utilize and safeguard it.</p>
              <h3 className="font-bold text-gray-900 pt-2">1. Information We Collect</h3>
              <p>We collect essential order fulfillment information including your full name, 10-digit mobile number, delivery address, and geolocation coordinates only when you choose to pinpoint your delivery location.</p>
              <h3 className="font-bold text-gray-900 pt-2">2. Payment Data Security</h3>
              <p>All online financial transactions are encrypted using 256-bit SSL encryption via Razorpay. Sandwich Adda does not receive, view, or store your debit/credit card numbers, UPI PINs, or net banking passwords.</p>
              <h3 className="font-bold text-gray-900 pt-2">3. Contact for Privacy Inquiries</h3>
              <p>For any queries regarding your data or account deletion, contact us at <code>privacy@sandwichadda.site.je</code> or call +91 98976 33716.</p>
            </div>
          </div>
        )}

        {activeTab === 'refund' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Cancellation & Refund Policy</h2>
            <p className="text-xs text-gray-400 mb-4">Last updated: September 2026</p>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 pt-2">1. Order Cancellation</h3>
              <p>Customers can request cancellation of an order before the kitchen accepts or begins grilling the food (within 2 minutes of placement). Once an order is prepared or out for delivery with our delivery partner, cancellation is not permissible due to the perishable nature of freshly prepared food.</p>
              <h3 className="font-bold text-gray-900 pt-2">2. Refunds</h3>
              <p>In the unlikely event of an incorrect order, missing items, or cancellation by the merchant due to store closure, a 100% refund will be issued to the original source payment method (UPI, card, or netbanking) within 5–7 business days via our payment gateway (Razorpay).</p>
              <h3 className="font-bold text-gray-900 pt-2">3. How to Request a Refund</h3>
              <p>Please contact our support team immediately at <strong>+91 98976 33716</strong> with your order number (e.g. #SA1029).</p>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Shipping & Delivery Policy</h2>
            <p className="text-xs text-gray-400 mb-4">Last updated: September 2026</p>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 pt-2">1. Delivery Timeline</h3>
              <p>We provide hyper-local fast delivery across Rohta Road and surrounding areas in Meerut. Average preparation and delivery time is <strong>25 to 45 minutes</strong> from the time of order confirmation.</p>
              <h3 className="font-bold text-gray-900 pt-2">2. Delivery Charges</h3>
              <p>A nominal delivery fee of ₹30 is applicable on standard orders. Orders above ₹249 are eligible for <strong>FREE Delivery</strong>.</p>
              <h3 className="font-bold text-gray-900 pt-2">3. Delivery Confirmation OTP</h3>
              <p>To ensure secure delivery, each order includes a unique 4-digit OTP displayed on the tracking screen. Please share this code with the delivery partner upon arrival.</p>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-3">Contact Us & Store Details</h2>
            <p className="text-xs text-gray-400 mb-4">We are always happy to serve you delicious, cheesy sandwiches!</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/60">
                <div className="flex items-center gap-2 text-orange-700 font-bold mb-1">
                  <Phone className="w-4 h-4" />
                  Phone & WhatsApp
                </div>
                <p className="text-sm font-black text-gray-900">+91 98976 33716</p>
                <p className="text-xs text-gray-500 mt-0.5">Available during kitchen hours (5 PM - 10 PM)</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-stone-700 font-bold mb-1">
                  <Mail className="w-4 h-4" />
                  Email Support
                </div>
                <p className="text-sm font-black text-gray-900">support@sandwichadda.site.je</p>
                <p className="text-xs text-gray-500 mt-0.5">Response within 24 business hours</p>
              </div>

              <div className="sm:col-span-2 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 text-stone-700 font-bold mb-1">
                  <MapPin className="w-4 h-4" />
                  Physical Outlet Address
                </div>
                <p className="text-sm font-bold text-gray-900">
                  Shop No. 4, Main Rohta Road, Near Central Market, Meerut, Uttar Pradesh - 250002, India
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
