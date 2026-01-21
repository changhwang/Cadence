import { EXERCISE_DB } from '../../data/exercises.js';
import { enumerateRangeDates } from './period.js';
import { aggregateWorkoutRange } from './workoutAgg.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const normalize = (value) => String(value || '').trim().toLowerCase();

const DETAIL_TO_GROUP = {
    chest: 'Chest',
    upper_chest: 'Chest',
    middle_chest: 'Chest',
    lower_chest: 'Chest',
    lats: 'Back',
    mid_back: 'Back',
    upper_back: 'Back',
    lower_traps: 'Back',
    traps: 'Back',
    erectors: 'Back',
    quads: 'Legs',
    hamstrings: 'Legs',
    glutes: 'Legs',
    calves: 'Legs',
    adductors: 'Legs',
    abductors: 'Legs',
    front_delts: 'Shoulders',
    lateral_delts: 'Shoulders',
    rear_delts: 'Shoulders',
    delts: 'Shoulders',
    biceps: 'Arms',
    triceps: 'Arms',
    forearms: 'Arms',
    grip: 'Arms',
    core: 'Core',
    hip_flexors: 'Core',
    abs: 'Core',
    obliques: 'Core'
};

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

const getMajorGroup = (exercise) => {
    const details = exercise?.muscles?.detail;
    if (Array.isArray(details) && details.length > 0) {
        const first = details[0];
        return DETAIL_TO_GROUP[first] || 'Other';
    }
    return 'Other';
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

export const aggregateMuscleBalance = ({ userdb, startISO, endISO }) => {
    const groups = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0, Other: 0 };
    const dates = enumerateRangeDates({ startISO, endISO });
    dates.forEach((dateISO) => {
        const logs = Array.isArray(userdb?.workout?.[dateISO]?.logs)
            ? userdb.workout[dateISO].logs
            : [];
        logs.forEach((log) => {
            const exercise = resolveExercise(log);
            const group = getMajorGroup(exercise);
            const summary = summarizeStrengthLog(log);
            groups[group] = (groups[group] || 0) + summary.sets;
        });
    });
    return groups;
};

export const aggregateMuscleDistribution = ({ userdb, startISO, endISO, metric = 'sets' }) => {
    const stats = {};
    const dates = enumerateRangeDates({ startISO, endISO });
    dates.forEach((dateISO) => {
        const logs = Array.isArray(userdb?.workout?.[dateISO]?.logs)
            ? userdb.workout[dateISO].logs
            : [];
        logs.forEach((log) => {
            const exercise = resolveExercise(log);
            const details = Array.isArray(exercise?.muscles?.detail)
                ? exercise.muscles.detail
                : ['Other'];
            const summary = summarizeStrengthLog(log);
            const value = metric === 'volume'
                ? summary.volume
                : metric === 'time'
                    ? summary.sets * 2
                    : summary.sets;
            details.forEach((muscle) => {
                if (!stats[muscle]) {
                    stats[muscle] = { sets: 0, volume: 0, time: 0 };
                }
                stats[muscle].sets += summary.sets;
                stats[muscle].volume += summary.volume;
                stats[muscle].time += summary.sets * 2;
                if (metric === 'time') {
                    stats[muscle].time = Math.max(stats[muscle].time, value);
                }
            });
        });
    });
    return stats;
};

export const computeBaselineP95 = ({ muscles, metric = 'sets', fallback = 10 }) => {
    const values = Object.values(muscles || {})
        .map((entry) => toNumber(entry[metric]))
        .filter((value) => value > 0)
        .sort((a, b) => a - b);
    if (values.length === 0) return fallback;
    const index = Math.floor(values.length * 0.95);
    return Math.max(values[index], fallback);
};

export const aggregateMuscleBalanceWithPrev = ({ userdb, startISO, endISO, prevStartISO, prevEndISO }) => {
    const current = aggregateMuscleBalance({ userdb, startISO, endISO });
    const previous = aggregateMuscleBalance({ userdb, startISO: prevStartISO, endISO: prevEndISO });
    return { current, previous };
};

export const aggregateWorkoutSummary = ({ userdb, startISO, endISO }) => {
    return aggregateWorkoutRange({ userdb, startISO, endISO, metric: 'volume' });
};
