import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';
import MixerScreen from './src/screens/MixerScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import QuotesScreen from './src/screens/QuotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';

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
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '🏠 Home' }} />
          <Tab.Screen name="Mixer" component={MixerScreen} options={{ tabBarLabel: '🎵 Mixer' }} />
          <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ tabBarLabel: '❤️ Favorites' }} />
          <Tab.Screen name="Quotes" component={QuotesScreen} options={{ tabBarLabel: '💭 Quotes' }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: '⚙️ Settings' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AudioProvider>
  );
}
