import { getMealLogs } from './dietEntry.js';

const NUTRIENT_KEYS = [
    'kcal',
    'proteinG',
    'carbG',
    'fatG',
    'fiberG',
    'unsatFatG',
    'satFatG',
    'transFatG',
    'sugarG',
    'addedSugarG',
    'sodiumMg',
    'potassiumMg'
];

const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const emptyTotals = () => NUTRIENT_KEYS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {});

export const getDietTotalsForDate = ({ day }) => {
    const totals = getMealLogs(day).reduce((acc, log) => {
        NUTRIENT_KEYS.forEach((key) => {
            acc[key] += toNumber(log?.[key]);
        });
        return acc;
    }, emptyTotals());

    return { totals, hasData: NUTRIENT_KEYS.some((key) => totals[key] > 0) };
};
