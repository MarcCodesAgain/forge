import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '@/src/theme';

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
      <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      {plans.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="barbell-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.emptyTitle}>Sin rutinas todavía</Text>
          <Text style={styles.emptySub}>Crea tu primera rutina de entrenamiento</Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/plan/[id]', params: { id: item.id } })}
            >
              <View style={styles.cardLeft}>
                <View style={styles.cardIcon}>
                  <Ionicons name="barbell-outline" size={18} color={Colors.accent} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSub}>{item.days.length} {item.days.length === 1 ? 'día' : 'días'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} hitSlop={12}>
                <Ionicons name="trash-outline" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/plan/new')} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  signOutBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  list: { padding: Spacing.md, gap: 10, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm,
  },
  emptyTitle: { ...Typography.headline },
  emptySub: { ...Typography.subhead, textAlign: 'center' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  cardIcon: {
    width: 40, height: 40, borderRadius: Radius.sm, backgroundColor: Colors.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { ...Typography.headline, fontSize: 15 },
  cardSub: { ...Typography.caption, marginTop: 2 },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
});
