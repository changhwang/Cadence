const FRAMEWORKS = [
    {
        id: 'dga_2025',
        label: 'DGA 2025–2030',
        kind: 'BALANCED',
        macroRule: {
            protein: { type: 'GKG', value: 1.4 },
            carbs: { type: 'PCT', value: 0.5 },
            fat: { type: 'PCT', value: 0.25 }
        },
        constraints: { sodiumCapMg: 2300, satFatCapPct: 0.1 }
    },
    {
        id: 'amdr',
        label: 'AMDR Balanced',
        kind: 'BALANCED',
        macroRule: {
            protein: { type: 'PCT', value: 0.2 },
            carbs: { type: 'PCT', value: 0.5 },
            fat: { type: 'PCT', value: 0.3 }
        }
    },
    {
        id: 'issn_strength',
        label: 'ISSN Strength',
        kind: 'HIGH_PRO',
        macroRule: {
            protein: { type: 'GKG', value: 1.7 },
            carbs: { type: 'PCT', value: 0.4 },
            fat: { type: 'PCT', value: 0.3 }
        }
    },
    {
        id: 'acsm_endurance',
        label: 'ACSM Endurance',
        kind: 'HIGH_CARB',
        macroRule: {
            protein: { type: 'GKG', value: 1.4 },
            carbs: { type: 'PCT', value: 0.55 },
            fat: { type: 'PCT', value: 0.25 }
        }
    },
    {
        id: 'custom',
        label: 'Custom',
        kind: 'CUSTOM',
        macroRule: {
            protein: { type: 'GKG', value: 1.6 },
            carbs: { type: 'PCT', value: 0.45 },
            fat: { type: 'PCT', value: 0.25 }
        }
    }
];

export const getFrameworks = () => [...FRAMEWORKS];

export const getFrameworkById = (id) => FRAMEWORKS.find((fw) => fw.id === id) || null;

export const validateFramework = (fw) => {
    const errors = [];
    if (!fw || typeof fw !== 'object') {
        return { ok: false, errors: ['Framework must be an object'] };
    }
    if (!fw.id) errors.push('id is required');
    if (!fw.label) errors.push('label is required');
    if (!fw.kind) errors.push('kind is required');
    if (!fw.macroRule) errors.push('macroRule is required');
    if (fw.macroRule) {
        if (!fw.macroRule.protein) errors.push('macroRule.protein is required');
        if (!fw.macroRule.carbs) errors.push('macroRule.carbs is required');
        if (!fw.macroRule.fat) errors.push('macroRule.fat is required');
    }
    return { ok: errors.length === 0, errors };
};
