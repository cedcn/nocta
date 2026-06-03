import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useAudio } from '../context/AudioContext';
import { getSoundById } from '../data/sounds';
import GlassCard from './GlassCard';
import { colors, radii, fontSize, shadow } from '../theme';

export default function FloatingPlayButton() {
  const { playingSounds, stopAll } = useAudio();
  const [expanded, setExpanded] = useState(false);

  if (playingSounds.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {expanded && (
        <GlassCard strong style={styles.expandedView}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Playing ({playingSounds.length})</Text>
            <TouchableOpacity onPress={stopAll} activeOpacity={0.7}>
              <Text style={styles.stopText}>Stop All</Text>
            </TouchableOpacity>
          </View>
          {playingSounds.map((ps) => {
            const sound = getSoundById(ps.id);
            return (
              <View key={ps.id} style={styles.soundItem}>
                <Text style={styles.soundName}>{sound?.nameEn || sound?.name}</Text>
                <Text style={styles.volumeText}>{Math.round(ps.volume * 100)}%</Text>
              </View>
            );
          })}
        </GlassCard>
      )}
      <TouchableOpacity style={styles.button} onPress={() => setExpanded(!expanded)} activeOpacity={0.85}>
        {expanded ? (
          <ChevronDown size={18} color={colors.textOnAccent} />
        ) : (
          <ChevronUp size={18} color={colors.textOnAccent} />
        )}
        <Text style={styles.buttonText}>{playingSounds.length} playing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 100, right: 20, left: 20 },
  expandedView: { marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  headerText: { color: colors.textPrimary, fontSize: fontSize.subtitle, fontWeight: '700' },
  stopText: { color: colors.danger, fontSize: fontSize.body, fontWeight: '700' },
  soundItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.trackInactive,
  },
  soundName: { color: colors.textPrimary, fontSize: fontSize.body },
  volumeText: { color: colors.textSecondary, fontSize: fontSize.body },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    ...shadow,
  },
  buttonText: { color: colors.textOnAccent, fontSize: fontSize.body, fontWeight: '700' },
});
