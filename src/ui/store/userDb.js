const clone = (value) => JSON.parse(JSON.stringify(value));
const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;

const normalizeWorkoutCardio = (db) => {
    if (!db || !db.workout) return;
    Object.values(db.workout).forEach((entry) => {
        if (!entry) return;
        const legacy = Array.isArray(entry.cardioLogs)
            ? entry.cardioLogs
            : Array.isArray(entry.cardio)
                ? entry.cardio
                : [];
        const current = Array.isArray(entry.cardio?.logs) ? entry.cardio.logs : legacy;
        if (!Array.isArray(current) || current.length === 0) return;
        const normalized = current.map((log) => ({
            ...log,
            id: log.id || createId()
        }));
        entry.cardio = { ...(entry.cardio || {}), logs: normalized };
    });
};

export const updateUserDb = (store, updater) => {
    const next = clone(store.getState().userdb);
    updater(next);
    normalizeWorkoutCardio(next);
    store.dispatch({ type: 'UPDATE_USERDB', payload: next });
};
