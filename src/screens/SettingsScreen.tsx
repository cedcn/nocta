import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { CircleStop, ExternalLink } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudio } from '../context/AudioContext';
import ScreenBackground from '../components/ScreenBackground';
import GlassCard from '../components/GlassCard';
import { colors, fontSize } from '../theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { stopAll, presets } = useAudio();

  const openGitHub = () => {
    Linking.openURL('https://github.com/Tosencen/XMSLEEP');
  };

  const savedPresets = presets.filter((p) => p.sounds.length > 0).length;

  return (
    <ScreenBackground>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      >
        <Text style={styles.sectionTitle}>Audio</Text>
        <GlassCard style={styles.group}>
          <TouchableOpacity style={styles.item} onPress={stopAll} activeOpacity={0.7}>
            <Text style={styles.itemText}>Stop All Sounds</Text>
            <CircleStop size={22} color={colors.accent} />
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.sectionTitle}>About</Text>
        <GlassCard style={styles.group}>
          <View style={styles.item}>
            <Text style={styles.itemText}>Version</Text>
            <Text style={styles.itemValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.item} onPress={openGitHub} activeOpacity={0.7}>
            <Text style={styles.itemText}>Original Project (XMSLEEP)</Text>
            <ExternalLink size={20} color={colors.accent} />
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.sectionTitle}>Data</Text>
        <GlassCard style={styles.group}>
          <View style={styles.item}>
            <Text style={styles.itemText}>Saved Presets</Text>
            <Text style={styles.itemValue}>{savedPresets}</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: fontSize.display, fontWeight: '800', color: colors.textPrimary },
  content: { paddingHorizontal: 20, paddingTop: 12 },
  sectionTitle: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  group: { padding: 4 },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: { height: 1, backgroundColor: colors.trackInactive, marginHorizontal: 14 },
  itemText: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '600' },
  itemValue: { color: colors.textSecondary, fontSize: fontSize.subtitle },
});
