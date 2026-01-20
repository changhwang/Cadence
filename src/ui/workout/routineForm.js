import { EXERCISE_DB } from '../../data/exercises.js';
import { el } from '../../utils/dom.js';
import { getLabelByLang } from '../utils/labels.js';

export const buildRoutineForm = (store, routine) => {
    const state = store.getState();
    const lang = state.settings.lang || 'ko';
    const defaults = routine?.defaults || { sets: 3, reps: 10, weight: 0, unit: 'kg' };
    const titleInput = el('input', { type: 'text', placeholder: '루틴 이름', value: routine?.title || '' });
    const categorySelect = el(
        'select',
        {},
        el('option', { value: 'strength', selected: routine?.category === 'strength' }, '스트렝스'),
        el('option', { value: 'hypertrophy', selected: routine?.category === 'hypertrophy' }, '근비대'),
        el('option', { value: 'cardio', selected: routine?.category === 'cardio' }, '유산소'),
        el('option', { value: 'full_body', selected: routine?.category === 'full_body' }, '전신'),
        el('option', { value: 'mobility', selected: routine?.category === 'mobility' }, '유연성')
    );
    const tagsInput = el('input', {
        type: 'text',
        placeholder: '태그 (쉼표로 구분)',
        value: (routine?.tags || []).join(', ')
    });
    const searchInput = el('input', { type: 'text', placeholder: '운동 검색' });
    const list = el('div', { className: 'list-group' });
    const selectedList = el('div', { className: 'list-group' });
    const selectedOrder = Array.isArray(routine?.exerciseIds) ? [...routine.exerciseIds] : [];
    const setsInput = el('input', { type: 'number', min: '1', value: defaults.sets });
    const repsInput = el('input', { type: 'number', min: '1', value: defaults.reps });
    const weightInput = el('input', { type: 'number', min: '0', value: defaults.weight });
    const unitSelect = el(
        'select',
        {},
        el('option', { value: 'kg', selected: defaults.unit === 'kg' }, 'kg'),
        el('option', { value: 'lb', selected: defaults.unit === 'lb' }, 'lb')
    );

    const renderSelectedList = () => {
        selectedList.textContent = '';
        if (selectedOrder.length === 0) {
            selectedList.appendChild(el('p', { className: 'empty-state' }, '선택된 운동이 없습니다.'));
            return;
        }
        selectedOrder.forEach((id, index) => {
            const exercise = EXERCISE_DB.find((item) => item.id === id);
            const label = exercise ? getLabelByLang(exercise.labels, lang) : id;
            selectedList.appendChild(
                el(
                    'div',
                    { className: 'list-item', dataset: { id } },
                    el('div', { className: 'list-title' }, label),
                    el(
                        'div',
                        { className: 'list-actions' },
                        el(
                            'button',
                            {
                                type: 'button',
                                className: 'btn btn-secondary btn-sm',
                                disabled: index === 0,
                                dataset: { action: 'routine.move', dir: 'up', id }
                            },
                            '위'
                        ),
                        el(
                            'button',
                            {
                                type: 'button',
                                className: 'btn btn-secondary btn-sm',
                                disabled: index === selectedOrder.length - 1,
                                dataset: { action: 'routine.move', dir: 'down', id }
                            },
                            '아래'
                        )
                    )
                )
            );
        });
    };

    const renderList = (query = '') => {
        const lowered = query.trim().toLowerCase();
        list.textContent = '';
        EXERCISE_DB.filter((item) => {
            if (!lowered) return true;
            const label = getLabelByLang(item.labels, lang).toLowerCase();
            return label.includes(lowered) || item.id.includes(lowered);
        }).forEach((item) => {
            const label = getLabelByLang(item.labels, lang);
            const checkbox = el('input', {
                type: 'checkbox',
                value: item.id,
                checked: selectedOrder.includes(item.id)
            });
            list.appendChild(
                el(
                    'label',
                    { className: 'list-item' },
                    el('div', { className: 'list-title' }, label),
                    el('div', { className: 'list-actions' }, checkbox)
                )
            );
        });
    };

    renderList('');
    renderSelectedList();
    searchInput.addEventListener('input', (event) => renderList(event.target.value));
    list.addEventListener('change', (event) => {
        const input = event.target.closest('input[type="checkbox"]');
        if (!input) return;
        const id = input.value;
        if (!id) return;
        if (input.checked) {
            if (!selectedOrder.includes(id)) selectedOrder.push(id);
        } else {
            const index = selectedOrder.indexOf(id);
            if (index >= 0) selectedOrder.splice(index, 1);
        }
        renderSelectedList();
    });
    selectedList.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action="routine.move"]');
        if (!actionEl) return;
        const id = actionEl.dataset.id;
        const dir = actionEl.dataset.dir;
        const index = selectedOrder.indexOf(id);
        if (index < 0) return;
        if (dir === 'up' && index > 0) {
            selectedOrder.splice(index - 1, 0, selectedOrder.splice(index, 1)[0]);
        }
        if (dir === 'down' && index < selectedOrder.length - 1) {
            selectedOrder.splice(index + 1, 0, selectedOrder.splice(index, 1)[0]);
        }
        renderSelectedList();
    });

    const getValues = (form) => {
        const title = titleInput.value.trim();
        const selected = selectedOrder.slice();
        const sets = Number(setsInput.value || 0);
        const reps = Number(repsInput.value || 0);
        const weight = Number(weightInput.value || 0);
        const unit = unitSelect.value || 'kg';
        const category = categorySelect.value || 'strength';
        const tags = tagsInput.value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        const defaults = {
            sets: Number.isNaN(sets) || sets <= 0 ? 3 : sets,
            reps: Number.isNaN(reps) || reps <= 0 ? 10 : reps,
            weight: Number.isNaN(weight) ? 0 : weight,
            unit
        };
        return { title, selected, defaults, category, tags };
    };

    const body = el(
        'div',
        { className: 'stack-form' },
        titleInput,
        categorySelect,
        tagsInput,
        el('div', { className: 'list-meta' }, '루틴 운동 선택'),
        searchInput,
        list,
        el('div', { className: 'list-meta' }, '선택 순서'),
        selectedList,
        el('div', { className: 'list-meta' }, '기본 세트/횟수/중량'),
        el('div', { className: 'row row-gap' }, setsInput, repsInput),
        el('div', { className: 'row row-gap' }, weightInput, unitSelect)
    );

    return { body, getValues };
};
