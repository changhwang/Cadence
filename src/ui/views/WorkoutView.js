import { el, text } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';

const getWorkoutEntry = (userdb, dateKey) => {
    return userdb.workout[dateKey] || { logs: [] };
};

const renderWorkoutList = (logs) => {
    if (logs.length === 0) {
        return el('p', { className: 'empty-state' }, '아직 기록이 없습니다.');
    }
    const list = el('div', { className: 'list-group' });
    logs.forEach((log) => {
        const removeButton = el(
            'button',
            {
                className: 'btn btn-secondary btn-sm',
                dataset: { action: 'workout.remove', id: log.id },
                type: 'button'
            },
            '삭제'
        );
        const editButton = el(
            'button',
            {
                className: 'btn btn-secondary btn-sm',
                dataset: { action: 'workout.edit', id: log.id },
                type: 'button'
            },
            '수정'
        );
        const meta = `${log.sets}세트 x ${log.reps}회`;
        const weightText = log.weight ? ` / ${log.weight}${log.unit}` : '';
        const item = el(
            'div',
            { className: 'list-item' },
            el(
                'div',
                {},
                el(
                    'div',
                    { className: 'list-title-row' },
                    el('div', { className: 'list-title' }, log.name),
                    el('span', { className: 'badge' }, meta)
                ),
                el('div', { className: 'list-subtitle' }, weightText ? `중량 ${weightText.trim()}` : '중량 없음')
            ),
            el('div', { className: 'list-actions' }, editButton, removeButton)
        );
        list.appendChild(item);
    });
    return list;
};

export const renderWorkoutView = (container, store) => {
    container.textContent = '';

    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.workout;
    const entry = getWorkoutEntry(userdb, dateKey);

    const header = el('h1', {}, '운동');
    const dateLabel = renderDateBar({ dateKey, dateFormat: settings.dateFormat, className: 'compact' });
    const todayButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'date.today' } },
        '오늘'
    );
    const headerWrap = el('div', { className: 'page-header-row' }, header, dateLabel, todayButton);

    const form = el(
        'form',
        { className: 'stack-form', dataset: { action: 'workout.add' } },
        el('input', { name: 'exerciseName', type: 'text', placeholder: '운동명' }),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'sets', type: 'number', min: '1', placeholder: '세트' }),
            el('input', { name: 'reps', type: 'number', min: '1', placeholder: '횟수' })
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'weight', type: 'number', min: '0', placeholder: '중량(옵션)' }),
            el(
                'select',
                { name: 'unit' },
                el('option', { value: 'kg' }, 'kg'),
                el('option', { value: 'lb' }, 'lb')
            ),
            el('button', { type: 'submit', className: 'btn btn-sm btn-inline' }, '추가')
        )
    );

    const list = renderWorkoutList(entry.logs);

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
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '기록')),
            list
        )
    );
};
