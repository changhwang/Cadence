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

export const getExerciseKcalForDate = ({ day, profile }) => {
    if (!day) return 0;
    const logs = Array.isArray(day.logs) ? day.logs : [];
    return logs.reduce((sum, entry) => sum + estimateCardioKcal({ entry, profile }), 0);
};
