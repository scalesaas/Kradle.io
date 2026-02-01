import { useLocalSearchParams } from "expo-router";
import React from 'react';
import { Text, View } from 'react-native';

export default function BookScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>BookScreen with the id {id}</Text>
    </View>
  )
}