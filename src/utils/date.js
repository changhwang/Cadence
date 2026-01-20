export const todayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
