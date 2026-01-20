export const text = (value) => document.createTextNode(value ?? '');

export const el = (tag, props = {}, ...children) => {
    const element = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
            return;
        }
        if (key === 'dataset' && value && typeof value === 'object') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
            return;
        }
        if (key === 'style' && value && typeof value === 'object') {
            Object.assign(element.style, value);
            return;
        }
        if (key in element) {
            element[key] = value;
            return;
        }
        element.setAttribute(key, value);
    });

    children.flat().forEach((child) => {
        if (child === null || child === undefined) return;
        element.appendChild(typeof child === 'string' ? text(child) : child);
    });

    return element;
};
