import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useAudio } from '../context/AudioContext';

export default function HomeScreen({ navigation }: any) {
  const { scenes, loadScene } = useAudio();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nocta</Text>
      <Text style={styles.subtitle}>Calm Your Night</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Mixer')}
      >
        <Text style={styles.buttonText}>🎵 Start Mixing</Text>
      </TouchableOpacity>

      {scenes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Scenes</Text>
          <FlatList
            data={scenes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.sceneItem}
                onPress={() => loadScene(item)}
              >
                <Text style={styles.sceneName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27', padding: 20 },
  title: { fontSize: 48, color: '#fff', fontWeight: 'bold', marginTop: 60 },
  subtitle: { fontSize: 18, color: '#8b9dc3', marginBottom: 40 },
  button: { backgroundColor: '#3b4a6b', padding: 20, borderRadius: 12, marginBottom: 20 },
  buttonText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 20, color: '#fff', marginBottom: 15 },
  sceneItem: { backgroundColor: '#1a2332', padding: 15, borderRadius: 8, marginBottom: 10 },
  sceneName: { color: '#fff', fontSize: 16 },
});
