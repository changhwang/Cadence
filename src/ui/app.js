import { renderTabBar } from './components/TabBar.js';
import { renderView } from './views/index.js';
import { buildExportPayload, downloadJson, parseImportPayload } from '../services/backupService.js';
import { shiftDate } from './components/DateBar.js';
import { calcAge, parseDateInput, todayIso } from '../utils/date.js';
import { closeModal, openModal } from './components/Modal.js';
import { el } from '../utils/dom.js';
import { ROUTINE_TEMPLATES } from '../data/routines.js';
import { computeBaseTargets } from '../services/nutrition/targetEngine.js';
import { addGoalTimelineEntry, clearGoalOverride, setGoalOverride } from '../services/goals/goalService.js';
import { selectGoalForDate, selectSelectedDate } from '../selectors/goalSelectors.js';

const buildDefaultSets = (log) => {
    const count = Math.max(Number(log.sets || 0), 1);
    const reps = Number(log.reps || 0);
    const weight = Number(log.weight || 0);
    return Array.from({ length: count }, () => ({ reps, weight }));
};

const createWorkoutLog = ({ name, sets, reps, weight, unit }) => {
    const nextLog = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        name,
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

const openWorkoutAddModal = (store) => {
    const body = el(
        'div',
        { className: 'stack-form' },
        el('input', { name: 'exerciseName', type: 'text', placeholder: '운동명' }),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'sets', type: 'number', min: '1', value: 3 }),
            el('input', { name: 'reps', type: 'number', min: '1', value: 10 })
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'weight', type: 'number', min: '0', value: 0 }),
            el(
                'select',
                { name: 'unit' },
                el('option', { value: 'kg' }, 'kg'),
                el('option', { value: 'lb' }, 'lb')
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
            if (!name || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0) return false;
            const log = createWorkoutLog({ name, sets, reps, weight, unit });
            appendWorkoutLogs(store, [log]);
            return true;
        }
    });
};

const openWorkoutRoutineModal = (store) => {
    const list = el('div', { className: 'list-group' });
    Object.entries(ROUTINE_TEMPLATES).forEach(([key, routine]) => {
        const item = el(
            'div',
            { className: 'list-item', dataset: { action: 'routine.select', key } },
            el(
                'div',
                {},
                el('div', { className: 'list-title' }, routine.title),
                el('div', { className: 'list-subtitle' }, `${routine.exercises.length}개 운동`)
            ),
            el('div', { className: 'list-actions' }, el('span', { className: 'badge' }, '추가'))
        );
        list.appendChild(item);
    });

    list.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        if (actionEl.dataset.action !== 'routine.select') return;
        const key = actionEl.dataset.key;
        const routine = ROUTINE_TEMPLATES[key];
        if (!routine) return;
        const logs = routine.exercises.map((name) =>
            createWorkoutLog({ name, sets: 3, reps: 10, weight: 0, unit: 'kg' })
        );
        appendWorkoutLogs(store, logs);
        closeModal();
    });

    openModal({
        title: '루틴 가져오기',
        body: el('div', { className: 'stack-form' }, list),
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

const openWorkoutAddMenuModal = (store) => {
    const body = el(
        'div',
        { className: 'stack-form' },
        el('button', { type: 'button', className: 'btn', dataset: { action: 'workout.add' } }, '운동 추가'),
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
    const setsDetail = Array.isArray(log.setsDetail) && log.setsDetail.length > 0
        ? log.setsDetail.map((set) => ({ reps: Number(set.reps || 0), weight: Number(set.weight || 0) }))
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

    const body = el(
        'div',
        { className: 'stack-form', dataset: { role: 'workout-edit' } },
        el('input', { name: 'exerciseName', type: 'text', value: log.name }),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'sets', type: 'number', min: '1', value: log.sets }),
            el('input', { name: 'reps', type: 'number', min: '1', value: log.reps })
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('input', { name: 'weight', type: 'number', min: '0', value: log.weight || 0 }),
            el(
                'select',
                { name: 'unit' },
                el('option', { value: 'kg', selected: log.unit === 'kg' }, 'kg'),
                el('option', { value: 'lb', selected: log.unit === 'lb' }, 'lb')
            )
        ),
        el('div', { className: 'card-header' }, el('h3', { className: 'card-title' }, '세트 상세')),
        setsContainer,
        addSetButton
    );

    body.addEventListener('click', (event) => {
        const actionEl = event.target.closest
            ? event.target.closest('[data-action]')
            : event.target.parentElement?.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'set.add') {
            setsDetail.push({ reps: 0, weight: 0 });
            renderSets();
        }
        if (action === 'set.remove') {
            const index = Number(actionEl.dataset.index || -1);
            if (index < 0) return;
            setsDetail.splice(index, 1);
            if (setsDetail.length === 0) {
                setsDetail.push({ reps: 0, weight: 0 });
            }
            renderSets();
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
                )
            ),
            onSubmit: (form) => {
                const name = form.querySelector('[name="mealName"]')?.value.trim() || '';
                const type = form.querySelector('[name="mealType"]')?.value || target.type;
                if (!name) return false;
                updateUserDb(store, (nextDb) => {
                    const nextEntry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                    const nextTarget = nextEntry.meals.find((meal) => meal.id === id);
                    if (!nextTarget) return;
                    nextTarget.name = name;
                    nextTarget.type = type;
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
    if (action === 'workout.add') {
        openWorkoutAddModal(store);
    }
    if (action === 'workout.routine') {
        openWorkoutRoutineModal(store);
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
