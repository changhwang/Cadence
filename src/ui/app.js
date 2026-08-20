import { renderTabBar } from './components/TabBar.js';
import { renderSaveBanner } from './components/StatusBanner.js';
import { renderView } from './views/index.js';
import { handleBackupAction, handleDateAction, handleGoalAction } from './handlers/actionHandlers.js';
import { handleDietClickAction, handleRouteAction, handleWorkoutClickAction } from './handlers/clickHandlers.js';
import { handleBackupImportChange, handleSettingsSubmit } from './handlers/formHandlers.js';

 

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

let lastRenderedRoute = null;

const render = (store) => {
    const state = store.getState();
    renderSaveBanner(store);
    renderTabBar({ route: state.ui.route });
    renderView({ route: state.ui.route, store });

    // #main-content가 스크롤 컨테이너라 화면을 바꿔도 이전 스크롤 위치가 남는다.
    // 화면이 실제로 바뀔 때만 맨 위로 올린다(같은 화면 내 갱신은 위치 유지).
    if (state.ui.route !== lastRenderedRoute) {
        lastRenderedRoute = state.ui.route;
        document.getElementById('main-content')?.scrollTo({ top: 0 });
    }
};

export const initApp = (store) => {
    document.addEventListener('click', (event) => handleActionClick(store, event));
    document.addEventListener('submit', (event) => {
        const form = event.target.closest('[data-action]');
        if (form?.dataset.action === 'settings.save') {
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
        const actionEl = event.target.closest('[data-action]');
        if (actionEl?.dataset.action === 'backup.import') {
            handleBackupImportChange(store, actionEl);
        }
    });
    // 저장 결과 알림은 배너만 갱신한다(뷰를 다시 그리면 입력 중이던 폼이 날아간다).
    store.subscribe((state, action) => {
        if (action?.type === 'SAVE_OK' || action?.type === 'SAVE_FAILED') {
            renderSaveBanner(store);
            return;
        }
        render(store);
    });
    render(store);
};





