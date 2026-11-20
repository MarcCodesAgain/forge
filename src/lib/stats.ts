import { localDateKey } from '../store/workoutData';
import type { WorkoutLog } from '../types';

/** 0 = Monday … 6 = Sunday, matching the L M X J V S D strip. */
export function weekdayIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

/** Local date key of the Monday that starts `date`'s week. */
export function weekKey(date: Date): string {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekdayIndex(date));
  return localDateKey(monday);
}

function logVolume(log: WorkoutLog): number {
  return log.exercises.reduce((total, ex) =>
    total + ex.sets.filter((s) => s.completed).reduce((sum, s) => sum + s.weight * s.reps, 0), 0);
}

/** Kg lifted (completed sets) for each day Monday→Sunday of the current week, by local day. */
export function weekVolumes(logs: WorkoutLog[], today = new Date()): number[] {
  const byDay = new Map<string, number>();
  for (const log of logs) {
    const key = localDateKey(new Date(log.date));
    byDay.set(key, (byDay.get(key) ?? 0) + logVolume(log));
  }
  const offset = weekdayIndex(today);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset + i);
    return byDay.get(localDateKey(day)) ?? 0;
  });
}

/**
 * Consecutive weeks (Monday-based) with at least one session. The current
 * week only counts once you've trained in it, but an empty current week
 * doesn't break the streak — Monday morning shouldn't reset it to zero.
 */
export function weekStreak(logs: WorkoutLog[], today = new Date()): number {
  const trainedWeeks = new Set(logs.map((l) => weekKey(new Date(l.date))));
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!trainedWeeks.has(weekKey(cursor))) cursor.setDate(cursor.getDate() - 7);
  let streak = 0;
  while (trainedWeeks.has(weekKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

export function sessionsInMonth(logs: WorkoutLog[], today = new Date()): number {
  return logs.filter((l) => {
    const d = new Date(l.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
}
