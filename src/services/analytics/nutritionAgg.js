import { enumerateRangeDates } from './period.js';
import { getDietTotalsForDate } from '../nutrition/intake.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const sumWaterMl = (day) => {
    const logs = Array.isArray(day?.logs) ? day.logs : [];
    return logs.reduce((sum, log) => {
        if (log?.kind !== 'water') return sum;
        return sum + toNumber(log.amountMl);
    }, 0);
};

export const aggregateNutritionTrend = ({
    userdb,
    startISO,
    endISO,
    metric = 'kcal'
}) => {
    const dates = enumerateRangeDates({ startISO, endISO });
    const timeseries = [];
    let total = 0;
    dates.forEach((dateISO) => {
        const day = userdb?.diet?.[dateISO];
        const { totals } = getDietTotalsForDate({ day });
        let value = 0;
        if (metric === 'waterMl') {
            value = sumWaterMl(day);
        } else {
            value = toNumber(totals?.[metric]);
        }
        total += value;
        timeseries.push({ dateISO, value });
    });
    const avg = dates.length > 0 ? total / dates.length : 0;
    return { timeseries, summary: { total, avg } };
};

export const buildTopFoods = ({
    userdb,
    startISO,
    endISO,
    by = 'kcal',
    limit = 10
}) => {
    const dates = enumerateRangeDates({ startISO, endISO });
    const map = new Map();
    dates.forEach((dateISO) => {
        const day = userdb?.diet?.[dateISO];
        const logs = Array.isArray(day?.logs) ? day.logs : [];
        logs.forEach((log) => {
            if (!log || log.kind === 'water') return;
            const id = log.foodId || log.name || 'unknown';
            const name = log.name || log.foodId || 'unknown';
            if (!map.has(id)) {
                map.set(id, { foodId: id, name, total: 0, count: 0 });
            }
            const entry = map.get(id);
            entry.count += 1;
            entry.total += toNumber(log?.[by]);
        });
    });
    return Array.from(map.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
};
