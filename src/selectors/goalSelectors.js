const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const emptyTargets = () => ({
    kcal: 0,
    proteinG: 0,
    carbG: 0,
    fatG: 0,
    waterMl: 0,
    sodiumMg: 0,
    fiberG: 0
});

import { getEffectiveGoal } from '../services/goals/goalService.js';
import { applyExerciseCredit, distributeCredit } from '../services/nutrition/targetEngine.js';
import { getExerciseKcalForDate } from '../services/workout/energy.js';

const mergeTargets = (base, patch) => ({
    ...base,
    ...Object.entries(patch || {}).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'number' ? value : toNumber(value);
        return acc;
    }, {})
});

export const selectGoalForDate = (state, dateISO) => {
    const goals = state?.userdb?.goals || {};
    const workoutDay = state?.userdb?.workout?.[dateISO];
    const profile = state?.userdb?.profile || {};
    const { source, effectiveDate, entry, override, baseTargets } = getEffectiveGoal({
        dateISO,
        goals
    });
    const entryTargets = baseTargets || emptyTargets();
    const mergedTargets = override?.targets ? mergeTargets(entryTargets, override.targets) : entryTargets;
    const creditPolicy = state?.settings?.nutrition?.exerciseCredit || {};
    const exerciseKcal = getExerciseKcalForDate({ day: workoutDay, profile });
    const credit = applyExerciseCredit({
        base: mergedTargets,
        exerciseKcal,
        policy: creditPolicy
    });
    const distributed = distributeCredit({
        creditedKcal: credit.creditedKcal,
        base: mergedTargets,
        distribution: creditPolicy.distribution
    });
    const finalTargets = {
        ...credit.final,
        ...distributed
    };

    return {
        base: mergedTargets,
        final: finalTargets,
        meta: {
            source,
            effectiveDate: effectiveDate || (entry?.effectiveDate || dateISO),
            creditedKcal: credit.creditedKcal
        }
    };
};

export const selectSelectedDate = (state, domain) => {
    const selected = state?.userdb?.meta?.selectedDate || {};
    if (domain === 'dashboard') return selected.dashboard;
    if (domain === 'diet') return selected.diet;
    if (domain === 'workout') return selected.workout;
    if (domain === 'body') return selected.body;
    return selected.diet || selected.workout || selected.body;
};
