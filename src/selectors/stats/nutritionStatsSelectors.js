import { aggregateNutritionTrend, buildTopFoods } from '../../services/analytics/nutritionAgg.js';
import { createStatsCache, statsCacheKey } from './cache.js';

const cache = createStatsCache();


export const selectNutritionTrend = (state, range, metric = 'kcal') => {
    const key = statsCacheKey(state, `nutrition:${range.key}:${metric}`);
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
    const key = statsCacheKey(state, `topfoods:${range.key}:${by}:${limit}`);
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
