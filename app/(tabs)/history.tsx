import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/src/theme';

export default function HistoryScreen() {
  const { logs, plans } = useWorkoutStore();

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPlanAndDay = (planId: string, dayId: string) => {
    const plan = plans.find((p) => p.id === planId);
    const day = plan?.days.find((d) => d.id === dayId);
    return { planName: plan?.name ?? 'Rutina', dayName: day?.name ?? 'Día' };
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {sortedLogs.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>Sin entrenamientos aún</Text>
          <Text style={styles.emptySub}>Completa tu primera sesión para verla aquí</Text>
        </View>
      ) : (
        <FlatList
          data={sortedLogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const { planName, dayName } = getPlanAndDay(item.planId, item.dayId);
            const completedSets = item.exercises.reduce(
              (acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0
            );
            const totalSets = item.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Text style={styles.planName}>{planName}</Text>
                  </View>
                  <View style={styles.dateBlock}>
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    <Text style={styles.timeText}>{formatTime(item.date)}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{item.exercises.length}</Text>
                    <Text style={styles.statLabel}>ejercicios</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{completedSets}/{totalSets}</Text>
                    <Text style={styles.statLabel}>series</Text>
                  </View>
                </View>

                {item.exercises.map((ex, i) => (
                  <View key={i} style={styles.exRow}>
                    <Text style={styles.exName}>{ex.exerciseName}</Text>
                    <Text style={styles.exSets}>
                      {ex.sets.filter((s) => s.completed).length} series
                    </Text>
                  </View>
                ))}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, gap: 12, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  emptyTitle: { ...Typography.headline },
  emptySub: { ...Typography.subhead, textAlign: 'center', paddingHorizontal: 32 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: Radius.sm,
    backgroundColor: Colors.successLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardHeaderText: { flex: 1 },
  dayName: { ...Typography.headline, fontSize: 15 },
  planName: { ...Typography.caption, marginTop: 2 },
  dateBlock: { alignItems: 'flex-end' },
  dateText: { ...Typography.caption, color: Colors.accent, fontWeight: '600', textTransform: 'capitalize' },
  timeText: { ...Typography.caption, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.headline, color: Colors.accent },
  statLabel: { ...Typography.caption, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  exRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  exName: { ...Typography.body, fontSize: 14 },
  exSets: { ...Typography.caption },
});
