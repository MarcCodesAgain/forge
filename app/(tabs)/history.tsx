import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Modal, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors, Typography, Spacing, Radius, GlassCard } from '@/src/theme';
import ProgressChart from '@/src/components/ProgressChart';
import { usePRs, useActivePlanExercises, useAllExerciseNames } from '@/src/hooks/usePerformanceStats';

export default function HistoryScreen() {
  const router = useRouter();
  const { logs, plans, weightLogs } = useWorkoutStore();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [showExPicker, setShowExPicker] = useState(false);
  const [sessionLimit, setSessionLimit] = useState(5);

  const sorted = useMemo(() =>
    [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [logs]);

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

  const allExercises = useAllExerciseNames(logs);
  const activePlanExercises = useActivePlanExercises(plans, allExercises);
  const prs = usePRs(logs);

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    return sorted
      .slice()
      .reverse()
      .map(log => {
        const ex = log.exercises.find(e => e.exerciseName === selectedExercise);
        if (!ex) return null;
        const maxW = Math.max(...ex.sets.filter(s => s.completed && s.weight > 0).map(s => s.weight));
        if (!isFinite(maxW)) return null;
        return { date: log.date, value: maxW };
      })
      .filter(Boolean) as { date: string; value: number }[];
  }, [selectedExercise, logs]);

  const totalSessions = sorted.length;

  const weightChartData = useMemo(() =>
    [...weightLogs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(w => ({ date: w.date, value: w.weight }))
  , [weightLogs]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Tu progreso</Text>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="stats-chart-outline" size={52} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sin sesiones aún</Text>
          <Text style={styles.emptySub}>Completa tu primera sesión para ver tu progreso aquí</Text>
        </View>
      ) : (
        <>
          {/* Summary Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: Colors.accent }]}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sesiones</Text>
            </View>
            <View style={[styles.statCard, { borderLeftWidth: 3, borderLeftColor: Colors.success }]}>
              <Text style={styles.statValue}>{allExercises.length}</Text>
              <Text style={styles.statLabel}>Ejercicios</Text>
            </View>
          </View>

          {/* PRs */}
          {prs.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>🏆 RECORDS PERSONALES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prRow}>
                {prs.map(pr => (
                  <View key={pr.name} style={styles.prCard}>
                    <Text style={styles.prExName} numberOfLines={1}>{pr.name}</Text>
                    <Text style={styles.prWeight}>{pr.weight}<Text style={styles.prUnit}> kg</Text></Text>
                    <Text style={styles.prDate}>{formatDate(pr.date)}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Body weight chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>PESO CORPORAL</Text>
              {weightLogs.length > 0 && (
                <Text style={styles.weightLatest}>
                  {weightLogs[0].weight} kg
                </Text>
              )}
            </View>
            {weightChartData.length < 2 ? (
              <View style={styles.chartEmpty}>
                <Ionicons name="scale-outline" size={28} color={Colors.textTertiary} />
                <Text style={styles.chartEmptyText}>
                  {weightChartData.length === 0
                    ? 'Registra tu peso en Inicio para ver tu evolución aquí'
                    : 'Registra tu peso al menos 2 días para ver la gráfica'}
                </Text>
              </View>
            ) : (
              <ProgressChart data={weightChartData} label="Peso" unit=" kg" />
            )}
          </View>

          {/* Progress chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>PROGRESIÓN DE PESO</Text>
              <TouchableOpacity style={styles.exSelector} onPress={() => setShowExPicker(true)}>
                <Text style={styles.exSelectorText} numberOfLines={1}>
                  {selectedExercise ?? 'Seleccionar ejercicio'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.accent} />
              </TouchableOpacity>
            </View>

            {!selectedExercise ? (
              <View style={styles.chartEmpty}>
                <Ionicons name="trending-up-outline" size={32} color={Colors.textTertiary} />
                <Text style={styles.chartEmptyText}>Selecciona un ejercicio para ver tu progresión de peso</Text>
              </View>
            ) : chartData.length < 2 ? (
              <View style={styles.chartEmpty}>
                <Text style={styles.chartEmptyText}>Necesitas al menos 2 sesiones con "{selectedExercise}" para ver el gráfico</Text>
              </View>
            ) : (
              <ProgressChart data={chartData} label={selectedExercise} unit=" kg" />
            )}
          </View>

          {/* Session List */}
          <Text style={styles.sectionLabel}>HISTORIAL DE SESIONES</Text>
          {sorted.slice(0, sessionLimit).map((log) => {
            const { dayName } = getPlanAndDay(log.planId, log.dayId);
            const vol = totalVolume(log);
            const completed = log.exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
            return (
              <TouchableOpacity
                key={log.id}
                style={styles.sessionCard}
                onPress={() => router.push({ pathname: '/log/[logId]', params: { logId: log.id } })}
                activeOpacity={0.75}
              >
                <View style={styles.sessionIcon}>
                  <Ionicons name="barbell-outline" size={20} color={Colors.blue} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionDay}>{dayName}</Text>
                  <Text style={styles.sessionDetail}>
                    {completed} series{vol > 0 ? ` · ${vol.toFixed(0)} kg` : ''}
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text style={styles.sessionDate}>{formatDate(log.date)}</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
          {sorted.length > sessionLimit && (
            <TouchableOpacity style={styles.showMoreBtn} onPress={() => setSessionLimit(l => l + 10)}>
              <Text style={styles.showMoreText}>Ver más ({sorted.length - sessionLimit} sesiones)</Text>
              <Ionicons name="chevron-down" size={14} color={Colors.accent} />
            </TouchableOpacity>
          )}
        </>
      )}

      <Modal visible={showExPicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowExPicker(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar ejercicio</Text>
            <TouchableOpacity onPress={() => setShowExPicker(false)} hitSlop={12}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={activePlanExercises}
            keyExtractor={e => e}
            contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exRow}
                onPress={() => { setSelectedExercise(item); setShowExPicker(false); }}
              >
                <Text style={[styles.exRowText, selectedExercise === item && styles.exRowTextActive]}>{item}</Text>
                {selectedExercise === item && <Ionicons name="checkmark" size={18} color={Colors.accent} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 100, gap: Spacing.md },
  pageTitle: { ...Typography.headlineMd, color: Colors.text },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.headlineSm, color: Colors.text },
  emptySub: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { ...GlassCard, flex: 1, borderRadius: Radius.lg, padding: Spacing.md },
  statValue: { fontFamily: 'Montserrat_700Bold', fontSize: 24, color: Colors.text },
  statLabel: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 4 },

  sectionLabel: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase' },

  prRow: { gap: 10, paddingBottom: 4 },
  prCard: {
    ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md,
    minWidth: 120, borderLeftWidth: 3, borderLeftColor: Colors.accent, gap: 2,
  },
  prExName: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'capitalize', marginBottom: 4 },
  prWeight: { fontFamily: 'Montserrat_700Bold', fontSize: 22, color: Colors.accent },
  prUnit: { fontSize: 13, color: Colors.textTertiary },
  prDate: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },

  chartCard: { ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.md },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartTitle: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },
  exSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.accentDim, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5, maxWidth: 180,
  },
  exSelectorText: { ...Typography.labelSm, color: Colors.accent, flex: 1 },
  chartEmpty: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 8 },
  chartEmptyText: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  weightLatest: { fontFamily: 'Montserrat_700Bold', fontSize: 16, color: Colors.text },
  weightLatestSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textTertiary },

  sessionCard: {
    ...GlassCard, borderRadius: Radius.lg,
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: Spacing.md,
  },
  sessionIcon: {
    width: 44, height: 44, borderRadius: Radius.sm,
    backgroundColor: Colors.blueDim, alignItems: 'center', justifyContent: 'center',
  },
  sessionInfo: { flex: 1 },
  sessionDay: { ...Typography.labelMd, color: Colors.text },
  sessionDetail: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionDate: { ...Typography.labelSm, color: Colors.textTertiary },

  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { ...Typography.headlineSm, color: Colors.text },
  exRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exRowText: { ...Typography.labelMd, color: Colors.text, fontFamily: 'Inter_400Regular' },
  exRowTextActive: { color: Colors.accent, fontFamily: 'Inter_600SemiBold' },

  showMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderWidth: 1, borderColor: Colors.borderVariant,
    borderRadius: Radius.lg, backgroundColor: Colors.surface,
  },
  showMoreText: { ...Typography.labelMd, color: Colors.accent },
});
