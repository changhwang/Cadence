import { EXERCISE_DB } from '../../data/exercises.js';
import { enumerateRangeDates } from './period.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const normalize = (value) => String(value || '').trim().toLowerCase();

const resolveExercise = (log) => {
    if (!log) return null;
    if (log.exerciseId) {
        return EXERCISE_DB.find((item) => item.id === log.exerciseId) || null;
    }
    const name = normalize(log.name);
    if (!name) return null;
    return EXERCISE_DB.find((item) => {
        const ko = normalize(item.labels?.ko);
        const en = normalize(item.labels?.en);
        return ko === name || en === name;
    }) || null;
};

const summarizeStrengthLog = (log) => {
    if (!log) return { sets: 0, volume: 0 };
    const detail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
    if (detail.length > 0) {
        const completed = detail.filter((set) => Boolean(set.completed));
        const sets = completed.length;
        const volume = completed.reduce(
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

export const buildExerciseIndex = ({
    userdb,
    startISO,
    endISO,
    metric = 'sets',
    query = '',
    sortKey = 'value'
}) => {
    const dates = enumerateRangeDates({ startISO, endISO });
    const items = new Map();
    dates.forEach((dateISO) => {
        const logs = Array.isArray(userdb?.workout?.[dateISO]?.logs)
            ? userdb.workout[dateISO].logs
            : [];
        logs.forEach((log) => {
            const exercise = resolveExercise(log);
            const id = exercise?.id || log.exerciseId || log.name || 'unknown';
            const name = exercise?.labels?.ko || exercise?.labels?.en || log.name || id;
            const summary = summarizeStrengthLog(log);
            if (!items.has(id)) {
                items.set(id, {
                    exerciseId: id,
                    name,
                    sets: 0,
                    volume: 0,
                    time: 0,
                    lastISO: dateISO
                });
            }
            const entry = items.get(id);
            entry.sets += summary.sets;
            entry.volume += summary.volume;
            entry.time += summary.sets * 2;
            if (!entry.lastISO || entry.lastISO < dateISO) entry.lastISO = dateISO;
        });
    });
    const needle = normalize(query);
    let result = Array.from(items.values());
    if (needle) {
        result = result.filter((item) => normalize(item.name).includes(needle));
    }
    result.sort((a, b) => {
        const aVal = sortKey === 'name'
            ? a.name.localeCompare(b.name)
            : metric === 'volume'
                ? b.volume - a.volume
                : metric === 'time'
                    ? b.time - a.time
                    : b.sets - a.sets;
        return aVal;
    });
    return result;
};
