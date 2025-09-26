import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import { Controller, Control, FieldPath } from 'react-hook-form';
import { Colors } from '../../constants/colors';

interface InputProps<T extends Record<string, any>> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
}

export function Input<T extends Record<string, any>>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  style = {},
}: InputProps<T>) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              error ? styles.inputError : styles.inputNormal,
            ]}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize="none"
            placeholderTextColor={Colors.textSecondary}
          />
        )}
      />
      {error && (
        <Text style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputNormal: {
    borderColor: '#D1D5DB',
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});