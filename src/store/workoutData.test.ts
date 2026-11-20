import { describe, expect, it } from 'vitest';
import type { WorkoutLog, WorkoutPlan } from '../types';
import {
  addLog, addPlan, createBackup, deletePlan, EMPTY_DATA, InvalidBackupError, localDateKey,
  parseBackup, updatePlan, upsertWeightLog,
} from './workoutData';

const plan: WorkoutPlan = {
  id: 'p1',
  name: 'Fuerza',
  createdAt: '2026-11-01T10:00:00.000Z',
  days: [{
    id: 'd1',
    name: 'Pecho',
    exercises: [{ id: 'e1', name: 'Press banca', sets: [{ id: 's1', reps: 8, weight: 60 }] }],
  }],
};

const log = (id: string, date: string): WorkoutLog => ({
  id, planId: 'p1', dayId: 'd1', date,
  exercises: [{ exerciseId: 'e1', exerciseName: 'Press banca', sets: [{ reps: 8, weight: 60, completed: true }] }],
});

describe('plans', () => {
  it('adds, updates and deletes without touching other data', () => {
    let data = addPlan(EMPTY_DATA, plan);
    data = updatePlan(data, { ...plan, name: 'Fuerza 2' });
    expect(data.plans).toEqual([{ ...plan, name: 'Fuerza 2' }]);

    data = addLog(data, log('l1', '2026-11-02T10:00:00.000Z'));
    data = deletePlan(data, 'p1');
    expect(data.plans).toEqual([]);
    expect(data.logs).toHaveLength(1); // history survives the plan
  });
});

describe('logs', () => {
  it('keeps the history newest first, whatever order sessions are saved in', () => {
    let data = addLog(EMPTY_DATA, log('old', '2026-11-01T10:00:00.000Z'));
    data = addLog(data, log('new', '2026-11-05T10:00:00.000Z'));
    data = addLog(data, log('mid', '2026-11-03T10:00:00.000Z'));
    expect(data.logs.map((l) => l.id)).toEqual(['new', 'mid', 'old']);
  });
});

describe('upsertWeightLog', () => {
  it('stores one entry per day and replaces it when saved again', () => {
    let data = upsertWeightLog(EMPTY_DATA, '2026-11-01', 80, 'w1');
    data = upsertWeightLog(data, '2026-11-02', 79.5, 'w2');
    data = upsertWeightLog(data, '2026-11-01', 80.4, 'w3');
    expect(data.weightLogs).toEqual([
      { id: 'w2', date: '2026-11-02', weight: 79.5 },
      { id: 'w1', date: '2026-11-01', weight: 80.4 },
    ]);
  });
});

describe('backups', () => {
  const data = addLog(upsertWeightLog(addPlan(EMPTY_DATA, plan), '2026-11-01', 80, 'w1'), log('l1', '2026-11-02T10:00:00.000Z'));

  it('round-trips through JSON', () => {
    const json = JSON.stringify(createBackup(data, new Date('2026-11-20T00:00:00Z')));
    expect(parseBackup(json)).toEqual(data);
  });

  it.each([
    ['not JSON', 'hola'],
    ['another app', JSON.stringify({ app: 'other', version: 1, data })],
    ['a newer version', JSON.stringify({ ...createBackup(data), version: 99 })],
    ['missing data', JSON.stringify({ app: 'forge', version: 1 })],
    ['a corrupted plan', JSON.stringify(createBackup({ ...data, plans: [{ ...plan, days: 'x' }] as never }))],
    ['a corrupted set', JSON.stringify(createBackup({ ...data, logs: [{ ...log('l', 'd'), exercises: [{ exerciseId: 'e', exerciseName: 'x', sets: [{ reps: '8' }] }] }] as never }))],
  ])('rejects %s', (_label, json) => {
    expect(() => parseBackup(json)).toThrow(InvalidBackupError);
  });
});

describe('localDateKey', () => {
  it('uses the local calendar day, not UTC', () => {
    // 00:30 local on Nov 20 is still Nov 19 in UTC for anyone east of UTC.
    expect(localDateKey(new Date(2026, 10, 20, 0, 30))).toBe('2026-11-20');
  });
});
