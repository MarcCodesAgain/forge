import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutPlan, WorkoutLog } from '../types';

interface WorkoutState {
  plans: WorkoutPlan[];
  logs: WorkoutLog[];
  isLoaded: boolean;
  addPlan: (plan: WorkoutPlan) => Promise<void>;
  updatePlan: (plan: WorkoutPlan) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  addLog: (log: WorkoutLog) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const PLANS_KEY = 'fitjournal_plans';
const LOGS_KEY = 'fitjournal_logs';

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plans: [],
  logs: [],
  isLoaded: false,

  loadFromStorage: async () => {
    try {
      const [plansRaw, logsRaw] = await Promise.all([
        AsyncStorage.getItem(PLANS_KEY),
        AsyncStorage.getItem(LOGS_KEY),
      ]);
      set({
        plans: plansRaw ? JSON.parse(plansRaw) : [],
        logs: logsRaw ? JSON.parse(logsRaw) : [],
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  addPlan: async (plan) => {
    const plans = [...get().plans, plan];
    set({ plans });
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  updatePlan: async (plan) => {
    const plans = get().plans.map((p) => (p.id === plan.id ? plan : p));
    set({ plans });
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  deletePlan: async (planId) => {
    const plans = get().plans.filter((p) => p.id !== planId);
    set({ plans });
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  addLog: async (log) => {
    const logs = [...get().logs, log];
    set({ logs });
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },
}));
