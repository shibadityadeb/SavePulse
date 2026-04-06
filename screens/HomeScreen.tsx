import { Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-white items-center justify-center px-5">
      <Text className="text-3xl font-bold text-gray-900 mb-3">
        Welcome to SavePulse
      </Text>
      <Text className="text-base text-gray-600 mb-8 text-center">
        Donate blood and save lives
      </Text>
      
      <View className="gap-3 w-full">
        <Pressable onPress={() => navigation.navigate('Profile')}>
          <View className="bg-blue-500 px-5 py-4 rounded-lg">
            <Text className="text-white text-base font-bold text-center">
              My Profile
            </Text>
          </View>
        </Pressable>
        
        <Pressable onPress={() => navigation.navigate('Login')}>
          <View className="bg-gray-300 px-5 py-4 rounded-lg">
            <Text className="text-gray-700 text-base font-bold text-center">
              Logout
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
