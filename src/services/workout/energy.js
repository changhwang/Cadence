import { getCardioLogs } from './workoutEntry.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

export const estimateCardioKcal = ({ entry, profile }) => {
    if (!entry) return 0;
    if (entry.kcal) return toNumber(entry.kcal);
    const minutes = toNumber(entry.minutes);
    const met = toNumber(entry.met);
    const weightKg = toNumber(profile?.weightKg ?? profile?.weight_kg);
    if (!minutes || !met || !weightKg) return 0;
    return Math.round((met * 3.5 * weightKg * minutes) / 200);
};

// day는 userdb.workout[dateISO] 엔트리 전체를 받는다(유산소 로그만 합산).
export const getExerciseKcalForDate = ({ day, profile }) => {
    return getCardioLogs(day).reduce((sum, entry) => sum + estimateCardioKcal({ entry, profile }), 0);
};
