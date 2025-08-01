'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface PremiumDashboardProps {
  tenantId: string;
}

interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
  category: 'essential' | 'convenience' | 'luxury' | 'analytics';
  popular?: boolean;
  savings?: number;
}

interface UpsellOpportunity {
  id: string;
  title: string;
  description: string;
  value: number;
  conversionRate: number;
  urgency: 'low' | 'medium' | 'high';
}

export default function PremiumDashboard({ tenantId }: PremiumDashboardProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [selectedUpsell, setSelectedUpsell] = useState<UpsellOpportunity | null>(null);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTenantData = useCallback(async () => {
    setLoading(true);
    try {
      const dbTenant = await TenantPortalDB.getTenant(tenantId);
      if (dbTenant) {
        setTenant(dbTenant);
      } else {
        setTenant(mockData.tenant);
      }
    } catch (err) {
      console.error('Error loading tenant data:', err);
      setTenant(mockData.tenant);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  // Premium features that drive revenue
  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'priority_support',
      title: 'Priority Support',
      description: '24/7 dedicated support line with 15-minute response guarantee',
      price: 29.99,
      icon: '🎯',
      category: 'essential',
      popular: true,
      savings: 50
    },
    {
      id: 'smart_home',
      title: 'Smart Home Package',
      description: 'Nest thermostat, smart locks, and security cameras included',
      price: 49.99,
      icon: '🏠',
      category: 'convenience',
      savings: 120
    },
    {
      id: 'cleaning_service',
      title: 'Bi-weekly Cleaning',
      description: 'Professional cleaning service every 2 weeks',
      price: 79.99,
      icon: '🧹',
      category: 'luxury',
      popular: true
    },
    {
      id: 'financial_insights',
      title: 'Financial Insights',
      description: 'Advanced budgeting tools and rent optimization suggestions',
      price: 19.99,
      icon: '📊',
      category: 'analytics',
      savings: 200
    },
    {
      id: 'pet_insurance',
      title: 'Pet Damage Protection',
      description: 'Covers up to $500 in pet-related damages',
      price: 15.99,
      icon: '🐕',
      category: 'essential'
    },
    {
      id: 'parking_spot',
      title: 'Reserved Parking',
      description: 'Guaranteed parking spot in building garage',
      price: 39.99,
      icon: '🚗',
      category: 'convenience'
    }
  ];

  // High-converting upsell opportunities
  const upsellOpportunities: UpsellOpportunity[] = [
    {
      id: 'lease_renewal',
      title: 'Early Lease Renewal',
      description: 'Lock in current rates for 2 more years, save $2,400',
      value: 2400,
      conversionRate: 0.35,
      urgency: 'high'
    },
    {
      id: 'referral_bonus',
      title: 'Refer a Friend',
      description: 'Get $500 credit for each successful referral',
      value: 500,
      conversionRate: 0.25,
      urgency: 'medium'
    },
    {
      id: 'insurance_bundle',
      title: 'Renters Insurance Bundle',
      description: 'Comprehensive coverage at 40% discount',
      value: 180,
      conversionRate: 0.45,
      urgency: 'medium'
    }
  ];

  const handleUpsellClick = (upsell: UpsellOpportunity) => {
    setSelectedUpsell(upsell);
    setShowUpsellModal(true);
  };

  const handlePremiumFeaturePurchase = async (feature: PremiumFeature) => {
    try {
      // In a real app, this would integrate with payment processing
      const result = await PaymentService.mockProcessPayment(feature.price, 'credit_card');
      
      if (result.success) {
        setSuccess(`${feature.title} added successfully! You'll be charged $${feature.price}/month.`);
        
        // Track conversion for analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'purchase', {
            value: feature.price,
            currency: 'USD',
            item_name: feature.title,
            item_category: feature.category
          });
        }
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const getRevenueMetrics = () => {
    if (!tenant) return null;
    
    const baseRent = tenant.rent_amount;
    const potentialUpsells = upsellOpportunities.reduce((sum, upsell) => sum + upsell.value, 0);
    const monthlyPremiumRevenue = premiumFeatures.reduce((sum, feature) => sum + feature.price, 0);
    
    return {
      baseRent,
      potentialUpsells,
      monthlyPremiumRevenue,
      totalPotentialRevenue: baseRent + potentialUpsells + monthlyPremiumRevenue,
      conversionOpportunity: (potentialUpsells + monthlyPremiumRevenue) * 0.3 // 30% conversion rate
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center text-red-600">
        Failed to load tenant data
      </div>
    );
  }

  const metrics = getRevenueMetrics();

  return (
    <div className="space-y-6">
      {/* Revenue Optimization Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Revenue Optimization Dashboard</h2>
            <p className="text-purple-100">
              Discover opportunities to maximize your rental value and save money
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${metrics?.conversionOpportunity.toFixed(0)}</div>
            <div className="text-sm text-purple-100">Potential Annual Savings</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Current Rent</h3>
          <p className="text-2xl font-bold text-gray-900">
            {PaymentService.formatCurrency(tenant.rent_amount)}
          </p>
          <p className="text-sm text-gray-500">per month</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Potential Savings</h3>
          <p className="text-2xl font-bold text-green-600">
            ${metrics?.potentialUpsells.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">one-time opportunities</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Premium Features</h3>
          <p className="text-2xl font-bold text-purple-600">
            ${metrics?.monthlyPremiumRevenue.toFixed(0)}
          </p>
          <p className="text-sm text-gray-500">monthly value available</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500">Conversion Score</h3>
          <p className="text-2xl font-bold text-orange-600">85%</p>
          <p className="text-sm text-gray-500">high potential</p>
        </div>
      </div>

      {/* High-Value Upsell Opportunities */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">High-Value Opportunities</h3>
          <span className="text-sm text-green-600 font-medium">Limited Time</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upsellOpportunities.map((upsell) => (
            <motion.div
              key={upsell.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                upsell.urgency === 'high' 
                  ? 'border-red-200 bg-red-50 hover:border-red-300' 
                  : 'border-blue-200 bg-blue-50 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleUpsellClick(upsell)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{upsell.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  upsell.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {upsell.urgency === 'high' ? 'Urgent' : 'Limited'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{upsell.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">${upsell.value}</span>
                <span className="text-sm text-gray-500">
                  {Math.round(upsell.conversionRate * 100)}% success rate
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Features Grid */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Premium Features</h3>
          <button
            onClick={() => setShowPremiumFeatures(!showPremiumFeatures)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showPremiumFeatures ? 'Show Less' : 'View All Features'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {premiumFeatures.slice(0, showPremiumFeatures ? undefined : 3).map((feature) => (
            <motion.div
              key={feature.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-2xl">{feature.icon}</span>
                {feature.popular && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-gray-900">${feature.price}/mo</span>
                {feature.savings && (
                  <span className="text-sm text-green-600">Save ${feature.savings}/year</span>
                )}
              </div>
              <button
                onClick={() => handlePremiumFeaturePurchase(feature)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Add Feature
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded"
          >
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upsell Modal */}
      {showUpsellModal && selectedUpsell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">{selectedUpsell.title}</h3>
            <p className="text-gray-600 mb-4">{selectedUpsell.description}</p>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="text-2xl font-bold text-green-600">${selectedUpsell.value}</div>
              <div className="text-sm text-green-700">Potential value</div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpsellModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  setSuccess(`Great choice! We'll contact you about ${selectedUpsell.title}.`);
                  setShowUpsellModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md font-medium hover:from-green-700 hover:to-blue-700"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 