import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutStore } from '@/src/store/workoutStore';

export default function WorkoutScreen() {
  const router = useRouter();
  const { plans } = useWorkoutStore();

  return (
    <View style={styles.container}>
      {plans.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="play-circle-outline" size={64} color="#3A3A3C" />
          <Text style={styles.emptyText}>Sin rutinas disponibles</Text>
          <Text style={styles.emptySubtext}>Crea una rutina en la pestaña Rutinas primero</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Selecciona una rutina para entrenar</Text>
          <FlatList
            data={plans}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.planCard}>
                <Text style={styles.planName}>{item.name}</Text>
                <FlatList
                  data={item.days}
                  keyExtractor={(d) => d.id}
                  scrollEnabled={false}
                  renderItem={({ item: day }) => (
                    <TouchableOpacity
                      style={styles.dayRow}
                      onPress={() =>
                        router.push({
                          pathname: '/session/[planId]/[dayId]',
                          params: { planId: item.id, dayId: day.id },
                        })
                      }
                    >
                      <View>
                        <Text style={styles.dayName}>{day.name}</Text>
                        <Text style={styles.daySub}>{day.exercises.length} ejercicios</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#6C63FF" />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#8E8E93', fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  sectionTitle: { color: '#8E8E93', fontSize: 13, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  planCard: { backgroundColor: '#1C1C1E', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12 },
  planName: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  dayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2C2C2E' },
  dayName: { color: '#FFFFFF', fontSize: 15 },
  daySub: { color: '#8E8E93', fontSize: 12, marginTop: 2 },
});
