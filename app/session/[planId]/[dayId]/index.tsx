import { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { LoggedSet } from '@/src/types';

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
        sets: ex.sets.map((s) => ({
          reps: s.reps,
          weight: s.weight,
          completed: false,
        })) as LoggedSet[],
      })),
    []
  );

  const [exercises, setExercises] = useState(initialState);

  if (!plan || !day) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Día no encontrado</Text>
      </View>
    );
  }

  const toggleSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: ex.sets.map((s, j) =>
                j === setIdx ? { ...s, completed: !s.completed } : s
              ),
            }
          : ex
      )
    );
  };

  const updateSetField = (exIdx: number, setIdx: number, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: num } : s)) }
          : ex
      )
    );
  };

  const handleFinish = async () => {
    const completed = exercises.some((ex) => ex.sets.some((s) => s.completed));
    if (!completed) {
      Alert.alert('Sin series', '¿Estás seguro? No has completado ninguna serie.');
    }
    await addLog({
      id: generateId(),
      planId,
      dayId,
      date: new Date().toISOString(),
      exercises,
    });
    Alert.alert('¡Entrenamiento guardado!', '', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.header}>{day.name}</Text>
      <Text style={styles.subheader}>{plan.name}</Text>

      {exercises.map((ex, exIdx) => (
        <View key={ex.exerciseId} style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{ex.exerciseName || `Ejercicio ${exIdx + 1}`}</Text>

          <View style={styles.setHeader}>
            <Text style={[styles.colLabel, { flex: 0.5 }]}>#</Text>
            <Text style={styles.colLabel}>Reps</Text>
            <Text style={styles.colLabel}>Peso (kg)</Text>
            <Text style={[styles.colLabel, { flex: 0.7 }]}>Hecho</Text>
          </View>

          {ex.sets.map((set, setIdx) => (
            <View key={setIdx} style={[styles.setRow, set.completed && styles.setRowDone]}>
              <Text style={[styles.setNum, { flex: 0.5 }]}>{setIdx + 1}</Text>
              <TextInput
                style={styles.setInput}
                keyboardType="numeric"
                value={String(set.reps)}
                onChangeText={(v) => updateSetField(exIdx, setIdx, 'reps', v)}
                editable={!set.completed}
              />
              <TextInput
                style={styles.setInput}
                keyboardType="decimal-pad"
                value={String(set.weight)}
                onChangeText={(v) => updateSetField(exIdx, setIdx, 'weight', v)}
                editable={!set.completed}
              />
              <TouchableOpacity
                style={[styles.checkBtn, { flex: 0.7 }, set.completed && styles.checkBtnDone]}
                onPress={() => toggleSet(exIdx, setIdx)}
              >
                <Ionicons
                  name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={set.completed ? '#30D158' : '#8E8E93'}
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
        <Text style={styles.finishText}>Finalizar entrenamiento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' },
  errorText: { color: '#8E8E93', fontSize: 16 },
  header: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subheader: { color: '#8E8E93', fontSize: 14, marginBottom: 20 },
  exerciseCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 14 },
  exerciseName: { color: '#FFFFFF', fontSize: 17, fontWeight: '600', marginBottom: 12 },
  setHeader: { flexDirection: 'row', marginBottom: 6 },
  colLabel: { flex: 1, color: '#8E8E93', fontSize: 12, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, borderRadius: 8, padding: 4 },
  setRowDone: { backgroundColor: 'rgba(48, 209, 88, 0.08)' },
  setNum: { color: '#8E8E93', fontSize: 15, textAlign: 'center' },
  setInput: { flex: 1, backgroundColor: '#2C2C2E', color: '#FFFFFF', borderRadius: 6, padding: 8, textAlign: 'center', fontSize: 15, marginHorizontal: 3 },
  checkBtn: { alignItems: 'center', justifyContent: 'center' },
  checkBtnDone: {},
  finishBtn: { backgroundColor: '#30D158', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  finishText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
