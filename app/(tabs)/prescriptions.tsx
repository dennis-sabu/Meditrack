import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, LoadingSpinner } from '../../components/core';
import { usePrescriptions } from '../../hooks/usePrescriptions';
import { Prescription } from '../../lib/types';
import { Colors } from '../../constants/colors';

const PrescriptionCard: React.FC<{
  prescription: Prescription;
  onToggleReminder: (id: string, enabled: boolean) => void;
  showToggle?: boolean;
}> = ({ prescription, onToggleReminder, showToggle = true }) => (
  <Card className="mb-4">
    <View className="flex-row items-start justify-between">
      <View className="flex-1 mr-4">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {prescription.medicationName}
        </Text>
        <Text className="text-gray-600 mb-2">{prescription.dosage}</Text>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text className="text-sm text-gray-500 ml-1">
            {new Date(prescription.startDate).toLocaleDateString()}
            {prescription.endDate && (
              ` - ${new Date(prescription.endDate).toLocaleDateString()}`
            )}
          </Text>
        </View>
      </View>
      {showToggle && (
        <View className="items-center">
          <Text className="text-xs text-gray-500 mb-2">Reminders</Text>
          <Switch
            value={prescription.reminderEnabled}
            onValueChange={(enabled) => onToggleReminder(prescription.id, enabled)}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={prescription.reminderEnabled ? 'white' : '#f4f3f4'}
          />
        </View>
      )}
    </View>
  </Card>
);

export default function PrescriptionsScreen() {
  const {
    getActivePrescriptions,
    getPastPrescriptions,
    toggleReminder,
    isLoading,
  } = usePrescriptions();

  const activePrescriptions = getActivePrescriptions();
  const pastPrescriptions = getPastPrescriptions();

  const handleToggleReminder = (id: string, enabled: boolean) => {
    toggleReminder({ id, reminderEnabled: enabled });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Prescriptions</Text>
          <Text className="text-gray-600">
            Manage your medications and reminders
          </Text>
        </View>

        {/* Active Prescriptions */}
        <View className="px-6 py-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-gray-900">Active</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              <Text className="text-sm text-gray-600">
                {activePrescriptions.length} medications
              </Text>
            </View>
          </View>

          {activePrescriptions.length > 0 ? (
            activePrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onToggleReminder={handleToggleReminder}
              />
            ))
          ) : (
            <Card className="items-center py-8">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="medical" size={28} color={Colors.success} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                No Active Prescriptions
              </Text>
              <Text className="text-gray-600 text-center">
                Your active medications will appear here
              </Text>
            </Card>
          )}
        </View>

        {/* Past Prescriptions */}
        {pastPrescriptions.length > 0 && (
          <View className="px-6 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-900">Past</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                <Text className="text-sm text-gray-600">
                  {pastPrescriptions.length} medications
                </Text>
              </View>
            </View>

            {pastPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription.id}
                prescription={prescription}
                onToggleReminder={handleToggleReminder}
                showToggle={false}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {activePrescriptions.length === 0 && pastPrescriptions.length === 0 && (
          <View className="flex-1 items-center justify-center px-6 py-12">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="medical" size={36} color={Colors.primary} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
              No Prescriptions Yet
            </Text>
            <Text className="text-gray-600 text-center mb-8 leading-6">
              Your doctor can add prescriptions to your profile, or you can manually track your medications.
            </Text>
            <TouchableOpacity className="bg-blue-500 px-8 py-4 rounded-lg">
              <Text className="text-white font-semibold text-lg">Get Started</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  searchButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 0,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendValue: {
    color: Colors.success,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    flex: 1,
  },
  activeTab: {
    backgroundColor: '#DBEAFE',
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  activeTabIcon: {
    backgroundColor: Colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    flex: 1,
  },
  activeTabLabel: {
    fontWeight: '600',
    color: Colors.primary,
  },
  listContainer: {
    flex: 1,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  prescriptionCard: {
    marginBottom: 12,
    padding: 0,
  },
  activePrescriptionCard: {
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
  },
  prescriptionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activeMedicationIcon: {
    backgroundColor: Colors.primary + '20',
  },
  inactiveMedicationIcon: {
    backgroundColor: '#F3F4F6',
  },
  prescriptionInfo: {
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeStatusBadge: {
    backgroundColor: Colors.success + '20',
  },
  completedStatusBadge: {
    backgroundColor: '#F3F4F6',
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.success,
  },
  completedStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dosageText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  remainingDays: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  warningText: {
    color: Colors.warning,
  },
  reminderSection: {
    alignItems: 'center',
    minWidth: 80,
  },
  reminderLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  reminderSwitch: {
    marginBottom: 6,
  },
  reminderTime: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: Colors.primary + '20',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});