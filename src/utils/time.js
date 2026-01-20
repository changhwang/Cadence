const pad2 = (value) => String(value).padStart(2, '0');

export const parseTimeHHMM = (input) => {
    if (!input) return null;
    const match = String(input).trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hh = Number(match[1]);
    const mm = Number(match[2]);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
    return { hh, mm };
};

export const coerceTimeHHMM = (input, fallbackHHMM = '12:00') => {
    const parsed = parseTimeHHMM(input);
    if (!parsed) return fallbackHHMM;
    return `${pad2(parsed.hh)}:${pad2(parsed.mm)}`;
};

export const formatTimeHHMM = (timeHHMM, fmt = 'H24') => {
    const parsed = parseTimeHHMM(timeHHMM);
    if (!parsed) return '';
    const { hh, mm } = parsed;
    if (fmt === 'H12') {
        const period = hh >= 12 ? 'PM' : 'AM';
        const hour12 = hh % 12 === 0 ? 12 : hh % 12;
        return `${period} ${hour12}:${pad2(mm)}`;
    }
    return `${pad2(hh)}:${pad2(mm)}`;
};

export const timeHHMMFromDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const combineDateAndTime = (dateISO, timeHHMM) => {
    const parsed = parseTimeHHMM(timeHHMM);
    if (!parsed || !dateISO) return '';
    const { hh, mm } = parsed;
    const date = new Date(`${dateISO}T${pad2(hh)}:${pad2(mm)}:00`);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString();
};
