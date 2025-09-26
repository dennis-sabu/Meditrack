import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/core';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';
import { DoctorVerificationModal } from '../../components/modals/DoctorVerificationModal';
import { demoUser } from '../../lib/demoData';

const ProfileItem: React.FC<{
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
}> = ({ icon, label, value, onPress }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} style={styles.profileItem}>
    <View style={styles.profileItemIcon}>
      <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />
    </View>
    <View style={styles.profileItemContent}>
      <Text style={styles.profileItemLabel}>{label}</Text>
      <Text style={styles.profileItemValue}>{value}</Text>
    </View>
    {onPress && (
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            // Navigation will be handled automatically by the useAuth hook
          },
        },
      ]
    );
  };

  const handleShareData = () => {
    setShowVerificationModal(true);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(demoUser.fullName)}</Text>
            </View>
            <Text style={styles.userName}>{demoUser.fullName}</Text>
            <Text style={styles.userEmail}>{demoUser.email}</Text>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <Card style={styles.sectionCard}>
            <ProfileItem
              icon="person-outline"
              label="Full Name"
              value={demoUser.fullName}
            />
            <ProfileItem
              icon="mail-outline"
              label="Email Address"
              value={demoUser.email}
            />
            <ProfileItem
              icon="calendar-outline"
              label="Date of Birth"
              value={demoUser.dateOfBirth || 'Not provided'}
            />
            <ProfileItem
              icon="water-outline"
              label="Blood Type"
              value={demoUser.bloodType || 'Not provided'}
            />
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <Card style={styles.sectionCard}>
            <TouchableOpacity onPress={handleShareData} style={styles.actionItem}>
              <View style={[styles.profileItemIcon, styles.primaryIcon]}>
                <Ionicons name="share-outline" size={20} color={Colors.primary} />
              </View>
              <View style={styles.profileItemContent}>
                <Text style={styles.actionItemTitle}>Share Data with Doctor</Text>
                <Text style={styles.actionItemSubtitle}>Generate a secure PIN for data sharing</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.profileItemIcon}>
                <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.profileItemContent}>
                <Text style={styles.actionItemTitle}>Settings</Text>
                <Text style={styles.actionItemSubtitle}>App preferences and privacy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.profileItemIcon}>
                <Ionicons name="help-circle-outline" size={20} color={Colors.textSecondary} />
              </View>
              <View style={styles.profileItemContent}>
                <Text style={styles.actionItemTitle}>Help & Support</Text>
                <Text style={styles.actionItemSubtitle}>Get help with the app</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={[styles.actionItem, styles.logoutItem]}>
              <View style={[styles.profileItemIcon, styles.dangerIcon]}>
                <Ionicons name="log-out-outline" size={20} color={Colors.error} />
              </View>
              <View style={styles.profileItemContent}>
                <Text style={styles.logoutText}>Sign Out</Text>
                <Text style={styles.actionItemSubtitle}>Sign out of your account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.error} />
            </TouchableOpacity>
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MediTrack v1.0.0</Text>
        </View>
      </ScrollView>

      <DoctorVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: 'white',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    backgroundColor: Colors.primary,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    color: '#6B7280',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  sectionCard: {
    marginBottom: 24,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  primaryIcon: {
    backgroundColor: '#DBEAFE',
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  actionItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.error,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});