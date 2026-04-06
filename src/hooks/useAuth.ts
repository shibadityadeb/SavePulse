import React from 'react';
import AuthContext, { AuthContextType } from '../context/AuthContext';

/**
 * Custom hook for accessing AuthContext
 * Provides type-safe access to authentication state and user profile
 *
 * @returns {AuthContextType} Auth state including user, userProfile, loading, and error
 * @throws {Error} If used outside AuthProvider component
 *
 * @example
 * function MyComponent() {
 *   const { user, userProfile, loading } = useAuth();
 *
 *   if (loading) return <Text>Loading...</Text>;
 *   if (!user) return <Text>Not authenticated</Text>;
 *
 *   return <Text>Welcome, {userProfile?.name}</Text>;
 * }
 */
export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Ensure your component is wrapped with <AuthProvider> in the component tree.'
    );
  }

  return context;
}

// Re-export types for convenience
export type { AuthContextType };
