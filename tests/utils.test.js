import { describe, expect, it } from 'vitest';
import { addDays, formatDisplay, parseDateInput, todayIso } from '../src/utils/date.js';
import { coerceTimeHHMM, formatTimeHHMM, parseTimeHHMM } from '../src/utils/time.js';
import { getDietTotalsForDate } from '../src/services/nutrition/intake.js';
import { estimateCardioKcal, getExerciseKcalForDate } from '../src/services/workout/energy.js';
import {
    summarizeCardioMinutes,
    summarizeStrengthEntry,
    summarizeStrengthEntryPerformed
} from '../src/services/workout/workoutEntry.js';

describe('utils/date', () => {
    it('addDays는 DST 경계에서도 하루씩 이동한다', () => {
        // 미국/유럽 DST 전환일 부근
        expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
        expect(addDays('2026-11-01', 1)).toBe('2026-11-02');
        expect(addDays('2026-03-07', 2)).toBe('2026-03-09');
        expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    });

    it('연속 이동 후 되돌리면 원래 날짜가 된다', () => {
        let cursor = '2026-01-01';
        for (let i = 0; i < 400; i += 1) cursor = addDays(cursor, 1);
        for (let i = 0; i < 400; i += 1) cursor = addDays(cursor, -1);
        expect(cursor).toBe('2026-01-01');
    });

    it('존재하지 않는 날짜는 거부한다', () => {
        expect(parseDateInput('2024.02.31', 'YMD')).toBe('');
        expect(parseDateInput('2023.02.29', 'YMD')).toBe('');
        expect(parseDateInput('2024.13.01', 'YMD')).toBe('');
        expect(parseDateInput('2024.02.29', 'YMD')).toBe('2024-02-29');
        expect(parseDateInput('12/25/2024', 'MDY')).toBe('2024-12-25');
    });

    it('표시 형식을 바꿔도 저장 키(ISO)는 변하지 않는다', () => {
        const iso = '2026-08-19';
        expect(formatDisplay(iso, 'YMD')).toBe('2026.08.19');
        expect(formatDisplay(iso, 'MDY')).toBe('08/19/2026');
        expect(parseDateInput(formatDisplay(iso, 'MDY'), 'MDY')).toBe(iso);
        expect(todayIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('utils/time', () => {
    it('12시간제는 AM/PM으로 표기한다', () => {
        expect(formatTimeHHMM('00:30', 'H12')).toBe('AM 12:30');
        expect(formatTimeHHMM('13:05', 'H12')).toBe('PM 1:05');
        expect(formatTimeHHMM('13:05', 'H24')).toBe('13:05');
    });

    it('잘못된 값은 폴백으로 보정한다', () => {
        expect(parseTimeHHMM('25:00')).toBeNull();
        expect(coerceTimeHHMM('', '07:30')).toBe('07:30');
        expect(coerceTimeHHMM('9:5')).toBe('12:00');
        expect(coerceTimeHHMM('9:05')).toBe('09:05');
    });
});

describe('식단 합산', () => {
    it('물 로그는 영양 합산에서 제외한다', () => {
        const day = {
            logs: [
                { kind: 'meal', kcal: 165, proteinG: 31, sodiumMg: 74 },
                { kind: 'meal', kcal: 300, carbG: 70, sodiumMg: 10 },
                { kind: 'water', amountMl: 500 }
            ]
        };
        const { totals, hasData } = getDietTotalsForDate({ day });
        expect(hasData).toBe(true);
        expect(totals.kcal).toBe(465);
        expect(totals.sodiumMg).toBe(84);
        expect(totals.carbG).toBe(70);
    });

    it('기록이 없으면 hasData가 false다', () => {
        expect(getDietTotalsForDate({ day: undefined }).hasData).toBe(false);
        expect(getDietTotalsForDate({ day: { logs: [] } }).hasData).toBe(false);
        expect(getDietTotalsForDate({ day: { logs: [{ kind: 'water', amountMl: 500 }] } }).hasData).toBe(false);
    });
});

describe('운동 집계', () => {
    const entry = {
        logs: [
            { setsDetail: [{ reps: 10, weight: 60, completed: true }, { reps: 8, weight: 60, completed: false }] },
            { sets: 3, reps: 5, weight: 100 }
        ],
        cardio: { logs: [{ type: 'run', minutes: 20, met: 9.8 }] }
    };

    it('세트 상세가 없으면 계획값으로 대체한다', () => {
        expect(summarizeStrengthEntry(entry)).toEqual({ sets: 4, volume: 2100 });
    });

    it('수행분만 볼 때는 완료된 세트만 센다', () => {
        expect(summarizeStrengthEntryPerformed(entry)).toEqual({ sets: 1, volume: 600 });
    });

    it('유산소 시간과 kcal은 cardio.logs에서 계산한다', () => {
        expect(summarizeCardioMinutes(entry)).toBe(20);
        expect(getExerciseKcalForDate({ day: entry, profile: { weight_kg: 70 } })).toBe(240);
    });

    it('kcal이 직접 기록되어 있으면 그 값을 신뢰한다', () => {
        expect(estimateCardioKcal({ entry: { kcal: 123, minutes: 30, met: 9.8 }, profile: { weight_kg: 70 } })).toBe(123);
    });

    it('레거시 유산소 형태도 읽는다', () => {
        const profile = { weight_kg: 70 };
        const expected = getExerciseKcalForDate({ day: entry, profile });
        expect(getExerciseKcalForDate({ day: { cardioLogs: entry.cardio.logs }, profile })).toBe(expected);
        expect(getExerciseKcalForDate({ day: { cardio: entry.cardio.logs }, profile })).toBe(expected);
    });
});
