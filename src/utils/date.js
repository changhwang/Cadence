export const todayIso = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const addDays = (isoDate, offset) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const baseUtc = Date.UTC(year, month - 1, day);
    const nextUtc = baseUtc + offset * 24 * 60 * 60 * 1000;
    return new Date(nextUtc).toISOString().slice(0, 10);
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

export const calcAge = (birthIso) => {
    if (!birthIso) return null;
    const birth = new Date(birthIso);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age;
};
