import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { LoggedSet } from '@/src/types';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';
import RestTimer from '@/src/components/RestTimer';
import { usePrevSets } from '@/src/hooks/usePrevSets';
import { confirm, notify } from '@/src/lib/confirm';

const REST_SECONDS = 90;

export default function SessionScreen() {
  const { planId, dayId } = useLocalSearchParams<{ planId: string; dayId: string }>();
  const router = useRouter();
  const { plans, logs, addLog } = useWorkoutStore();
  const [saving, setSaving] = useState(false);
  const [showRest, setShowRest] = useState(false);

  const plan = plans.find(p => p.id === planId);
  const day = plan?.days.find(d => d.id === dayId);

  const initial = useMemo(() =>
    (day?.exercises ?? []).map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: false })) as LoggedSet[],
    }))
  , [planId, dayId]);

  const [exercises, setExercises] = useState(initial);

  const prevSetsMap = usePrevSets(logs, day);

  if (!plan || !day) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Día no encontrado</Text>
    </View>
  );

  const completedCount = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const totalCount = exercises.reduce((a, ex) => a + ex.sets.length, 0);
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const toggleSet = (ei: number, si: number) => {
    const wasCompleted = exercises[ei].sets[si].completed;
    setExercises(p => p.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, completed: !s.completed }),
    }));
    if (!wasCompleted) setShowRest(true);
  };

  const updateField = (ei: number, si: number, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setExercises(p => p.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: num }),
    }));
  };

  const handleFinish = async () => {
    setSaving(true);
    const error = await addLog({ id: generateId(), planId, dayId, date: new Date().toISOString(), exercises });
    setSaving(false);
    if (error) {
      notify('Error al guardar', error);
      return;
    }
    const seeHistory = await confirm('¡Entreno guardado!', `${completedCount} ${completedCount === 1 ? 'serie completada' : 'series completadas'}.`, 'Ver historial');
    if (seeHistory) router.replace('/(tabs)/history');
    else router.back();
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session header */}
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionActive}>SESIÓN ACTIVA</Text>
            <Text style={styles.dayName}>{day.name}</Text>
            <Text style={styles.planName}>{plan.name}</Text>
          </View>
          <View style={styles.seriesBadge}>
            <Text style={styles.setsCount}>{completedCount}/{totalCount} series</Text>
          </View>
        </View>

        {/* Exercise cards */}
        {exercises.map((ex, ei) => {
          const allDone = ex.sets.every(s => s.completed);
          const prev = prevSetsMap.get(ex.exerciseName);
          return (
            <View key={ex.exerciseId} style={[styles.exCard, allDone && styles.exCardDone]}>
              <View style={styles.exHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exName}>{ex.exerciseName || `Ejercicio ${ei + 1}`}</Text>
                  {prev ? (
                    <Text style={styles.prevHint}>
                      Anterior ({new Date(prev.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}){': '}
                      {prev.sets.slice(0, 3).map((s, i) =>
                        `${s.weight > 0 ? s.weight + 'kg' : '—'} × ${s.reps}`
                      ).join('  ·  ')}
                      {prev.sets.length > 3 ? ` +${prev.sets.length - 3}` : ''}
                    </Text>
                  ) : (
                    <Text style={styles.exSub}>{ex.sets.length} sets · sin datos anteriores</Text>
                  )}
                </View>
                {allDone
                  ? <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>✓ Hecho</Text></View>
                  : <Ionicons name="barbell-outline" size={20} color={Colors.blue} />
                }
              </View>

              {/* Set column headers */}
              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeaderCell, { width: 48 }]}>SET</Text>
                <Text style={[styles.setHeaderCell, { flex: 1 }]}>KG</Text>
                <Text style={[styles.setHeaderCell, { flex: 1 }]}>REPS</Text>
                <View style={{ width: 72 }} />
              </View>

              {ex.sets.map((set, si) => {
                const prevSet = prev?.sets[si];
                return (
                  <TouchableOpacity
                    key={si}
                    style={[styles.setRow, set.completed && styles.setRowDone]}
                    onPress={() => toggleSet(ei, si)}
                    activeOpacity={0.75}
                  >
                    <View style={{ width: 48, alignItems: 'center' }}>
                      <Text style={[styles.setNum, set.completed && styles.setNumDone]}>{si + 1}</Text>
                      {prevSet && (
                        <Text style={styles.prevSetHint}>
                          {prevSet.weight > 0 ? `${prevSet.weight}×${prevSet.reps}` : `${prevSet.reps}r`}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.inputWrap, set.completed && styles.inputWrapDone]}
                      onPress={e => e.stopPropagation?.()}
                      activeOpacity={1}
                    >
                      <TextInput
                        style={[styles.setInput, set.completed && styles.setInputDone]}
                        keyboardType="decimal-pad"
                        value={String(set.weight)}
                        onChangeText={v => updateField(ei, si, 'weight', v)}
                        editable={!set.completed}
                        selectTextOnFocus
                      />
                      <Text style={styles.inputUnit}>kg</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.inputWrap, set.completed && styles.inputWrapDone]}
                      onPress={e => e.stopPropagation?.()}
                      activeOpacity={1}
                    >
                      <TextInput
                        style={[styles.setInput, set.completed && styles.setInputDone]}
                        keyboardType="numeric"
                        value={String(set.reps)}
                        onChangeText={v => updateField(ei, si, 'reps', v)}
                        editable={!set.completed}
                        selectTextOnFocus
                      />
                      <Text style={styles.inputUnit}>reps</Text>
                    </TouchableOpacity>

                    <View style={styles.checkArea}>
                      <Ionicons
                        name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                        size={32}
                        color={set.completed ? Colors.success : Colors.borderVariant}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {/* Finish */}
        <TouchableOpacity
          style={[styles.finishBtn, saving && { opacity: 0.6 }]}
          onPress={handleFinish} disabled={saving} activeOpacity={0.85}
        >
          <Text style={styles.finishText}>{saving ? 'Guardando...' : 'Finalizar Entreno'}</Text>
          <Ionicons name="checkmark-circle" size={22} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.discardBtn} onPress={() => router.back()}>
          <Text style={styles.discardText}>Descartar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {showRest && (
        <RestTimer
          seconds={REST_SECONDS}
          onDone={() => setShowRest(false)}
          onSkip={() => setShowRest(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { ...Typography.bodyMd, color: Colors.textTertiary },
  progressBar: { height: 3, backgroundColor: Colors.surfaceHigh },
  progressFill: { height: 3, backgroundColor: Colors.accent },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 80 },

  sessionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  sessionActive: { ...Typography.labelSm, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 },
  dayName: { fontFamily: 'Montserrat_700Bold', fontSize: 22, color: Colors.text },
  planName: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },
  seriesBadge: {
    backgroundColor: `${Colors.success}20`, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  setsCount: { ...Typography.labelSm, color: Colors.success },

  exCard: { ...GlassCard, borderRadius: Radius.lg, overflow: 'hidden' },
  exCardDone: { borderColor: `${Colors.success}40` },
  exHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exName: { fontFamily: 'Montserrat_700Bold', fontSize: 17, color: Colors.text },
  exSub: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },
  prevHint: { fontSize: 11, fontFamily: 'Inter_400Regular', color: Colors.textTertiary, marginTop: 3 },
  prevSetHint: { fontSize: 10, fontFamily: 'Inter_400Regular', color: Colors.textTertiary, marginTop: 1 },
  doneBadge: {
    backgroundColor: `${Colors.success}20`, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  doneBadgeText: { ...Typography.labelSm, color: Colors.success },

  setHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    backgroundColor: Colors.surfaceHigh,
  },
  setHeaderCell: { ...Typography.labelSm, color: Colors.textTertiary, textAlign: 'center', textTransform: 'uppercase' },

  setRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  setRowDone: { backgroundColor: `${Colors.success}08` },
  setNum: { width: 48, ...Typography.labelMd, color: Colors.textTertiary, textAlign: 'center' },
  setNumDone: { color: Colors.success },

  inputWrap: {
    flex: 1, alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.sm,
    paddingVertical: 6, paddingHorizontal: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputWrapDone: { borderColor: `${Colors.success}30`, backgroundColor: `${Colors.success}08` },
  setInput: {
    color: Colors.text, fontFamily: 'Montserrat_700Bold', fontSize: 18,
    textAlign: 'center', width: '100%',
  },
  setInputDone: { color: Colors.success },
  inputUnit: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 1 },

  checkArea: {
    width: 72, alignItems: 'center', justifyContent: 'center',
  },

  finishBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...OrangeGlow,
  },
  finishText: { fontFamily: 'Montserrat_700Bold', fontSize: 16, color: Colors.black },
  discardBtn: { alignItems: 'center', padding: 12 },
  discardText: { ...Typography.labelMd, color: Colors.error },
});
