import { buildExerciseIndex } from '../../services/analytics/exerciseAgg.js';

const cache = new Map();

const getKey = (state, suffix) => `${state.userdb.updatedAt}:${suffix}`;

export const selectExerciseIndex = (state, range, metric = 'sets', sortKey = 'value', query = '') => {
    const key = getKey(state, `exercises:${range.key}:${metric}:${sortKey}:${query}`);
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
