import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { LoggedSet } from '@/src/types';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/src/theme';

export default function SessionScreen() {
  const { planId, dayId } = useLocalSearchParams<{ planId: string; dayId: string }>();
  const router = useRouter();
  const { plans, addLog } = useWorkoutStore();

  const plan = plans.find((p) => p.id === planId);
  const day = plan?.days.find((d) => d.id === dayId);

  const initialState = useMemo(
    () =>
      (day?.exercises ?? []).map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: ex.sets.map((s) => ({ reps: s.reps, weight: s.weight, completed: false })) as LoggedSet[],
      })),
    []
  );

  const [exercises, setExercises] = useState(initialState);
  const [saving, setSaving] = useState(false);

  if (!plan || !day) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Día no encontrado</Text>
      </View>
    );
  }

  const completedCount = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);
  const totalCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const toggleSet = (exIdx: number, setIdx: number) =>
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, completed: !s.completed } : s) }
          : ex
      )
    );

  const updateSetField = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, [field]: num } : s) }
          : ex
      )
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    await addLog({ id: generateId(), planId, dayId, date: new Date().toISOString(), exercises });
    setSaving(false);
    Alert.alert('¡Entrenamiento guardado!', `${completedCount} series completadas`, [
      { text: 'Ver historial', onPress: () => router.replace('/(tabs)/history') },
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dayName}>{day.name}</Text>
          <Text style={styles.planName}>{plan.name}</Text>
          <View style={styles.progressLabel}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            <Text style={styles.progressText}>{completedCount} / {totalCount} series</Text>
          </View>
        </View>

        {/* Ejercicios */}
        {exercises.map((ex, exIdx) => {
          const exCompleted = ex.sets.every((s) => s.completed);
          return (
            <View key={ex.exerciseId} style={[styles.exerciseCard, exCompleted && styles.exerciseCardDone]}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{ex.exerciseName || `Ejercicio ${exIdx + 1}`}</Text>
                {exCompleted && <Ionicons name="checkmark-circle" size={18} color={Colors.success} />}
              </View>

              <View style={styles.tableHeader}>
                <Text style={[styles.colHead, styles.cSerie]}>#</Text>
                <Text style={[styles.colHead, styles.cReps]}>Reps</Text>
                <Text style={[styles.colHead, styles.cWeight]}>kg</Text>
                <Text style={[styles.colHead, styles.cCheck]}>Hecho</Text>
              </View>

              {ex.sets.map((set, setIdx) => (
                <View key={setIdx} style={[styles.setRow, set.completed && styles.setRowDone]}>
                  <Text style={[styles.setNum, styles.cSerie]}>{setIdx + 1}</Text>
                  <TextInput
                    style={[styles.setInput, styles.cReps, set.completed && styles.setInputDone]}
                    keyboardType="numeric"
                    value={String(set.reps)}
                    onChangeText={(v) => updateSetField(exIdx, setIdx, 'reps', v)}
                    editable={!set.completed}
                    selectTextOnFocus
                  />
                  <TextInput
                    style={[styles.setInput, styles.cWeight, set.completed && styles.setInputDone]}
                    keyboardType="decimal-pad"
                    value={String(set.weight)}
                    onChangeText={(v) => updateSetField(exIdx, setIdx, 'weight', v)}
                    editable={!set.completed}
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={[styles.checkBtn, styles.cCheck, set.completed && styles.checkBtnDone]}
                    onPress={() => toggleSet(exIdx, setIdx)}
                  >
                    <Ionicons
                      name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={26}
                      color={set.completed ? Colors.success : Colors.border}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.finishBtn, saving && { opacity: 0.6 }]}
          onPress={handleFinish}
          disabled={saving}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
          <Text style={styles.finishText}>{saving ? 'Guardando...' : 'Finalizar entrenamiento'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { ...Typography.body, color: Colors.textSecondary },
  progressBar: { height: 3, backgroundColor: Colors.border },
  progressFill: { height: 3, backgroundColor: Colors.success },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },
  header: { gap: 4, marginBottom: Spacing.xs },
  dayName: { ...Typography.title },
  planName: { ...Typography.subhead },
  progressLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  progressText: { ...Typography.caption, color: Colors.success, fontWeight: '600' },
  exerciseCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  exerciseCardDone: { borderColor: Colors.success + '60' },
  exerciseHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exerciseName: { ...Typography.headline, fontSize: 15 },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  colHead: { ...Typography.caption, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 },
  cSerie: { width: 28 },
  cReps: { flex: 1 },
  cWeight: { flex: 1 },
  cCheck: { width: 56, textAlign: 'center' },
  setRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 6,
  },
  setRowDone: { backgroundColor: Colors.successLight },
  setNum: { ...Typography.caption, textAlign: 'center', color: Colors.textTertiary },
  setInput: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.sm, padding: 8, textAlign: 'center', fontSize: 15, color: Colors.text,
  },
  setInputDone: { backgroundColor: Colors.successLight, borderColor: 'transparent', color: Colors.textSecondary },
  checkBtn: { alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: {},
  finishBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  finishText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
