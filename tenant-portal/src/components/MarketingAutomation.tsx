'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface MarketingAutomationProps {
  tenantId: string;
}

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  trigger: 'behavioral' | 'time_based' | 'event_based';
  status: 'active' | 'paused' | 'draft';
  conversionRate: number;
  revenue: number;
  audience: number;
}

interface PersonalizedOffer {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  finalPrice: number;
  urgency: 'low' | 'medium' | 'high';
  expiresAt: Date;
  conditions: string[];
  conversionProbability: number;
}

interface BehavioralTrigger {
  id: string;
  name: string;
  condition: string;
  action: string;
  status: 'active' | 'inactive';
  conversions: number;
  revenue: number;
}

export default function MarketingAutomation({ tenantId }: MarketingAutomationProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOffers, setActiveOffers] = useState<PersonalizedOffer[]>([]);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<PersonalizedOffer | null>(null);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [triggers, setTriggers] = useState<BehavioralTrigger[]>([]);

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
    initializeMarketingData();
  }, [loadTenantData]);

  const initializeMarketingData = () => {
    // Personalized offers based on tenant behavior
    const offers: PersonalizedOffer[] = [
      {
        id: '1',
        title: 'Premium Support Upgrade',
        description: 'Upgrade to 24/7 priority support with 15-minute response guarantee',
        discount: 25,
        originalPrice: 39.99,
        finalPrice: 29.99,
        urgency: 'high',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        conditions: ['Limited time offer', 'Auto-renewal', 'Cancel anytime'],
        conversionProbability: 0.85
      },
      {
        id: '2',
        title: 'Smart Home Bundle',
        description: 'Complete smart home setup with Nest thermostat and security cameras',
        discount: 30,
        originalPrice: 199.99,
        finalPrice: 139.99,
        urgency: 'medium',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        conditions: ['Installation included', '1-year warranty', 'Monthly monitoring'],
        conversionProbability: 0.72
      },
      {
        id: '3',
        title: 'Cleaning Service Trial',
        description: 'Try our premium cleaning service for 50% off your first month',
        discount: 50,
        originalPrice: 159.99,
        finalPrice: 79.99,
        urgency: 'low',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        conditions: ['One-time offer', 'Professional cleaners', 'Satisfaction guaranteed'],
        conversionProbability: 0.68
      }
    ];

    setActiveOffers(offers);

    // Marketing campaigns
    const marketingCampaigns: MarketingCampaign[] = [
      {
        id: '1',
        name: 'Payment Reminder Series',
        type: 'email',
        trigger: 'time_based',
        status: 'active',
        conversionRate: 0.78,
        revenue: 33600,
        audience: 150
      },
      {
        id: '2',
        name: 'Maintenance Follow-up',
        type: 'sms',
        trigger: 'event_based',
        status: 'active',
        conversionRate: 0.65,
        revenue: 12400,
        audience: 89
      },
      {
        id: '3',
        name: 'Premium Feature Promotion',
        type: 'in_app',
        trigger: 'behavioral',
        status: 'active',
        conversionRate: 0.42,
        revenue: 8900,
        audience: 67
      },
      {
        id: '4',
        name: 'Lease Renewal Campaign',
        type: 'email',
        trigger: 'time_based',
        status: 'active',
        conversionRate: 0.91,
        revenue: 45600,
        audience: 45
      }
    ];

    setCampaigns(marketingCampaigns);

    // Behavioral triggers
    const behavioralTriggers: BehavioralTrigger[] = [
      {
        id: '1',
        name: 'Late Payment Alert',
        condition: 'Payment > 3 days late',
        action: 'Send SMS reminder + offer payment plan',
        status: 'active',
        conversions: 23,
        revenue: 9200
      },
      {
        id: '2',
        name: 'High Maintenance User',
        condition: '3+ maintenance requests in 30 days',
        action: 'Offer maintenance package discount',
        status: 'active',
        conversions: 15,
        revenue: 5400
      },
      {
        id: '3',
        name: 'Document Download Spike',
        condition: '5+ document downloads in 1 week',
        action: 'Promote premium document features',
        status: 'active',
        conversions: 8,
        revenue: 2400
      },
      {
        id: '4',
        name: 'Lease Expiry Warning',
        condition: 'Lease expires in < 60 days',
        action: 'Send renewal offer with incentives',
        status: 'active',
        conversions: 12,
        revenue: 28800
      }
    ];

    setTriggers(behavioralTriggers);
  };

  const handleOfferClick = (offer: PersonalizedOffer) => {
    setSelectedOffer(offer);
    setShowOfferModal(true);
    
    // Track offer view
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'offer_view', {
        offer_id: offer.id,
        offer_value: offer.finalPrice,
        currency: 'USD'
      });
    }
  };

  const handleOfferAccept = async (offer: PersonalizedOffer) => {
    try {
      // Process the offer acceptance
      const result = await PaymentService.mockProcessPayment(offer.finalPrice, 'credit_card');
      
      if (result.success) {
        // Track conversion
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'offer_conversion', {
            offer_id: offer.id,
            offer_value: offer.finalPrice,
            currency: 'USD',
            conversion_value: offer.finalPrice
          });
        }
        
        setShowOfferModal(false);
        // In a real app, you would update the tenant's subscription
      }
    } catch (err) {
      console.error('Error processing offer:', err);
    }
  };

  const getTotalRevenue = () => {
    return campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
  };

  const getAverageConversionRate = () => {
    const totalRate = campaigns.reduce((sum, campaign) => sum + campaign.conversionRate, 0);
    return (totalRate / campaigns.length) * 100;
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

  return (
    <div className="space-y-6">
      {/* Marketing Automation Header */}
      <div className="bg-gradient-to-r from-pink-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Marketing Automation</h2>
            <p className="text-pink-100">
              AI-powered campaigns and personalized offers to enhance your experience
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{PaymentService.formatCurrency(getTotalRevenue())}</div>
            <div className="text-sm text-pink-100">Total Revenue Generated</div>
          </div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Active Campaigns</h3>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
          <p className="text-sm text-gray-500">running</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Avg Conversion Rate</h3>
          <p className="text-2xl font-bold text-green-600">
            {getAverageConversionRate().toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500">across campaigns</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Active Offers</h3>
          <p className="text-2xl font-bold text-purple-600">{activeOffers.length}</p>
          <p className="text-sm text-gray-500">personalized</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500">Behavioral Triggers</h3>
          <p className="text-2xl font-bold text-orange-600">
            {triggers.filter(t => t.status === 'active').length}
          </p>
          <p className="text-sm text-gray-500">monitoring</p>
        </div>
      </div>

      {/* Personalized Offers */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personalized Offers for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeOffers.map((offer) => (
            <motion.div
              key={offer.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                offer.urgency === 'high' 
                  ? 'border-red-200 bg-red-50 hover:border-red-300' 
                  : offer.urgency === 'medium'
                  ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                  : 'border-blue-200 bg-blue-50 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleOfferClick(offer)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{offer.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  offer.urgency === 'high' ? 'bg-red-100 text-red-800' :
                  offer.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {offer.urgency === 'high' ? 'Urgent' : 
                   offer.urgency === 'medium' ? 'Limited' : 'Special'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-lg font-bold text-green-600">
                    {PaymentService.formatCurrency(offer.finalPrice)}
                  </span>
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {PaymentService.formatCurrency(offer.originalPrice)}
                  </span>
                </div>
                <span className="text-sm text-green-600 font-medium">
                  {offer.discount}% OFF
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                Expires: {offer.expiresAt.toLocaleDateString()}
              </div>
              <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                Claim Offer
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                <p className="text-sm text-gray-500">
                  {campaign.type.toUpperCase()} • {campaign.trigger.replace('_', ' ')} • {campaign.audience} recipients
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {PaymentService.formatCurrency(campaign.revenue)}
                </div>
                <div className="text-sm text-gray-500">
                  {(campaign.conversionRate * 100).toFixed(1)}% conversion
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Triggers */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Behavioral Triggers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {triggers.filter(t => t.status === 'active').map((trigger) => (
            <div key={trigger.id} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">{trigger.name}</h4>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Condition:</strong> {trigger.condition}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Action:</strong> {trigger.action}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {trigger.conversions} conversions
                </span>
                <span className="text-sm font-semibold text-green-600">
                  {PaymentService.formatCurrency(trigger.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && selectedOffer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">{selectedOffer.title}</h3>
            <p className="text-gray-600 mb-4">{selectedOffer.description}</p>
            
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {PaymentService.formatCurrency(selectedOffer.finalPrice)}
                  </div>
                  <div className="text-sm text-green-700">
                    {selectedOffer.discount}% off original price
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">
                    {PaymentService.formatCurrency(selectedOffer.originalPrice)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedOffer.conditions.map((condition, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {condition}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              Offer expires: {selectedOffer.expiresAt.toLocaleDateString()} at {selectedOffer.expiresAt.toLocaleTimeString()}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={() => handleOfferAccept(selectedOffer)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md font-medium hover:from-green-700 hover:to-blue-700"
              >
                Accept Offer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 