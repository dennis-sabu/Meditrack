import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
// import { apiClient } from '../lib/api';
import { HealthMetric } from '../lib/types';
import { MetricForm } from '../lib/validators';
import { demoHealthMetrics, delay } from '../lib/demoData';

export const useHealthMetrics = () => {
  const queryClient = useQueryClient();
  const [localMetrics, setLocalMetrics] = useState<HealthMetric[]>(demoHealthMetrics);

  const metricsQuery = useQuery({
    queryKey: ['health-metrics'],
    queryFn: async (): Promise<HealthMetric[]> => {
      // Simulate API call with delay
      await delay(800);
      return localMetrics;

      // Real API call (commented out)
      // return apiClient.get<HealthMetric[]>('/health-metrics');
    },
  });

  const addMetricMutation = useMutation({
    mutationFn: async (data: MetricForm & { value: number }): Promise<HealthMetric> => {
      // Simulate API call with delay
      await delay(1000);

      const newMetric: HealthMetric = {
        id: Date.now().toString(),
        type: data.type,
        value: data.value,
        unit: data.unit,
        date: new Date().toISOString(),
        userId: '1',
      };

      // Update local state
      setLocalMetrics(prev => [newMetric, ...prev]);

      return newMetric;

      // Real API call (commented out)
      // return apiClient.post<HealthMetric>('/health-metrics', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
    },
  });

  const deleteMetricMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Simulate API call with delay
      await delay(500);

      // Update local state
      setLocalMetrics(prev => prev.filter(metric => metric.id !== id));

      // Real API call (commented out)
      // return apiClient.delete(`/health-metrics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
    },
  });

  const getMetricsByType = (type: HealthMetric['type']) => {
    return (metricsQuery.data || localMetrics).filter(metric => metric.type === type);
  };

  const getLatestMetric = () => {
    const metrics = metricsQuery.data || localMetrics;
    return metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };

  return {
    metrics: metricsQuery.data || localMetrics,
    isLoading: metricsQuery.isLoading,
    error: metricsQuery.error,
    addMetric: addMetricMutation.mutate,
    deleteMetric: deleteMetricMutation.mutate,
    isAddingMetric: addMetricMutation.isPending,
    addMetricError: addMetricMutation.error,
    getMetricsByType,
    getLatestMetric,
  };
};