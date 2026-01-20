const VALID_ROUTES = new Set(['dashboard', 'workout', 'diet', 'body', 'settings']);
let routeListener = () => {};

const getRouteFromHash = () => {
    const raw = window.location.hash.replace('#', '').trim();
    return VALID_ROUTES.has(raw) ? raw : 'workout';
};

const handleRouteChange = () => {
    routeListener(getRouteFromHash());
};

export const setRouteListener = (listener) => {
    routeListener = typeof listener === 'function' ? listener : () => {};
};

export const startRouter = () => {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
};
