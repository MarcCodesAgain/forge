import { useState } from 'react';
import type { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { exportBackup, pickBackup } from '@/src/lib/backup';
import { confirm, notify } from '@/src/lib/confirm';
import { getWorkoutData, useWorkoutStore } from '@/src/store/workoutStore';
import { InvalidBackupError } from '@/src/store/workoutData';
import { Colors, Radius, Spacing, Typography } from '@/src/theme';
import { plural } from '@/src/lib/plural';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({ icon, label, hint, onPress, danger = false, disabled = false }: {
  icon: IconName;
  label: string;
  hint?: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  const color = danger ? Colors.error : Colors.text;
  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={danger ? Colors.error : Colors.accent} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        {hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { plans, logs, weightLogs, restore, clearAll } = useWorkoutStore();
  const [busy, setBusy] = useState(false);
  const isEmpty = plans.length === 0 && logs.length === 0 && weightLogs.length === 0;

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportBackup(getWorkoutData());
    } catch (err) {
      notify('No se ha podido exportar', err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    setBusy(true);
    try {
      const backup = await pickBackup();
      if (!backup) return;
      const ok = await confirm(
        'Restaurar copia de seguridad',
        `Contiene ${plural(backup.plans.length, 'rutina', 'rutinas')} y ${plural(backup.logs.length, 'entreno', 'entrenos')}. Sustituirá todos los datos actuales de este dispositivo.`,
        'Restaurar',
        true,
      );
      if (!ok) return;
      restore(backup);
      notify('Copia restaurada', 'Tus rutinas e historial ya están en este dispositivo.');
    } catch (err) {
      notify(
        'No se ha podido importar',
        err instanceof InvalidBackupError ? err.message : 'No se ha podido leer el fichero.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    const ok = await confirm(
      'Borrar todos los datos',
      'Se eliminarán tus rutinas, tu historial y tus registros de peso de este dispositivo. No se puede deshacer: exporta antes una copia si quieres conservarlos.',
      'Borrar todo',
      true,
    );
    if (ok) clearAll();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Tus datos</Text>
      <View style={styles.card}>
        <Text style={styles.paragraph}>
          Forge guarda todo solo en este dispositivo: no hay cuenta ni servidor y funciona sin conexión.
        </Text>
        <Text style={styles.stats}>
          {plural(plans.length, 'rutina', 'rutinas')} · {plural(logs.length, 'entreno', 'entrenos')} · {plural(weightLogs.length, 'registro de peso', 'registros de peso')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Copia de seguridad</Text>
      <View style={styles.group}>
        <Row
          icon="download-outline"
          label="Exportar copia"
          hint="Un fichero que puedes guardar en tu nube o enviarte"
          onPress={handleExport}
          disabled={busy || isEmpty}
        />
        <Row
          icon="cloud-upload-outline"
          label="Importar copia"
          hint="Para pasar tus datos a un móvil nuevo"
          onPress={handleImport}
          disabled={busy}
        />
      </View>

      <Text style={styles.sectionTitle}>Acerca de</Text>
      <View style={styles.group}>
        <Row icon="shield-checkmark-outline" label="Privacidad" onPress={() => router.push('/privacy')} />
      </View>

      <View style={styles.group}>
        <Row icon="trash-outline" label="Borrar todos los datos" onPress={handleClear} danger disabled={isEmpty} />
      </View>

      <Text style={styles.version}>Forge {Constants.expoConfig?.version ?? ''}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xl, gap: Spacing.sm },
  sectionTitle: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: Spacing.md, marginLeft: Spacing.xs },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  paragraph: { ...Typography.bodyMd, color: Colors.textSecondary },
  stats: { ...Typography.labelMd, color: Colors.text },
  group: { backgroundColor: Colors.surface, borderRadius: Radius.lg, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.borderVariant,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...Typography.labelMd },
  rowHint: { ...Typography.labelSm, color: Colors.textTertiary, letterSpacing: 0 },
  disabled: { opacity: 0.4 },
  version: { ...Typography.labelSm, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.lg },
});
