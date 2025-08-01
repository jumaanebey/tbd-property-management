'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface ReferralProgramProps {
  tenantId: string;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'contacted' | 'viewing' | 'applied' | 'approved' | 'moved_in' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  commission: number;
  bonus: number;
}

interface ReferralTier {
  id: string;
  name: string;
  referralsRequired: number;
  bonus: number;
  benefits: string[];
  currentProgress: number;
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
  averageCommission: number;
}

export default function ReferralProgram({ tenantId }: ReferralProgramProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralForm, setReferralForm] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'friend',
    message: ''
  });
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tiers, setTiers] = useState<ReferralTier[]>([]);
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
    initializeReferralData();
  }, [loadTenantData]);

  const initializeReferralData = () => {
    // Mock referral data
    const mockReferrals: Referral[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(555) 123-4567',
        status: 'moved_in',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        commission: 500,
        bonus: 100
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        phone: '(555) 234-5678',
        status: 'approved',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        commission: 500,
        bonus: 50
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.r@email.com',
        phone: '(555) 345-6789',
        status: 'viewing',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        commission: 0,
        bonus: 0
      }
    ];

    setReferrals(mockReferrals);

    // Referral tiers
    const referralTiers: ReferralTier[] = [
      {
        id: 'bronze',
        name: 'Bronze Referrer',
        referralsRequired: 1,
        bonus: 50,
        benefits: ['$50 bonus per referral', 'Priority support access'],
        currentProgress: 3
      },
      {
        id: 'silver',
        name: 'Silver Referrer',
        referralsRequired: 3,
        bonus: 100,
        benefits: ['$100 bonus per referral', 'Free cleaning service', 'Priority maintenance'],
        currentProgress: 3
      },
      {
        id: 'gold',
        name: 'Gold Referrer',
        referralsRequired: 5,
        bonus: 200,
        benefits: ['$200 bonus per referral', 'Free parking spot', 'Premium support', 'Monthly gift card'],
        currentProgress: 3
      },
      {
        id: 'platinum',
        name: 'Platinum Referrer',
        referralsRequired: 10,
        bonus: 500,
        benefits: ['$500 bonus per referral', 'Rent discount', 'All premium features', 'VIP events'],
        currentProgress: 3
      }
    ];

    setTiers(referralTiers);

    // Calculate stats
    const successfulReferrals = mockReferrals.filter(r => r.status === 'moved_in').length;
    const totalEarnings = mockReferrals.reduce((sum, r) => sum + r.commission + r.bonus, 0);
    const pendingEarnings = mockReferrals
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + r.commission + r.bonus, 0);

    const stats: ReferralStats = {
      totalReferrals: mockReferrals.length,
      successfulReferrals,
      totalEarnings,
      pendingEarnings,
      conversionRate: (successfulReferrals / mockReferrals.length) * 100,
      averageCommission: totalEarnings / successfulReferrals || 0
    };

    setStats(stats);
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!referralForm.name.trim() || !referralForm.email.trim()) {
        throw new Error('Name and email are required');
      }

      // Create new referral
      const newReferral: Referral = {
        id: Date.now().toString(),
        name: referralForm.name,
        email: referralForm.email,
        phone: referralForm.phone,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        commission: 500,
        bonus: 50
      };

      setReferrals(prev => [...prev, newReferral]);
      setShowReferralModal(false);
      setReferralForm({
        name: '',
        email: '',
        phone: '',
        relationship: 'friend',
        message: ''
      });

      setSuccess('Referral submitted successfully! We\'ll contact them within 24 hours.');

      // Track referral event
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'referral_submitted', {
          referral_name: newReferral.name,
          referral_email: newReferral.email,
          value: newReferral.commission + newReferral.bonus
        });
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit referral');
    }
  };

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'moved_in': return 'text-green-600 bg-green-100';
      case 'approved': return 'text-blue-600 bg-blue-100';
      case 'applied': return 'text-yellow-600 bg-yellow-100';
      case 'viewing': return 'text-purple-600 bg-purple-100';
      case 'contacted': return 'text-orange-600 bg-orange-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCurrentTier = () => {
    return tiers.find(tier => stats && stats.successfulReferrals >= tier.referralsRequired) || tiers[0];
  };

  const getNextTier = () => {
    const currentTier = getCurrentTier();
    const currentIndex = tiers.findIndex(tier => tier.id === currentTier.id);
    return tiers[currentIndex + 1] || null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant || !stats) {
    return (
      <div className="text-center text-red-600">
        Failed to load referral data
      </div>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();

  return (
    <div className="space-y-6">
      {/* Referral Program Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Referral Program</h2>
            <p className="text-green-100">
              Earn up to $500 for every successful referral. Share the love and get rewarded!
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{PaymentService.formatCurrency(stats.totalEarnings)}</div>
            <div className="text-sm text-green-100">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Total Referrals</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
          <p className="text-sm text-gray-500">submitted</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Successful</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.successfulReferrals}</p>
          <p className="text-sm text-gray-500">moved in</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500">success rate</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500">Pending Earnings</h3>
          <p className="text-2xl font-bold text-orange-600">{PaymentService.formatCurrency(stats.pendingEarnings)}</p>
          <p className="text-sm text-gray-500">to be paid</p>
        </div>
      </div>

      {/* Current Tier Status */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Referral Tier</h3>
          <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-medium">
            {currentTier.name}
          </span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to next tier</span>
            <span>{stats.successfulReferrals}/{nextTier?.referralsRequired || currentTier.referralsRequired}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.successfulReferrals / (nextTier?.referralsRequired || currentTier.referralsRequired)) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Current Benefits:</h4>
            <ul className="space-y-1">
              {currentTier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <span className="text-green-500 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          {nextTier && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Next Tier Benefits:</h4>
              <ul className="space-y-1">
                {nextTier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-blue-500 mr-2">→</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Referral List */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Referrals</h3>
          <button
            onClick={() => setShowReferralModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
          >
            + Add Referral
          </button>
        </div>
        
        <div className="space-y-4">
          {referrals.map((referral) => (
            <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{referral.name}</h4>
                <p className="text-sm text-gray-500">{referral.email}</p>
                <p className="text-sm text-gray-500">{referral.phone}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                  {referral.status.replace('_', ' ')}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  {referral.createdAt.toLocaleDateString()}
                </div>
                {(referral.commission > 0 || referral.bonus > 0) && (
                  <div className="text-sm font-semibold text-green-600 mt-1">
                    +{PaymentService.formatCurrency(referral.commission + referral.bonus)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4">Add New Referral</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleReferralSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={referralForm.name}
                  onChange={(e) => setReferralForm({ ...referralForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={referralForm.email}
                  onChange={(e) => setReferralForm({ ...referralForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={referralForm.phone}
                  onChange={(e) => setReferralForm({ ...referralForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  value={referralForm.relationship}
                  onChange={(e) => setReferralForm({ ...referralForm, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="friend">Friend</option>
                  <option value="family">Family</option>
                  <option value="colleague">Colleague</option>
                  <option value="acquaintance">Acquaintance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={referralForm.message}
                  onChange={(e) => setReferralForm({ ...referralForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Tell them why they'd love living here..."
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-700">
                  <strong>Earnings Potential:</strong> $500 commission + $50 bonus = $550 total
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReferralModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-md font-medium hover:from-green-700 hover:to-emerald-700"
                >
                  Submit Referral
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 