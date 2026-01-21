export const WORKOUT_LB_PER_KG = 2.2046226218;

export const kgToLb = (kg) => {
    const value = Number(kg);
    if (Number.isNaN(value)) return 0;
    return value * WORKOUT_LB_PER_KG;
};

export const lbToKg = (lb) => {
    const value = Number(lb);
    if (Number.isNaN(value)) return 0;
    return value / WORKOUT_LB_PER_KG;
};

export const toDisplayWeight = (weightKg, unit = 'kg') => {
    return unit === 'lb' ? kgToLb(weightKg) : Number(weightKg || 0);
};

export const fromDisplayWeight = (value, unit = 'kg') => {
    return unit === 'lb' ? lbToKg(value) : Number(value || 0);
};

export const roundWeight = (value, decimals = 1) => {
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    const factor = 10 ** decimals;
    return Math.round(num * factor) / factor;
};

export const formatWeight = (weightKg, unit = 'kg', decimals = 1) => {
    const display = roundWeight(toDisplayWeight(weightKg, unit), decimals);
    return unit ? `${display} ${unit}` : String(display);
};
