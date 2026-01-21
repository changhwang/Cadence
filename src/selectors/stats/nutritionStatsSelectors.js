import { aggregateNutritionTrend, buildTopFoods } from '../../services/analytics/nutritionAgg.js';

const cache = new Map();

const getKey = (state, suffix) => `${state.userdb.updatedAt}:${suffix}`;

export const selectNutritionTrend = (state, range, metric = 'kcal') => {
    const key = getKey(state, `nutrition:${range.key}:${metric}`);
    if (cache.has(key)) return cache.get(key);
    const result = aggregateNutritionTrend({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        metric
    });
    cache.set(key, result);
    return result;
};

export const selectTopFoods = (state, range, by = 'kcal', limit = 10) => {
    const key = getKey(state, `topfoods:${range.key}:${by}:${limit}`);
    if (cache.has(key)) return cache.get(key);
    const result = buildTopFoods({
        userdb: state.userdb,
        startISO: range.startISO,
        endISO: range.endISO,
        by,
        limit
    });
    cache.set(key, result);
    return result;
};
