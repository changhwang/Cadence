const VALID_ROUTES = new Set(['workout', 'diet', 'body', 'settings']);
let routeListener = () => {};

const getRouteFromHash = () => {
    const raw = window.location.hash.replace('#', '').trim();
    if (!raw) return 'workout';
    const [root, ...rest] = raw.split('/').filter(Boolean);
    if (root === 'stats') {
        const subpath = rest.join('/');
        return subpath ? `stats/${subpath}` : 'stats/activity';
    }
    return VALID_ROUTES.has(root) ? root : 'workout';
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
