import { renderTabBar } from './components/TabBar.js';
import { renderView } from './views/index.js';
import { buildExportPayload, downloadJson, parseImportPayload } from '../services/backupService.js';
import { shiftDate } from './components/DateBar.js';
import { todayIso } from '../utils/date.js';
import { openModal } from './components/Modal.js';
import { el } from '../utils/dom.js';

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
    if (action === 'diet.remove') {
        const id = actionEl.dataset.id;
        if (!id) return;
        updateUserDb(store, (userdb) => {
            const dateKey = userdb.meta.selectedDate.diet;
            const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
            entry.meals = entry.meals.filter((meal) => meal.id !== id);
            userdb.diet[dateKey] = entry;
            userdb.updatedAt = new Date().toISOString();
        });
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
            }
        });
    }
    if (action === 'workout.remove') {
        const id = actionEl.dataset.id;
        if (!id) return;
        updateUserDb(store, (userdb) => {
            const dateKey = userdb.meta.selectedDate.workout;
            const entry = userdb.workout[dateKey] || { logs: [] };
            entry.logs = entry.logs.filter((log) => log.id !== id);
            userdb.workout[dateKey] = entry;
            userdb.updatedAt = new Date().toISOString();
        });
    }
    if (action === 'workout.edit') {
        const id = actionEl.dataset.id;
        if (!id) return;
        const { userdb } = store.getState();
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        const target = entry.logs.find((log) => log.id === id);
        if (!target) return;
        openModal({
            title: '운동 수정',
            body: el(
                'div',
                { className: 'stack-form' },
                el('input', { name: 'exerciseName', type: 'text', value: target.name }),
                el(
                    'div',
                    { className: 'row row-gap' },
                    el('input', { name: 'sets', type: 'number', min: '1', value: target.sets }),
                    el('input', { name: 'reps', type: 'number', min: '1', value: target.reps })
                ),
                el(
                    'div',
                    { className: 'row row-gap' },
                    el('input', { name: 'weight', type: 'number', min: '0', value: target.weight || 0 }),
                    el(
                        'select',
                        { name: 'unit' },
                        el('option', { value: 'kg', selected: target.unit === 'kg' }, 'kg'),
                        el('option', { value: 'lb', selected: target.unit === 'lb' }, 'lb')
                    )
                )
            ),
            onSubmit: (form) => {
                const name = form.querySelector('[name="exerciseName"]')?.value.trim() || '';
                const sets = Number(form.querySelector('[name="sets"]')?.value || 0);
                const reps = Number(form.querySelector('[name="reps"]')?.value || 0);
                const weight = Number(form.querySelector('[name="weight"]')?.value || 0);
                const unit = form.querySelector('[name="unit"]')?.value || target.unit;
                if (!name || Number.isNaN(sets) || Number.isNaN(reps) || sets <= 0 || reps <= 0) return false;
                updateUserDb(store, (nextDb) => {
                    const nextEntry = nextDb.workout[dateKey] || { logs: [] };
                    const nextTarget = nextEntry.logs.find((log) => log.id === id);
                    if (!nextTarget) return;
                    nextTarget.name = name;
                    nextTarget.sets = sets;
                    nextTarget.reps = reps;
                    nextTarget.weight = Number.isNaN(weight) ? 0 : weight;
                    nextTarget.unit = unit;
                    nextDb.workout[dateKey] = nextEntry;
                    nextDb.updatedAt = new Date().toISOString();
                });
                return true;
            }
        });
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
        entry.logs = entry.logs.concat({
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            name,
            sets,
            reps,
            weight: Number.isNaN(weight) ? 0 : weight,
            unit
        });
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

    const nextSettings = {
        ...store.getState().settings,
        dateFormat,
        dateSync,
        units: {
            ...store.getState().settings.units,
            weight: weightUnit,
            water: waterUnit
        }
    };

    store.dispatch({ type: 'UPDATE_SETTINGS', payload: nextSettings });
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
    document.addEventListener('change', (event) => handleActionChange(store, event));
    document.addEventListener('change', (event) => handleActionChange(store, event));
    store.subscribe(() => render(store));
    render(store);
};
