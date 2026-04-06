/**
 * Phone Authentication Configuration & Usage Guide
 * This file documents how to use authService with expo-firebase-recaptcha
 */

/**
 * Step 1: Install dependencies
 *
 * npm install expo-firebase-recaptcha
 * npm install @react-native-async-storage/async-storage
 */

/**
 * Step 2: Get reCAPTCHA keys from Firebase Console
 *
 * 1. Go to Firebase Console > Project Settings > App Check
 * 2. Enable App Check if not already enabled
 * 3. Create Web reCAPTCHA v3 app
 * 4. Copy Site Key
 * 5. Add to .env.local:
 *
 * EXPO_PUBLIC_RECAPTCHA_WEB_CLIENT_KEY=your_site_key_here
 */

/**
 * Step 3: Example usage in a React component
 *
 * ```typescript
 * import { useState, useRef } from 'react';
 * import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
 * import { authService, PhoneAuthError, PhoneAuthErrorCode } from '@/src/services/authService';
 * import { firebase } from '@react-native-firebase/app';
 * import { ConfirmationResult } from 'firebase/auth';
 *
 * export function PhoneAuthScreen() {
 *   const [phoneNumber, setPhoneNumber] = useState('');
 *   const [otp, setOtp] = useState('');
 *   const [step, setStep] = useState<'phone' | 'otp'>('phone'); // 'phone' or 'otp'
 *   const [loading, setLoading] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 *   const recaptchaVerifierRef = useRef(null);
 *
 *   const handleSendOTP = async () => {
 *     try {
 *       setLoading(true);
 *       setError(null);
 *
 *       const response = await authService.sendOTP(
 *         phoneNumber,
 *         recaptchaVerifierRef.current
 *       );
 *
 *       console.log(response.message);
 *       setStep('otp');
 *     } catch (err) {
 *       if (err instanceof PhoneAuthError) {
 *         setError(err.message);
 *         console.error(`Error (${err.code}):`, err.message);
 *       } else {
 *         setError('An unexpected error occurred');
 *       }
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   const handleVerifyOTP = async () => {
 *     try {
 *       setLoading(true);
 *       setError(null);
 *
 *       const response = await authService.verifyOTP(otp);
 *
 *       console.log(response.message);
 *       // Navigate to home screen or dashboard
 *       // navigation.navigate('Home');
 *     } catch (err) {
 *       if (err instanceof PhoneAuthError) {
 *         setError(err.message);
 *         console.error(`Error (${err.code}):`, err.message);
 *       } else {
 *         setError('An unexpected error occurred');
 *       }
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <FirebaseRecaptchaVerifierModal
 *         ref={recaptchaVerifierRef}
 *         firebaseConfig={{
 *           apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
 *           authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
 *           projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
 *           storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
 *           messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
 *           appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
 *         }}
 *         attemptInvisible={false}
 *       />
 *
 *       {step === 'phone' ? (
 *         <>
 *           <TextInput
 *             placeholder="+1 (XXX) XXX-XXXX"
 *             value={phoneNumber}
 *             onChangeText={setPhoneNumber}
 *             editable={!loading}
 *           />
 *           <TouchableOpacity onPress={handleSendOTP} disabled={loading}>
 *             <Text>{loading ? 'Sending...' : 'Send OTP'}</Text>
 *           </TouchableOpacity>
 *         </>
 *       ) : (
 *         <>
 *           <TextInput
 *             placeholder="Enter 6-digit OTP"
 *             value={otp}
 *             onChangeText={setOtp}
 *             keyboardType="number-pad"
 *             maxLength={6}
 *             editable={!loading}
 *           />
 *           <TouchableOpacity onPress={handleVerifyOTP} disabled={loading}>
 *             <Text>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
 *           </TouchableOpacity>
 *         </>
 *       )}
 *
 *       {error && <Text style={{ color: 'red' }}>{error}</Text>}
 *     </>
 *   );
 * }
 * ```
 */

/**
 * Error Handling Reference
 *
 * The authService throws PhoneAuthError with specific error codes:
 *
 * INVALID_PHONE
 * - Phone number format is incorrect
 * - Expected E.164 format: +[country_code][number]
 * - Example fix: Validate and format input before sending
 *
 * INVALID_OTP
 * - OTP code is not 6 digits
 * - OTP is empty or contains letters
 * - Example fix: Show clear validation message to user
 *
 * OTP_EXPIRED
 * - OTP session has expired (typically after 2 minutes)
 * - ConfirmationResult no longer valid
 * - Example fix: Ask user to request new OTP
 *
 * NETWORK_ERROR
 * - No internet connection
 * - Firebase API unreachable
 * - Example fix: Retry with exponential backoff, check connection
 *
 * TOO_MANY_ATTEMPTS
 * - User has requested OTP too many times
 * - Firebase quota exceeded
 * - Example fix: Show cooldown message, try again later
 *
 * RECAPTCHA_FAILED
 * - reCAPTCHA verifier not initialized
 * - FirebaseRecaptchaVerifierModal not rendered
 * - Example fix: Ensure verifier modal is mounted before sending OTP
 *
 * UNKNOWN_ERROR
 * - Any other unexpected error
 * - Check originalError for details
 */

/**
 * .env.local configuration
 *
 * EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
 * EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
 * EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
 * EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123xyz
 * EXPO_PUBLIC_RECAPTCHA_WEB_CLIENT_KEY=your_recaptcha_site_key
 */

/**
 * Testing phone auth locally
 *
 * Firebase provides test phone numbers for development:
 * - +15555550100 through +15555550199
 * - Use any 6-digit code that starts with 0
 *
 * Example: +16505550101 with OTP code 000000
 *
 * Set up in Firebase Console:
 * 1. Authentication > Sign-in method
 * 2. Enable Phone
 * 3. Add test phone numbers
 */

export const PHONE_AUTH_CONFIG = {
  OTP_LENGTH: 6,
  OTP_REGEX: /^\d{6}$/,
  PHONE_REGEX: /^\+[1-9]\d{1,14}$/,
  OTP_TIMEOUT_MS: 120000, // 2 minutes
};

export default PHONE_AUTH_CONFIG;
