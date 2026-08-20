import { initApp } from './ui/app.js';
import { startRouter, setRouteListener } from './router.js';
import { initStore } from './core/store.js';
import { attachPersist } from './core/persist.js';
import { loadSettings, loadUserDb } from './core/storage.js';
import { applyTheme, watchSystemTheme } from './ui/theme.js';

const userdb = loadUserDb();
const settings = loadSettings();
const store = initStore({ userdb, settings });

applyTheme(settings.theme);
watchSystemTheme(() => store.getState().settings.theme);

attachPersist(store);
initApp(store);
setRouteListener((route) => {
    store.dispatch({ type: 'ROUTE_CHANGED', payload: route });
});
startRouter();
