// FOOD_DB는 500KB가 넘어 앱 시작 시 파싱하면 초기 로딩이 느려진다.
// 음식 검색/식단 모달을 처음 열 때만 불러온다.
let cache = null;
let pending = null;

export const loadFoodDb = () => {
    if (cache) return Promise.resolve(cache);
    if (!pending) {
        pending = import('./foods.js').then(({ FOOD_DB }) => {
            cache = { list: FOOD_DB, byId: new Map(FOOD_DB.map((item) => [item.id, item])) };
            pending = null;
            return cache;
        });
    }
    return pending;
};

// 이미 로드된 경우에만 값을 준다(로딩을 유발하지 않음).
export const getLoadedFoodById = (id) => cache?.byId.get(id) || null;
