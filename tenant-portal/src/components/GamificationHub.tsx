'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface GamificationHubProps {
  tenantId: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'payment' | 'maintenance' | 'community' | 'premium' | 'referral';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  rewardType: 'points' | 'cash' | 'discount' | 'feature';
  deadline: Date;
  completed: boolean;
  progress: number;
  maxProgress: number;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
}

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar: string;
  achievements: number;
}

interface UserProfile {
  level: number;
  points: number;
  totalPoints: number;
  achievements: number;
  rank: number;
  streak: number;
  nextLevelPoints: number;
  progressToNextLevel: number;
}

export default function GamificationHub({ tenantId }: GamificationHubProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState<{ type: string; value: number } | null>(null);

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
    initializeGamificationData();
  }, [loadTenantData]);

  const initializeGamificationData = () => {
    // Achievements
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'Early Bird',
        description: 'Pay rent 5 days early',
        icon: '🐦',
        points: 100,
        category: 'payment',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Perfect Tenant',
        description: 'No late payments for 6 months',
        icon: '⭐',
        points: 500,
        category: 'payment',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '3',
        name: 'Maintenance Master',
        description: 'Submit 10 maintenance requests',
        icon: '🔧',
        points: 200,
        category: 'maintenance',
        unlocked: false,
        progress: 7,
        maxProgress: 10
      },
      {
        id: '4',
        name: 'Community Champion',
        description: 'Participate in 3 community events',
        icon: '🤝',
        points: 150,
        category: 'community',
        unlocked: false,
        progress: 1,
        maxProgress: 3
      },
      {
        id: '5',
        name: 'Premium Pioneer',
        description: 'Subscribe to 3 premium features',
        icon: '💎',
        points: 300,
        category: 'premium',
        unlocked: false,
        progress: 1,
        maxProgress: 3
      },
      {
        id: '6',
        name: 'Referral Rockstar',
        description: 'Refer 5 successful tenants',
        icon: '🎯',
        points: 1000,
        category: 'referral',
        unlocked: false,
        progress: 2,
        maxProgress: 5
      }
    ];

    setAchievements(mockAchievements);

    // Challenges
    const mockChallenges: Challenge[] = [
      {
        id: '1',
        title: 'Payment Streak',
        description: 'Pay rent on time for 3 consecutive months',
        reward: 250,
        rewardType: 'points',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 2,
        maxProgress: 3,
        category: 'monthly'
      },
      {
        id: '2',
        title: 'Quick Response',
        description: 'Submit a maintenance request and rate it 5 stars',
        reward: 50,
        rewardType: 'points',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 0,
        maxProgress: 1,
        category: 'weekly'
      },
      {
        id: '3',
        title: 'Premium Explorer',
        description: 'Try a new premium feature this week',
        reward: 100,
        rewardType: 'points',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 0,
        maxProgress: 1,
        category: 'weekly'
      },
      {
        id: '4',
        title: 'Community Builder',
        description: 'Attend the monthly community meeting',
        reward: 75,
        rewardType: 'points',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 0,
        maxProgress: 1,
        category: 'monthly'
      },
      {
        id: '5',
        title: 'Referral Rush',
        description: 'Submit 3 referrals this month',
        reward: 500,
        rewardType: 'cash',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 1,
        maxProgress: 3,
        category: 'monthly'
      }
    ];

    setChallenges(mockChallenges);

    // Leaderboard
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        id: '1',
        name: 'John Smith',
        points: 2850,
        rank: 1,
        avatar: '👑',
        achievements: 12
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        points: 2400,
        rank: 2,
        avatar: '🥈',
        achievements: 10
      },
      {
        id: '3',
        name: 'Mike Chen',
        points: 2100,
        rank: 3,
        avatar: '🥉',
        achievements: 8
      },
      {
        id: '4',
        name: 'Emily Rodriguez',
        points: 1850,
        rank: 4,
        avatar: '🏅',
        achievements: 7
      },
      {
        id: '5',
        name: 'David Kim',
        points: 1600,
        rank: 5,
        avatar: '🎖️',
        achievements: 6
      }
    ];

    setLeaderboard(mockLeaderboard);

    // User Profile
    const userProfile: UserProfile = {
      level: 8,
      points: 2850,
      totalPoints: 4200,
      achievements: 12,
      rank: 1,
      streak: 15,
      nextLevelPoints: 3000,
      progressToNextLevel: 95
    };

    setUserProfile(userProfile);
  };

  const handleChallengeComplete = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, completed: true, progress: c.maxProgress } : c
    ));

    // Award points
    if (userProfile) {
      setUserProfile(prev => prev ? {
        ...prev,
        points: prev.points + challenge.reward,
        totalPoints: prev.totalPoints + challenge.reward
      } : null);
    }

    // Show reward modal
    setSelectedReward({
      type: challenge.rewardType,
      value: challenge.reward
    });
    setShowRewardModal(true);

    // Track completion
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'challenge_completed', {
        challenge_id: challengeId,
        challenge_title: challenge.title,
        reward_value: challenge.reward,
        reward_type: challenge.rewardType
      });
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'from-purple-600 to-pink-600';
    if (level >= 7) return 'from-blue-600 to-purple-600';
    if (level >= 4) return 'from-green-600 to-blue-600';
    return 'from-yellow-600 to-orange-600';
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'community': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'referral': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tenant || !userProfile) {
    return (
      <div className="text-center text-red-600">
        Failed to load gamification data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile Header */}
      <div className={`bg-gradient-to-r ${getLevelColor(userProfile.level)} rounded-lg p-6 text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Level {userProfile.level} Tenant</h2>
            <p className="text-white/80">
              {userProfile.points} points • {userProfile.achievements} achievements • {userProfile.streak} day streak
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">#{userProfile.rank}</div>
            <div className="text-sm text-white/80">Rank</div>
          </div>
        </div>
        
        {/* Level Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {userProfile.level + 1}</span>
            <span>{userProfile.points}/{userProfile.nextLevelPoints}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${userProfile.progressToNextLevel}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Total Points</h3>
          <p className="text-2xl font-bold text-gray-900">{userProfile.totalPoints}</p>
          <p className="text-sm text-gray-500">earned</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Achievements</h3>
          <p className="text-2xl font-bold text-blue-600">{userProfile.achievements}</p>
          <p className="text-sm text-gray-500">unlocked</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
          <p className="text-2xl font-bold text-purple-600">{userProfile.streak}</p>
          <p className="text-sm text-gray-500">days</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500">Active Challenges</h3>
          <p className="text-2xl font-bold text-orange-600">{challenges.filter(c => !c.completed).length}</p>
          <p className="text-sm text-gray-500">available</p>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.filter(c => !c.completed).map((challenge) => (
            <motion.div
              key={challenge.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  challenge.category === 'daily' ? 'bg-red-100 text-red-800' :
                  challenge.category === 'weekly' ? 'bg-yellow-100 text-yellow-800' :
                  challenge.category === 'monthly' ? 'bg-blue-100 text-blue-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {challenge.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{challenge.progress}/{challenge.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Due: {challenge.deadline.toLocaleDateString()}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {challenge.rewardType === 'cash' ? PaymentService.formatCurrency(challenge.reward) : `${challenge.reward} pts`}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {challenge.rewardType} reward
                  </div>
                </div>
              </div>

              {challenge.progress >= challenge.maxProgress && (
                <button
                  onClick={() => handleChallengeComplete(challenge.id)}
                  className="w-full mt-3 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  Claim Reward
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                achievement.unlocked
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                    {achievement.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{achievement.points}</div>
                  <div className="text-xs text-gray-500">pts</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              
              {achievement.unlocked ? (
                <div className="text-sm text-green-600">
                  ✓ Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                </div>
              ) : achievement.progress !== undefined ? (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Not started</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leaderboard</h3>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center space-x-4 p-3 rounded-lg ${
                entry.id === '1' ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="text-2xl">{entry.avatar}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{entry.name}</h4>
                <p className="text-sm text-gray-500">{entry.achievements} achievements</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{entry.points}</div>
                <div className="text-sm text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-md text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-4">Challenge Completed!</h3>
            <p className="text-gray-600 mb-4">Congratulations! You&apos;ve earned your reward.</p>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
              <div className="text-2xl font-bold text-green-600">
                {selectedReward.type === 'cash' 
                  ? PaymentService.formatCurrency(selectedReward.value)
                  : `${selectedReward.value} points`
                }
              </div>
              <div className="text-sm text-green-700 capitalize">
                {selectedReward.type} reward
              </div>
            </div>

            <button
              onClick={() => setShowRewardModal(false)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200"
            >
              Awesome!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
} 