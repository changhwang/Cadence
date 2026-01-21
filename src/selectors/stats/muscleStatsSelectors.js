import {
    aggregateMuscleBalanceWithPrev,
    aggregateMuscleDistribution,
    computeBaselineP95
} from '../../services/analytics/muscleAgg.js';

const cache = new Map();

const getKey = (state, suffix) => `${state.userdb.updatedAt}:${suffix}`;

export const selectMuscleBalance = (state, range, prevRange) => {
    const key = getKey(state, `balance:${range.key}:${prevRange?.key || 'none'}`);
    if (cache.has(key)) return cache.get(key);
    const result = aggregateMuscleBalanceWithPrev({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        prevStartISO: prevRange?.startISO || range.startISO,
        prevEndISO: prevRange?.endISO || range.endISO
    });
    cache.set(key, result);
    return result;
};

export const selectMuscleDistribution = (state, range, metric = 'sets') => {
    const key = getKey(state, `distribution:${range.key}:${metric}`);
    if (cache.has(key)) return cache.get(key);
    const muscles = aggregateMuscleDistribution({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        metric
    });
    const baseline = computeBaselineP95({ muscles, metric });
    const result = { muscles, baseline };
    cache.set(key, result);
    return result;
};
