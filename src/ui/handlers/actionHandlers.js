import { buildExportPayload, downloadJson } from '../../services/backupService.js';
import { clearGoalOverride } from '../../services/goals/goalService.js';
import { selectSelectedDate } from '../../selectors/goalSelectors.js';
import { parseDateInput, todayIso } from '../../utils/date.js';
import { shiftDate } from '../components/DateBar.js';
import { openGoalChangeDefaultModal, openGoalOverrideModal } from '../modals/goalModals.js';
import { updateUserDb } from '../store/userDb.js';
import { showStatusBanner } from '../components/StatusBanner.js';

export const handleBackupAction = (store, action) => {
    if (action !== 'backup.export') return false;
    const payload = buildExportPayload(store.getState());
    const filename = `cadence_backup_${new Date().toISOString().slice(0, 10)}.json`;
    downloadJson(payload, filename);
    showStatusBanner({ message: '백업 파일을 저장했습니다.', tone: 'success' });
    return true;
};

export const handleGoalAction = (store, actionEl, action) => {
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
            return true;
        }
        openGoalOverrideModal(store, { dateISO });
        return true;
    }
    if (action === 'goal.clear') {
        const state = store.getState();
        const dateISO = actionEl.dataset.date || selectSelectedDate(state, actionEl.dataset.domain);
        if (!dateISO) return true;
        if (!window.confirm('이 날짜의 오버라이드를 해제할까요?')) return true;
        updateUserDb(store, (nextDb) => {
            const { overrideByDate } = clearGoalOverride({ goals: nextDb.goals, dateISO });
            nextDb.goals.overrideByDate = overrideByDate;
            nextDb.updatedAt = new Date().toISOString();
        });
        return true;
    }
    if (action === 'goal.history.toggle') {
        const targetId = actionEl.dataset.target;
        if (!targetId) return true;
        const list = document.getElementById(targetId);
        if (!list) return true;
        const expanded = actionEl.dataset.expanded === 'true';
        const nextExpanded = !expanded;
        list.querySelectorAll('.list-item.is-hidden').forEach((item) => {
            item.classList.toggle('is-hidden', !nextExpanded);
        });
        actionEl.dataset.expanded = nextExpanded ? 'true' : 'false';
        actionEl.textContent = nextExpanded ? '접기' : '더보기';
        return true;
    }
    if (action === 'goal.changeDefault') {
        const state = store.getState();
        const dateISO = actionEl.dataset.date || selectSelectedDate(state, actionEl.dataset.domain) || todayIso();
        openGoalChangeDefaultModal(store, { dateISO });
        return true;
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
        return true;
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
        return true;
    }
    return false;
};

export const handleDateAction = (store, actionEl, action) => {
    if (action === 'date.shift') {
        const offset = Number(actionEl?.dataset?.offset || 0);
        if (!offset) return true;
        const { userdb, settings, ui } = store.getState();
        const nextDate = shiftDate(userdb.meta.selectedDate[ui.route], offset);
        updateUserDb(store, (nextDb) => {
            if (settings.dateSync) {
                nextDb.meta.selectedDate.dashboard = nextDate;
                nextDb.meta.selectedDate.workout = nextDate;
                nextDb.meta.selectedDate.diet = nextDate;
                nextDb.meta.selectedDate.body = nextDate;
            } else {
                nextDb.meta.selectedDate[ui.route] = nextDate;
            }
            nextDb.updatedAt = new Date().toISOString();
        });
        return true;
    }
    if (action === 'date.today') {
        const { settings, ui } = store.getState();
        const nextDate = todayIso();
        updateUserDb(store, (nextDb) => {
            if (settings.dateSync) {
                nextDb.meta.selectedDate.dashboard = nextDate;
                nextDb.meta.selectedDate.workout = nextDate;
                nextDb.meta.selectedDate.diet = nextDate;
                nextDb.meta.selectedDate.body = nextDate;
            } else {
                nextDb.meta.selectedDate[ui.route] = nextDate;
            }
            nextDb.updatedAt = new Date().toISOString();
        });
        return true;
    }
    return false;
};
