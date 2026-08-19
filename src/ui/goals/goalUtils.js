import { GOAL_PRESETS, MODE_LABELS } from '../../services/nutritionPolicies.js';

export const buildGoalModeSpec = (goal) => {
    const preset = GOAL_PRESETS[goal] || GOAL_PRESETS.maintain;
    const pct = Math.abs(preset.deltaPct);
    if (preset.mode === 'CUT' || preset.mode === 'RECOMP') return { mode: preset.mode, cutPct: pct };
    if (preset.mode === 'BULK' || preset.mode === 'LEAN_BULK') return { mode: preset.mode, bulkPct: pct };
    return { mode: 'MAINTAIN' };
};

export const getGoalModeLabel = (mode) => MODE_LABELS[mode] || mode || '-';
