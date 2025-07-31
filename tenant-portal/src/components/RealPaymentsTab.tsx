'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Payment, TenantPortalDB, mockData } from '../lib/database';
import { PaymentService, paymentValidation } from '../lib/paymentService';

interface RealPaymentsTabProps {
  tenantId: string;
}

export default function RealPaymentsTab({ tenantId }: RealPaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    saveMethod: false,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, [tenantId]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // Try to load from database first
      const dbPayments = await TenantPortalDB.getPayments(tenantId);
      if (dbPayments.length > 0) {
        setPayments(dbPayments);
      } else {
        // Fallback to mock data
        setPayments(mockData.payments);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments(mockData.payments);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      ...paymentForm,
      amount: (payment.amount / 100).toString(), // Convert from cents
    });
    setShowPaymentModal(true);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!paymentValidation.validateAmount(paymentForm.amount)) {
        throw new Error('Invalid payment amount');
      }

      if (paymentForm.paymentMethod === 'credit_card') {
        if (!paymentValidation.validateCardNumber(paymentForm.cardNumber)) {
          throw new Error('Invalid card number');
        }
        if (!paymentValidation.validateExpiryDate(paymentForm.expiryDate)) {
          throw new Error('Invalid expiry date');
        }
        if (!paymentValidation.validateCVV(paymentForm.cvv)) {
          throw new Error('Invalid CVV');
        }
      }

      const amount = PaymentService.parseCurrencyToCents(paymentForm.amount);
      
      // Process payment
      const result = await PaymentService.mockProcessPayment(amount, paymentForm.paymentMethod);
      
      if (result.success) {
        // Update payment in database
        if (selectedPayment) {
          const success = await TenantPortalDB.updatePaymentStatus(
            selectedPayment.id,
            'paid',
            new Date().toISOString()
          );
          
          if (success) {
            setSuccess('Payment processed successfully!');
            setShowPaymentModal(false);
            loadPayments(); // Refresh payments
          } else {
            throw new Error('Failed to update payment status');
          }
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentAction = async (payment: Payment, action: string) => {
    switch (action) {
      case 'pay':
        handlePayment(payment);
        break;
      case 'download_receipt':
        if (payment.status === 'paid') {
          const receipt = PaymentService.generateReceipt(payment);
          const blob = new Blob([receipt], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt_${payment.id}.txt`;
          a.click();
          URL.revokeObjectURL(url);
        }
        break;
      case 'view_details':
        // Show payment details modal
        alert(`Payment Details:\n\nAmount: ${PaymentService.formatCurrency(payment.amount)}\nDue Date: ${new Date(payment.due_date).toLocaleDateString()}\nStatus: ${payment.status}\nMethod: ${payment.payment_method || 'N/A'}`);
        break;
      default:
        console.log(`Payment action: ${action}`);
    }
  };

  const getPaymentStatusInfo = (payment: Payment) => {
    const status = PaymentService.getPaymentStatus(payment);
    
    switch (status.status) {
      case 'paid':
        return { color: 'text-green-600', bg: 'bg-green-100', text: 'Paid' };
      case 'pending':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Pending' };
      case 'overdue':
        return { color: 'text-red-600', bg: 'bg-red-100', text: `Overdue (${status.daysLate} days)` };
      case 'partial':
        return { color: 'text-blue-600', bg: 'bg-blue-100', text: 'Partial' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', text: 'Unknown' };
    }
  };

  const getPaymentHistorySummary = () => {
    return PaymentService.getPaymentHistorySummary(payments);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = getPaymentHistorySummary();

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">
            {PaymentService.formatCurrency(summary.totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {PaymentService.formatCurrency(summary.totalPending)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
          <p className="text-2xl font-bold text-red-600">
            {PaymentService.formatCurrency(summary.totalOverdue)}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">On-Time Rate</h3>
          <p className="text-2xl font-bold text-blue-600">
            {summary.onTimePayments + summary.latePayments > 0 
              ? Math.round((summary.onTimePayments / (summary.onTimePayments + summary.latePayments)) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => {
                const statusInfo = getPaymentStatusInfo(payment);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {PaymentService.formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_method ? payment.payment_method.replace('_', ' ').toUpperCase() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => handlePayment(payment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Pay Now
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => handlePaymentAction(payment, 'download_receipt')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Receipt
                        </button>
                      )}
                      <button
                        onClick={() => handlePaymentAction(payment, 'view_details')}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
              
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

              <form onSubmit={processPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {paymentForm.paymentMethod.includes('card') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={paymentForm.expiryDate}
                          onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveMethod"
                    checked={paymentForm.saveMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, saveMethod: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveMethod" className="ml-2 block text-sm text-gray-900">
                    Save payment method for future use
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={processing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Pay Now'}
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