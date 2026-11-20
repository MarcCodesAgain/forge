import type { WeightLog, WorkoutLog, WorkoutPlan } from '../types';

/**
 * Everything the app stores, kept on the device. Pure functions only (no
 * React Native imports) so the rules are unit-tested without a simulator.
 */
export interface WorkoutData {
  plans: WorkoutPlan[];
  logs: WorkoutLog[];
  weightLogs: WeightLog[];
}

export const EMPTY_DATA: WorkoutData = { plans: [], logs: [], weightLogs: [] };

export function addPlan(data: WorkoutData, plan: WorkoutPlan): WorkoutData {
  return { ...data, plans: [...data.plans, plan] };
}

export function updatePlan(data: WorkoutData, plan: WorkoutPlan): WorkoutData {
  return { ...data, plans: data.plans.map((p) => (p.id === plan.id ? plan : p)) };
}

/**
 * Removes the plan but keeps its past sessions: the history is a record of
 * what was done, and each log stores exercise names, so it still reads fine.
 */
export function deletePlan(data: WorkoutData, planId: string): WorkoutData {
  return { ...data, plans: data.plans.filter((p) => p.id !== planId) };
}

/** Newest first, which is how every screen reads the history. */
export function addLog(data: WorkoutData, log: WorkoutLog): WorkoutData {
  return { ...data, logs: [log, ...data.logs].sort((a, b) => b.date.localeCompare(a.date)) };
}

/** One body-weight entry per day: saving again the same day replaces it. */
export function upsertWeightLog(data: WorkoutData, date: string, weight: number, id: string): WorkoutData {
  const existing = data.weightLogs.find((w) => w.date === date);
  const weightLogs = existing
    ? data.weightLogs.map((w) => (w.date === date ? { ...w, weight } : w))
    : [...data.weightLogs, { id, date, weight }];
  return { ...data, weightLogs: weightLogs.sort((a, b) => b.date.localeCompare(a.date)) };
}

// ── Backup ──────────────────────────────────────────────────────────────────

export const BACKUP_APP = 'forge';
export const BACKUP_VERSION = 1;

export interface Backup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  data: WorkoutData;
}

export function createBackup(data: WorkoutData, now = new Date()): Backup {
  return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

export class InvalidBackupError extends Error {
  constructor(reason: string) {
    super(`El fichero no es una copia de seguridad válida de Forge: ${reason}.`);
    this.name = 'InvalidBackupError';
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isString = (v: unknown): v is string => typeof v === 'string';
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

function isPlan(v: unknown): v is WorkoutPlan {
  return isObject(v) && isString(v.id) && isString(v.name) && isString(v.createdAt) && Array.isArray(v.days)
    && v.days.every((d) => isObject(d) && isString(d.id) && isString(d.name) && Array.isArray(d.exercises)
      && d.exercises.every((e) => isObject(e) && isString(e.id) && isString(e.name) && Array.isArray(e.sets)
        && e.sets.every((s) => isObject(s) && isString(s.id) && isNumber(s.reps) && isNumber(s.weight))));
}

function isLog(v: unknown): v is WorkoutLog {
  return isObject(v) && isString(v.id) && isString(v.planId) && isString(v.dayId) && isString(v.date)
    && Array.isArray(v.exercises)
    && v.exercises.every((e) => isObject(e) && isString(e.exerciseId) && isString(e.exerciseName) && Array.isArray(e.sets)
      && e.sets.every((s) => isObject(s) && isNumber(s.reps) && isNumber(s.weight) && typeof s.completed === 'boolean'));
}

function isWeightLog(v: unknown): v is WeightLog {
  return isObject(v) && isString(v.id) && isString(v.date) && isNumber(v.weight);
}

/**
 * Parses and validates a backup file. Everything is checked before anything
 * is replaced, so a wrong or corrupted file can never wipe the user's data.
 */
export function parseBackup(json: string): WorkoutData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new InvalidBackupError('no es un JSON legible');
  }
  if (!isObject(parsed) || parsed.app !== BACKUP_APP) throw new InvalidBackupError('no lo ha generado Forge');
  if (!isNumber(parsed.version) || parsed.version > BACKUP_VERSION) {
    throw new InvalidBackupError('es de una versión más nueva de la app; actualízala primero');
  }
  const data = parsed.data;
  if (!isObject(data)) throw new InvalidBackupError('no contiene datos');
  const { plans, logs, weightLogs } = data;
  if (!Array.isArray(plans) || !plans.every(isPlan)) throw new InvalidBackupError('las rutinas están dañadas');
  if (!Array.isArray(logs) || !logs.every(isLog)) throw new InvalidBackupError('el historial está dañado');
  if (!Array.isArray(weightLogs) || !weightLogs.every(isWeightLog)) throw new InvalidBackupError('los registros de peso están dañados');
  return { plans, logs, weightLogs };
}

/** Today's date as YYYY-MM-DD in the user's timezone (toISOString is UTC). */
export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
