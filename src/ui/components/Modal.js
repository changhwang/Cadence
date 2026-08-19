import { el } from '../../utils/dom.js';

let activeOverlay = null;
let activeOnClose = null;

// onClose는 닫힘 경로(제출/취소/오버레이 클릭/X/다른 모달로 교체)와 무관하게 항상 1회 실행된다.
export const closeModal = () => {
    const onClose = activeOnClose;
    activeOnClose = null;
    if (activeOverlay) {
        activeOverlay.remove();
        activeOverlay = null;
    }
    if (typeof onClose === 'function') {
        onClose();
    }
};

export const openModal = ({
    title,
    body,
    onSubmit,
    submitLabel = '저장',
    dangerLabel,
    onDanger,
    onCancel,
    onClose,
    showClose = false
}) => {
    closeModal();
    activeOnClose = onClose;

    const overlay = el('div', { className: 'modal-overlay open center' });
    const content = el('div', { className: 'modal-content' });
    const headerTitle = el('h2', {}, title);
    const header = showClose
        ? el(
            'div',
            { className: 'modal-header-row' },
            headerTitle,
            el('button', { type: 'button', className: 'modal-close', dataset: { action: 'modal.close' } }, '×')
        )
        : headerTitle;
    const form = el('form', { className: 'stack-form' });

    if (body) {
        form.appendChild(body);
    }

    // 정보 표시용 모달(showClose=true이고 onSubmit 없음)에서는 액션 버튼 숨김
    const isInfoOnly = showClose && typeof onSubmit !== 'function';
    
    const actions = el('div', { className: 'modal-actions' });
    if (!isInfoOnly) {
        const cancelButton = el('button', { type: 'button', className: 'btn btn-text' }, '취소');
        actions.appendChild(cancelButton);
        if (dangerLabel && typeof onDanger === 'function') {
            const dangerButton = el('button', { type: 'button', className: 'btn btn-text btn-danger-text' }, dangerLabel);
            dangerButton.addEventListener('click', () => {
                const result = onDanger();
                if (result === false) return;
                closeModal();
            });
            actions.appendChild(dangerButton);
        }
        const submitClass = submitLabel.trim() === '닫기' ? 'btn btn-text' : 'btn';
        actions.appendChild(el('button', { type: 'submit', className: submitClass }, submitLabel));

        cancelButton.addEventListener('click', () => {
            closeModal();
            if (typeof onCancel === 'function') {
                onCancel();
            }
        });
    }

    if (showClose) {
        const closeButton = header.querySelector('[data-action="modal.close"]');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeModal();
                if (typeof onCancel === 'function') {
                    onCancel();
                }
            });
        }
    }

    if (!isInfoOnly) {
        form.appendChild(actions);
    }
    content.appendChild(header);
    content.appendChild(form);
    overlay.appendChild(content);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeModal();
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    });

    if (!isInfoOnly) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (typeof onSubmit === 'function') {
                const shouldClose = onSubmit(form);
                if (shouldClose === false) return;
            }
            closeModal();
        });
    }

    document.body.appendChild(overlay);
    activeOverlay = overlay;
};
