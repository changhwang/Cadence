import { FRAMEWORK_POLICIES } from '../nutritionPolicies.js';

const ACTIVITY_FACTORS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
    athlete: 1.9
};

const getActivityFactor = (value) => {
    if (typeof value === 'number') return value;
    return ACTIVITY_FACTORS[value] || ACTIVITY_FACTORS.light;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const calcBmr = (sex, weightKg, heightCm, age) => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === 'F' ? base - 161 : base + 5;
};

const pickMid = (range) => (range ? (range[0] + range[1]) / 2 : null);

const calcMacroFromPct = (kcal, pct) => (kcal * pct) / 4;

const calcFatFromPct = (kcal, pct) => (kcal * pct) / 9;

const resolveGoalDelta = (spec, settings) => {
    const cutPct = settings?.energyModel?.cutPct ?? 0.15;
    const bulkPct = settings?.energyModel?.bulkPct ?? 0.1;
    const mode = spec?.goalMode?.mode || 'MAINTAIN';

    if (mode === 'CUT') return -(spec?.goalMode?.cutPct ?? cutPct);
    if (mode === 'BULK') return spec?.goalMode?.bulkPct ?? bulkPct;
    if (mode === 'LEAN_BULK') return spec?.goalMode?.bulkPct ?? bulkPct * 0.5;
    if (mode === 'RECOMP') return -(spec?.goalMode?.cutPct ?? cutPct * 0.3);
    return 0;
};

const getPolicyByFramework = (frameworkId) => {
    if (FRAMEWORK_POLICIES[frameworkId]) return FRAMEWORK_POLICIES[frameworkId];
    return FRAMEWORK_POLICIES.dga_2025;
};

export const computeBaseTargets = ({ profile, spec, settings }) => {
    const weightKg = Number(profile.weightKg ?? profile.weight_kg);
    const heightCm = Number(profile.heightCm ?? profile.height_cm);
    const age = Number(profile.age);

    if (!weightKg || !heightCm || !age) {
        return { targets: null, rules: { error: 'profile_incomplete' } };
    }

    const bmr = calcBmr(profile.sex, weightKg, heightCm, age);
    const tdee = bmr * getActivityFactor(profile.activityFactor ?? profile.activity);
    const delta = resolveGoalDelta(spec, settings);
    const targetCal = Math.round(tdee * (1 + delta));

    const frameworkId = spec?.frameworkId || 'dga_2025';
    const policy = getPolicyByFramework(frameworkId);

    let proteinG = null;
    let carbsG = null;
    let fatG = null;

    if (policy.protein_g_per_kg) {
        proteinG = Math.round(weightKg * pickMid(policy.protein_g_per_kg));
    } else if (policy.protein_pct) {
        proteinG = Math.round(calcMacroFromPct(targetCal, pickMid(policy.protein_pct)));
    }

    if (policy.carbs_g_per_kg_by_load) {
        const range = policy.carbs_g_per_kg_by_load[profile.trainingLoad] || policy.carbs_g_per_kg_by_load.light;
        carbsG = Math.round(weightKg * pickMid(range));
    } else if (policy.carb_pct) {
        carbsG = Math.round(calcMacroFromPct(targetCal, pickMid(policy.carb_pct)));
    }

    if (policy.fat_pct) {
        fatG = Math.round(calcFatFromPct(targetCal, pickMid(policy.fat_pct)));
    }

    const targets = {
        kcal: targetCal,
        proteinG: clamp(proteinG, 0, 999),
        carbG: clamp(carbsG, 0, 999),
        fatG: clamp(fatG, 0, 999),
        sodiumMg: policy.sodium_mg_max ?? null,
        waterMl: null,
        fiberG: policy.fiber_g_per_1000kcal ? Math.round((targetCal / 1000) * policy.fiber_g_per_1000kcal) : null
    };

    const rules = {
        proteinGkg: policy.protein_g_per_kg ? pickMid(policy.protein_g_per_kg) : null,
        satFatCapPct: policy.satfat_pct_max ?? null,
        sodiumCapMg: policy.sodium_mg_max ?? null
    };

    return { targets, rules };
};

export const applyExerciseCredit = ({ base, exerciseKcal, policy }) => {
    const enabled = policy?.enabled ?? true;
    if (!enabled) return { final: base, creditedKcal: 0 };
    const factor = policy?.factor ?? 0.5;
    const cap = policy?.capKcal ?? 500;
    const credited = clamp(Math.round(exerciseKcal * factor), 0, cap);
    return {
        final: { ...base, kcal: (base.kcal || 0) + credited },
        creditedKcal: credited
    };
};

export const distributeCredit = ({ creditedKcal, base, distribution }) => {
    if (!creditedKcal) return {};
    if (distribution === 'CARB_BIASED') {
        return { carbG: base.carbG + Math.round(creditedKcal / 4) };
    }
    if (distribution === 'FAT_BIASED') {
        return { fatG: base.fatG + Math.round(creditedKcal / 9) };
    }
    return {
        carbG: base.carbG + Math.round((creditedKcal * 0.5) / 4),
        fatG: base.fatG + Math.round((creditedKcal * 0.5) / 9)
    };
};
