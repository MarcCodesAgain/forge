import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateId } from '../lib/uuid';
import type { WorkoutLog, WorkoutPlan } from '../types';
import * as data from './workoutData';
import type { WorkoutData } from './workoutData';

/**
 * Local-first store: everything lives on the device (AsyncStorage, which is
 * localStorage on the web build). No account, no network — it works in a
 * basement gym with no signal. Actions keep an async `Promise<error | null>`
 * shape so screens don't care where the data lives.
 */
interface WorkoutState extends WorkoutData {
  hasHydrated: boolean;
  addPlan: (plan: WorkoutPlan) => Promise<string | null>;
  updatePlan: (plan: WorkoutPlan) => Promise<string | null>;
  deletePlan: (planId: string) => Promise<string | null>;
  addLog: (log: WorkoutLog) => Promise<string | null>;
  upsertWeightLog: (date: string, weight: number) => Promise<string | null>;
  /** Replaces all data with a validated backup. */
  restore: (backup: WorkoutData) => void;
  clearAll: () => void;
}

// When the web build renders in Node there's no window/localStorage; React
// Native always defines `window`, so this only kicks in for that case.
const storage = createJSONStorage(() =>
  Platform.OS === 'web' && typeof window === 'undefined'
    ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
    : AsyncStorage,
);

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => {
      const apply = async (next: (current: WorkoutData) => WorkoutData) => {
        set(next(get()));
        return null;
      };
      return {
        ...data.EMPTY_DATA,
        hasHydrated: false,
        addPlan: (plan) => apply((d) => data.addPlan(d, plan)),
        updatePlan: (plan) => apply((d) => data.updatePlan(d, plan)),
        deletePlan: (planId) => apply((d) => data.deletePlan(d, planId)),
        addLog: (log) => apply((d) => data.addLog(d, log)),
        upsertWeightLog: (date, weight) => apply((d) => data.upsertWeightLog(d, date, weight, generateId())),
        restore: (backup) => set({ ...backup }),
        clearAll: () => set({ ...data.EMPTY_DATA }),
      };
    },
    {
      name: 'forge-data',
      version: 1,
      storage,
      partialize: ({ plans, logs, weightLogs }) => ({ plans, logs, weightLogs }),
      onRehydrateStorage: () => () => useWorkoutStore.setState({ hasHydrated: true }),
    },
  ),
);

/** Snapshot of the persisted data, for backups. */
export function getWorkoutData(): WorkoutData {
  const { plans, logs, weightLogs } = useWorkoutStore.getState();
  return { plans, logs, weightLogs };
}
