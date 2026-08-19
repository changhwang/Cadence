import { getCardioLogs } from '../services/workout/workoutEntry.js';
import { combineDateAndTime, timeHHMMFromDate } from '../utils/time.js';
import { createId } from '../utils/id.js';
import { lbToKg } from '../utils/units.js';

export const CURRENT_SCHEMA_VERSION = 2;

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

// v1은 표시 단위를 그대로 저장하기도 했다. 저장은 항상 kg 기준으로 맞춘다.
const normalizeWorkoutUnits = (db) => {
    const convertLog = (log) => {
        if (!log || typeof log !== 'object') return;
        if (log.unit === 'lb') {
            log.weight = lbToKg(toNumber(log.weight));
            if (Array.isArray(log.setsDetail)) {
                log.setsDetail = log.setsDetail.map((set) => ({
                    ...set,
                    weight: lbToKg(toNumber(set.weight))
                }));
            }
            log.unit = 'kg';
            return;
        }
        if (!log.unit) log.unit = 'kg';
    };

    Object.values(db.workout || {}).forEach((entry) => {
        if (!entry || !Array.isArray(entry.logs)) return;
        entry.logs.forEach(convertLog);
    });

    if (Array.isArray(db.routines)) {
        db.routines.forEach((routine) => {
            if (routine?.defaults?.unit === 'lb') {
                routine.defaults.weight = lbToKg(toNumber(routine.defaults.weight));
                routine.defaults.unit = 'kg';
            } else if (routine?.defaults && !routine.defaults.unit) {
                routine.defaults.unit = 'kg';
            }
            Object.values(routine?.defaultsById || {}).forEach((item) => {
                if (!item) return;
                if (item.unit === 'lb') {
                    item.weight = lbToKg(toNumber(item.weight));
                    item.unit = 'kg';
                    return;
                }
                if (item.unit === undefined && item.weight !== undefined) item.unit = 'kg';
            });
        });
    }
};

// 유산소 저장 위치를 cardio.logs 하나로 확정한다(cardioLogs / cardio[] 폐기).
const normalizeCardio = (db) => {
    Object.values(db.workout || {}).forEach((entry) => {
        if (!entry || typeof entry !== 'object') return;
        const logs = getCardioLogs(entry).map((log) => ({ ...log, id: log.id || createId() }));
        const prev = entry.cardio && !Array.isArray(entry.cardio) ? entry.cardio : {};
        delete entry.cardioLogs;
        entry.cardio = { ...prev, logs };
    });
};

// 식단은 meals[] + logs[] 이중 저장이었다. logs[] 하나로 합치고 물도 로그로 편입한다.
const unifyDietLogs = (db) => {
    Object.entries(db.diet || {}).forEach(([dateISO, entry]) => {
        if (!entry || typeof entry !== 'object') return;
        const logs = Array.isArray(entry.logs) ? entry.logs : [];
        const meals = Array.isArray(entry.meals) ? entry.meals : [];
        const next = (logs.length > 0 ? logs : meals).map((log) => ({ ...log, kind: log.kind || 'meal' }));

        // logs에 누락된 meals 항목이 있으면 살려둔다.
        if (logs.length > 0 && meals.length > 0) {
            const seen = new Set(next.map((log) => log.id).filter(Boolean));
            meals.forEach((meal) => {
                if (meal?.id && !seen.has(meal.id)) next.push({ ...meal, kind: 'meal' });
            });
        }

        next.forEach((log) => {
            if (!log.id) log.id = createId();
            if (!log.timeHHMM) log.timeHHMM = timeHHMMFromDate(log.createdAt) || '';
        });

        const waterMl = toNumber(entry.waterMl);
        if (waterMl > 0 && !next.some((log) => log.kind === 'water')) {
            next.push({
                id: createId(),
                kind: 'water',
                amountMl: waterMl,
                timeHHMM: '12:00',
                createdAt: combineDateAndTime(dateISO, '12:00') || ''
            });
        }

        delete entry.meals;
        delete entry.waterMl;
        entry.logs = next;
    });
};

const MIGRATIONS = [
    {
        to: 2,
        migrate: (db) => {
            normalizeWorkoutUnits(db);
            normalizeCardio(db);
            unifyDietLogs(db);
        }
    }
];

export const migrateUserDb = (db) => {
    if (!db || typeof db !== 'object') return db;
    const from = Number(db.schemaVersion) || 1;
    MIGRATIONS.forEach(({ to, migrate }) => {
        if (from < to) migrate(db);
    });
    db.schemaVersion = CURRENT_SCHEMA_VERSION;
    return db;
};
