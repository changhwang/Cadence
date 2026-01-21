import { el } from '../../utils/dom.js';
import { addDays, todayIso } from '../../utils/date.js';
import { makeDateRange, shiftRange } from '../../services/analytics/period.js';
import { selectWorkoutActivity } from '../../selectors/stats/workoutStatsSelectors.js';
import { selectMuscleBalance, selectMuscleDistribution } from '../../selectors/stats/muscleStatsSelectors.js';
import { selectExerciseIndex } from '../../selectors/stats/exerciseStatsSelectors.js';
import { selectNutritionTrend } from '../../selectors/stats/nutritionStatsSelectors.js';

const STAT_TITLES = {
    'stats/activity': 'Activity',
    'stats/balance': 'Balance',
    'stats/distribution': 'Distribution',
    'stats/exercises': 'Exercises',
    'stats/nutrition/trend': 'Nutrition Trend',
    'stats/nutrition/quality': 'Nutrition Quality'
};

const getTitle = (route) => STAT_TITLES[route] || 'Stats';

const DEFAULT_STATE = {
    mode: 'rolling',
    spanDays: 30,
    anchorISO: todayIso(),
    calendarMonthISO: todayIso().slice(0, 7),
    metric: 'volume',
    query: ''
};

const statsState = {
    activity: { ...DEFAULT_STATE, metric: 'volume' },
    balance: { ...DEFAULT_STATE },
    distribution: { ...DEFAULT_STATE, metric: 'sets', viewMode: 'list' },
    exercises: { ...DEFAULT_STATE, metric: 'sets', sortKey: 'value' },
    nutrition: { ...DEFAULT_STATE, metric: 'kcal' }
};

const groupOrder = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Other'];
const DETAIL_TO_GROUP = {
    chest: 'Chest',
    upper_chest: 'Chest',
    middle_chest: 'Chest',
    lower_chest: 'Chest',
    lats: 'Back',
    mid_back: 'Back',
    upper_back: 'Back',
    lower_traps: 'Back',
    traps: 'Back',
    erectors: 'Back',
    quads: 'Legs',
    hamstrings: 'Legs',
    glutes: 'Legs',
    calves: 'Legs',
    adductors: 'Legs',
    abductors: 'Legs',
    front_delts: 'Shoulders',
    lateral_delts: 'Shoulders',
    rear_delts: 'Shoulders',
    delts: 'Shoulders',
    biceps: 'Arms',
    triceps: 'Arms',
    forearms: 'Arms',
    grip: 'Arms',
    core: 'Core',
    hip_flexors: 'Core',
    abs: 'Core',
    obliques: 'Core'
};

const formatNumber = (value, suffix = '') => {
    if (value === null || value === undefined) return '-';
    const num = Number(value);
    if (Number.isNaN(num)) return '-';
    if (suffix === 'k') {
        return `${(num / 1000).toFixed(1)}k`;
    }
    return `${Math.round(num)}${suffix ? ` ${suffix}` : ''}`;
};

const renderBarChart = ({ items, metricLabel }) => {
    if (!items || items.length === 0) {
        return el('div', { className: 'empty-state' }, '기록이 없습니다.');
    }
    const values = items.map((item) => Number(item.value || 0));
    const maxValue = Math.max(...values, 1);
    const width = 100;
    const height = 50;
    const barWidth = Math.max(2, (width / values.length) - 2);
    const bars = values.map((value, index) => {
        const x = (index / (values.length - 1 || 1)) * width;
        const y = height - (value / maxValue) * height;
        const h = height - y;
        return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="1" fill="var(--ios-blue)"></rect>`;
    }).join('');
    const svg = `
        <svg viewBox="0 0 ${width} 65" class="stats-chart-svg" aria-label="${metricLabel}">
            ${bars}
            <line x1="0" y1="${height}" x2="${width}" y2="${height}" stroke="#eee" stroke-width="1"></line>
            <text x="0" y="63" font-size="5" fill="#aaa">Min: 0</text>
            <text x="${width}" y="63" font-size="5" fill="#aaa" text-anchor="end">Max: ${Math.round(maxValue)}</text>
        </svg>
    `;
    return el('div', { className: 'stats-chart', innerHTML: svg });
};

const buildRange = (state) =>
    makeDateRange({
        mode: state.mode,
        anchorISO: state.anchorISO,
        spanDays: state.spanDays,
        calendarMonthISO: state.calendarMonthISO
    });

const renderPeriodControls = (state, onChange) => {
    const modeRow = el(
        'div',
        { className: 'stats-mode' },
        el(
            'button',
            {
                type: 'button',
                className: `btn btn-secondary btn-sm ${state.mode === 'rolling' ? 'is-active' : ''}`
            },
            'Rolling'
        ),
        el(
            'button',
            {
                type: 'button',
                className: `btn btn-secondary btn-sm ${state.mode === 'calendar' ? 'is-active' : ''}`
            },
            'Calendar'
        )
    );
    const rangeRow = el(
        'div',
        { className: 'stats-range' },
        el(
            'button',
            { type: 'button', className: `btn btn-secondary btn-sm ${state.spanDays === 7 ? 'is-active' : ''}` },
            '7D'
        ),
        el(
            'button',
            { type: 'button', className: `btn btn-secondary btn-sm ${state.spanDays === 30 ? 'is-active' : ''}` },
            '30D'
        ),
        el(
            'button',
            { type: 'button', className: `btn btn-secondary btn-sm ${state.spanDays === 90 ? 'is-active' : ''}` },
            '90D'
        )
    );
    const navRow = el(
        'div',
        { className: 'stats-nav' },
        el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '◀'),
        el('div', { className: 'stats-range-label' }, buildRange(state).label),
        el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '▶')
    );

    modeRow.querySelectorAll('button')[0].addEventListener('click', () => onChange({ mode: 'rolling' }));
    modeRow.querySelectorAll('button')[1].addEventListener('click', () => onChange({ mode: 'calendar' }));
    rangeRow.querySelectorAll('button')[0].addEventListener('click', () => onChange({ spanDays: 7 }));
    rangeRow.querySelectorAll('button')[1].addEventListener('click', () => onChange({ spanDays: 30 }));
    rangeRow.querySelectorAll('button')[2].addEventListener('click', () => onChange({ spanDays: 90 }));
    const navButtons = navRow.querySelectorAll('button');
    if (navButtons[0]) {
        navButtons[0].addEventListener('click', () => onChange({ shift: -1 }));
    }
    if (navButtons[1]) {
        navButtons[1].addEventListener('click', () => onChange({ shift: 1 }));
    }

    return el('div', { className: 'stats-controls' }, modeRow, state.mode === 'rolling' ? rangeRow : null, navRow);
};

const renderActivityView = (container, store) => {
    const state = statsState.activity;
    const range = buildRange(state);
    const data = selectWorkoutActivity(store.getState(), range, state.metric);
    const summary = data.summary || { totalSets: 0, totalVol: 0, totalTime: 0 };
    const metricRow = el(
        'div',
        { className: 'stats-metric-row' },
        el(
            'button',
            { className: `stats-metric ${state.metric === 'sets' ? 'is-active' : ''}` },
            el('div', { className: 'stats-metric-label' }, 'Sets'),
            el('div', { className: 'stats-metric-value' }, formatNumber(summary.totalSets))
        ),
        el(
            'button',
            { className: `stats-metric ${state.metric === 'volume' ? 'is-active' : ''}` },
            el('div', { className: 'stats-metric-label' }, 'Volume'),
            el('div', { className: 'stats-metric-value' }, formatNumber(summary.totalVol, 'k'))
        ),
        el(
            'button',
            { className: `stats-metric ${state.metric === 'time' ? 'is-active' : ''}` },
            el('div', { className: 'stats-metric-label' }, 'Time'),
            el('div', { className: 'stats-metric-value' }, formatNumber(summary.totalTime, 'm'))
        )
    );
    metricRow.querySelectorAll('button')[0].addEventListener('click', () => {
        statsState.activity.metric = 'sets';
        renderStatsView(container, store, 'stats/activity');
    });
    metricRow.querySelectorAll('button')[1].addEventListener('click', () => {
        statsState.activity.metric = 'volume';
        renderStatsView(container, store, 'stats/activity');
    });
    metricRow.querySelectorAll('button')[2].addEventListener('click', () => {
        statsState.activity.metric = 'time';
        renderStatsView(container, store, 'stats/activity');
    });

    const list = el('div', { className: 'list-group' });
    data.timeseries.forEach((item) => {
        list.appendChild(
            el(
                'div',
                { className: 'list-item stats-row' },
                el('div', { className: 'list-title' }, item.dateISO),
                el('div', { className: 'stats-value' }, formatNumber(item.value))
            )
        );
    });

    container.appendChild(metricRow);
    container.appendChild(
        el(
            'div',
            { className: 'card stats-section' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, 'History')),
            renderBarChart({
                items: data.timeseries,
                metricLabel: state.metric === 'sets' ? 'Sets' : state.metric === 'time' ? 'Time' : 'Volume'
            }),
            list
        )
    );
};

const renderBalanceView = (container, store) => {
    const state = statsState.balance;
    const range = buildRange(state);
    const prevRange = shiftRange({ range, direction: -1 });
    const data = selectMuscleBalance(store.getState(), range, prevRange);
    const groups = groupOrder;
    const legend = el(
        'div',
        { className: 'stats-legend' },
        el('span', { className: 'legend-dot legend-current' }),
        el('span', { className: 'legend-text' }, 'Current'),
        el('span', { className: 'legend-dot legend-previous' }),
        el('span', { className: 'legend-text' }, 'Previous')
    );
    const list = el('div', { className: 'list-group' });
    const maxValue = Math.max(
        ...groups.map((g) => data.current?.[g] || 0),
        ...groups.map((g) => data.previous?.[g] || 0),
        10
    );
    groups.forEach((group) => {
        const cur = data.current?.[group] || 0;
        const prev = data.previous?.[group] || 0;
        const curPct = (cur / maxValue) * 100;
        const prevPct = (prev / maxValue) * 100;
        const bar = el(
            'div',
            { className: 'balance-bar' },
            el('div', { className: 'balance-bar-prev', style: `width:${prevPct}%` }),
            el('div', { className: 'balance-bar-cur', style: `width:${curPct}%` })
        );
        list.appendChild(
            el(
                'div',
                { className: 'list-item balance-item' },
                el(
                    'div',
                    { className: 'balance-header' },
                    el('div', { className: 'list-title' }, group),
                    el('div', { className: 'list-subtitle' }, `${cur} (vs ${prev})`)
                ),
                bar
            )
        );
    });
    container.appendChild(
        el(
            'div',
            { className: 'card stats-section' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, 'Major Groups (Sets)')),
            legend,
            list,
            el(
                'div',
                { className: 'list-subtitle stats-footnote' },
                `* Comparison with previous period (${prevRange.startISO} ~ ${prevRange.endISO})`
            )
        )
    );
};

const renderDistributionView = (container, store) => {
    const state = statsState.distribution;
    const range = buildRange(state);
    const { muscles, baseline } = selectMuscleDistribution(store.getState(), range, state.metric);
    const sorted = Object.entries(muscles || {})
        .sort((a, b) => b[1][state.metric] - a[1][state.metric]);
    const list = el('div', { className: 'list-group' });
    const viewToggle = el(
        'div',
        { className: 'stats-segment' },
        el(
            'button',
            { className: `stats-segment-btn ${state.viewMode === 'list' ? 'is-active' : ''}` },
            'List'
        ),
        el(
            'button',
            { className: `stats-segment-btn ${state.viewMode === 'map' ? 'is-active' : ''}` },
            'Body Map'
        )
    );
    const metricToggle = el(
        'div',
        { className: 'stats-mode' },
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'sets' ? 'is-active' : ''}` },
            'Sets'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'volume' ? 'is-active' : ''}` },
            'Volume'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'time' ? 'is-active' : ''}` },
            'Time'
        )
    );
    metricToggle.querySelectorAll('button')[0].addEventListener('click', () => {
        statsState.distribution.metric = 'sets';
        renderStatsView(container, store, 'stats/distribution');
    });
    metricToggle.querySelectorAll('button')[1].addEventListener('click', () => {
        statsState.distribution.metric = 'volume';
        renderStatsView(container, store, 'stats/distribution');
    });
    metricToggle.querySelectorAll('button')[2].addEventListener('click', () => {
        statsState.distribution.metric = 'time';
        renderStatsView(container, store, 'stats/distribution');
    });

    sorted.forEach(([muscle, entry]) => {
        const value = entry[state.metric] || 0;
        const intensity = baseline > 0 ? Math.min(value / baseline, 1) : 0;
        list.appendChild(
            el(
                'div',
                { className: 'list-item dist-item' },
                el(
                    'div',
                    { className: 'dist-head' },
                    el('div', { className: 'list-title' }, muscle),
                    el('div', { className: 'stats-value' }, formatNumber(value))
                ),
                el(
                    'div',
                    { className: 'dist-track' },
                    el('div', {
                        className: 'dist-fill',
                        style: `background: rgba(0, 122, 255, ${0.2 + intensity * 0.8}); width:${Math.min(
                            100,
                            intensity * 100
                        )}%`
                    })
                )
            )
        );
    });
    viewToggle.querySelectorAll('button')[0].addEventListener('click', () => {
        statsState.distribution.viewMode = 'list';
        renderStatsView(container, store, 'stats/distribution');
    });
    viewToggle.querySelectorAll('button')[1].addEventListener('click', () => {
        statsState.distribution.viewMode = 'map';
        renderStatsView(container, store, 'stats/distribution');
    });

    container.appendChild(viewToggle);
    container.appendChild(metricToggle);
    const groupTotals = Object.entries(muscles || {}).reduce((acc, [key, entry]) => {
        const group = DETAIL_TO_GROUP[key] || 'Other';
        const value = entry[state.metric] || 0;
        acc[group] = (acc[group] || 0) + value;
        return acc;
    }, {});
    const mapGroups = groupOrder.filter((group) => group !== 'Other');
    const maxGroup = Math.max(...mapGroups.map((group) => groupTotals[group] || 0), 1);
    const bodyMap = el(
        'div',
        { className: 'body-map-grid' },
        ...mapGroups.map((group) => {
            const value = groupTotals[group] || 0;
            const intensity = Math.min(value / maxGroup, 1);
            return el(
                'div',
                {
                    className: 'body-map-cell',
                    style: `background: rgba(0, 122, 255, ${0.15 + intensity * 0.7});`
                },
                el('div', { className: 'body-map-label' }, group),
                el('div', { className: 'body-map-value' }, formatNumber(value))
            );
        })
    );
    const cardBody = state.viewMode === 'map'
        ? el(
            'div',
            { className: 'body-map-card' },
            bodyMap,
            el('div', { className: 'list-subtitle stats-meta' }, 'Major groups based on current metric')
        )
        : list;
    container.appendChild(
        el(
            'div',
            { className: 'card stats-section' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, 'Distribution')),
            el(
                'div',
                { className: 'list-subtitle stats-meta' },
                `Baseline p95: ${formatNumber(baseline)} · Items: ${sorted.length}`
            ),
            cardBody
        )
    );
};

const renderExercisesView = (container, store) => {
    const state = statsState.exercises;
    const range = buildRange(state);
    const queryInput = el('input', { type: 'text', placeholder: 'Search...', value: state.query || '' });
    const metricToggle = el(
        'div',
        { className: 'stats-mode' },
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'sets' ? 'is-active' : ''}` },
            'Sets'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'volume' ? 'is-active' : ''}` },
            'Volume'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'time' ? 'is-active' : ''}` },
            'Time'
        )
    );
    const list = el('div', { className: 'list-group' });
    const renderList = () => {
        list.textContent = '';
        const items = selectExerciseIndex(store.getState(), range, state.metric, state.sortKey, state.query);
        if (!items.length) {
            list.appendChild(el('p', { className: 'empty-state' }, '기록이 없습니다.'));
            return;
        }
        items.forEach((item) => {
            const value = state.metric === 'volume' ? item.volume : state.metric === 'time' ? item.time : item.sets;
            const right = el('div', { className: 'stats-value' }, formatNumber(value));
            list.appendChild(
                el(
                    'div',
                    { className: 'list-item' },
                    el(
                        'div',
                        {},
                        el('div', { className: 'list-title' }, item.name),
                        el('div', { className: 'list-subtitle' }, item.lastISO ? `최근 ${item.lastISO}` : '')
                    ),
                    right
                )
            );
        });
    };
    renderList();
    metricToggle.querySelectorAll('button')[0].addEventListener('click', () => {
        statsState.exercises.metric = 'sets';
        renderStatsView(container, store, 'stats/exercises');
    });
    metricToggle.querySelectorAll('button')[1].addEventListener('click', () => {
        statsState.exercises.metric = 'volume';
        renderStatsView(container, store, 'stats/exercises');
    });
    metricToggle.querySelectorAll('button')[2].addEventListener('click', () => {
        statsState.exercises.metric = 'time';
        renderStatsView(container, store, 'stats/exercises');
    });
    queryInput.addEventListener('input', () => {
        statsState.exercises.query = queryInput.value;
        renderStatsView(container, store, 'stats/exercises');
    });

    container.appendChild(queryInput);
    container.appendChild(metricToggle);
    container.appendChild(
        el(
            'div',
            { className: 'card stats-section' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, 'Exercises')),
            el(
                'div',
                { className: 'list-subtitle stats-meta' },
                `Items: ${selectExerciseIndex(store.getState(), range, state.metric, state.sortKey, state.query).length}`
            ),
            list
        )
    );
};

const renderNutritionTrendView = (container, store) => {
    const state = statsState.nutrition;
    const range = buildRange(state);
    const metricRow = el(
        'div',
        { className: 'stats-mode' },
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'kcal' ? 'is-active' : ''}` },
            'kcal'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'proteinG' ? 'is-active' : ''}` },
            'Protein'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'carbG' ? 'is-active' : ''}` },
            'Carb'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'fatG' ? 'is-active' : ''}` },
            'Fat'
        )
    );
    const updateMetric = (metric) => {
        statsState.nutrition.metric = metric;
        renderStatsView(container, store, 'stats/nutrition/trend');
    };
    metricRow.querySelectorAll('button')[0].addEventListener('click', () => updateMetric('kcal'));
    metricRow.querySelectorAll('button')[1].addEventListener('click', () => updateMetric('proteinG'));
    metricRow.querySelectorAll('button')[2].addEventListener('click', () => updateMetric('carbG'));
    metricRow.querySelectorAll('button')[3].addEventListener('click', () => updateMetric('fatG'));

    const data = selectNutritionTrend(store.getState(), range, state.metric);
    const summaryRow = el(
        'div',
        { className: 'stats-mini-row' },
        el(
            'div',
            { className: 'stats-mini-card' },
            el('div', { className: 'stats-mini-label' }, 'Total'),
            el('div', { className: 'stats-mini-value' }, formatNumber(data.summary?.total || 0))
        ),
        el(
            'div',
            { className: 'stats-mini-card' },
            el('div', { className: 'stats-mini-label' }, 'Avg'),
            el('div', { className: 'stats-mini-value' }, formatNumber(data.summary?.avg || 0))
        )
    );
    const list = el('div', { className: 'list-group' });
    data.timeseries.forEach((item) => {
        list.appendChild(
            el(
                'div',
                { className: 'list-item stats-row' },
                el('div', { className: 'list-title' }, item.dateISO),
                el('div', { className: 'stats-value' }, formatNumber(item.value))
            )
        );
    });
    container.appendChild(metricRow);
    container.appendChild(
        el(
            'div',
            { className: 'card stats-section' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, 'Trend')),
            summaryRow,
            renderBarChart({
                items: data.timeseries,
                metricLabel: state.metric
            }),
            list
        )
    );
};

export const renderStatsView = (container, store, route) => {
    container.textContent = '';
    const title = getTitle(route);
    const backButton = el(
        'button',
        {
            type: 'button',
            className: 'btn btn-text',
            dataset: { action: 'route', route: 'body' }
        },
        '←'
    );
    const header = el(
        'div',
        { className: 'stats-header' },
        backButton,
        el('div', { className: 'stats-title' }, title)
    );
    const routeKey = route.split('/')[1];
    const currentState = statsState[routeKey] || statsState.activity;
    const controls = renderPeriodControls(currentState, (next) => {
        if (next.mode) currentState.mode = next.mode;
        if (next.spanDays) currentState.spanDays = next.spanDays;
        if (next.shift) {
            const range = buildRange(currentState);
            const shifted = shiftRange({ range, direction: next.shift });
            currentState.mode = shifted.mode;
            currentState.spanDays = shifted.spanDays;
            currentState.anchorISO = shifted.anchorISO;
            currentState.calendarMonthISO = shifted.calendarMonthISO;
        }
        renderStatsView(container, store, route);
    });
    container.appendChild(header);
    if (routeKey === 'activity') {
        container.appendChild(controls);
        renderActivityView(container, store);
        return;
    }
    if (routeKey === 'balance') {
        container.appendChild(controls);
        renderBalanceView(container, store);
        return;
    }
    if (routeKey === 'distribution') {
        container.appendChild(controls);
        renderDistributionView(container, store);
        return;
    }
    if (routeKey === 'exercises') {
        container.appendChild(controls);
        renderExercisesView(container, store);
        return;
    }
    if (route === 'stats/nutrition/trend') {
        container.appendChild(controls);
        renderNutritionTrendView(container, store);
        return;
    }
    const placeholder = el(
        'div',
        { className: 'card' },
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '준비 중')),
        el('p', { className: 'empty-state' }, '통계 페이지는 곧 추가됩니다.')
    );
    container.appendChild(controls);
    container.appendChild(placeholder);
};
