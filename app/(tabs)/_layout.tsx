import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide the tab bar completely
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Egypt Urban Maps',
        }}
      />
    </Tabs>
  );
}
