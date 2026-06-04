import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { WorkoutDay } from '@/src/types';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/src/theme';

export default function NewPlanScreen() {
  const router = useRouter();
  const { addPlan } = useWorkoutStore();
  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [saving, setSaving] = useState(false);

  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { id: generateId(), name: `Día ${prev.length + 1}`, exercises: [] },
    ]);
  };

  const updateDayName = (dayId: string, name: string) =>
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, name } : d)));

  const removeDay = (dayId: string) =>
    setDays((prev) => prev.filter((d) => d.id !== dayId));

  const addExercise = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: [...d.exercises, { id: generateId(), name: '', sets: [{ id: generateId(), reps: 10, weight: 0 }] }] }
          : d
      )
    );
  };

  const updateExerciseName = (dayId: string, exId: string, name: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, name } : e)) }
          : d
      )
    );

  const removeExercise = (dayId: string, exId: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d
      )
    );

  const updateSet = (dayId: string, exId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, sets: e.sets.map((s) => s.id === setId ? { ...s, [field]: num } : s) } : e) }
          : d
      )
    );
  };

  const addSet = (dayId: string, exId: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, sets: [...e.sets, { id: generateId(), reps: 10, weight: 0 }] } : e) }
          : d
      )
    );

  const removeSet = (dayId: string, exId: string, setId: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, sets: e.sets.filter((s) => s.id !== setId) } : e) }
          : d
      )
    );

  const handleSave = async () => {
    if (!planName.trim()) { Alert.alert('Error', 'Añade un nombre a la rutina'); return; }
    if (days.length === 0) { Alert.alert('Error', 'Añade al menos un día'); return; }
    setSaving(true);
    await addPlan({ id: generateId(), name: planName.trim(), days, createdAt: new Date().toISOString() });
    setSaving(false);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Nombre de la rutina */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Nombre de la rutina</Text>
        <TextInput
          style={styles.planInput}
          placeholder="Ej: Fuerza 4 días"
          placeholderTextColor={Colors.textTertiary}
          value={planName}
          onChangeText={setPlanName}
          returnKeyType="done"
        />
      </View>

      {/* Días */}
      {days.map((day, dayIdx) => (
        <View key={day.id} style={styles.dayCard}>
          {/* Header del día */}
          <View style={styles.dayHeader}>
            <View style={styles.dayIndex}>
              <Text style={styles.dayIndexText}>{dayIdx + 1}</Text>
            </View>
            <TextInput
              style={styles.dayNameInput}
              placeholder="Nombre del día"
              placeholderTextColor={Colors.textTertiary}
              value={day.name}
              onChangeText={(t) => updateDayName(day.id, t)}
            />
            <TouchableOpacity onPress={() => removeDay(day.id)} hitSlop={12}>
              <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Ejercicios */}
          {day.exercises.map((ex, exIdx) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNum}>Ejercicio {exIdx + 1}</Text>
                <TouchableOpacity onPress={() => removeExercise(day.id, ex.id)} hitSlop={12}>
                  <Ionicons name="close" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.exerciseInput}
                placeholder="Nombre del ejercicio"
                placeholderTextColor={Colors.textTertiary}
                value={ex.name}
                onChangeText={(t) => updateExerciseName(day.id, ex.id, t)}
              />

              {/* Series */}
              <View style={styles.setsTable}>
                <View style={styles.setsHeader}>
                  <Text style={[styles.colHead, styles.colSerie]}>#</Text>
                  <Text style={[styles.colHead, styles.colReps]}>Reps</Text>
                  <Text style={[styles.colHead, styles.colWeight]}>kg</Text>
                  <View style={styles.colAction} />
                </View>
                {ex.sets.map((set, setIdx) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={[styles.setNum, styles.colSerie]}>{setIdx + 1}</Text>
                    <TextInput
                      style={[styles.setInput, styles.colReps]}
                      keyboardType="numeric"
                      value={String(set.reps)}
                      onChangeText={(v) => updateSet(day.id, ex.id, set.id, 'reps', v)}
                      selectTextOnFocus
                    />
                    <TextInput
                      style={[styles.setInput, styles.colWeight]}
                      keyboardType="decimal-pad"
                      value={String(set.weight)}
                      onChangeText={(v) => updateSet(day.id, ex.id, set.id, 'weight', v)}
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={styles.colAction}
                      onPress={() => removeSet(day.id, ex.id, set.id)}
                      disabled={ex.sets.length === 1}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={18}
                        color={ex.sets.length === 1 ? Colors.border : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(day.id, ex.id)}>
                <Ionicons name="add" size={15} color={Colors.accent} />
                <Text style={styles.addSetText}>Añadir serie</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addExBtn} onPress={() => addExercise(day.id)}>
            <Ionicons name="add-circle-outline" size={18} color={Colors.accent} />
            <Text style={styles.addExText}>Añadir ejercicio</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Añadir día */}
      <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
        <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
        <Text style={styles.addDayText}>Añadir día de entrenamiento</Text>
      </TouchableOpacity>

      {/* Guardar */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar rutina'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const colSerie = { width: 28 };
const colReps = { flex: 1 };
const colWeight = { flex: 1 };
const colAction = { width: 28, alignItems: 'center' as const };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 60, gap: Spacing.md },

  section: { gap: Spacing.xs },
  sectionLabel: { ...Typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  planInput: {
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: 14, fontSize: 17, fontWeight: '600', color: Colors.text,
    ...Shadow.sm,
  },

  dayCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayIndex: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  dayIndexText: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  dayNameInput: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.text },

  exerciseCard: {
    margin: Spacing.md,
    marginBottom: 0,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  exerciseNum: { ...Typography.caption, textTransform: 'uppercase', letterSpacing: 0.5 },
  exerciseInput: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.sm, padding: 10, fontSize: 14, color: Colors.text, marginBottom: Spacing.sm,
  },

  setsTable: { gap: 4 },
  setsHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2, marginBottom: 2 },
  colHead: { ...Typography.caption, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.4 },
  colSerie,
  colReps,
  colWeight,
  colAction,
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  setNum: { ...Typography.caption, textAlign: 'center', color: Colors.textTertiary },
  setInput: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.sm, padding: 8, textAlign: 'center', fontSize: 14, color: Colors.text,
  },

  addSetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, alignSelf: 'flex-start' },
  addSetText: { ...Typography.caption, color: Colors.accent, fontWeight: '600' },

  addExBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.md,
  },
  addExText: { ...Typography.body, color: Colors.accent, fontWeight: '500' },

  addDayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs,
    backgroundColor: Colors.accentLight, borderRadius: Radius.md,
    padding: 14, borderWidth: 1, borderColor: Colors.accent + '30',
  },
  addDayText: { ...Typography.body, color: Colors.accent, fontWeight: '600' },

  saveBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, padding: 16, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
