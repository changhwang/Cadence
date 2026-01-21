import { el } from '../../utils/dom.js';
import { addDays, todayIso } from '../../utils/date.js';
import { makeDateRange, shiftRange } from '../../services/analytics/period.js';
import { selectWorkoutActivity } from '../../selectors/stats/workoutStatsSelectors.js';
import { selectMuscleBalance, selectMuscleDistribution } from '../../selectors/stats/muscleStatsSelectors.js';
import { selectExerciseIndex } from '../../selectors/stats/exerciseStatsSelectors.js';
import { selectNutritionTrend } from '../../selectors/stats/nutritionStatsSelectors.js';

const STAT_TITLES = {
    ko: {
        'stats/activity': '운동 지표',
        'stats/balance': '근육 밸런스',
        'stats/distribution': '세부 자극',
        'stats/exercises': '운동 기록',
        'stats/nutrition/trend': '영양 트렌드',
        'stats/nutrition/quality': '영양 품질'
    },
    en: {
        'stats/activity': 'Activity',
        'stats/balance': 'Balance',
        'stats/distribution': 'Distribution',
        'stats/exercises': 'Exercises',
        'stats/nutrition/trend': 'Nutrition Trend',
        'stats/nutrition/quality': 'Nutrition Quality'
    }
};

const TEXT = {
    ko: {
        stats: '통계',
        rolling: '롤링',
        calendar: '달력',
        history: '히스토리',
        majorGroups: '대근육군(세트)',
        distribution: '세부 자극',
        exercises: '운동 기록',
        trend: '추이',
        list: '리스트',
        bodyMap: '바디맵',
        listLabel: '리스트',
        mapLabel: '바디맵',
        sets: '세트',
        volume: '볼륨',
        time: '시간',
        current: '현재',
        previous: '이전',
        items: '항목',
        baseline: '기준 p95',
        total: '합계',
        avg: '평균',
        coverage: '커버리지',
        qualityHold: '데이터가 더 쌓이면 활성화됩니다.',
        qualityReady: '커버리지 기준을 충족했습니다.',
        qualityNote: '식단 로그/수분 기록 기준 커버리지',
        dataReady: '데이터 커버리지 확보 후 활성화 예정입니다.',
        majorGroupsNote: '주요 근육군 기준 집계',
        noData: '기록이 없습니다.',
        searchPlaceholder: '운동 검색...'
    },
    en: {
        stats: 'Stats',
        rolling: 'Rolling',
        calendar: 'Calendar',
        history: 'History',
        majorGroups: 'Major Groups (Sets)',
        distribution: 'Distribution',
        exercises: 'Exercises',
        trend: 'Trend',
        list: 'List',
        bodyMap: 'Body Map',
        sets: 'Sets',
        volume: 'Volume',
        time: 'Time',
        current: 'Current',
        previous: 'Previous',
        items: 'Items',
        baseline: 'Baseline p95',
        total: 'Total',
        avg: 'Avg',
        coverage: 'Coverage',
        qualityHold: 'Will be enabled after data coverage improves.',
        qualityReady: 'Coverage threshold met.',
        qualityNote: 'Coverage based on diet logs and water records',
        dataReady: 'Will be enabled after data coverage improves.',
        majorGroupsNote: 'Major groups based on current metric',
        noData: 'No data.'
    }
};

const getTitle = (route, lang) => (STAT_TITLES[lang] || STAT_TITLES.ko)[route] || TEXT[lang || 'ko'].stats;
const t = (lang, key) => (TEXT[lang] || TEXT.ko)[key] || key;

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
const GROUP_LABELS = {
    ko: {
        Chest: '가슴',
        Back: '등',
        Legs: '하체',
        Shoulders: '어깨',
        Arms: '팔',
        Core: '코어',
        Other: '기타'
    },
    en: {
        Chest: 'Chest',
        Back: 'Back',
        Legs: 'Legs',
        Shoulders: 'Shoulders',
        Arms: 'Arms',
        Core: 'Core',
        Other: 'Other'
    }
};
const MUSCLE_LABELS = {
    ko: {
        upper_chest: '윗가슴',
        middle_chest: '중간가슴',
        lower_chest: '아랫가슴',
        chest: '가슴',
        lats: '광배',
        mid_back: '중부 등',
        upper_back: '상부 등',
        lower_traps: '하부 승모',
        traps: '승모',
        erectors: '척추기립근',
        quads: '대퇴사두',
        hamstrings: '햄스트링',
        glutes: '둔근',
        calves: '종아리',
        adductors: '내전근',
        abductors: '외전근',
        front_delts: '전면 삼각근',
        lateral_delts: '측면 삼각근',
        rear_delts: '후면 삼각근',
        delts: '삼각근',
        biceps: '이두',
        triceps: '삼두',
        forearms: '전완',
        grip: '전완',
        core: '코어',
        hip_flexors: '고관절 굴곡',
        abs: '복근',
        obliques: '복사근',
        Other: '기타'
    }
};
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
            t(state.lang, 'rolling')
        ),
        el(
            'button',
            {
                type: 'button',
                className: `btn btn-secondary btn-sm ${state.mode === 'calendar' ? 'is-active' : ''}`
            },
            t(state.lang, 'calendar')
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
            el('div', { className: 'stats-metric-label' }, t(state.lang, 'sets')),
            el('div', { className: 'stats-metric-value' }, formatNumber(summary.totalSets))
        ),
        el(
            'button',
            { className: `stats-metric ${state.metric === 'volume' ? 'is-active' : ''}` },
            el('div', { className: 'stats-metric-label' }, t(state.lang, 'volume')),
            el('div', { className: 'stats-metric-value' }, formatNumber(summary.totalVol, 'k'))
        ),
        el(
            'button',
            { className: `stats-metric ${state.metric === 'time' ? 'is-active' : ''}` },
            el('div', { className: 'stats-metric-label' }, t(state.lang, 'time')),
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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, t(state.lang, 'history'))),
            renderBarChart({
                items: data.timeseries,
                metricLabel: state.metric === 'sets'
                    ? t(state.lang, 'sets')
                    : state.metric === 'time'
                        ? t(state.lang, 'time')
                        : t(state.lang, 'volume')
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
        el('span', { className: 'legend-text' }, t(state.lang, 'current')),
        el('span', { className: 'legend-dot legend-previous' }),
        el('span', { className: 'legend-text' }, t(state.lang, 'previous'))
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
                    el(
                        'div',
                        { className: 'list-title' },
                        (GROUP_LABELS[state.lang] || GROUP_LABELS.ko)[group] || group
                    ),
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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, t(state.lang, 'majorGroups'))),
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
            t(state.lang, 'listLabel')
        ),
        el(
            'button',
            { className: `stats-segment-btn ${state.viewMode === 'map' ? 'is-active' : ''}` },
            t(state.lang, 'mapLabel')
        )
    );
    const metricToggle = el(
        'div',
        { className: 'stats-mode' },
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'sets' ? 'is-active' : ''}` },
            t(state.lang, 'sets')
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'volume' ? 'is-active' : ''}` },
            t(state.lang, 'volume')
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'time' ? 'is-active' : ''}` },
            t(state.lang, 'time')
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
                    el(
                        'div',
                        { className: 'list-title' },
                        (MUSCLE_LABELS[state.lang] || MUSCLE_LABELS.ko)[muscle] || muscle
                    ),
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
                el(
                    'div',
                    { className: 'body-map-label' },
                    (GROUP_LABELS[state.lang] || GROUP_LABELS.ko)[group] || group
                ),
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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, t(state.lang, 'distribution'))),
            el(
                'div',
                { className: 'list-subtitle stats-meta' },
                `${t(state.lang, 'baseline')}: ${formatNumber(baseline)} · ${t(state.lang, 'items')}: ${sorted.length}`
            ),
            cardBody
        )
    );
};

const renderExercisesView = (container, store) => {
    const state = statsState.exercises;
    const range = buildRange(state);
    const queryInput = el('input', { type: 'text', placeholder: t(state.lang, 'searchPlaceholder'), value: state.query || '' });
    const metricToggle = el(
        'div',
        { className: 'stats-mode' },
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'sets' ? 'is-active' : ''}` },
            t(state.lang, 'sets')
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'volume' ? 'is-active' : ''}` },
            t(state.lang, 'volume')
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'time' ? 'is-active' : ''}` },
            t(state.lang, 'time')
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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, t(state.lang, 'exercises'))),
            el(
                'div',
                { className: 'list-subtitle stats-meta' },
                `${t(state.lang, 'items')}: ${selectExerciseIndex(store.getState(), range, state.metric, state.sortKey, state.query).length}`
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
            state.lang === 'ko' ? '단백질' : 'Protein'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'carbG' ? 'is-active' : ''}` },
            state.lang === 'ko' ? '탄수' : 'Carb'
        ),
        el(
            'button',
            { className: `btn btn-secondary btn-sm ${state.metric === 'fatG' ? 'is-active' : ''}` },
            state.lang === 'ko' ? '지방' : 'Fat'
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
            el('div', { className: 'stats-mini-label' }, t(state.lang, 'total')),
            el('div', { className: 'stats-mini-value' }, formatNumber(data.summary?.total || 0))
        ),
        el(
            'div',
            { className: 'stats-mini-card' },
            el('div', { className: 'stats-mini-label' }, t(state.lang, 'avg')),
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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, t(state.lang, 'trend'))),
            summaryRow,
            renderBarChart({
                items: data.timeseries,
                metricLabel: state.metric
            }),
            list
        )
    );
};

const QUALITY_METRICS = [
    { key: 'sodiumMg', labelKo: '나트륨', labelEn: 'Sodium' },
    { key: 'sugarG', labelKo: '당류', labelEn: 'Sugar' },
    { key: 'fiberG', labelKo: '식이섬유', labelEn: 'Fiber' },
    { key: 'waterMl', labelKo: '수분', labelEn: 'Water' }
];

const computeQualityCoverage = ({ userdb, range }) => {
    const dates = Array.isArray(range?.dates) ? range.dates : [];
    const foodLogs = [];
    const waterDays = new Set();
    dates.forEach((dateISO) => {
        const logs = Array.isArray(userdb?.diet?.[dateISO]?.logs)
            ? userdb.diet[dateISO].logs
            : [];
        logs.forEach((log) => {
            if (log?.kind === 'water') {
                waterDays.add(dateISO);
            } else {
                foodLogs.push(log);
            }
        });
    });
    const totalFoodLogs = foodLogs.length;
    const totalDays = dates.length;
    const metrics = QUALITY_METRICS.map((metric) => {
        if (metric.key === 'waterMl') {
            const covered = totalDays > 0 ? waterDays.size : 0;
            const ratio = totalDays > 0 ? covered / totalDays : 0;
            return { ...metric, total: totalDays, covered, ratio };
        }
        const covered = totalFoodLogs > 0
            ? foodLogs.filter((log) => log?.[metric.key] !== undefined && log?.[metric.key] !== null).length
            : 0;
        const ratio = totalFoodLogs > 0 ? covered / totalFoodLogs : 0;
        return { ...metric, total: totalFoodLogs, covered, ratio };
    });
    const avgRatio = metrics.length > 0
        ? metrics.reduce((sum, item) => sum + item.ratio, 0) / metrics.length
        : 0;
    return { metrics, totalFoodLogs, totalDays, avgRatio };
};

const renderNutritionQualityView = (container, store) => {
    const state = statsState.nutrition;
    const range = buildRange(state);
    const { metrics, totalFoodLogs, totalDays, avgRatio } = computeQualityCoverage({
        userdb: store.getState().userdb,
        range
    });
    const threshold = 0.3;
    const ready = metrics.every((metric) => metric.ratio >= threshold);
    const list = el('div', { className: 'list' });
    metrics.forEach((metric) => {
        const label = state.lang === 'ko' ? metric.labelKo : metric.labelEn;
        const ratioLabel = `${Math.round(metric.ratio * 100)}%`;
        list.appendChild(
            el(
                'div',
                { className: 'list-item stats-row' },
                el('div', { className: 'list-title' }, label),
                el('div', { className: 'stats-value' }, ratioLabel)
            )
        );
    });
    const note = `${t(state.lang, 'qualityNote')} · ${totalFoodLogs} logs / ${totalDays} days`;
    container.appendChild(
        el(
            'div',
            { className: 'card stats-section' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, t(state.lang, 'coverage'))),
            el('div', { className: 'stats-range-label' }, `${Math.round(avgRatio * 100)}%`),
            el('p', { className: 'empty-state' }, ready ? t(state.lang, 'qualityReady') : t(state.lang, 'qualityHold')),
            list,
            el('div', { className: 'stats-footnote' }, note)
        )
    );
};

export const renderStatsView = (container, store, route) => {
    container.textContent = '';
    const lang = store.getState().settings.lang || 'ko';
    Object.values(statsState).forEach((state) => {
        state.lang = lang;
    });
    const title = getTitle(route, lang);
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
    if (route === 'stats/nutrition/quality') {
        container.appendChild(controls);
        renderNutritionQualityView(container, store);
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
