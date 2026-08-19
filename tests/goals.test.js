import { describe, expect, it } from 'vitest';
import {
    addGoalTimelineEntry,
    clearGoalOverride,
    getEffectiveGoal,
    setGoalOverride
} from '../src/services/goals/goalService.js';
import { selectGoalForDate } from '../src/selectors/goalSelectors.js';
import { buildGoalModeSpec } from '../src/ui/goals/goalUtils.js';

const targets = (kcal) => ({ kcal, proteinG: 150, carbG: 200, fatG: 60 });

const baselineGoals = () => ({
    timeline: [{ effectiveDate: '2026-01-01', targets: targets(2000), spec: { frameworkId: 'dga_2025' } }],
    overrideByDate: {}
});

const stateWith = ({ goals, cardio = [], credit = {} }) => ({
    settings: {
        nutrition: {
            exerciseCredit: { enabled: true, factor: 0.5, capKcal: 500, distribution: 'CARB_BIASED', ...credit }
        }
    },
    userdb: {
        profile: { weight_kg: 70 },
        workout: { '2026-08-19': { logs: [], cardio: { logs: cardio } } },
        goals
    }
});

describe('goalService 타임라인/오버라이드', () => {
    it('타임라인이 하나면 모든 날짜가 그 목표를 쓴다', () => {
        const goals = baselineGoals();
        ['2026-02-01', '2026-05-05', '2026-12-31'].forEach((dateISO) => {
            expect(getEffectiveGoal({ dateISO, goals }).baseTargets.kcal).toBe(2000);
        });
    });

    it('오늘부터 목표를 바꾸면 이후 날짜만 새 목표를 쓴다', () => {
        const goals = baselineGoals();
        const { timeline } = addGoalTimelineEntry({
            goals,
            effectiveDate: '2026-08-19',
            spec: { frameworkId: 'dga_2025', goalMode: buildGoalModeSpec('cut') },
            computed: { targets: targets(1700) },
            nowMs: Date.now()
        });
        const next = { ...goals, timeline };
        expect(getEffectiveGoal({ dateISO: '2026-08-18', goals: next }).baseTargets.kcal).toBe(2000);
        expect(getEffectiveGoal({ dateISO: '2026-08-19', goals: next }).baseTargets.kcal).toBe(1700);
        expect(getEffectiveGoal({ dateISO: '2026-08-20', goals: next }).baseTargets.kcal).toBe(1700);
    });

    it('같은 날짜에 다시 저장하면 이전 항목을 대체한다', () => {
        const goals = baselineGoals();
        const first = addGoalTimelineEntry({
            goals, effectiveDate: '2026-08-19', spec: {}, computed: { targets: targets(1700) }, nowMs: 1
        });
        const second = addGoalTimelineEntry({
            goals: { timeline: first.timeline }, effectiveDate: '2026-08-19', spec: {}, computed: { targets: targets(1800) }, nowMs: 2
        });
        expect(second.timeline.filter((e) => e.effectiveDate === '2026-08-19')).toHaveLength(1);
        expect(getEffectiveGoal({ dateISO: '2026-08-19', goals: { timeline: second.timeline } }).baseTargets.kcal).toBe(1800);
    });

    it('오버라이드는 해당 날짜에만 적용되고 해제하면 원래대로 돌아온다', () => {
        const goals = baselineGoals();
        const { overrideByDate } = setGoalOverride({
            goals, dateISO: '2026-08-19', override: { targets: targets(1500) }, nowMs: Date.now()
        });
        const withOverride = { ...goals, overrideByDate };

        expect(getEffectiveGoal({ dateISO: '2026-08-19', goals: withOverride }).source).toBe('override');
        expect(getEffectiveGoal({ dateISO: '2026-08-19', goals: withOverride }).baseTargets.kcal).toBe(1500);
        expect(getEffectiveGoal({ dateISO: '2026-08-20', goals: withOverride }).baseTargets.kcal).toBe(2000);

        const cleared = clearGoalOverride({ goals: withOverride, dateISO: '2026-08-19' });
        expect(getEffectiveGoal({ dateISO: '2026-08-19', goals: { ...goals, ...cleared } }).baseTargets.kcal).toBe(2000);
    });
});

describe('운동 보정(Exercise Credit)', () => {
    // 유산소는 workout[date].cardio.logs에 있다. 이 경로가 끊기면 보정이 항상 0이 된다.
    it('유산소 로그에서 보정 kcal을 계산한다', () => {
        const state = stateWith({ goals: baselineGoals(), cardio: [{ type: 'run', minutes: 30, met: 9.8 }] });
        const goal = selectGoalForDate(state, '2026-08-19');
        expect(goal.meta.creditedKcal).toBe(180); // (9.8*3.5*70*30/200) * 0.5
        expect(goal.final.kcal).toBe(2180);
    });

    it('근력 로그만 있으면 보정이 0이다', () => {
        const state = stateWith({ goals: baselineGoals() });
        state.userdb.workout['2026-08-19'].logs = [{ sets: 3, reps: 10, weight: 60 }];
        expect(selectGoalForDate(state, '2026-08-19').meta.creditedKcal).toBe(0);
    });

    it('상한(capKcal)을 넘지 않는다', () => {
        const state = stateWith({
            goals: baselineGoals(),
            cardio: [{ type: 'run', minutes: 300, met: 9.8 }],
            credit: { capKcal: 500 }
        });
        expect(selectGoalForDate(state, '2026-08-19').meta.creditedKcal).toBe(500);
    });

    it('보정을 끄면 목표가 그대로다', () => {
        const state = stateWith({
            goals: baselineGoals(),
            cardio: [{ type: 'run', minutes: 30, met: 9.8 }],
            credit: { enabled: false }
        });
        const goal = selectGoalForDate(state, '2026-08-19');
        expect(goal.meta.creditedKcal).toBe(0);
        expect(goal.final.kcal).toBe(2000);
    });

    it('CARB_BIASED는 탄수를, FAT_BIASED는 지방을 늘린다', () => {
        const carb = selectGoalForDate(
            stateWith({ goals: baselineGoals(), cardio: [{ type: 'run', minutes: 30, met: 9.8 }] }),
            '2026-08-19'
        );
        expect(carb.final.carbG).toBeGreaterThan(200);
        expect(carb.final.fatG).toBe(60);

        const fat = selectGoalForDate(
            stateWith({
                goals: baselineGoals(),
                cardio: [{ type: 'run', minutes: 30, met: 9.8 }],
                credit: { distribution: 'FAT_BIASED' }
            }),
            '2026-08-19'
        );
        expect(fat.final.fatG).toBeGreaterThan(60);
        expect(fat.final.carbG).toBe(200);
    });
});

describe('buildGoalModeSpec', () => {
    it('프리셋에서 모드와 증감률을 만든다', () => {
        expect(buildGoalModeSpec('cut')).toEqual({ mode: 'CUT', cutPct: 0.15 });
        expect(buildGoalModeSpec('minicut')).toEqual({ mode: 'CUT', cutPct: 0.25 });
        expect(buildGoalModeSpec('bulk')).toEqual({ mode: 'BULK', bulkPct: 0.1 });
        expect(buildGoalModeSpec('leanbulk')).toEqual({ mode: 'LEAN_BULK', bulkPct: 0.05 });
        expect(buildGoalModeSpec('recomp')).toEqual({ mode: 'RECOMP', cutPct: 0.05 });
        expect(buildGoalModeSpec('maintain')).toEqual({ mode: 'MAINTAIN' });
        expect(buildGoalModeSpec('알수없음')).toEqual({ mode: 'MAINTAIN' });
    });
});
