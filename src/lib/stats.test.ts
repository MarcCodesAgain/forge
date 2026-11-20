import { describe, expect, it } from 'vitest';
import type { WorkoutLog } from '../types';
import { sessionsInMonth, weekKey, weekStreak, weekVolumes } from './stats';

// Local times: new Date(y, m, d, h) — independent of the machine's timezone.
const at = (y: number, m: number, d: number, h = 18) => new Date(y, m - 1, d, h);
const log = (date: Date, weight = 50, reps = 10, completed = true): WorkoutLog => ({
  id: date.toISOString(), planId: 'p', dayId: 'd', date: date.toISOString(),
  exercises: [{ exerciseId: 'e', exerciseName: 'Sentadilla', sets: [{ reps, weight, completed }] }],
});

// Thursday 2026-11-19
const today = at(2026, 11, 19, 12);

describe('weekKey', () => {
  it('starts weeks on Monday, so Sunday belongs to the week before', () => {
    expect(weekKey(at(2026, 11, 22))).toBe('2026-11-16'); // Sunday
    expect(weekKey(at(2026, 11, 23))).toBe('2026-11-23'); // Monday
  });
});

describe('weekVolumes', () => {
  it('sums completed sets per local day, Monday to Sunday', () => {
    const volumes = weekVolumes([
      log(at(2026, 11, 16)),               // Monday: 500
      log(at(2026, 11, 16, 20), 20, 5),    // Monday again: +100
      log(at(2026, 11, 18), 60, 10, false), // Wednesday, not completed: 0
      log(at(2026, 11, 19, 0, )),          // Thursday 00:00 local
      log(at(2026, 11, 9)),                // last week: ignored
    ], today);
    expect(volumes).toEqual([600, 0, 0, 500, 0, 0, 0]);
  });
});

describe('weekStreak', () => {
  it('counts consecutive trained weeks including this one', () => {
    expect(weekStreak([log(at(2026, 11, 17)), log(at(2026, 11, 10)), log(at(2026, 11, 4))], today)).toBe(3);
  });

  it('does not reset just because this week has no session yet', () => {
    expect(weekStreak([log(at(2026, 11, 10)), log(at(2026, 11, 4))], today)).toBe(2);
  });

  it('stops at the first week without training', () => {
    expect(weekStreak([log(at(2026, 11, 17)), log(at(2026, 11, 3))], today)).toBe(1);
    expect(weekStreak([log(at(2026, 10, 20))], today)).toBe(0);
  });
});

describe('sessionsInMonth', () => {
  it('counts sessions in the current calendar month', () => {
    expect(sessionsInMonth([log(at(2026, 11, 1)), log(at(2026, 11, 18)), log(at(2026, 10, 31))], today)).toBe(2);
  });
});
