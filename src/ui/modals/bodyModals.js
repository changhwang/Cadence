import { el } from '../../utils/dom.js';
import { openModal } from '../components/Modal.js';
import { updateUserDb } from '../store/userDb.js';
import { fromDisplayHeight, fromDisplayWeight } from '../../utils/units.js';

export const openBodyLogModal = (store) => {
    const { userdb, settings } = store.getState();
    const dateKey = userdb.meta.selectedDate.body;
    const dateInput = el('input', { name: 'dateISO', type: 'date', value: dateKey });
    const entry = userdb.body?.[dateKey] || {};
    const weightInput = el('input', { name: 'weight', type: 'number', min: '0', step: '0.1', value: entry.weight || '' });
    const waistInput = el('input', { name: 'waist', type: 'number', min: '0', step: '0.1', value: entry.waist || '' });
    const muscleInput = el('input', { name: 'muscle', type: 'number', min: '0', step: '0.1', value: entry.muscle || '' });
    const fatInput = el('input', { name: 'fat', type: 'number', min: '0', step: '0.1', value: entry.fat || '' });
    const body = el(
        'div',
        { className: 'stack-form' },
        el('label', { className: 'input-label' }, '날짜', dateInput),
        el('label', { className: 'input-label' }, `체중 (${settings.units.weight})`, weightInput),
        el('label', { className: 'input-label' }, `허리둘레 (${settings.units.height})`, waistInput),
        el('label', { className: 'input-label' }, `골격근량 (${settings.units.weight})`, muscleInput),
        el('label', { className: 'input-label' }, '체지방률 (%)', fatInput)
    );
    openModal({
        title: '신체 기록',
        body,
        submitLabel: '저장',
        onSubmit: (form) => {
            const dateISO = form.querySelector('[name="dateISO"]')?.value || dateKey;
            const weightRaw = form.querySelector('[name="weight"]')?.value || '';
            const waistRaw = form.querySelector('[name="waist"]')?.value || '';
            const muscleRaw = form.querySelector('[name="muscle"]')?.value || '';
            const fatRaw = form.querySelector('[name="fat"]')?.value || '';
            const weight = weightRaw === ''
                ? ''
                : fromDisplayWeight(Number(weightRaw || 0), settings.units.weight || 'kg');
            const waist = waistRaw === ''
                ? ''
                : fromDisplayHeight(Number(waistRaw || 0), settings.units.height || 'cm');
            const muscle = muscleRaw === ''
                ? ''
                : fromDisplayWeight(Number(muscleRaw || 0), settings.units.weight || 'kg');
            const fat = fatRaw === '' ? '' : fatRaw;
            updateUserDb(store, (nextDb) => {
                nextDb.body[dateISO] = {
                    weight,
                    waist,
                    muscle,
                    fat
                };
                nextDb.meta.selectedDate.body = dateISO;
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        }
    });
};
