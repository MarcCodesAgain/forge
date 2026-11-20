import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { generateId } from '@/src/lib/uuid';
import type { WorkoutDay } from '@/src/types';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';
import ExercisePicker from '@/src/components/ExercisePicker';
import { notify } from '@/src/lib/confirm';

export default function EditPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plans, updatePlan } = useWorkoutStore();

  const plan = plans.find(p => p.id === id);

  const [planName, setPlanName] = useState('');
  const [days, setDays] = useState<WorkoutDay[]>([]);
  const [saving, setSaving] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ dayId: string } | null>(null);

  // Populate form once plan is available
  useEffect(() => {
    if (!plan) return;
    setPlanName(plan.name);
    setDays(plan.days.map(d => ({
      ...d,
      exercises: d.exercises.map(e => ({
        ...e,
        sets: e.sets.map(s => ({ ...s })),
      })),
    })));
  }, [plan?.id]);

  if (!plan) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Rutina no encontrada</Text>
    </View>
  );

  const addDay = () =>
    setDays(p => [...p, { id: generateId(), name: `Día ${p.length + 1}`, exercises: [] }]);

  const updateDayName = (dayId: string, name: string) =>
    setDays(p => p.map(d => d.id === dayId ? { ...d, name } : d));

  const removeDay = (dayId: string) =>
    setDays(p => p.filter(d => d.id !== dayId));

  const addExercise = (dayId: string, name: string) =>
    setDays(p => p.map(d => d.id === dayId
      ? { ...d, exercises: [...d.exercises, { id: generateId(), name, sets: [{ id: generateId(), reps: 10, weight: 0 }] }] }
      : d));

  const updateExName = (dayId: string, exId: string, name: string) =>
    setDays(p => p.map(d => d.id === dayId
      ? { ...d, exercises: d.exercises.map(e => e.id === exId ? { ...e, name } : e) }
      : d));

  const removeExercise = (dayId: string, exId: string) =>
    setDays(p => p.map(d => d.id === dayId
      ? { ...d, exercises: d.exercises.filter(e => e.id !== exId) }
      : d));

  const updateSet = (dayId: string, exId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const num = parseFloat(value) || 0;
    setDays(p => p.map(d => d.id === dayId
      ? { ...d, exercises: d.exercises.map(e => e.id === exId
          ? { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: num } : s) }
          : e) }
      : d));
  };

  const addSet = (dayId: string, exId: string) =>
    setDays(p => p.map(d => d.id === dayId
      ? { ...d, exercises: d.exercises.map(e => e.id === exId
          ? { ...e, sets: [...e.sets, { id: generateId(), reps: 10, weight: 0 }] }
          : e) }
      : d));

  const removeSet = (dayId: string, exId: string, setId: string) =>
    setDays(p => p.map(d => d.id === dayId
      ? { ...d, exercises: d.exercises.map(e => e.id === exId
          ? { ...e, sets: e.sets.filter(s => s.id !== setId) }
          : e) }
      : d));

  const handleSave = async () => {
    if (!planName.trim()) { notify('Error', 'Añade un nombre a la rutina'); return; }
    if (days.length === 0) { notify('Error', 'Añade al menos un día'); return; }
    setSaving(true);
    const error = await updatePlan({ ...plan, name: planName.trim(), days });
    setSaving(false);
    if (error) { notify('Error al guardar', error); return; }
    router.back();
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.fieldLabel}>NOMBRE DE LA RUTINA</Text>
        <TextInput
          style={styles.planInput}
          placeholder="Ej: Push Day Explosivo"
          placeholderTextColor={Colors.textTertiary}
          value={planName}
          onChangeText={setPlanName}
        />

        {days.map((day, di) => (
          <View key={day.id} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayNum}><Text style={styles.dayNumText}>{di + 1}</Text></View>
              <TextInput
                style={styles.dayNameInput}
                value={day.name}
                onChangeText={t => updateDayName(day.id, t)}
                placeholder="Nombre del día"
                placeholderTextColor={Colors.textTertiary}
              />
              <TouchableOpacity onPress={() => removeDay(day.id)} hitSlop={12}>
                <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {day.exercises.map((ex, ei) => (
              <View key={ex.id} style={styles.exCard}>
                <View style={styles.exHeader}>
                  <View style={styles.exMuscleTag}>
                    <Ionicons name="barbell-outline" size={14} color={Colors.accent} />
                    <Text style={styles.exNum}>EJ. {ei + 1}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeExercise(day.id, ex.id)} hitSlop={12}>
                    <Ionicons name="close" size={18} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.exInput}
                  placeholder="Nombre del ejercicio"
                  placeholderTextColor={Colors.textTertiary}
                  value={ex.name}
                  onChangeText={t => updateExName(day.id, ex.id, t)}
                />

                <View style={styles.setHeaderRow}>
                  <Text style={[styles.colHead, { width: 28 }]}>#</Text>
                  <Text style={[styles.colHead, { width: 72 }]}>kg</Text>
                  <Text style={[styles.colHead, { width: 72 }]}>reps</Text>
                  <View style={{ width: 28 }} />
                </View>

                {ex.sets.map((set, si) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setNum}>{si + 1}</Text>
                    <TextInput
                      style={styles.setInput}
                      keyboardType="decimal-pad"
                      value={String(set.weight)}
                      onChangeText={v => updateSet(day.id, ex.id, set.id, 'weight', v)}
                      selectTextOnFocus
                    />
                    <TextInput
                      style={styles.setInput}
                      keyboardType="numeric"
                      value={String(set.reps)}
                      onChangeText={v => updateSet(day.id, ex.id, set.id, 'reps', v)}
                      selectTextOnFocus
                    />
                    <TouchableOpacity
                      style={{ width: 28, alignItems: 'center' }}
                      onPress={() => removeSet(day.id, ex.id, set.id)}
                      disabled={ex.sets.length === 1}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={18}
                        color={ex.sets.length === 1 ? Colors.surfaceBright : Colors.textTertiary}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(day.id, ex.id)}>
                  <Ionicons name="add" size={14} color={Colors.accent} />
                  <Text style={styles.addSetText}>Añadir serie</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addExBtn} onPress={() => setPickerTarget({ dayId: day.id })}>
              <Ionicons name="search-outline" size={18} color={Colors.accent} />
              <Text style={styles.addExText}>Buscar y añadir ejercicio</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addDayBtn} onPress={addDay}>
          <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
          <Text style={styles.addDayText}>Añadir día de entrenamiento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave} disabled={saving} activeOpacity={0.85}
        >
          <Ionicons name="save-outline" size={20} color={Colors.black} />
          <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <ExercisePicker
        visible={!!pickerTarget}
        onSelect={name => pickerTarget && addExercise(pickerTarget.dayId, name)}
        onClose={() => setPickerTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  errorText: { ...Typography.bodyMd, color: Colors.textTertiary },
  fieldLabel: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase' },
  planInput: {
    borderBottomWidth: 2, borderBottomColor: Colors.borderVariant,
    color: Colors.text, fontSize: 18, fontFamily: 'Montserrat_700Bold',
    paddingVertical: 10,
  },
  dayCard: { ...GlassCard, borderRadius: Radius.lg, overflow: 'hidden' },
  dayHeader: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceHigh, padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  dayNumText: { ...Typography.labelMd, color: Colors.black },
  dayNameInput: { flex: 1, ...Typography.bodyMd, color: Colors.text, fontFamily: 'Inter_600SemiBold' },
  exCard: {
    margin: Spacing.md, marginBottom: 0,
    backgroundColor: Colors.surfaceHigh, borderRadius: Radius.sm,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  exMuscleTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  exNum: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase' },
  exInput: {
    borderBottomWidth: 1, borderBottomColor: Colors.borderVariant,
    color: Colors.text, fontSize: 15, fontFamily: 'Inter_400Regular',
    paddingVertical: 6, marginBottom: Spacing.sm,
  },
  setHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  colHead: { fontSize: 10, fontFamily: 'Inter_600SemiBold', color: Colors.textTertiary, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  setNum: { width: 24, ...Typography.labelSm, color: Colors.textTertiary, textAlign: 'center' },
  setInput: {
    width: 72, backgroundColor: Colors.surface, borderRadius: 6,
    borderWidth: 1, borderColor: Colors.borderVariant,
    color: Colors.text, fontSize: 13, fontFamily: 'Inter_600SemiBold',
    paddingVertical: 5, paddingHorizontal: 4, textAlign: 'center', height: 34,
  },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, alignSelf: 'flex-start' },
  addSetText: { ...Typography.labelSm, color: Colors.accent },
  addExBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.md,
  },
  addExText: { ...Typography.labelMd, color: Colors.accent },
  addDayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1, borderColor: `${Colors.accent}40`,
    borderRadius: Radius.lg, padding: 14, backgroundColor: Colors.accentDim,
  },
  addDayText: { ...Typography.labelMd, color: Colors.accent },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: 16, ...OrangeGlow,
  },
  saveBtnText: { ...Typography.headlineSm, color: Colors.black, fontSize: 16 },
});
