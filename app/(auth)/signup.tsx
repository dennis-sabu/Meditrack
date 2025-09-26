import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Input } from '../../components/core';
import { Colors } from '../../constants/colors';
import { useAuth } from '../../hooks/useAuth';
import { SignupForm, signupSchema } from '../../lib/validators';
import '../global.css';

export default function SignupScreen() {
  const { signup, isSignupLoading, signupError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  React.useEffect(() => {
    if (signupError) {
      Alert.alert('Signup Error', 'Failed to create account. Please try again.');
    }
  }, [signupError]);

  const onSubmit = (data: SignupForm) => {
    signup(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header with gradient-like background */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="medical" size={32} color="white" />
                </View>
                <View style={styles.logoGlow} />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join MediTrack to start monitoring your health journey
              </Text>
            </View>

            {/* Features Preview */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureRow}>
                <View style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="analytics" size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.featureText}>Track Metrics</Text>
                </View>
                <View style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="medical" size={16} color={Colors.success} />
                  </View>
                  <Text style={styles.featureText}>Manage Prescriptions</Text>
                </View>
                <View style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <Ionicons name="share" size={16} color={Colors.warning} />
                  </View>
                  <Text style={styles.featureText}>Share with Doctor</Text>
                </View>
              </View>
            </View>

            {/* Signup Form */}
            <Card style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Get Started</Text>
                <Text style={styles.formSubtitle}>Create your account in just a few steps</Text>
              </View>

              <View style={styles.form}>
                <Input
                  control={control}
                  name="fullName"
                  label="Full Name"
                  placeholder="Enter your full name"
                  error={errors.fullName?.message}
                  style={styles.input}
                />

                <Input
                  control={control}
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  // autoCapitalize="none"
                  error={errors.email?.message}
                  style={styles.input}
                />

                <Input
                  control={control}
                  name="password"
                  label="Password"
                  placeholder="Create a secure password"
                  secureTextEntry
                  error={errors.password?.message}
                  style={styles.input}
                />

                <Input
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                  style={styles.input}
                />

                {/* Password Requirements */}
                <View style={styles.passwordRequirements}>
                  <View style={styles.requirement}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                    <Text style={styles.requirementText}>At least 8 characters</Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                    <Text style={styles.requirementText}>Contains numbers and letters</Text>
                  </View>
                </View>

                <Button
                  title={isSignupLoading ? "Creating Account..." : "Create Account"}
                  onPress={handleSubmit(onSubmit)}
                  loading={isSignupLoading}
                  style={styles.signupButton}
                />
              </View>
            </Card>

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity>
                <Link href="/(auth)/login" style={styles.signInLink}>
                  Sign In
                </Link>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: Colors.primary + '20',
    borderRadius: 50,
    top: -10,
    left: -10,
    zIndex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    marginBottom: 24,
    padding: 24,
  },
  formHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  input: {
    marginBottom: 0,
  },
  passwordRequirements: {
    marginTop: -8,
    gap: 6,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  signupButton: {
    marginTop: 8,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  signInText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  signInLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  termsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
});