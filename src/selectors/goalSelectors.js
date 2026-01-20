const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

const emptyTargets = () => ({
    kcal: 0,
    proteinG: 0,
    carbG: 0,
    fatG: 0,
    waterMl: 0,
    sodiumMg: 0,
    fiberG: 0
});

const compareIso = (a, b) => a.localeCompare(b);

const findTimelineEntry = (timeline, dateISO) => {
    if (!Array.isArray(timeline) || timeline.length === 0) return null;
    const sorted = [...timeline].sort((a, b) => compareIso(a.effectiveDate, b.effectiveDate));
    let latest = null;
    for (const entry of sorted) {
        if (compareIso(entry.effectiveDate, dateISO) <= 0) {
            latest = entry;
        } else {
            break;
        }
    }
    return latest;
};

const mergeTargets = (base, patch) => ({
    ...base,
    ...Object.entries(patch || {}).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'number' ? value : toNumber(value);
        return acc;
    }, {})
});

export const selectGoalForDate = (state, dateISO) => {
    const goals = state?.userdb?.goals || {};
    const timeline = goals.timeline || [];
    const overrideByDate = goals.overrideByDate || {};
    const override = overrideByDate[dateISO] || null;

    const entry = findTimelineEntry(timeline, dateISO);
    const entryTargets = entry?.targets || emptyTargets();
    const baseTargets = override?.targets ? mergeTargets(entryTargets, override.targets) : entryTargets;

    return {
        base: baseTargets,
        final: baseTargets,
        meta: {
            source: override ? 'override' : 'timeline',
            effectiveDate: override ? dateISO : (entry?.effectiveDate || dateISO),
            creditedKcal: 0
        }
    };
};

export const selectSelectedDate = (state, domain) => {
    const selected = state?.userdb?.meta?.selectedDate || {};
    if (domain === 'diet') return selected.diet;
    if (domain === 'workout') return selected.workout;
    if (domain === 'body') return selected.body;
    return selected.diet || selected.workout || selected.body;
};
