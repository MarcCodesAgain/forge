import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/src/theme';

export default function WorkoutScreen() {
  const router = useRouter();
  const { plans } = useWorkoutStore();

  return (
    <View style={styles.container}>
      {plans.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="play-circle-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>Sin rutinas disponibles</Text>
          <Text style={styles.emptySub}>Crea una rutina en la pestaña Rutinas primero</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.sectionLabel}>Selecciona un día para entrenar</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.planCard}>
              <Text style={styles.planName}>{item.name}</Text>
              {item.days.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={styles.dayRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: '/session/[planId]/[dayId]',
                      params: { planId: item.id, dayId: day.id },
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
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, gap: 12, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  emptyTitle: { ...Typography.headline },
  emptySub: { ...Typography.subhead, textAlign: 'center', paddingHorizontal: 32 },
  sectionLabel: { ...Typography.caption, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: Spacing.xs },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  planName: {
    ...Typography.headline,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  dayName: { ...Typography.body, fontWeight: '500' },
  daySub: { ...Typography.caption, marginTop: 2 },
});
