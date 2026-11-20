import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Typography, Radius, Spacing } from '../theme';

interface Props {
  seconds: number;
  onDone: () => void;
  onSkip: () => void;
}

export default function RestTimer({ seconds, onDone, onSkip }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (remaining <= 0) { onDone(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - remaining / seconds);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
      <View style={styles.card}>
        <Text style={styles.label}>DESCANSO</Text>

        <View style={styles.circleWrap}>
          <Svg width={112} height={112} viewBox="0 0 112 112">
            <Circle cx={56} cy={56} r={radius} fill="none" stroke={Colors.surfaceHighest} strokeWidth={6} />
            <Circle
              cx={56} cy={56} r={radius}
              fill="none" stroke={Colors.accent} strokeWidth={6}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              // Start the ring at 12 o'clock. A plain SVG transform works on
              // native and web; rotation/origin props emit an invalid DOM attribute on web.
              transform="rotate(-90 56 56)"
            />
          </Svg>
          <View style={styles.timerInside}>
            <Text style={styles.timerText}>{remaining}</Text>
            <Text style={styles.timerSub}>seg</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipText}>Saltar descanso</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', bottom: 100, left: 16, right: 16,
    zIndex: 100, alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.surfaceHigh,
    borderRadius: Radius.xl, padding: Spacing.md,
    alignItems: 'center', gap: Spacing.sm,
    borderWidth: 1, borderColor: `${Colors.accent}40`,
    shadowColor: Colors.accent,
    shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 4 },
    elevation: 16, width: '100%',
  },
  label: { ...Typography.labelSm, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2 },
  circleWrap: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  timerInside: { position: 'absolute', alignItems: 'center' },
  timerText: { fontFamily: 'Montserrat_700Bold', fontSize: 30, color: Colors.text, lineHeight: 34 },
  timerSub: { ...Typography.labelSm, color: Colors.textTertiary },
  skipBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderVariant,
  },
  skipText: { ...Typography.labelMd, color: Colors.textTertiary },
});
