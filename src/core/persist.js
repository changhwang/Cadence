import { SAVE_DEBOUNCE_MS } from './constants.js';
import { saveSettings, saveUserDb } from './storage.js';

export const attachPersist = (store) => {
    let timerId = null;

    const scheduleSave = () => {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            const state = store.getState();
            const userResult = saveUserDb(state.userdb);
            const settingsResult = saveSettings(state.settings);
            if (!userResult.ok || !settingsResult.ok) {
                const error = userResult.error || settingsResult.error;
                store.dispatch({ type: 'SAVE_FAILED', payload: error });
                return;
            }
            store.dispatch({ type: 'SAVE_OK', payload: new Date().toISOString() });
        }, SAVE_DEBOUNCE_MS);
    };

    store.subscribe((_, action) => {
        if (!action || (action.type && action.type.startsWith('SAVE_'))) {
            return;
        }
        scheduleSave();
    });
};
