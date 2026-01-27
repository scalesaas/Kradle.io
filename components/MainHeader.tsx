import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MainHeader() {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="bg-white border-b border-gray-100">
      <View className="flex-row justify-between items-center px-4 py-3 h-[60px]">
        
        {/* Left: Brand Logo */}
        <View className="flex-row items-center gap-2">
          <View className="bg-teal-700 w-8 h-8 rounded-lg items-center justify-center">
              <Ionicons name="scan" size={18} color="white" />
          </View>
          <Text className="text-xl font-bold text-gray-900 tracking-tight">
            Praman<Text className="text-teal-700">Scan</Text>
          </Text>
        </View>

        {/* Right: Profile Icon */}
        <Pressable 
          onPress={() => router.push('/settings')} 
          className="w-9 h-9 bg-gray-200 rounded-full items-center justify-center border border-gray-300 active:bg-gray-300"
        >
          <Ionicons name="person" size={20} color="#4b5563" />
        </Pressable>

      </View>
    </SafeAreaView>
  );
}