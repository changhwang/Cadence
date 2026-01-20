export const buildGoalModeSpec = (goal) => {
    if (goal === 'cut') return { mode: 'CUT', cutPct: 0.15 };
    if (goal === 'minicut') return { mode: 'CUT', cutPct: 0.25 };
    if (goal === 'bulk') return { mode: 'BULK', bulkPct: 0.1 };
    if (goal === 'leanbulk') return { mode: 'LEAN_BULK', bulkPct: 0.05 };
    if (goal === 'recomp') return { mode: 'RECOMP', cutPct: 0.05 };
    return { mode: 'MAINTAIN' };
};
