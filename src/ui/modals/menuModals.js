import { el } from '../../utils/dom.js';
import { closeModal, openModal } from '../components/Modal.js';
import {
    openExerciseSearchModal,
    openWorkoutAddModal,
    openWorkoutRoutineModal
} from './workoutModals.js';

export const openWorkoutAddMenuModal = (store) => {
    const body = el(
        'div',
        { className: 'stack-form' },
        el('button', { type: 'button', className: 'btn', dataset: { action: 'workout.search' } }, '운동 검색'),
        el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'workout.add' } }, '직접 입력'),
        el('button', { type: 'button', className: 'btn btn-secondary', dataset: { action: 'workout.routine' } }, '루틴 가져오기')
    );

    body.addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-action]');
        if (!actionEl) return;
        const action = actionEl.dataset.action;
        if (action === 'workout.add') {
            closeModal();
            openWorkoutAddModal(store);
        }
        if (action === 'workout.search') {
            closeModal();
            openExerciseSearchModal(store);
        }
        if (action === 'workout.routine') {
            closeModal();
            openWorkoutRoutineModal(store);
        }
    });

    openModal({
        title: '추가',
        body,
        submitLabel: '닫기',
        onSubmit: () => true
    });
};
