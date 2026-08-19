import { buildExerciseIndex } from '../../services/analytics/exerciseAgg.js';
import { createStatsCache, statsCacheKey } from './cache.js';

const cache = createStatsCache();


export const selectExerciseIndex = (state, range, metric = 'sets', sortKey = 'value', query = '') => {
    const key = statsCacheKey(state, `exercises:${range.key}:${metric}:${sortKey}:${query}`);
    if (cache.has(key)) return cache.get(key);
    const result = buildExerciseIndex({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        metric,
        sortKey,
        query
    });
    cache.set(key, result);
    return result;
};
