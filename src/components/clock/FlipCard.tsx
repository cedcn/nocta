import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ClockFont } from './clockFonts';
import { colors, radii, shadow } from '../../theme';

interface FlipCardProps {
  value: string;
  size: number;
  font: ClockFont;
  corner?: string;
  badge?: string;
}

const FLIP_MS = 600;

interface HalfProps {
  value: string;
  size: number;
  font: ClockFont;
  half: 'top' | 'bottom';
}

function Half({ value, size, font, half }: HalfProps) {
  return (
    <View style={[styles.half, { height: size / 2, width: size }, half === 'top' ? styles.halfTop : styles.halfBottom]}>
      <View style={{ height: size, width: size, top: half === 'top' ? 0 : -size / 2 }}>
        <View style={[styles.face, { width: size, height: size }]}>
          <Text
            allowFontScaling={false}
            style={[
              styles.digits,
              {
                fontFamily: font.fontFamily,
                fontSize: size * font.sizeRatio,
                lineHeight: size,
                transform: [{ translateY: size * font.offsetRatio }],
              },
            ]}
          >
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function FlipCard({ value, size, font, corner, badge }: FlipCardProps) {
  const [shown, setShown] = useState(value);
  const [previous, setPrevious] = useState(value);
  const flip = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value === shown) return;
    setPrevious(shown);
    setShown(value);
    flip.setValue(0);
    Animated.timing(flip, {
      toValue: 1,
      duration: FLIP_MS,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => setPrevious(value));
  }, [value, shown, flip]);

  const quarter = size / 4;
  // Rotate each flap around the card's centre line by shifting the pivot to the half's shared edge.
  const topFlap = {
    transform: [
      { perspective: size * 4 },
      { translateY: quarter },
      { rotateX: flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['0deg', '-90deg', '-90deg'] }) },
      { translateY: -quarter },
    ],
  };
  const bottomFlap = {
    transform: [
      { perspective: size * 4 },
      { translateY: -quarter },
      { rotateX: flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['90deg', '90deg', '0deg'] }) },
      { translateY: quarter },
    ],
  };

  return (
    <View style={[styles.card, { width: size, height: size }]}>
      <View style={StyleSheet.absoluteFill}>
        <Half value={shown} size={size} font={font} half="top" />
        <Half value={previous} size={size} font={font} half="bottom" />
      </View>
      <Animated.View style={[styles.flap, { top: 0 }, topFlap]}>
        <Half value={previous} size={size} font={font} half="top" />
      </Animated.View>
      <Animated.View style={[styles.flap, { top: size / 2 }, bottomFlap]}>
        <Half value={shown} size={size} font={font} half="bottom" />
      </Animated.View>
      <View pointerEvents="none" style={[styles.seam, { top: size / 2 - 1 }]} />
      {badge ? (
        <Text allowFontScaling={false} style={[styles.badge, { fontFamily: font.fontFamily, fontSize: size * 0.1 }]}>
          {badge}
        </Text>
      ) : null}
      {corner ? (
        <Text allowFontScaling={false} style={[styles.corner, { fontFamily: font.fontFamily, fontSize: size * 0.14 }]}>
          {corner}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radii.md, ...shadow },
  half: { overflow: 'hidden', backgroundColor: colors.glassStrong },
  halfTop: { borderTopLeftRadius: radii.md, borderTopRightRadius: radii.md },
  halfBottom: { borderBottomLeftRadius: radii.md, borderBottomRightRadius: radii.md },
  face: { alignItems: 'center', justifyContent: 'center' },
  digits: { color: colors.textPrimary, textAlign: 'center', includeFontPadding: false },
  flap: { position: 'absolute', left: 0, backfaceVisibility: 'hidden' },
  seam: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(43, 58, 103, 0.08)' },
  corner: { position: 'absolute', right: '6%', bottom: '5%', color: colors.textPrimary },
  badge: { position: 'absolute', left: '7%', top: '6%', color: colors.textSecondary },
});
