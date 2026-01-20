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
    const [year, month, day] = isoDate.split('-');
    if (format === 'YMD') {
        return `${year}.${month}.${day}`;
    }
    if (format === 'MDY') {
        return `${month}/${day}/${year}`;
    }
    return isoDate;
};

export const parseDateInput = (value, format) => {
    if (!value) return '';
    const digits = value.replace(/[^\d]/g, '');
    if (digits.length !== 8) return '';

    let year;
    let month;
    let day;
    if (format === 'MDY') {
        month = digits.slice(0, 2);
        day = digits.slice(2, 4);
        year = digits.slice(4, 8);
    } else {
        year = digits.slice(0, 4);
        month = digits.slice(4, 6);
        day = digits.slice(6, 8);
    }

    const iso = `${year}-${month}-${day}`;
    const test = new Date(iso);
    if (Number.isNaN(test.getTime())) return '';
    return iso;
};
