import { setGoalOverride } from '../../services/goals/goalService.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';
import { el } from '../../utils/dom.js';
import { openModal } from '../components/Modal.js';
import { updateUserDb } from '../store/userDb.js';

export const openGoalOverrideModal = (store, { dateISO }) => {
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
            });
            return true;
        },
        submitLabel: '저장'
    });
};
