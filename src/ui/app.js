import { renderTabBar } from './components/TabBar.js';
import { renderView } from './views/index.js';
import { handleBackupAction, handleDateAction, handleGoalAction } from './handlers/actionHandlers.js';
import { handleDietClickAction, handleRouteAction, handleWorkoutClickAction } from './handlers/clickHandlers.js';
import {
    handleBackupImportChange,
    handleBodySubmit,
    handleDietAddSubmit,
    handleDietWaterChange,
    handleSettingsSubmit,
    handleWorkoutSubmit
} from './handlers/formHandlers.js';

 

const handleActionClick = (store, event) => {
    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    if (handleRouteAction(actionEl, action)) return;
    if (handleDietClickAction(store, actionEl, action)) return;
    if (handleWorkoutClickAction(store, actionEl, action)) return;
    if (handleGoalAction(store, actionEl, action)) return;
    if (handleDateAction(store, actionEl, action)) return;
    if (handleBackupAction(store, action)) return;
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
            handleDietAddSubmit(store, event, form);
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
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'diet.water') {
            handleDietWaterChange(store, actionEl);
            return;
        }
        if (action === 'backup.import') {
            handleBackupImportChange(store, actionEl);
        }
    });
    store.subscribe(() => render(store));
    render(store);
};





