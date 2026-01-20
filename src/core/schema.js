const nowIso = () => new Date().toISOString();

export const createDefaultUserDb = () => ({
    schemaVersion: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    workout: {},
    diet: {},
    body: {},
    goals: {},
    meta: {
        selectedDate: {
            workout: nowIso().slice(0, 10),
            diet: nowIso().slice(0, 10),
            body: nowIso().slice(0, 10)
        }
    }
});

export const createDefaultSettings = () => ({
    schemaVersion: 1,
    dateFormat: 'KO_DOTS',
    dateSync: true,
    units: { weight: 'kg', water: 'ml' },
    sound: { timerEnabled: true, volume: 1.0 },
    dev: { debugToolEnabled: false }
});
