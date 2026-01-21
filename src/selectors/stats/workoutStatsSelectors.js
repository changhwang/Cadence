import { aggregateWorkoutRange, aggregateWorkoutHeatmap } from '../../services/analytics/workoutAgg.js';

const cache = new Map();

const getKey = (state, suffix) => `${state.userdb.updatedAt}:${suffix}`;

export const selectWorkoutActivity = (state, range, metric = 'volume') => {
    const key = getKey(state, `activity:${range.key}:${metric}`);
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
    const key = getKey(state, `heatmap:${monthISO}:${metric}:${performedOnly ? 'performed' : 'all'}`);
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
