import { STORAGE_KEYS } from './constants.js';
import { createDefaultSettings, createDefaultUserDb } from './schema.js';
import { migrateUserDb } from './migrations.js';
import { coerceTheme } from '../ui/theme.js';

const safeParse = (raw, fallback) => {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
};

const trySetItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return { ok: true, error: null };
    } catch (error) {
        return { ok: false, error };
    }
};

// 저장소에서 읽든 백업에서 복원하든 항상 이 경로를 통과시킨다.
export const hydrateSettings = (input) => {
    const defaults = createDefaultSettings();
    const parsed = input && typeof input === 'object' ? input : defaults;
    const merged = {
        ...defaults,
        ...parsed,
        units: { ...defaults.units, ...(parsed.units || {}) },
        sound: { ...defaults.sound, ...(parsed.sound || {}) },
        nutrition: {
            ...defaults.nutrition,
            ...(parsed.nutrition || {}),
            overrides: { ...defaults.nutrition.overrides, ...((parsed.nutrition || {}).overrides || {}) },
            exerciseCredit: {
                ...defaults.nutrition.exerciseCredit,
                ...((parsed.nutrition || {}).exerciseCredit || {})
            }
        },
        dev: { ...defaults.dev, ...(parsed.dev || {}) }
    };
    if (merged.dateFormat === 'YMD_DOTS' || merged.dateFormat === 'YMD_DASH') {
        merged.dateFormat = 'YMD';
    }
    if (merged.dateFormat === 'MDY_SLASH') {
        merged.dateFormat = 'MDY';
    }
    if (merged.timeFormat !== 'H12' && merged.timeFormat !== 'H24') {
        merged.timeFormat = 'H24';
    }
    merged.theme = coerceTheme(merged.theme);
    if (typeof merged.sound.volume === 'number' && merged.sound.volume <= 1) {
        merged.sound.volume = Math.round(merged.sound.volume * 100);
    }
    return merged;
};

export const hydrateUserDb = (input) => {
    const defaults = createDefaultUserDb();
    const parsed = input && typeof input === 'object' ? input : defaults;
    const merged = {
        ...defaults,
        ...parsed,
        profile: { ...defaults.profile, ...(parsed.profile || {}) },
        goals: {
            ...defaults.goals,
            ...(parsed.goals || {}),
            overrideByDate: {
                ...defaults.goals.overrideByDate,
                ...((parsed.goals || {}).overrideByDate || {})
            }
        },
        routines: Array.isArray(parsed.routines) ? parsed.routines : defaults.routines,
        meta: {
            ...defaults.meta,
            ...(parsed.meta || {}),
            selectedDate: {
                ...defaults.meta.selectedDate,
                ...((parsed.meta || {}).selectedDate || {})
            }
        }
    };
    return migrateUserDb(merged);
};

export const loadSettings = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
        const defaults = createDefaultSettings();
        trySetItem(STORAGE_KEYS.SETTINGS, defaults);
        return defaults;
    }
    return hydrateSettings(safeParse(raw, null));
};

export const loadUserDb = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.USERDB);
    if (!raw) {
        const defaults = createDefaultUserDb();
        trySetItem(STORAGE_KEYS.USERDB, defaults);
        return defaults;
    }
    return hydrateUserDb(safeParse(raw, null));
};

export const saveSettings = (settings) => {
    return trySetItem(STORAGE_KEYS.SETTINGS, settings);
};

export const saveUserDb = (userdb) => {
    return trySetItem(STORAGE_KEYS.USERDB, userdb);
};
