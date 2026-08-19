import { aggregateWorkoutRange, aggregateWorkoutHeatmap } from '../../services/analytics/workoutAgg.js';
import { createStatsCache, statsCacheKey } from './cache.js';

const cache = createStatsCache();


export const selectWorkoutActivity = (state, range, metric = 'volume') => {
    const key = statsCacheKey(state, `activity:${range.key}:${metric}`);
    if (cache.has(key)) return cache.get(key);
    const result = aggregateWorkoutRange({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        metric
    });
    cache.set(key, result);
    return result;
};

export const selectWorkoutHeatmap = (state, monthISO, metric = 'volume', performedOnly = false) => {
    const key = statsCacheKey(state, `heatmap:${monthISO}:${metric}:${performedOnly ? 'performed' : 'all'}`);
    if (cache.has(key)) return cache.get(key);
    const result = aggregateWorkoutHeatmap({
        userdb: state.userdb,
        monthISO,
        metric,
        performedOnly
    });
    cache.set(key, result);
    return result;
};
