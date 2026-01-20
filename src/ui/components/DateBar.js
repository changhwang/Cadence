import { el } from '../../utils/dom.js';
import { addDays, formatDisplay } from '../../utils/date.js';

export const renderDateBar = ({ dateKey, dateFormat }) => {
    const prevBtn = el(
        'button',
        {
            type: 'button',
            className: 'btn btn-secondary btn-sm',
            dataset: { action: 'date.shift', offset: '-1' }
        },
        '‹'
    );
    const nextBtn = el(
        'button',
        {
            type: 'button',
            className: 'btn btn-secondary btn-sm',
            dataset: { action: 'date.shift', offset: '1' }
        },
        '›'
    );
    const label = el('div', { className: 'date-label' }, formatDisplay(dateKey, dateFormat));

    return el('div', { className: 'date-bar' }, prevBtn, label, nextBtn);
};

export const shiftDate = (dateKey, offset) => {
    return addDays(dateKey, offset);
};
