import { useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISE_DB, MUSCLES, ExerciseTemplate } from '../data/exercises';
import { Colors, Typography, Spacing, Radius, GlassCard } from '../theme';

interface Props {
  visible: boolean;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export default function ExercisePicker({ visible, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return EXERCISE_DB.filter(e => {
      const matchQuery = e.name.toLowerCase().includes(query.toLowerCase());
      const matchMuscle = !muscle || e.muscle === muscle;
      return matchQuery && matchMuscle;
    });
  }, [query, muscle]);

  const handleSelect = (ex: ExerciseTemplate) => {
    onSelect(ex.name);
    setQuery('');
    setMuscle(null);
    onClose();
  };

  const handleCustom = () => {
    if (query.trim()) {
      onSelect(query.trim());
      setQuery('');
      setMuscle(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Añadir ejercicio</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle filter chips */}
        <FlatList
          horizontal
          data={MUSCLES}
          keyExtractor={m => m}
          showsHorizontalScrollIndicator={false}
          // Without this the horizontal list competes with the results list
          // for height and the chips get clipped.
          style={styles.chipsList}
          contentContainerStyle={styles.chips}
          renderItem={({ item: m }) => (
            <TouchableOpacity
              style={[styles.chip, muscle === m && styles.chipActive]}
              onPress={() => setMuscle(muscle === m ? null : m)}
            >
              <Text style={[styles.chipText, muscle === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Custom exercise shortcut */}
        {query.trim().length > 0 && !EXERCISE_DB.find(e => e.name.toLowerCase() === query.toLowerCase()) && (
          <TouchableOpacity style={styles.customRow} onPress={handleCustom}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.accent} />
            <Text style={styles.customText}>Añadir "<Text style={{ color: Colors.accent }}>{query.trim()}</Text>" como ejercicio</Text>
          </TouchableOpacity>
        )}

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={e => e.name}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.exRow} onPress={() => handleSelect(item)} activeOpacity={0.7}>
              <View style={styles.exIcon}>
                <Ionicons name="barbell-outline" size={16} color={Colors.accent} />
              </View>
              <View style={styles.exInfo}>
                <Text style={styles.exName}>{item.name}</Text>
                <Text style={styles.exMeta}>{item.muscle} · {item.equipment}</Text>
              </View>
              <Ionicons name="add" size={20} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No se encontraron ejercicios</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { ...Typography.headlineSm, color: Colors.text },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceHigh,
    margin: Spacing.md, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  searchInput: { flex: 1, ...Typography.bodyMd, color: Colors.text, fontFamily: 'Inter_400Regular' },
  chipsList: { flexGrow: 0, flexShrink: 0 },
  chips: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderVariant,
    backgroundColor: Colors.surface,
  },
  chipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { ...Typography.labelSm, color: Colors.textTertiary },
  chipTextActive: { color: Colors.black },
  customRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.accentDim, marginHorizontal: Spacing.md,
    borderRadius: Radius.md, marginBottom: Spacing.xs,
  },
  customText: { ...Typography.labelMd, color: Colors.textSecondary, fontFamily: 'Inter_400Regular', flex: 1 },
  exRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  exIcon: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  exInfo: { flex: 1 },
  exName: { ...Typography.labelMd, color: Colors.text },
  exMeta: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },
  empty: { padding: Spacing.lg, alignItems: 'center' },
  emptyText: { ...Typography.bodyMd, color: Colors.textTertiary },
});
