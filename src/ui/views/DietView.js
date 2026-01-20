import { el, text } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';
import { FOOD_DB } from '../../data/foods.js';
import { getDietTotalsForDate } from '../../services/nutrition/intake.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';

const getDietEntry = (userdb, dateKey) => {
    return userdb.diet[dateKey] || { meals: [], waterMl: 0 };
};

const getLabelByLang = (labels, lang) => {
    if (!labels) return '';
    if (labels[lang]) return labels[lang];
    return labels.ko || labels.en || Object.values(labels)[0] || '';
};

const formatAmount = (meal) => {
    if (!meal.amount) return '';
    if (meal.amountUnit === 'g') return `${meal.amount}g`;
    if (meal.amountUnit === 'serving') return `${meal.amount}서빙`;
    return `${meal.amount}`;
};

    const renderMealList = (meals, lang) => {
    if (meals.length === 0) {
        return el('p', { className: 'empty-state' }, '아직 기록이 없습니다.');
    }

    const list = el('div', { className: 'list-group' });
    meals.forEach((meal) => {
        const food = meal.foodId ? FOOD_DB.find((item) => item.id === meal.foodId) : null;
        const displayName = food ? getLabelByLang(food.labels, lang) : meal.name;
        const amountText = formatAmount(meal);
        const kcalText = typeof meal.kcal === 'number' ? `${Math.round(meal.kcal)} kcal` : '';
        const fiberText =
            typeof meal.fiberG === 'number' ? `식이섬유 ${Math.round(meal.fiberG)}g` : '';
        const unsatText =
            typeof meal.unsatFatG === 'number' ? `불포화 ${Math.round(meal.unsatFatG)}g` : '';
        const meta = [amountText, kcalText, fiberText, unsatText].filter(Boolean).join(' · ');
            const tags = food?.tags ? food.tags.join(', ') : '';
            const cuisine = food?.cuisine ? food.cuisine.join(', ') : '';
            const extra = [food?.category, tags, cuisine].filter(Boolean).join(' · ');
        const editButton = el(
            'button',
            {
                className: 'btn btn-secondary btn-sm',
                dataset: { action: 'diet.edit', id: meal.id },
                type: 'button'
            },
            '수정/삭제'
        );
        const item = el(
            'div',
            { className: 'list-item' },
            el(
                'div',
                {},
                el(
                    'div',
                    { className: 'list-title-row' },
                    el('div', { className: 'list-title' }, displayName),
                    el('span', { className: 'badge' }, meal.type)
                )
            ),
            el('div', { className: 'list-actions' }, editButton)
        );
        if (meta) {
            item.firstChild.appendChild(el('div', { className: 'list-subtitle' }, meta));
        }
            if (extra) {
                item.firstChild.appendChild(el('div', { className: 'list-subtitle' }, extra));
            }
        list.appendChild(item);
    });
    return list;
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
    const targetPotassium = goal.final?.potassiumMg || 0;
    const targetWater = goal.final?.waterMl || 0;
    const progress = targetKcal > 0 ? Math.min(100, Math.round((totals.kcal / targetKcal) * 100)) : 0;
    const progressDonut = el(
        'div',
        { className: 'donut', style: `--percent: ${progress}` },
        el('div', { className: 'donut-center' }, targetKcal > 0 ? `${progress}%` : '-')
    );
    const totalMacro = (totals.proteinG || 0) + (totals.carbG || 0) + (totals.fatG || 0);
    const pct = (value) => (totalMacro > 0 ? Math.round((value / totalMacro) * 100) : 0);
    const macroDonut = el(
        'div',
        {
            className: 'nutrition-donut',
            style: `--p-protein: ${pct(totals.proteinG || 0)}%; --p-carb: ${pct(totals.carbG || 0)}%; --p-fat: ${pct(totals.fatG || 0)}%;`
        },
        el('div', { className: 'donut-center' }, totalMacro > 0 ? `${totalMacro}g` : '-')
    );

    const header = el('h1', {}, '식단');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat, className: 'compact' });
    const todayButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'date.today' } },
        '오늘'
    );
    const headerWrap = el('div', { className: 'page-header-row' }, header, dateLabel, todayButton);

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'diet.add' } },
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'select',
                { name: 'mealType' },
                el('option', { value: '아침' }, '아침'),
                el('option', { value: '점심' }, '점심'),
                el('option', { value: '저녁' }, '저녁'),
                el('option', { value: '간식' }, '간식')
            ),
            el('button', { type: 'submit', className: 'btn btn-sm btn-inline' }, '추가')
        ),
        el('input', { name: 'mealName', type: 'text', placeholder: '식단 내용을 입력하세요' }),
        el(
            'button',
            { type: 'button', className: 'btn btn-secondary btn-sm btn-inline', dataset: { action: 'diet.search' } },
            '음식 검색'
        )
    );

    const waterField = el(
        'div',
        { className: 'row row-gap' },
        el('label', { className: 'input-label' }, '물(ml)'),
        el('input', {
            type: 'number',
            min: '0',
            value: entry.waterMl || 0,
            dataset: { action: 'diet.water' }
        })
    );

    const list = renderMealList(entry.meals, settings.lang);

    container.appendChild(headerWrap);
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '영양 합산')),
            el(
                'div',
                { className: 'row row-gap' },
                el(
                    'div',
                    { className: 'donut-block' },
                    progressDonut,
                    el('div', { className: 'list-subtitle' }, '목표 대비')
                ),
                el(
                    'div',
                    { className: 'donut-block' },
                    macroDonut,
                    el('div', { className: 'list-subtitle' }, '매크로 비율')
                )
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetKcal || 0)} kcal`),
                el('div', { className: 'progress-bar', style: `--percent: ${progress}` })
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '칼로리'),
                el('div', { className: 'badge' }, `${Math.round(totals.kcal || 0)} kcal`)
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '단백질'),
                el('div', { className: 'badge' }, `${Math.round(totals.proteinG || 0)} g`)
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetProtein || 0)} g`),
                el(
                    'div',
                    {
                        className: 'progress-bar',
                        style: `--percent: ${
                            targetProtein > 0
                                ? Math.min(100, Math.round((totals.proteinG / targetProtein) * 100))
                                : 0
                        }`
                    }
                )
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '탄수'),
                el('div', { className: 'badge' }, `${Math.round(totals.carbG || 0)} g`)
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetCarb || 0)} g`),
                el(
                    'div',
                    {
                        className: 'progress-bar',
                        style: `--percent: ${
                            targetCarb > 0
                                ? Math.min(100, Math.round((totals.carbG / targetCarb) * 100))
                                : 0
                        }`
                    }
                )
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '지방'),
                el('div', { className: 'badge' }, `${Math.round(totals.fatG || 0)} g`)
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetFat || 0)} g`),
                el(
                    'div',
                    {
                        className: 'progress-bar',
                        style: `--percent: ${
                            targetFat > 0
                                ? Math.min(100, Math.round((totals.fatG / targetFat) * 100))
                                : 0
                        }`
                    }
                )
            ),
            el('div', { className: 'list-subtitle' }, '섬유/당류'),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '식이섬유'),
                el('div', { className: 'badge' }, `${Math.round(totals.fiberG || 0)} g`)
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '당'),
                el(
                    'div',
                    { className: 'badge badge-warn' },
                    `${Math.round(totals.sugarG || 0)} g`
                )
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '첨가당'),
                el(
                    'div',
                    { className: 'badge badge-warn' },
                    `${Math.round(totals.addedSugarG || 0)} g`
                )
            ),
            el('div', { className: 'list-subtitle' }, '지방산'),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '불포화지방'),
                el('div', { className: 'badge badge-ok' }, `${Math.round(totals.unsatFatG || 0)} g`)
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '포화지방'),
                el(
                    'div',
                    { className: 'badge badge-warn' },
                    `${Math.round(totals.satFatG || 0)} g`
                )
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '트랜스지방'),
                el(
                    'div',
                    { className: 'badge badge-warn' },
                    `${Math.round(totals.transFatG || 0)} g`
                )
            ),
            el('div', { className: 'list-subtitle' }, '전해질'),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '나트륨'),
                el('div', { className: 'badge' }, `${Math.round(totals.sodiumMg || 0)} mg`)
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetSodium || 0)} mg`),
                el(
                    'div',
                    {
                        className: 'progress-bar',
                        style: `--percent: ${
                            targetSodium > 0
                                ? Math.min(100, Math.round((totals.sodiumMg / targetSodium) * 100))
                                : 0
                        }`
                    }
                )
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '칼륨'),
                el('div', { className: 'badge' }, `${Math.round(totals.potassiumMg || 0)} mg`)
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetPotassium || 0)} mg`),
                el(
                    'div',
                    {
                        className: 'progress-bar',
                        style: `--percent: ${
                            targetPotassium > 0
                                ? Math.min(100, Math.round((totals.potassiumMg / targetPotassium) * 100))
                                : 0
                        }`
                    }
                )
            ),
            el('div', { className: 'list-subtitle' }, '수분'),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '물'),
                el('div', { className: 'badge' }, `${Math.round(entry.waterMl || 0)} ml`)
            ),
            el(
                'div',
                { className: 'progress-row' },
                el('div', { className: 'list-subtitle' }, `목표 ${Math.round(targetWater || 0)} ml`),
                el(
                    'div',
                    {
                        className: 'progress-bar',
                        style: `--percent: ${
                            targetWater > 0
                                ? Math.min(100, Math.round((Number(entry.waterMl || 0) / targetWater) * 100))
                                : 0
                        }`
                    }
                )
            )
        )
    );
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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '물')),
            waterField
        )
    );
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '기록')),
            list
        )
    );
};
