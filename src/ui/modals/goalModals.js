import { addGoalTimelineEntry, setGoalOverride } from '../../services/goals/goalService.js';
import { computeBaseTargets } from '../../services/nutrition/targetEngine.js';
import { calcAge, todayIso } from '../../utils/date.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';
import { el } from '../../utils/dom.js';
import { openModal } from '../components/Modal.js';
import { updateUserDb } from '../store/userDb.js';
import { buildGoalModeSpec } from '../goals/goalUtils.js';

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
                nextDb.updatedAt = new Date().toISOString();
            });
            return true;
        },
        submitLabel: '저장'
    });
};

export const openGoalChangeDefaultModal = (store, { dateISO }) => {
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
