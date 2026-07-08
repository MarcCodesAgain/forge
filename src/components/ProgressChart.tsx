import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  label?: string;
  unit?: string;
  color?: string;
}

const W = Dimensions.get('window').width - Spacing.md * 2 - 32;
const H = 140;
const PAD = { top: 16, bottom: 28, left: 36, right: 12 };

export default function ProgressChart({ data, label = 'Progreso', unit = 'kg', color = Colors.accent }: Props) {
  if (data.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Necesitas al menos 2 sesiones para ver el progreso</Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const toY = (v: number) => PAD.top + chartH - ((v - minV) / range) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

  // Smooth path
  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
  }, '');

  const fillPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD.bottom} L ${points[0].x} ${H - PAD.bottom} Z`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  // Show 3 date labels max
  const labelIndices = data.length <= 3
    ? data.map((_, i) => i)
    : [0, Math.floor((data.length - 1) / 2), data.length - 1];

  const increase = data[data.length - 1].value - data[0].value;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>{label.toUpperCase()}</Text>
          <Text style={styles.peak}>
            Máx: <Text style={{ color }}>{maxV}{unit}</Text>
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: increase >= 0 ? Colors.success : Colors.error }]}>
            {increase >= 0 ? '+' : ''}{increase.toFixed(1)}{unit}
          </Text>
          <Text style={styles.badgeSub}>desde inicio</Text>
        </View>
      </View>

      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((t, i) => (
          <Line
            key={i}
            x1={PAD.left} y1={PAD.top + chartH * t}
            x2={W - PAD.right} y2={PAD.top + chartH * t}
            stroke={Colors.border} strokeWidth={1}
          />
        ))}

        {/* Fill */}
        <Path d={fillPath} fill="url(#grad)" />

        {/* Line */}
        <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 5 : 3}
            fill={i === points.length - 1 ? color : Colors.background}
            stroke={color} strokeWidth={2}
          />
        ))}

        {/* Date labels */}
        {labelIndices.map(i => (
          <SvgText
            key={i} x={points[i].x} y={H - 4}
            textAnchor="middle" fontSize={9}
            fill={Colors.textTertiary} fontFamily="Inter_400Regular"
          >
            {formatDate(data[i].date)}
          </SvgText>
        ))}

        {/* Y labels */}
        <SvgText x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize={9} fill={Colors.textTertiary} fontFamily="Inter_400Regular">
          {maxV}
        </SvgText>
        <SvgText x={PAD.left - 4} y={H - PAD.bottom} textAnchor="end" fontSize={9} fill={Colors.textTertiary} fontFamily="Inter_400Regular">
          {minV}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { ...Typography.labelSm, color: Colors.textTertiary, letterSpacing: 1 },
  peak: { ...Typography.labelMd, color: Colors.textSecondary, marginTop: 2 },
  badge: { alignItems: 'flex-end' },
  badgeText: { fontFamily: 'Montserrat_700Bold', fontSize: 18 },
  badgeSub: { ...Typography.labelSm, color: Colors.textTertiary },
  empty: { padding: Spacing.md, alignItems: 'center' },
  emptyText: { ...Typography.labelMd, color: Colors.textTertiary, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});
