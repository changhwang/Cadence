import { STORAGE_KEYS } from './constants.js';
import { createDefaultSettings, createDefaultUserDb } from './schema.js';

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

export const loadSettings = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
        const defaults = createDefaultSettings();
        trySetItem(STORAGE_KEYS.SETTINGS, defaults);
        return defaults;
    }
    return safeParse(raw, createDefaultSettings());
};

export const loadUserDb = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.USERDB);
    if (!raw) {
        const defaults = createDefaultUserDb();
        trySetItem(STORAGE_KEYS.USERDB, defaults);
        return defaults;
    }
    return safeParse(raw, createDefaultUserDb());
};

export const saveSettings = (settings) => {
    return trySetItem(STORAGE_KEYS.SETTINGS, settings);
};

export const saveUserDb = (userdb) => {
    return trySetItem(STORAGE_KEYS.USERDB, userdb);
};
