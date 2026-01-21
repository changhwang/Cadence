import { addDays, todayIso } from '../../utils/date.js';

const pad2 = (value) => String(value).padStart(2, '0');

const getMonthBounds = (monthISO) => {
    if (!monthISO) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const startISO = `${year}-${pad2(month)}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endISO = `${year}-${pad2(month)}-${pad2(lastDay)}`;
        return { startISO, endISO, monthISO: `${year}-${pad2(month)}` };
    }
    const [yRaw, mRaw] = monthISO.split('-');
    const year = Number(yRaw);
    const month = Number(mRaw);
    const startISO = `${year}-${pad2(month)}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endISO = `${year}-${pad2(month)}-${pad2(lastDay)}`;
    return { startISO, endISO, monthISO: `${year}-${pad2(month)}` };
};

const enumerateDates = (startISO, endISO) => {
    const dates = [];
    if (!startISO || !endISO) return dates;
    let cursor = startISO;
    while (cursor <= endISO) {
        dates.push(cursor);
        cursor = addDays(cursor, 1);
    }
    return dates;
};

export const makeDateRange = ({
    mode = 'rolling',
    anchorISO = todayIso(),
    spanDays = 30,
    calendarMonthISO = ''
} = {}) => {
    if (mode === 'calendar') {
        const { startISO, endISO, monthISO } = getMonthBounds(calendarMonthISO);
        const dates = enumerateDates(startISO, endISO);
        return {
            mode,
            spanDays,
            anchorISO,
            calendarMonthISO: monthISO,
            startISO,
            endISO,
            dates,
            label: `${startISO} ~ ${endISO}`,
            key: `calendar:${monthISO}`
        };
    }
    const safeSpan = Math.max(1, Number(spanDays || 1));
    const endISO = anchorISO || todayIso();
    const startISO = addDays(endISO, -(safeSpan - 1));
    const dates = enumerateDates(startISO, endISO);
    return {
        mode: 'rolling',
        spanDays: safeSpan,
        anchorISO: endISO,
        calendarMonthISO: '',
        startISO,
        endISO,
        dates,
        label: `${startISO} ~ ${endISO}`,
        key: `rolling:${safeSpan}:${endISO}`
    };
};

export const shiftRange = ({ range, direction = 1 }) => {
    if (!range) return makeDateRange();
    const dir = direction >= 0 ? 1 : -1;
    if (range.mode === 'calendar') {
        const [yearRaw, monthRaw] = String(range.calendarMonthISO || '').split('-');
        const year = Number(yearRaw || todayIso().slice(0, 4));
        const month = Number(monthRaw || todayIso().slice(5, 7));
        const next = new Date(year, month - 1 + dir, 1);
        const nextMonthISO = `${next.getFullYear()}-${pad2(next.getMonth() + 1)}`;
        return makeDateRange({ mode: 'calendar', calendarMonthISO: nextMonthISO });
    }
    const nextAnchor = addDays(range.anchorISO || todayIso(), dir * (range.spanDays || 1));
    return makeDateRange({
        mode: 'rolling',
        anchorISO: nextAnchor,
        spanDays: range.spanDays || 30
    });
};

export const enumerateRangeDates = (range) => {
    if (!range?.startISO || !range?.endISO) return [];
    return enumerateDates(range.startISO, range.endISO);
};
