import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useAudio } from '../context/AudioContext';

export default function SettingsScreen() {
  const { stopAll, presets } = useAudio();

  const openGitHub = () => {
    Linking.openURL('https://github.com/Tosencen/XMSLEEP');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          <TouchableOpacity style={styles.item} onPress={stopAll}>
            <Text style={styles.itemText}>Stop All Sounds</Text>
            <Text style={styles.itemIcon}>⏹</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.item}>
            <Text style={styles.itemText}>Version</Text>
            <Text style={styles.itemValue}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.item} onPress={openGitHub}>
            <Text style={styles.itemText}>Original Project (XMSLEEP)</Text>
            <Text style={styles.itemIcon}>🔗</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.item}>
            <Text style={styles.itemText}>Saved Presets</Text>
            <Text style={styles.itemValue}>{presets.filter(p => p.sounds.length > 0).length}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: { padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  scroll: { flex: 1 },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, color: '#6b7fa8', fontWeight: '600', marginBottom: 10, textTransform: 'uppercase' },
  item: { backgroundColor: '#1a2332', padding: 16, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { color: '#fff', fontSize: 16 },
  itemValue: { color: '#6b7fa8', fontSize: 16 },
  itemIcon: { fontSize: 20 },
});
