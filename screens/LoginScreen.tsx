import { Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-white items-center justify-center px-5">
      <Text className="text-3xl font-bold text-gray-900 mb-3">
        Login
      </Text>
      <Text className="text-base text-gray-600 mb-8">
        Sign in to your account
      </Text>
      <Pressable onPress={() => navigation.navigate('Home')}>
        <View className="bg-blue-500 px-5 py-3 rounded-lg">
          <Text className="text-white text-base font-bold">
            Go to Home
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
