import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import '../../global.css';

import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Picker } from '@react-native-picker/picker';
import { Controller, useForm } from 'react-hook-form';
import { Colors } from '../../constants/colors';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { MetricForm, metricSchema } from '../../lib/validators';
import { Button, Card, Input } from '../core';

interface AddMetricModalProps {
  visible: boolean;
  onClose: () => void;
}

const METRIC_OPTIONS = [
  { value: 'weight', label: 'Weight', unit: 'kg' },
  { value: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL' },
  { value: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL' },
];

export const AddMetricModal: React.FC<AddMetricModalProps> = ({
  visible,
  onClose,
}) => {
  const { addMetric, isAddingMetric, addMetricError } = useHealthMetrics();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MetricForm>({
    resolver: zodResolver(metricSchema),
    defaultValues: {
      type: 'weight',
      value: '',
      unit: 'kg',
    },
  });

  const selectedType = watch('type');
  const selectedMetricOption = METRIC_OPTIONS.find(option => option.value === selectedType);

  React.useEffect(() => {
    if (addMetricError) {
      Alert.alert('Error', 'Failed to add metric. Please try again.');
    }
  }, [addMetricError]);

  const onSubmit = (data: MetricForm) => {
    const numericValue = parseFloat(data.value);
    if (isNaN(numericValue)) {
      Alert.alert('Invalid Value', 'Please enter a valid number.');
      return;
    }

    addMetric({
      ...data,
      value: numericValue as unknown as never,
    });

    Alert.alert('Success', 'Metric added successfully!', [
      { text: 'OK', onPress: handleClose },
    ]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gray-50"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-xl font-semibold text-gray-900">Add Health Metric</Text>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          <Card className="mb-6">
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="analytics" size={28} color={Colors.primary} />
              </View>
              <Text className="text-lg font-semibold text-gray-900 mb-2">
                Track Your Health
              </Text>
              <Text className="text-gray-600 text-center">
                Record your health metrics to monitor your progress over time
              </Text>
            </View>

            {/* Metric Type Picker */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2 text-base">
                Metric Type
              </Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <View className="border-2 border-gray-300 rounded-lg bg-white">
                    <Picker
                      selectedValue={value}
                      onValueChange={(itemValue) => {
                        onChange(itemValue);
                        // Auto-update unit when type changes
                        const option = METRIC_OPTIONS.find(opt => opt.value === itemValue);
                        if (option) {
                          // This would need to be handled through a separate setValue call
                        }
                      }}
                      style={{ height: 50 }}
                    >
                      {METRIC_OPTIONS.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              {errors.type && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.type.message}
                </Text>
              )}
            </View>

            {/* Value Input */}
            <Input
              control={control}
              name="value"
              label="Value"
              placeholder={`Enter ${selectedMetricOption?.label.toLowerCase()} value`}
              keyboardType="numeric"
              error={errors.value?.message}
            />

            {/* Unit Input */}
            <Input
              control={control}
              name="unit"
              label="Unit"
              placeholder="e.g., kg, mg/dL"
              error={errors.unit?.message}
            />

            {/* Info Box */}
            <View className="bg-blue-50 p-4 rounded-lg mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color={Colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-800 font-medium mb-1">Tip</Text>
                  <Text className="text-blue-700 text-sm">
                    Record your metrics at the same time each day for more accurate tracking.
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-4">
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                // className="flex-1"
              />
              <Button
                title="Add Metric"
                onPress={handleSubmit(onSubmit)}
                loading={isAddingMetric}
                // className="flex-1"
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayBackground,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 20,
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: Colors.primary + '20',
    borderRadius: 40,
    top: -8,
    left: -8,
  },
  icon: {
    width: 64,
    height: 64,
    backgroundColor: Colors.primary + '10',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  metricOptions: {
    gap: 12,
  },
  metricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selectedMetricOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  metricOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedMetricOptionIcon: {
    backgroundColor: Colors.primary,
  },
  metricOptionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  selectedMetricOptionLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
  metricOptionUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  input: {
    marginBottom: 0,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.primary,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginTop: 8,
  },
});