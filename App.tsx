import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';
import MixerScreen from './src/screens/MixerScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import QuotesScreen from './src/screens/QuotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: { backgroundColor: '#0a0e27', borderTopColor: '#1a2332', height: 60, paddingBottom: 8 },
            tabBarActiveTintColor: '#3b5998',
            tabBarInactiveTintColor: '#3b4a6b',
            tabBarLabelStyle: { fontSize: 11 },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
          <Tab.Screen name="Mixer" component={MixerScreen} options={{ tabBarLabel: 'Mixer', tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} /> }} />
          <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: 'Favorites', tabBarIcon: ({ color }) => <Ionicons name="heart" size={24} color={color} /> }} />
          <Tab.Screen name="Quotes" component={QuotesScreen} options={{ tabBarLabel: 'Quotes', tabBarIcon: ({ color }) => <Ionicons name="chatbox-ellipses" size={24} color={color} /> }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Settings', tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} /> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}
