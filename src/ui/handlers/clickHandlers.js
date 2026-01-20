import { openWorkoutDetailModal } from '../components/WorkoutDetailModal.js';
import { updateUserDb } from '../store/userDb.js';
import {
    openExerciseSearchModal,
    openRoutineCreateModal,
    openWorkoutAddModal,
    openWorkoutEditModal,
    openWorkoutRoutineModal
} from '../modals/workoutModals.js';
import { openDietEditModal, openFoodSearchModal } from '../modals/foodModals.js';
import { openWorkoutAddMenuModal } from '../modals/menuModals.js';

export const handleRouteAction = (actionEl, action) => {
    if (action !== 'route') return false;
    const route = actionEl.dataset.route;
    if (route) {
        window.location.hash = route;
    }
    return true;
};

export const handleDietClickAction = (store, actionEl, action) => {
    if (action === 'diet.edit') {
        openDietEditModal(store, { id: actionEl.dataset.id });
        return true;
    }
    if (action === 'diet.search') {
        openFoodSearchModal(store);
        return true;
    }
    return false;
};

export const handleWorkoutClickAction = (store, actionEl, action) => {
    if (action === 'workout.addMenu') {
        openWorkoutAddMenuModal(store);
        return true;
    }
    if (action === 'workout.manage.toggle') {
        store.dispatch({ type: 'TOGGLE_WORKOUT_MANAGE' });
        return true;
    }
    if (action === 'workout.delete.selected') {
        const checked = Array.from(document.querySelectorAll('[data-role="workout-select"]:checked'));
        const ids = checked.map((item) => item.dataset.id).filter(Boolean);
        if (ids.length === 0) {
            window.alert('삭제할 항목을 선택해 주세요.');
            return true;
        }
        if (!window.confirm('선택한 운동 기록을 삭제할까요?')) return true;
        updateUserDb(store, (nextDb) => {
            const dateKey = nextDb.meta.selectedDate.workout;
            const entry = nextDb.workout[dateKey] || { logs: [] };
            entry.logs = entry.logs.filter((log) => !ids.includes(log.id));
            nextDb.workout[dateKey] = entry;
            nextDb.updatedAt = new Date().toISOString();
        });
        return true;
    }
    if (action === 'workout.add') {
        openWorkoutAddModal(store);
        return true;
    }
    if (action === 'workout.search') {
        openExerciseSearchModal(store);
        return true;
    }
    if (action === 'workout.routine') {
        openWorkoutRoutineModal(store);
        return true;
    }
    if (action === 'routine.add') {
        openRoutineCreateModal(store);
        return true;
    }
    if (action === 'workout.edit') {
        const id = actionEl.dataset.id;
        if (!id) return true;
        const { userdb } = store.getState();
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        const target = entry.logs.find((log) => log.id === id);
        if (!target) return true;
        openWorkoutEditModal(store, { log: target, dateKey, id });
        return true;
    }
    if (action === 'workout.detail') {
        const id = actionEl.dataset.id;
        if (!id) return true;
        const { userdb } = store.getState();
        const dateKey = userdb.meta.selectedDate.workout;
        const entry = userdb.workout[dateKey] || { logs: [] };
        const target = entry.logs.find((log) => log.id === id);
        if (!target) return true;
        openWorkoutDetailModal(store, {
            log: target,
            dateISO: dateKey,
            onUpdate: ({ setsDetail, target: nextTarget }) => {
                updateUserDb(store, (nextDb) => {
                    const nextEntry = nextDb.workout[dateKey] || { logs: [] };
                    const nextLog = nextEntry.logs.find((log) => log.id === id);
                    if (!nextLog) return;
                    if (Array.isArray(setsDetail)) nextLog.setsDetail = setsDetail;
                    if (nextTarget) {
                        nextLog.target = {
                            sets: Number(nextTarget.sets || nextLog.sets || 1),
                            reps: Number(nextTarget.reps || nextLog.reps || 0),
                            restSec: Number(nextTarget.restSec || nextLog.target?.restSec || 60)
                        };
                    }
                    nextDb.workout[dateKey] = nextEntry;
                    nextDb.updatedAt = new Date().toISOString();
                });
            }
        });
        return true;
    }
    return false;
};
