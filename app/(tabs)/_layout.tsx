import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import MainHeader from '../../components/MainHeader'; // Ensure this path is correct

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = '#0f766e'; // Brand Teal
  const inactiveColor = '#94a3b8'; // Gray

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: true,
        // ✅ 1. Connect the Custom Header correctly
        header: () => <MainHeader />, 
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 10,
            height: 65,
            paddingBottom: 10,
            paddingTop: 8,
          },
        }),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          headerShown: false, // Hide header for camera view
          tabBarLabelStyle: { fontWeight: 'bold' },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={30} // Bigger icon
              name={focused ? 'scan-circle' : 'scan-outline'} 
              color={focused ? '#dc2626' : color} // Red when active
            />
          ),
        }}
      />

      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={24} name={focused ? 'file-tray-full' : 'file-tray-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}