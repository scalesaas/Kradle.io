import { Ionicons } from "@expo/vector-icons"
import { Tabs } from "expo-router"
import React from 'react'

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="play" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />
        }}
      />
    </Tabs>
  )
}