import { addGoalTimelineEntry, setGoalOverride } from '../../services/goals/goalService.js';
import { computeBaseTargets } from '../../services/nutrition/targetEngine.js';
import { DEFAULT_ENERGY_MODEL } from '../../services/nutritionPolicies.js';
import { calcAge, todayIso } from '../../utils/date.js';
import { selectGoalForDate } from '../../selectors/goalSelectors.js';
import { el } from '../../utils/dom.js';
import { openModal } from '../components/Modal.js';
import { updateUserDb } from '../store/userDb.js';
import { buildGoalModeSpec } from '../goals/goalUtils.js';
import { FRAMEWORK_OPTIONS, GOAL_OPTIONS, buildOptionSelect } from '../goals/goalOptions.js';

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
            buildOptionSelect({ name: 'goalMode', options: GOAL_OPTIONS, selected: settings.nutrition.goal })
        ),
        el(
            'label',
            { className: 'input-label' },
            '프레임워크',
            buildOptionSelect({ name: 'framework', options: FRAMEWORK_OPTIONS, selected: settings.nutrition.framework })
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
                settings: { energyModel: DEFAULT_ENERGY_MODEL }
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
