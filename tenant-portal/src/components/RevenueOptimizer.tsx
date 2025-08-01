'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface RevenueOptimizerProps {
  tenantId: string;
}

interface RevenueMetric {
  id: string;
  name: string;
  currentValue: number;
  previousValue: number;
  targetValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: 'conversion' | 'revenue' | 'engagement' | 'retention';
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  variantA: string;
  variantB: string;
  status: 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  variantAResults: ABTestResults;
  variantBResults: ABTestResults;
  winner?: 'A' | 'B' | null;
  confidence: number;
}

interface ABTestResults {
  impressions: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
}

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  potentialRevenue: number;
  implementationTime: string;
  category: 'ui' | 'pricing' | 'timing' | 'messaging' | 'feature';
  status: 'pending' | 'implemented' | 'testing' | 'rejected';
}

export default function RevenueOptimizer({ tenantId }: RevenueOptimizerProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RevenueMetric[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<OptimizationRecommendation | null>(null);
  const [showImplementationModal, setShowImplementationModal] = useState(false);

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
    initializeOptimizationData();
  }, [loadTenantData]);

  const initializeOptimizationData = () => {
    // Revenue Metrics
    const mockMetrics: RevenueMetric[] = [
      {
        id: '1',
        name: 'Premium Feature Conversion',
        currentValue: 15.2,
        previousValue: 12.8,
        targetValue: 20.0,
        change: 18.75,
        trend: 'up',
        category: 'conversion'
      },
      {
        id: '2',
        name: 'Average Revenue Per User',
        currentValue: 485,
        previousValue: 420,
        targetValue: 600,
        change: 15.48,
        trend: 'up',
        category: 'revenue'
      },
      {
        id: '3',
        name: 'Monthly Active Users',
        currentValue: 89,
        previousValue: 92,
        targetValue: 95,
        change: -3.26,
        trend: 'down',
        category: 'engagement'
      },
      {
        id: '4',
        name: 'Customer Lifetime Value',
        currentValue: 4200,
        previousValue: 3800,
        targetValue: 6000,
        change: 10.53,
        trend: 'up',
        category: 'revenue'
      },
      {
        id: '5',
        name: 'Referral Conversion Rate',
        currentValue: 28.5,
        previousValue: 25.2,
        targetValue: 35.0,
        change: 13.10,
        trend: 'up',
        category: 'conversion'
      },
      {
        id: '6',
        name: 'Churn Rate',
        currentValue: 4.2,
        previousValue: 5.1,
        targetValue: 3.0,
        change: -17.65,
        trend: 'up',
        category: 'retention'
      }
    ];

    setMetrics(mockMetrics);

    // A/B Tests
    const mockABTests: ABTest[] = [
      {
        id: '1',
        name: 'Premium Feature Pricing',
        description: 'Testing $29.99 vs $39.99 for priority support',
        variantA: '$29.99/month',
        variantB: '$39.99/month',
        status: 'running',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        variantAResults: {
          impressions: 150,
          conversions: 23,
          revenue: 3450,
          conversionRate: 15.33,
          avgOrderValue: 150
        },
        variantBResults: {
          impressions: 145,
          conversions: 18,
          revenue: 2880,
          conversionRate: 12.41,
          avgOrderValue: 160
        },
        winner: 'A',
        confidence: 0.85
      },
      {
        id: '2',
        name: 'Referral Bonus Amount',
        description: 'Testing $500 vs $750 referral bonus',
        variantA: '$500 bonus',
        variantB: '$750 bonus',
        status: 'completed',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        variantAResults: {
          impressions: 200,
          conversions: 12,
          revenue: 6000,
          conversionRate: 6.0,
          avgOrderValue: 500
        },
        variantBResults: {
          impressions: 195,
          conversions: 18,
          revenue: 13500,
          conversionRate: 9.23,
          avgOrderValue: 750
        },
        winner: 'B',
        confidence: 0.92
      },
      {
        id: '3',
        name: 'Gamification Rewards',
        description: 'Testing points vs cash rewards for challenges',
        variantA: 'Points rewards',
        variantB: 'Cash rewards',
        status: 'running',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        variantAResults: {
          impressions: 80,
          conversions: 15,
          revenue: 750,
          conversionRate: 18.75,
          avgOrderValue: 50
        },
        variantBResults: {
          impressions: 82,
          conversions: 22,
          revenue: 1100,
          conversionRate: 26.83,
          avgOrderValue: 50
        },
        winner: null,
        confidence: 0.78
      }
    ];

    setAbTests(mockABTests);

    // Optimization Recommendations
    const mockRecommendations: OptimizationRecommendation[] = [
      {
        id: '1',
        title: 'Implement Dynamic Pricing',
        description: 'Adjust premium feature prices based on user behavior and willingness to pay',
        impact: 'high',
        effort: 'medium',
        potentialRevenue: 25000,
        implementationTime: '2-3 weeks',
        category: 'pricing',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Add Urgency to Offers',
        description: 'Include countdown timers and limited-time messaging for premium features',
        impact: 'medium',
        effort: 'low',
        potentialRevenue: 12000,
        implementationTime: '1 week',
        category: 'messaging',
        status: 'implemented'
      },
      {
        id: '3',
        title: 'Optimize Payment Flow',
        description: 'Reduce payment form fields and add progress indicators',
        impact: 'high',
        effort: 'medium',
        potentialRevenue: 18000,
        implementationTime: '2 weeks',
        category: 'ui',
        status: 'testing'
      },
      {
        id: '4',
        title: 'Personalized Onboarding',
        description: 'Create custom onboarding flows based on user preferences and behavior',
        impact: 'medium',
        effort: 'high',
        potentialRevenue: 15000,
        implementationTime: '4 weeks',
        category: 'feature',
        status: 'pending'
      },
      {
        id: '5',
        title: 'Smart Notifications',
        description: 'Send personalized notifications at optimal times based on user activity',
        impact: 'medium',
        effort: 'low',
        potentialRevenue: 8000,
        implementationTime: '1 week',
        category: 'timing',
        status: 'implemented'
      },
      {
        id: '6',
        title: 'Bundle Premium Features',
        description: 'Create feature bundles with 15% discount compared to individual pricing',
        impact: 'high',
        effort: 'medium',
        potentialRevenue: 30000,
        implementationTime: '3 weeks',
        category: 'pricing',
        status: 'pending'
      }
    ];

    setRecommendations(mockRecommendations);
  };

  const handleRecommendationImplement = (recommendation: OptimizationRecommendation) => {
    setSelectedRecommendation(recommendation);
    setShowImplementationModal(true);
  };

  const getTrendIcon = (trend: RevenueMetric['trend']) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: RevenueMetric['trend']) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: OptimizationRecommendation['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffortColor = (effort: OptimizationRecommendation['effort']) => {
    switch (effort) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: OptimizationRecommendation['status']) => {
    switch (status) {
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'testing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalPotentialRevenue = () => {
    return recommendations
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.potentialRevenue, 0);
  };

  const getROI = () => {
    const totalRevenue = getTotalPotentialRevenue();
    const totalEffort = recommendations
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => {
        const effortMultiplier = r.effort === 'high' ? 3 : r.effort === 'medium' ? 2 : 1;
        return sum + effortMultiplier;
      }, 0);
    return totalRevenue / totalEffort;
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
        Failed to load optimization data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Optimizer Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Revenue Optimizer</h2>
            <p className="text-red-100">
              AI-powered insights and A/B testing to maximize your $200k/year profit target
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{PaymentService.formatCurrency(getTotalPotentialRevenue())}</div>
            <div className="text-sm text-red-100">Potential Revenue</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Total Potential Revenue</h3>
          <p className="text-2xl font-bold text-gray-900">
            {PaymentService.formatCurrency(getTotalPotentialRevenue())}
          </p>
          <p className="text-sm text-gray-500">from optimizations</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">ROI Score</h3>
          <p className="text-2xl font-bold text-blue-600">
            {Math.round(getROI()).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">revenue per effort unit</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Active A/B Tests</h3>
          <p className="text-2xl font-bold text-purple-600">
            {abTests.filter(t => t.status === 'running').length}
          </p>
          <p className="text-sm text-gray-500">running</p>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                <span className={`text-lg ${getTrendColor(metric.trend)}`}>
                  {getTrendIcon(metric.trend)}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.category === 'revenue' || metric.category === 'conversion' 
                    ? `${metric.currentValue.toFixed(1)}%`
                    : PaymentService.formatCurrency(metric.currentValue)
                  }
                </div>
                <div className="text-sm text-gray-500">
                  Target: {metric.category === 'revenue' || metric.category === 'conversion'
                    ? `${metric.targetValue.toFixed(1)}%`
                    : PaymentService.formatCurrency(metric.targetValue)
                  }
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  metric.category === 'conversion' ? 'bg-blue-100 text-blue-800' :
                  metric.category === 'revenue' ? 'bg-green-100 text-green-800' :
                  metric.category === 'engagement' ? 'bg-purple-100 text-purple-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {metric.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* A/B Tests */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">A/B Test Results</h3>
        <div className="space-y-4">
          {abTests.map((test) => (
            <div key={test.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{test.name}</h4>
                  <p className="text-sm text-gray-600">{test.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.status === 'running' ? 'bg-green-100 text-green-800' :
                  test.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Variant A: {test.variantA}</h5>
                  <div className="space-y-1 text-sm">
                    <div>Impressions: {test.variantAResults.impressions}</div>
                    <div>Conversions: {test.variantAResults.conversions}</div>
                    <div>Revenue: {PaymentService.formatCurrency(test.variantAResults.revenue)}</div>
                    <div>Conv. Rate: {test.variantAResults.conversionRate.toFixed(2)}%</div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Variant B: {test.variantB}</h5>
                  <div className="space-y-1 text-sm">
                    <div>Impressions: {test.variantBResults.impressions}</div>
                    <div>Conversions: {test.variantBResults.conversions}</div>
                    <div>Revenue: {PaymentService.formatCurrency(test.variantBResults.revenue)}</div>
                    <div>Conv. Rate: {test.variantBResults.conversionRate.toFixed(2)}%</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Confidence: {(test.confidence * 100).toFixed(0)}%
                </div>
                {test.winner && (
                  <div className="text-sm font-medium text-green-600">
                    Winner: Variant {test.winner}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Optimization Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((recommendation) => (
            <motion.div
              key={recommendation.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recommendation.status)}`}>
                  {recommendation.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
              
              <div className="flex space-x-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                  Impact: {recommendation.impact}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(recommendation.effort)}`}>
                  Effort: {recommendation.effort}
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {PaymentService.formatCurrency(recommendation.potentialRevenue)}
                  </div>
                  <div className="text-sm text-gray-500">Potential Revenue</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {recommendation.implementationTime}
                  </div>
                  <div className="text-sm text-gray-500">Implementation</div>
                </div>
              </div>

              {recommendation.status === 'pending' && (
                <button
                  onClick={() => handleRecommendationImplement(recommendation)}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:from-red-700 hover:to-orange-700 transition-all duration-200"
                >
                  Implement
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Implementation Modal */}
      {showImplementationModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Implement Optimization</h3>
            <p className="text-gray-600 mb-4">{selectedRecommendation.description}</p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="text-2xl font-bold text-green-600">
                {PaymentService.formatCurrency(selectedRecommendation.potentialRevenue)}
              </div>
              <div className="text-sm text-green-700">Potential Revenue Impact</div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Implementation Details:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Impact: {selectedRecommendation.impact}</li>
                <li>• Effort: {selectedRecommendation.effort}</li>
                <li>• Timeline: {selectedRecommendation.implementationTime}</li>
                <li>• Category: {selectedRecommendation.category}</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowImplementationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real app, this would trigger the implementation
                  setShowImplementationModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-md font-medium hover:from-red-700 hover:to-orange-700"
              >
                Start Implementation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 