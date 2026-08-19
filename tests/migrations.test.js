import { describe, expect, it } from 'vitest';
import { CURRENT_SCHEMA_VERSION, migrateUserDb } from '../src/core/migrations.js';
import { getMealLogs, getWaterTotalMl } from '../src/services/nutrition/dietEntry.js';
import { getCardioLogs } from '../src/services/workout/workoutEntry.js';

const v1Fixture = () => ({
    schemaVersion: 1,
    diet: {
        '2026-08-01': {
            meals: [{ id: 'm1', name: '닭가슴살', kcal: 165, sodiumMg: 74, createdAt: '2026-08-01T03:00:00.000Z' }],
            waterMl: 750
        },
        '2026-08-02': {
            meals: [{ id: 'm2', name: '밥', kcal: 300 }, { id: 'm3', name: '누락된항목', kcal: 50 }],
            logs: [{ id: 'm2', kind: 'meal', name: '밥', kcal: 300 }, { id: 'w1', kind: 'water', amountMl: 500 }],
            waterMl: 500
        }
    },
    workout: {
        '2026-08-01': {
            logs: [{
                id: 'a', name: '벤치', unit: 'lb', weight: 100, sets: 3, reps: 10,
                setsDetail: [{ reps: 10, weight: 100, completed: true }]
            }],
            cardioLogs: [{ type: 'run', minutes: 30, met: 9.8 }]
        },
        '2026-08-02': { logs: [], cardio: [{ type: 'cycle', minutes: 20, met: 7.5 }] }
    },
    routines: [{
        id: 'r1', title: 'A', exerciseIds: ['bench_press'],
        defaults: { sets: 3, reps: 10, weight: 100, unit: 'lb' },
        defaultsById: { bench_press: { sets: 3, reps: 10, weight: 50, unit: 'lb' } }
    }]
});

describe('migrateUserDb v1 → v2', () => {
    it('식단 meals[]를 logs[]로 합치고 legacy 필드를 제거한다', () => {
        const db = migrateUserDb(v1Fixture());
        const day = db.diet['2026-08-01'];

        expect(db.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
        expect(day.meals).toBeUndefined();
        expect(day.waterMl).toBeUndefined();
        expect(getMealLogs(day)).toHaveLength(1);
        expect(getMealLogs(day)[0].sodiumMg).toBe(74);
    });

    it('logs가 있으면 그것을 진실로 삼되 meals에만 있던 항목은 살린다', () => {
        const day = migrateUserDb(v1Fixture()).diet['2026-08-02'];
        expect(getMealLogs(day).map((log) => log.id).sort()).toEqual(['m2', 'm3']);
    });

    it('waterMl을 물 로그로 옮기되 이미 물 로그가 있으면 중복 생성하지 않는다', () => {
        const db = migrateUserDb(v1Fixture());
        expect(getWaterTotalMl(db.diet['2026-08-01'])).toBe(750);
        expect(getWaterTotalMl(db.diet['2026-08-02'])).toBe(500);
    });

    it('마이그레이션된 로그에는 id와 timeHHMM이 채워진다', () => {
        const log = getMealLogs(migrateUserDb(v1Fixture()).diet['2026-08-01'])[0];
        expect(log.id).toBeTruthy();
        expect(log.timeHHMM).toMatch(/^\d{2}:\d{2}$/);
    });

    it('cardioLogs / cardio[] 형태를 cardio.logs로 통일한다', () => {
        const db = migrateUserDb(v1Fixture());
        expect(getCardioLogs(db.workout['2026-08-01'])).toHaveLength(1);
        expect(db.workout['2026-08-01'].cardioLogs).toBeUndefined();
        expect(getCardioLogs(db.workout['2026-08-01'])[0].id).toBeTruthy();
        expect(getCardioLogs(db.workout['2026-08-02'])).toHaveLength(1);
    });

    it('lb로 저장된 중량을 kg로 변환한다', () => {
        const db = migrateUserDb(v1Fixture());
        const log = db.workout['2026-08-01'].logs[0];
        expect(Math.round(log.weight)).toBe(45);
        expect(log.unit).toBe('kg');
        expect(Math.round(log.setsDetail[0].weight)).toBe(45);
        expect(Math.round(db.routines[0].defaults.weight)).toBe(45);
        expect(Math.round(db.routines[0].defaultsById.bench_press.weight)).toBe(23);
    });

    it('두 번 실행해도 결과가 같다', () => {
        const once = migrateUserDb(v1Fixture());
        const twice = migrateUserDb(JSON.parse(JSON.stringify(once)));
        expect(twice).toEqual(once);
    });

    it('이미 v2인 데이터는 건드리지 않는다', () => {
        const db = migrateUserDb({
            schemaVersion: 2,
            diet: {},
            workout: { x: { logs: [{ id: 'z', unit: 'lb', weight: 100 }] } }
        });
        expect(db.workout.x.logs[0].weight).toBe(100);
        expect(db.workout.x.logs[0].unit).toBe('lb');
    });
});
