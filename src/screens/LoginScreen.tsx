import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { authService, PhoneAuthError } from '@/src/services/authService';

type AuthStep = 'phone' | 'otp';

interface AuthState {
  step: AuthStep;
  phoneNumber: string;
  otp: string;
  loading: boolean;
  error: string | null;
}

/**
 * Minimal LoginScreen with phone OTP authentication
 * Demonstrates clean integration with authService
 */
export function LoginScreen(): React.ReactElement {
  const [state, setState] = useState<AuthState>({
    step: 'phone',
    phoneNumber: '',
    otp: '',
    loading: false,
    error: null,
  });

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const handleSendOTP = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.sendOTP(state.phoneNumber, null);
      setState((prev) => ({ ...prev, step: 'otp' }));
    } catch (err) {
      const errorMessage = err instanceof PhoneAuthError 
        ? err.message 
        : 'Failed to send OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.verifyOTP(state.otp);
      Alert.alert('Success', 'Phone verified successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to home screen
            // navigation.navigate('Home');
          },
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof PhoneAuthError 
        ? err.message 
        : 'Failed to verify OTP';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setState((prev) => ({ ...prev, step: 'phone', otp: '' }));
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      {/* Header */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900">SavePulse</Text>
        <Text className="text-sm text-gray-600 mt-1">Donate blood with one tap</Text>
      </View>

      {/* Error Message */}
      {state.error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <Text className="text-red-700 text-sm font-medium">{state.error}</Text>
        </View>
      )}

      {/* Phone Input Step */}
      {state.step === 'phone' ? (
        <>
          <Text className="text-base font-semibold text-gray-900 mb-3">Enter Phone Number</Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-2 text-base"
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#999"
            value={state.phoneNumber}
            onChangeText={(phone) => setState((prev) => ({ ...prev, phoneNumber: phone }))}
            editable={!state.loading}
            keyboardType="phone-pad"
          />

          <Text className="text-xs text-gray-500 mb-6">Format: +[country_code][number]</Text>

          <TouchableOpacity
            className={`rounded-lg py-3 items-center ${
              state.loading || !state.phoneNumber.trim()
                ? 'bg-blue-300'
                : 'bg-blue-600'
            }`}
            onPress={handleSendOTP}
            disabled={state.loading || !state.phoneNumber.trim()}
          >
            {state.loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        /* OTP Input Step */
        <>
          <Text className="text-base font-semibold text-gray-900 mb-3">Enter OTP</Text>

          <Text className="text-sm text-gray-600 mb-4">
            We sent a code to {state.phoneNumber}
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-2xl text-center tracking-widest"
            placeholder="000000"
            placeholderTextColor="#999"
            value={state.otp}
            onChangeText={(code) => setState((prev) => ({ ...prev, otp: code }))}
            editable={!state.loading}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            className={`rounded-lg py-3 items-center mb-3 ${
              state.loading || state.otp.length !== 6 ? 'bg-blue-300' : 'bg-blue-600'
            }`}
            onPress={handleVerifyOTP}
            disabled={state.loading || state.otp.length !== 6}
          >
            {state.loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-blue-600 rounded-lg py-3 items-center"
            onPress={handleResendOTP}
            disabled={state.loading}
          >
            <Text className="text-blue-600 font-semibold">Send Another OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default LoginScreen;
