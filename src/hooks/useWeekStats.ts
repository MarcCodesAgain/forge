import { useMemo } from 'react';
import { sessionsInMonth, weekStreak, weekVolumes } from '../lib/stats';
import type { WorkoutLog } from '../types';

export const useWeekVolumes = (logs: WorkoutLog[]) => useMemo(() => weekVolumes(logs), [logs]);
export const useWeekStreak = (logs: WorkoutLog[]) => useMemo(() => weekStreak(logs), [logs]);
export const useSessionsThisMonth = (logs: WorkoutLog[]) => useMemo(() => sessionsInMonth(logs), [logs]);
