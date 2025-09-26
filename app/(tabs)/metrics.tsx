import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, LoadingSpinner } from '../../components/core';
import { AddMetricModal } from '../../components/modals';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { HealthMetric } from '../../lib/types';
import { Colors } from '../../constants/colors';

type MetricType = 'weight' | 'blood_sugar' | 'cholesterol';

const METRIC_TABS = [
  { key: 'weight' as MetricType, label: 'Weight', icon: 'fitness', color: Colors.primary, bgColor: '#EBF4FF' },
  { key: 'blood_sugar' as MetricType, label: 'Blood Sugar', icon: 'water', color: Colors.warning, bgColor: '#FEF3C7' },
  { key: 'cholesterol' as MetricType, label: 'Cholesterol', icon: 'heart', color: Colors.error, bgColor: '#FEE2E2' },
];

export default function MetricsScreen() {
  const [activeFilter, setActiveFilter] = useState<MetricType>('weight');
  const [showAddModal, setShowAddModal] = useState(false);
  const { getMetricsByType, isLoading, deleteMetric } = useHealthMetrics();

  const filteredMetrics = getMetricsByType(activeFilter);
  const activeTab = METRIC_TABS.find(tab => tab.key === activeFilter)!;

  const renderMetricItem = ({ item, index }: { item: HealthMetric; index: number }) => (
    <Card style={[styles.metricCard, index === 0 && styles.firstMetricCard]}>
      <View style={styles.metricHeader}>
        <View style={styles.metricLeft}>
          <View style={[styles.metricIconContainer, { backgroundColor: activeTab.bgColor }]}>
            <Ionicons name={activeTab.icon as any} size={20} color={activeTab.color} />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricValue}>{item.value} {item.unit}</Text>
            <Text style={styles.metricDate}>
              {new Date(item.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.metricRight}>
          <TouchableOpacity
            onPress={() => deleteMetric(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress indicator for latest entry */}
      {index === 0 && (
        <View style={styles.latestIndicator}>
          <View style={styles.latestBadge}>
            <Text style={styles.latestText}>Latest</Text>
          </View>
        </View>
      )}
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Health Metrics</Text>
            <TouchableOpacity style={styles.searchButton}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats Summary */}
          <Card style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{filteredMetrics.length}</Text>
                <Text style={styles.summaryLabel}>Total Entries</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {filteredMetrics.length > 0 ? filteredMetrics[0].value : '—'}
                </Text>
                <Text style={styles.summaryLabel}>Latest Value</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <View style={styles.trendContainer}>
                  <Ionicons name="trending-up" size={16} color={Colors.success} />
                  <Text style={[styles.summaryValue, styles.trendValue]}>+2.1%</Text>
                </View>
                <Text style={styles.summaryLabel}>This Week</Text>
              </View>
            </View>
          </Card>

          {/* Filter Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            <View style={styles.tabsRow}>
              {METRIC_TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
                  style={[
                    styles.tab,
                    activeFilter === tab.key && styles.activeTab,
                    activeFilter === tab.key && { backgroundColor: tab.bgColor, borderColor: tab.color }
                  ]}
                >
                  <View style={[
                    styles.tabIcon,
                    activeFilter === tab.key && { backgroundColor: tab.color }
                  ]}>
                    <Ionicons
                      name={tab.icon as any}
                      size={16}
                      color={activeFilter === tab.key ? 'white' : Colors.textSecondary}
                    />
                  </View>
                  <Text style={[
                    styles.tabLabel,
                    activeFilter === tab.key && styles.activeTabLabel,
                    activeFilter === tab.key && { color: tab.color }
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Metrics List */}
        <View style={styles.listContainer}>
          {filteredMetrics.length > 0 ? (
            <FlatList
              data={filteredMetrics.sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
              )}
              renderItem={renderMetricItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: activeTab.bgColor }]}>
                <Ionicons
                  name={activeTab.icon as any}
                  size={32}
                  color={activeTab.color}
                />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab.label} Data</Text>
              <Text style={styles.emptySubtitle}>
                Start tracking your {activeFilter.replace('_', ' ')} to monitor your health trends over time.
              </Text>
              <TouchableOpacity
                style={[styles.addFirstButton, { backgroundColor: activeTab.color }]}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addFirstButtonText}>Add First Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: activeTab.color }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <AddMetricModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
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
  },
  tabsContainer: {
    paddingLeft: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 20,
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
  },
  activeTab: {
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
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeTabLabel: {
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingTop: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  metricCard: {
    marginBottom: 12,
    padding: 0,
  },
  firstMetricCard: {
    borderWidth: 2,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  metricDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  metricRight: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
  },
  latestIndicator: {
    position: 'absolute',
    top: -1,
    right: 16,
  },
  latestBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  latestText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});