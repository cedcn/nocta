import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';
import MixerScreen from './src/screens/MixerScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#0a0e27', borderTopColor: '#1a2332' },
            tabBarActiveTintColor: '#6b7fa8',
            tabBarInactiveTintColor: '#3b4a6b',
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '🏠 Home' }} />
          <Tab.Screen name="Mixer" component={MixerScreen} options={{ tabBarLabel: '🎵 Mixer' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}
