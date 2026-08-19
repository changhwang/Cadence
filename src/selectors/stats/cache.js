// 캐시 키에 userdb.updatedAt이 들어가 기록이 바뀔 때마다 항목이 쌓인다. 상한을 두고 비운다.
const MAX_ENTRIES = 60;

export const createStatsCache = () => {
    const map = new Map();
    return {
        has: (key) => map.has(key),
        get: (key) => map.get(key),
        set: (key, value) => {
            if (map.size >= MAX_ENTRIES) map.clear();
            map.set(key, value);
            return value;
        }
    };
};

export const statsCacheKey = (state, suffix) =>
    `${state.userdb.updatedAt}#${state.userdb.revision || 0}:${suffix}`;
