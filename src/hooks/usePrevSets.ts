import { useMemo } from 'react';
import { WorkoutLog, WorkoutDay } from '../types';

export function usePrevSets(logs: WorkoutLog[], day: WorkoutDay | undefined) {
  return useMemo(() => {
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const map = new Map<string, { sets: { reps: number; weight: number }[]; date: string }>();
    for (const ex of (day?.exercises ?? [])) {
      for (const log of sorted) {
        const found = log.exercises.find(e => e.exerciseName === ex.name);
        if (found) {
          map.set(ex.name, { sets: found.sets.filter(s => s.completed), date: log.date });
          break;
        }
      }
    }
    return map;
  }, [logs, day?.id]);
}
