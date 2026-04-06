import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase Configuration
 * Uses environment variables for secure credential management
 * All public environment variables must be prefixed with EXPO_PUBLIC_
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validate Firebase configuration
 * Ensures all required environment variables are present
 */
const validateConfig = (config: Record<string, any>): void => {
  const requiredFields: (keyof typeof firebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    (field) => !config[field] || config[field].trim() === ''
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing Firebase configuration variables: ${missingFields.join(', ')}. ` +
      `Please ensure your .env file contains all required EXPO_PUBLIC_FIREBASE_* variables.`
    );
  }
};

// Validate configuration on app initialization
validateConfig(firebaseConfig);

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication
 * Uses React Native persistence via AsyncStorage
 * This allows users to stay logged in across app sessions
 */
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

/**
 * Initialize Firestore Database
 * Returns a Firestore instance for database operations
 */
export const db = getFirestore(app);

export default app;
