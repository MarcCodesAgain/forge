import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { WorkoutDay, Exercise } from '@/src/types';

export default function NewPlanScreen() {
  const router = useRouter();
  const { addPlan } = useWorkoutStore();
  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([]);

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { id: generateId(), name: `Día ${prev.length + 1}`, exercises: [] },
    ]);
  };

  const updateDayName = (dayId: string, name: string) => {
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, name } : d)));
  };

  const addExercise = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                {
                  id: generateId(),
                  name: '',
                  sets: [{ id: generateId(), reps: 10, weight: 0 }],
                },
              ],
            }
          : d
      )
    );
  };

  const updateExerciseName = (dayId: string, exId: string, name: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, name } : e)) }
          : d
      )
    );
  };

  const updateSet = (dayId: string, exId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exId
                  ? { ...e, sets: e.sets.map((s) => (s.id === setId ? { ...s, [field]: num } : s)) }
                  : e
              ),
            }
          : d
      )
    );
  };

  const addSet = (dayId: string, exId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exId
                  ? { ...e, sets: [...e.sets, { id: generateId(), reps: 10, weight: 0 }] }
                  : e
              ),
            }
          : d
      )
    );
  };

  const removeExercise = (dayId: string, exId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d
      )
    );
  };

  const removeDay = (dayId: string) => {
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'El nombre de la rutina no puede estar vacío');
      return;
    }
    if (days.length === 0) {
      Alert.alert('Error', 'Añade al menos un día de entrenamiento');
      return;
    }
    await addPlan({
      id: generateId(),
      name: planName.trim(),
      days,
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <TextInput
        style={styles.planInput}
        placeholder="Nombre de la rutina"
        placeholderTextColor="#8E8E93"
        value={planName}
        onChangeText={setPlanName}
      />

      {days.map((day) => (
        <View key={day.id} style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <TextInput
              style={styles.dayNameInput}
              placeholder="Nombre del día"
              placeholderTextColor="#8E8E93"
              value={day.name}
              onChangeText={(t) => updateDayName(day.id, t)}
            />
            <TouchableOpacity onPress={() => removeDay(day.id)} hitSlop={12}>
              <Ionicons name="close-circle" size={22} color="#FF453A" />
            </TouchableOpacity>
          </View>

          {day.exercises.map((ex) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  style={styles.exerciseInput}
                  placeholder="Nombre del ejercicio"
                  placeholderTextColor="#8E8E93"
                  value={ex.name}
                  onChangeText={(t) => updateExerciseName(day.id, ex.id, t)}
                />
                <TouchableOpacity onPress={() => removeExercise(day.id, ex.id)} hitSlop={12}>
                  <Ionicons name="trash-outline" size={18} color="#FF453A" />
                </TouchableOpacity>
              </View>

              <View style={styles.setHeader}>
                <Text style={[styles.setLabel, { flex: 2 }]}>Serie</Text>
                <Text style={styles.setLabel}>Reps</Text>
                <Text style={styles.setLabel}>Peso (kg)</Text>
              </View>

              {ex.sets.map((set, idx) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setIndex, { flex: 2 }]}>{idx + 1}</Text>
                  <TextInput
                    style={styles.setInput}
                    keyboardType="numeric"
                    value={String(set.reps)}
                    onChangeText={(v) => updateSet(day.id, ex.id, set.id, 'reps', v)}
                  />
                  <TextInput
                    style={styles.setInput}
                    keyboardType="decimal-pad"
                    value={String(set.weight)}
                    onChangeText={(v) => updateSet(day.id, ex.id, set.id, 'weight', v)}
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(day.id, ex.id)}>
                <Text style={styles.addSetText}>+ Añadir serie</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addExBtn} onPress={() => addExercise(day.id)}>
            <Ionicons name="add" size={18} color="#6C63FF" />
            <Text style={styles.addExText}>Añadir ejercicio</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
        <Ionicons name="add-circle-outline" size={20} color="#6C63FF" />
        <Text style={styles.addDayText}>Añadir día</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Guardar rutina</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  planInput: { backgroundColor: '#1C1C1E', color: '#FFFFFF', borderRadius: 10, padding: 14, fontSize: 18, fontWeight: '600', marginBottom: 20 },
  dayCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 16 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dayNameInput: { flex: 1, color: '#FFFFFF', fontSize: 16, fontWeight: '600', borderBottomWidth: 1, borderBottomColor: '#3A3A3C', paddingBottom: 4 },
  exerciseCard: { backgroundColor: '#2C2C2E', borderRadius: 10, padding: 12, marginBottom: 10 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  exerciseInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  setHeader: { flexDirection: 'row', marginBottom: 4 },
  setLabel: { flex: 1, color: '#8E8E93', fontSize: 12, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  setIndex: { color: '#8E8E93', fontSize: 14, textAlign: 'center' },
  setInput: { flex: 1, backgroundColor: '#3A3A3C', color: '#FFFFFF', borderRadius: 6, padding: 6, textAlign: 'center', fontSize: 14, marginHorizontal: 2 },
  addSetBtn: { alignItems: 'center', marginTop: 6 },
  addSetText: { color: '#6C63FF', fontSize: 13 },
  addExBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  addExText: { color: '#6C63FF', fontSize: 15 },
  addDayBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14, marginBottom: 16 },
  addDayText: { color: '#6C63FF', fontSize: 16, fontWeight: '600' },
  saveBtn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});
