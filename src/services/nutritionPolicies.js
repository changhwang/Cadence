export const GOAL_PRESETS = {
    maintain: { label: '유지', deltaPct: 0 },
    cut: { label: '감량', deltaPct: -0.15 },
    minicut: { label: '미니컷', deltaPct: -0.25 },
    bulk: { label: '증량', deltaPct: 0.1 },
    leanbulk: { label: '린 벌크', deltaPct: 0.05 },
    recomp: { label: '리컴프', deltaPct: 0 },
    performance: { label: '퍼포먼스 유지', deltaPct: 0 }
};

export const FRAMEWORK_POLICIES = {
    dga_2025: {
        label: 'DGA 2025–2030',
        protein_g_per_kg: [1.2, 1.6],
        fat_pct: [0.2, 0.35],
        carb_pct: [0.45, 0.65],
        sodium_mg_max: 2300,
        satfat_pct_max: 0.1,
        fiber_g_per_1000kcal: 14
    },
    amdr: {
        label: 'AMDR Balanced',
        protein_pct: [0.1, 0.35],
        fat_pct: [0.2, 0.35],
        carb_pct: [0.45, 0.65]
    },
    issn_strength: {
        label: 'ISSN Strength',
        protein_g_per_kg: [1.4, 2.0],
        fat_pct: [0.2, 0.35],
        carb_pct: [0.35, 0.55],
        sodium_mg_max: 2300
    },
    acsm_endurance: {
        label: 'ACSM Endurance',
        protein_g_per_kg: [1.2, 2.0],
        carbs_g_per_kg_by_load: {
            light: [3, 5],
            moderate: [5, 7],
            high: [6, 10],
            extreme: [8, 12]
        },
        fat_pct: [0.2, 0.35]
    }
};
