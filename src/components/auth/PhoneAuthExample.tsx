import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { usePhoneAuth } from '@/src/hooks/usePhoneAuth';
import { database } from '@/src/services/firebase';

/**
 * Example component demonstrating phone authentication flow
 * with OTP verification using Firebase + expo-firebase-recaptcha
 *
 * Usage:
 * <PhoneAuthExample onSuccess={() => navigation.navigate('Home')} />
 *
 * @param onSuccess - Callback when authentication succeeds
 */
export interface PhoneAuthExampleProps {
  onSuccess?: () => void;
}

export function PhoneAuthExample({ onSuccess }: PhoneAuthExampleProps) {
  const {
    phoneNumber,
    setPhoneNumber,
    otp,
    setOtp,
    step,
    loading,
    error,
    errorCode,
    sendOTP,
    verifyOTP,
    resetError,
    recaptchaRef,
  } = usePhoneAuth();

  const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
  };

  const handleSendOTP = async () => {
    resetError();
    await sendOTP();
  };

  const handleVerifyOTP = async () => {
    resetError();
    await verifyOTP();

    // Show success message
    if (!error) {
      Alert.alert('Success', 'Phone number verified successfully!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
          },
        },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      {/* reCAPTCHA Verifier Modal - MUST be rendered */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        firebaseConfig={firebaseConfig}
        attemptInvisible={false}
        title="Verify you're human"
        cancelLabel="Close"
      />

      {/* Error Display */}
      {error && (
        <View style={{ backgroundColor: '#fee', padding: 12, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ color: '#c33', fontWeight: 'bold' }}>Error</Text>
          <Text style={{ color: '#c33', marginTop: 4 }}>{error}</Text>
          {errorCode && (
            <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>Code: {errorCode}</Text>
          )}
        </View>
      )}

      {/* Phone Number Input Step */}
      {step === 'phone' ? (
        <>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Enter Your Phone Number
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              marginBottom: 16,
              borderRadius: 8,
              fontSize: 16,
            }}
            placeholder="+1 (555) 123-4567"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!loading}
            keyboardType="phone-pad"
          />

          <Text style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
            Format: +[country_code][number] (e.g., +1234567890)
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
            onPress={handleSendOTP}
            disabled={loading || !phoneNumber.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        /* OTP Input Step */
        <>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Enter 6-Digit OTP
          </Text>

          <Text style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
            We sent a code to {phoneNumber}
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ddd',
              padding: 12,
              marginBottom: 16,
              borderRadius: 8,
              fontSize: 20,
              textAlign: 'center',
              letterSpacing: 4,
            }}
            placeholder="000000"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            editable={!loading}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
              marginBottom: 12,
            }}
            onPress={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#007AFF',
            }}
            onPress={handleSendOTP}
            disabled={loading}
          >
            <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Send Another OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default PhoneAuthExample;
