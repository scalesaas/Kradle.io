import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/components/services/authService';
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type: 'IN' | 'UP') => {
    setLoading(true);
    try {
      if (type === 'IN') {
        await authService.signIn(email, password);
        router.replace('/(tabs)');
      } else {
        await authService.signUp(email, password);
        Alert.alert('Check your email', 'We sent you a confirmation link.');
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white pt-20 px-8">
      <View className="flex-1 justify-center max-w-md w-full mx-auto gap-2">
        <Text className="text-3xl font-extrabold mb-8 text-center text-black">CivicSnap</Text>

        <Text className="text-md font-medium text-black mb-1">Email</Text>
        <TextInput
          className="rounded-md px-4 py-3 bg-white border border-gray-300 mb-4 text-black"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text className="text-md font-medium text-black mb-1">Password</Text>
        <TextInput
          className="rounded-md px-4 py-3 bg-white border border-gray-300 mb-6 text-black"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable 
          onPress={() => handleAuth('IN')} 
          disabled={loading}
          className="bg-green-700 rounded-md py-3 items-center mb-3 active:opacity-80"
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Sign In</Text>}
        </Pressable>

        <Pressable onPress={() => handleAuth('UP')} disabled={loading} className="border border-gray-300 rounded-md py-3 items-center">
          <Text className="text-black font-medium">Create Account</Text>
        </Pressable>
      </View>
    </View>
  );
}