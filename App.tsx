import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from './src/context/AudioContext';
import HomeScreen from './src/screens/HomeScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import MixerScreen from './src/screens/MixerScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import QuotesScreen from './src/screens/QuotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TabBar from './src/components/TabBar';
import { HomeStackParamList } from './src/navigation';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    </HomeStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AudioProvider>
        <StatusBar style="dark" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <TabBar {...props} />}
          >
            <Tab.Screen name="Home" component={HomeStackNavigator} />
            <Tab.Screen name="Mixer" component={MixerScreen} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} />
            <Tab.Screen name="Quotes" component={QuotesScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </AudioProvider>
    </SafeAreaProvider>
  );
}
