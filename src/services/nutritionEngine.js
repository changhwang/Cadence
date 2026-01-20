import { FRAMEWORK_POLICIES, GOAL_PRESETS } from './nutritionPolicies.js';

const ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    athlete: 1.9
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const calcBmr = (sex, weightKg, heightCm, age) => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === 'F' ? base - 161 : base + 5;
};

const calcAge = (birthIso) => {
    if (!birthIso) return null;
    const birth = new Date(birthIso);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age;
};

const pickMid = (range) => (range ? (range[0] + range[1]) / 2 : null);

const calcMacroFromPct = (kcal, pct) => (kcal * pct) / 4;

const calcFatFromPct = (kcal, pct) => (kcal * pct) / 9;

export const computeTargets = ({ profile, nutrition }) => {
    const {
        sex,
        birth,
        height_cm,
        weight_kg,
        activity = 'light',
        trainingLoad = 'light'
    } = profile || {};

    const weight = Number(weight_kg);
    const height = Number(height_cm);
    const age = calcAge(birth);

    if (!weight || !height || !age) {
        return { error: '프로필 정보가 부족합니다.' };
    }

    const goalPreset = GOAL_PRESETS[nutrition?.goal] || GOAL_PRESETS.maintain;
    const framework = FRAMEWORK_POLICIES[nutrition?.framework] || FRAMEWORK_POLICIES.dga_2025;

    const bmr = calcBmr(sex, weight, height, age);
    const tdee = bmr * (ACTIVITY_FACTORS[activity] || ACTIVITY_FACTORS.light);
    const targetCal = Math.round(tdee * (1 + goalPreset.deltaPct));

    let proteinG = null;
    let carbsG = null;
    let fatG = null;

    if (framework.protein_g_per_kg) {
        proteinG = Math.round(weight * pickMid(framework.protein_g_per_kg));
    } else if (framework.protein_pct) {
        proteinG = Math.round(calcMacroFromPct(targetCal, pickMid(framework.protein_pct)));
    }

    if (framework.carbs_g_per_kg_by_load) {
        const range = framework.carbs_g_per_kg_by_load[trainingLoad] || framework.carbs_g_per_kg_by_load.light;
        carbsG = Math.round(weight * pickMid(range));
    } else if (framework.carb_pct) {
        carbsG = Math.round(calcMacroFromPct(targetCal, pickMid(framework.carb_pct)));
    }

    if (framework.fat_pct) {
        fatG = Math.round(calcFatFromPct(targetCal, pickMid(framework.fat_pct)));
    }

    const overrides = nutrition?.overrides || {};
    const finalTargets = {
        targetCal: overrides.targetCal ?? targetCal,
        protein_g: overrides.protein_g ?? proteinG,
        carbs_g: overrides.carbs_g ?? carbsG,
        fat_g: overrides.fat_g ?? fatG,
        sodium_mg: overrides.sodium_mg ?? framework.sodium_mg_max ?? null,
        satFat_g: overrides.satFat_g ?? (framework.satfat_pct_max ? Math.round(calcFatFromPct(targetCal, framework.satfat_pct_max)) : null),
        fiber_g: overrides.fiber_g ?? (framework.fiber_g_per_1000kcal ? Math.round((targetCal / 1000) * framework.fiber_g_per_1000kcal) : null),
        addedSugar_g: overrides.addedSugar_g ?? null
    };

    return {
        targetCal: finalTargets.targetCal,
        protein_g: clamp(finalTargets.protein_g, 0, 999),
        carbs_g: clamp(finalTargets.carbs_g, 0, 999),
        fat_g: clamp(finalTargets.fat_g, 0, 999),
        sodium_mg: finalTargets.sodium_mg,
        satFat_g: finalTargets.satFat_g,
        fiber_g: finalTargets.fiber_g,
        addedSugar_g: finalTargets.addedSugar_g,
        notes: []
    };
};
