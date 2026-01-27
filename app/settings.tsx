import { View, Text, Pressable, Switch, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings State (Mock)
  const [cloudSync, setCloudSync] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 1. Fetch User Data on Mount
  useEffect(() => {
    async function getUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUserProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Sign Out", 
        style: "destructive", 
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) Alert.alert("Error", error.message);
        }
      }
    ]);
  };

  // Helper to get initials
  const getInitials = (email: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  // Helper to get display name (part before @)
  const getDisplayName = (email: string) => {
    return email ? email.split('@')[0] : 'User';
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center border-b border-gray-200 shadow-sm">
        <Pressable onPress={() => router.back()} className="mr-4 p-1 rounded-full active:bg-gray-100">
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        
        {/* 1. Dynamic Profile Section */}
        <View className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center gap-4 mb-6 shadow-sm">
          {loading ? (
             <ActivityIndicator color="#0f766e" />
          ) : (
            <>
              <View className="w-14 h-14 bg-teal-100 rounded-full items-center justify-center border-2 border-white shadow-sm">
                  <Text className="text-teal-800 font-bold text-xl">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </Text>
              </View>
              <View className="flex-1">
                  <Text className="font-bold text-lg text-gray-900">
                    {user?.email ? getDisplayName(user.email) : 'Guest User'}
                  </Text>
                  <Text className="text-gray-500 text-sm">{user?.email || 'No email found'}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                    <Text className="text-xs text-green-600 font-medium">Basic Plan Active</Text>
                  </View>
              </View>
              <Pressable className="bg-gray-50 p-2 rounded-full border border-gray-200">
                <Ionicons name="pencil" size={16} color="#4b5563" />
              </Pressable>
            </>
          )}
        </View>

        {/* 2. Preferences Group */}
        <Text className="text-gray-500 font-bold text-xs uppercase ml-2 mb-2 tracking-wider">Preferences</Text>
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            
            {/* Cloud Sync */}
            <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
                <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center">
                        <Ionicons name="cloud-upload-outline" size={18} color="#2563eb" />
                    </View>
                    <Text className="text-base font-medium text-gray-700">Cloud Backup</Text>
                </View>
                <Switch 
                    value={cloudSync} 
                    onValueChange={setCloudSync}
                    trackColor={{true: '#0f766e', false: '#e5e7eb'}} 
                />
            </View>

            {/* Dark Mode */}
            <View className="p-4 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-purple-50 rounded-lg items-center justify-center">
                        <Ionicons name="moon-outline" size={18} color="#7c3aed" />
                    </View>
                    <Text className="text-base font-medium text-gray-700">Dark Mode</Text>
                </View>
                <Switch 
                    value={darkMode} 
                    onValueChange={setDarkMode}
                    trackColor={{true: '#0f766e', false: '#e5e7eb'}} 
                />
            </View>
        </View>


        {/* 3. Security Group */}
        <Text className="text-gray-500 font-bold text-xs uppercase ml-2 mb-2 tracking-wider">Security</Text>
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            
            {/* Biometrics */}
            <View className="p-4 flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center">
                        <Ionicons name="finger-print-outline" size={18} color="#dc2626" />
                    </View>
                    <View>
                        <Text className="text-base font-medium text-gray-700">App Lock</Text>
                        <Text className="text-xs text-gray-400">Require FaceID to open Vault</Text>
                    </View>
                </View>
                <Switch 
                    value={biometrics} 
                    onValueChange={setBiometrics}
                    trackColor={{true: '#0f766e', false: '#e5e7eb'}} 
                />
            </View>
        </View>

        {/* 4. Support Group */}
        <Text className="text-gray-500 font-bold text-xs uppercase ml-2 mb-2 tracking-wider">Support</Text>
        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
            <Pressable className="p-4 flex-row justify-between items-center border-b border-gray-100 active:bg-gray-50">
                <Text className="text-base font-medium text-gray-700">Help Center</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <Pressable className="p-4 flex-row justify-between items-center border-b border-gray-100 active:bg-gray-50">
                <Text className="text-base font-medium text-gray-700">Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
            <View className="p-4 flex-row justify-between items-center bg-gray-50">
                <Text className="text-sm text-gray-500">Version</Text>
                <Text className="text-sm font-bold text-gray-400">v1.0.0 (Beta)</Text>
            </View>
        </View>

        {/* Logout Button */}
        <Pressable 
            onPress={handleLogout}
            className="bg-white p-4 rounded-xl border border-red-100 flex-row items-center justify-center gap-2 mb-10 shadow-sm active:bg-red-50"
        >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            <Text className="text-red-600 font-bold text-base">Sign Out</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}