import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAuthStore } from '@/src/store/authStore';

export default function PlansScreen() {
  const router = useRouter();
  const { plans, loadFromStorage, deletePlan, isLoaded } = useWorkoutStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) loadFromStorage();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Eliminar rutina', `¿Eliminar "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deletePlan(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      {plans.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={64} color="#3A3A3C" />
          <Text style={styles.emptyText}>No tienes rutinas aún</Text>
          <Text style={styles.emptySubtext}>Crea tu primera rutina de entrenamiento</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/plan/[id]', params: { id: item.id } })}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSub}>{item.days.length} días</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} hitSlop={12}>
                <Ionicons name="trash-outline" size={20} color="#FF453A" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/plan/new')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { color: '#8E8E93', fontSize: 14 },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: { gap: 4 },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },
  cardSub: { color: '#8E8E93', fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  signOutBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
});
