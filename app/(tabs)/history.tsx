import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';

export default function HistoryScreen() {
  const { logs, plans } = useWorkoutStore();

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getPlanAndDay = (planId: string, dayId: string) => {
    const plan = plans.find((p) => p.id === planId);
    const day = plan?.days.find((d) => d.id === dayId);
    return { planName: plan?.name ?? 'Rutina', dayName: day?.name ?? 'Día' };
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      {sortedLogs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={64} color="#3A3A3C" />
          <Text style={styles.emptyText}>Sin entrenamientos registrados</Text>
          <Text style={styles.emptySubtext}>Completa tu primera sesión para verla aquí</Text>
        </View>
      ) : (
        <FlatList
          data={sortedLogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => {
            const { planName, dayName } = getPlanAndDay(item.planId, item.dayId);
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Text style={styles.planName}>{planName}</Text>
                  </View>
                  <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
                {item.exercises.map((ex) => (
                  <View key={ex.exerciseId} style={styles.exerciseRow}>
                    <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                    <Text style={styles.setsText}>
                      {ex.sets.filter((s) => s.completed).length}/{ex.sets.length} series
                    </Text>
                  </View>
                ))}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#8E8E93', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  card: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  dayName: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  planName: { color: '#8E8E93', fontSize: 13, marginTop: 2 },
  date: { color: '#6C63FF', fontSize: 13, fontWeight: '600' },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  exerciseName: { color: '#FFFFFF', fontSize: 14 },
  setsText: { color: '#8E8E93', fontSize: 13 },
});
