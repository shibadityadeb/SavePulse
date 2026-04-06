import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User, createUserIfNotExists, getUser } from '../services/userService';

/**
 * Auth context type definition
 * Provides authentication state and user profile management
 */
interface AuthContextType {
  /** Firebase authenticated user */
  user: FirebaseUser | null;
  /** Firestore user profile document */
  userProfile: User | null;
  /** Update user profile in Firestore */
  setUserProfile: (profile: User) => void;
  /** Loading state for auth and profile operations */
  loading: boolean;
  /** Firebase user ready state (distinct from loading) */
  userReady: boolean;
  /** Error message from auth operations */
  error: string | null;
}

/**
 * Auth context - stores authentication and user profile state
 * Default values prevent "undefined" context errors
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  setUserProfile: () => {},
  loading: true,
  userReady: false,
  error: null,
});

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Manages Firebase authentication state and Firestore user profile
 * Sets up auth listener and handles profile fetching/creation
 *
 * @example
 * export default function App() {
 *   return (
 *     <AuthProvider>
 *       <RootNavigator />
 *     </AuthProvider>
 *   );
 * }
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Wrapper for setUserProfile that updates local state
   * Can be extended later for additional operations like Firestore sync
   */
  const setUserProfile = (profile: User) => {
    setUserProfileState(profile);
  };

  /**
   * Fetch or create user profile from Firestore
   * Called when Firebase user is authenticated
   */
  const initializeUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to fetch existing user profile
      let profile = await getUser(firebaseUser.uid);

      // If profile doesn't exist, create it using phone number from Firebase
      if (!profile && firebaseUser.phoneNumber) {
        profile = await createUserIfNotExists(firebaseUser.uid, {
          phone: firebaseUser.phoneNumber,
          name: firebaseUser.displayName || 'User',
          bloodGroup: '',
          city: '',
          available: true,
          lastDonation: null,
        });
      }

      if (profile) {
        setUserProfileState(profile);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load user profile';
      console.error('[AuthContext] Profile initialization error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear user profile when logging out
   */
  const clearUserProfile = () => {
    setUserProfileState(null);
    setError(null);
  };

  /**
   * Set up Firebase auth state listener
   * Automatically handles profile loading when user authenticates
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUserReady(false);

        if (firebaseUser) {
          // User is authenticated
          setUser(firebaseUser);
          await initializeUserProfile(firebaseUser);
        } else {
          // User is not authenticated
          setUser(null);
          clearUserProfile();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Authentication error occurred';
        console.error('[AuthContext] Auth state change error:', err);
        setError(errorMessage);
        setUser(null);
        clearUserProfile();
      } finally {
        setUserReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    setUserProfile,
    loading,
    userReady,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
