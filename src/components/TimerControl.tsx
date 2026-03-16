import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudio } from '../context/AudioContext';

export default function TimerControl() {
  const { timer, timerRemaining, setTimer } = useAudio();
  const timerOptions = [15, 30, 45, 60];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⏱ Timer</Text>
        {timerRemaining && (
          <Text style={styles.countdown}>{formatTime(timerRemaining)}</Text>
        )}
      </View>
      <View style={styles.buttons}>
        {timerOptions.map(min => (
          <TouchableOpacity
            key={min}
            style={[styles.button, timer === min && styles.buttonActive]}
            onPress={() => setTimer(timer === min ? null : min)}
          >
            <Text style={styles.buttonText}>{min}m</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, marginBottom: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 16, color: '#fff', fontWeight: '600' },
  countdown: { fontSize: 18, color: '#3b5998', fontWeight: 'bold' },
  buttons: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, backgroundColor: '#1a2332', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonActive: { backgroundColor: '#3b5998' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
