import './src/i18n';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AudioProvider } from './src/context/AudioContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { PomodoroProvider } from './src/context/PomodoroContext';
import { WeatherProvider } from './src/context/WeatherContext';
import { LanguageProvider } from './src/i18n/LanguageProvider';
import { refreshManifest } from './src/data/sounds';
import HomeScreen from './src/screens/HomeScreen';
import CategoryDetailScreen from './src/screens/CategoryDetailScreen';
import MixerScreen from './src/screens/MixerScreen';
import QuotesScreen from './src/screens/QuotesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import BreathingListScreen from './src/screens/breathing/BreathingListScreen';
import BreathingDetailScreen from './src/screens/breathing/BreathingDetailScreen';
import MeditationListScreen from './src/screens/meditation/MeditationListScreen';
import MeditationPlayerScreen from './src/screens/meditation/MeditationPlayerScreen';
import PomodoroScreen from './src/screens/pomodoro/PomodoroScreen';
import BigClockScreen from './src/screens/clock/BigClockScreen';
import WeatherSettingsScreen from './src/screens/weather/WeatherSettingsScreen';
import TabBar from './src/components/TabBar';
import { HomeStackParamList, RootStackParamList } from './src/navigation';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  const { showBreathingTab } = useSettings();
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Mixer" component={MixerScreen} />
      {showBreathingTab && <Tab.Screen name="Breathing" component={BreathingListScreen} />}
      <Tab.Screen name="Quotes" component={QuotesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    refreshManifest();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SettingsProvider>
          <AudioProvider>
            <PomodoroProvider>
              <WeatherProvider>
                <StatusBar style="dark" />
                <NavigationContainer>
                  <RootStack.Navigator screenOptions={{ headerShown: false, orientation: 'portrait' }}>
                    <RootStack.Screen name="MainTabs" component={MainTabs} />
                    <RootStack.Screen name="BreathingDetail" component={BreathingDetailScreen} />
                    <RootStack.Screen name="MeditationList" component={MeditationListScreen} />
                    <RootStack.Screen name="MeditationPlayer" component={MeditationPlayerScreen} />
                    <RootStack.Screen name="Pomodoro" component={PomodoroScreen} />
                    <RootStack.Screen
                      name="BigClock"
                      component={BigClockScreen}
                      options={{ animation: 'fade', orientation: 'all' }}
                    />
                    <RootStack.Screen name="WeatherSettings" component={WeatherSettingsScreen} />
                  </RootStack.Navigator>
                </NavigationContainer>
              </WeatherProvider>
            </PomodoroProvider>
          </AudioProvider>
        </SettingsProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
