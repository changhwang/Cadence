import { el } from '../../utils/dom.js';
import { addDays, todayIso } from '../../utils/date.js';
import { openBodyLogModal } from '../modals/bodyModals.js';
import { updateUserDb } from '../store/userDb.js';
import { roundWeight, toDisplayHeight, toDisplayWeight } from '../../utils/units.js';
import { selectWorkoutHeatmap } from '../../selectors/stats/workoutStatsSelectors.js';

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

const buildSparkline = (values, { unit, formatLabel } = {}) => {
    if (!values || values.length < 2) {
        return el('div', { className: 'empty-state' }, '기록 없음');
    }
    const width = 160;
    const height = 56;
    const padding = 6;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const stepX = (width - padding * 2) / (values.length - 1);
    const points = values.map((value, index) => {
        const x = padding + index * stepX;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return { x, y };
    });

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'sparkline');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
        'd',
        `M ${points.map((point) => `${point.x},${point.y}`).join(' L ')}`
    );
    path.setAttribute('class', 'sparkline-path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--ios-blue)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);

    const makeDot = (x, y) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', String(x));
        dot.setAttribute('cy', String(y));
        dot.setAttribute('r', '2.2');
        dot.setAttribute('fill', 'var(--ios-blue)');
        return dot;
    };
    const minIndex = values.indexOf(min);
    const maxIndex = values.indexOf(max);
    const minPoint = points[minIndex];
    const maxPoint = points[maxIndex];
    const makeLabel = (value) => {
        if (typeof formatLabel === 'function') return formatLabel(value, unit);
        return unit ? `${value} ${unit}` : String(value);
    };
    if (maxPoint) {
        svg.appendChild(makeDot(maxPoint.x, maxPoint.y));
    }
    if (minPoint) {
        svg.appendChild(makeDot(minPoint.x, minPoint.y));
    }
    const wrap = el('div', { className: 'sparkline-wrap' });
    wrap.appendChild(svg);
    if (maxPoint) {
        const xPct = (maxPoint.x / width) * 100;
        wrap.appendChild(
            el(
                'div',
                {
                    className: 'sparkline-label sparkline-label-max',
                    style: `left:${xPct}%;`
                },
                `max ${makeLabel(max)}`
            )
        );
    }
    if (minPoint) {
        const xPct = (minPoint.x / width) * 100;
        wrap.appendChild(
            el(
                'div',
                {
                    className: 'sparkline-label sparkline-label-min',
                    style: `left:${xPct}%;`
                },
                `min ${makeLabel(min)}`
            )
        );
    }
    return wrap;
};

const formatValue = (value, unit) => {
    if (value === null || value === undefined) return '-';
    const rounded = Math.round(value * 10) / 10;
    return unit ? `${rounded} ${unit}` : String(rounded);
};

const pad2 = (value) => String(value).padStart(2, '0');

const formatShortDate = (isoDate) => {
    if (!isoDate) return '';
    const [, month, day] = isoDate.split('-');
    return `${month}.${day}`;
};

const getMonthLabel = (monthISO) => {
    if (!monthISO) return '';
    const [year, month] = monthISO.split('-');
    return `${year}.${Number(month)}`;
};

const addMonths = (monthISO, offset) => {
    if (!monthISO) return '';
    const [yearRaw, monthRaw] = monthISO.split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const next = new Date(year, month - 1 + offset, 1);
    return `${next.getFullYear()}-${pad2(next.getMonth() + 1)}`;
};

const renderHeatmap = ({ monthISO, days, onSelectDate }) => {
    const grid = el('div', { className: 'heatmap-grid' });
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    weekdays.forEach((label) => grid.appendChild(el('div', { className: 'heatmap-weekday' }, label)));

    const firstDate = `${monthISO}-01`;
    const firstDay = new Date(firstDate).getDay();
    for (let i = 0; i < firstDay; i += 1) {
        grid.appendChild(el('div', { className: 'heatmap-cell is-empty' }, ''));
    }

    const today = todayIso();
    days.forEach((item) => {
        const dayLabel = Number(item.dateISO.slice(8));
        const intensity = Math.max(0, Math.min(1, Number(item.norm01 || 0)));
        const isEmpty = Number(item.value || 0) === 0;
        const isToday = item.dateISO === today;
        const cell = el(
            'div',
            {
                className: `heatmap-cell${isEmpty ? ' is-empty' : ''}${isToday ? ' is-today' : ''}`,
                style: isEmpty ? '' : `background: rgba(0, 122, 255, ${0.1 + intensity * 0.8});`
            },
            String(dayLabel)
        );
        if (typeof onSelectDate === 'function') {
            cell.addEventListener('click', () => onSelectDate(item.dateISO));
        }
        grid.appendChild(cell);
    });
    return grid;
};

let heatmapMonthISO = '';
let bodyTrendRangeDays = 30;
let activeBodyMetric = 'weight';

export const renderBodyView = (container, store) => {
    container.textContent = '';

    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.body;
    const entry = getBodyEntry(userdb, dateKey);
    const weightUnit = settings.units?.weight || 'kg';
    const heightUnit = settings.units?.height || 'cm';
    if (!heatmapMonthISO) {
        heatmapMonthISO = dateKey.slice(0, 7);
    }
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
    const displayName = userdb.profile?.name || 'User';
    const header = el('h1', {}, displayName);
    const headerWrap = el('div', { className: 'page-header-row' }, header);

    const measurementGrid = el(
        'div',
        { className: 'body-summary-grid' },
        el(
            'button',
            { className: `body-stat-box ${activeBodyMetric === 'weight' ? 'is-active' : ''}`, type: 'button' },
            el('div', { className: 'body-stat-title' }, '체중 (BMI)'),
            (() => {
                const weightLabel = formatValue(displayWeightValue(entry.weight), weightUnit);
                const weightKg = Number(entry.weight);
                const heightCm = Number(userdb.profile?.height_cm || 0);
                if (!weightKg || !heightCm) return el('div', { className: 'body-stat-value' }, weightLabel);
                const hM = heightCm / 100;
                const bmi = weightKg / (hM * hM);
                const bmiLabel = Number.isNaN(bmi) ? '' : `(${bmi.toFixed(1)})`;
                return el('div', { className: 'body-stat-value' }, `${weightLabel} ${bmiLabel}`.trim());
            })()
        ),
        el(
            'button',
            { className: `body-stat-box ${activeBodyMetric === 'waist' ? 'is-active' : ''}`, type: 'button' },
            el('div', { className: 'body-stat-title' }, '허리둘레'),
            el('div', { className: 'body-stat-value' }, formatValue(displayHeightValue(entry.waist), heightUnit))
        ),
        el(
            'button',
            { className: `body-stat-box ${activeBodyMetric === 'muscle' ? 'is-active' : ''}`, type: 'button' },
            el('div', { className: 'body-stat-title' }, '골격근량'),
            el('div', { className: 'body-stat-value' }, formatValue(displayWeightValue(entry.muscle), weightUnit))
        ),
        el(
            'button',
            { className: `body-stat-box ${activeBodyMetric === 'fat' ? 'is-active' : ''}`, type: 'button' },
            el('div', { className: 'body-stat-title' }, '체지방률'),
            el('div', { className: 'body-stat-value' }, `${entry.fat || '-'} %`)
        )
    );
    const metricButtons = measurementGrid.querySelectorAll('.body-stat-box');
    if (metricButtons[0]) metricButtons[0].addEventListener('click', () => { activeBodyMetric = 'weight'; renderBodyView(container, store); });
    if (metricButtons[1]) metricButtons[1].addEventListener('click', () => { activeBodyMetric = 'waist'; renderBodyView(container, store); });
    if (metricButtons[2]) metricButtons[2].addEventListener('click', () => { activeBodyMetric = 'muscle'; renderBodyView(container, store); });
    if (metricButtons[3]) metricButtons[3].addEventListener('click', () => { activeBodyMetric = 'fat'; renderBodyView(container, store); });

    const bodyEntries = getBodyEntries(userdb);
    const cutoff = addDays(todayIso(), -(bodyTrendRangeDays - 1));
    const filteredEntries = bodyEntries.filter((entryItem) => entryItem.date >= cutoff);
    const weightSeries = filteredEntries
        .map((entryItem) => displayWeightValue(entryItem.weight))
        .filter((value) => value !== null);
    const waistSeries = filteredEntries
        .map((entryItem) => displayHeightValue(entryItem.waist))
        .filter((value) => value !== null);
    const muscleSeries = filteredEntries
        .map((entryItem) => displayWeightValue(entryItem.muscle))
        .filter((value) => value !== null);
    const fatSeries = filteredEntries
        .map((entryItem) => {
            const value = Number(entryItem.fat);
            return Number.isNaN(value) ? null : value;
        })
        .filter((value) => value !== null);
    const metricMap = {
        weight: { label: '체중 (BMI)', unit: weightUnit, series: weightSeries },
        waist: { label: '허리둘레', unit: heightUnit, series: waistSeries },
        muscle: { label: '골격근량', unit: weightUnit, series: muscleSeries },
        fat: { label: '체지방률', unit: '%', series: fatSeries }
    };
    const activeMetric = metricMap[activeBodyMetric] || metricMap.weight;
    const rangeStart = cutoff;
    const rangeEnd = todayIso();
    const trendControls = el(
        'div',
        { className: 'stats-range' },
        el(
            'button',
            { type: 'button', className: `btn btn-secondary btn-sm ${bodyTrendRangeDays === 7 ? 'is-active' : ''}` },
            '7D'
        ),
        el(
            'button',
            { type: 'button', className: `btn btn-secondary btn-sm ${bodyTrendRangeDays === 30 ? 'is-active' : ''}` },
            '30D'
        ),
        el(
            'button',
            { type: 'button', className: `btn btn-secondary btn-sm ${bodyTrendRangeDays === 90 ? 'is-active' : ''}` },
            '90D'
        )
    );
    trendControls.querySelectorAll('button')[0].addEventListener('click', () => {
        bodyTrendRangeDays = 7;
        renderBodyView(container, store);
    });
    trendControls.querySelectorAll('button')[1].addEventListener('click', () => {
        bodyTrendRangeDays = 30;
        renderBodyView(container, store);
    });
    trendControls.querySelectorAll('button')[2].addEventListener('click', () => {
        bodyTrendRangeDays = 90;
        renderBodyView(container, store);
    });
    const logButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm' },
        '데이터 기록'
    );
    logButton.addEventListener('click', () => openBodyLogModal(store));
    const measurementCard = el(
        'div',
        { className: 'card' },
        el(
            'div',
            { className: 'card-header' },
            el('h3', { className: 'card-title' }, '신체 측정'),
            logButton
        ),
        measurementGrid,
        el('div', { className: 'body-trend-title' }, activeMetric.label),
        el('div', { className: 'body-trend-actions' }, trendControls),
        el(
            'div',
            { className: 'body-trend-box' },
            activeMetric.series.length < 2
                ? el('div', { className: 'empty-state' }, `기간 내 데이터 없음 (${bodyTrendRangeDays}D)`)
                : buildSparkline(activeMetric.series, {
                    unit: activeMetric.unit,
                    formatLabel: (value, unitLabel) => formatValue(value, unitLabel)
                })
        ),
        activeMetric.series.length < 2
            ? null
            : el(
                'div',
                { className: 'body-trend-x' },
                el('div', {}, formatShortDate(rangeStart)),
                el('div', {}, formatShortDate(rangeEnd))
            )
    );
    const heatmapDays = selectWorkoutHeatmap(store.getState(), heatmapMonthISO, 'sets', true);
    const heatmapCard = el(
        'div',
        { className: 'card' },
        el(
            'div',
            { className: 'card-header' },
            el('h3', { className: 'card-title' }, '월간 운동 현황'),
            el(
                'div',
                { className: 'row row-gap heatmap-nav' },
                el(
                    'button',
                    { type: 'button', className: 'btn btn-sm btn-ghost' },
                    '◀'
                ),
                el('div', { className: 'heatmap-title' }, getMonthLabel(heatmapMonthISO)),
                el(
                    'button',
                    { type: 'button', className: 'btn btn-sm btn-ghost' },
                    '▶'
                )
            )
        ),
        renderHeatmap({
            monthISO: heatmapMonthISO,
            days: heatmapDays,
            onSelectDate: (dateISO) => {
                updateUserDb(store, (nextDb) => {
                    nextDb.meta.selectedDate.workout = dateISO;
                });
                window.location.hash = 'workout';
            }
        })
    );

    const statsGrid = el(
        'div',
        { className: 'stats-grid' },
        el(
            'button',
            { className: 'stats-card', dataset: { action: 'route', route: 'stats/activity' } },
            el('div', { className: 'stats-icon' }, el('i', { dataset: { lucide: 'bar-chart-2' } })),
            el('div', { className: 'stats-label' }, '운동 지표')
        ),
        el(
            'button',
            { className: 'stats-card', dataset: { action: 'route', route: 'stats/balance' } },
            el('div', { className: 'stats-icon' }, el('i', { dataset: { lucide: 'scale' } })),
            el('div', { className: 'stats-label' }, '근육 밸런스')
        ),
        el(
            'button',
            { className: 'stats-card', dataset: { action: 'route', route: 'stats/distribution' } },
            el('div', { className: 'stats-icon' }, el('i', { dataset: { lucide: 'layout-grid' } })),
            el('div', { className: 'stats-label' }, '세부 자극')
        ),
        el(
            'button',
            { className: 'stats-card', dataset: { action: 'route', route: 'stats/exercises' } },
            el('div', { className: 'stats-icon' }, el('i', { dataset: { lucide: 'dumbbell' } })),
            el('div', { className: 'stats-label' }, '운동 기록')
        ),
        el(
            'button',
            { className: 'stats-card', dataset: { action: 'route', route: 'stats/nutrition/trend' } },
            el('div', { className: 'stats-icon' }, el('i', { dataset: { lucide: 'apple' } })),
            el('div', { className: 'stats-label' }, '영양 트렌드')
        ),
        el(
            'div',
            { className: 'stats-card is-reserved' },
            el('div', { className: 'stats-icon' }, el('i', { dataset: { lucide: 'beaker' } })),
            el('div', { className: 'stats-label' }, '준비중')
        )
    );
    container.appendChild(headerWrap);
    container.appendChild(measurementCard);
    container.appendChild(heatmapCard);
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '통계 바로가기')),
            statsGrid
        )
    );
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
    const navButtons = heatmapCard.querySelectorAll('.heatmap-nav .btn');
    if (navButtons.length === 2) {
        navButtons[0].addEventListener('click', () => {
            heatmapMonthISO = addMonths(heatmapMonthISO, -1);
            renderBodyView(container, store);
        });
        navButtons[1].addEventListener('click', () => {
            heatmapMonthISO = addMonths(heatmapMonthISO, 1);
            renderBodyView(container, store);
        });
    }
};
