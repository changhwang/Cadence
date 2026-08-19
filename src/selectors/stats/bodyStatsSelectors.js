import { aggregateBodyTrend } from '../../services/analytics/bodyAgg.js';
import { createStatsCache, statsCacheKey } from './cache.js';

const cache = createStatsCache();


export const selectBodyTrend = (state, range, metricKey = 'weightKg') => {
    const key = statsCacheKey(state, `body:${range.key}:${metricKey}`);
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
