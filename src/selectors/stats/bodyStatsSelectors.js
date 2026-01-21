import { aggregateBodyTrend } from '../../services/analytics/bodyAgg.js';

const cache = new Map();

const getKey = (state, suffix) => `${state.userdb.updatedAt}:${suffix}`;

export const selectBodyTrend = (state, range, metricKey = 'weightKg') => {
    const key = getKey(state, `body:${range.key}:${metricKey}`);
    if (cache.has(key)) return cache.get(key);
    const result = aggregateBodyTrend({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        metricKey
    });
    cache.set(key, result);
    return result;
};
