// 목표 프리셋은 여기 하나만 유지한다(모드 + 열량 증감률의 단일 출처).
export const GOAL_PRESETS = {
    maintain: { label: '유지', mode: 'MAINTAIN', deltaPct: 0 },
    cut: { label: '감량', mode: 'CUT', deltaPct: -0.15 },
    minicut: { label: '미니컷', mode: 'CUT', deltaPct: -0.25 },
    bulk: { label: '증량', mode: 'BULK', deltaPct: 0.1 },
    leanbulk: { label: '린 벌크', mode: 'LEAN_BULK', deltaPct: 0.05 },
    recomp: { label: '리컴프', mode: 'RECOMP', deltaPct: -0.05 },
    performance: { label: '퍼포먼스', mode: 'MAINTAIN', deltaPct: 0 }
};

export const MODE_LABELS = {
    MAINTAIN: '유지',
    CUT: '감량',
    BULK: '증량',
    LEAN_BULK: '린 벌크',
    RECOMP: '리컴프'
};

// spec에 증감률이 없을 때만 쓰이는 폴백.
export const DEFAULT_ENERGY_MODEL = { cutPct: 0.15, bulkPct: 0.1 };

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
