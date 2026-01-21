const nowIso = () => new Date().toISOString();

export const createDefaultUserDb = () => ({
    schemaVersion: 1,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    workout: {},
    diet: {},
    body: {},
    routines: [],
    goals: {
        timeline: [],
        overrideByDate: {}
    },
    profile: {
        name: '',
        sex: 'M',
        birth: '',
        height_cm: '',
        weight_kg: '',
        activity: 'light'
    },
    meta: {
        selectedDate: {
            dashboard: nowIso().slice(0, 10),
            workout: nowIso().slice(0, 10),
            diet: nowIso().slice(0, 10),
            body: nowIso().slice(0, 10)
        }
    }
});

export const createDefaultSettings = () => ({
    schemaVersion: 1,
    dateFormat: 'YMD',
    timeFormat: 'H24',
    dateSync: true,
    lang: 'ko',
    units: { height: 'cm', weight: 'kg', water: 'ml', food: 'g', workout: 'kg' },
    sound: { timerEnabled: true, volume: 100 },
    nutrition: {
        goal: 'maintain',
        framework: 'dga_2025',
        overrides: {},
        exerciseCredit: {
            enabled: true,
            factor: 0.5,
            capKcal: 500,
            distribution: 'CARB_BIASED'
        }
    },
    dev: { debugToolEnabled: false }
});
