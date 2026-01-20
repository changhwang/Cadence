const levels = ['info', 'warn', 'error'];
let enabled = false;

const log = (level, domain, message, data) => {
    if (!enabled) return;
    if (!levels.includes(level)) return;

    const payload = data ? [message, data] : [message];
    // eslint-disable-next-line no-console
    console[level](`[${domain}]`, ...payload);
};

export const logger = {
    enable: () => {
        enabled = true;
    },
    disable: () => {
        enabled = false;
    },
    info: (domain, message, data) => log('info', domain, message, data),
    warn: (domain, message, data) => log('warn', domain, message, data),
    error: (domain, message, data) => log('error', domain, message, data)
};
