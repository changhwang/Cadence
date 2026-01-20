import { DEFAULT_ROUTE } from './constants.js';

const initialUiState = {
    route: DEFAULT_ROUTE,
    modal: { open: false, type: null, payload: null },
    saveStatus: { ok: true, lastError: null, lastSavedAt: null }
};

const createStore = (initialState) => {
    let state = initialState;
    const listeners = new Set();

    const getState = () => state;

    const dispatch = (action) => {
        state = reducer(state, action);
        listeners.forEach((listener) => listener(state, action));
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    return { getState, dispatch, subscribe };
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'ROUTE_CHANGED':
            return {
                ...state,
                ui: { ...state.ui, route: action.payload }
            };
        case 'SAVE_FAILED':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    saveStatus: { ok: false, lastError: action.payload, lastSavedAt: null }
                }
            };
        case 'SAVE_OK':
            return {
                ...state,
                ui: {
                    ...state.ui,
                    saveStatus: { ok: true, lastError: null, lastSavedAt: action.payload }
                }
            };
        case 'UPDATE_USERDB':
            return { ...state, userdb: action.payload };
        case 'UPDATE_SETTINGS':
            return { ...state, settings: action.payload };
        default:
            return state;
    }
};

let storeInstance = null;

export const initStore = ({ userdb, settings }) => {
    storeInstance = createStore({
        userdb,
        settings,
        ui: { ...initialUiState }
    });
    return storeInstance;
};

export const getStore = () => storeInstance;
