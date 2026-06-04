import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '@/src/store/workoutStore';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans } = useWorkoutStore();
  const plan = plans.find((p) => p.id === id);

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Rutina no encontrada</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      data={plan.days}
      keyExtractor={(d) => d.id}
      ListHeaderComponent={<Text style={styles.planName}>{plan.name}</Text>}
      renderItem={({ item: day }) => (
        <View style={styles.dayCard}>
          <Text style={styles.dayName}>{day.name}</Text>
          {day.exercises.map((ex) => (
            <View key={ex.id} style={styles.exRow}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exSets}>{ex.sets.length} series</Text>
            </View>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' },
  errorText: { color: '#8E8E93', fontSize: 16 },
  planName: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 8 },
  dayCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 14 },
  dayName: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginBottom: 8 },
  exRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  exName: { color: '#FFFFFF', fontSize: 14 },
  exSets: { color: '#8E8E93', fontSize: 13 },
});
