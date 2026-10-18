import { createNavigationContainerRef, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

export type HomeStackParamList = {
  HomeMain: undefined;
  CategoryDetail: { categoryId: string };
};

export type RootStackParamList = {
  MainTabs: undefined;
  BreathingDetail: { methodId: string };
  MeditationList: { categoryId: string };
  MeditationPlayer: { sessionId: string };
  Pomodoro: undefined;
  BigClock: undefined;
  WeatherSettings: undefined;
};

export type CategoryDetailProps = NativeStackScreenProps<HomeStackParamList, 'CategoryDetail'>;
export type HomeMainProps = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

// Lets UI rendered outside any navigator (the global mini player) navigate and read the current route.
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const useRootNavigation = () => useNavigation<NativeStackNavigationProp<RootStackParamList>>();
