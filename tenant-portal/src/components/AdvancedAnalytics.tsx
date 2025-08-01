'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface AdvancedAnalyticsProps {
  tenantId: string;
}

interface UserBehavior {
  pageViews: number;
  timeOnSite: number;
  featuresUsed: string[];
  conversionEvents: ConversionEvent[];
  lastActive: Date;
  engagementScore: number;
}

interface ConversionEvent {
  id: string;
  type: 'feature_purchase' | 'upsell_click' | 'payment' | 'support_request' | 'document_download';
  value: number;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

interface RevenueInsight {
  id: string;
  title: string;
  description: string;
  potentialValue: number;
  confidence: number;
  action: string;
  category: 'immediate' | 'short_term' | 'long_term';
}

export default function AdvancedAnalytics({ tenantId }: AdvancedAnalyticsProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null);
  const [revenueInsights, setRevenueInsights] = useState<RevenueInsight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<RevenueInsight | null>(null);

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
    initializeAnalytics();
  }, [loadTenantData]);

  const initializeAnalytics = () => {
    // Simulate user behavior data
    const mockBehavior: UserBehavior = {
      pageViews: 47,
      timeOnSite: 1240, // seconds
      featuresUsed: ['payments', 'maintenance', 'documents', 'dashboard'],
      conversionEvents: [
        {
          id: '1',
          type: 'payment',
          value: 4200,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          metadata: { method: 'credit_card', onTime: true }
        },
        {
          id: '2',
          type: 'support_request',
          value: 0,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          metadata: { category: 'maintenance', resolved: true }
        }
      ],
      lastActive: new Date(),
      engagementScore: 78
    };

    setUserBehavior(mockBehavior);

    // Generate revenue insights based on behavior
    const insights: RevenueInsight[] = [
      {
        id: '1',
        title: 'High Payment Reliability',
        description: 'You consistently pay on time. Consider upgrading to premium payment features for better rewards.',
        potentialValue: 240,
        confidence: 0.95,
        action: 'Upgrade to Premium Payments',
        category: 'immediate'
      },
      {
        id: '2',
        title: 'Maintenance Request Pattern',
        description: 'You submit 2-3 maintenance requests monthly. A maintenance package could save you $180/year.',
        potentialValue: 180,
        confidence: 0.87,
        action: 'Add Maintenance Package',
        category: 'short_term'
      },
      {
        id: '3',
        title: 'Document Activity',
        description: 'You frequently access documents. Premium document features could enhance your experience.',
        potentialValue: 120,
        confidence: 0.72,
        action: 'Explore Document Features',
        category: 'short_term'
      },
      {
        id: '4',
        title: 'Lease Renewal Opportunity',
        description: 'Your lease expires in 6 months. Early renewal could lock in current rates.',
        potentialValue: 2400,
        confidence: 0.68,
        action: 'Discuss Renewal Options',
        category: 'long_term'
      },
      {
        id: '5',
        title: 'Referral Potential',
        description: 'Based on your satisfaction score, you could earn $500 per successful referral.',
        potentialValue: 500,
        confidence: 0.81,
        action: 'Join Referral Program',
        category: 'immediate'
      }
    ];

    setRevenueInsights(insights);
  };

  const trackEvent = (eventType: string, value: number = 0, metadata: Record<string, unknown> = {}) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', eventType, {
        value,
        currency: 'USD',
        user_id: tenantId,
        ...metadata
      });
    }

    // Store locally for analytics
    const event: ConversionEvent = {
      id: Date.now().toString(),
      type: eventType as ConversionEvent['type'],
      value,
      timestamp: new Date(),
      metadata
    };

    setUserBehavior(prev => prev ? {
      ...prev,
      conversionEvents: [...prev.conversionEvents, event]
    } : null);
  };

  const handleInsightAction = (insight: RevenueInsight) => {
    setSelectedInsight(insight);
    trackEvent('insight_action', insight.potentialValue, {
      insight_id: insight.id,
      action: insight.action
    });
  };

  const getEngagementMetrics = () => {
    if (!userBehavior) return null;

    const totalValue = userBehavior.conversionEvents.reduce((sum, event) => sum + event.value, 0);
    const avgSessionTime = Math.round(userBehavior.timeOnSite / 60); // minutes
    const featureUsageRate = (userBehavior.featuresUsed.length / 4) * 100; // 4 total features

    return {
      totalValue,
      avgSessionTime,
      featureUsageRate,
      engagementScore: userBehavior.engagementScore
    };
  };

  const getConversionFunnel = () => {
    return {
      awareness: 100, // All tenants are aware
      interest: 85, // Based on engagement score
      consideration: 72, // Based on feature usage
      intent: 58, // Based on conversion events
      purchase: 42, // Based on actual purchases
      loyalty: 78 // Based on repeat usage
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant || !userBehavior) {
    return (
      <div className="text-center text-red-600">
        Failed to load analytics data
      </div>
    );
  }

  const metrics = getEngagementMetrics();
  const funnel = getConversionFunnel();

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Advanced Analytics</h2>
            <p className="text-indigo-100">
              Data-driven insights to optimize your rental experience and maximize value
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userBehavior.engagementScore}%</div>
            <div className="text-sm text-indigo-100">Engagement Score</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Total Value Generated</h3>
          <p className="text-2xl font-bold text-gray-900">
            {PaymentService.formatCurrency(metrics?.totalValue || 0)}
          </p>
          <p className="text-sm text-gray-500">lifetime value</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Avg Session Time</h3>
          <p className="text-2xl font-bold text-green-600">
            {metrics?.avgSessionTime} min
          </p>
          <p className="text-sm text-gray-500">per visit</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Feature Usage</h3>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(metrics?.featureUsageRate || 0)}%
          </p>
          <p className="text-sm text-gray-500">of available features</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500">Page Views</h3>
          <p className="text-2xl font-bold text-orange-600">
            {userBehavior.pageViews}
          </p>
          <p className="text-sm text-gray-500">this month</p>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-3">
          {Object.entries(funnel).map(([stage, percentage]) => (
            <div key={stage} className="flex items-center space-x-4">
              <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                {stage}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
              <div className="w-12 text-sm font-medium text-gray-900">
                {percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Insights */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Revenue Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {revenueInsights.map((insight) => (
            <motion.div
              key={insight.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                insight.category === 'immediate' 
                  ? 'border-red-200 bg-red-50 hover:border-red-300' 
                  : insight.category === 'short_term'
                  ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                  : 'border-blue-200 bg-blue-50 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleInsightAction(insight)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.category === 'immediate' ? 'bg-red-100 text-red-800' :
                  insight.category === 'short_term' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {insight.category.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">
                  ${insight.potentialValue}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
              </div>
              <button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
                {insight.action}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Behavior Timeline */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {userBehavior.conversionEvents.slice(-5).reverse().map((event) => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">
                  {event.type === 'payment' ? '💰' : 
                   event.type === 'support_request' ? '🔧' :
                   event.type === 'document_download' ? '📄' : '📊'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 capitalize">
                  {event.type.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {event.timestamp.toLocaleDateString()} at {event.timestamp.toLocaleTimeString()}
                </p>
              </div>
                             {event.value > 0 && (
                 <span className="text-green-600 font-semibold">
                   +{PaymentService.formatCurrency(event.value)}
                 </span>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* Insight Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">{selectedInsight.title}</h3>
            <p className="text-gray-600 mb-4">{selectedInsight.description}</p>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="text-2xl font-bold text-green-600">
                ${selectedInsight.potentialValue}
              </div>
              <div className="text-sm text-green-700">Potential value</div>
              <div className="text-xs text-green-600 mt-1">
                {Math.round(selectedInsight.confidence * 100)}% confidence level
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedInsight(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  trackEvent('insight_implemented', selectedInsight.potentialValue, {
                    insight_id: selectedInsight.id
                  });
                  setSelectedInsight(null);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md font-medium hover:from-green-700 hover:to-blue-700"
              >
                Implement
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 