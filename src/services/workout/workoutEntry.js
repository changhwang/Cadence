const toNumber = (value) => (Number.isNaN(Number(value)) ? 0 : Number(value));

export const getStrengthLogs = (entry) => (Array.isArray(entry?.logs) ? entry.logs : []);

// 유산소 로그는 과거 버전에서 cardioLogs / cardio[] 형태로 저장된 적이 있다.
export const getCardioLogs = (entry) => {
    if (!entry) return [];
    if (Array.isArray(entry.cardio?.logs)) return entry.cardio.logs;
    if (Array.isArray(entry.cardioLogs)) return entry.cardioLogs;
    if (Array.isArray(entry.cardio)) return entry.cardio;
    return [];
};

const sumCompleted = (detail) => {
    const completed = detail.filter((set) => Boolean(set.completed));
    return {
        sets: completed.length,
        volume: completed.reduce((sum, set) => sum + toNumber(set.weight) * toNumber(set.reps), 0)
    };
};

// 세트 상세가 없는 기록은 계획값(sets x reps x weight)으로 대체한다.
export const summarizeStrengthLog = (log) => {
    if (!log) return { sets: 0, volume: 0 };
    const detail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
    if (detail.length > 0) return sumCompleted(detail);
    const sets = toNumber(log.sets);
    return { sets, volume: sets * toNumber(log.reps) * toNumber(log.weight) };
};

// 실제 수행분만 집계한다(계획값 대체 없음).
export const summarizeStrengthLogPerformed = (log) => {
    if (!log) return { sets: 0, volume: 0 };
    const detail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
    if (detail.length === 0) return { sets: 0, volume: 0 };
    return sumCompleted(detail);
};

const reduceLogs = (entry, summarize) =>
    getStrengthLogs(entry).reduce(
        (acc, log) => {
            const summary = summarize(log);
            acc.sets += summary.sets;
            acc.volume += summary.volume;
            return acc;
        },
        { sets: 0, volume: 0 }
    );

export const summarizeStrengthEntry = (entry) => reduceLogs(entry, summarizeStrengthLog);

export const summarizeStrengthEntryPerformed = (entry) => reduceLogs(entry, summarizeStrengthLogPerformed);

export const summarizeCardioMinutes = (entry) =>
    getCardioLogs(entry).reduce((sum, log) => sum + toNumber(log?.minutes), 0);
