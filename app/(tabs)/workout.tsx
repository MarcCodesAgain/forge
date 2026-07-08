import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors, Typography, Spacing, Radius, GlassCard } from '@/src/theme';

export default function WorkoutScreen() {
  const router = useRouter();
  const { plans } = useWorkoutStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <Text style={styles.pageTitle}>Rutinas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/plan/new')}>
          <Ionicons name="add" size={20} color={Colors.black} />
          <Text style={styles.addBtnText}>Nueva Rutina</Text>
        </TouchableOpacity>
      </View>

      {plans.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Sin rutinas</Text>
          <Text style={styles.emptySub}>Crea tu primera rutina de entrenamiento</Text>
        </View>
      ) : (
        plans.map((plan) => (
          <View key={plan.id} style={styles.planCard}>
            <Text style={styles.planLabel}>RUTINA</Text>
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.divider} />
            {plan.days.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={styles.dayRow}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/session/[planId]/[dayId]',
                    params: { planId: plan.id, dayId: day.id },
                  })
                }
              >
                <View style={styles.dayLeft}>
                  <View style={styles.dayDot} />
                  <View>
                    <Text style={styles.dayName}>{day.name}</Text>
                    <Text style={styles.daySub}>{day.exercises.length} ejercicios</Text>
                  </View>
                </View>
                <View style={styles.dayAction}>
                  <Text style={styles.dayActionText}>INICIAR</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.accent} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 100 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  pageTitle: { ...Typography.headlineMd, color: Colors.text },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accent, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { ...Typography.labelMd, color: Colors.black },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyTitle: { ...Typography.headlineSm, color: Colors.text },
  emptySub: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', textAlign: 'center' },

  planCard: { ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: 14 },
  planLabel: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase', marginBottom: 4 },
  planName: { ...Typography.headlineSm, color: Colors.text, marginBottom: Spacing.sm },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.xs },

  dayRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  dayName: { ...Typography.bodyMd, color: Colors.text, fontFamily: 'Inter_600SemiBold' },
  daySub: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },
  dayAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dayActionText: { ...Typography.labelSm, color: Colors.accent },
});
