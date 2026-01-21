import { updateUserDb } from '../store/userDb.js';
import { fromDisplayWeight } from '../../utils/units.js';

export const buildDefaultSets = (log) => {
    const count = Math.max(Number(log.sets || 0), 1);
    const reps = Number(log.reps || 0);
    const weight = Number(log.weight || 0);
    return Array.from({ length: count }, () => ({ reps, weight, completed: false }));
};

export const createWorkoutLog = ({ name, sets, reps, weight, unit, exerciseId }) => {
    const weightKg = fromDisplayWeight(Number(weight || 0), unit || 'kg');
    const nextLog = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name,
        exerciseId,
        sets,
        reps,
        weight: Number.isNaN(weightKg) ? 0 : weightKg,
        unit: 'kg'
    };
    nextLog.setsDetail = buildDefaultSets(nextLog);
    return nextLog;
};

export const appendWorkoutLogs = (store, logs) => {
    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        entry.logs = entry.logs.concat(logs);
        userdb.workout[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });
};
