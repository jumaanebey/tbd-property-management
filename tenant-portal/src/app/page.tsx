'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealPaymentsTab from '../components/RealPaymentsTab';
import RealMaintenanceTab from '../components/RealMaintenanceTab';
import RealDocumentsTab from '../components/RealDocumentsTab';
import RealDashboardTab from '../components/RealDashboardTab';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  return <RealDashboardTab tenantId="john_smith" />;
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
  return <RealPaymentsTab tenantId="john_smith" />;
}

function MaintenanceTab() {
  return <RealMaintenanceTab tenantId="john_smith" />;
}

function DocumentsTab() {
  return <RealDocumentsTab tenantId="john_smith" />;
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
