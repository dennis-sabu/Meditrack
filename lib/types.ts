export interface User {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth?: string;
  bloodType?: string;
}

export interface HealthMetric {
  id: string;
  type: 'weight' | 'blood_sugar' | 'cholesterol';
  value: number;
  unit: string;
  date: string;
  userId: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  reminderEnabled: boolean;
  userId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VerificationPin {
  pin: string;
  expiresAt: string;
}