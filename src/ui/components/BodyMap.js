import { GROUP_ORDER } from '../../data/muscleGroups.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const GROUP_LABELS = {
    ko: { Chest: '가슴', Back: '등', Legs: '하체', Shoulders: '어깨', Arms: '팔', Core: '코어', Other: '기타' },
    en: { Chest: 'Chest', Back: 'Back', Legs: 'Legs', Shoulders: 'Shoulders', Arms: 'Arms', Core: 'Core', Other: 'Other' }
};

// 머리/목/골반은 데이터와 무관한 실루엣 참고용.
const NEUTRAL_FRONT = [
    { tag: 'ellipse', attrs: { cx: 60, cy: 26, rx: 15, ry: 17 } },
    { tag: 'rect', attrs: { x: 54, y: 41, width: 12, height: 10, rx: 4 } },
    { tag: 'rect', attrs: { x: 47, y: 124, width: 26, height: 16, rx: 6 } }
];

const NEUTRAL_BACK = [
    { tag: 'ellipse', attrs: { cx: 60, cy: 26, rx: 15, ry: 17 } },
    { tag: 'rect', attrs: { x: 54, y: 41, width: 12, height: 10, rx: 4 } }
];

const FRONT_REGIONS = [
    { group: 'Shoulders', name: '전면 삼각근', tag: 'ellipse', attrs: { cx: 34, cy: 62, rx: 12, ry: 11 } },
    { group: 'Shoulders', name: '전면 삼각근', tag: 'ellipse', attrs: { cx: 86, cy: 62, rx: 12, ry: 11 } },
    { group: 'Chest', name: '가슴', tag: 'rect', attrs: { x: 45, y: 53, width: 14, height: 26, rx: 6 } },
    { group: 'Chest', name: '가슴', tag: 'rect', attrs: { x: 61, y: 53, width: 14, height: 26, rx: 6 } },
    { group: 'Arms', name: '이두', tag: 'rect', attrs: { x: 22, y: 72, width: 12, height: 34, rx: 6 } },
    { group: 'Arms', name: '이두', tag: 'rect', attrs: { x: 86, y: 72, width: 12, height: 34, rx: 6 } },
    { group: 'Core', name: '복근', tag: 'rect', attrs: { x: 49, y: 82, width: 22, height: 40, rx: 8 } },
    { group: 'Core', name: '복사근', tag: 'rect', attrs: { x: 42, y: 84, width: 5, height: 34, rx: 2.5 } },
    { group: 'Core', name: '복사근', tag: 'rect', attrs: { x: 73, y: 84, width: 5, height: 34, rx: 2.5 } },
    { group: 'Arms', name: '전완', tag: 'rect', attrs: { x: 21, y: 108, width: 11, height: 32, rx: 5 } },
    { group: 'Arms', name: '전완', tag: 'rect', attrs: { x: 88, y: 108, width: 11, height: 32, rx: 5 } },
    { group: 'Legs', name: '대퇴사두', tag: 'rect', attrs: { x: 45, y: 142, width: 14, height: 48, rx: 7 } },
    { group: 'Legs', name: '대퇴사두', tag: 'rect', attrs: { x: 61, y: 142, width: 14, height: 48, rx: 7 } },
    { group: 'Legs', name: '정강이', tag: 'rect', attrs: { x: 46, y: 192, width: 12, height: 40, rx: 6 } },
    { group: 'Legs', name: '정강이', tag: 'rect', attrs: { x: 62, y: 192, width: 12, height: 40, rx: 6 } }
];

const BACK_REGIONS = [
    { group: 'Back', name: '승모근', tag: 'rect', attrs: { x: 47, y: 48, width: 26, height: 18, rx: 7 } },
    { group: 'Shoulders', name: '후면 삼각근', tag: 'ellipse', attrs: { cx: 34, cy: 62, rx: 12, ry: 11 } },
    { group: 'Shoulders', name: '후면 삼각근', tag: 'ellipse', attrs: { cx: 86, cy: 62, rx: 12, ry: 11 } },
    { group: 'Back', name: '광배근', tag: 'rect', attrs: { x: 42, y: 68, width: 13, height: 32, rx: 6 } },
    { group: 'Back', name: '광배근', tag: 'rect', attrs: { x: 65, y: 68, width: 13, height: 32, rx: 6 } },
    { group: 'Back', name: '척추기립근', tag: 'rect', attrs: { x: 56, y: 66, width: 8, height: 54, rx: 4 } },
    { group: 'Arms', name: '삼두', tag: 'rect', attrs: { x: 22, y: 72, width: 12, height: 34, rx: 6 } },
    { group: 'Arms', name: '삼두', tag: 'rect', attrs: { x: 86, y: 72, width: 12, height: 34, rx: 6 } },
    { group: 'Arms', name: '전완', tag: 'rect', attrs: { x: 21, y: 108, width: 11, height: 32, rx: 5 } },
    { group: 'Arms', name: '전완', tag: 'rect', attrs: { x: 88, y: 108, width: 11, height: 32, rx: 5 } },
    { group: 'Legs', name: '둔근', tag: 'rect', attrs: { x: 45, y: 122, width: 14, height: 22, rx: 7 } },
    { group: 'Legs', name: '둔근', tag: 'rect', attrs: { x: 61, y: 122, width: 14, height: 22, rx: 7 } },
    { group: 'Legs', name: '햄스트링', tag: 'rect', attrs: { x: 45, y: 146, width: 14, height: 44, rx: 7 } },
    { group: 'Legs', name: '햄스트링', tag: 'rect', attrs: { x: 61, y: 146, width: 14, height: 44, rx: 7 } },
    { group: 'Legs', name: '종아리', tag: 'rect', attrs: { x: 46, y: 192, width: 12, height: 40, rx: 6 } },
    { group: 'Legs', name: '종아리', tag: 'rect', attrs: { x: 62, y: 192, width: 12, height: 40, rx: 6 } }
];

const svgEl = (tag, attrs = {}) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
};

const formatValue = (value) => {
    const num = Number(value || 0);
    if (num >= 1000) return `${Math.round(num / 100) / 10}k`;
    return String(Math.round(num));
};

// 값이 없으면 옅은 회색, 있으면 최대치 대비 진하기로 칠한다.
const fillFor = (value, max) => {
    if (!value || max <= 0) return 'var(--bodymap-empty)';
    const intensity = Math.min(1, value / max);
    return `rgba(0, 122, 255, ${(0.15 + intensity * 0.75).toFixed(3)})`;
};

const buildPanel = ({ title, neutrals, regions, groupTotals, max, labels, metricLabel }) => {
    const svg = svgEl('svg', {
        class: 'body-map-svg',
        viewBox: '0 0 120 240',
        role: 'img',
        'aria-label': `${title} 근육 자극 분포`
    });

    neutrals.forEach(({ tag, attrs }) => {
        const node = svgEl(tag, attrs);
        node.setAttribute('class', 'body-map-neutral');
        svg.appendChild(node);
    });

    regions.forEach((region) => {
        const value = Number(groupTotals[region.group] || 0);
        const node = svgEl(region.tag, region.attrs);
        node.setAttribute('class', 'body-map-region');
        node.setAttribute('data-group', region.group);
        node.setAttribute('fill', fillFor(value, max));
        const label = labels[region.group] || region.group;
        const tooltip = svgEl('title');
        tooltip.textContent = `${region.name} · ${label} ${formatValue(value)}${metricLabel}`;
        node.appendChild(tooltip);
        svg.appendChild(node);
    });

    const panel = document.createElement('div');
    panel.className = 'body-map-panel';
    const caption = document.createElement('div');
    caption.className = 'body-map-caption';
    caption.textContent = title;
    panel.appendChild(svg);
    panel.appendChild(caption);
    return panel;
};

export const renderBodyMap = ({ groupTotals = {}, metric = 'sets', lang = 'ko' }) => {
    const labels = GROUP_LABELS[lang] || GROUP_LABELS.ko;
    const groups = GROUP_ORDER.filter((group) => group !== 'Other');
    const max = Math.max(...groups.map((group) => Number(groupTotals[group] || 0)), 0);
    const metricLabel = metric === 'sets' ? '세트' : metric === 'time' ? '분' : '';

    const wrap = document.createElement('div');
    wrap.className = 'body-map';

    const silhouettes = document.createElement('div');
    silhouettes.className = 'body-map-silhouette';
    silhouettes.appendChild(buildPanel({
        title: '전면', neutrals: NEUTRAL_FRONT, regions: FRONT_REGIONS, groupTotals, max, labels, metricLabel
    }));
    silhouettes.appendChild(buildPanel({
        title: '후면', neutrals: NEUTRAL_BACK, regions: BACK_REGIONS, groupTotals, max, labels, metricLabel
    }));
    wrap.appendChild(silhouettes);

    const legend = document.createElement('div');
    legend.className = 'body-map-legend';
    groups.forEach((group) => {
        const value = Number(groupTotals[group] || 0);
        const chip = document.createElement('div');
        chip.className = `body-map-chip${value > 0 ? '' : ' is-empty'}`;
        const dot = document.createElement('span');
        dot.className = 'body-map-dot';
        dot.style.background = fillFor(value, max);
        const name = document.createElement('span');
        name.className = 'body-map-chip-label';
        name.textContent = labels[group] || group;
        const amount = document.createElement('strong');
        amount.className = 'body-map-chip-value';
        amount.textContent = formatValue(value);
        chip.append(dot, name, amount);
        legend.appendChild(chip);
    });
    wrap.appendChild(legend);

    if (max <= 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = '이 기간에 기록된 운동이 없습니다.';
        wrap.appendChild(empty);
    }
    return wrap;
};
