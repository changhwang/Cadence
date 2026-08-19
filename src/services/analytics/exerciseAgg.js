import { resolveExercise } from '../workout/exerciseIndex.js';
import { getStrengthLogs, summarizeStrengthLog } from '../workout/workoutEntry.js';
import { enumerateRangeDates } from './period.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

export const buildExerciseIndex = ({
    userdb,
    startISO,
    endISO,
    metric = 'sets',
    query = '',
    sortKey = 'value'
}) => {
    const items = new Map();
    enumerateRangeDates({ startISO, endISO }).forEach((dateISO) => {
        getStrengthLogs(userdb?.workout?.[dateISO]).forEach((log) => {
            const exercise = resolveExercise(log);
            const id = exercise?.id || log.exerciseId || log.name || 'unknown';
            const name = exercise?.labels?.ko || exercise?.labels?.en || log.name || id;
            const summary = summarizeStrengthLog(log);
            if (!items.has(id)) {
                items.set(id, { exerciseId: id, name, sets: 0, volume: 0, time: 0, lastISO: dateISO });
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
        if (sortKey === 'name') return a.name.localeCompare(b.name);
        if (metric === 'volume') return b.volume - a.volume;
        if (metric === 'time') return b.time - a.time;
        return b.sets - a.sets;
    });
    return result;
};
