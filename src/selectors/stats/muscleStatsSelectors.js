import {
    aggregateGroupTotals,
    aggregateMuscleBalanceWithPrev,
    aggregateMuscleDistribution,
    computeBaselineP95
} from '../../services/analytics/muscleAgg.js';
import { createStatsCache, statsCacheKey } from './cache.js';

const cache = createStatsCache();


export const selectMuscleBalance = (state, range, prevRange) => {
    const key = statsCacheKey(state, `balance:${range.key}:${prevRange?.key || 'none'}`);
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

export const selectMuscleGroupTotals = (state, range, metric = 'sets') => {
    const key = statsCacheKey(state, `groupTotals:${range.key}:${metric}`);
    if (cache.has(key)) return cache.get(key);
    return cache.set(key, aggregateGroupTotals({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        metric
    }));
};

export const selectMuscleDistribution = (state, range, metric = 'sets') => {
    const key = statsCacheKey(state, `distribution:${range.key}:${metric}`);
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
