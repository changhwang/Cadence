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
        const setsDetail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
        const totalSets = setsDetail.length || Number(log.sets || 0);
        const totalReps = setsDetail.reduce((sum, set) => sum + Number(set.reps || 0), 0);
        const avgWeight = setsDetail.length
            ? Math.round(
                setsDetail.reduce((sum, set) => sum + Number(set.weight || 0), 0) / setsDetail.length
            )
            : Number(log.weight || 0);
        const editButton = el(
            'button',
            {
                className: 'btn btn-secondary btn-sm',
                dataset: { action: 'workout.edit', id: log.id },
                type: 'button'
            },
            '수정/삭제'
        );
        const meta = totalReps > 0 ? `${totalSets}세트 · 총 ${totalReps}회` : `${totalSets}세트`;
        const weightText = avgWeight > 0 ? `평균 ${avgWeight}${log.unit}` : '중량 없음';
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
                el('div', { className: 'list-subtitle' }, weightText)
            ),
            el('div', { className: 'list-actions' }, editButton)
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


    const list = renderWorkoutList(entry.logs);

    container.appendChild(headerWrap);
    const addButton = el(
        'button',
        { type: 'button', className: 'btn', dataset: { action: 'workout.addMenu' } },
        '추가'
    );
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '기록')),
            list
        )
    );
    container.appendChild(addButton);
};
