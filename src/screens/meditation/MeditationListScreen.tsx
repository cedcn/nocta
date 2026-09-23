import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { formatDuration, getMeditationCategory, getMeditationSessions } from '../../data/meditation';
import { useLocalizedName } from '../../i18n/LanguageProvider';
import { RootScreenProps } from '../../navigation';
import ScreenBackground from '../../components/ScreenBackground';
import BackBar from '../../components/breathing/BackBar';
import { colors, radii, fontSize, shadow } from '../../theme';

export default function MeditationListScreen({ route, navigation }: RootScreenProps<'MeditationList'>) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('meditation');
  const localizedName = useLocalizedName();
  const { categoryId } = route.params;
  const category = getMeditationCategory(categoryId);
  const sessions = getMeditationSessions(categoryId);

  return (
    <ScreenBackground>
      <BackBar title={category ? localizedName(category) : t('title')} onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      >
        <Text style={styles.subtitle}>{t(`subtitles.${categoryId}`, { defaultValue: '' })}</Text>
        <Text style={styles.count}>{t('sessionsCount', { count: sessions.length })}</Text>

        {sessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={styles.row}
            onPress={() => navigation.navigate('MeditationPlayer', { sessionId: session.id })}
            activeOpacity={0.8}
          >
            <Image source={{ uri: session.coverUrl }} style={styles.cover} />
            <View style={styles.texts}>
              <Text style={styles.name} numberOfLines={2}>
                {localizedName(session)}
              </Text>
              <View style={styles.durationRow}>
                <Clock size={12} color={colors.textSecondary} />
                <Text style={styles.duration}>{formatDuration(session.duration)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <Text style={styles.source}>{t('source')}</Text>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  subtitle: { color: colors.textSecondary, fontSize: fontSize.body, marginTop: 4 },
  count: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: 10,
    marginBottom: 12,
    ...shadow,
  },
  cover: { width: 96, height: 60, borderRadius: radii.sm, backgroundColor: colors.pastelLavender },
  texts: { flex: 1, marginLeft: 12 },
  name: { color: colors.textPrimary, fontSize: fontSize.body, fontWeight: '700', lineHeight: 20 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  duration: { color: colors.textSecondary, fontSize: fontSize.caption },
  source: { color: colors.textSecondary, fontSize: fontSize.caption, textAlign: 'center', marginTop: 12 },
});
