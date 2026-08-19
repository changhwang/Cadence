import { describe, expect, it } from 'vitest';
import { aggregateGroupTotals, aggregateMuscleDistribution } from '../src/services/analytics/muscleAgg.js';
import { getExerciseById } from '../src/services/workout/exerciseIndex.js';

const DATE = '2026-08-19';

const completedSets = (count) =>
    Array.from({ length: count }, () => ({ reps: 8, weight: 80, completed: true }));

const dbWith = (logs) => ({ workout: { [DATE]: { logs } } });

const totalsFor = (logs, metric = 'sets') =>
    aggregateGroupTotals({ userdb: dbWith(logs), startISO: DATE, endISO: DATE, metric });

describe('근육군 합계', () => {
    it('같은 근육군의 여러 부위를 자극하는 운동도 세트를 중복으로 세지 않는다', () => {
        // 벤치프레스는 윗가슴 + 중간가슴을 함께 자극한다.
        expect(getExerciseById('bench_press').muscles.detail).toContain('upper_chest');
        expect(getExerciseById('bench_press').muscles.detail).toContain('middle_chest');

        const totals = totalsFor([{ id: 'b', exerciseId: 'bench_press', setsDetail: completedSets(5) }]);
        expect(totals.Chest).toBe(5);
    });

    it('보조근으로 쓰인 근육군에도 세트가 반영된다', () => {
        const totals = totalsFor([{ id: 'b', exerciseId: 'bench_press', setsDetail: completedSets(5) }]);
        expect(totals.Shoulders).toBe(5); // front_delts
        expect(totals.Arms).toBe(5); // triceps
        expect(totals.Legs).toBe(0);
    });

    it('같은 근육군을 쓰는 서로 다른 운동은 합산한다', () => {
        const totals = totalsFor([
            { id: 'b1', exerciseId: 'bench_press', setsDetail: completedSets(5) },
            { id: 'b2', exerciseId: 'incline_bench_press', setsDetail: completedSets(3) }
        ]);
        expect(totals.Chest).toBe(8);
    });

    it('지표에 따라 세트/볼륨을 구분해 집계한다', () => {
        const logs = [{ id: 'b', exerciseId: 'bench_press', setsDetail: completedSets(5) }];
        expect(totalsFor(logs, 'sets').Chest).toBe(5);
        expect(totalsFor(logs, 'volume').Chest).toBe(5 * 8 * 80);
    });

    it('완료하지 않은 세트는 집계하지 않는다', () => {
        const totals = totalsFor([{
            id: 'b',
            exerciseId: 'bench_press',
            setsDetail: [{ reps: 8, weight: 80, completed: false }]
        }]);
        expect(totals.Chest).toBe(0);
    });

    it('DB에 없는 운동은 Other로 분류한다', () => {
        const totals = totalsFor([{ id: 'x', name: '알 수 없는 운동', setsDetail: completedSets(2) }]);
        expect(totals.Other).toBe(2);
        expect(totals.Chest).toBe(0);
    });

    it('부위별 분포는 근육군 합계와 달리 부위마다 값을 유지한다', () => {
        const muscles = aggregateMuscleDistribution({
            userdb: dbWith([{ id: 'b', exerciseId: 'bench_press', setsDetail: completedSets(5) }]),
            startISO: DATE,
            endISO: DATE,
            metric: 'sets'
        });
        expect(muscles.upper_chest.sets).toBe(5);
        expect(muscles.middle_chest.sets).toBe(5);
    });
});
