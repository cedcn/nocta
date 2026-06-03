import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import { getSoundById } from '../data/sounds';
import ScreenBackground from '../components/ScreenBackground';
import SoundRow from '../components/SoundRow';
import { colors, fontSize } from '../theme';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, playingSounds } = useAudio();

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>{favorites.length} sounds</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        {favorites.length === 0 ? (
          <View style={styles.empty}>
            <Heart size={56} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart on any sound to add it here</Text>
          </View>
        ) : (
          favorites.map((fav) => {
            const sound = getSoundById(fav.soundId);
            if (!sound) return null;
            return (
              <SoundRow
                key={fav.soundId}
                sound={sound}
                isPlaying={playingSounds.some((p) => p.id === fav.soundId)}
              />
            );
          })
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: fontSize.subtitle, color: colors.textSecondary, marginTop: 2 },
  content: { padding: 20, flexGrow: 1 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: fontSize.title, color: colors.textPrimary, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: fontSize.body, color: colors.textSecondary, textAlign: 'center' },
});
