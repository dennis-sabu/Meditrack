import { HealthMetric, Prescription, User, VerificationPin } from './types';

export const demoUser: User = {
  id: '1',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  dateOfBirth: '1990-05-15',
  bloodType: 'O+',
};

export const demoHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    type: 'weight',
    value: 75,
    unit: 'kg',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    userId: '1',
  },
  {
    id: '2',
    type: 'weight',
    value: 74.5,
    unit: 'kg',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    userId: '1',
  },
  {
    id: '3',
    type: 'blood_sugar',
    value: 95,
    unit: 'mg/dL',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    userId: '1',
  },
  {
    id: '4',
    type: 'blood_sugar',
    value: 88,
    unit: 'mg/dL',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    userId: '1',
  },
  {
    id: '5',
    type: 'cholesterol',
    value: 180,
    unit: 'mg/dL',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    userId: '1',
  },
  {
    id: '6',
    type: 'weight',
    value: 75.2,
    unit: 'kg',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    userId: '1',
  },
];

export const demoPrescriptions: Prescription[] = [
  {
    id: '1',
    medicationName: 'Metformin',
    dosage: '500mg twice daily',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    reminderEnabled: true,
    userId: '1',
  },
  {
    id: '2',
    medicationName: 'Lisinopril',
    dosage: '10mg once daily',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    reminderEnabled: true,
    userId: '1',
  },
  {
    id: '3',
    medicationName: 'Vitamin D3',
    dosage: '1000 IU daily',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    reminderEnabled: false,
    userId: '1',
  },
  {
    id: '4',
    medicationName: 'Amoxicillin',
    dosage: '250mg three times daily',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    endDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago (past)
    reminderEnabled: false,
    userId: '1',
  },
];

export const generateMockPin = (): VerificationPin => ({
  pin: Math.random().toString().substring(2, 8), // 6-digit random number
  expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
});

// Simulate API delay
export const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));