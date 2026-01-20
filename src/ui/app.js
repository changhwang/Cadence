import { renderTabBar } from './components/TabBar.js';
import { renderView } from './views/index.js';
import { buildExportPayload, downloadJson, parseImportPayload } from '../services/backupService.js';
import { shiftDate } from './components/DateBar.js';
import { calcAge, parseDateInput, todayIso } from '../utils/date.js';
import { closeModal, openModal } from './components/Modal.js';
import { openRestTimerModal } from './components/RestTimer.js';
import { openWorkoutDetailModal } from './components/WorkoutDetailModal.js';
import { el } from '../utils/dom.js';
import { ROUTINE_TEMPLATES } from '../data/routines.js';
import { EXERCISE_DB } from '../data/exercises.js';
import { FOOD_DB } from '../data/foods.js';
import { computeBaseTargets } from '../services/nutrition/targetEngine.js';
import { addGoalTimelineEntry, clearGoalOverride, setGoalOverride } from '../services/goals/goalService.js';
import { selectGoalForDate, selectSelectedDate } from '../selectors/goalSelectors.js';

const buildDefaultSets = (log) => {
    const count = Math.max(Number(log.sets || 0), 1);
    const reps = Number(log.reps || 0);
    const weight = Number(log.weight || 0);
    return Array.from({ length: count }, () => ({ reps, weight, completed: false }));
};

const createWorkoutLog = ({ name, sets, reps, weight, unit, exerciseId }) => {
    const nextLog = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name,
        exerciseId,
        sets,
        reps,
        weight: Number.isNaN(weight) ? 0 : weight,
        unit
    };
    nextLog.setsDetail = buildDefaultSets(nextLog);
    return nextLog;
};

const buildGoalModeSpec = (goal) => {
    if (goal === 'cut') return { mode: 'CUT', cutPct: 0.15 };
    if (goal === 'minicut') return { mode: 'CUT', cutPct: 0.25 };
    if (goal === 'bulk') return { mode: 'BULK', bulkPct: 0.1 };
    if (goal === 'leanbulk') return { mode: 'LEAN_BULK', bulkPct: 0.05 };
    if (goal === 'recomp') return { mode: 'RECOMP', cutPct: 0.05 };
    return { mode: 'MAINTAIN' };
};

const appendWorkoutLogs = (store, logs) => {
    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        entry.logs = entry.logs.concat(logs);
        userdb.workout[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });
};

const getLabelByLang = (labels, lang) => {
    if (!labels) return '';
    if (labels[lang]) return labels[lang];
    return labels.ko || labels.en || Object.values(labels)[0] || '';
};

const openWorkoutAddModal = (store, options = {}) => {
    const settings = store.getState().settings;
    const preferredUnit = settings.units?.workout || 'kg';
    const body = el(
        'div',
        { className: 'stack-form' },
        el(
            'label',
            { className: 'input-label' },
            '운동 이름',
            el('input', {
                name: 'exerciseName',
                type: 'text',
                placeholder: '운동명',
                value: options.initialName || ''
            })
        ),
        el('input', { name: 'exerciseId', type: 'hidden', value: options.exerciseId || '' }),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '세트 수',
                el('input', { name: 'sets', type: 'number', min: '1', value: 3 })
            ),
            el(
                'label',
                { className: 'input-label' },
                '횟수(1세트)',
                el('input', { name: 'reps', type: 'number', min: '1', value: 10 })
            )
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '중량',
                el('input', { name: 'weight', type: 'number', min: '0', value: 0 })
            ),
            el(
                'label',
                { className: 'input-label' },
                '단위',
                el(
                    'select',
                    { name: 'unit' },
                    el('option', { value: 'kg', selected: preferredUnit === 'kg' }, 'kg'),
                    el('option', { value: 'lb', selected: preferredUnit === 'lb' }, 'lb')
                )
            )
        )
    );

    openModal({
        title: '운동 추가',
        body,
        onSubmit: (form) => {
            const name = form.querySelector('[name="exerciseName"]')?.value.trim() || '';
            const sets = Number(form.querySelector('[name="sets"]')?.value || 0);
            const reps = Number(form.querySelector('[name="reps"]')?.value || 0);
            const weight = Number(form.querySelector('[name="weight"]')?.value || 0);
            const unit = form.querySelector('[name="unit"]')?.value || 'kg';
            const exerciseId = form.querySelector('[name="exerciseId"]')?.value || '';
            if (!name || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0) return false;
            const log = createWorkoutLog({ name, sets, reps, weight, unit, exerciseId });
            appendWorkoutLogs(store, [log]);
            return true;
        }
    });
};

const buildRoutineForm = (store, routine) => {
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
        const nextIndex = dir === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= selectedOrder.length) return;
        const [item] = selectedOrder.splice(index, 1);
        selectedOrder.splice(nextIndex, 0, item);
        renderSelectedList();
    });

    return {
        body: el(
            'div',
            { className: 'stack-form' },
            titleInput,
            categorySelect,
            tagsInput,
            el(
                'div',
                { className: 'row row-gap' },
                el('label', { className: 'input-label' }, '기본 세트', setsInput),
                el('label', { className: 'input-label' }, '기본 횟수', repsInput)
            ),
            el(
                'div',
                { className: 'row row-gap' },
                el('label', { className: 'input-label' }, '기본 중량', weightInput),
                el('label', { className: 'input-label' }, '단위', unitSelect)
            ),
            el('div', { className: 'list-subtitle' }, '선택된 운동'),
            selectedList,
            searchInput,
            list
        ),
        getValues: (form) => {
            const title = titleInput.value.trim();
            const selected = [...selectedOrder];
            const tags = tagsInput.value
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean);
            const defaults = {
                sets: Number(setsInput.value || 3),
                reps: Number(repsInput.value || 10),
                weight: Number(weightInput.value || 0),
                unit: unitSelect.value || 'kg'
            };
            return { title, selected, defaults, category: categorySelect.value, tags };
        }
    };
};

const openRoutineCreateModal = (store) => {
    const { body, getValues } = buildRoutineForm(store);
    openModal({
        title: '내 루틴 추가',
        body,
        submitLabel: '저장',
        onSubmit: (form) => {
            const { title, selected, defaults, category, tags } = getValues(form);
            if (!title || selected.length === 0) {
                window.alert('루틴 이름과 운동을 선택해 주세요.');
                return false;
            }
            updateUserDb(store, (nextDb) => {
                const routines = Array.isArray(nextDb.routines) ? nextDb.routines : [];
                routines.push({
                    id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                    title,
                    exerciseIds: selected,
                    defaults,
                    category,
                    tags,
                    createdAt: Date.now()
                });
                nextDb.routines = routines;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        }
    });
};

const openRoutineEditModal = (store, routine) => {
    const { body, getValues } = buildRoutineForm(store, routine);
    openModal({
        title: '루틴 수정',
        body,
        submitLabel: '저장',
        onSubmit: (form) => {
            const { title, selected, defaults, category, tags } = getValues(form);
            if (!title || selected.length === 0) {
                window.alert('루틴 이름과 운동을 선택해 주세요.');
                return false;
            }
            updateUserDb(store, (nextDb) => {
                const routines = Array.isArray(nextDb.routines) ? nextDb.routines : [];
                const target = routines.find((item) => item.id === routine.id);
                if (!target) return;
                target.title = title;
                target.exerciseIds = selected;
                target.defaults = defaults;
                target.category = category;
                target.tags = tags;
                nextDb.routines = routines;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        }
    });
};

const openWorkoutRoutineModal = (store) => {
    const state = store.getState();
    const lang = state.settings.lang || 'ko';
    const list = el('div', { className: 'list-group' });
    const userRoutines = Array.isArray(state.userdb?.routines) ? state.userdb.routines : [];
    const typeSelect = el(
        'select',
        { name: 'routineType' },
        el('option', { value: 'all' }, '전체 루틴'),
        el('option', { value: 'preset' }, '프리셋'),
        el('option', { value: 'user' }, '내 루틴')
    );
    const categorySelect = el(
        'select',
        { name: 'routineCategory' },
        el('option', { value: 'all' }, '카테고리 전체'),
        el('option', { value: 'strength' }, '스트렝스'),
        el('option', { value: 'hypertrophy' }, '근비대'),
        el('option', { value: 'cardio' }, '유산소'),
        el('option', { value: 'full_body' }, '전신'),
        el('option', { value: 'mobility' }, '모빌리티')
    );
    const searchInput = el('input', { type: 'text', placeholder: '루틴 검색' });

    const formatDefaults = (defaults) => {
        if (!defaults) return '3x10';
        return `${defaults.sets || 3}x${defaults.reps || 10}`;
    };
    const categoryLabel = (value) => {
        const map = {
            strength: '스트렝스',
            hypertrophy: '근비대',
            cardio: '유산소',
            full_body: '전신',
            mobility: '유연성'
        };
        return map[value] || value || '';
    };
    const addRoutineItem = ({ id, title, count, type, defaults, category, tags }) => {
        const meta = [
            `${count}개 운동`,
            formatDefaults(defaults),
            categoryLabel(category),
            ...(tags || [])
        ]
            .filter(Boolean)
            .join(' · ');
        list.appendChild(
            el(
                'div',
                { className: 'list-item', dataset: { action: 'routine.select', id, type } },
                el(
                    'div',
                    {},
                    el('div', { className: 'list-title' }, title),
                    el('div', { className: 'list-subtitle' }, meta)
                ),
                el(
                    'div',
                    { className: 'list-actions' },
                    type === 'user'
                        ? el(
                            'div',
                            { className: 'row row-gap' },
                            el('button', { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'routine.edit', id } }, '수정'),
                            el('button', { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'routine.delete', id } }, '삭제')
                        )
                        : el('span', { className: 'badge' }, '추가')
                )
            )
        );
    };

    const renderList = () => {
        const typeFilter = typeSelect.value;
        const categoryFilter = categorySelect.value;
        const query = searchInput.value.trim().toLowerCase();
        list.textContent = '';

        const addPreset = ([key, routine]) => {
            if (typeFilter !== 'all' && typeFilter !== 'preset') return;
            if (categoryFilter !== 'all' && routine.category !== categoryFilter) return;
            if (query && !routine.title.toLowerCase().includes(query)) return;
            addRoutineItem({
                id: key,
                title: routine.title,
                count: routine.exercises.length,
                type: 'preset',
                defaults: routine.defaults,
                category: routine.category,
                tags: routine.tags
            });
        };
        const addUser = (routine) => {
            if (typeFilter !== 'all' && typeFilter !== 'user') return;
            if (categoryFilter !== 'all' && routine.category !== categoryFilter) return;
            if (query && !routine.title.toLowerCase().includes(query)) return;
            addRoutineItem({
                id: routine.id,
                title: routine.title,
                count: routine.exerciseIds.length,
                type: 'user',
                defaults: routine.defaults,
                category: routine.category,
                tags: routine.tags
            });
        };

        Object.entries(ROUTINE_TEMPLATES).forEach(addPreset);
        userRoutines.forEach(addUser);
    };

    renderList();
    typeSelect.addEventListener('change', renderList);
    categorySelect.addEventListener('change', renderList);
    searchInput.addEventListener('input', renderList);

    list.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        const type = actionEl.dataset.type;
        const id = actionEl.dataset.id;
        const routine =
            type === 'user'
                ? userRoutines.find((item) => item.id === id)
                : ROUTINE_TEMPLATES[id];
        if (!routine) return;
        if (action === 'routine.edit') {
            openRoutineEditModal(store, routine);
            return;
        }
        if (action === 'routine.delete') {
            if (!window.confirm('이 루틴을 삭제할까요?')) return;
            updateUserDb(store, (nextDb) => {
                nextDb.routines = (nextDb.routines || []).filter((item) => item.id !== id);
                nextDb.updatedAt = new Date().toISOString();
            });
            return;
        }
        if (action !== 'routine.select') return;
        const exerciseIds = routine.exerciseIds || routine.exercises || [];
        const defaults = routine.defaults || { sets: 3, reps: 10, weight: 0, unit: 'kg' };
        const logs = exerciseIds.map((exerciseId) => {
            const exercise = EXERCISE_DB.find((item) => item.id === exerciseId);
            const name = exercise ? getLabelByLang(exercise.labels, lang) : exerciseId;
            return createWorkoutLog({
                name,
                sets: defaults.sets || 3,
                reps: defaults.reps || 10,
                weight: defaults.weight || 0,
                unit: defaults.unit || 'kg',
                exerciseId
            });
        });
        appendWorkoutLogs(store, logs);
        closeModal();
    });

    openModal({
        title: '루틴 가져오기',
        body: el(
            'div',
            { className: 'stack-form' },
            el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'routine.add' } }, '내 루틴 추가'),
            typeSelect,
            categorySelect,
            searchInput,
            list
        ),
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

const openExerciseSearchModal = (store) => {
    const state = store.getState();
    const lang = state.settings.lang || 'ko';
    const list = el('div', { className: 'list-group' });
    const searchInput = el('input', { type: 'text', placeholder: '운동 검색' });
    const filterSelect = el(
        'select',
        { name: 'exerciseFilter' },
        el('option', { value: 'all' }, '전체'),
        el('option', { value: 'chest' }, '가슴'),
        el('option', { value: 'back' }, '등'),
        el('option', { value: 'legs' }, '하체'),
        el('option', { value: 'shoulders' }, '어깨'),
        el('option', { value: 'arms' }, '팔'),
        el('option', { value: 'core' }, '코어')
    );
    const sortSelect = el(
        'select',
        { name: 'exerciseSort' },
        el('option', { value: 'name' }, '이름순'),
        el('option', { value: 'difficulty' }, '난이도순')
    );
    const patternSelect = el(
        'select',
        { name: 'exercisePattern' },
        el('option', { value: 'all' }, '패턴 전체'),
        el('option', { value: 'push_horizontal' }, '수평 푸시'),
        el('option', { value: 'push_vertical' }, '수직 푸시'),
        el('option', { value: 'pull_vertical' }, '수직 풀'),
        el('option', { value: 'pull_horizontal' }, '수평 풀'),
        el('option', { value: 'squat' }, '스쿼트'),
        el('option', { value: 'hinge' }, '힌지'),
        el('option', { value: 'core' }, '코어'),
        el('option', { value: 'mobility' }, '유연성'),
        el('option', { value: 'cardio' }, '유산소')
    );
    const difficultySelect = el(
        'select',
        { name: 'exerciseDifficulty' },
        el('option', { value: 'all' }, '난이도 전체'),
        el('option', { value: 'beginner' }, '초급'),
        el('option', { value: 'intermediate' }, '중급'),
        el('option', { value: 'advanced' }, '상급')
    );
    const muscleLabel = (key) => {
        const map = {
            chest: '가슴',
            back: '등',
            lats: '광배',
            posterior_chain: '후면',
            quads: '대퇴',
            glutes: '둔근',
            shoulders: '어깨',
            biceps: '이두',
            triceps: '삼두',
            core: '코어'
        };
        return map[key] || key;
    };
    const patternLabel = (pattern) => {
        const map = {
            push_horizontal: '수평 푸시',
            push_vertical: '수직 푸시',
            pull_vertical: '수직 풀',
            pull_horizontal: '수평 풀',
            squat: '스쿼트',
            hinge: '힌지',
            core: '코어',
            mobility: '유연성',
            cardio: '유산소'
        };
        return map[pattern] || pattern;
    };
    const equipmentLabel = (items) => {
        const map = {
            barbell: '바벨',
            bench: '벤치',
            bodyweight: '맨몸',
            bar: '바',
            dumbbell: '덤벨',
            cable: '케이블',
            machine: '머신',
            cardio: '유산소'
        };
        return (items || []).map((item) => map[item] || item).join(' · ');
    };

    const renderList = (query = '') => {
        const lowered = query.trim().toLowerCase();
        const filter = filterSelect.value;
        const pattern = patternSelect.value;
        const difficulty = difficultySelect.value;
        const sort = sortSelect.value;
        list.textContent = '';
        const items = EXERCISE_DB.filter((item) => {
            if (!lowered) return true;
            const label = getLabelByLang(item.labels, lang).toLowerCase();
            return label.includes(lowered) || item.id.includes(lowered);
        })
            .filter((item) => {
                if (filter === 'all') return true;
                const primary = item.muscle?.primary || [];
                if (filter === 'chest') return primary.includes('chest');
                if (filter === 'back') return primary.includes('back') || primary.includes('lats') || primary.includes('posterior_chain');
                if (filter === 'legs') return primary.includes('quads') || primary.includes('glutes');
                if (filter === 'shoulders') return primary.includes('shoulders');
                if (filter === 'arms') return primary.includes('biceps') || primary.includes('triceps');
                if (filter === 'core') return primary.includes('core');
                return true;
            })
            .filter((item) => (pattern === 'all' ? true : item.pattern === pattern))
            .filter((item) => (difficulty === 'all' ? true : item.difficulty === difficulty));
        const difficultyScore = (value) => {
            if (value === 'beginner') return 1;
            if (value === 'intermediate') return 2;
            if (value === 'advanced') return 3;
            return 0;
        };
        items.sort((a, b) => {
            if (sort === 'difficulty') {
                return difficultyScore(a.difficulty) - difficultyScore(b.difficulty);
            }
            const aLabel = getLabelByLang(a.labels, lang);
            const bLabel = getLabelByLang(b.labels, lang);
            return aLabel.localeCompare(bLabel);
        });
        items.forEach((item) => {
            const label = getLabelByLang(item.labels, lang);
                const primary = item.muscle?.primary || [];
                const equipment = equipmentLabel(item.equipment);
                const pattern = patternLabel(item.pattern);
                const difficultyLabel = item.difficulty
                    ? item.difficulty === 'beginner'
                        ? '초급'
                        : item.difficulty === 'intermediate'
                            ? '중급'
                            : '상급'
                    : '';
            list.appendChild(
                el(
                    'div',
                    { className: 'list-item', dataset: { action: 'exercise.select', id: item.id } },
                    el(
                        'div',
                        {},
                        el('div', { className: 'list-title' }, label),
                            el(
                                'div',
                                { className: 'list-subtitle' },
                                primary.length ? primary.map(muscleLabel).join(' · ') : '-'
                            ),
                            difficultyLabel ? el('div', { className: 'list-subtitle' }, difficultyLabel) : null,
                            equipment ? el('div', { className: 'list-subtitle' }, equipment) : null,
                            pattern ? el('div', { className: 'list-subtitle' }, pattern) : null
                    ),
                    el('div', { className: 'list-actions' }, el('span', { className: 'badge' }, '선택'))
                )
            );
        });
    };

    renderList('');
    searchInput.addEventListener('input', (event) => renderList(event.target.value));
    filterSelect.addEventListener('change', () => renderList(searchInput.value));
    patternSelect.addEventListener('change', () => renderList(searchInput.value));
    difficultySelect.addEventListener('change', () => renderList(searchInput.value));
    sortSelect.addEventListener('change', () => renderList(searchInput.value));
    list.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action="exercise.select"]');
        if (!actionEl) return;
        const id = actionEl.dataset.id;
        const exercise = EXERCISE_DB.find((item) => item.id === id);
        if (!exercise) return;
        const label = getLabelByLang(exercise.labels, lang);
        closeModal();
        openWorkoutAddModal(store, { initialName: label, exerciseId: exercise.id });
    });

    openModal({
        title: '운동 검색',
        body: el(
            'div',
            { className: 'stack-form' },
            filterSelect,
            patternSelect,
            difficultySelect,
            sortSelect,
            searchInput,
            list
        ),
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

const openFoodSearchModal = (store) => {
    const state = store.getState();
    const lang = state.settings.lang || 'ko';
    const list = el('div', { className: 'list-group' });
    const searchInput = el('input', { type: 'text', placeholder: '음식 검색' });
    const typeSelect = el(
        'select',
        { name: 'mealType' },
        el('option', { value: '아침' }, '아침'),
        el('option', { value: '점심' }, '점심'),
        el('option', { value: '저녁' }, '저녁'),
        el('option', { value: '간식' }, '간식')
    );
    const amountInput = el('input', { type: 'number', min: '0', value: 1, placeholder: '수량' });
    const unitSelect = el(
        'select',
        { name: 'foodAmountUnit' },
        el('option', { value: 'serving' }, '서빙'),
        el('option', { value: 'g' }, '그램(g)')
    );
    const categorySelect = el(
        'select',
        { name: 'foodCategory' },
        el('option', { value: 'all' }, '전체 카테고리'),
        el('option', { value: 'protein' }, '단백질'),
        el('option', { value: 'carb' }, '탄수'),
        el('option', { value: 'fat' }, '지방'),
        el('option', { value: 'fruit' }, '과일'),
        el('option', { value: 'veg' }, '채소'),
        el('option', { value: 'oil' }, '오일/소스'),
        el('option', { value: 'meal' }, '식사'),
        el('option', { value: 'snack' }, '간식')
    );
    const cuisineSelect = el(
        'select',
        { name: 'foodCuisine' },
        el('option', { value: 'all' }, '전체 지역'),
        el('option', { value: 'korean' }, '한식'),
        el('option', { value: 'japanese' }, '일식'),
        el('option', { value: 'chinese' }, '중식'),
        el('option', { value: 'western' }, '양식'),
        el('option', { value: 'global' }, '기타')
    );
    const sortSelect = el(
        'select',
        { name: 'foodSort' },
        el('option', { value: 'name' }, '이름순'),
        el('option', { value: 'kcal' }, '칼로리'),
        el('option', { value: 'protein' }, '단백질'),
        el('option', { value: 'fiber' }, '식이섬유')
    );

    const renderList = (query = '') => {
        const lowered = query.trim().toLowerCase();
        const category = categorySelect.value;
        const cuisine = cuisineSelect.value;
        list.textContent = '';
        const items = FOOD_DB.filter((item) => {
            if (!lowered) return true;
            const label = getLabelByLang(item.labels, lang).toLowerCase();
            return label.includes(lowered) || item.id.includes(lowered);
        })
            .filter((item) => (category === 'all' ? true : item.category === category))
            .filter((item) => {
                if (cuisine === 'all') return true;
                return Array.isArray(item.cuisine) ? item.cuisine.includes(cuisine) : item.cuisine === cuisine;
            });
        const getValue = (item) => {
            const n = item.nutrition || {};
            if (sortSelect.value === 'kcal') return n.kcal || 0;
            if (sortSelect.value === 'protein') return n.proteinG || 0;
            if (sortSelect.value === 'fiber') return n.fiberG || 0;
            return 0;
        };
        items.sort((a, b) => {
            if (sortSelect.value === 'name') {
                return getLabelByLang(a.labels, lang).localeCompare(getLabelByLang(b.labels, lang));
            }
            return getValue(b) - getValue(a);
        });
        items.forEach((item) => {
            const label = getLabelByLang(item.labels, lang);
            const kcal = item.nutrition?.kcal ?? '-';
            const fiber = item.nutrition?.fiberG ?? '-';
            const sugar = item.nutrition?.sugarG ?? '-';
            const satFat = item.nutrition?.satFatG ?? '-';
            const sodium = item.nutrition?.sodiumMg ?? '-';
            const potassium = item.nutrition?.potassiumMg ?? '-';
            const meta = [item.category, ...(item.cuisine || [])].filter(Boolean).join(' · ');
            list.appendChild(
                el(
                    'div',
                    { className: 'list-item', dataset: { action: 'food.select', id: item.id } },
                    el(
                        'div',
                        {},
                        el('div', { className: 'list-title' }, label),
                        el(
                            'div',
                            { className: 'list-subtitle' },
                            `기준 ${item.serving?.size || '-'}${item.serving?.unit || ''} · ${kcal} kcal`
                        ),
                        meta ? el('div', { className: 'list-subtitle' }, meta) : null,
                        el(
                            'div',
                            { className: 'list-subtitle' },
                            `식이섬유 ${fiber}g · 당 ${sugar}g · 포화지방 ${satFat}g`
                        ),
                        el(
                            'div',
                            { className: 'list-subtitle' },
                            `나트륨 ${sodium}mg · 칼륨 ${potassium}mg`
                        )
                    ),
                    el('div', { className: 'list-actions' }, el('span', { className: 'badge' }, '추가'))
                )
            );
        });
    };

    renderList('');
    searchInput.addEventListener('input', (event) => renderList(event.target.value));
    categorySelect.addEventListener('change', () => renderList(searchInput.value));
    cuisineSelect.addEventListener('change', () => renderList(searchInput.value));
    sortSelect.addEventListener('change', () => renderList(searchInput.value));
    list.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action="food.select"]');
        if (!actionEl) return;
        const id = actionEl.dataset.id;
        const food = FOOD_DB.find((item) => item.id === id);
        if (!food) return;
        const type = typeSelect.value || '기타';
        const amount = Math.max(0, Number(amountInput.value || 1));
        const unit = unitSelect.value || 'serving';
        const label = getLabelByLang(food.labels, lang);
        const per = food.nutrition || {};
        const servingSize = food.serving?.size || 1;
        const multiplier = unit === 'g' ? amount / servingSize : amount;
        const scaled = {
            kcal: (per.kcal || 0) * multiplier,
            proteinG: (per.proteinG || 0) * multiplier,
            carbG: (per.carbG || 0) * multiplier,
            fatG: (per.fatG || 0) * multiplier,
            fiberG: (per.fiberG || 0) * multiplier,
            unsatFatG: (per.unsatFatG || 0) * multiplier,
            satFatG: (per.satFatG || 0) * multiplier,
            transFatG: (per.transFatG || 0) * multiplier,
            sugarG: (per.sugarG || 0) * multiplier,
            addedSugarG: (per.addedSugarG || 0) * multiplier,
            sodiumMg: (per.sodiumMg || 0) * multiplier,
            potassiumMg: (per.potassiumMg || 0) * multiplier
        };
        updateUserDb(store, (userdb) => {
            const dateKey = userdb.meta.selectedDate.diet;
            const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
            entry.meals = entry.meals.concat({
                id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                type,
                name: label,
                foodId: food.id,
                serving: food.serving,
                nutrition: food.nutrition,
                amount,
                amountUnit: unit,
                kcal: scaled.kcal,
                proteinG: scaled.proteinG,
                carbG: scaled.carbG,
                fatG: scaled.fatG,
                fiberG: scaled.fiberG,
                unsatFatG: scaled.unsatFatG,
                satFatG: scaled.satFatG,
                transFatG: scaled.transFatG,
                sugarG: scaled.sugarG,
                addedSugarG: scaled.addedSugarG,
                sodiumMg: scaled.sodiumMg,
                potassiumMg: scaled.potassiumMg
            });
            userdb.diet[dateKey] = entry;
            userdb.updatedAt = new Date().toISOString();
        });
        closeModal();
    });

    openModal({
        title: '음식 검색',
        body: el(
            'div',
            { className: 'stack-form' },
            typeSelect,
            unitSelect,
            amountInput,
            categorySelect,
            cuisineSelect,
            sortSelect,
            searchInput,
            list
        ),
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

const openWorkoutAddMenuModal = (store) => {
    const body = el(
        'div',
        { className: 'stack-form' },
        el('button', { type: 'button', className: 'btn', dataset: { action: 'workout.search' } }, '운동 검색'),
        el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'workout.add' } }, '직접 입력'),
        el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'workout.routine' } }, '루틴 가져오기')
    );

    body.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'workout.add') {
            closeModal();
            openWorkoutAddModal(store);
        }
        if (action === 'workout.search') {
            closeModal();
            openExerciseSearchModal(store);
        }
        if (action === 'workout.routine') {
            closeModal();
            openWorkoutRoutineModal(store);
        }
    });

    openModal({
        title: '추가',
        body,
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

const openGoalOverrideModal = (store, { dateISO }) => {
    const state = store.getState();
    const goal = selectGoalForDate(state, dateISO);
    if (!goal.base || !goal.base.kcal) {
        window.alert('목표가 없습니다. 먼저 목표를 저장하세요.');
        return;
    }

    const override = state.userdb?.goals?.overrideByDate?.[dateISO] || null;
    const baseTargets = goal.base || {};
    const currentTargets = override?.targets || baseTargets;

    const body = el(
        'div',
        { className: 'stack-form' },
        el('input', { name: 'kcal', type: 'number', min: '0', value: currentTargets.kcal ?? baseTargets.kcal, placeholder: 'kcal' }),
        el('input', { name: 'proteinG', type: 'number', min: '0', value: currentTargets.proteinG ?? baseTargets.proteinG, placeholder: '단백질(g)' }),
        el('input', { name: 'carbG', type: 'number', min: '0', value: currentTargets.carbG ?? baseTargets.carbG, placeholder: '탄수(g)' }),
        el('input', { name: 'fatG', type: 'number', min: '0', value: currentTargets.fatG ?? baseTargets.fatG, placeholder: '지방(g)' })
    );

    openModal({
        title: '이 날짜만 목표 수정',
        body,
        onSubmit: (form) => {
            const getValue = (name, fallback) => {
                const raw = form.querySelector(`[name="${name}"]`)?.value ?? '';
                if (raw === '') return fallback;
                const value = Number(raw);
                if (Number.isNaN(value)) return fallback;
                return Math.max(0, value);
            };
            const kcal = getValue('kcal', currentTargets.kcal ?? baseTargets.kcal ?? 0);
            const proteinG = getValue('proteinG', currentTargets.proteinG ?? baseTargets.proteinG ?? 0);
            const carbG = getValue('carbG', currentTargets.carbG ?? baseTargets.carbG ?? 0);
            const fatG = getValue('fatG', currentTargets.fatG ?? baseTargets.fatG ?? 0);
            updateUserDb(store, (nextDb) => {
                const { overrideByDate } = setGoalOverride({
                    goals: nextDb.goals,
                    dateISO,
                    override: {
                        targets: { kcal, proteinG, carbG, fatG },
                        locked: true
                    },
                    nowMs: Date.now()
                });
                nextDb.goals.overrideByDate = overrideByDate;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        },
        submitLabel: '저장'
    });
};

const openGoalChangeDefaultModal = (store, { dateISO }) => {
    const state = store.getState();
    const settings = state.settings;

    const body = el(
        'div',
        { className: 'stack-form' },
        el(
            'label',
            { className: 'input-label' },
            '목표',
            el(
                'select',
                { name: 'goalMode' },
                el('option', { value: 'maintain', selected: settings.nutrition.goal === 'maintain' }, '유지'),
                el('option', { value: 'cut', selected: settings.nutrition.goal === 'cut' }, '감량'),
                el('option', { value: 'minicut', selected: settings.nutrition.goal === 'minicut' }, '미니컷'),
                el('option', { value: 'bulk', selected: settings.nutrition.goal === 'bulk' }, '증량'),
                el('option', { value: 'leanbulk', selected: settings.nutrition.goal === 'leanbulk' }, '린 벌크'),
                el('option', { value: 'recomp', selected: settings.nutrition.goal === 'recomp' }, '리컴프'),
                el('option', { value: 'performance', selected: settings.nutrition.goal === 'performance' }, '퍼포먼스')
            )
        ),
        el(
            'label',
            { className: 'input-label' },
            '프레임워크',
            el(
                'select',
                { name: 'framework' },
                el('option', { value: 'dga_2025', selected: settings.nutrition.framework === 'dga_2025' }, 'DGA 2025–2030'),
                el('option', { value: 'amdr', selected: settings.nutrition.framework === 'amdr' }, 'AMDR Balanced'),
                el('option', { value: 'issn_strength', selected: settings.nutrition.framework === 'issn_strength' }, 'ISSN Strength'),
                el('option', { value: 'acsm_endurance', selected: settings.nutrition.framework === 'acsm_endurance' }, 'ACSM Endurance')
            )
        )
    );

    openModal({
        title: '오늘부터 목표 변경',
        body,
        onSubmit: (form) => {
            const goal = form.querySelector('[name="goalMode"]')?.value || settings.nutrition.goal;
            const framework = form.querySelector('[name="framework"]')?.value || settings.nutrition.framework;

            const { userdb } = store.getState();
            const birth = userdb.profile.birth;
            const height = userdb.profile.height_cm;
            const weight = userdb.profile.weight_kg;
            const age = calcAge(birth);
            const heightCm = Number(height);
            const weightKg = Number(weight);

            if (!age || !heightCm || !weightKg) {
                window.alert('프로필 정보를 먼저 입력하세요.');
                return false;
            }

            const spec = { frameworkId: framework, goalMode: buildGoalModeSpec(goal) };
            const computed = computeBaseTargets({
                profile: {
                    sex: userdb.profile.sex,
                    age,
                    heightCm,
                    weightKg,
                    activityFactor: userdb.profile.activity
                },
                spec,
                settings: { energyModel: { cutPct: 0.15, bulkPct: 0.1 } }
            });

            if (!computed.targets) return false;

            updateUserDb(store, (nextDb) => {
                const { timeline } = addGoalTimelineEntry({
                    goals: nextDb.goals,
                    effectiveDate: dateISO || todayIso(),
                    spec,
                    computed,
                    note: '',
                    nowMs: Date.now()
                });
                nextDb.goals.timeline = timeline;
                nextDb.updatedAt = new Date().toISOString();
            });

            store.dispatch({
                type: 'UPDATE_SETTINGS',
                payload: {
                    ...settings,
                    nutrition: {
                        ...settings.nutrition,
                        goal,
                        framework
                    }
                }
            });

            return true;
        },
        submitLabel: '저장'
    });
};

 

const openWorkoutEditModal = (store, { log, dateKey, id }) => {
    const settings = store.getState().settings;
    const preferredUnit = settings.units?.workout || log.unit || 'kg';
    const setsDetail = Array.isArray(log.setsDetail) && log.setsDetail.length > 0
        ? log.setsDetail.map((set) => ({
            reps: Number(set.reps || 0),
            weight: Number(set.weight || 0),
            completed: Boolean(set.completed)
        }))
        : buildDefaultSets(log);

    const setsContainer = el('div', { className: 'stack-form', dataset: { role: 'sets-container' } });
    const renderSets = () => {
        setsContainer.textContent = '';
        setsDetail.forEach((set, index) => {
            const row = el(
                'div',
                { className: 'row row-gap', dataset: { setRow: String(index) } },
                el('input', {
                    name: 'setReps',
                    type: 'number',
                    min: '0',
                    value: set.reps,
                    placeholder: `횟수 (세트 ${index + 1})`
                }),
                el('input', {
                    name: 'setWeight',
                    type: 'number',
                    min: '0',
                    value: set.weight,
                    placeholder: `중량 (세트 ${index + 1})`
                }),
                el(
                    'button',
                    {
                        type: 'button',
                        className: 'btn btn-secondary btn-sm',
                        dataset: { action: 'set.remove', index: String(index) }
                    },
                    '삭제'
                ),
                el(
                    'button',
                    {
                        type: 'button',
                        className: `btn btn-secondary btn-sm ${set.completed ? 'is-active' : ''}`,
                        dataset: { action: 'set.toggle', index: String(index) }
                    },
                    set.completed ? '완료' : '미완료'
                )
            );
            setsContainer.appendChild(row);
        });
    };

    const addSetButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'set.add' } },
        '세트 추가'
    );
    const restTimerButton = el(
        'button',
        { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'rest.timer' } },
        '휴식 타이머'
    );

    const body = el(
        'div',
        { className: 'stack-form', dataset: { role: 'workout-edit' } },
        el(
            'label',
            { className: 'input-label' },
            '운동 이름',
            el('input', { name: 'exerciseName', type: 'text', value: log.name })
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '세트 수',
                el('input', { name: 'sets', type: 'number', min: '1', value: log.sets })
            ),
            el(
                'label',
                { className: 'input-label' },
                '횟수(1세트)',
                el('input', { name: 'reps', type: 'number', min: '1', value: log.reps })
            )
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el(
                'label',
                { className: 'input-label' },
                '중량',
                el('input', { name: 'weight', type: 'number', min: '0', value: log.weight || 0 })
            ),
            el(
                'label',
                { className: 'input-label' },
                '단위',
                el(
                    'select',
                    { name: 'unit' },
                    el('option', { value: 'kg', selected: preferredUnit === 'kg' }, 'kg'),
                    el('option', { value: 'lb', selected: preferredUnit === 'lb' }, 'lb')
                )
            )
        ),
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '세트 상세')),
        setsContainer,
        el('div', { className: 'row row-gap' }, addSetButton, restTimerButton)
    );

    body.addEventListener('click', (event) => {
        const actionEl = event.target.closest
            ? event.target.closest('[data-action]')
            : event.target.parentElement?.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'set.add') {
            setsDetail.push({ reps: 0, weight: 0, completed: false });
            renderSets();
        }
        if (action === 'set.remove') {
            const index = Number(actionEl.dataset.index || -1);
            if (index < 0) return;
            setsDetail.splice(index, 1);
            if (setsDetail.length === 0) {
                setsDetail.push({ reps: 0, weight: 0, completed: false });
            }
            renderSets();
        }
        if (action === 'set.toggle') {
            const index = Number(actionEl.dataset.index || -1);
            if (index < 0) return;
            setsDetail[index].completed = !setsDetail[index].completed;
            renderSets();
        }
        if (action === 'rest.timer') {
            openRestTimerModal(store, 60);
        }
    });

    renderSets();

    openModal({
        title: '운동 수정',
        body,
        onSubmit: (form) => {
            const name = form.querySelector('[name="exerciseName"]')?.value.trim() || '';
            const sets = Number(form.querySelector('[name="sets"]')?.value || 0);
            const reps = Number(form.querySelector('[name="reps"]')?.value || 0);
            const weight = Number(form.querySelector('[name="weight"]')?.value || 0);
            const unit = form.querySelector('[name="unit"]')?.value || log.unit;
            if (!name || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0) return false;
            const nextSets = Array.from(form.querySelectorAll('[data-set-row]')).map((row) => ({
                reps: Number(row.querySelector('[name="setReps"]')?.value || 0),
                weight: Number(row.querySelector('[name="setWeight"]')?.value || 0)
            }));
            updateUserDb(store, (nextDb) => {
                const nextEntry = nextDb.workout[dateKey] || { logs: [] };
                const nextTarget = nextEntry.logs.find((item) => item.id === id);
                if (!nextTarget) return;
                nextTarget.name = name;
                nextTarget.sets = sets;
                nextTarget.reps = reps;
                nextTarget.weight = Number.isNaN(weight) ? 0 : weight;
                nextTarget.unit = unit;
                nextTarget.setsDetail = nextSets;
                nextDb.workout[dateKey] = nextEntry;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        },
        submitLabel: '저장',
        dangerLabel: '삭제',
        onDanger: () => {
            if (!window.confirm('운동 내역을 삭제하시겠습니까?')) {
                return false;
            }
            updateUserDb(store, (nextDb) => {
                const nextEntry = nextDb.workout[dateKey] || { logs: [] };
                nextEntry.logs = nextEntry.logs.filter((item) => item.id !== id);
                nextDb.workout[dateKey] = nextEntry;
                nextDb.updatedAt = new Date().toISOString();
            });
        }
    });
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const updateUserDb = (store, updater) => {
    const next = clone(store.getState().userdb);
    updater(next);
    store.dispatch({ type: 'UPDATE_USERDB', payload: next });
};

const handleActionClick = (store, event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    if (action === 'route') {
        const route = actionEl.dataset.route;
        if (route) {
            window.location.hash = route;
        }
    }
    if (action === 'diet.edit') {
        const id = actionEl.dataset.id;
        if (!id) return;
        const { userdb } = store.getState();
        const dateKey = userdb.meta.selectedDate.diet;
        const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
        const target = entry.meals.find((meal) => meal.id === id);
        if (!target) return;
        const food = target.foodId ? FOOD_DB.find((item) => item.id === target.foodId) : null;
        const servingSize = food?.serving?.size || 1;
        openModal({
            title: '식단 수정',
            body: el(
                'div',
                { className: 'stack-form' },
                el('input', { name: 'mealName', type: 'text', value: target.name }),
                el(
                    'select',
                    { name: 'mealType' },
                    el('option', { value: '아침', selected: target.type === '아침' }, '아침'),
                    el('option', { value: '점심', selected: target.type === '점심' }, '점심'),
                    el('option', { value: '저녁', selected: target.type === '저녁' }, '저녁'),
                    el('option', { value: '간식', selected: target.type === '간식' }, '간식')
                ),
                el(
                    'div',
                    { className: 'row row-gap' },
                    el('input', {
                        name: 'amount',
                        type: 'number',
                        min: '0',
                        value: target.amount ?? 1
                    }),
                    el(
                        'select',
                        { name: 'amountUnit' },
                        el('option', { value: 'serving', selected: target.amountUnit === 'serving' }, '서빙'),
                        el('option', { value: 'g', selected: target.amountUnit === 'g' }, '그램')
                    )
                )
            ),
            onSubmit: (form) => {
                const name = form.querySelector('[name="mealName"]')?.value.trim() || '';
                const type = form.querySelector('[name="mealType"]')?.value || target.type;
                const amountRaw = Number(form.querySelector('[name="amount"]')?.value || 0);
                const amount = Number.isNaN(amountRaw) ? target.amount ?? 1 : Math.max(0, amountRaw);
                const amountUnit = form.querySelector('[name="amountUnit"]')?.value || target.amountUnit || 'serving';
                if (!name) return false;
                updateUserDb(store, (nextDb) => {
                    const nextEntry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                    const nextTarget = nextEntry.meals.find((meal) => meal.id === id);
                    if (!nextTarget) return;
                    nextTarget.name = name;
                    nextTarget.type = type;
                    nextTarget.amount = amount;
                    nextTarget.amountUnit = amountUnit;
                    if (food) {
                        const per = food.nutrition || {};
                        const multiplier = amountUnit === 'g' ? amount / servingSize : amount;
                        nextTarget.nutrition = food.nutrition;
                        nextTarget.serving = food.serving;
                        nextTarget.kcal = (per.kcal || 0) * multiplier;
                        nextTarget.proteinG = (per.proteinG || 0) * multiplier;
                        nextTarget.carbG = (per.carbG || 0) * multiplier;
                        nextTarget.fatG = (per.fatG || 0) * multiplier;
                        nextTarget.fiberG = (per.fiberG || 0) * multiplier;
                        nextTarget.unsatFatG = (per.unsatFatG || 0) * multiplier;
                        nextTarget.satFatG = (per.satFatG || 0) * multiplier;
                        nextTarget.transFatG = (per.transFatG || 0) * multiplier;
                        nextTarget.sugarG = (per.sugarG || 0) * multiplier;
                        nextTarget.addedSugarG = (per.addedSugarG || 0) * multiplier;
                        nextTarget.sodiumMg = (per.sodiumMg || 0) * multiplier;
                        nextTarget.potassiumMg = (per.potassiumMg || 0) * multiplier;
                    }
                    nextDb.diet[dateKey] = nextEntry;
                    nextDb.updatedAt = new Date().toISOString();
                });
                return true;
            },
            dangerLabel: '삭제',
            onDanger: () => {
                if (!window.confirm('식단 내역을 삭제하시겠습니까?')) {
                    return false;
                }
                updateUserDb(store, (nextDb) => {
                    const nextEntry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                    nextEntry.meals = nextEntry.meals.filter((meal) => meal.id !== id);
                    nextDb.diet[dateKey] = nextEntry;
                    nextDb.updatedAt = new Date().toISOString();
                });
            }
        });
    }
    if (action === 'workout.addMenu') {
        openWorkoutAddMenuModal(store);
    }
    if (action === 'workout.manage.toggle') {
        store.dispatch({ type: 'TOGGLE_WORKOUT_MANAGE' });
    }
    if (action === 'workout.delete.selected') {
        const checked = Array.from(document.querySelectorAll('[data-role="workout-select"]:checked'));
        const ids = checked.map((item) => item.dataset.id).filter(Boolean);
        if (ids.length === 0) {
            window.alert('삭제할 항목을 선택해 주세요.');
            return;
        }
        if (!window.confirm('선택한 운동 기록을 삭제할까요?')) return;
        updateUserDb(store, (nextDb) => {
            const dateKey = nextDb.meta.selectedDate.workout;
            const entry = nextDb.workout[dateKey] || { logs: [] };
            entry.logs = entry.logs.filter((log) => !ids.includes(log.id));
            nextDb.workout[dateKey] = entry;
            nextDb.updatedAt = new Date().toISOString();
        });
    }
    if (action === 'workout.add') {
        openWorkoutAddModal(store);
    }
    if (action === 'workout.search') {
        openExerciseSearchModal(store);
    }
    if (action === 'workout.routine') {
        openWorkoutRoutineModal(store);
    }
    if (action === 'routine.add') {
        openRoutineCreateModal(store);
    }
    if (action === 'diet.search') {
        openFoodSearchModal(store);
    }
    if (action === 'workout.edit') {
        const id = actionEl.dataset.id;
        if (!id) return;
        const { userdb } = store.getState();
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        const target = entry.logs.find((log) => log.id === id);
        if (!target) return;
        openWorkoutEditModal(store, { log: target, dateKey, id });
    }
    if (action === 'workout.detail') {
        const id = actionEl.dataset.id;
        if (!id) return;
        const { userdb } = store.getState();
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        const target = entry.logs.find((log) => log.id === id);
        if (!target) return;
        openWorkoutDetailModal(store, {
            log: target,
            dateISO: dateKey,
            onUpdate: ({ setsDetail, target: nextTarget }) => {
                updateUserDb(store, (nextDb) => {
                    const nextEntry = nextDb.workout[dateKey] || { logs: [] };
                    const nextLog = nextEntry.logs.find((log) => log.id === id);
                    if (!nextLog) return;
                    if (Array.isArray(setsDetail)) nextLog.setsDetail = setsDetail;
                    if (nextTarget) {
                        nextLog.target = {
                            sets: Number(nextTarget.sets || nextLog.sets || 1),
                            reps: Number(nextTarget.reps || nextLog.reps || 0),
                            restSec: Number(nextTarget.restSec || nextLog.target?.restSec || 60)
                        };
                    }
                    nextDb.workout[dateKey] = nextEntry;
                    nextDb.updatedAt = new Date().toISOString();
                });
            }
        });
    }
if (action === 'backup.export') {
        const payload = buildExportPayload(store.getState());
        const filename = `cadence_backup_${new Date().toISOString().slice(0, 10)}.json`;
        downloadJson(payload, filename);
    }
    if (action === 'goal.override') {
        const state = store.getState();
        let dateISO = actionEl.dataset.date || selectSelectedDate(state, actionEl.dataset.domain);
        const input = actionEl.closest('.goal-history')?.querySelector('[name="goalOverrideDate"]');
        if (!dateISO) {
            const parsed = input ? parseDateInput(input.value, state.settings.dateFormat) : '';
            if (parsed) dateISO = parsed;
        }
        if (!dateISO) {
            if (input) input.focus();
            window.alert('날짜를 입력해 주세요.');
            return;
        }
        openGoalOverrideModal(store, { dateISO });
    }
    if (action === 'goal.clear') {
        const state = store.getState();
        const dateISO = actionEl.dataset.date || selectSelectedDate(state, actionEl.dataset.domain);
        if (!dateISO) return;
        if (!window.confirm('이 날짜의 오버라이드를 해제할까요?')) return;
        updateUserDb(store, (nextDb) => {
            const { overrideByDate } = clearGoalOverride({ goals: nextDb.goals, dateISO });
            nextDb.goals.overrideByDate = overrideByDate;
            nextDb.updatedAt = new Date().toISOString();
        });
    }
    if (action === 'goal.history.toggle') {
        const targetId = actionEl.dataset.target;
        if (!targetId) return;
        const list = document.getElementById(targetId);
        if (!list) return;
        const expanded = actionEl.dataset.expanded === 'true';
        const nextExpanded = !expanded;
        list.querySelectorAll('.list-item.is-hidden').forEach((item) => {
            item.classList.toggle('is-hidden', !nextExpanded);
        });
        actionEl.dataset.expanded = nextExpanded ? 'true' : 'false';
        actionEl.textContent = nextExpanded ? '접기' : '더보기';
    }
    if (action === 'goal.changeDefault') {
        const state = store.getState();
        const dateISO = actionEl.dataset.date || selectSelectedDate(state, actionEl.dataset.domain) || todayIso();
        openGoalChangeDefaultModal(store, { dateISO });
    }
    if (action === 'goal.credit.toggle') {
        const settings = store.getState().settings;
        const enabled = Boolean(actionEl.checked ?? actionEl.dataset.checked);
        store.dispatch({
            type: 'UPDATE_SETTINGS',
            payload: {
                ...settings,
                nutrition: {
                    ...settings.nutrition,
                    exerciseCredit: {
                        ...settings.nutrition.exerciseCredit,
                        enabled
                    }
                }
            }
        });
    }
    if (action === 'goal.credit.factor') {
        const raw = Number(actionEl.value || actionEl.dataset.value || 0);
        const value = Math.min(1, Math.max(0, raw / 100));
        const settings = store.getState().settings;
        store.dispatch({
            type: 'UPDATE_SETTINGS',
            payload: {
                ...settings,
                nutrition: {
                    ...settings.nutrition,
                    exerciseCredit: {
                        ...settings.nutrition.exerciseCredit,
                        factor: value
                    }
                }
            }
        });
    }
    if (action === 'date.shift') {
        const offset = Number(actionEl.dataset.offset || 0);
        if (!offset) return;
        const { userdb, settings, ui } = store.getState();
        const nextDate = shiftDate(userdb.meta.selectedDate[ui.route], offset);
        updateUserDb(store, (nextDb) => {
            if (settings.dateSync) {
                nextDb.meta.selectedDate.dashboard = nextDate;
                nextDb.meta.selectedDate.workout = nextDate;
                nextDb.meta.selectedDate.diet = nextDate;
                nextDb.meta.selectedDate.body = nextDate;
            } else {
                nextDb.meta.selectedDate[ui.route] = nextDate;
            }
            nextDb.updatedAt = new Date().toISOString();
        });
    }
    if (action === 'date.today') {
        const { settings, ui } = store.getState();
        const nextDate = todayIso();
        updateUserDb(store, (nextDb) => {
            if (settings.dateSync) {
                nextDb.meta.selectedDate.dashboard = nextDate;
                nextDb.meta.selectedDate.workout = nextDate;
                nextDb.meta.selectedDate.diet = nextDate;
                nextDb.meta.selectedDate.body = nextDate;
            } else {
                nextDb.meta.selectedDate[ui.route] = nextDate;
            }
            nextDb.updatedAt = new Date().toISOString();
        });
    }
};

const handleActionSubmit = (store, event) => {
    const form = event.target.closest('[data-action]');
    if (!form) return;
    const action = form.dataset.action;
    if (action !== 'diet.add') return;
    event.preventDefault();

    const nameInput = form.querySelector('[name="mealName"]');
    const typeSelect = form.querySelector('[name="mealType"]');
    const name = nameInput ? nameInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : '기타';

    if (!name) return;

    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.diet;
        const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
        entry.meals = entry.meals.concat({
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            type,
            name
        });
        userdb.diet[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });

    if (nameInput) nameInput.value = '';
};

const handleActionChange = (store, event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;
    if (action === 'diet.water') {
        const value = Number(actionEl.value || 0);
        updateUserDb(store, (userdb) => {
            const dateKey = userdb.meta.selectedDate.diet;
            const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
            entry.waterMl = Number.isNaN(value) ? 0 : value;
            userdb.diet[dateKey] = entry;
            userdb.updatedAt = new Date().toISOString();
        });
        return;
    }
    if (action === 'backup.import') {
        handleBackupImport(store, actionEl);
    }
};

const handleBackupImport = async (store, input) => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
        const payload = await parseImportPayload(file);
        store.dispatch({ type: 'UPDATE_USERDB', payload: payload.userdb });
        store.dispatch({ type: 'UPDATE_SETTINGS', payload: payload.settings });
        alert('복원이 완료되었습니다.');
    } catch (error) {
        alert(error.message || '백업 파일을 불러오지 못했습니다.');
    } finally {
        input.value = '';
    }
};

const handleWorkoutSubmit = (store, event, form) => {
    event.preventDefault();
    const nameInput = form.querySelector('[name="exerciseName"]');
    const setsInput = form.querySelector('[name="sets"]');
    const repsInput = form.querySelector('[name="reps"]');
    const weightInput = form.querySelector('[name="weight"]');
    const unitSelect = form.querySelector('[name="unit"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const sets = Number(setsInput ? setsInput.value : 0);
    const reps = Number(repsInput ? repsInput.value : 0);
    const weight = Number(weightInput ? weightInput.value : 0);
    const unit = unitSelect ? unitSelect.value : 'kg';

    if (!name || sets <= 0 || reps <= 0) return;

    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        const nextLog = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            name,
            sets,
            reps,
            weight: Number.isNaN(weight) ? 0 : weight,
            unit
        };
        nextLog.setsDetail = buildDefaultSets(nextLog);
        entry.logs = entry.logs.concat(nextLog);
        userdb.workout[dateKey] = entry;
        userdb.updatedAt = new Date().toISOString();
    });

    if (nameInput) nameInput.value = '';
    if (setsInput) setsInput.value = '';
    if (repsInput) repsInput.value = '';
    if (weightInput) weightInput.value = '';
};

const handleBodySubmit = (store, event, form) => {
    event.preventDefault();
    const weightInput = form.querySelector('[name="weight"]');
    const waistInput = form.querySelector('[name="waist"]');
    const muscleInput = form.querySelector('[name="muscle"]');
    const fatInput = form.querySelector('[name="fat"]');

    const weight = weightInput ? weightInput.value : '';
    const waist = waistInput ? waistInput.value : '';
    const muscle = muscleInput ? muscleInput.value : '';
    const fat = fatInput ? fatInput.value : '';

    updateUserDb(store, (userdb) => {
        const dateKey = userdb.meta.selectedDate.body;
        userdb.body[dateKey] = {
            weight,
            waist,
            muscle,
            fat
        };
        userdb.updatedAt = new Date().toISOString();
    });
};

const handleSettingsSubmit = (store, event, form) => {
    event.preventDefault();
    const dateFormat = form.querySelector('[name="dateFormat"]')?.value || 'YMD';
    const dateSync = Boolean(form.querySelector('[name="dateSync"]')?.checked);
    const weightUnit = form.querySelector('[name="weightUnit"]')?.value || 'kg';
    const waterUnit = form.querySelector('[name="waterUnit"]')?.value || 'ml';
    const heightUnit = form.querySelector('[name="heightUnit"]')?.value || 'cm';
    const foodUnit = form.querySelector('[name="foodUnit"]')?.value || 'g';
    const workoutUnit = form.querySelector('[name="workoutUnit"]')?.value || 'kg';
    const soundVolumeRaw = Number(form.querySelector('[name="soundVolume"]')?.value || 100);
    const soundVolume = Number.isNaN(soundVolumeRaw)
        ? store.getState().settings.sound.volume
        : Math.min(100, Math.max(0, soundVolumeRaw));
    const nextTimerSound = soundVolume > 0;
    const profileSex = form.querySelector('[name="profileSex"]')?.value || 'M';
    const profileBirthRaw = form.querySelector('[name="profileBirth"]')?.value || '';
    const profileHeight = form.querySelector('[name="profileHeight"]')?.value || '';
    const profileWeight = form.querySelector('[name="profileWeight"]')?.value || '';
    const profileActivity = form.querySelector('[name="profileActivity"]')?.value || 'light';
    const lang = form.querySelector('[name="lang"]')?.value || 'ko';
    const profileBirth = parseDateInput(profileBirthRaw, dateFormat) || '';
    const nutritionGoal = form.querySelector('[name="nutritionGoal"]')?.value || 'maintain';
    const nutritionFramework = form.querySelector('[name="nutritionFramework"]')?.value || 'dga_2025';
    const exerciseCreditEnabled = Boolean(form.querySelector('[name="exerciseCreditEnabled"]')?.checked);
    const exerciseCreditFactorRaw = Number(form.querySelector('[name="exerciseCreditFactor"]')?.value || 0);
    const exerciseCreditFactor = Math.min(1, Math.max(0, exerciseCreditFactorRaw / 100));
    const exerciseCreditCapRaw = Number(form.querySelector('[name="exerciseCreditCap"]')?.value || 0);
    const exerciseCreditCap = Number.isNaN(exerciseCreditCapRaw) ? 0 : exerciseCreditCapRaw;
    const exerciseCreditDistribution =
        form.querySelector('[name="exerciseCreditDistribution"]')?.value || 'CARB_BIASED';
    const prevSettings = store.getState().settings;

    const nextSettings = {
        ...prevSettings,
        dateFormat,
        dateSync,
        lang,
        units: {
            ...store.getState().settings.units,
            weight: weightUnit,
            water: waterUnit,
            height: heightUnit,
            food: foodUnit,
            workout: workoutUnit
        },
        sound: {
            ...store.getState().settings.sound,
            timerEnabled: nextTimerSound,
            volume: soundVolume
        },
        nutrition: {
            ...prevSettings.nutrition,
            goal: nutritionGoal,
            framework: nutritionFramework,
            exerciseCredit: {
                ...prevSettings.nutrition.exerciseCredit,
                enabled: exerciseCreditEnabled,
                factor: exerciseCreditFactor,
                capKcal: exerciseCreditCap,
                distribution: exerciseCreditDistribution
            }
        }
    };

    store.dispatch({ type: 'UPDATE_SETTINGS', payload: nextSettings });
    updateUserDb(store, (nextDb) => {
        nextDb.profile = {
            ...nextDb.profile,
            sex: profileSex,
            birth: profileBirth,
            height_cm: profileHeight,
            weight_kg: profileWeight,
            activity: profileActivity
        };
        const timeline = nextDb.goals?.timeline || [];
        const shouldAddGoal = timeline.length === 0
            || prevSettings.nutrition.goal !== nutritionGoal
            || prevSettings.nutrition.framework !== nutritionFramework;
        if (shouldAddGoal) {
            const age = calcAge(profileBirth);
            const heightCm = Number(profileHeight);
            const weightKg = Number(profileWeight);
            if (age && heightCm && weightKg) {
                const spec = {
                    frameworkId: nutritionFramework,
                    goalMode: buildGoalModeSpec(nutritionGoal)
                };
                const computed = computeBaseTargets({
                    profile: {
                        sex: profileSex,
                        age,
                        heightCm,
                        weightKg,
                        activityFactor: profileActivity
                    },
                    spec,
                    settings: { energyModel: { cutPct: 0.15, bulkPct: 0.1 } }
                });
                if (computed.targets) {
                    const { timeline: nextTimeline } = addGoalTimelineEntry({
                        goals: nextDb.goals,
                        effectiveDate: todayIso(),
                        spec,
                        computed,
                        note: '',
                        nowMs: Date.now()
                    });
                    nextDb.goals.timeline = nextTimeline;
                }
            }
        }
        nextDb.updatedAt = new Date().toISOString();
    });
};

const render = (store) => {
    const state = store.getState();
    renderTabBar({ route: state.ui.route });
    renderView({ route: state.ui.route, store });
};

export const initApp = (store) => {
    document.addEventListener('click', (event) => handleActionClick(store, event));
    document.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-action]');
        if (!form) return;
        const action = form.dataset.action;
        if (action === 'diet.add') {
            handleActionSubmit(store, event);
            return;
        }
        if (action === 'workout.add') {
            handleWorkoutSubmit(store, event, form);
            return;
        }
        if (action === 'body.save') {
            handleBodySubmit(store, event, form);
            return;
        }
        if (action === 'settings.save') {
            handleSettingsSubmit(store, event, form);
        }
    });
    document.addEventListener('change', (event) => {
        const slider = event.target.closest('[name="soundVolume"]');
        if (slider) {
            const sectionTitle = slider.closest('.settings-section')?.querySelector('.section-title');
            if (sectionTitle) sectionTitle.textContent = `사운드 볼륨 (${slider.value})`;
        }
        const creditToggle = event.target.closest('[name="exerciseCreditEnabled"]');
        if (creditToggle) {
            const enabled = Boolean(creditToggle.checked);
            const section = creditToggle.closest('.settings-section');
            const factorInput = section?.querySelector('[name="exerciseCreditFactor"]');
            const capInput = section?.querySelector('[name="exerciseCreditCap"]');
            const distSelect = section?.querySelector('[name="exerciseCreditDistribution"]');
            const toggleLabel = (input) => {
                const label = input?.closest('label');
                if (label) label.classList.toggle('is-disabled', !enabled);
            };
            if (factorInput) factorInput.disabled = !enabled;
            if (capInput) capInput.disabled = !enabled;
            if (distSelect) distSelect.disabled = !enabled;
            toggleLabel(factorInput);
            toggleLabel(capInput);
            toggleLabel(distSelect);
        }
        const creditFactorSlider = event.target.closest('[name="exerciseCreditFactor"]');
        if (creditFactorSlider) {
            const label = creditFactorSlider.closest('label');
            if (label) label.firstChild.textContent = `운동 보정 비율 (${creditFactorSlider.value}%)`;
        }
        const creditCapSlider = event.target.closest('[name="exerciseCreditCap"]');
        if (creditCapSlider) {
            const label = creditCapSlider.closest('label');
            if (label) label.firstChild.textContent = `운동 보정 상한 (${creditCapSlider.value} kcal)`;
        }
        const capSlider = event.target.closest('[data-action="goal.credit.cap"]');
        if (capSlider) {
            const label = capSlider.closest('label');
            if (label) label.firstChild.textContent = `상한 (${capSlider.value} kcal)`;
            const settings = store.getState().settings;
            store.dispatch({
                type: 'UPDATE_SETTINGS',
                payload: {
                    ...settings,
                    nutrition: {
                        ...settings.nutrition,
                        exerciseCredit: {
                            ...settings.nutrition.exerciseCredit,
                            capKcal: Number(capSlider.value || 0)
                        }
                    }
                }
            });
        }
        const factorSlider = event.target.closest('[data-action="goal.credit.factor"]');
        if (factorSlider) {
            const label = factorSlider.closest('label');
            if (label) label.firstChild.textContent = `비율 (${factorSlider.value}%)`;
            const settings = store.getState().settings;
            store.dispatch({
                type: 'UPDATE_SETTINGS',
                payload: {
                    ...settings,
                    nutrition: {
                        ...settings.nutrition,
                        exerciseCredit: {
                            ...settings.nutrition.exerciseCredit,
                            factor: Math.min(1, Math.max(0, Number(factorSlider.value || 0) / 100))
                        }
                    }
                }
            });
        }
        handleActionChange(store, event);
    });
    store.subscribe(() => render(store));
    render(store);
};





