import { enumerateRangeDates } from './period.js';
import {
    summarizeCardioMinutes,
    summarizeStrengthEntry,
    summarizeStrengthEntryPerformed
} from '../workout/workoutEntry.js';

const pickMetric = ({ metric, strength, cardioMinutes }) => {
    if (metric === 'time') return cardioMinutes;
    if (metric === 'sets') return strength.sets;
    return strength.volume;
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
        const cardioMinutes = summarizeCardioMinutes(entry);
        totalSets += strength.sets;
        totalVol += strength.volume;
        totalTime += cardioMinutes;
        timeseries.push({ dateISO, value: pickMetric({ metric, strength, cardioMinutes }) });
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
        const cardioMinutes = summarizeCardioMinutes(entry);
        const value = pickMetric({ metric, strength, cardioMinutes });
        maxValue = Math.max(maxValue, value);
        days.push({ dateISO, value });
    }
    return days.map((day) => ({
        ...day,
        norm01: maxValue > 0 ? day.value / maxValue : 0
    }));
};
