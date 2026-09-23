import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface WaveRingProps {
  size: number;
  progress: number;
  color: string;
  children?: React.ReactNode;
}

const NUM_WAVES = 10;
const STEPS = 180;
const MAX_AMPLITUDE = 6;
const STROKE = 3;

// Rotating a static sine ring is visually identical to shifting its phase (as XMSLEEP does per frame)
// but runs on the native driver, so the path only rebuilds when the amplitude changes once per second.
const buildWavePath = (size: number, amplitude: number) => {
  const c = size / 2;
  const base = c - MAX_AMPLITUDE - STROKE * 2;
  let d = '';
  for (let i = 0; i <= STEPS; i++) {
    const angle = (i / STEPS) * Math.PI * 2;
    const r = base + Math.sin(angle * NUM_WAVES) * amplitude;
    const x = c + r * Math.cos(angle);
    const y = c + r * Math.sin(angle);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
};

export default function WaveRing({ size, progress, color, children }: WaveRingProps) {
  const spin = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(1, Math.max(0, progress));
  const amplitude = Math.round(MAX_AMPLITUDE * clamped * 4) / 4;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const wavePath = useMemo(() => buildWavePath(size, amplitude), [size, amplitude]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '36deg'] });

  const c = size / 2;
  const arcRadius = c - STROKE;
  const circumference = 2 * Math.PI * arcRadius;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={c} cy={c} r={arcRadius} stroke={color} strokeOpacity={0.12} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={c}
          cy={c}
          r={arcRadius}
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
        <Svg width={size} height={size}>
          <Path d={wavePath} stroke={color} strokeOpacity={0.3} strokeWidth={STROKE * 0.8} fill="none" />
        </Svg>
      </Animated.View>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
