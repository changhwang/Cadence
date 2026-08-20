export const text = (value) => document.createTextNode(value ?? '');

// 뷰가 스스로 다시 그릴 때(지표 전환 등) 내용을 비우면 스크롤이 0으로 잘린다.
// 화면 전환이 아닌 갱신에서는 보던 위치를 유지한다.
export const keepScroll = (renderFn) => (container, ...args) => {
    const scrollTop = container?.scrollTop ?? 0;
    renderFn(container, ...args);
    if (container && scrollTop) container.scrollTop = scrollTop;
};

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
