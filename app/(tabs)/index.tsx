import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useAuthStore } from '@/src/store/authStore';
import { Colors, Typography, Spacing, Radius, GlassCard, OrangeGlow } from '@/src/theme';

const WEEK_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function getTodayIndex() {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
}

function formatDayDate(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.getDate();
}

export default function HomeScreen() {
  const router = useRouter();
  const { plans, logs, loadFromStorage, isLoaded } = useWorkoutStore();
  const { signOut } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) loadFromStorage();
  }, []);

  const todayIdx = getTodayIndex();

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const weekVolumes = WEEK_LABELS.map((_, i) => {
    const dayOffset = i - todayIdx;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const log = logs.find(l => l.date.slice(0, 10) === dateStr);
    if (!log) return 0;
    return log.exercises.reduce((a, ex) =>
      a + ex.sets.filter(s => s.completed).reduce((s, set) => s + set.weight * set.reps, 0), 0);
  });
  const maxVol = Math.max(...weekVolumes, 1);

  const totalSessions = logs.length;
  const totalVolume = logs.reduce((a, log) =>
    a + log.exercises.reduce((b, ex) =>
      b + ex.sets.filter(s => s.completed).reduce((c, s) => c + s.weight * s.reps, 0), 0), 0);

  // Last workout info
  const lastLog = recentLogs[0];
  const lastPlan = lastLog ? plans.find(p => p.id === lastLog.planId) : null;
  const lastDay = lastLog && lastPlan ? lastPlan.days.find(d => d.id === lastLog.dayId) : null;

  const hasPlans = plans.length > 0;

  // Today's suggested plan/day: next day in the main plan after the last session
  const mainPlan = plans[0];
  const todayPlan = mainPlan;
  const todayDay = (() => {
    if (!mainPlan) return null;
    if (mainPlan.days.length === 0) return null;
    if (!lastLog || lastLog.planId !== mainPlan.id) return mainPlan.days[0];
    const lastDayIdx = mainPlan.days.findIndex(d => d.id === lastLog.dayId);
    return mainPlan.days[(lastDayIdx + 1) % mainPlan.days.length];
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Buenos días</Text>
          <Text style={styles.subtitle}>
            {hasPlans ? '¿Listo para entrenar hoy?' : 'Empieza creando tu primera rutina'}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} hitSlop={12} style={styles.settingsBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textTertiary} />
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
                <Text style={styles.todayPlan}>{todayPlan?.name}</Text>
                <Text style={styles.todayDay}>{todayDay?.name ?? 'Día 1'}</Text>
              </View>
            </View>
            <View style={styles.todayMeta}>
              <View style={styles.todayMetaItem}>
                <Ionicons name="list-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.todayMetaText}>
                  {todayDay?.exercises.length ?? 0} ejercicios
                </Text>
              </View>
              {lastLog && (
                <View style={styles.todayMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textTertiary} />
                  <Text style={styles.todayMetaText}>
                    Última: {new Date(lastLog.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.startSessionBtn, OrangeGlow]}
              onPress={() => {
                if (todayPlan && todayDay) router.push({ pathname: '/session/[planId]/[dayId]', params: { planId: todayPlan.id, dayId: todayDay.id } });
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={18} color={Colors.black} />
              <Text style={styles.startSessionText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>

          {/* Other plans */}
          {plans.length > 1 && (
            <>
              <Text style={styles.sectionLabel}>OTRAS RUTINAS</Text>
              {plans.slice(1).map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  style={styles.otherPlanCard}
                  onPress={() => router.push({ pathname: '/plan/[id]', params: { id: plan.id } })}
                  activeOpacity={0.8}
                >
                  <Ionicons name="barbell-outline" size={18} color={Colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.otherPlanName}>{plan.name}</Text>
                    <Text style={styles.otherPlanMeta}>{plan.days.length} días · {plan.days.reduce((a, d) => a + d.exercises.length, 0)} ejercicios</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </>
      )}

      {/* Stats summary */}
      {totalSessions > 0 && (
        <>
          <Text style={styles.sectionLabel}>TU PROGRESO</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: Colors.accent }]}>
              <Text style={styles.statValue}>{totalSessions}</Text>
              <Text style={styles.statLabel}>Sesiones</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: Colors.blue }]}>
              <Text style={styles.statValue}>
                {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>kg total</Text>
            </View>
          </View>
          {lastLog && lastDay && (
            <View style={styles.lastCard}>
              <View style={styles.lastLeft}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <View>
                  <Text style={styles.lastTitle}>Última sesión: {lastDay.name}</Text>
                  <Text style={styles.lastSub}>
                    {new Date(lastLog.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.lastLink}>Ver todo</Text>
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

  startSessionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.lg, padding: 16,
  },
  startSessionText: { fontFamily: 'Montserrat_700Bold', fontSize: 16, color: Colors.black },

  otherPlanCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md,
  },
  otherPlanName: { ...Typography.labelMd, color: Colors.text },
  otherPlanMeta: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2, fontFamily: 'Inter_400Regular' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    ...GlassCard, flex: 1, borderRadius: Radius.lg,
    padding: Spacing.md, borderLeftWidth: 3,
  },
  statValue: { fontFamily: 'Montserrat_700Bold', fontSize: 26, color: Colors.text },
  statLabel: { ...Typography.labelSm, color: Colors.textTertiary, marginTop: 2 },

  lastCard: {
    ...GlassCard, borderRadius: Radius.lg, padding: Spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  lastLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  lastTitle: { ...Typography.labelMd, color: Colors.text },
  lastSub: { ...Typography.labelSm, color: Colors.textTertiary, fontFamily: 'Inter_400Regular', marginTop: 2, textTransform: 'capitalize' },
  lastLink: { ...Typography.labelSm, color: Colors.accent },
});
