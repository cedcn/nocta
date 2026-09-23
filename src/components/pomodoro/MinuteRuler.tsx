import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fontSize } from '../../theme';

interface MinuteRulerProps {
  value: number;
  min: number;
  max: number;
  enabled: boolean;
  color: string;
  unit: string;
  onChange: (value: number) => void;
}

const TICK_GAP = 16;

export default function MinuteRuler({ value, min, max, enabled, color, unit, onChange }: MinuteRulerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [preview, setPreview] = useState(value);
  const draggingRef = useRef(false);
  const lastTickRef = useRef(value);

  const ticks = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);

  const indexToValue = useCallback(
    (x: number) => Math.min(max, Math.max(min, Math.round(x / TICK_GAP) + min)),
    [min, max],
  );

  // Re-centre when the value changes from outside (e.g. switching between focus and break).
  useEffect(() => {
    if (draggingRef.current || width === 0) return;
    setPreview(value);
    scrollRef.current?.scrollTo({ x: (value - min) * TICK_GAP, animated: false });
  }, [value, min, width]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const v = indexToValue(e.nativeEvent.contentOffset.x);
    if (v !== lastTickRef.current) {
      lastTickRef.current = v;
      setPreview(v);
      if (draggingRef.current) Haptics.selectionAsync().catch(() => {});
    }
  };

  const commit = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    draggingRef.current = false;
    const v = indexToValue(e.nativeEvent.contentOffset.x);
    setPreview(v);
    if (v !== value) onChange(v);
  };

  return (
    <View style={[styles.container, !enabled && styles.disabled]} pointerEvents={enabled ? 'auto' : 'none'}>
      <Text style={[styles.value, { color }]}>
        {preview}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
      <View style={styles.rulerWrap} onLayout={onLayout}>
        {width > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_GAP}
            decelerationRate="fast"
            scrollEventThrottle={16}
            onScroll={onScroll}
            onScrollBeginDrag={() => {
              draggingRef.current = true;
            }}
            onMomentumScrollEnd={commit}
            onScrollEndDrag={(e) => {
              // Without momentum, onMomentumScrollEnd never fires.
              if (!e.nativeEvent.velocity || Math.abs(e.nativeEvent.velocity.x) < 0.05) commit(e);
            }}
            contentContainerStyle={{ paddingHorizontal: width / 2 - TICK_GAP / 2 }}
            contentOffset={{ x: (value - min) * TICK_GAP, y: 0 }}
          >
            {ticks.map((m) => {
              const big = m % 5 === 0;
              return (
                <View key={m} style={styles.tickSlot}>
                  <View style={[styles.tick, big ? styles.tickBig : styles.tickSmall]} />
                  {big && <Text style={styles.tickLabel}>{m}</Text>}
                </View>
              );
            })}
          </ScrollView>
        )}
        <View pointerEvents="none" style={[styles.indicator, { backgroundColor: color, left: width / 2 - 1 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center' },
  disabled: { opacity: 0.3 },
  value: { fontSize: fontSize.title, fontWeight: '800' },
  unit: { fontSize: fontSize.caption, color: colors.textSecondary, fontWeight: '600' },
  rulerWrap: { width: '100%', height: 60, marginTop: 6 },
  tickSlot: { width: TICK_GAP, alignItems: 'center', height: 60 },
  tick: { width: 1, backgroundColor: colors.textSecondary, borderRadius: 1, marginTop: 6 },
  tickBig: { height: 20, width: 1.5 },
  tickSmall: { height: 12, marginTop: 10, opacity: 0.6 },
  tickLabel: { position: 'absolute', top: 30, left: -8, width: 32, textAlign: 'center', fontSize: 11, color: colors.textSecondary },
  indicator: { position: 'absolute', top: 2, width: 2, height: 28, borderRadius: 1 },
});
