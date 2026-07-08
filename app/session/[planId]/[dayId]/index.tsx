import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { LoggedSet } from '@/src/types';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';

export default function SessionScreen() {
  const { planId, dayId } = useLocalSearchParams<{ planId: string; dayId: string }>();
  const router = useRouter();
  const { plans, addLog } = useWorkoutStore();
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const plan = plans.find(p => p.id === planId);
  const day = plan?.days.find(d => d.id === dayId);

  const initial = useMemo(() =>
    (day?.exercises ?? []).map(ex => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: false })) as LoggedSet[],
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [planId, dayId]);

  const [exercises, setExercises] = useState(initial);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (!plan || !day) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Día no encontrado</Text>
    </View>
  );

  const completedCount = exercises.reduce((a, ex) => a + ex.sets.filter(s => s.completed).length, 0);
  const totalCount = exercises.reduce((a, ex) => a + ex.sets.length, 0);

  const toggleSet = (ei: number, si: number) =>
    setExercises(p => p.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, completed: !s.completed }),
    }));

  const updateField = (ei: number, si: number, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setExercises(p => p.map((ex, i) => i !== ei ? ex : {
      ...ex, sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: num }),
    }));
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
    setSaving(true);
    await addLog({ id: generateId(), planId, dayId, date: new Date().toISOString(), exercises });
    setSaving(false);
    Alert.alert('¡Entreno guardado!', `${completedCount} series · ${formatTime(elapsed)}`, [
      { text: 'Ver historial', onPress: () => router.replace('/(tabs)/history') },
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session header */}
        <View style={styles.sessionHeader}>
          <View>
            <Text style={styles.sessionActive}>SESSION ACTIVE</Text>
            <Text style={styles.timer}>{formatTime(elapsed)}</Text>
          </View>
          <View style={styles.sessionMeta}>
            <Text style={styles.dayName}>{day.name}</Text>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.setsCount}>{completedCount}/{totalCount} series</Text>
          </View>
        </View>

        {/* Exercise cards */}
        {exercises.map((ex, ei) => {
          const allDone = ex.sets.every(s => s.completed);
          return (
            <View key={ex.exerciseId} style={[styles.exCard, allDone && styles.exCardDone]}>
              <View style={styles.exHeader}>
                <View>
                  <Text style={styles.exName}>{ex.exerciseName || `Ejercicio ${ei + 1}`}</Text>
                  <Text style={styles.exSub}>{ex.sets.length} Sets</Text>
                </View>
                {allDone
                  ? <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
                  : <Ionicons name="barbell-outline" size={22} color={Colors.blue} />
                }
              </View>

              {ex.sets.map((set, si) => (
                <View key={si} style={styles.setGrid}>
                  <Text style={styles.setLabel}>SET {si + 1}</Text>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.setInput, set.completed && styles.setInputDone]}
                      keyboardType="decimal-pad"
                      value={String(set.weight)}
                      onChangeText={v => updateField(ei, si, 'weight', v)}
                      editable={!set.completed}
                      selectTextOnFocus
                    />
                    <Text style={styles.inputUnit}>kg</Text>
                  </View>
                  <View style={styles.inputWrap}>
                    <TextInput
                      style={[styles.setInput, set.completed && styles.setInputDone]}
                      keyboardType="numeric"
                      value={String(set.reps)}
                      onChangeText={v => updateField(ei, si, 'reps', v)}
                      editable={!set.completed}
                      selectTextOnFocus
                    />
                    <Text style={styles.inputUnit}>reps</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleSet(ei, si)} style={styles.checkBtn}>
                    <Ionicons
                      name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={28}
                      color={set.completed ? Colors.success : Colors.borderVariant}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        {/* Finish */}
        <TouchableOpacity
          style={[styles.finishBtn, saving && { opacity: 0.6 }]}
          onPress={handleFinish} disabled={saving} activeOpacity={0.85}
        >
          <Text style={styles.finishText}>{saving ? 'Guardando...' : 'Finalizar y Guardar Entreno'}</Text>
          <Ionicons name="checkmark-circle" size={22} color={Colors.black} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.discardBtn} onPress={() => router.back()}>
          <Text style={styles.discardText}>Descartar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { ...Typography.bodyMd, color: Colors.textTertiary },
  progressBar: { height: 3, backgroundColor: Colors.surfaceHigh },
  progressFill: { height: 3, backgroundColor: Colors.accent },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },

  sessionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  sessionActive: { ...Typography.labelSm, color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2 },
  timer: { fontFamily: 'Montserrat_700Bold', fontSize: 36, color: Colors.accent, lineHeight: 44 },
  sessionMeta: { alignItems: 'flex-end', gap: 2 },
  dayName: { ...Typography.headlineSm, color: Colors.text, fontSize: 16 },
  planName: { ...Typography.labelSm, color: Colors.textTertiary },
  setsCount: { ...Typography.labelSm, color: Colors.success, marginTop: 4 },

  exCard: { ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  exCardDone: { borderColor: `${Colors.success}30` },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  exName: { ...Typography.headlineSm, color: Colors.text, fontSize: 18 },
  exSub: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },

  setGrid: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  setLabel: { width: 42, ...Typography.labelSm, color: Colors.textTertiary },
  inputWrap: { flex: 1, position: 'relative' },
  setInput: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 2, borderBottomColor: Colors.borderVariant,
    color: Colors.text, fontFamily: 'Montserrat_700Bold', fontSize: 16,
    paddingVertical: 8, paddingHorizontal: 4, textAlign: 'center',
  },
  setInputDone: { color: Colors.success, borderBottomColor: Colors.success + '40' },
  inputUnit: { ...Typography.labelSm, color: Colors.textTertiary, textAlign: 'center', marginTop: 2 },
  checkBtn: { width: 36, alignItems: 'center' },

  finishBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.lg,
    padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...OrangeGlow,
  },
  finishText: { fontFamily: 'Montserrat_700Bold', fontSize: 16, color: Colors.black },
  discardBtn: { alignItems: 'center', padding: 12 },
  discardText: { ...Typography.labelMd, color: Colors.error },
});
