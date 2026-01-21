import { el } from '../../utils/dom.js';
import { getExerciseKcalForDate } from '../../services/workout/energy.js';
import { toDisplayWeight } from '../../utils/units.js';

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
            if (setsDetail) {
                setsDetail.forEach((set) => {
                    if (!set.completed) return;
                    acc.sets += 1;
                    acc.volume += toNumber(set.weight) * toNumber(set.reps);
                });
            } else {
                // 기록된 세트가 없으면 0으로 처리
                acc.sets += 0;
                acc.volume += 0;
            }
            return acc;
        },
        { sets: 0, volume: 0 }
    );
};

const summarizeCardio = (logs) => {
    return logs.reduce((sum, entry) => sum + toNumber(entry.minutes), 0);
};

const formatVolume = (valueKg, unit) => {
    const safeUnit = unit || '';
    const displayValue = toDisplayWeight(valueKg, unit);
    if (displayValue >= 1000) {
        const rounded = Math.round((displayValue / 1000) * 10) / 10;
        const text = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
        return `${text}k${safeUnit ? ` ${safeUnit}` : ''}`;
    }
    return `${Math.round(displayValue)}${safeUnit ? ` ${safeUnit}` : ''}`;
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

    const volumeLabel = formatVolume(strength.volume, settings.units.workout);
    const cardioLabel = `${Math.round(cardioMinutes)}m`;
    const kcalLabel = `${Math.round(cardioKcal)}kcal`;

    const summaryItem = (label, value) =>
        el(
            'div',
            { className: 'summary-item' },
            el('div', { className: 'summary-label' }, label),
            el('div', { className: 'summary-value' }, value)
        );

    return el(
        'div',
        { className: 'card daily-summary' },
        el(
            'div',
            { className: 'summary-grid' },
            summaryItem('세트', String(Math.round(strength.sets))),
            summaryItem('볼륨', volumeLabel),
            summaryItem('유산소(m)', cardioLabel),
            summaryItem('kcal', kcalLabel)
        )
    );
};
