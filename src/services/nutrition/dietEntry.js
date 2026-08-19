const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

export const createDietEntry = () => ({ logs: [] });

export const getDietEntry = (userdb, dateISO) => userdb?.diet?.[dateISO] || createDietEntry();

export const getDietLogs = (entry) => (Array.isArray(entry?.logs) ? entry.logs : []);

export const getMealLogs = (entry) => getDietLogs(entry).filter((log) => log.kind !== 'water');

export const getWaterLogs = (entry) => getDietLogs(entry).filter((log) => log.kind === 'water');

export const getWaterTotalMl = (entry) =>
    getWaterLogs(entry).reduce((sum, log) => sum + toNumber(log.amountMl), 0);

// 쓰기 경로에서 항상 같은 형태의 엔트리를 얻기 위한 헬퍼.
export const ensureDietEntry = (userdb, dateISO) => {
    const entry = userdb.diet[dateISO] || createDietEntry();
    if (!Array.isArray(entry.logs)) entry.logs = [];
    userdb.diet[dateISO] = entry;
    return entry;
};
