import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors, Typography, Spacing, Radius, GlassCard } from '@/src/theme';

export default function HistoryScreen() {
  const { logs, plans } = useWorkoutStore();

  const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getPlanAndDay = (planId: string, dayId: string) => {
    const plan = plans.find((p) => p.id === planId);
    const day = plan?.days.find((d) => d.id === dayId);
    return { planName: plan?.name ?? 'Rutina', dayName: day?.name ?? 'Día' };
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const totalVolume = (log: typeof logs[0]) =>
    log.exercises.reduce((a, ex) =>
      a + ex.sets.filter(s => s.completed).reduce((s, set) => s + set.weight * set.reps, 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Performance</Text>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="stats-chart-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sin sesiones aún</Text>
          <Text style={styles.emptySub}>Completa tu primera sesión para ver tu progreso</Text>
        </View>
      ) : (
        <>
          {/* Summary Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: Colors.accent }]}>
              <Text style={styles.statValue}>{sorted.length}</Text>
              <Text style={styles.statLabel}>Sesiones</Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: Colors.blue }]}>
              <Text style={styles.statValue}>
                {(sorted.reduce((a, l) => a + totalVolume(l), 0) / 1000).toFixed(0)}k
              </Text>
              <Text style={styles.statLabel}>kg total</Text>
            </View>
          </View>

          {/* Session List */}
          <Text style={styles.sectionLabel}>HISTORIAL DE SESIONES</Text>
          {sorted.map((log) => {
            const { planName, dayName } = getPlanAndDay(log.planId, log.dayId);
            const vol = totalVolume(log);
            const completed = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
            return (
              <TouchableOpacity key={log.id} style={styles.sessionCard} activeOpacity={0.8}>
                <View style={styles.sessionIcon}>
                  <Ionicons name="barbell-outline" size={20} color={Colors.blue} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDay}>{dayName}</Text>
                  {vol > 0
                    ? <Text style={styles.sessionVolume}>Volumen: {vol.toFixed(0)} kg</Text>
                    : <Text style={styles.sessionSets}>{completed} series completadas</Text>
                  }
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionDate}>{formatDate(log.date)}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 100 },
  pageTitle: { ...Typography.headlineMd, color: Colors.text, marginBottom: Spacing.md },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.headlineSm, color: Colors.text },
  emptySub: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.md },
  statCard: { ...GlassCard, flex: 1, borderRadius: Radius.lg, padding: Spacing.md },
  statValue: { ...Typography.dataDisplay, color: Colors.text, fontSize: 28 },
  statLabel: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 4 },

  sectionLabel: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase', marginBottom: Spacing.sm },

  sessionCard: {
    ...GlassCard, borderRadius: Radius.lg,
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, marginBottom: 10, gap: Spacing.md,
  },
  sessionIcon: {
    width: 44, height: 44, borderRadius: Radius.sm,
    backgroundColor: Colors.blueDim,
    alignItems: 'center', justifyContent: 'center',
  },
  sessionInfo: { flex: 1 },
  sessionDay: { ...Typography.labelMd, color: Colors.text },
  sessionVolume: { ...Typography.labelSm, color: Colors.accent, marginTop: 2 },
  sessionSets: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },
  sessionRight: { alignItems: 'flex-end', gap: 4 },
  sessionDate: { ...Typography.labelSm, color: Colors.textTertiary },
});
