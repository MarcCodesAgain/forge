import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors, Typography, Spacing, Radius, GlassCard } from '@/src/theme';

export default function LogDetailScreen() {
  const { logId } = useLocalSearchParams<{ logId: string }>();
  const { logs, plans } = useWorkoutStore();

  const log = logs.find(l => l.id === logId);
  const plan = log ? plans.find(p => p.id === log.planId) : null;
  const day = log && plan ? plan.days.find(d => d.id === log.dayId) : null;

  // All logs sorted by date, older first
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (!log) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Sesión no encontrada</Text>
    </View>
  );

  const date = new Date(log.date);
  const totalCompleted = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);

  // For each exercise, find the most recent previous log that has that exercise
  const getPrevSets = (exerciseName: string) => {
    const logsBeforeThis = sortedLogs.filter(l => l.id !== log.id && new Date(l.date) <= new Date(log.date));
    for (let i = logsBeforeThis.length - 1; i >= 0; i--) {
      const ex = logsBeforeThis[i].exercises.find(e => e.exerciseName === exerciseName);
      if (ex) {
        return { sets: ex.sets.filter(s => s.completed), date: logsBeforeThis[i].date };
      }
    }
    return null;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dayName}>{day?.name ?? 'Sesión'}</Text>
        <Text style={styles.planName}>{plan?.name}</Text>
        <Text style={styles.dateText}>
          {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
          <Text style={styles.summaryValue}>{totalCompleted}</Text>
          <Text style={styles.summaryLabel}>series</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="list-outline" size={18} color={Colors.blue} />
          <Text style={styles.summaryValue}>{log.exercises.length}</Text>
          <Text style={styles.summaryLabel}>ejercicios</Text>
        </View>
      </View>

      {/* Exercises */}
      {log.exercises.map((ex, ei) => {
        const completedSets = ex.sets.filter(s => s.completed);
        const prev = getPrevSets(ex.exerciseName);
        const maxWeight = Math.max(...completedSets.filter(s => s.weight > 0).map(s => s.weight), 0);
        const prevMaxWeight = prev ? Math.max(...prev.sets.filter(s => s.weight > 0).map(s => s.weight), 0) : 0;
        const improved = maxWeight > 0 && prevMaxWeight > 0 && maxWeight > prevMaxWeight;

        return (
          <View key={ei} style={styles.exCard}>
            {/* Exercise header */}
            <View style={styles.exHeader}>
              <Text style={styles.exName}>{ex.exerciseName}</Text>
              {improved && (
                <View style={styles.prBadge}>
                  <Ionicons name="trending-up" size={12} color={Colors.success} />
                  <Text style={styles.prBadgeText}>+{(maxWeight - prevMaxWeight).toFixed(1)} kg</Text>
                </View>
              )}
            </View>

            {/* Column headers */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colHead, styles.colSet]}>SET</Text>
              <Text style={[styles.colHead, styles.colData]}>PESO</Text>
              <Text style={[styles.colHead, styles.colData]}>REPS</Text>
              <Text style={[styles.colHead, styles.colData, styles.prevCol]}>ANTERIOR</Text>
            </View>

            {completedSets.map((set, si) => {
              const prevSet = prev?.sets[si];
              const betterWeight = prevSet && set.weight > 0 && prevSet.weight > 0 && set.weight > prevSet.weight;
              return (
                <View key={si} style={[styles.setRow, si % 2 === 1 && styles.setRowAlt]}>
                  <Text style={[styles.setNum, styles.colSet]}>{si + 1}</Text>
                  <Text style={[styles.setVal, styles.colData, betterWeight && styles.setValBetter]}>
                    {set.weight > 0 ? `${set.weight} kg` : '—'}
                  </Text>
                  <Text style={[styles.setVal, styles.colData]}>{set.reps} reps</Text>
                  <Text style={[styles.setVal, styles.colData, styles.prevCol, styles.prevVal]}>
                    {prevSet
                      ? `${prevSet.weight > 0 ? prevSet.weight + ' kg' : '—'} · ${prevSet.reps}r`
                      : '—'}
                  </Text>
                </View>
              );
            })}

            {/* Previous session note */}
            {prev && (
              <View style={styles.prevNote}>
                <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
                <Text style={styles.prevNoteText}>
                  Anterior: {new Date(prev.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            )}

            {completedSets.length === 0 && (
              <Text style={styles.noSets}>Sin series completadas</Text>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { ...Typography.bodyMd, color: Colors.textTertiary },

  header: { gap: 4 },
  dayName: { fontFamily: 'Montserrat_700Bold', fontSize: 26, color: Colors.text },
  planName: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase' },
  dateText: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', marginTop: 2, textTransform: 'capitalize' },

  summaryRow: {
    flexDirection: 'row', gap: Spacing.sm,
    ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryValue: { fontFamily: 'Montserrat_700Bold', fontSize: 20, color: Colors.text },
  summaryLabel: { ...Typography.labelSm, color: Colors.textTertiary },

  exCard: { ...GlassCard, borderRadius: Radius.lg, overflow: 'hidden' },
  exHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exName: { fontFamily: 'Montserrat_700Bold', fontSize: 16, color: Colors.text, flex: 1 },
  prBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.successDim, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  prBadgeText: { ...Typography.labelSm, color: Colors.success },

  tableHeader: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 6,
    backgroundColor: Colors.surfaceHigh,
  },
  colHead: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase', textAlign: 'center' },
  colSet: { width: 36 },
  colData: { flex: 1, textAlign: 'center' },
  prevCol: { color: Colors.textTertiary },

  setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10 },
  setRowAlt: { backgroundColor: `${Colors.surfaceHigh}60` },
  setNum: { ...Typography.labelMd, color: Colors.textTertiary, textAlign: 'center' },
  setVal: { ...Typography.labelMd, color: Colors.text, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  setValBetter: { color: Colors.success, fontFamily: 'Inter_600SemiBold' },
  prevVal: { color: Colors.textTertiary, fontSize: 12 },

  prevNote: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  prevNoteText: { ...Typography.labelSm, color: Colors.textTertiary, fontFamily: 'Inter_400Regular' },
  noSets: { ...Typography.labelMd, color: Colors.textTertiary, padding: Spacing.md, fontFamily: 'Inter_400Regular' },
});
