import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { plans, logs, loadFromStorage, deletePlan, isLoaded } = useWorkoutStore();
  const { signOut, user } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) loadFromStorage();
  }, []);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1;

  const totalVolume = logs.slice(0, 5).reduce((acc, log) =>
    acc + log.exercises.reduce((a, ex) =>
      a + ex.sets.filter(s => s.completed).reduce((s2, s) => s2 + s.weight * s.reps, 0), 0), 0);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Eliminar rutina', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deletePlan(id) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, Guerrero 👊</Text>
          <Text style={styles.subGreeting}>Mantén el ritmo. Tu objetivo está a la vista.</Text>
        </View>
        <TouchableOpacity onPress={signOut} hitSlop={12}>
          <Ionicons name="settings-outline" size={24} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Weekly Calendar */}
      <View style={styles.calendarCard}>
        {weekDays.map((day, idx) => (
          <View key={day} style={[styles.dayCell, idx === todayIdx && styles.dayCellActive]}>
            <Text style={[styles.dayLabel, idx === todayIdx && styles.dayLabelActive]}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Stats Bento */}
      <View style={styles.bentoGrid}>
        <View style={[styles.bentoCard, styles.bentoWide]}>
          <Text style={styles.bentoLabel}>VOLUMEN RECIENTE</Text>
          <Text style={styles.bentoValue}>
            {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k` : '—'}
            <Text style={styles.bentoUnit}> kg</Text>
          </Text>
          <View style={styles.miniBar}>
            {[40, 60, 90, 30, 50].map((h, i) => (
              <View key={i} style={[styles.miniBarItem, { height: h * 0.4, backgroundColor: i === 2 ? Colors.accent : Colors.surfaceBright }]} />
            ))}
          </View>
        </View>
        <View style={styles.bentoCard}>
          <Ionicons name="time-outline" size={22} color={Colors.blue} />
          <Text style={styles.bentoLabel}>Sesiones</Text>
          <Text style={styles.bentoValue}>{logs.length}</Text>
        </View>
        <View style={styles.bentoCard}>
          <Ionicons name="flame-outline" size={22} color={Colors.accent} />
          <Text style={styles.bentoLabel}>Rutinas</Text>
          <Text style={styles.bentoValue}>{plans.length}</Text>
        </View>
      </View>

      {/* Rutinas */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tus Rutinas</Text>
        <TouchableOpacity onPress={() => router.push('/plan/new')}>
          <Text style={styles.sectionLink}>+ Nueva</Text>
        </TouchableOpacity>
      </View>

      {plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="barbell-outline" size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>Sin rutinas todavía</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/plan/new')}>
            <Text style={styles.emptyBtnText}>Crear primera rutina</Text>
          </TouchableOpacity>
        </View>
      ) : (
        plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={styles.routineCard}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/plan/[id]', params: { id: plan.id } })}
          >
            <View style={styles.routineCardTop}>
              <View style={styles.routineIcon}>
                <Ionicons name="barbell-outline" size={20} color={Colors.accent} />
              </View>
              <TouchableOpacity onPress={() => handleDelete(plan.id, plan.name)} hitSlop={12}>
                <Ionicons name="ellipsis-vertical" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.routineName}>{plan.name}</Text>
            <View style={styles.routineMeta}>
              <View style={styles.routineMetaItem}>
                <Ionicons name="list-outline" size={15} color={Colors.textTertiary} />
                <Text style={styles.routineMetaText}>
                  {plan.days.reduce((a, d) => a + d.exercises.length, 0)} ejercicios
                </Text>
              </View>
              <View style={styles.routineMetaItem}>
                <Ionicons name="calendar-outline" size={15} color={Colors.textTertiary} />
                <Text style={styles.routineMetaText}>{plan.days.length} días</Text>
              </View>
            </View>
            <View style={styles.routineCardBottom}>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push('/(tabs)/workout')}
              >
                <Text style={styles.startBtnText}>INICIAR</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 100 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  greeting: { ...Typography.headlineSm, color: Colors.text, marginBottom: 4 },
  subGreeting: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular' },

  calendarCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.sm, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  dayCell: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: Radius.sm,
  },
  dayCellActive: { backgroundColor: Colors.accent },
  dayLabel: { ...Typography.labelMd, color: Colors.textTertiary },
  dayLabelActive: { color: Colors.black },

  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: Spacing.md },
  bentoCard: {
    ...GlassCard, borderRadius: Radius.lg,
    padding: Spacing.md, flex: 1, minWidth: '45%', gap: 6,
  },
  bentoWide: { minWidth: '100%' },
  bentoLabel: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase' },
  bentoValue: { ...Typography.dataDisplay, color: Colors.text, fontSize: 28 },
  bentoUnit: { ...Typography.bodyMd, color: Colors.textTertiary },
  miniBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 40, marginTop: 4 },
  miniBarItem: { flex: 1, borderRadius: 2 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.headlineMd, color: Colors.text, fontSize: 20 },
  sectionLink: { ...Typography.labelMd, color: Colors.accent },

  emptyCard: {
    ...GlassCard, borderRadius: Radius.lg,
    padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm,
  },
  emptyText: { ...Typography.bodyMd, color: Colors.textTertiary },
  emptyBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.full,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 4,
  },
  emptyBtnText: { ...Typography.labelMd, color: Colors.black },

  routineCard: {
    ...GlassCard, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: 12,
  },
  routineCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  routineIcon: {
    width: 40, height: 40, borderRadius: Radius.sm,
    backgroundColor: Colors.accentDim,
    alignItems: 'center', justifyContent: 'center',
  },
  routineName: { ...Typography.headlineMd, color: Colors.text, fontSize: 18, marginBottom: Spacing.xs },
  routineMeta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  routineMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routineMetaText: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular' },
  routineCardBottom: { flexDirection: 'row', justifyContent: 'flex-end' },
  startBtn: {
    backgroundColor: Colors.accent, borderRadius: Radius.sm,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  startBtnText: { ...Typography.labelMd, color: Colors.black },
});
