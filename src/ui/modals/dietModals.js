import { el } from '../../utils/dom.js';
import { closeModal, openModal } from '../components/Modal.js';
import { updateUserDb } from '../store/userDb.js';
import { openFoodSearchModal } from './foodModals.js';
import { FOOD_DB } from '../../data/foods.js';
import { coerceTimeHHMM, timeHHMMFromDate, combineDateAndTime } from '../../utils/time.js';
import { fromDisplayFoodAmount, ozToG, roundWeight, toDisplayFoodAmount } from '../../utils/units.js';

const formatAmount = (meal, foodUnit = 'g') => {
    if (!meal?.amount) return '';
    if (meal.amountUnit === 'serving') return `${meal.amount}서빙`;
    const amountG = meal.amountUnit === 'oz' ? ozToG(meal.amount) : Number(meal.amount || 0);
    const display = toDisplayFoodAmount(amountG, foodUnit);
    const rounded = roundWeight(display, foodUnit === 'oz' ? 1 : 0);
    return `${rounded}${foodUnit}`;
};

const getNowHHMM = () => timeHHMMFromDate(Date.now()) || '12:00';

export const openWaterLogModal = (store, options = {}) => {
    const { settings } = store.getState();
    const unit = settings.units?.water || 'ml';
    const isOz = unit === 'oz';
    const quickValues = isOz ? [8, 16] : [250, 500];
    const initialAmount = options.log ? (isOz ? Math.round(Number(options.log.amountMl || 0) / 29.5735) : Number(options.log.amountMl || 0)) : quickValues[0];
    const amountInput = el('input', {
        type: 'number',
        min: '0',
        value: initialAmount,
        placeholder: `직접 입력 (${unit})`
    });
    const timeInput = el('input', {
        type: 'time',
        name: 'timeHHMM',
        value: coerceTimeHHMM(options.log?.timeHHMM || timeHHMMFromDate(options.log?.createdAt) || getNowHHMM())
    });
    const quickRow = el(
        'div',
        { className: 'row row-gap' },
        ...quickValues.map((value) =>
            el(
                'button',
                { type: 'button', className: 'btn btn-secondary btn-sm', dataset: { action: 'water.quick', value: String(value) } },
                `+${value} ${unit}`
            )
        )
    );
    const body = el(
        'div',
        { className: 'stack-form' },
        el('label', { className: 'input-label' }, '시간', timeInput),
        quickRow,
        el('label', { className: 'input-label' }, `직접 입력 (${unit})`, amountInput)
    );
    body.addEventListener('click', (event) => {
        const quick = event.target.closest('[data-action="water.quick"]');
        if (!quick) return;
        amountInput.value = quick.dataset.value || '';
    });

    openModal({
        title: options.log ? '수분 수정' : '수분 섭취 기록',
        body,
        submitLabel: options.log ? '저장' : '기록하기',
        onSubmit: () => {
            const raw = Number(amountInput.value || 0);
            if (!raw || Number.isNaN(raw) || raw <= 0) return false;
            const ml = isOz ? Math.round(raw * 29.5735) : raw;
            updateUserDb(store, (nextDb) => {
                const dateKey = nextDb.meta.selectedDate.diet;
                const entry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                entry.logs = Array.isArray(entry.logs) ? entry.logs : [];
                const timeHHMM = coerceTimeHHMM(timeInput.value || '');
                const createdAt = combineDateAndTime(dateKey, timeHHMM) || new Date().toISOString();
                if (options.log) {
                    const target = entry.logs.find((log) => log.id === options.log.id);
                    if (target) {
                        target.amountMl = ml;
                        target.timeHHMM = timeHHMM;
                        target.createdAt = createdAt;
                    }
                } else {
                    const logId = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
                    entry.logs.push({ id: logId, kind: 'water', amountMl: ml, createdAt, timeHHMM });
                }
                entry.waterMl = entry.logs.reduce(
                    (sum, log) => sum + (log.kind === 'water' ? Number(log.amountMl || 0) : 0),
                    0
                );
                nextDb.diet[dateKey] = entry;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        },
        dangerLabel: options.log ? '삭제' : undefined,
        onDanger: options.log
            ? () => {
                if (!window.confirm('이 수분 기록을 삭제할까요?')) return false;
                updateUserDb(store, (nextDb) => {
                    const dateKey = nextDb.meta.selectedDate.diet;
                    const entry = nextDb.diet[dateKey] || { meals: [], waterMl: 0 };
                    entry.logs = Array.isArray(entry.logs) ? entry.logs : [];
                    entry.logs = entry.logs.filter((log) => log.id !== options.log.id);
                    entry.waterMl = entry.logs.reduce(
                        (sum, log) => sum + (log.kind === 'water' ? Number(log.amountMl || 0) : 0),
                        0
                    );
                    nextDb.diet[dateKey] = entry;
                    nextDb.updatedAt = new Date().toISOString();
                });
            }
            : undefined
    });
};

export const openDietAddMenuModal = (store) => {
    const body = el(
        'div',
        { className: 'stack-form' },
        el('button', { type: 'button', className: 'btn', dataset: { action: 'diet.add.meal' } }, '식사 추가'),
        el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'diet.add.snack' } }, '간식 추가'),
        el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'diet.add.water' } }, '물 기록')
    );
    body.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        if (actionEl.dataset.action === 'diet.add.meal') {
            closeModal();
            setTimeout(() => openMealBatchModal(store, '식사'), 0);
            return;
        }
        if (actionEl.dataset.action === 'diet.add.snack') {
            closeModal();
            setTimeout(() => openMealBatchModal(store, '간식'), 0);
            return;
        }
        if (actionEl.dataset.action === 'diet.add.water') {
            closeModal();
            openWaterLogModal(store);
        }
    });

    openModal({
        title: '추가',
        body,
        submitLabel: '닫기',
        onSubmit: () => true
    });
};

const buildMealPayload = ({ food, type, name, amount, amountUnit, overrides = {}, servingSize }) => {
    const per = food?.nutrition || {};
    const amountG = amountUnit === 'oz' ? ozToG(amount) : amount;
    const multiplier = amountUnit === 'g' || amountUnit === 'oz' ? amountG / servingSize : amount;
    const scaledBase = {
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
    return {
        type,
        name,
        foodId: food?.id || '',
        serving: food?.serving,
        nutrition: food?.nutrition,
        amount: amountUnit === 'oz' ? amountG : amount,
        amountUnit: amountUnit === 'oz' ? 'g' : amountUnit,
        ...scaledBase,
        kcal: overrides.kcal ?? scaledBase.kcal,
        proteinG: overrides.proteinG ?? scaledBase.proteinG,
        carbG: overrides.carbG ?? scaledBase.carbG,
        fatG: overrides.fatG ?? scaledBase.fatG
    };
};

export const openDietAddDetailModal = (store, selection, options = {}) => {
    if (!selection) return;
    const foodUnit = store.getState().settings.units?.food || 'g';
    const { food, type, amount, unit, scaled, label } = selection;
    const servingSize = food?.serving?.size || 1;
    const displayAmount = unit === 'serving'
        ? amount ?? 1
        : roundWeight(toDisplayFoodAmount(unit === 'oz' ? ozToG(amount) : amount, foodUnit), foodUnit === 'oz' ? 1 : 0);
    const nameInput = el('input', { name: 'mealName', type: 'text', value: label || '' });
    const typeSelect = el(
        'select',
        { name: 'mealType' },
        el('option', { value: '식사', selected: type === '식사' }, '식사'),
        el('option', { value: '간식', selected: type === '간식' }, '간식')
    );
    const amountInput = el('input', { name: 'amount', type: 'number', min: '0', value: displayAmount });
    const timeInput = el('input', {
        name: 'timeHHMM',
        type: 'time',
        value: coerceTimeHHMM(options.timeHHMM || timeHHMMFromDate(options.createdAt) || getNowHHMM())
    });
    const amountUnit = el(
        'select',
        { name: 'amountUnit' },
        el('option', { value: 'serving', selected: unit === 'serving' }, '서빙'),
        el(
            'option',
            { value: foodUnit, selected: unit !== 'serving' },
            foodUnit === 'oz' ? '온스(oz)' : '그램(g)'
        )
    );
    const kcalInput = el('input', { name: 'kcal', type: 'number', min: '0', value: Math.round(scaled?.kcal || 0) });
    const proteinInput = el('input', { name: 'proteinG', type: 'number', min: '0', value: Math.round(scaled?.proteinG || 0) });
    const carbInput = el('input', { name: 'carbG', type: 'number', min: '0', value: Math.round(scaled?.carbG || 0) });
    const fatInput = el('input', { name: 'fatG', type: 'number', min: '0', value: Math.round(scaled?.fatG || 0) });

    const syncDefaults = (amountVal, unitVal) => {
        const normalized = unitVal === 'serving'
            ? { amount: amountVal, amountUnit: 'serving' }
            : { amount: fromDisplayFoodAmount(amountVal, unitVal), amountUnit: 'g' };
        const mealPayload = buildMealPayload({
            food,
            type: typeSelect.value || type || '식사',
            name: nameInput.value || label || '',
            amount: normalized.amount,
            amountUnit: normalized.amountUnit,
            servingSize
        });
        kcalInput.value = Math.round(mealPayload.kcal || 0);
        proteinInput.value = Math.round(mealPayload.proteinG || 0);
        carbInput.value = Math.round(mealPayload.carbG || 0);
        fatInput.value = Math.round(mealPayload.fatG || 0);
    };

    amountUnit.addEventListener('change', () => {
        const nextUnit = amountUnit.value;
        if (nextUnit === 'serving') {
            amountInput.value = 1;
        } else {
            amountInput.value = roundWeight(
                toDisplayFoodAmount(servingSize, foodUnit),
                foodUnit === 'oz' ? 1 : 0
            );
        }
        syncDefaults(Number(amountInput.value || 0), nextUnit);
    });
    amountInput.addEventListener('input', () => {
        const amountVal = Number(amountInput.value || 0);
        if (Number.isNaN(amountVal)) return;
        syncDefaults(amountVal, amountUnit.value);
    });

    const body = el(
        'div',
        { className: 'stack-form' },
        el('label', { className: 'input-label' }, '이름', nameInput),
        el('label', { className: 'input-label' }, '구분', typeSelect),
        el('label', { className: 'input-label' }, '시간', timeInput),
        el(
            'div',
            { className: 'row row-gap' },
            el('label', { className: 'input-label' }, '수량', amountInput),
            el('label', { className: 'input-label' }, '단위', amountUnit)
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('label', { className: 'input-label' }, '칼로리', kcalInput),
            el('label', { className: 'input-label' }, '단백질', proteinInput)
        ),
        el(
            'div',
            { className: 'row row-gap' },
            el('label', { className: 'input-label' }, '탄수', carbInput),
            el('label', { className: 'input-label' }, '지방', fatInput)
        )
    );

    openModal({
        title: '식단 추가',
        body,
        submitLabel: '저장',
        onCancel: () => {
            if (typeof options.onCancel === 'function') {
                options.onCancel();
            }
        },
        onSubmit: (form) => {
            const name = form.querySelector('[name="mealName"]')?.value.trim() || '';
            const nextType = form.querySelector('[name="mealType"]')?.value || '식사';
            const amountRaw = Number(form.querySelector('[name="amount"]')?.value || 0);
            const amountUnitVal = form.querySelector('[name="amountUnit"]')?.value || 'serving';
            const timeHHMM = coerceTimeHHMM(form.querySelector('[name="timeHHMM"]')?.value || '');
            if (!name) return false;
            const nextAmount = Number.isNaN(amountRaw) ? 0 : Math.max(0, amountRaw);
            const normalized = amountUnitVal === 'serving'
                ? { amount: nextAmount, amountUnit: 'serving' }
                : { amount: fromDisplayFoodAmount(nextAmount, amountUnitVal), amountUnit: 'g' };
            const readNumber = (nameKey, fallback) => {
                const value = Number(form.querySelector(`[name="${nameKey}"]`)?.value || 0);
                return Number.isNaN(value) ? fallback : value;
            };
            const mealPayload = buildMealPayload({
                food,
                type: nextType,
                name,
                amount: normalized.amount,
                amountUnit: normalized.amountUnit,
                overrides: {
                    kcal: readNumber('kcal', undefined),
                    proteinG: readNumber('proteinG', undefined),
                    carbG: readNumber('carbG', undefined),
                    fatG: readNumber('fatG', undefined)
                },
                servingSize
            });
            if (typeof options.onSave === 'function') {
                closeModal();
                options.onSave({ ...mealPayload, timeHHMM });
                return false;
            }
            updateUserDb(store, (userdb) => {
                const dateKey = userdb.meta.selectedDate.diet;
                const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
                const logId = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
                const createdAt = combineDateAndTime(dateKey, timeHHMM) || new Date().toISOString();
                entry.meals = entry.meals.concat({ ...mealPayload, id: logId, createdAt, timeHHMM });
                entry.logs = Array.isArray(entry.logs) ? entry.logs : [];
                entry.logs.push({ ...mealPayload, id: logId, kind: 'meal', createdAt, timeHHMM });
                userdb.diet[dateKey] = entry;
                userdb.updatedAt = new Date().toISOString();
            });
            return true;
        }
    });
};

export const openMealBatchModal = (store, initialType = '식사', options = {}) => {
    const items = Array.isArray(options.items) ? options.items.map((item) => ({ ...item })) : [];
    const title = initialType === '간식' ? '간식 추가' : '식사 추가';
    const foodUnit = store.getState().settings.units?.food || 'g';
    let timeHHMM = coerceTimeHHMM(
        options.timeHHMM || timeHHMMFromDate(options.groupCreatedAt || options.createdAt) || getNowHHMM()
    );

    const openSelectModal = () => {
        openFoodSearchModal(store, {
            initialType,
            onSelect: (selection) =>
                openDietAddDetailModal(store, selection, {
                    timeHHMM,
                    onSave: (payload) => {
                        items.push(payload);
                        if (payload.timeHHMM) {
                            timeHHMM = coerceTimeHHMM(payload.timeHHMM);
                        }
                        render();
                    },
                    onCancel: () => {
                        openSelectModal();
                    }
                }),
            onCancel: () => {
                render();
            }
        });
    };

    const render = () => {
        const list = el('div', { className: 'list-group' });
        if (items.length === 0) {
            list.appendChild(el('p', { className: 'empty-state' }, '음식을 추가해 주세요.'));
        } else {
            items.forEach((item, index) => {
                const amountText = formatAmount(item, foodUnit);
                const kcalText = typeof item.kcal === 'number' ? `${Math.round(item.kcal)} kcal` : '';
                const meta = [amountText, kcalText].filter(Boolean).join(' · ');
                list.appendChild(
                    el(
                        'div',
                        { className: 'list-item', dataset: { action: 'meal.edit', index: String(index) } },
                        el(
                            'div',
                            {},
                            el('div', { className: 'list-title' }, item.name || '이름 없음'),
                            meta ? el('div', { className: 'list-subtitle' }, meta) : null
                        ),
                        el(
                            'div',
                            { className: 'list-actions' },
                            el('button', { type: 'button', className: 'btn btn-text btn-danger-text', dataset: { action: 'meal.remove', index: String(index) } }, '삭제')
                        )
                    )
                );
            });
        }
        const totalKcal = items.reduce((sum, item) => sum + Number(item.kcal || 0), 0);
        const timeInput = el('input', { type: 'time', name: 'timeHHMM', value: timeHHMM });
        timeInput.addEventListener('input', () => {
            timeHHMM = coerceTimeHHMM(timeInput.value || timeHHMM);
        });
        const addButton = el(
            'button',
            { type: 'button', className: 'btn btn-secondary', dataset: { action: 'meal.add' } },
            '음식 추가'
        );
        const footer = el('div', { className: 'row row-gap' }, el('div', { className: 'list-subtitle' }, `총 ${Math.round(totalKcal)} kcal`));
        const body = el(
            'div',
            { className: 'stack-form' },
            el('label', { className: 'input-label' }, '시간', timeInput),
            addButton,
            list,
            footer
        );
        body.addEventListener('click', (event) => {
            const actionEl = event.target.closest('[data-action]');
            if (!actionEl) return;
            if (actionEl.dataset.action === 'meal.add') {
                closeModal();
                openSelectModal();
                return;
            }
            if (actionEl.dataset.action === 'meal.remove') {
                const index = Number(actionEl.dataset.index);
                if (Number.isInteger(index)) {
                    items.splice(index, 1);
                    render();
                }
                return;
            }
            if (actionEl.dataset.action === 'meal.edit') {
                const index = Number(actionEl.dataset.index);
                if (!Number.isInteger(index)) return;
                const item = items[index];
                if (!item) return;
                const food = item.foodId ? FOOD_DB.find((entry) => entry.id === item.foodId) : null;
                const fallbackNutrition = item.nutrition || {
                    kcal: item.kcal || 0,
                    proteinG: item.proteinG || 0,
                    carbG: item.carbG || 0,
                    fatG: item.fatG || 0,
                    fiberG: item.fiberG || 0,
                    unsatFatG: item.unsatFatG || 0,
                    satFatG: item.satFatG || 0,
                    transFatG: item.transFatG || 0,
                    sugarG: item.sugarG || 0,
                    addedSugarG: item.addedSugarG || 0,
                    sodiumMg: item.sodiumMg || 0,
                    potassiumMg: item.potassiumMg || 0
                };
                const fallbackServing = item.serving || { size: 1, unit: 'g' };
                const selection = {
                    food: food || { id: item.foodId || '', nutrition: fallbackNutrition, serving: fallbackServing },
                    type: item.type || initialType,
                    amount: item.amount ?? 1,
                    unit: item.amountUnit || 'serving',
                    scaled: {
                        kcal: item.kcal || 0,
                        proteinG: item.proteinG || 0,
                        carbG: item.carbG || 0,
                        fatG: item.fatG || 0
                    },
                    label: item.name || ''
                };
                closeModal();
                openDietAddDetailModal(store, selection, {
                    timeHHMM,
                    createdAt: item.createdAt,
                    onSave: (payload) => {
                        items[index] = {
                            ...items[index],
                            ...payload
                        };
                        if (payload.timeHHMM) {
                            timeHHMM = coerceTimeHHMM(payload.timeHHMM);
                        }
                        render();
                    },
                    onCancel: () => {
                        render();
                    }
                });
            }
        });

        openModal({
            title,
            body,
            submitLabel: '저장',
            onSubmit: () => {
                if (items.length === 0) return false;
                updateUserDb(store, (userdb) => {
                    const dateKey = userdb.meta.selectedDate.diet;
                    const entry = userdb.diet[dateKey] || { meals: [], waterMl: 0 };
                    const groupId = options.groupId || `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
                    const groupCreatedAt = combineDateAndTime(dateKey, timeHHMM) || options.createdAt || new Date().toISOString();
                    if (options.groupId) {
                        entry.meals = entry.meals.filter((meal) => meal.groupId !== options.groupId);
                        if (Array.isArray(entry.logs)) {
                            entry.logs = entry.logs.filter((log) => log.groupId !== options.groupId);
                        }
                    } else if (options.groupCreatedAt) {
                        entry.meals = entry.meals.filter((meal) => meal.createdAt !== options.groupCreatedAt);
                        if (Array.isArray(entry.logs)) {
                            entry.logs = entry.logs.filter((log) => log.createdAt !== options.groupCreatedAt);
                        }
                    }
                    entry.logs = Array.isArray(entry.logs) ? entry.logs : [];
                    items.forEach((item) => {
                        const logId = `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
                        const createdAt = groupCreatedAt;
                        const payload = { ...item, id: logId, createdAt, groupId, groupCreatedAt, timeHHMM };
                        entry.meals = entry.meals.concat(payload);
                        entry.logs.push({ ...payload, kind: 'meal' });
                    });
                    userdb.diet[dateKey] = entry;
                    userdb.updatedAt = new Date().toISOString();
                });
                return true;
            }
        });
    };

    render();
};
