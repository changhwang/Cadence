import { el } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';
import { FOOD_DB } from '../../data/foods.js';
import { getDietTotalsForDate } from '../../services/nutrition/intake.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';
import { getLabelByLang } from '../utils/labels.js';
import { formatTimeHHMM, timeHHMMFromDate } from '../../utils/time.js';

const getDietEntry = (userdb, dateKey) => {
    return userdb.diet[dateKey] || { meals: [], waterMl: 0 };
};

const formatAmount = (meal) => {
    if (!meal.amount) return '';
    if (meal.amountUnit === 'g') return `${meal.amount}g`;
    if (meal.amountUnit === 'serving') return `${meal.amount}서빙`;
    return `${meal.amount}`;
};

const formatTime = (value, timeFormat) => {
    if (!value) return '';
    if (typeof value === 'string' && !value.includes('T')) {
        return formatTimeHHMM(value, timeFormat);
    }
    const timeHHMM = timeHHMMFromDate(value);
    if (!timeHHMM) return '';
    return formatTimeHHMM(timeHHMM, timeFormat);
};

const getTimeKey = (entry) => {
    if (entry?.timeHHMM) return entry.timeHHMM;
    if (entry?.createdAt) return timeHHMMFromDate(entry.createdAt) || entry.createdAt;
    return '';
};

const renderTimelineList = (entries, lang, manageMode, waterUnit, displayWater, timeFormat) => {
    if (entries.length === 0) {
        return el('p', { className: 'empty-state' }, '아직 기록이 없습니다.');
    }

    const list = el('div', { className: 'list-group' });
    entries.forEach((entry) => {
        const isWater = entry.kind === 'water';
        const isGroup = entry.kind === 'mealGroup';
        const items = entry.items || [];
        const names = items.map((item) => item.name).filter(Boolean);
        const displayName = isWater
            ? '물'
            : isGroup
                ? names.length > 2
                    ? `${names.slice(0, 2).join(', ')} +${names.length - 2}`
                    : names.join(', ')
                : items[0]?.name || '식사';
        const totalKcal = items.reduce((sum, item) => sum + Number(item.kcal || 0), 0);
        const waterText = isWater ? `${displayWater(entry.amountMl || 0)} ${waterUnit}` : '';
        const itemText = isWater ? waterText : displayName;
        const rightText = isWater ? '0 kcal' : `${Math.round(totalKcal)} kcal`;
        const selectId = entry.groupId || entry.groupKey || entry.id;
        const actionButton = manageMode
            ? el('input', {
                type: 'checkbox',
                className: 'workout-select',
                dataset: {
                    role: 'diet-select',
                    id: selectId,
                    kind: entry.kind
                }
            })
            : null;
        if (manageMode && actionButton) {
            actionButton.addEventListener('click', (event) => event.stopPropagation());
        }
        let dataset = null;
        if (!manageMode) {
            if (entry.kind === 'water') dataset = { action: 'diet.water.edit', id: entry.id };
            if (entry.kind === 'mealGroup') {
                dataset = {
                    action: 'diet.group.edit',
                    groupId: entry.groupId || '',
                    groupKey: entry.groupKey || '',
                    createdAt: entry.createdAt || ''
                };
            }
            if (entry.kind === 'mealSingle') dataset = { action: 'diet.edit', id: entry.id };
        }
        const item = el(
            'div',
            dataset ? { className: 'list-item timeline-item', dataset } : { className: 'list-item timeline-item' },
            el(
                'div',
                { className: 'timeline-content' },
                el(
                    'div',
                    { className: 'timeline-title-row' },
                    el('span', { className: 'timeline-label' }, formatTime(entry.timeHHMM || entry.createdAt || entry.time, timeFormat) || '-'),
                    el('span', { className: 'badge' }, isWater ? '물' : entry.type || '식사')
                ),
                el('div', { className: 'timeline-subtitle' }, itemText)
            ),
            manageMode
                ? el('div', { className: 'list-actions' }, actionButton)
                : el('div', { className: 'timeline-kcal' }, rightText)
        );
        list.appendChild(item);
    });
    return list;
};

const bucketMealType = (type) => {
    if (!type) return '식사';
    if (type === '간식') return '간식';
    if (type === '식사') return '식사';
    if (type === '아침' || type === '점심' || type === '저녁') return '식사';
    return '식사';
};

const buildTimelineLogs = (entry) => {
    if (Array.isArray(entry.logs) && entry.logs.length > 0) {
        return [...entry.logs];
    }
    const logs = (entry.meals || []).map((meal) => ({
        ...meal,
        kind: 'meal',
        createdAt: meal.createdAt || null
    }));
    if (entry.waterMl) {
        logs.push({
            id: `water-${Date.now()}`,
            kind: 'water',
            amountMl: entry.waterMl,
            createdAt: null
        });
    }
    return logs;
};

const buildTimelineEntries = (entry) => {
    const logs = buildTimelineLogs(entry).map((log) => ({
        ...log,
        timeHHMM: log.timeHHMM || timeHHMMFromDate(log.createdAt)
    }));
    const groups = new Map();
    const timeGroups = new Map();
    const entries = [];
    logs.forEach((log) => {
        if (log.kind === 'water') {
            entries.push({ ...log, kind: 'water' });
            return;
        }
        const type = bucketMealType(log.type);
        if (log.groupId) {
            if (!groups.has(log.groupId)) {
                groups.set(log.groupId, {
                    kind: 'mealGroup',
                    groupId: log.groupId,
                    type,
                    createdAt: log.groupCreatedAt || log.createdAt || null,
                    timeHHMM: log.timeHHMM || timeHHMMFromDate(log.groupCreatedAt || log.createdAt),
                    items: []
                });
            }
            groups.get(log.groupId).items.push(log);
            return;
        }
        const timeKey = getTimeKey(log);
        if (timeKey) {
            if (!timeGroups.has(timeKey)) {
                timeGroups.set(timeKey, { type, items: [] });
            }
            timeGroups.get(timeKey).items.push(log);
            return;
        }
        entries.push({
            kind: 'mealSingle',
            id: log.id,
            type,
            createdAt: log.createdAt || null,
            timeHHMM: log.timeHHMM || '',
            items: [log]
        });
    });
    timeGroups.forEach((group, timeKey) => {
        if (group.items.length > 1) {
            entries.push({
                kind: 'mealGroup',
                groupKey: `time-${timeKey}`,
                type: bucketMealType(group.items[0]?.type),
                createdAt: group.items[0]?.createdAt || null,
                timeHHMM: timeKey.includes(':') ? timeKey : timeHHMMFromDate(group.items[0]?.createdAt),
                items: group.items
            });
        } else {
            const single = group.items[0];
            entries.push({
                kind: 'mealSingle',
                id: single.id,
                type: bucketMealType(single.type),
                createdAt: single.createdAt || null,
                timeHHMM: single.timeHHMM || '',
                items: [single]
            });
        }
    });
    groups.forEach((group) => entries.push(group));
    entries.sort((a, b) => {
        const toMinutes = (value) => {
            if (!value) return null;
            const parts = String(value).split(':');
            if (parts.length !== 2) return null;
            const hh = Number(parts[0]);
            const mm = Number(parts[1]);
            if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
            return hh * 60 + mm;
        };
        const aMinutes = toMinutes(a.timeHHMM);
        const bMinutes = toMinutes(b.timeHHMM);
        if (aMinutes !== null && bMinutes !== null) return aMinutes - bMinutes;
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
    });
    return entries;
};

export const renderDietView = (container, store) => {
    container.textContent = '';

    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.diet;
    const entry = getDietEntry(userdb, dateKey);
    const totals = getDietTotalsForDate({ day: entry }).totals;
    const goal = selectGoalForDate(store.getState(), dateKey);
    const targetKcal = goal.final?.kcal || 0;
    const targetProtein = goal.final?.proteinG || 0;
    const targetCarb = goal.final?.carbG || 0;
    const targetFat = goal.final?.fatG || 0;
    const targetSodium = goal.final?.sodiumMg || 0;
    const calcWaterTarget = (weightKg) => Math.min(4500, Math.max(1500, Math.round(weightKg * 35)));
    const weightKg = Number(userdb.profile?.weightKg ?? userdb.profile?.weight_kg);
    const targetWater = goal.final?.waterMl || (weightKg ? calcWaterTarget(weightKg) : 0);
    const waterUnit = settings.units?.water || 'ml';
    const displayWater = (value) => {
        const numeric = Number(value || 0);
        if (waterUnit === 'oz') return Math.round(numeric / 29.5735);
        return Math.round(numeric);
    };
    const getHealthColor = (current, target, type) => {
        if (!target) return '#9AA3AF';
        const pct = (current / target) * 100;
        const ranges = {
            calories: { healthy: [80, 120], warning: [50, 150] },
            water: { healthy: [80, 120], warning: [50, 150] },
            protein: { healthy: [80, 120], warning: [60, 140] },
            carbs: { healthy: [70, 130], warning: [50, 160] },
            fat: { healthy: [70, 130], warning: [50, 160] },
            sodium: { healthy: [30, 100], warning: [15, 130] }
        };
        const range = ranges[type] || ranges.calories;
        if (pct >= range.healthy[0] && pct <= range.healthy[1]) return '#4ECDC4';
        if (pct >= range.warning[0] && pct <= range.warning[1]) return '#FFB347';
        return '#FF6B6B';
    };
    const buildSummaryItem = ({ icon, label, current, target, unit, type, displayValue, displayTarget, nutrientType }) => {
        const pct = target > 0 ? Math.round((current / target) * 100) : 0;
        const color = getHealthColor(current, target, type);
        return el(
            'div',
            {
                className: 'diet-summary-item',
                style: { cursor: 'pointer' },
                dataset: { action: 'diet.nutrient.detail', nutrientType }
            },
            el('div', { className: 'diet-summary-icon', style: { color } }, el('i', { dataset: { lucide: icon } })),
            el('div', { className: 'diet-summary-label' }, label),
            el('div', { className: 'diet-summary-current' }, `${displayValue ?? Math.round(current || 0)}`),
            el('div', { className: 'diet-summary-pct', style: { color } }, target > 0 ? `${pct}%` : '-'),
            el('div', { className: 'diet-summary-target' }, `/ ${displayTarget ?? Math.round(target || 0)} ${unit}`)
        );
    };

    const header = el('h1', {}, '식단');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat, className: 'compact' });
    const todayButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'date.today' } },
        '오늘'
    );
    const headerWrap = el('div', { className: 'page-header-row' }, header, dateLabel, todayButton);

    const manageMode = Boolean(store.getState().ui.dietManageMode);
    const entries = buildTimelineEntries(entry);
    const list = renderTimelineList(
        entries,
        settings.lang,
        manageMode,
        waterUnit,
        displayWater,
        settings.timeFormat
    );
    const waterTotal =
        Array.isArray(entry.logs) && entry.logs.some((log) => log.kind === 'water')
            ? entry.logs.reduce((sum, log) => sum + (log.kind === 'water' ? Number(log.amountMl || 0) : 0), 0)
            : Number(entry.waterMl || 0);
    const summaryGrid = el(
        'div',
        { className: 'diet-summary-grid' },
        buildSummaryItem({
            icon: 'flame',
            label: '칼로리',
            current: totals.kcal || 0,
            target: targetKcal,
            unit: 'kcal',
            type: 'calories',
            nutrientType: 'kcal'
        }),
        buildSummaryItem({
            icon: 'droplet',
            label: '수분',
            current: waterTotal,
            target: targetWater,
            unit: waterUnit,
            type: 'water',
            displayValue: displayWater(waterTotal),
            displayTarget: displayWater(targetWater),
            nutrientType: 'water'
        }),
        buildSummaryItem({
            icon: 'zap',
            label: '나트륨',
            current: totals.sodiumMg || 0,
            target: targetSodium,
            unit: 'mg',
            type: 'sodium',
            nutrientType: 'sodiumMg'
        }),
        buildSummaryItem({
            icon: 'drumstick',
            label: '단백질',
            current: totals.proteinG || 0,
            target: targetProtein,
            unit: 'g',
            type: 'protein',
            nutrientType: 'proteinG'
        }),
        buildSummaryItem({
            icon: 'wheat',
            label: '탄수/당',
            current: totals.carbG || 0,
            target: targetCarb,
            unit: 'g',
            type: 'carbs',
            nutrientType: 'carbG'
        }),
        buildSummaryItem({
            icon: 'droplets',
            label: '지방',
            current: totals.fatG || 0,
            target: targetFat,
            unit: 'g',
            type: 'fat',
            nutrientType: 'fatG'
        })
    );

    container.appendChild(headerWrap);
    container.appendChild(
        el(
            'div',
            { className: 'card diet-summary-card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '오늘 섭취 요약')),
            summaryGrid
        )
    );
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '기록')),
            manageMode ? el('div', { className: 'list-subtitle' }, '삭제할 항목을 선택하세요.') : null,
            list
        )
    );
    const addButton = el(
        'button',
        { type: 'button', className: 'btn', dataset: { action: 'diet.addMenu' } },
        '추가'
    );
    const manageButton = el(
        'button',
        {
            type: 'button',
            className: 'btn btn-secondary btn-danger-text',
            dataset: { action: 'diet.manage.toggle' }
        },
        manageMode ? '완료' : '관리'
    );
    const deleteButton = manageMode
        ? el(
            'button',
            {
                type: 'button',
                className: 'btn btn-secondary btn-danger-text',
                dataset: { action: 'diet.delete.selected' }
            },
            '선택 삭제'
        )
        : null;
    const actionRow = manageMode
        ? el('div', { className: 'row row-gap' }, addButton, manageButton, deleteButton)
        : el('div', { className: 'row row-gap' }, addButton, manageButton);
    container.appendChild(actionRow);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
};
