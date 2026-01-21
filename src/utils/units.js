export const WORKOUT_LB_PER_KG = 2.2046226218;
export const FOOD_G_PER_OZ = 28.3495;
export const CM_PER_IN = 2.54;

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

export const gToOz = (grams) => {
    const value = Number(grams);
    if (Number.isNaN(value)) return 0;
    return value / FOOD_G_PER_OZ;
};

export const ozToG = (oz) => {
    const value = Number(oz);
    if (Number.isNaN(value)) return 0;
    return value * FOOD_G_PER_OZ;
};

export const toDisplayFoodAmount = (amountG, unit = 'g') => {
    return unit === 'oz' ? gToOz(amountG) : Number(amountG || 0);
};

export const fromDisplayFoodAmount = (value, unit = 'g') => {
    return unit === 'oz' ? ozToG(value) : Number(value || 0);
};

export const cmToIn = (cm) => {
    const value = Number(cm);
    if (Number.isNaN(value)) return 0;
    return value / CM_PER_IN;
};

export const inToCm = (inch) => {
    const value = Number(inch);
    if (Number.isNaN(value)) return 0;
    return value * CM_PER_IN;
};

export const toDisplayHeight = (heightCm, unit = 'cm') => {
    return unit === 'in' ? cmToIn(heightCm) : Number(heightCm || 0);
};

export const fromDisplayHeight = (value, unit = 'cm') => {
    return unit === 'in' ? inToCm(value) : Number(value || 0);
};
