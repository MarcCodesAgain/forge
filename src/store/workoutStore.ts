import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { WorkoutPlan, WorkoutLog } from '../types';

interface WorkoutState {
  plans: WorkoutPlan[];
  logs: WorkoutLog[];
  isLoaded: boolean;
  addPlan: (plan: WorkoutPlan) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  addLog: (log: WorkoutLog) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  plans: [],
  logs: [],
  isLoaded: false,

  loadFromStorage: async () => {
    try {
      const [{ data: plansData }, { data: logsData }] = await Promise.all([
        supabase
          .from('workout_plans')
          .select(`
            id, name, created_at,
            workout_days (
              id, name, position,
              exercises (
                id, name, position,
                exercise_sets ( id, reps, weight, position )
              )
            )
          `)
          .order('created_at', { ascending: true }),

        supabase
          .from('workout_logs')
          .select(`
            id, plan_id, day_id, logged_at,
            logged_sets ( id, exercise_id, exercise_name, reps, weight, completed )
          `)
          .order('logged_at', { ascending: false }),
      ]);

      const plans: WorkoutPlan[] = (plansData ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        createdAt: p.created_at,
        days: (p.workout_days ?? [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((d: any) => ({
            id: d.id,
            name: d.name,
            exercises: (d.exercises ?? [])
              .sort((a: any, b: any) => a.position - b.position)
              .map((e: any) => ({
                id: e.id,
                name: e.name,
                sets: (e.exercise_sets ?? [])
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((s: any) => ({ id: s.id, reps: s.reps, weight: s.weight })),
              })),
          })),
      }));

      const logs: WorkoutLog[] = (logsData ?? []).map((l: any) => ({
        id: l.id,
        planId: l.plan_id,
        dayId: l.day_id,
        date: l.logged_at,
        exercises: groupLoggedSets(l.logged_sets ?? []),
      }));

      set({ plans, logs, isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  addPlan: async (plan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: planRow, error } = await supabase
      .from('workout_plans')
      .insert({ name: plan.name, user_id: user.id })
      .select('id')
      .single();
    if (error || !planRow) return;

    for (let di = 0; di < plan.days.length; di++) {
      const day = plan.days[di];
      const { data: dayRow } = await supabase
        .from('workout_days')
        .insert({ plan_id: planRow.id, name: day.name, position: di })
        .select('id')
        .single();
      if (!dayRow) continue;

      for (let ei = 0; ei < day.exercises.length; ei++) {
        const ex = day.exercises[ei];
        const { data: exRow } = await supabase
          .from('exercises')
          .insert({ day_id: dayRow.id, name: ex.name, position: ei })
          .select('id')
          .single();
        if (!exRow) continue;

        const setsToInsert = ex.sets.map((s, si) => ({
          exercise_id: exRow.id,
          reps: s.reps,
          weight: s.weight,
          position: si,
        }));
        if (setsToInsert.length > 0) {
          await supabase.from('exercise_sets').insert(setsToInsert);
        }
      }
    }

    // Reload to get real UUIDs from DB
    await get().loadFromStorage();
  },

  deletePlan: async (planId) => {
    await supabase.from('workout_plans').delete().eq('id', planId);
    set({ plans: get().plans.filter((p) => p.id !== planId) });
  },

  addLog: async (log) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: logRow, error } = await supabase
      .from('workout_logs')
      .insert({ user_id: user.id, plan_id: log.planId, day_id: log.dayId })
      .select('id')
      .single();
    if (error || !logRow) return;

    const setsToInsert = log.exercises.flatMap((ex) =>
      ex.sets.map((s) => ({
        log_id: logRow.id,
        exercise_id: ex.exerciseId,
        exercise_name: ex.exerciseName,
        reps: s.reps,
        weight: s.weight,
        completed: s.completed,
      }))
    );
    if (setsToInsert.length > 0) {
      await supabase.from('logged_sets').insert(setsToInsert);
    }

    await get().loadFromStorage();
  },
}));

function groupLoggedSets(sets: any[]) {
  const map = new Map<string, { exerciseId: string; exerciseName: string; sets: any[] }>();
  for (const s of sets) {
    const key = s.exercise_id ?? s.exercise_name;
    if (!map.has(key)) {
      map.set(key, { exerciseId: s.exercise_id, exerciseName: s.exercise_name, sets: [] });
    }
    map.get(key)!.sets.push({ reps: s.reps, weight: s.weight, completed: s.completed });
  }
  return Array.from(map.values());
}
