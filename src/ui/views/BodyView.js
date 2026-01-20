import { el } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';

const getBodyEntry = (userdb, dateKey) => {
    return userdb.body[dateKey] || { weight: '', waist: '', muscle: '', fat: '' };
};

export const renderBodyView = (container, store) => {
    container.textContent = '';

    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.body;
    const entry = getBodyEntry(userdb, dateKey);

    const header = el('h1', {}, '신체');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat });
    const headerWrap = el('div', { className: 'page-header' }, header, dateLabel);

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'body.save' } },
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'weight', type: 'number', min: '0', placeholder: '체중', value: entry.weight }),
            el('input', { name: 'waist', type: 'number', min: '0', placeholder: '허리둘레', value: entry.waist })
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'muscle', type: 'number', min: '0', placeholder: '골격근량', value: entry.muscle }),
            el('input', { name: 'fat', type: 'number', min: '0', placeholder: '체지방률', value: entry.fat })
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
            el('div', { className: 'list-subtitle' }, `${entry.weight || '-'} kg`)
        ),
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '허리'),
            el('div', { className: 'list-subtitle' }, `${entry.waist || '-'} cm`)
        ),
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '근량'),
            el('div', { className: 'list-subtitle' }, `${entry.muscle || '-'} kg`)
        ),
        el(
            'div',
            { className: 'list-item' },
            el('div', { className: 'list-title' }, '체지방'),
            el('div', { className: 'list-subtitle' }, `${entry.fat || '-'} %`)
        )
    );

    container.appendChild(headerWrap);
    container.appendChild(el('div', { className: 'card' }, form));
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '요약')),
            summary
        )
    );
};
