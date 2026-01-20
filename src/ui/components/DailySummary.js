import { el } from '../../utils/dom.js';
import { getExerciseKcalForDate } from '../../services/workout/energy.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const getCardioLogs = (entry) => {
    if (!entry) return [];
    if (Array.isArray(entry.cardio?.logs)) return entry.cardio.logs;
    if (Array.isArray(entry.cardioLogs)) return entry.cardioLogs;
    if (Array.isArray(entry.cardio)) return entry.cardio;
    return [];
};

const summarizeStrength = (logs) => {
    return logs.reduce(
        (acc, log) => {
            const setsDetail = Array.isArray(log.setsDetail) && log.setsDetail.length > 0 ? log.setsDetail : null;
            const setsCount = setsDetail ? setsDetail.length : toNumber(log.sets);
            acc.sets += setsCount;
            if (setsDetail) {
                acc.volume += setsDetail.reduce(
                    (sum, set) => sum + toNumber(set.weight) * toNumber(set.reps),
                    0
                );
            } else {
                acc.volume += toNumber(log.weight) * toNumber(log.reps) * setsCount;
            }
            return acc;
        },
        { sets: 0, volume: 0 }
    );
};

const summarizeCardio = (logs) => {
    return logs.reduce((sum, entry) => sum + toNumber(entry.minutes), 0);
};

export const renderDailySummary = ({ userdb, settings, dateKey }) => {
    const workoutEntry = userdb.workout?.[dateKey] || { logs: [] };
    const strengthLogs = Array.isArray(workoutEntry.logs) ? workoutEntry.logs : [];
    const cardioLogs = getCardioLogs(workoutEntry);

    const strength = summarizeStrength(strengthLogs);
    const cardioMinutes = summarizeCardio(cardioLogs);
    const cardioKcal = getExerciseKcalForDate({
        day: { logs: cardioLogs },
        profile: userdb.profile
    });

    const volumeLabel = `${Math.round(strength.volume)}${settings.units.workout}`;
    const cardioLabel = `${Math.round(cardioMinutes)}m`;
    const kcalLabel = `${Math.round(cardioKcal)}kcal`;

    const summaryItem = (label, value) =>
        el(
            'div',
            {},
            el('div', { className: 'list-subtitle' }, label),
            el('div', { className: 'badge' }, value)
        );

    return el(
        'div',
        { className: 'card' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '요약')),
        el(
            'div',
            { className: 'row row-gap' },
            summaryItem('세트', String(Math.round(strength.sets))),
            summaryItem('볼륨', volumeLabel),
            summaryItem('유산소(m)', cardioLabel),
            summaryItem('kcal', kcalLabel)
        )
    );
};
