import { el, text } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';

const getDietEntry = (userdb, dateKey) => {
    return userdb.diet[dateKey] || { meals: [], waterMl: 0 };
};

const renderMealList = (meals) => {
    if (meals.length === 0) {
        return el('p', { className: 'empty-state' }, '아직 기록이 없습니다.');
    }

    const list = el('div', { className: 'list-group' });
    meals.forEach((meal) => {
        const removeButton = el(
            'button',
            {
                className: 'btn btn-secondary btn-sm',
                dataset: { action: 'diet.remove', id: meal.id },
                type: 'button'
            },
            '삭제'
        );
        const item = el(
            'div',
            { className: 'list-item' },
            el(
                'div',
                {},
                el('div', { className: 'list-title' }, meal.name),
                el('div', { className: 'list-subtitle' }, meal.type)
            ),
            el('div', { className: 'list-actions' }, removeButton)
        );
        list.appendChild(item);
    });
    return list;
};

export const renderDietView = (container, store) => {
    container.textContent = '';

    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.diet;
    const entry = getDietEntry(userdb, dateKey);

    const header = el('h1', {}, '식단');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat });
    const headerWrap = el('div', { className: 'page-header' }, header, dateLabel);

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
        el('input', { name: 'mealName', type: 'text', placeholder: '식단 내용을 입력하세요' })
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

    const list = renderMealList(entry.meals);

    container.appendChild(headerWrap);
    container.appendChild(el('div', { className: 'card' }, form));
    container.appendChild(el('div', { className: 'card' }, waterField));
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '기록')),
            list
        )
    );
    container.appendChild(list);
};
