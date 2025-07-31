import { Payment } from './database';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';


// Payment service class
export class PaymentService {
  private static stripe: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

  // Initialize Stripe
  static async initializeStripe() {
    if (typeof window !== 'undefined' && !this.stripe) {
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    }
    return this.stripe;
  }

  // Create payment intent
  static async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{ clientSecret: string } | null> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return { clientSecret: data.clientSecret };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  // Process payment with Stripe
  static async processPayment(
    amount: number,
    paymentMethod: string,
    _description: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Create payment intent
      const intentResult = await this.createPaymentIntent(amount);
      if (!intentResult) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentResult.clientSecret,
        {
          payment_method: paymentMethod,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        transactionId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  // Process payment with saved payment method
  static async processPaymentWithSavedMethod(
    amount: number,
    paymentMethodId: string,
    _description: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const stripe = await this.initializeStripe();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      // Create payment intent
      const intentResult = await this.createPaymentIntent(amount);
      if (!intentResult) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment with saved method
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentResult.clientSecret,
        {
          payment_method: paymentMethodId,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        transactionId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  // Save payment method for future use
  static async savePaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/payments/save-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId,
          customerId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment method');
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving payment method:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save payment method',
      };
    }
  }

  // Get saved payment methods
  static async getSavedPaymentMethods(customerId: string): Promise<any[]> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const response = await fetch(`/api/payments/saved-methods?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved payment methods');
      }

      const data = await response.json();
      return data.paymentMethods || [];
    } catch (error) {
      console.error('Error fetching saved payment methods:', error);
      return [];
    }
  }

  // Calculate late fees
  static calculateLateFees(amount: number, daysLate: number): number {
    const lateFeeRate = 0.05; // 5% late fee
    const maxLateFee = amount * 0.1; // Maximum 10% of rent
    
    const lateFee = amount * lateFeeRate * Math.ceil(daysLate / 30);
    return Math.min(lateFee, maxLateFee);
  }

  // Validate payment amount
  static validatePaymentAmount(amount: number, dueAmount: number): { valid: boolean; error?: string } {
    if (amount <= 0) {
      return { valid: false, error: 'Payment amount must be greater than zero' };
    }

    if (amount > dueAmount * 1.5) {
      return { valid: false, error: 'Payment amount cannot exceed 150% of due amount' };
    }

    return { valid: true };
  }

  // Format currency
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100); // Stripe amounts are in cents
  }

  // Parse currency string to cents
  static parseCurrencyToCents(amount: string): number {
    const numericAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    return Math.round(numericAmount * 100);
  }

  // Generate payment receipt
  static generateReceipt(payment: Payment): string {
    const receipt = `
      PAYMENT RECEIPT
      
      Receipt ID: ${payment.id}
      Date: ${new Date(payment.paid_date || '').toLocaleDateString()}
      Amount: ${this.formatCurrency(payment.amount)}
      Method: ${payment.payment_method || 'N/A'}
      Transaction ID: ${payment.transaction_id || 'N/A'}
      
      Thank you for your payment!
    `;
    
    return receipt;
  }

  // Mock payment processing for development
  static async mockProcessPayment(
    _amount: number,
    _method: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      const transactionId = `mock_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return {
        success: true,
        transactionId,
      };
    } else {
      return {
        success: false,
        error: 'Payment declined. Please try again.',
      };
    }
  }

  // Get payment status
  static getPaymentStatus(payment: Payment): {
    status: 'paid' | 'pending' | 'overdue' | 'partial';
    daysLate?: number;
    lateFees?: number;
  } {
    const now = new Date();
    const dueDate = new Date(payment.due_date);
    const daysLate = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (payment.status === 'paid') {
      return { status: 'paid' };
    }

    if (payment.status === 'partial') {
      return { status: 'partial' };
    }

    if (daysLate > 0) {
      const lateFees = this.calculateLateFees(payment.amount, daysLate);
      return { status: 'overdue', daysLate, lateFees };
    }

    return { status: 'pending' };
  }

  // Get payment history summary
  static getPaymentHistorySummary(payments: Payment[]): {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    averagePaymentTime: number;
    onTimePayments: number;
    latePayments: number;
  } {
    const summary = {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      averagePaymentTime: 0,
      onTimePayments: 0,
      latePayments: 0,
    };

    const paidPayments = payments.filter(p => p.status === 'paid' && p.paid_date);
    let totalPaymentDays = 0;

    payments.forEach(payment => {
      const status = this.getPaymentStatus(payment);
      
      switch (status.status) {
        case 'paid':
          summary.totalPaid += payment.amount;
          if (status.daysLate === 0) {
            summary.onTimePayments++;
          } else {
            summary.latePayments++;
          }
          
          // Calculate payment time
          if (payment.paid_date) {
            const dueDate = new Date(payment.due_date);
            const paidDate = new Date(payment.paid_date);
            const daysDiff = Math.floor((paidDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            totalPaymentDays += Math.abs(daysDiff);
          }
          break;
        case 'pending':
          summary.totalPending += payment.amount;
          break;
        case 'overdue':
          summary.totalOverdue += payment.amount;
          break;
      }
    });

    if (paidPayments.length > 0) {
      summary.averagePaymentTime = Math.round(totalPaymentDays / paidPayments.length);
    }

    return summary;
  }
}

// Payment form validation
export const paymentValidation = {
  validateCardNumber: (cardNumber: string): boolean => {
    // Luhn algorithm for card validation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  validateExpiryDate: (expiryDate: string): boolean => {
    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expMonth = parseInt(month);
    const expYear = parseInt(year);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false;
    }

    return expMonth >= 1 && expMonth <= 12;
  },

  validateCVV: (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  },

  validateAmount: (amount: string): boolean => {
    const numAmount = parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  },
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  CASH: 'cash',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS]; 