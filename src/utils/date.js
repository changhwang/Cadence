export const todayIso = () => new Date().toISOString().slice(0, 10);

export const addDays = (isoDate, offset) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
};

export const formatDisplay = (isoDate, format) => {
    if (!isoDate) return '';
    if (format === 'KO_DOTS') {
        return isoDate.replace(/-/g, '.');
    }
    return isoDate;
};
