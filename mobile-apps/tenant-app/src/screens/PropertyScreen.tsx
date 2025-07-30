import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PropertyScreen() {
  const propertyDetails = {
    name: 'Luxury Downtown Condo',
    address: '123 Main St, Beverly Hills, CA',
    unit: 'Unit #1502',
    type: '2 Bedroom, 2 Bath',
    size: '1,250 sq ft',
    floor: '15th Floor',
    rent: 4200,
    amenities: [
      { icon: 'water', name: 'Pool', available: true },
      { icon: 'fitness', name: 'Gym', available: true },
      { icon: 'car', name: 'Parking', available: true },
      { icon: 'person', name: 'Concierge', available: true },
      { icon: 'shield-checkmark', name: 'Security', available: true },
      { icon: 'home', name: 'Balcony', available: true },
    ],
    photos: [
      { id: 1, title: 'Living Room', emoji: '🛋️' },
      { id: 2, title: 'Master Bedroom', emoji: '🛏️' },
      { id: 3, title: 'Kitchen', emoji: '🍳' },
      { id: 4, title: 'Bathroom', emoji: '🚿' },
      { id: 5, title: 'Balcony View', emoji: '🌅' },
      { id: 6, title: 'Building Exterior', emoji: '🏢' },
    ]
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
              <Text style={styles.propertyName}>{propertyDetails.name}</Text>
              <Text style={styles.propertyAddress}>{propertyDetails.address}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Property Overview Card */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="business" size={24} color="#8B5CF6" />
              <Text style={styles.overviewTitle}>Property Overview</Text>
            </View>
            
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Unit</Text>
                <Text style={styles.overviewValue}>{propertyDetails.unit}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Type</Text>
                <Text style={styles.overviewValue}>{propertyDetails.type}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Size</Text>
                <Text style={styles.overviewValue}>{propertyDetails.size}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Floor</Text>
                <Text style={styles.overviewValue}>{propertyDetails.floor}</Text>
              </View>
            </View>
          </View>

          {/* Rent Information */}
          <View style={styles.rentCard}>
            <View style={styles.rentHeader}>
              <Ionicons name="cash-outline" size={24} color="#10B981" />
              <Text style={styles.rentTitle}>Monthly Rent</Text>
            </View>
            <Text style={styles.rentAmount}>${propertyDetails.rent.toLocaleString()}</Text>
            <Text style={styles.rentSubtitle}>Due on the 1st of each month</Text>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesCard}>
            <View style={styles.amenitiesHeader}>
              <Ionicons name="star-outline" size={24} color="#F59E0B" />
              <Text style={styles.amenitiesTitle}>Amenities</Text>
            </View>
            
            <View style={styles.amenitiesGrid}>
              {propertyDetails.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <View style={styles.amenityIcon}>
                    <Ionicons 
                      name={amenity.icon as any} 
                      size={20} 
                      color={amenity.available ? "#10B981" : "#6B7280"} 
                    />
                  </View>
                  <Text style={[
                    styles.amenityName,
                    !amenity.available && styles.amenityUnavailable
                  ]}>
                    {amenity.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Property Photos */}
          <View style={styles.photosCard}>
            <View style={styles.photosHeader}>
              <Ionicons name="images-outline" size={24} color="#8B5CF6" />
              <Text style={styles.photosTitle}>Property Photos</Text>
            </View>
            
            <View style={styles.photosGrid}>
              {propertyDetails.photos.map((photo) => (
                <TouchableOpacity key={photo.id} style={styles.photoItem}>
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoEmoji}>{photo.emoji}</Text>
                  </View>
                  <Text style={styles.photoTitle}>{photo.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
                  <Ionicons name="call-outline" size={24} color="#8B5CF6" />
                  <Text style={styles.actionText}>Contact Manager</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#F59E0B20', '#F59E0B10']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="construct-outline" size={24} color="#F59E0B" />
                  <Text style={styles.actionText}>Request Maintenance</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <LinearGradient
                  colors={['#10B98120', '#10B98110']}
                  style={styles.actionGradient}
                >
                  <Ionicons name="document-text-outline" size={24} color="#10B981" />
                  <Text style={styles.actionText}>View Documents</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Building Information */}
          <View style={styles.buildingCard}>
            <View style={styles.buildingHeader}>
              <Ionicons name="business-outline" size={24} color="#6B7280" />
              <Text style={styles.buildingTitle}>Building Information</Text>
            </View>
            
            <View style={styles.buildingInfo}>
              <View style={styles.buildingItem}>
                <Text style={styles.buildingLabel}>Building Age</Text>
                <Text style={styles.buildingValue}>5 years</Text>
              </View>
              <View style={styles.buildingItem}>
                <Text style={styles.buildingLabel}>Total Units</Text>
                <Text style={styles.buildingValue}>50 units</Text>
              </View>
              <View style={styles.buildingItem}>
                <Text style={styles.buildingLabel}>Security</Text>
                <Text style={styles.buildingValue}>24/7</Text>
              </View>
              <View style={styles.buildingItem}>
                <Text style={styles.buildingLabel}>Parking</Text>
                <Text style={styles.buildingValue}>Included</Text>
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
  propertyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  overviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rentCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  rentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  rentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  rentSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  amenitiesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  amenitiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amenitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amenityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  amenityName: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  amenityUnavailable: {
    color: '#6B7280',
  },
  photosCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  photosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoEmoji: {
    fontSize: 32,
  },
  photoTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
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
  buildingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  buildingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  buildingInfo: {
    gap: 12,
  },
  buildingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  buildingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
}); 