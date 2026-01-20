export const getLabelByLang = (labels, lang) => {
    if (!labels) return '';
    if (labels[lang]) return labels[lang];
    return labels.ko || labels.en || Object.values(labels)[0] || '';
};
