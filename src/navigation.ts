import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type HomeStackParamList = {
  HomeMain: undefined;
  CategoryDetail: { categoryId: string };
};

export type CategoryDetailProps = NativeStackScreenProps<HomeStackParamList, 'CategoryDetail'>;
export type HomeMainProps = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;
