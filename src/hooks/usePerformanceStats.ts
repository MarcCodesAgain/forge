import { useMemo } from 'react';
import { WorkoutLog, WorkoutPlan } from '../types';

export function usePRs(logs: WorkoutLog[]) {
  return useMemo(() => {
    const map = new Map<string, { weight: number; date: string }>();
    for (const log of logs) {
      for (const ex of log.exercises) {
        const maxW = Math.max(...ex.sets.filter(s => s.completed && s.weight > 0).map(s => s.weight), 0);
        if (maxW <= 0) continue;
        const current = map.get(ex.exerciseName);
        if (!current || maxW > current.weight) {
          map.set(ex.exerciseName, { weight: maxW, date: log.date });
        }
      }
    }
    return [...map.entries()]
      .map(([name, { weight, date }]) => ({ name, weight, date }))
      .sort((a, b) => b.weight - a.weight);
  }, [logs]);
}

export function useActivePlanExercises(plans: WorkoutPlan[], allExercises: string[]) {
  return useMemo(() => {
    const activePlan = plans[0];
    if (!activePlan) return allExercises;
    const names = activePlan.days.flatMap(d => d.exercises.map(e => e.name));
    return names.filter(n => allExercises.includes(n));
  }, [plans, allExercises]);
}

export function useAllExerciseNames(logs: WorkoutLog[]) {
  return useMemo(() => {
    const names = new Set<string>();
    logs.forEach(l => l.exercises.forEach(e => names.add(e.exerciseName)));
    return [...names].sort();
  }, [logs]);
}
