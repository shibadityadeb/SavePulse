import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileScreen } from '../src/screens/ProfileScreen';
import { useAuth } from '../src/hooks/useAuth';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, userReady } = useAuth();

  /**
   * Show loading state while checking authentication
   */
  if (!userReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#007AFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
      initialRouteName={user ? 'Home' : 'Login'}
    >
      {/* Auth Stack - shown when user is not logged in */}
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'Login',
            headerShown: false,
          }}
        />
      ) : (
        // App Stack - shown when user is logged in
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'SavePulse',
              headerLeft: () => null, // Prevent going back from home
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              title: 'My Profile',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
