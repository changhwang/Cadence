import { DETAIL_TO_GROUP, GROUP_ORDER } from '../../data/muscleGroups.js';
import { resolveExercise } from '../workout/exerciseIndex.js';
import { getStrengthLogs, summarizeStrengthLog } from '../workout/workoutEntry.js';
import { enumerateRangeDates } from './period.js';
import { aggregateWorkoutRange } from './workoutAgg.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const getMajorGroup = (exercise) => {
    const details = exercise?.muscles?.detail;
    if (Array.isArray(details) && details.length > 0) {
        return DETAIL_TO_GROUP[details[0]] || 'Other';
    }
    return 'Other';
};

const forEachStrengthLog = ({ userdb, startISO, endISO }, visit) => {
    enumerateRangeDates({ startISO, endISO }).forEach((dateISO) => {
        getStrengthLogs(userdb?.workout?.[dateISO]).forEach((log) => visit(log, dateISO));
    });
};

export const aggregateMuscleBalance = ({ userdb, startISO, endISO }) => {
    const groups = GROUP_ORDER.reduce((acc, group) => ({ ...acc, [group]: 0 }), {});
    forEachStrengthLog({ userdb, startISO, endISO }, (log) => {
        const group = getMajorGroup(resolveExercise(log));
        groups[group] = (groups[group] || 0) + summarizeStrengthLog(log).sets;
    });
    return groups;
};

export const aggregateMuscleDistribution = ({ userdb, startISO, endISO, metric = 'sets' }) => {
    const stats = {};
    forEachStrengthLog({ userdb, startISO, endISO }, (log) => {
        const exercise = resolveExercise(log);
        const details = Array.isArray(exercise?.muscles?.detail) ? exercise.muscles.detail : ['Other'];
        const summary = summarizeStrengthLog(log);
        details.forEach((muscle) => {
            if (!stats[muscle]) {
                stats[muscle] = { sets: 0, volume: 0, time: 0 };
            }
            stats[muscle].sets += summary.sets;
            stats[muscle].volume += summary.volume;
            stats[muscle].time += summary.sets * 2;
        });
    });
    return stats;
};

// 근육군 단위 합계. 한 운동이 같은 군의 여러 부위(예: 벤치프레스 = 윗가슴+중간가슴)를
// 자극해도 세트를 중복으로 더하지 않도록 로그당 군별 1회만 반영한다.
export const aggregateGroupTotals = ({ userdb, startISO, endISO, metric = 'sets' }) => {
    const totals = GROUP_ORDER.reduce((acc, group) => ({ ...acc, [group]: 0 }), {});
    forEachStrengthLog({ userdb, startISO, endISO }, (log) => {
        const exercise = resolveExercise(log);
        const details = Array.isArray(exercise?.muscles?.detail) ? exercise.muscles.detail : [];
        const summary = summarizeStrengthLog(log);
        const value = metric === 'volume'
            ? summary.volume
            : metric === 'time'
                ? summary.sets * 2
                : summary.sets;
        if (!value) return;
        const groups = new Set(details.map((detail) => DETAIL_TO_GROUP[detail] || 'Other'));
        if (groups.size === 0) groups.add('Other');
        groups.forEach((group) => {
            totals[group] = (totals[group] || 0) + value;
        });
    });
    return totals;
};

export const computeBaselineP95 = ({ muscles, metric = 'sets', fallback = 10 }) => {
    const values = Object.values(muscles || {})
        .map((entry) => toNumber(entry[metric]))
        .filter((value) => value > 0)
        .sort((a, b) => a - b);
    if (values.length === 0) return fallback;
    const index = Math.min(values.length - 1, Math.floor(values.length * 0.95));
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
