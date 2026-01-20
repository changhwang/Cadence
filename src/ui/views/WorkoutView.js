import { el, text } from '../../utils/dom.js';
import { renderDateBar } from '../components/DateBar.js';
import { renderDailySummary } from '../components/DailySummary.js';
import { EXERCISE_DB } from '../../data/exercises.js';
import { todayIso } from '../../utils/date.js';

const getWorkoutEntry = (userdb, dateKey) => {
    return userdb.workout[dateKey] || { logs: [] };
};

const getLabelByLang = (labels, lang) => {
    if (!labels) return '';
    if (labels[lang]) return labels[lang];
    return labels.ko || labels.en || Object.values(labels)[0] || '';
};

const computeWorkoutStats = (logs) => {
    const stats = {
        sets: 0,
        reps: 0,
        volume: 0,
        completedSets: 0,
        exerciseCount: 0
    };
    const exercises = new Set();
    logs.forEach((log) => {
        const setsDetail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
        const totalSets = setsDetail.length || Number(log.sets || 0);
        stats.sets += totalSets;
        exercises.add(log.exerciseId || log.name);
        if (setsDetail.length > 0) {
            setsDetail.forEach((set) => {
                const reps = Number(set.reps || 0);
                const weight = Number(set.weight || 0);
                stats.reps += reps;
                stats.volume += reps * weight;
                if (set.completed) stats.completedSets += 1;
            });
        } else {
            const reps = Number(log.reps || 0);
            const weight = Number(log.weight || 0);
            stats.reps += reps * totalSets;
            stats.volume += reps * totalSets * weight;
        }
    });
    stats.exerciseCount = exercises.size;
    return stats;
};

const renderWorkoutList = (logs, lang, manageMode, isToday) => {
    if (logs.length === 0) {
        return el('p', { className: 'empty-state' }, '아직 기록이 없습니다.');
    }
    const list = el('div', { className: 'list-group' });
    logs.forEach((log) => {
        const exercise = log.exerciseId
            ? EXERCISE_DB.find((item) => item.id === log.exerciseId)
            : null;
        const displayName = exercise ? getLabelByLang(exercise.labels, lang) : log.name;
        const setsDetail = Array.isArray(log.setsDetail) ? log.setsDetail : [];
        const totalSets = setsDetail.length || Number(log.sets || 0);
        const totalReps = setsDetail.reduce((sum, set) => sum + Number(set.reps || 0), 0);
        const avgWeight = setsDetail.length
            ? Math.round(
                setsDetail.reduce((sum, set) => sum + Number(set.weight || 0), 0) / setsDetail.length
            )
            : Number(log.weight || 0);
        const hasCompleted = setsDetail.some((set) => Boolean(set.completed));
        const actionButton = isToday && !hasCompleted
            ? el(
                'button',
                {
                    className: 'btn btn-secondary btn-sm',
                    dataset: { action: 'workout.detail', id: log.id },
                    type: 'button'
                },
                '시작'
            )
            : el(
                'button',
                {
                    className: 'btn btn-secondary btn-sm',
                    dataset: { action: 'workout.edit', id: log.id },
                    type: 'button'
                },
                '수정/삭제'
            );
        const setText = totalReps > 0 ? `${totalSets}세트 · ${totalReps}회` : `${totalSets}세트`;
        const weightText = avgWeight > 0 ? `평균 ${avgWeight}${log.unit}` : '중량 없음';
        const summaryText = `${setText} · ${weightText}`;
        const selectBox = manageMode
            ? el('input', {
                type: 'checkbox',
                className: 'workout-select',
                dataset: { role: 'workout-select', id: log.id }
            })
            : null;
        if (selectBox) {
            selectBox.addEventListener('click', (event) => event.stopPropagation());
        }
        const itemAttrs = manageMode ? { className: 'list-item' } : { className: 'list-item', dataset: { action: 'workout.detail', id: log.id } };
        const item = el(
            'div',
            itemAttrs,
            el(
                'div',
                {},
                el('div', { className: 'list-title' }, displayName),
                el('div', { className: 'list-subtitle' }, summaryText)
            ),
            el('div', { className: 'list-actions' }, manageMode ? selectBox : actionButton)
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


    const manageMode = Boolean(store.getState().ui.workoutManageMode);
    const isToday = dateKey === todayIso();
    const list = renderWorkoutList(entry.logs, settings.lang, manageMode, isToday);
    const stats = computeWorkoutStats(entry.logs);

    container.appendChild(headerWrap);
    container.appendChild(renderDailySummary({ userdb, settings, dateKey }));
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '통계')),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '운동 수'),
                el('div', { className: 'badge' }, String(stats.exerciseCount))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '세트'),
                el('div', { className: 'badge' }, String(stats.sets))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '완료 세트'),
                el('div', { className: 'badge' }, String(stats.completedSets))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '총 반복'),
                el('div', { className: 'badge' }, String(stats.reps))
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('div', {}, '볼륨'),
                el('div', { className: 'badge' }, `${Math.round(stats.volume)}${settings.units.workout}`)
            )
        )
    );
    const addButton = el(
        'button',
        { type: 'button', className: 'btn', dataset: { action: 'workout.addMenu' } },
        '추가'
    );
    const manageButton = el(
        'button',
        {
            type: 'button',
            className: 'btn btn-secondary btn-danger-text',
            dataset: { action: 'workout.manage.toggle' }
        },
        manageMode ? '완료' : '관리'
    );
    const deleteButton = manageMode
        ? el(
            'button',
            {
                type: 'button',
                className: 'btn btn-secondary btn-danger-text',
                dataset: { action: 'workout.delete.selected' }
            },
            '선택 삭제'
        )
        : null;
    const actionRow = manageMode
        ? el('div', { className: 'row row-gap' }, addButton, manageButton, deleteButton)
        : el('div', { className: 'row row-gap' }, addButton, manageButton);
    container.appendChild(
        el(
            'div',
            { className: 'card' },
            el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '기록')),
            manageMode ? el('div', { className: 'list-subtitle' }, '삭제할 항목을 선택하세요.') : null,
            list
        )
    );
    container.appendChild(actionRow);
};
