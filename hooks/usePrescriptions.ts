import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
// import { apiClient } from '../lib/api';
import { Prescription } from '../lib/types';
import { demoPrescriptions, delay } from '../lib/demoData';

export const usePrescriptions = () => {
  const queryClient = useQueryClient();
  const [localPrescriptions, setLocalPrescriptions] = useState<Prescription[]>(demoPrescriptions);

  const prescriptionsQuery = useQuery({
    queryKey: ['prescriptions'],
    queryFn: async (): Promise<Prescription[]> => {
      // Simulate API call with delay
      await delay(600);
      return localPrescriptions;

      // Real API call (commented out)
      // return apiClient.get<Prescription[]>('/prescriptions');
    },
  });

  const toggleReminderMutation = useMutation({
    mutationFn: async ({ id, reminderEnabled }: { id: string; reminderEnabled: boolean }): Promise<Prescription> => {
      // Simulate API call with delay
      await delay(800);

      // Update local state
      setLocalPrescriptions(prev =>
        prev.map(prescription =>
          prescription.id === id
            ? { ...prescription, reminderEnabled }
            : prescription
        )
      );

      const updatedPrescription = localPrescriptions.find(p => p.id === id);
      if (!updatedPrescription) throw new Error('Prescription not found');

      return { ...updatedPrescription, reminderEnabled };

      // Real API call (commented out)
      // return apiClient.put<Prescription>(`/prescriptions/${id}`, { reminderEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
    },
  });

  const getActivePrescriptions = () => {
    const now = new Date();
    const prescriptions = prescriptionsQuery.data || localPrescriptions;
    return prescriptions.filter(prescription => {
      const endDate = prescription.endDate ? new Date(prescription.endDate) : null;
      return !endDate || endDate > now;
    });
  };

  const getPastPrescriptions = () => {
    const now = new Date();
    const prescriptions = prescriptionsQuery.data || localPrescriptions;
    return prescriptions.filter(prescription => {
      const endDate = prescription.endDate ? new Date(prescription.endDate) : null;
      return endDate && endDate <= now;
    });
  };

  const getTodaysPrescriptions = () => {
    return getActivePrescriptions().filter(prescription => prescription.reminderEnabled);
  };

  return {
    prescriptions: prescriptionsQuery.data || localPrescriptions,
    isLoading: prescriptionsQuery.isLoading,
    error: prescriptionsQuery.error,
    toggleReminder: toggleReminderMutation.mutate,
    isTogglingReminder: toggleReminderMutation.isPending,
    getActivePrescriptions,
    getPastPrescriptions,
    getTodaysPrescriptions,
  };
};