import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, LoadingSpinner } from '../../components/core';
import { Colors } from '../../constants/colors';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { demoUser } from '../../lib/demoData';

export default function DashboardScreen() {
  const { getLatestMetric, isLoading: metricsLoading } = useHealthMetrics();
  const { getTodaysPrescriptions, isLoading: prescriptionsLoading } = usePrescriptions();

  const latestMetric = getLatestMetric();
  const todaysPrescriptions = getTodaysPrescriptions();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (metricsLoading || prescriptionsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{demoUser.fullName.split(' ')[0]}! 👋</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Here{'\''}s your health overview for today</Text>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.primaryStatCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, styles.primaryIcon]}>
                <Ionicons name="fitness" size={20} color="white" />
              </View>
              <Text style={styles.statValue}>75.2</Text>
            </View>
            <Text style={styles.statLabel}>Current Weight (kg)</Text>
            <View style={styles.statTrend}>
              <Ionicons name="trending-down" size={14} color={Colors.success} />
              <Text style={styles.trendText}>-0.3kg this week</Text>
            </View>
          </Card>

          <Card style={[styles.statCard, styles.secondaryStatCard]}>
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, styles.secondaryIcon]}>
                <Ionicons name="water" size={20} color="white" />
              </View>
              <Text style={styles.statValue}>95</Text>
            </View>
            <Text style={styles.statLabel}>Blood Sugar (mg/dL)</Text>
            <View style={styles.statTrend}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.trendText}>Normal range</Text>
            </View>
          </Card>
        </View>

        {/* Today's Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today{'\''}s Medications</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {todaysPrescriptions.length > 0 ? (
            <Card style={styles.medicationsCard}>
              {todaysPrescriptions.slice(0, 3).map((prescription, index) => (
                <View key={prescription.id} style={[styles.medicationItem, index === todaysPrescriptions.length - 1 && styles.lastMedicationItem]}>
                  <View style={styles.medicationLeft}>
                    <View style={styles.medicationIcon}>
                      <Ionicons name="medical" size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{prescription.medicationName}</Text>
                      <Text style={styles.medicationDosage}>{prescription.dosage}</Text>
                    </View>
                  </View>
                  <View style={styles.medicationRight}>
                    <TouchableOpacity style={styles.takeButton}>
                      <Text style={styles.takeButtonText}>Take</Text>
                    </TouchableOpacity>
                    <Text style={styles.medicationTime}>Morning</Text>
                  </View>
                </View>
              ))}
              {todaysPrescriptions.length > 3 && (
                <TouchableOpacity style={styles.showMoreButton}>
                  <Text style={styles.showMoreText}>+{todaysPrescriptions.length - 3} more medications</Text>
                </TouchableOpacity>
              )}
            </Card>
          ) : (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="medical-outline" size={32} color={Colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>No medications today</Text>
                <Text style={styles.emptySubtitle}>You{'\''}re all set for today!</Text>
              </View>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, styles.addMetricAction]}>
              <View style={[styles.actionIcon, styles.addMetricIcon]}>
                <Ionicons name="add-circle" size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Add Metric</Text>
              <Text style={styles.actionSubtitle}>Log your health data</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.shareDataAction]}>
              <View style={[styles.actionIcon, styles.shareDataIcon]}>
                <Ionicons name="share-social" size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Share Data</Text>
              <Text style={styles.actionSubtitle}>Generate secure PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.appointmentAction]}>
              <View style={[styles.actionIcon, styles.appointmentIcon]}>
                <Ionicons name="calendar" size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Appointment</Text>
              <Text style={styles.actionSubtitle}>Schedule checkup</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.reportAction]}>
              <View style={[styles.actionIcon, styles.reportIcon]}>
                <Ionicons name="document-text" size={24} color="white" />
              </View>
              <Text style={styles.actionTitle}>Reports</Text>
              <Text style={styles.actionSubtitle}>View health trends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.activityCard}>
            <View style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityIcon, styles.weightActivityIcon]}>
                  <Ionicons name="fitness" size={16} color={Colors.primary} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Weight logged</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              <Text style={styles.activityValue}>75.2 kg</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityIcon, styles.bloodSugarActivityIcon]}>
                  <Ionicons name="water" size={16} color={Colors.warning} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Blood sugar checked</Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
              </View>
              <Text style={styles.activityValue}>95 mg/dL</Text>
            </View>

            <View style={[styles.activityItem, styles.lastActivityItem]}>
              <View style={styles.activityLeft}>
                <View style={[styles.activityIcon, styles.medicationActivityIcon]}>
                  <Ionicons name="medical" size={16} color={Colors.success} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>Medication taken</Text>
                  <Text style={styles.activityTime}>Yesterday 8:00 AM</Text>
                </View>
              </View>
              <Text style={styles.activityValue}>Metformin</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 29,
    fontWeight: '600',
    color: Colors.text,
  },
  userName: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  notificationButton: {
    position: 'relative',
    padding: 14,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 7,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 21,
  },
  primaryStatCard: {
    backgroundColor: '#EBF4FF',
    borderColor: '#BFDBFE',
  },
  secondaryStatCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryIcon: {
    backgroundColor: Colors.primary,
  },
  secondaryIcon: {
    backgroundColor: Colors.warning,
  },
  statValue: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    color: Colors.primaryDark,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: '600',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  medicationsCard: {
    padding: 5,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#F1F5F9',
  },
  lastMedicationItem: {
    borderBottomWidth: 0,
  },
  medicationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  medicationRight: {
    alignItems: 'flex-end',
  },
  takeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  takeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  medicationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  showMoreButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  showMoreText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addMetricAction: {
    backgroundColor: '#EBF4FF',
  },
  shareDataAction: {
    backgroundColor: '#F0FDF4',
  },
  appointmentAction: {
    backgroundColor: '#FEF3C7',
  },
  reportAction: {
    backgroundColor: '#F3E8FF',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addMetricIcon: {
    backgroundColor: Colors.primary,
  },
  shareDataIcon: {
    backgroundColor: Colors.success,
  },
  appointmentIcon: {
    backgroundColor: Colors.warning,
  },
  reportIcon: {
    backgroundColor: '#8B5CF6',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  activityCard: {
    padding: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lastActivityItem: {
    borderBottomWidth: 0,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  weightActivityIcon: {
    backgroundColor: '#EBF4FF',
  },
  bloodSugarActivityIcon: {
    backgroundColor: '#FEF3C7',
  },
  medicationActivityIcon: {
    backgroundColor: '#F0FDF4',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});