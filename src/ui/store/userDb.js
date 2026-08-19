const clone = (value) =>
    (typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)));

const nowIso = () => new Date().toISOString();

export const updateUserDb = (store, updater) => {
    const next = clone(store.getState().userdb);
    updater(next);
    // 어떤 쓰기 경로든 수정 시각이 남도록 한 곳에서 처리한다.
    next.updatedAt = nowIso();
    // updatedAt은 ms 해상도라 같은 밀리초에 두 번 쓰면 통계 캐시가 옛 값을 돌려준다.
    next.revision = (Number(next.revision) || 0) + 1;
    store.dispatch({ type: 'UPDATE_USERDB', payload: next });
};
