'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Analytics tracking
const trackEvent = (eventName: string, properties: Record<string, unknown> = {}) => {
  // Google Analytics tracking
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventName, properties);
  }
  
  // Custom analytics tracking
  console.log(`Analytics Event: ${eventName}`, properties);
  
  // Store in localStorage for offline tracking
  const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
  analytics.push({
    event: eventName,
    properties,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('analytics', JSON.stringify(analytics.slice(-100))); // Keep last 100 events
};

// Performance monitoring
const trackPerformance = (action: string, startTime: number) => {
  const duration = performance.now() - startTime;
  trackEvent('performance', { action, duration });
};

interface Tab {
  id: string;
  label: string;
  icon: string;
  content: React.ReactNode;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  estimatedCompletion?: string;
}

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  method?: string;
}

const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    title: 'Kitchen Sink Leak',
    description: 'Small leak under the kitchen sink, water pooling in cabinet',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-15',
    estimatedCompletion: '2024-01-20'
  },
  {
    id: '2',
    title: 'HVAC Filter Replacement',
    description: 'Air filter needs to be replaced for better air quality',
    status: 'completed',
    priority: 'low',
    createdAt: '2024-01-10',
    estimatedCompletion: '2024-01-12'
  },
  {
    id: '3',
    title: 'Light Fixture Repair',
    description: 'Living room light fixture not working properly',
    status: 'pending',
    priority: 'low',
    createdAt: '2024-01-18'
  }
];

const mockPayments: Payment[] = [
  {
    id: '1',
    amount: 4200,
    dueDate: '2024-01-01',
    status: 'paid',
    paidDate: '2024-01-01',
    method: 'Online Payment'
  },
  {
    id: '2',
    amount: 4200,
    dueDate: '2024-02-01',
    status: 'pending'
  },
  {
    id: '3',
    amount: 4200,
    dueDate: '2023-12-01',
    status: 'paid',
    paidDate: '2023-12-01',
    method: 'Online Payment'
  }
];

function TabSystem({ tabs, className = '' }: { tabs: Tab[]; className?: string }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    const startTime = performance.now();
    console.log('Tab clicked:', tabId);
    
    // Track tab navigation
    trackEvent('tab_navigation', { 
      from: activeTab, 
      to: tabId,
      user_id: 'john_smith'
    });
    
    setActiveTab(tabId);
    
    // Track performance
    trackPerformance('tab_switch', startTime);
    
    // Track completion
    trackEvent('tab_switch_complete', { 
      tab: tabId,
      duration: performance.now() - startTime
    });
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 cursor-pointer
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-white/20 border border-white/10'
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-[600px]"
        >
          {tabs.find(tab => tab.id === activeTab)?.content || (
            <div className="text-center text-white">
              <p>Loading {activeTab}...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DashboardTab() {
  const handleQuickAction = (action: string) => {
    const startTime = performance.now();
    console.log(`Quick action: ${action}`);
    
    // Track the button click
    trackEvent('button_click', { 
      location: 'dashboard', 
      action: action,
      user_id: 'john_smith' // In real app, get from auth
    });
    
    // Actually implement the actions instead of just logging
    switch (action) {
      case 'pay-rent':
        // Open payment modal or redirect to payments tab
        alert('Opening payment portal...\nRedirecting to Payments tab.');
        break;
        
      case 'new-maintenance':
        // Open maintenance request form or redirect to maintenance tab
        alert('Opening maintenance request form...\nRedirecting to Maintenance tab.');
        break;
        
      case 'view-documents':
        // Redirect to documents tab
        alert('Opening documents...\nRedirecting to Documents tab.');
        break;
        
      case 'contact-support':
        // Open contact modal or redirect to contact page
        alert('Contacting support...\nPhone: (555) 123-4567\nEmail: support@tbdproperty.com');
        break;
        
      case 'schedule-viewing':
        // Open scheduling modal
        alert('Scheduling viewing...\nPlease call (555) 123-4567 to schedule a property viewing.');
        break;
        
      case 'request-document':
        // Open document request form
        alert('Document request submitted! We\'ll get back to you within 24 hours.');
        break;
        
      case 'update-profile':
        // Open profile update modal
        alert('Opening profile settings...');
        break;
        
      case 'emergency-contact':
        // Emergency contact information
        alert('EMERGENCY CONTACT\n\nFor urgent maintenance or emergencies:\nPhone: (555) 911-0000\nAvailable 24/7');
        break;
        
      default:
        console.log(`Action not implemented: ${action}`);
    }
    
    // Track performance
    trackPerformance('quick_action', startTime);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Next Rent Due</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">$4,200</div>
          <div className="text-gray-300 text-sm">Due Feb 1, 2024</div>
          <button 
            onClick={() => handleQuickAction('pay-rent')}
            className="mt-3 w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            Pay Now
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Maintenance</h3>
            <span className="text-2xl">🔧</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">2</div>
          <div className="text-yellow-400 text-sm">Active requests</div>
          <button 
            onClick={() => handleQuickAction('new-maintenance')}
            className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            New Request
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Documents</h3>
            <span className="text-2xl">📄</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">5</div>
          <div className="text-gray-300 text-sm">Available</div>
          <button 
            onClick={() => handleQuickAction('view-documents')}
            className="mt-3 w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
          >
            View All
          </button>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Contact</h3>
            <span className="text-2xl">📞</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">24/7</div>
          <div className="text-gray-300 text-sm">Support</div>
          <button 
            onClick={() => handleQuickAction('contact-support')}
            className="mt-3 w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
          >
            Contact
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">Rent payment processed - Jan 1, 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">Maintenance request updated - Jan 15, 2024</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">New document uploaded - Jan 10, 2024</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleQuickAction('schedule-viewing')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Schedule Viewing
            </button>
            <button 
              onClick={() => handleQuickAction('request-document')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
            >
              Request Document
            </button>
            <button 
              onClick={() => handleQuickAction('update-profile')}
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-200"
            >
              Update Profile
            </button>
            <button 
              onClick={() => handleQuickAction('emergency-contact')}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200"
            >
              Emergency
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyTab() {
  const handlePropertyAction = (action: string) => {
    console.log(`Property action: ${action}`);
    // In a real app, you would perform the actual action
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Luxury Downtown Condo</h3>
            <p className="text-gray-300">123 Main St, Beverly Hills, CA 90210</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">$4,200</div>
            <div className="text-gray-300 text-sm">per month</div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Property Details</h4>
            <div className="space-y-2 text-gray-300">
              <div className="flex justify-between">
                <span>Type:</span>
                <span>Condo</span>
              </div>
              <div className="flex justify-between">
                <span>Bedrooms:</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Bathrooms:</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Square Feet:</span>
                <span>1,200</span>
              </div>
              <div className="flex justify-between">
                <span>Lease End:</span>
                <span>Dec 31, 2024</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Amenities</h4>
            <div className="grid grid-cols-2 gap-2 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>24/7 Concierge</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Fitness Center</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Pool & Spa</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>In-Unit Laundry</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✓</span>
                <span>Balcony</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={() => handlePropertyAction('schedule-maintenance')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Schedule Maintenance
          </button>
          <button 
            onClick={() => handlePropertyAction('request-upgrade')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
          >
            Request Upgrade
          </button>
          <button 
            onClick={() => handlePropertyAction('view-gallery')}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
          >
            View Gallery
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentAmount(payment.amount.toString());
    setShowPaymentModal(true);
  };

  const processPayment = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would integrate with a payment processor
    console.log('Processing payment:', { payment: selectedPayment, amount: paymentAmount });
    setShowPaymentModal(false);
    setSelectedPayment(null);
    setPaymentAmount('');
  };

  const handlePaymentAction = (payment: Payment, action: string) => {
    console.log(`${action} payment:`, payment);
    // In a real app, you would perform the actual action
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Payment History</h3>
        <button 
          onClick={() => handlePayment(mockPayments[1])} // Next payment
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200"
        >
          Pay Rent
        </button>
      </div>
      
      <div className="grid gap-4">
        {mockPayments.map((payment) => (
          <div key={payment.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Rent Payment</h4>
                <p className="text-gray-300 mb-1">Due: {payment.dueDate}</p>
                {payment.paidDate && (
                  <p className="text-gray-300 text-sm">Paid: {payment.paidDate}</p>
                )}
                {payment.method && (
                  <p className="text-gray-300 text-sm">Method: {payment.method}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${payment.amount.toLocaleString()}</div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  payment.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                  payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {payment.status === 'pending' && (
                <button 
                  onClick={() => handlePayment(payment)}
                  className="text-green-400 hover:text-green-300 text-sm font-medium"
                >
                  Pay Now
                </button>
              )}
              <button 
                onClick={() => handlePaymentAction(payment, 'download-receipt')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Download Receipt
              </button>
              <button 
                onClick={() => handlePaymentAction(payment, 'view-details')}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Process Payment</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={processPayment} className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-gray-300 text-sm">Payment Amount</div>
                <div className="text-2xl font-bold text-white">${selectedPayment.amount.toLocaleString()}</div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Payment Method</label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors">
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  Process Payment
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MaintenanceTab() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'low'
  });

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('New maintenance request:', newRequest);
    setShowNewRequest(false);
    setNewRequest({ title: '', description: '', priority: 'low' });
  };

  const handleRequestAction = (request: MaintenanceRequest, action: string) => {
    console.log(`${action} request:`, request);
    // In a real app, you would perform the actual action
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Maintenance Requests</h3>
        <button 
          onClick={() => setShowNewRequest(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
        >
          New Request
        </button>
      </div>
      
      <div className="grid gap-4">
        {mockMaintenanceRequests.map((request) => (
          <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-2">{request.title}</h4>
                <p className="text-gray-300 mb-3">{request.description}</p>
                <div className="flex gap-4 text-sm mb-3">
                  <span className="text-gray-300">Created: {request.createdAt}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    request.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    request.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    request.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {request.estimatedCompletion && (
                  <p className="text-gray-300 text-sm mb-3">Estimated completion: {request.estimatedCompletion}</p>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedRequest(request)}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleRequestAction(request, 'update')}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleRequestAction(request, 'cancel')}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Request Modal */}
      {showNewRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">New Maintenance Request</h2>
              <button 
                onClick={() => setShowNewRequest(false)}
                className="text-gray-500 hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleNewRequest} className="space-y-4">
              <input
                type="text"
                placeholder="Request Title"
                value={newRequest.title}
                onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 transition-colors"
              />
              <textarea
                placeholder="Description of the issue"
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                rows={4}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 transition-colors resize-none"
              />
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                >
                  Submit Request
                </button>
                <button 
                  type="button"
                  onClick={() => setShowNewRequest(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6 border border-white/20">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedRequest.title}</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 text-white">
              <div>
                <span className="text-gray-300">Description:</span>
                <p className="font-medium">{selectedRequest.description}</p>
              </div>
              <div>
                <span className="text-gray-300">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedRequest.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  selectedRequest.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-300">Priority:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  selectedRequest.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  selectedRequest.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)} Priority
                </span>
              </div>
              <div>
                <span className="text-gray-300">Created:</span>
                <p className="font-medium">{selectedRequest.createdAt}</p>
              </div>
              {selectedRequest.estimatedCompletion && (
                <div>
                  <span className="text-gray-300">Estimated Completion:</span>
                  <p className="font-medium">{selectedRequest.estimatedCompletion}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentsTab() {
  const handleDocumentAction = (document: { id: string; name: string; type: string; size: string; uploaded: string }, action: string) => {
    const startTime = performance.now();
    console.log(`${action} document:`, document);
    
    // Track document actions
    trackEvent('document_action', { 
      action: action,
      document_id: document.id,
      document_name: document.name,
      document_type: document.type,
      user_id: 'john_smith'
    });
    
    // Actually implement the actions instead of just logging
    switch (action) {
      case 'download':
        // Create a downloadable PDF
        const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${document.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;
        
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${document.name}.pdf`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
        
      case 'view':
        // Open PDF in new tab
        const viewUrl = `data:application/pdf;base64,${btoa(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${document.name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`)}`;
        window.open(viewUrl, '_blank');
        break;
        
      case 'share':
        // Implement sharing functionality
        if (navigator.share) {
          navigator.share({
            title: document.name,
            text: `Check out this document: ${document.name}`,
            url: window.location.href
          });
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(`${document.name} - ${window.location.href}`);
          alert('Document link copied to clipboard!');
        }
        break;
        
      case 'request-document':
        alert('Document request submitted! We\'ll get back to you within 24 hours.');
        break;
    }
    
    // Track performance
    trackPerformance('document_action', startTime);
  };

  const mockDocuments = [
    { id: '1', name: 'Lease Agreement', type: 'PDF', size: '2.3 MB', uploaded: '2024-01-01' },
    { id: '2', name: 'Property Rules', type: 'PDF', size: '1.1 MB', uploaded: '2024-01-05' },
    { id: '3', name: 'Maintenance Schedule', type: 'PDF', size: '856 KB', uploaded: '2024-01-10' },
    { id: '4', name: 'Emergency Contacts', type: 'PDF', size: '324 KB', uploaded: '2024-01-15' },
    { id: '5', name: 'Amenity Guide', type: 'PDF', size: '1.8 MB', uploaded: '2024-01-20' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Documents</h3>
        <button 
          onClick={() => handleDocumentAction({ id: '', name: '', type: '', size: '', uploaded: '' }, 'request-document')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
        >
          Request Document
        </button>
      </div>
      
      <div className="grid gap-4">
        {mockDocuments.map((document) => (
          <div key={document.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">PDF</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{document.name}</h4>
                  <p className="text-gray-300 text-sm">{document.size} • Uploaded {document.uploaded}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDocumentAction(document, 'download')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium bg-blue-500/10 px-3 py-1 rounded-lg hover:bg-blue-500/20 transition-all duration-200"
                >
                  Download
                </button>
                <button 
                  onClick={() => handleDocumentAction(document, 'view')}
                  className="text-green-400 hover:text-green-300 text-sm font-medium bg-green-500/10 px-3 py-1 rounded-lg hover:bg-green-500/20 transition-all duration-200"
                >
                  View
                </button>
                <button 
                  onClick={() => handleDocumentAction(document, 'share')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium bg-purple-500/10 px-3 py-1 rounded-lg hover:bg-purple-500/20 transition-all duration-200"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  // Error tracking
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      trackEvent('error', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        user_id: 'john_smith'
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('unhandled_rejection', {
        reason: event.reason,
        user_id: 'john_smith'
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Track page load
    trackEvent('page_view', {
      page: 'tenant_portal',
      user_id: 'john_smith'
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleHeaderAction = (action: string) => {
    const startTime = performance.now();
    
    // Track header button clicks
    trackEvent('header_action', { 
      action: action,
      user_id: 'john_smith'
    });
    
    switch (action) {
      case 'notifications':
        alert('Notifications\n\n• Rent due reminder - 3 days\n• Maintenance update - Kitchen sink fixed\n• New document available - Lease renewal');
        break;
      case 'settings':
        alert('Settings\n\n• Profile Information\n• Notification Preferences\n• Security Settings\n• Privacy Settings');
        break;
      default:
        console.log(`Header action: ${action}`);
    }
    
    // Track performance
    trackPerformance('header_action', startTime);
  };

  const tabs: Tab[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      content: <DashboardTab />
    },
    {
      id: 'property',
      label: 'Property',
      icon: '🏠',
      content: <PropertyTab />
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: '💰',
      content: <PaymentsTab />
    },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: '🔧',
      content: <MaintenanceTab />
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: '📄',
      content: <DocumentsTab />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                TBD Property Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleHeaderAction('notifications')}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <span className="text-lg">🔔</span>
              </button>
              <button 
                onClick={() => handleHeaderAction('settings')}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                <span className="text-lg">⚙️</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
                <span className="text-white text-sm font-bold">JS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, John Smith</h2>
          <p className="text-gray-300">Manage your rental experience with ease.</p>
        </div>

        <TabSystem tabs={tabs} />
      </main>
    </div>
  );
}
