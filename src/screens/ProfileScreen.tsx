import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '@/src/hooks/useAuth';
import { updateUser, UserUpdateData } from '@/src/services/userService';

interface ProfileFormState {
  name: string;
  bloodGroup: string;
  city: string;
  available: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * ProfileScreen - User profile management screen
 * Allows users to view and update their profile information
 * Fetches data from Firestore and syncs updates
 */
export function ProfileScreen(): React.ReactElement {
  const { user, userProfile } = useAuth();
  const [formState, setFormState] = useState<ProfileFormState>({
    name: '',
    bloodGroup: '',
    city: '',
    available: false,
    loading: false,
    error: null,
    success: false,
  });

  // Blood group options
  const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  /**
   * Initialize form with existing user profile data
   */
  useEffect(() => {
    if (userProfile) {
      setFormState((prev) => ({
        ...prev,
        name: userProfile.name || '',
        bloodGroup: userProfile.bloodGroup || '',
        city: userProfile.city || '',
        available: userProfile.available,
      }));
    }
  }, [userProfile]);

  /**
   * Clear success message after 3 seconds
   */
  useEffect(() => {
    if (formState.success) {
      const timer = setTimeout(() => {
        setFormState((prev) => ({ ...prev, success: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formState.success]);

  /**
   * Handle form input changes
   */
  const handleChange = (field: keyof Omit<ProfileFormState, 'loading' | 'error' | 'success'>, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      error: null,
    }));
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    if (!formState.name.trim()) {
      setFormState((prev) => ({ ...prev, error: 'Name is required' }));
      return false;
    }
    if (!formState.bloodGroup.trim()) {
      setFormState((prev) => ({ ...prev, error: 'Blood group is required' }));
      return false;
    }
    if (!formState.city.trim()) {
      setFormState((prev) => ({ ...prev, error: 'City is required' }));
      return false;
    }
    return true;
  };

  /**
   * Handle profile update
   */
  const handleSave = async () => {
    if (!validateForm() || !user) {
      return;
    }

    setFormState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const updateData: UserUpdateData = {
        name: formState.name.trim(),
        bloodGroup: formState.bloodGroup.trim(),
        city: formState.city.trim(),
        available: formState.available,
      };

      await updateUser(user.uid, updateData);

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
      }));

      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile';
      console.error('[ProfileScreen] Update error:', err);
      
      setFormState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  if (!user || !userProfile) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Profile
        </Text>
        <Text className="text-sm text-gray-500 mb-6">
          {userProfile.phone}
        </Text>

        {/* Error Message */}
        {formState.error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-700 text-sm">{formState.error}</Text>
          </View>
        )}

        {/* Success Message */}
        {formState.success && (
          <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <Text className="text-green-700 text-sm">
              ✓ Profile updated successfully
            </Text>
          </View>
        )}

        {/* Name Field */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Enter your name"
            value={formState.name}
            onChangeText={(text) => handleChange('name', text)}
            editable={!formState.loading}
            placeholderTextColor="#999"
          />
        </View>

        {/* Blood Group Field */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Blood Group
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="e.g., O+, A-, B+, AB-"
            value={formState.bloodGroup}
            onChangeText={(text) => handleChange('bloodGroup', text.toUpperCase())}
            editable={!formState.loading}
            placeholderTextColor="#999"
          />
          <View className="flex-row flex-wrap gap-2 mt-3">
            {bloodGroups.map((bg) => (
              <TouchableOpacity
                key={bg}
                onPress={() => handleChange('bloodGroup', bg)}
                className={`px-3 py-2 rounded-lg border ${
                  formState.bloodGroup === bg
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-100 border-gray-300'
                }`}
                disabled={formState.loading}
              >
                <Text
                  className={`text-sm font-medium ${
                    formState.bloodGroup === bg
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {bg}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* City Field */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            City
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-gray-800"
            placeholder="Enter your city"
            value={formState.city}
            onChangeText={(text) => handleChange('city', text)}
            editable={!formState.loading}
            placeholderTextColor="#999"
          />
        </View>

        {/* Availability Toggle */}
        <View className="mb-8 flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-1">
              Available to Donate
            </Text>
            <Text className="text-xs text-gray-600">
              Let others know if you're available
            </Text>
          </View>
          <Switch
            value={formState.available}
            onValueChange={(value) => handleChange('available', value)}
            disabled={formState.loading}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={formState.available ? '#1e40af' : '#f3f4f6'}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={formState.loading}
          className={`rounded-lg py-4 flex-row justify-center items-center ${
            formState.loading ? 'bg-gray-300' : 'bg-blue-500'
          }`}
        >
          {formState.loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>

        {/* Last Donation Info */}
        {userProfile.lastDonation && (
          <View className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-xs font-semibold text-gray-600 uppercase mb-1">
              Last Donation
            </Text>
            <Text className="text-sm text-gray-800">
              {new Date(userProfile.lastDonation).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Account Created Info */}
        <View className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <Text className="text-xs font-semibold text-gray-600 uppercase mb-1">
            Member Since
          </Text>
          <Text className="text-sm text-gray-800">
            {userProfile.createdAt
              ? new Date(userProfile.createdAt.toDate()).toLocaleDateString()
              : 'Unknown'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
