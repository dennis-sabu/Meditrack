import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/core';
import { useAuth } from '../../hooks/useAuth';
import { LoginForm, loginSchema } from '../../lib/validators';

export default function LoginScreen() {
  const { login, isLoginLoading, loginError } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  React.useEffect(() => {
    if (loginError) {
      Alert.alert('Login Error', 'Invalid email or password. Please try again.');
    }
  }, [loginError]);

  const onSubmit = (data: LoginForm) => {
    login(data);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>M</Text>
              </View>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>
                Sign in to access your health dashboard
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.formSection}>
              <Input
                control={control}
                name="email"
                label="Email Address"
                placeholder="Enter your email"
                keyboardType="email-address"
                error={errors.email?.message}
              />

              <Input
                control={control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                error={errors.password?.message}
              />

              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoginLoading}
                style={styles.submitButton}
              />
            </View>

            {/* Sign Up Link */}
            <View style={styles.linkSection}>
              <Text style={styles.linkText}>
                Don{'\''}t have an account?{' '}
                <Link href="/(auth)/signup" style={styles.link}>
                  Sign Up
                </Link>
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
    backgroundColor: 'white',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#3B82F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitleText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 24,
  },
  linkSection: {
    alignItems: 'center',
  },
  linkText: {
    color: '#6B7280',
  },
  link: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});