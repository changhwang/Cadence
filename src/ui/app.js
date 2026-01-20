import { renderTabBar } from './components/TabBar.js';
import { renderView } from './views/index.js';
import { buildExportPayload, downloadJson, parseImportPayload } from '../services/backupService.js';
import { shiftDate } from './components/DateBar.js';
import { parseDateInput, todayIso } from '../utils/date.js';
import { closeModal, openModal } from './components/Modal.js';
import { el } from '../utils/dom.js';
import { ROUTINE_TEMPLATES } from '../data/routines.js';

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
    const dateFormat = form.querySelector('[name="dateFormat"]')?.value || 'KO_DOTS';
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

    const nextSettings = {
        ...store.getState().settings,
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
        handleActionChange(store, event);
    });
    document.addEventListener('change', (event) => handleActionChange(store, event));
    store.subscribe(() => render(store));
    render(store);
};
