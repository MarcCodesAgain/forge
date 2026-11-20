import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { localDateKey } from '@/src/store/workoutData';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';
import { useWeekVolumes, useWeekStreak, useSessionsThisMonth } from '@/src/hooks/useWeekStats';
import { notify } from '@/src/lib/confirm';
import { plural } from '@/src/lib/plural';

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function getTodayIndex() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}

function greeting(hour = new Date().getHours()) {
  if (hour >= 6 && hour < 14) return 'Buenos días';
  if (hour >= 14 && hour < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDayDate(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getDate();
}

export default function HomeScreen() {
  const router = useRouter();
  const { plans, logs, weightLogs, upsertWeightLog } = useWorkoutStore();
  // No navigation header on this tab, so keep clear of the notch/status bar.
  const insets = useSafeAreaInsets();

  const todayIdx = getTodayIndex();

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const weekVolumes = useWeekVolumes(logs);
  const maxVol = Math.max(...weekVolumes, 1);
  const weekStreak = useWeekStreak(logs);
  const sessionsThisMonth = useSessionsThisMonth(logs);

  // Last workout info
  const lastLog = recentLogs[0];
  const lastPlan = lastLog ? plans.find(p => p.id === lastLog.planId) : null;
  const lastDay = lastLog && lastPlan ? lastPlan.days.find(d => d.id === lastLog.dayId) : null;

  const hasPlans = plans.length > 0;

  // Today's suggested plan/day: next day in the main plan after the last session
  const mainPlan = plans[0];
  const suggestedDay = (() => {
    if (!mainPlan || mainPlan.days.length === 0) return null;
    if (!lastLog || lastLog.planId !== mainPlan.id) return mainPlan.days[0];
    const lastDayIdx = mainPlan.days.findIndex(d => d.id === lastLog.dayId);
    return mainPlan.days[(lastDayIdx + 1) % mainPlan.days.length];
  })();

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const activeDay = mainPlan?.days.find(d => d.id === selectedDayId) ?? suggestedDay;

  // Weight widget
  const todayStr = localDateKey();
  const todayWeight = weightLogs.find(w => w.date === todayStr);
  const [weightInput, setWeightInput] = useState('');
  const [weightSaving, setWeightSaving] = useState(false);
  const [weightEditing, setWeightEditing] = useState(false);

  const handleSaveWeight = async () => {
    const val = parseFloat(weightInput.replace(',', '.'));
    if (!val || val < 20 || val > 300) return;
    setWeightSaving(true);
    const error = await upsertWeightLog(todayStr, val);
    setWeightSaving(false);
    if (error) { notify('Error', error); return; }
    setWeightEditing(false);
    setWeightInput('');
    Keyboard.dismiss();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.subtitle}>
            {hasPlans ? '¿Listo para entrenar hoy?' : 'Empieza creando tu primera rutina'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          hitSlop={12}
          style={styles.settingsBtn}
          accessibilityRole="button"
          accessibilityLabel="Ajustes"
        >
          <Ionicons name="settings-outline" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Weekly activity strip */}
      <View style={styles.weekCard}>
        {WEEK_LABELS.map((label, idx) => {
          const isToday = idx === todayIdx;
          const hasActivity = weekVolumes[idx] > 0;
          const barH = hasActivity ? Math.max(4, (weekVolumes[idx] / maxVol) * 28) : 4;
          return (
            <View key={label} style={styles.weekCol}>
              <View style={styles.weekBarBg}>
                <View style={[styles.weekBarFill, { height: barH, backgroundColor: isToday ? Colors.accent : hasActivity ? Colors.blue : Colors.surfaceBright }]} />
              </View>
              <View style={[styles.weekDot, isToday && styles.weekDotActive]}>
                <Text style={[styles.weekLabel, isToday && styles.weekLabelActive]}>{label}</Text>
              </View>
              <Text style={styles.weekDate}>{formatDayDate(idx - todayIdx)}</Text>
            </View>
          );
        })}
      </View>

      {/* Weight widget */}
      <View style={styles.weightCard}>
        <View style={styles.weightLeft}>
          <Ionicons name="scale-outline" size={18} color={Colors.blue} />
          <Text style={styles.weightLabel}>Peso corporal</Text>
        </View>
        {todayWeight && !weightEditing ? (
          <View style={styles.weightRight}>
            <Text style={styles.weightValue}>{todayWeight.weight}<Text style={styles.weightUnit}> kg</Text></Text>
            <TouchableOpacity onPress={() => { setWeightInput(String(todayWeight.weight)); setWeightEditing(true); }} hitSlop={8}>
              <Ionicons name="pencil-outline" size={15} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.weightInputRow}>
            <TextInput
              style={styles.weightInput}
              keyboardType="decimal-pad"
              placeholder={todayWeight ? String(todayWeight.weight) : '75.0'}
              placeholderTextColor={Colors.textTertiary}
              value={weightInput}
              onChangeText={setWeightInput}
              selectTextOnFocus
              autoFocus={weightEditing}
              returnKeyType="done"
              onSubmitEditing={handleSaveWeight}
            />
            <Text style={styles.weightUnitStatic}>kg</Text>
            <TouchableOpacity
              style={[styles.weightSaveBtn, weightSaving && { opacity: 0.5 }]}
              onPress={handleSaveWeight}
              disabled={weightSaving}
            >
              <Ionicons name="checkmark" size={16} color={Colors.black} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Onboarding — no plans yet */}
      {!hasPlans && (
        <View style={styles.onboardCard}>
          <View style={styles.onboardIcon}>
            <Ionicons name="barbell-outline" size={32} color={Colors.accent} />
          </View>
          <Text style={styles.onboardTitle}>Crea tu primera rutina</Text>
          <Text style={styles.onboardDesc}>
            Define los días de entrenamiento, ejercicios, series y repeticiones. Después podrás registrar el peso que usas en cada sesión.
          </Text>
          <TouchableOpacity style={[styles.startSessionBtn, OrangeGlow]} onPress={() => router.push('/plan/new')}>
            <Ionicons name="add" size={20} color={Colors.black} />
            <Text style={styles.startSessionText}>Crear rutina</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Today's workout — if has plans */}
      {hasPlans && (
        <>
          <Text style={styles.sectionLabel}>HOY TOCA</Text>
          <View style={styles.todayCard}>
            <View style={styles.todayTop}>
              <View style={styles.todayIconWrap}>
                <Ionicons name="flame-outline" size={22} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.todayPlan}>{mainPlan?.name}</Text>
                <Text style={styles.todayDay}>{activeDay?.name ?? 'Día 1'}</Text>
              </View>
              {/* Selector discreto */}
              {(mainPlan?.days.length ?? 0) > 1 && (
                <TouchableOpacity style={styles.changeDayBtn} onPress={() => setShowDayPicker((p: boolean) => !p)}>
                  <Ionicons name="swap-vertical-outline" size={14} color={Colors.textTertiary} />
                  <Text style={styles.changeDayText}>Cambiar</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Day picker inline — solo visible cuando showDayPicker */}
            {showDayPicker && (
              <View style={styles.dayPickerRow}>
                {mainPlan?.days.map(d => {
                  const isActive = d.id === activeDay?.id;
                  const isSuggested = d.id === suggestedDay?.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.dayChip, isActive && styles.dayChipActive]}
                      onPress={() => { setSelectedDayId(d.id); setShowDayPicker(false); }}
                    >
                      <Text style={[styles.dayChipText, isActive && styles.dayChipTextActive]}>{d.name}</Text>
                      {isSuggested && !isActive && <View style={styles.suggestedDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <View style={styles.todayMeta}>
              <View style={styles.todayMetaItem}>
                <Ionicons name="list-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.todayMetaText}>{plural(activeDay?.exercises.length ?? 0, 'ejercicio', 'ejercicios')}</Text>
              </View>
              {activeDay?.id !== suggestedDay?.id && (
                <TouchableOpacity onPress={() => setSelectedDayId(null)} style={styles.todayMetaItem}>
                  <Ionicons name="refresh-outline" size={13} color={Colors.textTertiary} />
                  <Text style={[styles.todayMetaText, { color: Colors.textTertiary }]}>Volver al sugerido</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.startSessionBtn, OrangeGlow]}
              onPress={() => {
                if (mainPlan && activeDay) router.push({ pathname: '/session/[planId]/[dayId]', params: { planId: mainPlan.id, dayId: activeDay.id } });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={18} color={Colors.black} />
              <Text style={styles.startSessionText}>Empezar entreno</Text>
            </TouchableOpacity>
          </View>

        </>
      )}

      {/* Stats summary */}
      {logs.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>TU PROGRESO</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Text style={styles.streakEmoji}>{weekStreak >= 3 ? '🔥' : '📅'}</Text>
              </View>
              <Text style={styles.statValue}>{weekStreak}</Text>
              <Text style={styles.statLabel}>{weekStreak === 1 ? 'semana seguida' : 'semanas seguidas'}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Ionicons name="barbell-outline" size={18} color={Colors.blue} />
              </View>
              <Text style={styles.statValue}>{sessionsThisMonth}</Text>
              <Text style={styles.statLabel}>sesiones este mes</Text>
            </View>
          </View>
          {lastLog && lastDay && (
            <View style={styles.lastCard}>
              <View style={styles.lastLeft}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <View>
                  <Text style={styles.lastTitle}>Última: {lastDay.name}</Text>
                  <Text style={styles.lastSub}>
                    {new Date(lastLog.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.lastLink}>Historial</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 100, gap: Spacing.md },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: 'Montserrat_700Bold', fontSize: 26, color: Colors.text },
  subtitle: { ...Typography.labelMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', marginTop: 2 },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceHigh, alignItems: 'center', justifyContent: 'center',
  },

  weekCard: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'space-around',
  },
  weekCol: { alignItems: 'center', gap: 4 },
  weekBarBg: { height: 36, justifyContent: 'flex-end' },
  weekBarFill: { width: 6, borderRadius: 3 },
  weekDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  weekDotActive: { backgroundColor: Colors.accent },
  weekLabel: { ...Typography.labelSm, color: Colors.textTertiary },
  weekLabelActive: { color: Colors.black, fontFamily: 'Inter_600SemiBold' },
  weekDate: { fontSize: 9, color: Colors.textTertiary, fontFamily: 'Inter_400Regular' },

  sectionLabel: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1 },

  onboardCard: {
    ...GlassCard, borderRadius: Radius.xl,
    padding: Spacing.lg, alignItems: 'center', gap: Spacing.md,
    borderColor: `${Colors.accent}20`,
  },
  onboardIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  onboardTitle: { fontFamily: 'Montserrat_700Bold', fontSize: 20, color: Colors.text, textAlign: 'center' },
  onboardDesc: { ...Typography.bodyMd, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },

  todayCard: {
    ...GlassCard, borderRadius: Radius.xl,
    padding: Spacing.md, gap: Spacing.md,
    borderColor: `${Colors.accent}20`,
  },
  todayTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  todayIconWrap: {
    width: 48, height: 48, borderRadius: Radius.sm,
    backgroundColor: Colors.accentDim, alignItems: 'center', justifyContent: 'center',
  },
  todayPlan: { ...Typography.labelSm, color: Colors.textTertiary, textTransform: 'uppercase' },
  todayDay: { fontFamily: 'Montserrat_700Bold', fontSize: 22, color: Colors.text, marginTop: 2 },
  todayMeta: { flexDirection: 'row', gap: Spacing.md },
  todayMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  todayMetaText: { ...Typography.labelSm, color: Colors.textTertiary, fontFamily: 'Inter_400Regular' },

  changeDayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderVariant,
  },
  changeDayText: { ...Typography.labelSm, color: Colors.textTertiary },

  dayPickerRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  dayChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderVariant,
    backgroundColor: Colors.surface, flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  dayChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayChipText: { ...Typography.labelSm, color: Colors.textSecondary },
  dayChipTextActive: { color: Colors.black },
  suggestedDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.accent },

  startSessionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: 16,
  },
  startSessionText: { fontFamily: 'Montserrat_700Bold', fontSize: 16, color: Colors.black },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    ...GlassCard, flex: 1, borderRadius: Radius.lg,
    padding: Spacing.md, gap: 2,
  },
  statIconRow: { marginBottom: 4 },
  streakEmoji: { fontSize: 18 },
  statValue: { fontFamily: 'Montserrat_700Bold', fontSize: 28, color: Colors.text },
  statLabel: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 1 },

  lastCard: {
    ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  lastLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  lastTitle: { ...Typography.labelMd, color: Colors.text },
  lastSub: { ...Typography.labelSm, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', marginTop: 2, textTransform: 'capitalize' },
  lastLink: { ...Typography.labelSm, color: Colors.accent },

  weightCard: {
    ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  weightLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weightLabel: { ...Typography.labelMd, color: Colors.textSecondary },
  weightRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  weightValue: { fontFamily: 'Montserrat_700Bold', fontSize: 20, color: Colors.text },
  weightUnit: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textTertiary },
  weightInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weightInput: {
    width: 64, height: 36, backgroundColor: Colors.surface,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.borderVariant,
    color: Colors.text, fontFamily: 'Montserrat_700Bold', fontSize: 16,
    textAlign: 'center', paddingHorizontal: 4,
  },
  weightUnitStatic: { ...Typography.labelSm, color: Colors.textTertiary },
  weightSaveBtn: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
});
