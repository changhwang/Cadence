import { el } from '../../utils/dom.js';
import { getExerciseKcalForDate } from '../../services/workout/energy.js';
import { summarizeCardioMinutes, summarizeStrengthEntryPerformed } from '../../services/workout/workoutEntry.js';
import { toDisplayWeight } from '../../utils/units.js';

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
    const workoutEntry = userdb.workout?.[dateKey];

    // 요약 카드는 실제 완료한 세트만 보여준다.
    const strength = summarizeStrengthEntryPerformed(workoutEntry);
    const cardioMinutes = summarizeCardioMinutes(workoutEntry);
    const cardioKcal = getExerciseKcalForDate({ day: workoutEntry, profile: userdb.profile });

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
            summaryItem('볼륨', formatVolume(strength.volume, settings.units.workout)),
            summaryItem('유산소(m)', `${Math.round(cardioMinutes)}m`),
            summaryItem('kcal', `${Math.round(cardioKcal)}kcal`)
        )
    );
};
