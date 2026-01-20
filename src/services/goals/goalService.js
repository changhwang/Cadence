const compareIso = (a, b) => a.localeCompare(b);

const findTimelineEntry = (timeline, dateISO) => {
    if (!Array.isArray(timeline)) return null;
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

export const getEffectiveGoal = ({ dateISO, goals }) => {
    const timeline = goals?.timeline || [];
    const overrideByDate = goals?.overrideByDate || {};
    const override = overrideByDate[dateISO] || null;
    const entry = findTimelineEntry(timeline, dateISO);

    const baseTargets = override?.targets || entry?.targets || null;

    return {
        source: override ? 'override' : 'timeline',
        effectiveDate: override ? dateISO : (entry?.effectiveDate || dateISO),
        entry: entry || null,
        override,
        baseTargets
    };
};

export const addGoalTimelineEntry = ({
    goals,
    effectiveDate,
    spec,
    computed,
    note,
    nowMs
}) => {
    const timeline = Array.isArray(goals?.timeline) ? [...goals.timeline] : [];
    const entry = {
        effectiveDate,
        spec,
        targets: computed.targets,
        rules: computed.rules,
        createdAt: nowMs,
        note: note || ''
    };
    timeline.push(entry);
    timeline.sort((a, b) => compareIso(a.effectiveDate, b.effectiveDate));
    return { timeline };
};

export const setGoalOverride = ({ goals, dateISO, override, nowMs }) => {
    const next = { ...(goals?.overrideByDate || {}) };
    next[dateISO] = {
        ...override,
        updatedAt: nowMs
    };
    return { overrideByDate: next };
};

export const clearGoalOverride = ({ goals, dateISO }) => {
    const next = { ...(goals?.overrideByDate || {}) };
    delete next[dateISO];
    return { overrideByDate: next };
};
