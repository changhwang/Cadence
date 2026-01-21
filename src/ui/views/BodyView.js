import { el } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';
import { roundWeight, toDisplayHeight, toDisplayWeight } from '../../utils/units.js';

const getBodyEntry = (userdb, dateKey) => {
    return userdb.body[dateKey] || { weight: '', waist: '', muscle: '', fat: '' };
};

const toNumber = (value) => {
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
};

const getBodyEntries = (userdb) => {
    const entries = Object.entries(userdb.body || {}).map(([date, data]) => ({
        date,
        weight: toNumber(data?.weight),
        waist: toNumber(data?.waist),
        muscle: toNumber(data?.muscle),
        fat: toNumber(data?.fat)
    }));
    return entries
        .filter((entry) => Boolean(entry.date))
        .sort((a, b) => a.date.localeCompare(b.date));
};

const buildSparkline = (values) => {
    if (!values || values.length < 2) {
        return el('div', { className: 'empty-state' }, '기록 없음');
    }
    const width = 160;
    const height = 44;
    const padding = 4;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = (width - padding * 2) / (values.length - 1);
    const points = values.map((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    });

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'sparkline');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${points.join(' L ')}`);
    path.setAttribute('class', 'sparkline-path');
    svg.appendChild(path);
    return svg;
};

const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '-';
    const rounded = Math.round(value * 10) / 10;
    return unit ? `${rounded} ${unit}` : String(rounded);
};

const renderTrendCard = ({ label, values, unit }) => {
    if (!values || values.length === 0) {
        return el(
            'div',
            { className: 'trend-card' },
            el('div', { className: 'trend-header' }, el('div', { className: 'list-title' }, label)),
            el('div', { className: 'empty-state' }, '기록이 없습니다.')
        );
    }
    const trimmed = values.slice(-14);
    const latest = trimmed[trimmed.length - 1];
    const max = Math.max(...trimmed);
    const avg = trimmed.reduce((sum, v) => sum + v, 0) / trimmed.length;
    const stats = el(
        'div',
        { className: 'trend-stats' },
        el('div', { className: 'trend-stat' }, el('div', { className: 'trend-stat-label' }, '최근'), el('div', { className: 'trend-stat-value' }, formatValue(latest, unit))),
        el('div', { className: 'trend-stat' }, el('div', { className: 'trend-stat-label' }, '최고'), el('div', { className: 'trend-stat-value' }, formatValue(max, unit))),
        el('div', { className: 'trend-stat' }, el('div', { className: 'trend-stat-label' }, '평균'), el('div', { className: 'trend-stat-value' }, formatValue(avg, unit)))
    );
    return el(
        'div',
        { className: 'trend-card' },
        el(
            'div',
            { className: 'trend-header' },
            el('div', { className: 'list-title' }, label),
            el('div', { className: 'trend-current' }, formatValue(latest, unit))
        ),
        buildSparkline(trimmed),
        stats
    );
};

export const renderBodyView = (container, store) => {
    container.textContent = '';

    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.body;
    const entry = getBodyEntry(userdb, dateKey);
    const weightUnit = settings.units?.weight || 'kg';
    const heightUnit = settings.units?.height || 'cm';
    const displayWeightValue = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        if (Number.isNaN(num)) return null;
        return roundWeight(toDisplayWeight(num, weightUnit), 1);
    };
    const displayHeightValue = (value) => {
        if (value === '' || value === null || value === undefined) return null;
        const num = Number(value);
        if (Number.isNaN(num)) return null;
        return roundWeight(toDisplayHeight(num, heightUnit), 1);
    };
    const displayWeightInput = (value) => {
        const display = displayWeightValue(value);
        return display === null ? '' : display;
    };
    const displayHeightInput = (value) => {
        const display = displayHeightValue(value);
        return display === null ? '' : display;
    };
    const summarizeValues = (values) => {
        if (!values || values.length === 0) {
            return { count: 0, latest: null, max: null, avg: null };
        }
        const latest = values[values.length - 1];
        const max = Math.max(...values);
        const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
        return { count: values.length, latest, max, avg };
    };
    const statRow = (label, stats, unit) => {
        const text = stats.count
            ? `최근 ${formatValue(stats.latest, unit)} · 최고 ${formatValue(stats.max, unit)} · 평균 ${formatValue(stats.avg, unit)}`
            : '기록이 없습니다.';
        return el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, label),
            el('div', { className: 'list-subtitle' }, text)
        );
    };

    const header = el('h1', {}, '신체');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat, className: 'compact' });
    const todayButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'date.today' } },
        '오늘'
    );
    const headerWrap = el('div', { className: 'page-header-row' }, header, dateLabel, todayButton);

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'body.save' } },
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'weight', type: 'number', min: '0', step: '0.1', placeholder: '체중', value: displayWeightInput(entry.weight) }),
            el('input', { name: 'waist', type: 'number', min: '0', step: '0.1', placeholder: '허리둘레', value: displayHeightInput(entry.waist) })
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'muscle', type: 'number', min: '0', step: '0.1', placeholder: '골격근량', value: displayWeightInput(entry.muscle) }),
            el('input', { name: 'fat', type: 'number', min: '0', step: '0.1', placeholder: '체지방률', value: entry.fat })
        ),
        el('button', { type: 'submit', className: 'btn' }, '저장')
    );

    const summary = el(
        'div',
        { className: 'list-group' },
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '체중'),
            el('div', { className: 'list-subtitle' }, formatValue(displayWeightValue(entry.weight), weightUnit))
        ),
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '허리'),
            el('div', { className: 'list-subtitle' }, formatValue(displayHeightValue(entry.waist), heightUnit))
        ),
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '근량'),
            el('div', { className: 'list-subtitle' }, formatValue(displayWeightValue(entry.muscle), weightUnit))
        ),
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '체지방'),
            el('div', { className: 'list-subtitle' }, `${entry.fat || '-'} %`)
        )
    );

    const bodyEntries = getBodyEntries(userdb);
    const weightSeries = bodyEntries
        .map((entry) => displayWeightValue(entry.weight))
        .filter((value) => value !== null);
    const waistSeries = bodyEntries
        .map((entry) => displayHeightValue(entry.waist))
        .filter((value) => value !== null);
    const muscleSeries = bodyEntries
        .map((entry) => displayWeightValue(entry.muscle))
        .filter((value) => value !== null);
    const waistUnit = heightUnit;
    const weightStats = summarizeValues(weightSeries);
    const waistStats = summarizeValues(waistSeries);
    const muscleStats = summarizeValues(muscleSeries);

    const trends = el(
        'div',
        { className: 'trend-grid' },
        renderTrendCard({ label: '체중', values: weightSeries, unit: weightUnit }),
        renderTrendCard({ label: '허리', values: waistSeries, unit: waistUnit }),
        renderTrendCard({ label: '근량', values: muscleSeries, unit: weightUnit })
    );
    const statsCard = el(
        'div',
        { className: 'card' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '통계')),
        el(
            'div',
            { className: 'list-group' },
            statRow('체중', weightStats, weightUnit),
            statRow('허리', waistStats, waistUnit),
            statRow('근량', muscleStats, weightUnit)
        )
    );

    container.appendChild(headerWrap);
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '입력')),
            form
        )
    );
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '요약')),
            summary
        )
    );
    container.appendChild(statsCard);
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '추이')),
            trends
        )
    );
};
