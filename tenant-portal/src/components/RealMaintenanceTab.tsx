'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MaintenanceRequest, TenantPortalDB, mockData } from '../lib/database';

interface RealMaintenanceTabProps {
  tenantId: string;
}

export default function RealMaintenanceTab({ tenantId }: RealMaintenanceTabProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'other' as MaintenanceRequest['category'],
    priority: 'medium' as MaintenanceRequest['priority'],
    photos: [] as File[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadMaintenanceRequests();
  }, [tenantId]);

  const loadMaintenanceRequests = async () => {
    setLoading(true);
    try {
      // Try to load from database first
      const dbRequests = await TenantPortalDB.getMaintenanceRequests(tenantId);
      if (dbRequests.length > 0) {
        setRequests(dbRequests);
      } else {
        // Fallback to mock data
        setRequests(mockData.maintenanceRequests);
      }
    } catch (error) {
      console.error('Error loading maintenance requests:', error);
      setRequests(mockData.maintenanceRequests);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewRequestModal(true);
  };

  const submitNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!newRequest.title.trim()) {
        throw new Error('Title is required');
      }
      if (!newRequest.description.trim()) {
        throw new Error('Description is required');
      }

      // Create maintenance request
      const requestData = {
        tenant_id: tenantId,
        unit_id: 'unit_1', // In real app, get from tenant data
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        priority: newRequest.priority,
        status: 'pending' as const,
      };

      const result = await TenantPortalDB.createMaintenanceRequest(requestData);
      
      if (result) {
        setSuccess('Maintenance request submitted successfully!');
        setShowNewRequestModal(false);
        setNewRequest({
          title: '',
          description: '',
          category: 'other',
          priority: 'medium',
          photos: [],
        });
        loadMaintenanceRequests(); // Refresh requests
      } else {
        throw new Error('Failed to submit maintenance request');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestAction = async (request: MaintenanceRequest, action: string) => {
    switch (action) {
      case 'view_details':
        setSelectedRequest(request);
        break;
      case 'update':
        // Show update modal
        alert(`Update Request: ${request.title}\n\nThis would open an update form in a real implementation.`);
        break;
      case 'cancel':
        if (confirm('Are you sure you want to cancel this maintenance request?')) {
          try {
            const success = await TenantPortalDB.updateMaintenanceRequest(request.id, {
              status: 'cancelled',
            });
            if (success) {
              setSuccess('Request cancelled successfully!');
              loadMaintenanceRequests();
            } else {
              setError('Failed to cancel request');
            }
          } catch (error) {
            setError('Failed to cancel request');
          }
        }
        break;
      default:
        console.log(`Maintenance action: ${action}`);
    }
  };

  const getStatusInfo = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' };
      case 'assigned':
        return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Assigned' };
      case 'in_progress':
        return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'In Progress' };
      case 'completed':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Completed' };
      case 'cancelled':
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Cancelled' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const getPriorityInfo = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'emergency':
        return { color: 'text-red-600', bg: 'bg-red-100', text: 'Emergency' };
      case 'high':
        return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'High' };
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Medium' };
      case 'low':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Low' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const getMaintenanceStats = () => {
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      inProgress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      averageResolutionTime: 0,
    };

    const completedRequests = requests.filter(r => r.status === 'completed' && r.actual_completion);
    if (completedRequests.length > 0) {
      const totalDays = completedRequests.reduce((sum, req) => {
        const created = new Date(req.created_at);
        const completed = new Date(req.actual_completion!);
        return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0);
      stats.averageResolutionTime = Math.round(totalDays / completedRequests.length);
    }

    return stats;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewRequest({ ...newRequest, photos: [...newRequest.photos, ...files] });
  };

  const removePhoto = (index: number) => {
    setNewRequest({
      ...newRequest,
      photos: newRequest.photos.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getMaintenanceStats();

  return (
    <div className="space-y-6">
      {/* Maintenance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Avg. Resolution</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.averageResolutionTime} days</p>
        </div>
      </div>

      {/* New Request Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
        <button
          onClick={handleNewRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          New Request
        </button>
      </div>

      {/* Maintenance Requests List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const priorityInfo = getPriorityInfo(request.priority);
                return (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{request.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {request.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityInfo.bg} ${priorityInfo.color}`}>
                        {priorityInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleRequestAction(request, 'view_details')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleRequestAction(request, 'update')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleRequestAction(request, 'cancel')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewRequestModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">New Maintenance Request</h3>
              
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

              <form onSubmit={submitNewRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed description of the problem..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value as MaintenanceRequest['category'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="appliance">Appliance</option>
                      <option value="structural">Structural</option>
                      <option value="pest">Pest Control</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newRequest.priority}
                      onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as MaintenanceRequest['priority'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {newRequest.photos.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {newRequest.photos.map((photo, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{photo.name}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestModal(false)}
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
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Details Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Request Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedRequest.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedRequest.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedRequest.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Priority:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedRequest.priority}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <p className="text-sm text-gray-900 capitalize">{selectedRequest.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Created:</span>
                    <p className="text-sm text-gray-900">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedRequest.estimated_completion && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estimated Completion:</span>
                    <p className="text-sm text-gray-900">{new Date(selectedRequest.estimated_completion).toLocaleDateString()}</p>
                  </div>
                )}
                
                {selectedRequest.assigned_to && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Assigned To:</span>
                    <p className="text-sm text-gray-900">{selectedRequest.assigned_to}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 