import { enumerateRangeDates } from './period.js';

const toNumber = (value) => (Number.isNaN(Number(value)) ? null : Number(value));

export const aggregateBodyTrend = ({
    userdb,
    startISO,
    endISO,
    metricKey = 'weightKg'
}) => {
    const dates = enumerateRangeDates({ startISO, endISO });
    const profileHeightCm = Number(userdb?.profile?.height_cm || 0);
    const series = [];
    dates.forEach((dateISO) => {
        const entry = userdb?.body?.[dateISO] || {};
        let value = null;
        if (metricKey === 'weightKg') value = toNumber(entry.weight);
        if (metricKey === 'waistCm') value = toNumber(entry.waist);
        if (metricKey === 'bodyFatPct') value = toNumber(entry.fat);
        if (metricKey === 'leanMassKg') value = toNumber(entry.muscle);
        if (metricKey === 'bmi') {
            const weightKg = toNumber(entry.weight);
            if (weightKg && profileHeightCm) {
                const hM = profileHeightCm / 100;
                value = weightKg / (hM * hM);
            }
        }
        if (value !== null) {
            series.push({ dateISO, value });
        }
    });
    return series;
};
