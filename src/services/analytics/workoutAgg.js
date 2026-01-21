import { enumerateRangeDates } from './period.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const getCardioLogs = (entry) => {
    if (!entry) return [];
    if (Array.isArray(entry.cardio?.logs)) return entry.cardio.logs;
    if (Array.isArray(entry.cardioLogs)) return entry.cardioLogs;
    if (Array.isArray(entry.cardio)) return entry.cardio;
    return [];
};

const summarizeStrengthLog = (log) => {
    if (!log) return { sets: 0, volume: 0 };
    const detail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
    if (detail.length > 0) {
        const hasCompleted = detail.some((set) => Boolean(set.completed));
        const setsToUse = hasCompleted ? detail.filter((set) => Boolean(set.completed)) : detail;
        const sets = setsToUse.length;
        const volume = setsToUse.reduce(
            (sum, set) => sum + toNumber(set.weight) * toNumber(set.reps),
            0
        );
        return { sets, volume };
    }
    const sets = toNumber(log.sets);
    const reps = toNumber(log.reps);
    const weight = toNumber(log.weight);
    return { sets, volume: sets * reps * weight };
};

const summarizeStrengthEntry = (entry) => {
    const logs = Array.isArray(entry?.logs) ? entry.logs : [];
    return logs.reduce(
        (acc, log) => {
            const summary = summarizeStrengthLog(log);
            acc.sets += summary.sets;
            acc.volume += summary.volume;
            return acc;
        },
        { sets: 0, volume: 0 }
    );
};

const summarizeStrengthLogPerformed = (log) => {
    if (!log) return { sets: 0, volume: 0 };
    const detail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
    if (detail.length === 0) {
        return { sets: 0, volume: 0 };
    }
    const completed = detail.filter((set) => Boolean(set.completed));
    const sets = completed.length;
    const volume = completed.reduce(
        (sum, set) => sum + toNumber(set.weight) * toNumber(set.reps),
        0
    );
    return { sets, volume };
};

const summarizeStrengthEntryPerformed = (entry) => {
    const logs = Array.isArray(entry?.logs) ? entry.logs : [];
    return logs.reduce(
        (acc, log) => {
            const summary = summarizeStrengthLogPerformed(log);
            acc.sets += summary.sets;
            acc.volume += summary.volume;
            return acc;
        },
        { sets: 0, volume: 0 }
    );
};

const summarizeCardioEntry = (entry) => {
    const logs = getCardioLogs(entry);
    return logs.reduce((sum, log) => sum + toNumber(log?.minutes), 0);
};

export const aggregateWorkoutRange = ({ userdb, startISO, endISO, metric = 'volume' }) => {
    const dates = enumerateRangeDates({ startISO, endISO });
    const timeseries = [];
    let totalSets = 0;
    let totalVol = 0;
    let totalTime = 0;
    dates.forEach((dateISO) => {
        const entry = userdb?.workout?.[dateISO];
        const strength = summarizeStrengthEntry(entry);
        const cardioMinutes = summarizeCardioEntry(entry);
        totalSets += strength.sets;
        totalVol += strength.volume;
        totalTime += cardioMinutes;
        const value = metric === 'time'
            ? cardioMinutes
            : metric === 'sets'
                ? strength.sets
                : strength.volume;
        timeseries.push({ dateISO, value });
    });
    return {
        timeseries,
        summary: { totalSets, totalVol, totalTime }
    };
};

export const aggregateWorkoutHeatmap = ({
    userdb,
    monthISO,
    metric = 'volume',
    performedOnly = false
}) => {
    if (!monthISO) return [];
    const [yearRaw, monthRaw] = monthISO.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    if (!year || !month) return [];
    const lastDay = new Date(year, month, 0).getDate();
    const days = [];
    let maxValue = 0;
    for (let day = 1; day <= lastDay; day += 1) {
        const dateISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = userdb?.workout?.[dateISO];
        const strength = performedOnly
            ? summarizeStrengthEntryPerformed(entry)
            : summarizeStrengthEntry(entry);
        const cardioMinutes = summarizeCardioEntry(entry);
        const value = metric === 'time'
            ? cardioMinutes
            : metric === 'sets'
                ? strength.sets
                : strength.volume;
        maxValue = Math.max(maxValue, value);
        days.push({ dateISO, value });
    }
    return days.map((day) => ({
        ...day,
        norm01: maxValue > 0 ? day.value / maxValue : 0
    }));
};
