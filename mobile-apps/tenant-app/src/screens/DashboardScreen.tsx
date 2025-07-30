import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const quickActions = [
    { icon: 'card-outline', title: 'Pay Rent', color: '#8B5CF6' },
    { icon: 'construct-outline', title: 'Maintenance', color: '#F59E0B' },
    { icon: 'call-outline', title: 'Contact', color: '#10B981' },
  ];

  const stats = [
    { label: 'Next Rent Due', value: '$4,200', subtitle: 'Feb 1, 2024', icon: 'cash-outline' },
    { label: 'Maintenance', value: '2', subtitle: 'Active requests', icon: 'construct-outline' },
    { label: 'Lease End', value: 'Dec 31', subtitle: '2024', icon: 'calendar-outline' },
    { label: 'Payment Status', value: 'Current', subtitle: 'No overdue', icon: 'checkmark-circle-outline' },
  ];

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
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>John Smith</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Ionicons name={stat.icon} size={24} color="#8B5CF6" />
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={styles.actionButton}>
                  <LinearGradient
                    colors={[action.color + '20', action.color + '10']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name={action.icon} size={32} color={action.color} />
                    <Text style={styles.actionTitle}>{action.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Rent Payment Received</Text>
                  <Text style={styles.activitySubtitle}>January 1, 2024</Text>
                </View>
                <Text style={styles.activityAmount}>$4,200</Text>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="construct" size={20} color="#F59E0B" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Maintenance Request</Text>
                  <Text style={styles.activitySubtitle}>Kitchen sink leak</Text>
                </View>
                <Text style={styles.activityStatus}>In Progress</Text>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="document-text" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Document Uploaded</Text>
                  <Text style={styles.activitySubtitle}>Lease agreement</Text>
                </View>
                <Text style={styles.activityStatus}>Completed</Text>
              </View>
            </View>
          </View>

          {/* Property Overview */}
          <View style={styles.propertyContainer}>
            <Text style={styles.sectionTitle}>Property Overview</Text>
            <View style={styles.propertyCard}>
              <View style={styles.propertyHeader}>
                <Ionicons name="business" size={24} color="#8B5CF6" />
                <Text style={styles.propertyTitle}>Luxury Downtown Condo</Text>
              </View>
              <Text style={styles.propertyAddress}>123 Main St, Beverly Hills, CA</Text>
              <Text style={styles.propertyUnit}>Unit #1502</Text>
              
              <View style={styles.propertyDetails}>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>2 Bed, 2 Bath</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Size</Text>
                  <Text style={styles.detailValue}>1,250 sq ft</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <Text style={styles.detailLabel}>Floor</Text>
                  <Text style={styles.detailValue}>15th Floor</Text>
                </View>
              </View>
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
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  activityContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  activityStatus: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  propertyContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  propertyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  propertyUnit: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 16,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 