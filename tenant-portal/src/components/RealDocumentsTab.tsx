'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, TenantPortalDB, mockData } from '../lib/database';

interface RealDocumentsTabProps {
  tenantId: string;
}

export default function RealDocumentsTab({ tenantId }: RealDocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [filter, setFilter] = useState<'all' | Document['type']>('all');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'other' as Document['type'],
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      // Try to load from database first
      const dbDocuments = await TenantPortalDB.getDocuments(tenantId);
      if (dbDocuments.length > 0) {
        setDocuments(dbDocuments);
      } else {
        // Fallback to mock data
        setDocuments(mockData.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments(mockData.documents);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDocumentAction = async (doc: Document, action: string) => {
    try {
      switch (action) {
        case 'download':
          // Create a downloadable file
          const response = await fetch(doc.file_url);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.title;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
          
        case 'view':
          // Open document in new tab
          window.open(doc.file_url, '_blank');
          break;
          
        case 'share':
          // Implement sharing functionality
          if (navigator.share) {
            await navigator.share({
              title: doc.title,
              text: `Check out this document: ${doc.title}`,
              url: doc.file_url
            });
          } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(`${doc.title} - ${doc.file_url}`);
            setSuccess('Document link copied to clipboard!');
          }
          break;
          
        case 'delete':
          if (confirm('Are you sure you want to delete this document?')) {
            // In a real app, you would delete from database
            setDocuments(documents.filter(d => d.id !== doc.id));
            setSuccess('Document deleted successfully!');
          }
          break;
          
        default:
          console.log(`Document action: ${action}`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const uploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!uploadForm.title.trim()) {
        throw new Error('Title is required');
      }
      if (!uploadForm.file) {
        throw new Error('File is required');
      }

      // In a real app, you would upload to storage and save to database
      const documentData = {
        tenant_id: tenantId,
        title: uploadForm.title,
        type: uploadForm.type,
        file_url: URL.createObjectURL(uploadForm.file), // In real app, this would be the uploaded URL
        file_size: uploadForm.file.size,
        mime_type: uploadForm.file.type,
        status: 'active' as const,
        uploaded_by: 'tenant',
      };

      const result = await TenantPortalDB.uploadDocument(documentData);
      
      if (result) {
        setSuccess('Document uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          type: 'other',
          file: null,
        });
        loadDocuments(); // Refresh documents
      } else {
        throw new Error('Failed to upload document');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const getDocumentTypeInfo = (type: Document['type']) => {
    switch (type) {
      case 'lease':
        return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Lease' };
      case 'notice':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Notice' };
      case 'receipt':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Receipt' };
      case 'maintenance':
        return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Maintenance' };
      case 'other':
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Other' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const getStatusInfo = (status: Document['status']) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Active' };
      case 'archived':
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Archived' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Documents Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Documents</h3>
          <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-green-600">
            {documents.filter(d => d.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Leases</h3>
          <p className="text-2xl font-bold text-blue-600">
            {documents.filter(d => d.type === 'lease').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Receipts</h3>
          <p className="text-2xl font-bold text-green-600">
            {documents.filter(d => d.type === 'receipt').length}
          </p>
        </div>
      </div>

      {/* Actions and Filters */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | Document['type'])}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Documents</option>
            <option value="lease">Leases</option>
            <option value="notice">Notices</option>
            <option value="receipt">Receipts</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Upload Document
        </button>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => {
                const typeInfo = getDocumentTypeInfo(document.type);
                const statusInfo = getStatusInfo(document.status);
                return (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{document.title}</div>
                        <div className="text-sm text-gray-500">{document.mime_type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                        {typeInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(document.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleDocumentAction(document, 'view')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDocumentAction(document, 'download')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDocumentAction(document, 'share')}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => handleDocumentAction(document, 'delete')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
              
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

              <form onSubmit={uploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter document title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as Document['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="lease">Lease</option>
                    <option value="notice">Notice</option>
                    <option value="receipt">Receipt</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  {uploadForm.file && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                    </p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 