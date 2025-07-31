'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tenant, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService } from '../lib/paymentService';

interface RealDashboardTabProps {
  tenantId: string;
}

export default function RealDashboardTab({ tenantId }: RealDashboardTabProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
  });
  const [scheduleForm, setScheduleForm] = useState({
    type: 'maintenance' as 'maintenance' | 'inspection' | 'tour' | 'other',
    date: '',
    time: '',
    description: '',
  });
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTenantData();
  }, [tenantId, loadTenantData]);

  const loadTenantData = async () => {
    setLoading(true);
    try {
      // Try to load from database first
      const dbTenant = await TenantPortalDB.getTenant(tenantId);
      if (dbTenant) {
        setTenant(dbTenant);
        setProfileForm({
          first_name: dbTenant.first_name,
          last_name: dbTenant.last_name,
          email: dbTenant.email,
          phone: dbTenant.phone,
          emergency_contact_name: dbTenant.emergency_contact_name,
          emergency_contact_phone: dbTenant.emergency_contact_phone,
          emergency_contact_relationship: dbTenant.emergency_contact_relationship,
        });
      } else {
        // Fallback to mock data
        setTenant(mockData.tenant);
        setProfileForm({
          first_name: mockData.tenant.first_name,
          last_name: mockData.tenant.last_name,
          email: mockData.tenant.email,
          phone: mockData.tenant.phone,
          emergency_contact_name: mockData.tenant.emergency_contact_name,
          emergency_contact_phone: mockData.tenant.emergency_contact_phone,
          emergency_contact_relationship: mockData.tenant.emergency_contact_relationship,
        });
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
      setTenant(mockData.tenant);
      setProfileForm({
        first_name: mockData.tenant.first_name,
        last_name: mockData.tenant.last_name,
        email: mockData.tenant.email,
        phone: mockData.tenant.phone,
        emergency_contact_name: mockData.tenant.emergency_contact_name,
        emergency_contact_phone: mockData.tenant.emergency_contact_phone,
        emergency_contact_relationship: mockData.tenant.emergency_contact_relationship,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setError(null);
    setSuccess(null);

    try {
      switch (action) {
        case 'pay_rent':
          // Redirect to payments tab or open payment modal
          window.location.hash = '#payments';
          setSuccess('Redirecting to payments...');
          break;
          
        case 'maintenance_request':
          // Redirect to maintenance tab
          window.location.hash = '#maintenance';
          setSuccess('Redirecting to maintenance...');
          break;
          
        case 'contact_support':
          setShowContactModal(true);
          break;
          
        case 'schedule_viewing':
          setShowScheduleModal(true);
          break;
          
        case 'request_document':
          // Redirect to documents tab
          window.location.hash = '#documents';
          setSuccess('Redirecting to documents...');
          break;
          
        case 'update_profile':
          setShowProfileModal(true);
          break;
          
        case 'emergency_contact':
          setShowEmergencyModal(true);
          break;
          
        case 'view_all_activity':
          // Show activity log
          alert('Activity Log:\n\n• Rent payment processed - Jan 1, 2024\n• Maintenance request submitted - Jan 15, 2024\n• Document uploaded - Jan 20, 2024\n• Lease renewal reminder - Jan 25, 2024');
          break;
          
        default:
          console.log(`Quick action: ${action}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const submitContactForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Message sent successfully! We\'ll get back to you within 24 hours.');
      setShowContactModal(false);
      setContactForm({
        subject: '',
        message: '',
        priority: 'normal',
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitScheduleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Schedule request submitted! We\'ll confirm within 2 hours.');
      setShowScheduleModal(false);
      setScheduleForm({
        type: 'maintenance',
        date: '',
        time: '',
        description: '',
      });
    } catch (err) {
      console.error('Error submitting schedule request:', err);
      setError('Failed to submit schedule request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitProfileForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Update tenant profile in database
      const success = await TenantPortalDB.updateTenantProfile(tenantId, profileForm);
      
      if (success) {
        setSuccess('Profile updated successfully!');
        setShowProfileModal(false);
        loadTenantData(); // Refresh data
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergencyContact = () => {
    if (tenant) {
      const message = `Emergency Contact Information:\n\nName: ${tenant.emergency_contact_name}\nPhone: ${tenant.emergency_contact_phone}\nRelationship: ${tenant.emergency_contact_relationship}\n\nCalling emergency contact...`;
      alert(message);
      
      // In a real app, you would trigger an emergency notification system
      setTimeout(() => {
        alert('Emergency contact has been notified. They will call you shortly.');
      }, 2000);
    }
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

  const quickActions = [
    {
      id: 'pay_rent',
      title: 'Pay Rent',
      icon: '💰',
      color: 'from-green-600 to-green-700',
      description: 'Make a rent payment'
    },
    {
      id: 'maintenance_request',
      title: 'New Request',
      icon: '🔧',
      color: 'from-blue-600 to-blue-700',
      description: 'Submit maintenance request'
    },
    {
      id: 'contact_support',
      title: 'Contact',
      icon: '📞',
      color: 'from-purple-600 to-purple-700',
      description: 'Contact property management'
    },
    {
      id: 'schedule_viewing',
      title: 'Schedule Viewing',
      icon: '📅',
      color: 'from-orange-600 to-orange-700',
      description: 'Schedule property viewing'
    },
    {
      id: 'request_document',
      title: 'Request Document',
      icon: '📄',
      color: 'from-indigo-600 to-indigo-700',
      description: 'Request documents'
    },
    {
      id: 'update_profile',
      title: 'Update Profile',
      icon: '👤',
      color: 'from-teal-600 to-teal-700',
      description: 'Update your profile'
    },
    {
      id: 'emergency_contact',
      title: 'Emergency',
      icon: '🚨',
      color: 'from-red-600 to-red-700',
      description: 'Emergency contact'
    },
    {
      id: 'view_all_activity',
      title: 'View All',
      icon: '📊',
      color: 'from-gray-600 to-gray-700',
      description: 'View all activity'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {tenant.first_name}!
        </h2>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with your rental property today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Rent Due</h3>
          <p className="text-2xl font-bold text-red-600">
            {PaymentService.formatCurrency(tenant.rent_amount)}
          </p>
          <p className="text-sm text-gray-500">Due on the 1st</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Lease End</h3>
          <p className="text-2xl font-bold text-blue-600">
            {new Date(tenant.lease_end).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">Lease expiration</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Security Deposit</h3>
          <p className="text-2xl font-bold text-green-600">
            {PaymentService.formatCurrency(tenant.security_deposit)}
          </p>
          <p className="text-sm text-gray-500">On file</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {tenant.status}
          </p>
          <p className="text-sm text-gray-500">Current status</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-lg hover:shadow-lg transition-all duration-200 text-center`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-semibold text-sm">{action.title}</div>
              <div className="text-xs opacity-90 mt-1">{action.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Rent payment processed</p>
              <p className="text-sm text-gray-500">January 1, 2024</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🔧</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Maintenance request submitted</p>
              <p className="text-sm text-gray-500">January 15, 2024</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📄</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Document uploaded</p>
              <p className="text-sm text-gray-500">January 20, 2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
            
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

            <form onSubmit={submitContactForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={contactForm.priority}
                  onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value as 'low' | 'normal' | 'high' | 'urgent' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Schedule Viewing</h3>
            
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

            <form onSubmit={submitScheduleForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={scheduleForm.type}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as 'maintenance' | 'inspection' | 'tour' | 'other' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="inspection">Inspection</option>
                  <option value="tour">Property Tour</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Update Profile</h3>
            
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

            <form onSubmit={submitProfileForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.emergency_contact_name}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={profileForm.emergency_contact_phone}
                      onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={profileForm.emergency_contact_relationship}
                    onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚨</span>
              </div>
              <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
              <p className="text-gray-600 mb-6">
                This will immediately notify your emergency contact and property management.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleEmergencyContact}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold"
                >
                  Contact Emergency Contact
                </button>
                <button
                  onClick={() => setShowEmergencyModal(false)}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 