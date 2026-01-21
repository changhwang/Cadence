import { CARDIO_DB } from '../../data/cardio.js';
import { EXERCISE_DB } from '../../data/exercises.js';
import { ROUTINE_TEMPLATES } from '../../data/routines.js';
import { el } from '../../utils/dom.js';
import { closeModal, openModal } from '../components/Modal.js';
import { openRestTimerModal } from '../components/RestTimer.js';
import { updateUserDb } from '../store/userDb.js';
import { getLabelByLang } from '../utils/labels.js';
import { buildRoutineForm } from '../workout/routineForm.js';
import { appendWorkoutLogs, buildDefaultSets, createWorkoutLog } from '../workout/workoutLogUtils.js';
import { fromDisplayWeight, roundWeight, toDisplayWeight } from '../../utils/units.js';

export const openCardioEditModal = (store, { log, dateKey, id, index }) => {
    if (!log) return;
    const meta = CARDIO_DB.find((item) => item.id === log.type);
    const title = meta ? getLabelByLang(meta.labels, store.getState().settings.lang || 'ko') : log.type || '유산소';
    const minutesInput = el('input', { type: 'number', min: '1', value: log.minutes || 10 });
    const kcalInput = el('input', { type: 'number', min: '0', value: log.kcal ?? '' });
    const safeIndex = Number.isInteger(index) && index >= 0 ? index : null;
    const getCurrentLogs = (entry) => {
        if (Array.isArray(entry.cardio?.logs)) return entry.cardio.logs;
        if (Array.isArray(entry.cardioLogs)) return entry.cardioLogs;
        if (Array.isArray(entry.cardio)) return entry.cardio;
        return [];
    };
    const resolveTarget = (entry) => {
        const current = getCurrentLogs(entry);
        if (id) return current.find((item) => item.id === id);
        if (safeIndex !== null) return current[safeIndex];
        return null;
    };

    openModal({
        title,
        body: el(
            'div',
            { className: 'stack-form' },
            el('label', { className: 'input-label' }, '시간(분)', minutesInput),
            el('label', { className: 'input-label' }, 'kcal(선택)', kcalInput)
        ),
        submitLabel: '저장',
        onSubmit: () => {
            const minutes = Number(minutesInput.value || 0);
            const kcalRaw = kcalInput.value;
            const kcal = kcalRaw === '' ? null : Number(kcalRaw);
            if (!minutes || Number.isNaN(minutes) || minutes <= 0) {
                window.alert('시간(분)을 입력해 주세요.');
                return false;
            }
            if (kcal !== null && (Number.isNaN(kcal) || kcal < 0)) {
                window.alert('kcal은 0 이상으로 입력해 주세요.');
                return false;
            }
            updateUserDb(store, (nextDb) => {
                const entry = nextDb.workout[dateKey] || { logs: [] };
                const current = getCurrentLogs(entry);
                const target = resolveTarget(entry);
                if (!target) return;
                if (!target.id) {
                    target.id = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
                }
                target.minutes = minutes;
                if (kcal === null) {
                    delete target.kcal;
                } else {
                    target.kcal = kcal;
                }
                entry.cardio = { ...(entry.cardio || {}), logs: current };
                nextDb.workout[dateKey] = entry;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        },
        dangerLabel: '삭제',
        onDanger: () => {
            if (!window.confirm('이 유산소 기록을 삭제할까요?')) return false;
            updateUserDb(store, (nextDb) => {
                const entry = nextDb.workout[dateKey] || { logs: [] };
                const current = getCurrentLogs(entry);
                const nextLogs = id
                    ? current.filter((item) => item.id !== id)
                    : safeIndex === null
                        ? current
                        : current.filter((_, itemIndex) => itemIndex !== safeIndex);
                entry.cardio = { ...(entry.cardio || {}), logs: nextLogs };
                nextDb.workout[dateKey] = entry;
                nextDb.updatedAt = new Date().toISOString();
            });
        }
    });
};

export const openWorkoutAddModal = (store, options = {}) => {
    const settings = store.getState().settings;
    const preferredUnit = settings.units?.workout || 'kg';
    const exerciseMeta = options.exerciseId
        ? EXERCISE_DB.find((item) => item.id === options.exerciseId)
        : null;
    const cardioMeta = options.exerciseId
        ? CARDIO_DB.find((item) => item.id === options.exerciseId)
        : null;
    const isCardioExercise = Boolean(
        cardioMeta
            || exerciseMeta?.classification === 'cardio'
            || exerciseMeta?.pattern === 'cardio'
            || (Array.isArray(exerciseMeta?.equipment) && exerciseMeta.equipment.includes('cardio'))
    );
    const minutesInput = el('input', { name: 'minutes', type: 'number', min: '1', value: 10 });
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
        isCardioExercise
            ? el(
                'label',
                { className: 'input-label' },
                '시간(분)',
                minutesInput
            )
            : el(
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
        isCardioExercise
            ? null
            : el(
                'div',
                { className: 'row row-gap' },
                el(
                    'label',
                    { className: 'input-label' },
                    '중량',
                    el('input', { name: 'weight', type: 'number', min: '0', step: '0.1', value: 0 })
                ),
                el(
                    'label',
                    { className: 'input-label' },
                    '단위',
                    el(
                        'select',
                        { name: 'unit', disabled: true },
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
            const exerciseId = form.querySelector('[name="exerciseId"]')?.value || '';
            if (!name) {
                window.alert('운동 이름을 입력해 주세요.');
                return false;
            }
            if (isCardioExercise) {
                const minutes = Number(form.querySelector('[name="minutes"]')?.value || 0);
                if (!minutes || Number.isNaN(minutes) || minutes <= 0) {
                    window.alert('시간(분)을 입력해 주세요.');
                    return false;
                }
                updateUserDb(store, (nextDb) => {
                    const dateKey = nextDb.meta.selectedDate.workout;
                    const entry = nextDb.workout[dateKey] || { logs: [] };
                    const currentCardio = Array.isArray(entry.cardio?.logs) ? entry.cardio.logs : [];
                    entry.cardio = {
                        ...(entry.cardio || {}),
                        logs: currentCardio.concat({
                            id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                            type: exerciseId || name,
                            minutes,
                            met: cardioMeta?.met
                        })
                    };
                    nextDb.workout[dateKey] = entry;
                    nextDb.updatedAt = new Date().toISOString();
                });
                return true;
            }
            const sets = Number(form.querySelector('[name="sets"]')?.value || 0);
            const reps = Number(form.querySelector('[name="reps"]')?.value || 0);
            const weight = Number(form.querySelector('[name="weight"]')?.value || 0);
            const unit = preferredUnit || 'kg';
            if (Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0) {
                window.alert('세트 수와 횟수를 입력해 주세요.');
                return false;
            }
            const log = createWorkoutLog({ name, sets, reps, weight, unit, exerciseId });
            appendWorkoutLogs(store, [log]);
            return true;
        }
    });
};

export const openRoutineCreateModal = (store) => {
    const { body, getValues } = buildRoutineForm(store);
    openModal({
        title: '내 루틴 추가',
        body,
        submitLabel: '저장',
        onSubmit: (form) => {
            const { title, selected, defaults, defaultsById, category, tags } = getValues(form);
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
                    defaultsById,
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

export const openRoutineEditModal = (store, routine) => {
    const { body, getValues } = buildRoutineForm(store, routine);
    openModal({
        title: '루틴 수정',
        body,
        submitLabel: '저장',
        onSubmit: (form) => {
            const { title, selected, defaults, defaultsById, category, tags } = getValues(form);
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
                target.defaultsById = defaultsById;
                target.category = category;
                target.tags = tags;
                nextDb.routines = routines;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        }
    });
};

export const openWorkoutRoutineModal = (store) => {
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
                        : el('button', { type: 'button', className: 'btn btn-secondary btn-sm' }, '추가')
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
        const defaultsById = routine.defaultsById || {};
        const isCardioExercise = (exercise) => {
            if (!exercise) return false;
            if (exercise.classification === 'cardio') return true;
            if (exercise.pattern === 'cardio') return true;
            if (Array.isArray(exercise.equipment) && exercise.equipment.includes('cardio')) return true;
            return false;
        };
        const strengthLogs = [];
        const cardioLogs = [];
        exerciseIds.forEach((exerciseId) => {
            const exercise = EXERCISE_DB.find((item) => item.id === exerciseId);
            const name = exercise ? getLabelByLang(exercise.labels, lang) : exerciseId;
            if (isCardioExercise(exercise)) {
                const minutes = Math.max(1, Number(defaultsById[exerciseId]?.minutes || 10));
                const cardioMeta = CARDIO_DB.find((item) => item.id === exerciseId);
                cardioLogs.push({
                    id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                    type: exerciseId,
                    minutes,
                    met: cardioMeta?.met
                });
                return;
            }
            const perDefaults = defaultsById[exerciseId] || defaults;
            const log = createWorkoutLog({
                name,
                sets: perDefaults.sets || 3,
                reps: perDefaults.reps || 10,
                weight: perDefaults.weight || 0,
                unit: perDefaults.unit || 'kg',
                exerciseId
            });
            log.target = {
                sets: perDefaults.sets || log.sets || 1,
                reps: perDefaults.reps || log.reps || 0,
                restSec: Number(perDefaults.restSec || 60)
            };
            strengthLogs.push(log);
        });
        if (strengthLogs.length === 0 && cardioLogs.length === 0) return;
        updateUserDb(store, (nextDb) => {
            const dateKey = nextDb.meta.selectedDate.workout;
            const entry = nextDb.workout[dateKey] || { logs: [] };
            entry.logs = entry.logs.concat(strengthLogs);
            if (cardioLogs.length > 0) {
                const currentCardio = Array.isArray(entry.cardio?.logs) ? entry.cardio.logs : [];
                entry.cardio = { ...(entry.cardio || {}), logs: currentCardio.concat(cardioLogs) };
            }
            nextDb.workout[dateKey] = entry;
            nextDb.updatedAt = new Date().toISOString();
        });
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

export const openExerciseSearchModal = (store) => {
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

export const openWorkoutEditModal = (store, { log, dateKey, id }) => {
    const settings = store.getState().settings;
    const preferredUnit = settings.units?.workout || 'kg';
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
                    step: '0.1',
                    value: roundWeight(toDisplayWeight(set.weight, preferredUnit), 1),
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
                el('input', {
                    name: 'weight',
                    type: 'number',
                    min: '0',
                    step: '0.1',
                    value: roundWeight(toDisplayWeight(log.weight || 0, preferredUnit), 1)
                })
            ),
            el(
                'label',
                { className: 'input-label' },
                '단위',
                el(
                    'select',
                    { name: 'unit', disabled: true },
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
            const weight = fromDisplayWeight(Number(form.querySelector('[name="weight"]')?.value || 0), preferredUnit);
            const unit = 'kg';
            if (!name || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0) return false;
            const nextSets = Array.from(form.querySelectorAll('[data-set-row]')).map((row, index) => ({
                reps: Number(row.querySelector('[name="setReps"]')?.value || 0),
                weight: fromDisplayWeight(
                    Number(row.querySelector('[name="setWeight"]')?.value || 0),
                    preferredUnit
                ),
                completed: Boolean(setsDetail[index]?.completed)
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
