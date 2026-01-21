import { CARDIO_DB } from '../../data/cardio.js';
import { EXERCISE_DB } from '../../data/exercises.js';
import { el } from '../../utils/dom.js';
import { fromDisplayWeight, roundWeight, toDisplayWeight } from '../../utils/units.js';
import { getLabelByLang } from '../utils/labels.js';

export const buildRoutineForm = (store, routine) => {
    const state = store.getState();
    const lang = state.settings.lang || 'ko';
    const displayUnit = state.settings.units?.workout || 'kg';
    const routineDefaults = routine?.defaults || {};
    const defaults = {
        sets: routineDefaults.sets ?? 3,
        reps: routineDefaults.reps ?? 10,
        weight: routineDefaults.weight ?? 0,
        unit: 'kg'
    };
    const defaultsById = routine?.defaultsById ? { ...routine.defaultsById } : {};
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
    const weightInput = el('input', {
        type: 'number',
        min: '0',
        step: '0.1',
        value: roundWeight(toDisplayWeight(defaults.weight, displayUnit), 1)
    });
    const unitSelect = el(
        'select',
        { disabled: true },
        el('option', { value: 'kg', selected: displayUnit === 'kg' }, 'kg'),
        el('option', { value: 'lb', selected: displayUnit === 'lb' }, 'lb')
    );

    const isCardioExercise = (exercise) => {
        if (!exercise) return false;
        if (CARDIO_DB.some((item) => item.id === exercise.id)) return true;
        if (exercise.classification === 'cardio') return true;
        if (exercise.pattern === 'cardio') return true;
        if (Array.isArray(exercise.equipment) && exercise.equipment.includes('cardio')) return true;
        return false;
    };

    const getStrengthDefaults = (id) => {
        const saved = defaultsById[id] || {};
        return {
            sets: Number(saved.sets ?? defaults.sets ?? 3),
            reps: Number(saved.reps ?? defaults.reps ?? 10),
            weight: Number(saved.weight ?? defaults.weight ?? 0),
            unit: 'kg'
        };
    };

    const getCardioDefaults = (id) => {
        const saved = defaultsById[id] || {};
        return {
            minutes: Number(saved.minutes ?? 10)
        };
    };

    const renderSelectedList = () => {
        selectedList.textContent = '';
        if (selectedOrder.length === 0) {
            selectedList.appendChild(el('p', { className: 'empty-state' }, '선택된 운동이 없습니다.'));
            return;
        }
        selectedOrder.forEach((id, index) => {
            const exercise = EXERCISE_DB.find((item) => item.id === id);
            const label = exercise ? getLabelByLang(exercise.labels, lang) : id;
            const isCardio = isCardioExercise(exercise);
            const strengthDefaults = getStrengthDefaults(id);
            const cardioDefaults = getCardioDefaults(id);
            const actionButtons = el(
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
            );
            const defaultsRow = isCardio
                ? el(
                    'div',
                    { className: 'routine-defaults' },
                    el(
                        'label',
                        { className: 'input-label' },
                        '시간(분)',
                        el('input', {
                            type: 'number',
                            min: '1',
                            value: cardioDefaults.minutes,
                            dataset: { role: 'defaults-minutes', id }
                        })
                    )
                )
                : el(
                    'div',
                    { className: 'routine-defaults' },
                    el(
                        'div',
                        { className: 'row row-gap routine-defaults-row' },
                        el('label', { className: 'input-label' }, '세트', el('input', { type: 'number', min: '1', value: strengthDefaults.sets, dataset: { role: 'defaults-sets', id } })),
                        el('label', { className: 'input-label' }, '횟수', el('input', { type: 'number', min: '1', value: strengthDefaults.reps, dataset: { role: 'defaults-reps', id } })),
                        el(
                            'label',
                            { className: 'input-label' },
                            '중량',
                            el('input', {
                                type: 'number',
                                min: '0',
                                step: '0.1',
                                value: roundWeight(toDisplayWeight(strengthDefaults.weight, displayUnit), 1),
                                dataset: { role: 'defaults-weight', id }
                            })
                        ),
                        el(
                            'label',
                            { className: 'input-label' },
                            '단위',
                            el(
                                'select',
                                { dataset: { role: 'defaults-unit', id }, disabled: true },
                                el('option', { value: 'kg', selected: displayUnit === 'kg' }, 'kg'),
                                el('option', { value: 'lb', selected: displayUnit === 'lb' }, 'lb')
                            )
                        )
                    )
                );
            selectedList.appendChild(
                el(
                    'div',
                    { className: 'list-item routine-item', dataset: { id } },
                    el(
                        'div',
                        { className: 'routine-item-head' },
                        el('div', { className: 'list-title' }, label),
                        actionButtons
                    ),
                    defaultsRow
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
    selectedList.addEventListener('input', (event) => {
        const input = event.target.closest('input, select');
        if (!input) return;
        const id = input.dataset.id;
        if (!id) return;
        const role = input.dataset.role || '';
        if (role === 'defaults-minutes') {
            const minutes = Math.max(1, Number(input.value || 1));
            defaultsById[id] = { minutes };
            return;
        }
        const next = getStrengthDefaults(id);
        if (role === 'defaults-sets') next.sets = Math.max(1, Number(input.value || next.sets));
        if (role === 'defaults-reps') next.reps = Math.max(1, Number(input.value || next.reps));
        if (role === 'defaults-weight') {
            const nextValue = fromDisplayWeight(Number(input.value || 0), displayUnit);
            next.weight = Math.max(0, Number.isNaN(nextValue) ? next.weight : nextValue);
        }
        defaultsById[id] = next;
    });

    const getValues = (form) => {
        const title = titleInput.value.trim();
        const selected = selectedOrder.slice();
        const sets = Number(setsInput.value || 0);
        const reps = Number(repsInput.value || 0);
        const weight = fromDisplayWeight(Number(weightInput.value || 0), displayUnit);
        const unit = 'kg';
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
        const nextDefaultsById = selected.reduce((acc, id) => {
            if (defaultsById[id]) acc[id] = defaultsById[id];
            return acc;
        }, {});
        return { title, selected, defaults, defaultsById: nextDefaultsById, category, tags };
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
        el('div', { className: 'list-meta' }, '루틴 기본값(미설정 운동에 적용)'),
        el('div', { className: 'row row-gap' }, setsInput, repsInput),
        el('div', { className: 'row row-gap' }, weightInput, unitSelect)
    );

    return { body, getValues };
};
