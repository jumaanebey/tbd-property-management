'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300
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
          {tabs.find(tab => tab.id === activeTab)?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DashboardTab() {
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
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Maintenance</h3>
            <span className="text-2xl">🔧</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">2</div>
          <div className="text-yellow-400 text-sm">Active requests</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Lease End</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-white mb-2">Dec 31</div>
          <div className="text-gray-300 text-sm">2024</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Payment Status</h3>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">Current</div>
          <div className="text-gray-300 text-sm">No overdue payments</div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">💳</span>
              <span className="text-white font-semibold">Pay Rent</span>
            </div>
          </button>
          <button className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🔧</span>
              <span className="text-white font-semibold">Request Maintenance</span>
            </div>
          </button>
          <button className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📞</span>
              <span className="text-white font-semibold">Contact Manager</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyTab() {
  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Property Information</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Luxury Downtown Condo</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Address:</span>
                <span className="text-white">123 Main St, Beverly Hills, CA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Unit:</span>
                <span className="text-white">#1502</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Type:</span>
                <span className="text-white">2 Bedroom, 2 Bath</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Square Feet:</span>
                <span className="text-white">1,250 sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Floor:</span>
                <span className="text-white">15th Floor</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Pool</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Gym</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Parking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Concierge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Security</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Balcony</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-500/30">
        <h4 className="text-xl font-bold text-white mb-4">Property Photos</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <span className="text-4xl mb-2 block">🏠</span>
            <span className="text-white">Living Room</span>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <span className="text-4xl mb-2 block">🛏️</span>
            <span className="text-white">Master Bedroom</span>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <span className="text-4xl mb-2 block">🍳</span>
            <span className="text-white">Kitchen</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Payment History</h3>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
          Pay Rent Now
        </button>
      </div>
      
      <div className="grid gap-4">
        {mockPayments.map((payment) => (
          <div key={payment.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Rent Payment</h4>
                <p className="text-gray-300 mb-2">Due: {payment.dueDate}</p>
                {payment.paidDate && (
                  <p className="text-gray-300">Paid: {payment.paidDate}</p>
                )}
                {payment.method && (
                  <p className="text-gray-300">Method: {payment.method}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white mb-2">${payment.amount.toLocaleString()}</div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  payment.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                  payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-6 border border-green-500/30">
        <h4 className="text-xl font-bold text-white mb-4">Payment Methods</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">💳</span>
              <span className="text-white font-semibold">Credit Card</span>
            </div>
            <p className="text-gray-300 text-sm">Visa ending in 4242</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏦</span>
              <span className="text-white font-semibold">Bank Transfer</span>
            </div>
            <p className="text-gray-300 text-sm">Chase Bank account</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">Maintenance Requests</h3>
        <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
          New Request
        </button>
      </div>
      
      <div className="grid gap-4">
        {mockMaintenanceRequests.map((request) => (
          <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{request.title}</h4>
                <p className="text-gray-300 mb-2">{request.description}</p>
                <p className="text-gray-300 text-sm">Created: {request.createdAt}</p>
                {request.estimatedCompletion && (
                  <p className="text-gray-300 text-sm">Estimated completion: {request.estimatedCompletion}</p>
                )}
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 rounded-full text-xs mb-2 ${
                  request.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  request.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                </div>
                <div className={`px-3 py-1 rounded-full text-xs ${
                  request.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  request.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
        <h4 className="text-xl font-bold text-white mb-4">Emergency Contacts</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🚨</span>
              <span className="text-white font-semibold">Emergency Maintenance</span>
            </div>
            <p className="text-gray-300 text-sm">(555) 123-4567</p>
            <p className="text-gray-300 text-sm">Available 24/7</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">👨‍💼</span>
              <span className="text-white font-semibold">Property Manager</span>
            </div>
            <p className="text-gray-300 text-sm">(555) 234-5678</p>
            <p className="text-gray-300 text-sm">Mon-Fri 9AM-5PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Documents & Forms</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-bold text-white mb-4">Lease Documents</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <span className="text-white">Lease Agreement</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Download</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <span className="text-white">Move-in Checklist</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Download</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏠</span>
                <span className="text-white">Property Rules</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Download</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-bold text-white mb-4">Forms & Applications</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔧</span>
                <span className="text-white">Maintenance Request</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Fill Out</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <span className="text-white">Lease Renewal</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Apply</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <span className="text-white">Change of Address</span>
              </div>
              <button className="text-blue-400 hover:text-blue-300">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
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
              <button className="text-gray-300 hover:text-white">
                <span className="text-lg">🔔</span>
              </button>
              <button className="text-gray-300 hover:text-white">
                <span className="text-lg">⚙️</span>
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
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