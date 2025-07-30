import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PaymentsScreen() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const paymentHistory = [
    {
      id: '1',
      amount: 4200,
      dueDate: '2024-01-01',
      paidDate: '2024-01-01',
      status: 'paid',
      method: 'Online Payment',
      description: 'January 2024 Rent'
    },
    {
      id: '2',
      amount: 4200,
      dueDate: '2023-12-01',
      paidDate: '2023-12-01',
      status: 'paid',
      method: 'Online Payment',
      description: 'December 2023 Rent'
    },
    {
      id: '3',
      amount: 4200,
      dueDate: '2023-11-01',
      paidDate: '2023-11-02',
      status: 'paid',
      method: 'Bank Transfer',
      description: 'November 2023 Rent'
    }
  ];

  const upcomingPayments = [
    {
      id: '4',
      amount: 4200,
      dueDate: '2024-02-01',
      status: 'pending',
      description: 'February 2024 Rent'
    },
    {
      id: '5',
      amount: 4200,
      dueDate: '2024-03-01',
      status: 'pending',
      description: 'March 2024 Rent'
    }
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit Card',
      icon: 'card-outline',
      last4: '4242',
      type: 'Visa',
      isDefault: true
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'business-outline',
      bank: 'Chase Bank',
      account: '****1234',
      isDefault: false
    }
  ];

  const handlePayRent = () => {
    Alert.alert(
      'Pay Rent',
      'Would you like to pay $4,200 for February 2024 rent?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => Alert.alert('Success', 'Payment processed successfully!')
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'overdue': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return 'checkmark-circle';
      case 'pending': return 'time-outline';
      case 'overdue': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#4C1D95', '#1F2937']}
        style={styles.gradient}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Payments</Text>
              <Text style={styles.subtitle}>Manage your rent payments</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Payment Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Text style={styles.summaryTitle}>Payment Summary</Text>
            </View>
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Next Payment</Text>
                <Text style={styles.summaryAmount}>$4,200</Text>
                <Text style={styles.summaryDate}>Due Feb 1, 2024</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Payment Status</Text>
                <Text style={[styles.summaryStatus, { color: '#10B981' }]}>Current</Text>
                <Text style={styles.summarySubtext}>No overdue payments</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.payButton} onPress={handlePayRent}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.payButtonGradient}
              >
                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                <Text style={styles.payButtonText}>Pay Rent Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Payment Methods */}
          <View style={styles.methodsCard}>
            <View style={styles.methodsHeader}>
              <Ionicons name="card-outline" size={24} color="#8B5CF6" />
              <Text style={styles.methodsTitle}>Payment Methods</Text>
              <TouchableOpacity>
                <Ionicons name="add-circle-outline" size={24} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  selectedPaymentMethod === method.id && styles.methodItemSelected
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.methodInfo}>
                  <View style={styles.methodIcon}>
                    <Ionicons name={method.icon as any} size={24} color="#8B5CF6" />
                  </View>
                  <View style={styles.methodDetails}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.last4 && (
                      <Text style={styles.methodDetails}>•••• {method.last4} • {method.type}</Text>
                    )}
                    {method.bank && (
                      <Text style={styles.methodDetails}>{method.bank} • {method.account}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.methodActions}>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upcoming Payments */}
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <Ionicons name="calendar-outline" size={24} color="#F59E0B" />
              <Text style={styles.upcomingTitle}>Upcoming Payments</Text>
            </View>
            
            {upcomingPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentDescription}>{payment.description}</Text>
                  <Text style={styles.paymentDate}>Due: {payment.dueDate}</Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.paymentAmountText}>${payment.amount.toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                    <Ionicons name={getStatusIcon(payment.status) as any} size={12} color={getStatusColor(payment.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Payment History */}
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Ionicons name="time-outline" size={24} color="#6B7280" />
              <Text style={styles.historyTitle}>Payment History</Text>
            </View>
            
            {paymentHistory.map((payment) => (
              <View key={payment.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDescription}>{payment.description}</Text>
                  <Text style={styles.historyDate}>Paid: {payment.paidDate}</Text>
                  <Text style={styles.historyMethod}>{payment.method}</Text>
                </View>
                <View style={styles.historyAmount}>
                  <Text style={styles.historyAmountText}>-${payment.amount.toLocaleString()}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) + '20' }]}>
                    <Ionicons name={getStatusIcon(payment.status) as any} size={12} color={getStatusColor(payment.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#8B5CF620', '#8B5CF610']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#8B5CF6" />
                  <Text style={styles.actionText}>Add Payment Method</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#F59E0B20', '#F59E0B10']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="document-text-outline" size={24} color="#F59E0B" />
                  <Text style={styles.actionText}>View Statements</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#10B98120', '#10B98110']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="settings-outline" size={24} color="#10B981" />
                  <Text style={styles.actionText}>Payment Settings</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  summaryDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  summaryStatus: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  payButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  payButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  methodsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  methodsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  methodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
  },
  methodItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  methodDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 10,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  upcomingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  paymentAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  historyInfo: {
    flex: 1,
  },
  historyDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  historyMethod: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  historyAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
}); 